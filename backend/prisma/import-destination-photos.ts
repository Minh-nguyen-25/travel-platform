import 'dotenv/config';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import prisma from '../src/config/db';
import { planDestinationPhotos } from '../src/utils/destination-photos';

async function main() {
  const document: unknown = JSON.parse(await readFile(resolve(process.cwd(), 'data/destination-photos.json'), 'utf8'));
  const records = await prisma.destination.findMany({ select: { id: true, name: true, images: true } });
  const plan = planDestinationPhotos(document, records);
  // Verify every file before writing, so an incomplete checkout cannot replace working images.
  for (const operation of plan.operations) {
    await access(resolve(process.cwd(), '../frontend/public', operation.imageUrl.slice(1)));
  }
  const apply = process.argv.includes('--apply');
  if (apply) {
    await prisma.$transaction(plan.operations.map(({ destinationId, imageId, ...data }) => imageId
      ? prisma.destinationImage.update({ where: { id: imageId }, data })
      : prisma.destinationImage.create({ data: { destinationId, ...data } })));
  }
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'preview', changed: plan.operations.length,
    operations: plan.operations, skipped: plan.skipped }, null, 2));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
