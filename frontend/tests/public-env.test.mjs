import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/utils/public-env.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const utility = {};
new Function('exports', compiled)(utility);

test('frontend build rejects secret-named VITE variables and credential-bearing URLs', () => {
  assert.doesNotThrow(() => utility.assertNoFrontendSecrets({ VITE_API_URL: 'https://api.example.test/api/v1' }));
  assert.doesNotThrow(() => utility.assertNoFrontendSecrets({ VITE_API_URL: '/api/v1' }));
  for (const env of [
    { VITE_JWT_SECRET: 'bad' },
    { VITE_OPENAI_API_KEY: 'bad' },
    { VITE_MAP_TILE_URL: 'https://maps.example.test/{z}/{x}/{y}.png?token=bad' },
    { VITE_API_URL: 'https://user:password@api.example.test/api/v1' },
  ]) {
    assert.throws(() => utility.assertNoFrontendSecrets(env));
  }
});
