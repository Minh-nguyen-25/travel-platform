import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import prisma from '../src/config/db';
import { planVerifiedCoordinates } from '../src/utils/verified-map-data';

export async function importVerifiedMapData(apply: boolean) {
  const document: unknown = JSON.parse(await readFile(resolve(process.cwd(), 'data/verified-destinations.json'), 'utf8'));
  const records = await prisma.destination.findMany({ select: {
    id: true, name: true, latitude: true, longitude: true, coordinateSourceUrl: true, coordinatesVerifiedAt: true,
  } });
  const plan = planVerifiedCoordinates(document, records);
  if (apply) {
    await prisma.$transaction(plan.updates.map(({ id, ...data }) => prisma.destination.update({ where: { id }, data })));
  }
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'preview', updated: plan.updates.length, skipped: plan.skipped,
    destinations: plan.updates.map(item => ({ id: item.id, latitude: item.latitude, longitude: item.longitude, source: item.coordinateSourceUrl })) }, null, 2));
}

if (require.main === module) {
  importVerifiedMapData(process.argv.includes('--apply'))
    .catch(error => { console.error(error.message); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
