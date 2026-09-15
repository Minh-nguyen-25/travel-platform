import 'dotenv/config';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import prisma from '../src/config/db';
import { planDestinationPhotos } from '../src/utils/destination-photos';

async function main() {
  const apply = process.argv.includes('--apply');
  const document: unknown = JSON.parse(
    await readFile(resolve(process.cwd(), 'data/destination-photos.json'), 'utf8'),
  );

  const records = await prisma.destination.findMany({
    select: { id: true, name: true, images: true },
  });

  // ── Baseline counts (READ-ONLY, for idempotency verification) ──────────────
  const CLOUDINARY_PREFIX = 'https://res.cloudinary.com/';
  const PLACEHOLDER = '/images/destinations/placeholder.svg';
  const UNSPLASH_PREFIX = 'https://images.unsplash.com/';
  const allImages = records.flatMap(r => r.images);
  const baseline = {
    total: allImages.length,
    cloudinary: allImages.filter(i => i.imageUrl.startsWith(CLOUDINARY_PREFIX)).length,
    placeholder: allImages.filter(i => i.imageUrl === PLACEHOLDER).length,
    localDest: allImages.filter(i => i.imageUrl.startsWith('/images/destinations/') && i.imageUrl !== PLACEHOLDER).length,
    legacySeed: allImages.filter(i => i.imageUrl.startsWith(UNSPLASH_PREFIX)).length,
    other: allImages.filter(i =>
      !i.imageUrl.startsWith(CLOUDINARY_PREFIX)
      && i.imageUrl !== PLACEHOLDER
      && !i.imageUrl.startsWith('/images/destinations/')
      && !i.imageUrl.startsWith(UNSPLASH_PREFIX),
    ).length,
  };
  console.log('\n=== BASELINE (before dry-run) ===');
  console.log(JSON.stringify(baseline, null, 2));

  const plan = planDestinationPhotos(document, records);

  // Verify every planned local file exists before reporting (do not write yet).
  const missingFiles: string[] = [];
  for (const op of plan.operations) {
    const filePath = resolve(process.cwd(), '../frontend/public', op.imageUrl.slice(1));
    try {
      await access(filePath);
    } catch {
      missingFiles.push(op.imageUrl);
    }
  }
  if (missingFiles.length > 0) {
    console.error('\nERROR: Missing local image files:', missingFiles);
    process.exitCode = 1;
    return;
  }

  // ── Apply (transaction) ────────────────────────────────────────────────────
  if (apply) {
    await prisma.$transaction(
      plan.operations.map(({ destinationId, imageId, imageUrl, isPrimary, displayOrder }) =>
        imageId
          ? prisma.destinationImage.update({ where: { id: imageId }, data: { imageUrl, isPrimary, displayOrder } })
          : prisma.destinationImage.create({ data: { destinationId, imageUrl, isPrimary, displayOrder } }),
      ),
    );
    console.log('\n✅ Changes applied in transaction.');
  }

  // ── Detailed dry-run report ────────────────────────────────────────────────
  const byKind = plan.operations.reduce<Record<string, typeof plan.operations>>((acc, op) => {
    (acc[op.kind] ??= []).push(op);
    return acc;
  }, {});

  console.log('\n=== DRY-RUN PLAN ===');
  console.log(`Mode: ${apply ? 'APPLIED' : 'preview (no --apply)'}`);
  console.log(`Total operations: ${plan.operations.length}`);
  console.log(`Total skipped: ${plan.skipped.length}`);

  const kindOrder = [
    'replace-placeholder',
    'replace-legacy-seed',
    'create-primary',
    'add-secondary-beside-cloudinary',
    'already-present',
  ] as const;

  for (const kind of kindOrder) {
    const ops = byKind[kind] ?? [];
    if (ops.length === 0) continue;
    console.log(`\n── ${kind} (${ops.length}) ──`);
    for (const op of ops) {
      console.log(`  [dest:${op.destinationId}] ${op.destinationName}`);
      if (op.currentUrl) console.log(`    current : [${op.currentKind}] ${op.currentUrl}`);
      console.log(`    new     : ${op.imageUrl}`);
      console.log(`    primary : ${op.isPrimary}  order: ${op.displayOrder}${op.imageId ? `  imageId: ${op.imageId}` : ''}`);
      console.log(`    reason  : ${op.reason}`);
    }
  }

  const skipReasonOrder = [
    'already-present',
    'protected-existing-image',
    'not-in-database',
    'ambiguous-name',
  ] as const;

  const bySkipReason = plan.skipped.reduce<Record<string, typeof plan.skipped>>((acc, s) => {
    (acc[s.reason] ??= []).push(s);
    return acc;
  }, {});

  console.log('\n── Skipped ──');
  for (const reason of skipReasonOrder) {
    const entries = bySkipReason[reason] ?? [];
    if (entries.length === 0) continue;
    console.log(`  ${reason} (${entries.length}):`);
    for (const e of entries) {
      console.log(`    "${e.name}"${e.detail ? ' — ' + e.detail : ''}`);
    }
  }

  // ── Machine-readable summary ───────────────────────────────────────────────
  console.log('\n=== JSON SUMMARY ===');
  console.log(JSON.stringify({
    mode: apply ? 'applied' : 'preview',
    baseline,
    operations: plan.operations,
    skipped: plan.skipped,
  }, null, 2));
}

main()
  .catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
