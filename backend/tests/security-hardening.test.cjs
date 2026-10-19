const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { spawnSync } = require('node:child_process');
process.env.JWT_ACCESS_SECRET ||= 'security-test-access-secret';
process.env.JWT_REFRESH_SECRET ||= 'security-test-refresh-secret';
process.env.REDIS_URL ||= 'redis://127.0.0.1:6380';

const { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken } = require('../dist/src/utils/jwt.utils.js');
const { setRefreshTokenCookie } = require('../dist/src/utils/auth-cookie.utils.js');
const { detectImageType, uploadSingle, MAX_IMAGE_BYTES } = require('../dist/src/middlewares/upload.middleware.js');
const { loginLimiter } = require('../dist/src/middlewares/login-rate-limit.middleware.js');

test('refresh rotation preserves the absolute expiry', () => {
  const original = verifyRefreshToken(generateRefreshToken(7, 'old'));
  const rotated = verifyRefreshToken(generateRefreshToken(7, 'new', original.exp));
  assert.equal(rotated.exp, original.exp);
  assert.equal(rotated.sub, original.sub);
  assert.notEqual(rotated.jti, original.jti);
});

test('access token issued near session expiry cannot outlive the session', () => {
  const deadline = Math.floor(Date.now() / 1000) + 60;
  const token = generateAccessToken({ id: 7, email: 'test@example.com', role: 'USER' }, deadline);
  assert.equal(verifyAccessToken(token).exp, deadline);
});

test('invalid or non-positive token lifetimes fail configuration validation', () => {
  for (const value of ['30days', '-1d', '0']) {
    const result = spawnSync(process.execPath, ['-e', 'require("./dist/src/config/env.js")'], {
      cwd: __dirname + '/..',
      env: { ...process.env, JWT_REFRESH_EXPIRES_IN: value },
      encoding: 'utf8',
    });
    assert.equal(result.status, 1, `Expected ${value} to be rejected`);
  }
});

test('plain numeric JWT lifetimes are interpreted as seconds', () => {
  const script = 'const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require("./dist/src/utils/jwt.utils.js"); const a = verifyAccessToken(generateAccessToken({id: 1, email: "a@example.com", role: "USER"})); const r = verifyRefreshToken(generateRefreshToken(1, "jti")); process.stdout.write(JSON.stringify([a.exp-a.iat, r.exp-r.iat]));';
  const result = spawnSync(process.execPath, ['-e', script], {
    cwd: __dirname + '/..',
    env: { ...process.env, JWT_ACCESS_EXPIRES_IN: '60', JWT_REFRESH_EXPIRES_IN: '120' },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [60, 120]);
});

test('refresh cookie expires at the existing session deadline', () => {
  const expiresAt = new Date(Date.now() + 90_000);
  let options;
  setRefreshTokenCookie({ cookie: (_name, _value, opts) => { options = opts; } }, 'token', expiresAt);
  assert.ok(options.httpOnly);
  assert.ok(options.maxAge > 0 && options.maxAge <= 90_000);
});

test('uploaded image type is verified from bytes, not a claimed MIME', () => {
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
  assert.equal(detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
  assert.equal(detectImageType(Buffer.from('RIFF1234WEBP')), 'image/webp');
  assert.equal(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')), null);
});

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('login limits failed attempts independently to five per IP', async () => {
  const app = express();
  app.post('/login', loginLimiter, (_req, res) => res.sendStatus(401));
  await withServer(app, async (url) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await fetch(`${url}/login`, { method: 'POST' });
      assert.equal(response.status, 401);
    }
    const blocked = await fetch(`${url}/login`, { method: 'POST' });
    assert.equal(blocked.status, 429);
  });
});

test('upload rejects fake images and files over 5 MB', async () => {
  const app = express();
  app.post('/upload', uploadSingle, (_req, res) => res.sendStatus(204));
  app.use((err, _req, res, _next) => res.status(err.statusCode || 400).json({ error: err.code || err.message }));
  await withServer(app, async (url) => {
    const send = async (bytes, filename, type) => {
      const form = new FormData();
      form.append('image', new Blob([bytes], { type }), filename);
      return fetch(`${url}/upload`, { method: 'POST', body: form });
    };
    assert.equal((await send(Buffer.from('not a png'), 'photo.png', 'image/png')).status, 400);
    assert.equal((await send(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), 'photo.jpg', 'image/jpeg')).status, 204);
    const oversized = Buffer.alloc(MAX_IMAGE_BYTES + 1);
    oversized.set([0xff, 0xd8, 0xff, 0xe0]);
    assert.equal((await send(oversized, 'photo.jpg', 'image/jpeg')).status, 400);
  });
});
