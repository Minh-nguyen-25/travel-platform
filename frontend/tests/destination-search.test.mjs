import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Transpile the real utility so the tests also run on Node 20/22.
const source = readFileSync(new URL('../src/utils/destination-search.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const utility = {};
new Function('exports', compiled)(utility);
const { scheduleDestinationSearch, removeDestinationFilter } = utility;

test('typing requests only the latest trimmed keyword after the delay', async () => {
  const queries = [];
  const states = [];
  const request = async (query) => { queries.push(query); return ['Hội An']; };
  const cancel = scheduleDestinationSearch('Ho', request, (state) => states.push(state), 20);
  cancel();
  scheduleDestinationSearch('  Hội An  ', request, (state) => states.push(state), 20);
  assert.deepEqual(queries, []);
  await sleep(50);
  assert.deepEqual(queries, ['Hội An']);
  assert.deepEqual(states.at(-1), { status: 'success', query: 'Hội An', data: ['Hội An'] });
});

test('a cancelled slow response cannot overwrite the new suggestions', async () => {
  let finishOld;
  let oldSignal;
  const states = [];
  const cancel = scheduleDestinationSearch('Hà Nội', (_query, signal) => {
    oldSignal = signal;
    return new Promise((resolve) => { finishOld = resolve; });
  }, (state) => states.push(state), 0);
  await sleep(10);
  cancel();
  scheduleDestinationSearch('Đà Lạt', async () => ['Đà Lạt'], (state) => states.push(state), 0);
  await sleep(10);
  finishOld(['Hà Nội']);
  await sleep(10);
  assert.equal(oldSignal.aborted, true);
  assert.deepEqual(states.at(-1), { status: 'success', query: 'Đà Lạt', data: ['Đà Lạt'] });
});

test('short keywords make no requests and return idle state', async () => {
  let called = false;
  const states = [];
  scheduleDestinationSearch(' a ', async () => { called = true; return []; }, (state) => states.push(state), 0);
  await sleep(10);
  assert.equal(called, false);
  assert.deepEqual(states, [{ status: 'idle', query: 'a' }]);
});

test('request failure returns a recoverable error state', async () => {
  const states = [];
  scheduleDestinationSearch('Huế', async () => { throw new Error('offline'); }, (state) => states.push(state), 0);
  await sleep(10);
  assert.deepEqual(states.at(-1), { status: 'error', query: 'Huế' });
});

test('removing a category preserves keyword and other filters and resets pagination', () => {
  const original = new URLSearchParams('search=Huế&categoryIds=2,3&categoryMatch=all&minRating=4&page=3&sortBy=rating');
  const next = removeDestinationFilter(original, 'categoryIds', 2);
  assert.equal(next.get('categoryIds'), '3');
  assert.equal(next.has('categoryMatch'), false);
  assert.equal(next.has('page'), false);
  assert.equal(next.get('search'), 'Huế');
  assert.equal(next.get('minRating'), '4');
  assert.equal(next.get('sortBy'), 'rating');
  assert.equal(original.get('page'), '3');
});

test('legacy category selection is removable without leaving a hidden filter', () => {
  const next = removeDestinationFilter(new URLSearchParams('categoryId=2&categoryIds=3,4&categoryMatch=all'), 'categoryIds', 2);
  assert.equal(next.has('categoryId'), false);
  assert.equal(next.get('categoryIds'), '3,4');
  assert.equal(next.get('categoryMatch'), 'all');
});

test('removing the keyword keeps the applied price range', () => {
  const next = removeDestinationFilter(new URLSearchParams('search=Huế&minPrice=0&maxPrice=100000&page=2'), 'search');
  assert.equal(next.has('search'), false);
  assert.equal(next.get('minPrice'), '0');
  assert.equal(next.get('maxPrice'), '100000');
  assert.equal(next.has('page'), false);
});
