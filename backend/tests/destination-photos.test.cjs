'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

let utility = {};
try {
  utility = require('../dist/src/utils/destination-photos.js');
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}

const {
  planDestinationPhotos = () => { throw new Error('planDestinationPhotos not found'); },
  classifyUrl = () => { throw new Error('classifyUrl not found'); },
  NAME_ALIASES = {},
  legacySeedPhotos = new Set(),
  parseDestinationPhotos = () => { throw new Error('parseDestinationPhotos not found'); },
} = utility;

// ── Shared fixtures ────────────────────────────────────────────────────────────

const PLACEHOLDER = '/images/destinations/placeholder.svg';
const CLOUDINARY = 'https://res.cloudinary.com/example/image/upload/v1/photo.jpg';
const LEGACY_SEED = [...legacySeedPhotos][0] ?? 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80';
const LOCAL_PHOTO = '/images/destinations/ho-hoan-kiem.jpg';

const baseManifest = {
  retrievedAt: '2026-09-15T00:00:00.000Z',
  photos: [{
    slug: 'ho-hoan-kiem',
    name: 'Hồ Hoàn Kiếm',
    imageUrl: LOCAL_PHOTO,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Turtle_Tower.jpg',
    author: 'Photographer',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  }],
};

// ── Case B: placeholder → replace-placeholder ──────────────────────────────────
test('placeholder primary is replaced with local photo as primary (Case B)', () => {
  const plan = planDestinationPhotos(baseManifest, [{
    id: 1,
    name: 'Hồ Hoàn Kiếm',
    images: [{ id: 10, imageUrl: PLACEHOLDER, isPrimary: true, displayOrder: 0 }],
  }]);
  assert.equal(plan.operations.length, 1);
  const op = plan.operations[0];
  assert.equal(op.kind, 'replace-placeholder');
  assert.equal(op.imageId, 10);
  assert.equal(op.imageUrl, LOCAL_PHOTO);
  assert.equal(op.isPrimary, true);
  assert.equal(op.displayOrder, 0);
  assert.equal(plan.skipped.length, 0);
});

// ── Case C: legacy seed → replace-legacy-seed ─────────────────────────────────
test('legacy seed primary is replaced with local photo as primary (Case C)', () => {
  const plan = planDestinationPhotos(baseManifest, [{
    id: 1,
    name: 'Hồ Hoàn Kiếm',
    images: [{ id: 11, imageUrl: LEGACY_SEED, isPrimary: true, displayOrder: 0 }],
  }]);
  assert.equal(plan.operations.length, 1);
  const op = plan.operations[0];
  assert.equal(op.kind, 'replace-legacy-seed');
  assert.equal(op.imageId, 11);
  assert.equal(op.imageUrl, LOCAL_PHOTO);
  assert.equal(op.isPrimary, true);
});

// ── Case A: Cloudinary primary preserved ──────────────────────────────────────
test('Cloudinary primary is NOT modified; local photo added as secondary (Case A)', () => {
  const plan = planDestinationPhotos(baseManifest, [{
    id: 1,
    name: 'Hồ Hoàn Kiếm',
    images: [{ id: 5, imageUrl: CLOUDINARY, isPrimary: true, displayOrder: 0 }],
  }]);
  assert.equal(plan.operations.length, 1);
  const op = plan.operations[0];
  assert.equal(op.kind, 'add-secondary-beside-cloudinary');
  assert.equal(op.imageId, undefined, 'Must not set imageId (creates new row, does not update existing)');
  assert.equal(op.isPrimary, false, 'Cloudinary remains primary; new local is secondary');
  assert.equal(op.imageUrl, LOCAL_PHOTO);
  // Verify the Cloudinary record itself is not touched
  assert.ok(!plan.operations.some(o => o.imageUrl === CLOUDINARY), 'Cloudinary URL must not appear as a new imageUrl');
});

// ── Case E: local secondary not duplicated (idempotency) ──────────────────────
test('local secondary is NOT added again when already present (Case E - idempotency)', () => {
  const plan = planDestinationPhotos(baseManifest, [{
    id: 1,
    name: 'Hồ Hoàn Kiếm',
    images: [
      { id: 5, imageUrl: CLOUDINARY, isPrimary: true, displayOrder: 0 },
      { id: 6, imageUrl: LOCAL_PHOTO, isPrimary: false, displayOrder: 1 },
    ],
  }]);
  assert.equal(plan.operations.length, 0);
  const skipped = plan.skipped.find(s => s.name === 'Hồ Hoàn Kiếm');
  assert.ok(skipped, 'Should be in skipped list');
  assert.equal(skipped.reason, 'already-present');
});

// ── Case D: destination has no images → create primary ────────────────────────
test('destination with no images gets local photo as primary (Case D)', () => {
  const plan = planDestinationPhotos(baseManifest, [{
    id: 1, name: 'Hồ Hoàn Kiếm', images: [],
  }]);
  assert.equal(plan.operations.length, 1);
  const op = plan.operations[0];
  assert.equal(op.kind, 'create-primary');
  assert.equal(op.imageId, undefined);
  assert.equal(op.isPrimary, true);
  assert.equal(op.displayOrder, 0);
});

// ── Case F: unrecognised URL is protected ─────────────────────────────────────
test('unknown/other primary image is protected and not overwritten (Case F)', () => {
  const plan = planDestinationPhotos(baseManifest, [{
    id: 1,
    name: 'Hồ Hoàn Kiếm',
    images: [{ id: 9, imageUrl: '/images/vietnam-hero.jpg', isPrimary: true, displayOrder: 0 }],
  }]);
  assert.equal(plan.operations.length, 0);
  const skipped = plan.skipped.find(s => s.name === 'Hồ Hoàn Kiếm');
  assert.ok(skipped);
  assert.equal(skipped.reason, 'protected-existing-image');
});

// ── Alias: Văn Miếu (hyphen → en-dash) ───────────────────────────────────────
test('alias maps "Văn Miếu - Quốc Tử Giám" to DB name with en-dash', () => {
  const manifest = {
    retrievedAt: '2026-09-15T00:00:00.000Z',
    photos: [{
      slug: 'van-mieu',
      name: 'Văn Miếu - Quốc Tử Giám',   // JSON uses hyphen
      imageUrl: '/images/destinations/van-mieu.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Van_Mieu.jpg',
      author: 'Author',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    }],
  };
  const plan = planDestinationPhotos(manifest, [{
    id: 2,
    name: 'Văn Miếu – Quốc Tử Giám',    // DB uses en-dash
    images: [{ id: 20, imageUrl: PLACEHOLDER, isPrimary: true, displayOrder: 0 }],
  }]);
  assert.equal(plan.operations.length, 1, 'Alias should resolve to DB record');
  assert.equal(plan.operations[0].destinationId, 2);
  assert.equal(plan.operations[0].kind, 'replace-placeholder');
});

// ── Alias: Hội An → Phố cổ Hội An ────────────────────────────────────────────
test('alias maps "Hội An" to "Phố cổ Hội An" in DB', () => {
  const manifest = {
    retrievedAt: '2026-09-15T00:00:00.000Z',
    photos: [{
      slug: 'hoi-an',
      name: 'Hội An',
      imageUrl: '/images/destinations/hoi-an.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hoi_An.jpg',
      author: 'Author',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    }],
  };
  // Case F: "Phố cổ Hội An" in DB has a non-placeholder primary (hoi-an.webp)
  const plan = planDestinationPhotos(manifest, [{
    id: 24,
    name: 'Phố cổ Hội An',
    images: [{ id: 50, imageUrl: '/images/destinations/hoi-an.webp', isPrimary: true, displayOrder: 0 }],
  }]);
  // Existing primary is 'local-destination' (other .webp) → Case F → protected
  assert.equal(plan.operations.length, 0);
  const skipped = plan.skipped.find(s => s.name === 'Hội An');
  assert.ok(skipped, 'Should be in skipped list');
  assert.equal(skipped.reason, 'protected-existing-image');
});

// ── Ambiguous alias (Đà Lạt) is skipped ──────────────────────────────────────
test('ambiguous name without alias is skipped as not-in-database', () => {
  const manifest = {
    retrievedAt: '2026-09-15T00:00:00.000Z',
    photos: [{
      slug: 'da-lat',
      name: 'Đà Lạt',
      imageUrl: '/images/destinations/da-lat.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Da_Lat.jpg',
      author: 'Author',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    }],
  };
  // Simulate DB having two Đà Lạt entries (both valid) – no alias, so skip
  const plan = planDestinationPhotos(manifest, [
    { id: 34, name: 'Thành phố Đà Lạt', images: [] },
    { id: 35, name: 'Hồ Xuân Hương', images: [] },
  ]);
  assert.equal(plan.operations.length, 0);
  const skipped = plan.skipped.find(s => s.name === 'Đà Lạt');
  assert.ok(skipped);
  assert.equal(skipped.reason, 'not-in-database');
});

// ── Idempotency: plan applied twice → second plan is no-op ───────────────────
test('running plan on already-applied state produces no operations (idempotency)', () => {
  // First plan: placeholder → replace
  const plan1 = planDestinationPhotos(baseManifest, [{
    id: 1, name: 'Hồ Hoàn Kiếm',
    images: [{ id: 10, imageUrl: PLACEHOLDER, isPrimary: true, displayOrder: 0 }],
  }]);
  assert.equal(plan1.operations.length, 1);
  assert.equal(plan1.operations[0].kind, 'replace-placeholder');

  // Simulate state after applying plan1: placeholder replaced by LOCAL_PHOTO
  const plan2 = planDestinationPhotos(baseManifest, [{
    id: 1, name: 'Hồ Hoàn Kiếm',
    images: [{ id: 10, imageUrl: LOCAL_PHOTO, isPrimary: true, displayOrder: 0 }],
  }]);
  assert.equal(plan2.operations.length, 0, 'Second plan must be no-op');
  assert.equal(plan2.skipped[0]?.reason, 'already-present');
});

// ── Validation: reject bad manifests ─────────────────────────────────────────
test('photo manifests reject path traversal, uncredited sources and duplicate landmarks', () => {
  for (const photos of [
    [{ ...baseManifest.photos[0], imageUrl: '/images/destinations/../../secret.jpg' }],
    [{ ...baseManifest.photos[0], sourceUrl: 'https://example.test/random.jpg' }],
    [{ ...baseManifest.photos[0], author: '' }],
    [{ ...baseManifest.photos[0], license: 'All rights reserved' }],
    [baseManifest.photos[0], baseManifest.photos[0]],
  ]) {
    assert.throws(() => planDestinationPhotos({ ...baseManifest, photos }, []));
  }
});
