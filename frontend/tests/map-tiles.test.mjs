import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/utils/map-tiles.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const utility = {};
new Function('exports', compiled)(utility);
const { initialTileState, tileStateReducer } = utility;

test('custom tile sources require valid templates and explicit attribution', () => {
  assert.equal(typeof utility.getMapTileConfig, 'function');
  const custom = utility.getMapTileConfig({
    VITE_MAP_TILE_URL: 'https://maps.example.test/{z}/{x}/{y}.png',
    VITE_MAP_TILE_ATTRIBUTION: 'Map provider',
  });
  assert.equal(custom.sources.osm.url, 'https://maps.example.test/{z}/{x}/{y}.png');
  assert.equal(custom.sources.osm.attribution, 'Map provider');
  for (const url of ['javascript:alert(1)', 'https://maps.example.test/{z}.png', 'https://user:secret@maps.example.test/{z}/{x}/{y}.png']) {
    assert.throws(() => utility.getMapTileConfig({ VITE_MAP_TILE_URL: url, VITE_MAP_TILE_ATTRIBUTION: 'Provider' }));
  }
  assert.throws(() => utility.getMapTileConfig({ VITE_MAP_TILE_URL: 'https://maps.example.test/{z}/{x}/{y}.png' }));
  assert.throws(() => utility.getMapTileConfig({ VITE_MAP_TILE_TIMEOUT_MS: '0' }));
});

test('unavailable primary tiles switch to the fallback automatically', () => {
  const next = tileStateReducer(initialTileState, { type: 'error', generation: 0 });
  assert.equal(next.source, 'osm-france');
  assert.equal(next.status, 'loading');
  assert.equal(next.generation, 1);
});

test('late events from the failed source do not corrupt the fallback', () => {
  const fallback = tileStateReducer(initialTileState, { type: 'error', generation: 0 });
  const ready = tileStateReducer(fallback, { type: 'ready', generation: 1 });
  for (const type of ['error', 'loading', 'ready']) {
    assert.deepEqual(tileStateReducer(ready, { type, generation: 0 }), ready);
  }
  assert.equal(ready.status, 'ready');
});

test('both sources failing ends in an error without an automatic retry loop', () => {
  const fallback = tileStateReducer(initialTileState, { type: 'error', generation: 0 });
  const error = tileStateReducer(fallback, { type: 'error', generation: 1 });
  assert.equal(error.source, 'osm-france');
  assert.equal(error.status, 'error');
  assert.equal(error.generation, 1);
  assert.deepEqual(tileStateReducer(error, { type: 'error', generation: 1 }), error);
});

test('a timeout switches the primary source and stops loading when the fallback also times out', () => {
  const fallback = tileStateReducer(initialTileState, { type: 'timeout', generation: 0 });
  assert.equal(fallback.source, 'osm-france');
  const error = tileStateReducer(fallback, { type: 'timeout', generation: 1 });
  assert.equal(error.status, 'error');
});

test('manual retry starts a new attempt and discards old tile events', () => {
  const error = { source: 'osm-france', status: 'error', generation: 1 };
  const retry = tileStateReducer(error, { type: 'retry' });
  assert.deepEqual(retry, { source: 'osm', status: 'loading', generation: 2 });
  assert.deepEqual(tileStateReducer(retry, { type: 'error', generation: 1 }), retry);
});

test('completion after a partial failure keeps a useful error notice', () => {
  const error = { source: 'osm-france', status: 'error', generation: 1 };
  assert.equal(tileStateReducer(error, { type: 'ready', generation: 1 }).status, 'error');
});
