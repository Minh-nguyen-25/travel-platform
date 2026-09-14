const test = require('node:test');
const assert = require('node:assert/strict');
let utility = {};
try { utility = require('../dist/src/utils/destination-photos.js'); } catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
const manifest = { retrievedAt: '2026-09-15T00:00:00.000Z', photos: [{
  slug: 'ho-hoan-kiem', name: 'Hồ Hoàn Kiếm', imageUrl: '/images/destinations/ho-hoan-kiem.jpg',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Turtle_Tower.jpg', author: 'Photographer',
  license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
}] };
const legacy = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80';

test('real landmark photos replace only a known generic seed image', () => {
  assert.equal(typeof utility.planDestinationPhotos, 'function');
  const plan = utility.planDestinationPhotos(manifest, [{ id: 2, name: 'Hồ Hoàn Kiếm',
    images: [{ id: 1, imageUrl: legacy, isPrimary: true, displayOrder: 0 }] }]);
  assert.deepEqual(plan.operations, [{ destinationId: 2, imageId: 1, imageUrl: '/images/destinations/ho-hoan-kiem.jpg', isPrimary: true, displayOrder: 0 }]);
});

test('existing uploaded photos are preserved and the real photo is added without taking their primary status', () => {
  assert.equal(typeof utility.planDestinationPhotos, 'function');
  const plan = utility.planDestinationPhotos(manifest, [{ id: 2, name: 'Hồ Hoàn Kiếm',
    images: [{ id: 8, imageUrl: 'https://res.cloudinary.com/account/photo.jpg', isPrimary: true, displayOrder: 3 }] }]);
  assert.deepEqual(plan.operations, [{ destinationId: 2, imageUrl: '/images/destinations/ho-hoan-kiem.jpg', isPrimary: false, displayOrder: 4 }]);
});

test('photo import is idempotent and skips ambiguous/missing landmark names', () => {
  assert.equal(typeof utility.planDestinationPhotos, 'function');
  for (const records of [[], [{ id: 2, name: 'Hồ Hoàn Kiếm', images: [{ id: 1, imageUrl: manifest.photos[0].imageUrl, isPrimary: true, displayOrder: 0 }] }],
    [{ id: 2, name: 'Hồ Hoàn Kiếm', images: [] }, { id: 3, name: 'Hồ Hoàn Kiếm', images: [] }]]) {
    assert.equal(utility.planDestinationPhotos(manifest, records).operations.length, 0);
  }
});

test('photo manifests reject path traversal, uncredited sources and duplicate landmarks', () => {
  assert.equal(typeof utility.planDestinationPhotos, 'function');
  for (const photos of [
    [{ ...manifest.photos[0], imageUrl: '/images/destinations/../../secret.jpg' }],
    [{ ...manifest.photos[0], sourceUrl: 'https://example.test/random.jpg' }],
    [{ ...manifest.photos[0], author: '' }],
    [{ ...manifest.photos[0], license: 'All rights reserved' }],
    [manifest.photos[0], manifest.photos[0]],
  ]) assert.throws(() => utility.planDestinationPhotos({ ...manifest, photos }, []));
});
