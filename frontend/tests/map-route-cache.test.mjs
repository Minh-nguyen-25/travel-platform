import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';

const path = new URL('../src/utils/map-route-cache.ts', import.meta.url);
const utility = {};
if (existsSync(path)) {
  const compiled = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('exports', compiled)(utility);
}
const route = {
  profile: 'driving', distanceMeters: 2345, distanceKm: 2.35, durationSeconds: 754, durationMinutes: 13,
  geometry: { type: 'LineString', coordinates: [[105.85, 21.02], [105.84, 21.03]] },
};
const memoryStorage = () => {
  const items = new Map();
  return { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
};

test('a remounted route uses a fresh saved result without another API request', async () => {
  assert.equal(typeof utility.loadMapRoute, 'function');
  const storage = memoryStorage();
  let calls = 0;
  const options = { key: 'route-a', storage, now: () => 1_000_000, fetchRoute: async () => { calls++; return route; } };
  await utility.loadMapRoute(options);
  const loaded = await utility.loadMapRoute(options);
  assert.equal(calls, 1);
  assert.equal(loaded.route.distanceMeters, 2345);
  assert.equal(loaded.warning, null);
});

test('an outage preserves the last real route and exposes its original timestamp', async () => {
  assert.equal(typeof utility.loadMapRoute, 'function');
  const storage = memoryStorage();
  await utility.loadMapRoute({ key: 'route-a', storage, now: () => 1_000_000, fetchRoute: async () => route });
  const loaded = await utility.loadMapRoute({ key: 'route-a', storage, now: () => 2_000_000, fetchRoute: async () => { throw new Error('offline'); } });
  assert.equal(loaded.route.distanceKm, 2.35);
  assert.ok(loaded.warning);
  assert.equal(loaded.route.cache.fetchedAt, new Date(1_000_000).toISOString());
});

test('different coordinates, expired data and authorization failures never reuse cached routes', async () => {
  assert.equal(typeof utility.loadMapRoute, 'function');
  const storage = memoryStorage();
  await utility.loadMapRoute({ key: 'route-a', storage, now: () => 1_000_000, fetchRoute: async () => route });
  for (const options of [
    { key: 'route-b', now: () => 2_000_000 },
    { key: 'route-a', now: () => 1_000_000 + 25 * 60 * 60_000 },
    { key: 'route-a', now: () => 2_000_000, fetchRoute: async () => { throw { response: { status: 401 } }; } },
  ]) {
    await assert.rejects(utility.loadMapRoute({ storage, fetchRoute: async () => { throw new Error('offline'); }, ...options }));
  }
});

test('storage failures do not break real route fetching and invalid geometry is rejected', async () => {
  assert.equal(typeof utility.loadMapRoute, 'function');
  const storage = { getItem: () => { throw new Error('disabled'); }, setItem: () => { throw new Error('quota'); } };
  const loaded = await utility.loadMapRoute({ key: 'route-a', storage, fetchRoute: async () => route });
  assert.equal(loaded.route.distanceMeters, 2345);
  await assert.rejects(utility.loadMapRoute({ key: 'route-b', storage, fetchRoute: async () => ({ ...route, geometry: { type: 'LineString', coordinates: [[200, 91], [105, 21]] } }) }));
});

test('an aborted request cannot populate the route cache', async () => {
  assert.equal(typeof utility.loadMapRoute, 'function');
  const controller = new AbortController();
  const storage = memoryStorage();
  await assert.rejects(utility.loadMapRoute({ key: 'route-a', storage, signal: controller.signal, fetchRoute: async () => { controller.abort(); return route; } }));
  await assert.rejects(utility.loadMapRoute({ key: 'route-a', storage, fetchRoute: async () => { throw new Error('offline'); } }));
});

test('an authoritative missing-route response removes saved geometry before a later outage', async () => {
  const storage = memoryStorage();
  await utility.loadMapRoute({ key: 'route-a', storage, now: () => 1_000_000, fetchRoute: async () => route });
  await assert.rejects(utility.loadMapRoute({ key: 'route-a', storage, now: () => 2_000_000,
    fetchRoute: async () => { throw { response: { status: 422 } }; } }));
  await assert.rejects(utility.loadMapRoute({ key: 'route-a', storage, now: () => 2_000_000,
    fetchRoute: async () => { throw new Error('offline'); } }));
});
