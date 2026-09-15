const test = require('node:test');
const assert = require('node:assert/strict');
let utility = {};
try { utility = require('../dist/src/utils/verified-map-data.js'); } catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
const sample = {
  fetchedAt: '2020-01-01T00:00:00.000Z',
  destinations: [{ name: 'Hồ Hoàn Kiếm', latitude: 21.0288889, longitude: 105.8525,
    sourceUrl: 'https://www.wikidata.org/w/index.php?title=Q1151254&oldid=123456' }],
};

test('verified map data preserves the source and updates only the matching nearby destination', () => {
  assert.equal(typeof utility.planVerifiedCoordinates, 'function');
  const plan = utility.planVerifiedCoordinates(sample, [
    { id: 2, name: 'Hồ Hoàn Kiếm', latitude: '21.0286669', longitude: '105.8521484' },
    { id: 3, name: 'Unrelated', latitude: '21', longitude: '105' },
  ], new Date('2026-09-15T12:00:00Z'));
  assert.equal(plan.updates.length, 1);
  assert.equal(plan.updates[0].id, 2);
  assert.equal(plan.updates[0].latitude, 21.0288889);
  assert.equal(plan.updates[0].coordinateSourceUrl, sample.destinations[0].sourceUrl);
});

test('ambiguous names, distant matches and missing destinations are skipped', () => {
  assert.equal(typeof utility.planVerifiedCoordinates, 'function');
  for (const records of [[], [
    { id: 1, name: 'Hồ Hoàn Kiếm', latitude: '21.02', longitude: '105.85' },
    { id: 2, name: 'Hồ Hoàn Kiếm', latitude: '21.02', longitude: '105.85' },
  ], [{ id: 1, name: 'Hồ Hoàn Kiếm', latitude: '10.77', longitude: '106.69' }]]) {
    const plan = utility.planVerifiedCoordinates(sample, records, new Date('2026-09-15T12:00:00Z'));
    assert.equal(plan.updates.length, 0);
    assert.equal(plan.skipped.length, 1);
  }
});

test('coordinate imports reject fake URLs, duplicate names, future dates and invalid coordinates', () => {
  assert.equal(typeof utility.planVerifiedCoordinates, 'function');
  for (const document of [
    { ...sample, fetchedAt: '2099-01-01T00:00:00Z' },
    { ...sample, destinations: [...sample.destinations, ...sample.destinations] },
    { ...sample, destinations: [{ ...sample.destinations[0], latitude: 0 }] },
    { ...sample, destinations: [{ ...sample.destinations[0], sourceUrl: 'https://example.test/fake' }] },
  ]) assert.throws(() => utility.planVerifiedCoordinates(document, []));
});

test('coordinate imports preserve a newer verification and do not rewrite identical data', () => {
  assert.equal(typeof utility.planVerifiedCoordinates, 'function');
  const record = { id: 2, name: 'Hồ Hoàn Kiếm', latitude: 21.0288889, longitude: 105.8525,
    coordinateSourceUrl: sample.destinations[0].sourceUrl, coordinatesVerifiedAt: new Date(sample.fetchedAt) };
  assert.equal(utility.planVerifiedCoordinates(sample, [record], new Date('2026-09-16T00:00:00Z')).updates.length, 0);
  assert.equal(utility.planVerifiedCoordinates(sample, [{ ...record, coordinatesVerifiedAt: new Date('2026-09-15T12:00:00Z') }], new Date('2026-09-16T00:00:00Z')).updates.length, 0);
});

test('editing an unrelated field or resubmitting the same coordinates preserves verification', () => {
  assert.equal(typeof utility.coordinateIdentityChanged, 'function');
  const existing = { name: 'Hồ Hoàn Kiếm', latitude: '21.0288889', longitude: '105.8525000' };
  assert.equal(utility.coordinateIdentityChanged({ name: existing.name, latitude: 21.0288889, longitude: 105.8525, ticketPrice: 50000 }, existing), false);
  assert.equal(utility.coordinateIdentityChanged({ latitude: 21.04 }, existing), true);
  assert.equal(utility.coordinateIdentityChanged({ name: 'Other place' }, existing), true);
});
