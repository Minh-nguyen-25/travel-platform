const test = require('node:test');
const assert = require('node:assert/strict');
const { OsrmMapService } = require('../dist/src/services/map.service.js');
const { createDestinationSchema } = require('../dist/src/validators/destination.validator.js');

const config = {
  baseUrl: 'https://osrm.example.test', timeoutMs: 1000, maxRetries: 0,
  apiKey: null, apiKeyQueryParam: 'api_key', userAgent: 'map-cache-test',
  profiles: { driving: 'driving', walking: 'walking', cycling: 'cycling' }, transitProfile: null,
};
const request = {
  coordinates: [{ latitude: 21.02, longitude: 105.85 }, { latitude: 21.03, longitude: 105.84 }],
  geometries: 'geojson', overview: 'full',
};
const response = () => new Response(JSON.stringify({ code: 'Ok', routes: [{
  distance: 2345, duration: 754, legs: [],
  geometry: { type: 'LineString', coordinates: [[105.85, 21.02], [105.84, 21.03]] },
}] }), { status: 200 });

test('repeated routes reuse the successful upstream result', async () => {
  let calls = 0;
  const service = new OsrmMapService(() => config, async () => { calls++; return response(); });
  const first = await service.calculateRoute(request);
  const second = await service.calculateRoute(request);
  assert.equal(calls, 1);
  assert.equal(second.distanceMeters, 2345);
  assert.equal(second.cache.status, 'hit');
  assert.equal(second.cache.fetchedAt, first.cache.fetchedAt);
});

test('concurrent identical routes share one upstream calculation', async () => {
  let calls = 0;
  const service = new OsrmMapService(() => config, async () => {
    calls++; await new Promise(resolve => setTimeout(resolve, 15)); return response();
  });
  const routes = await Promise.all([service.calculateRoute(request), service.calculateRoute(request)]);
  assert.equal(calls, 1);
  assert.equal(routes[0].distanceKm, 2.35);
  assert.equal(routes[1].distanceKm, 2.35);
});

test('route cache separates direction, profiles, options and upstream servers', async () => {
  let calls = 0;
  let currentConfig = config;
  const service = new OsrmMapService(() => currentConfig, async () => { calls++; return response(); });
  await service.calculateRoute(request);
  await service.calculateRoute({ ...request, coordinates: [...request.coordinates].reverse() });
  await service.calculateRoute({ ...request, profile: 'walking' });
  await service.calculateRoute({ ...request, steps: true });
  currentConfig = { ...config, baseUrl: 'https://other.example.test' };
  await service.calculateRoute(request);
  assert.equal(calls, 5);
});

test('expired routes fall back only on upstream outage and expire completely after the stale window', async () => {
  let now = 1_000_000;
  let offline = false;
  const service = new OsrmMapService(() => config, async () => {
    if (offline) throw new Error('offline');
    return response();
  }, () => now);
  const first = await service.calculateRoute(request);
  now += 16 * 60_000;
  offline = true;
  const stale = await service.calculateRoute(request);
  assert.equal(stale.cache.status, 'stale');
  assert.equal(stale.cache.fetchedAt, first.cache.fetchedAt);
  assert.equal(stale.distanceMeters, 2345);
  now += 25 * 60 * 60_000;
  await assert.rejects(service.calculateRoute(request), error => error.statusCode === 503);
});

test('invalid requests and NoRoute responses cannot reuse an old route', async () => {
  let now = 1_000_000;
  let noRoute = false;
  const service = new OsrmMapService(() => config, async () => noRoute
    ? new Response(JSON.stringify({ code: 'NoRoute' }), { status: 400 }) : response(), () => now);
  await service.calculateRoute(request);
  await assert.rejects(service.calculateRoute({ ...request, coordinates: [{ latitude: NaN, longitude: 0 }, request.coordinates[1]] }));
  now += 16 * 60_000;
  noRoute = true;
  await assert.rejects(service.calculateRoute(request), error => error.statusCode === 422);
});

test('destination writes reject empty, null, whitespace and boolean coordinates instead of converting them to zero', () => {
  const input = { name: 'Landmark', address: 'Hanoi', latitude: '21.02', longitude: '105.85', categoryIds: [1] };
  assert.equal(createDestinationSchema.safeParse(input).success, true);
  for (const field of ['latitude', 'longitude']) {
    for (const value of ['', '   ', null, true, false]) {
      assert.equal(createDestinationSchema.safeParse({ ...input, [field]: value }).success, false, `${field}: ${String(value)}`);
    }
  }
  assert.equal(createDestinationSchema.safeParse({ ...input, latitude: 0, longitude: 0 }).success, true);
});

test('a confirmed missing route invalidates saved geometry before a later outage', async () => {
  let now = 1_000_000;
  let state = 'online';
  const service = new OsrmMapService(() => config, async () => {
    if (state === 'no-route') return new Response(JSON.stringify({ code: 'NoRoute' }), { status: 400 });
    if (state === 'offline') throw new Error('offline');
    return response();
  }, () => now);
  await service.calculateRoute(request);
  now += 16 * 60_000;
  state = 'no-route';
  await assert.rejects(service.calculateRoute(request), error => error.statusCode === 422);
  state = 'offline';
  await assert.rejects(service.calculateRoute(request), error => error.statusCode === 503);
});
