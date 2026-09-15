const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { getAiConfig } = require('../dist/src/config/ai.js');

test('a deployment without AI_PROVIDER selects fast Gemini chat and planner models', () => {
  const names = ['AI_PROVIDER', 'AI_MODEL', 'GEMINI_MODEL', 'GEMINI_CHAT_MODEL', 'OPENAI_MODEL',
    'GEMINI_API_KEY', 'OPENAI_API_KEY'];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    names.forEach((name) => delete process.env[name]);
    const defaultConfig = getAiConfig();
    assert.equal(defaultConfig.provider, 'gemini');
    assert.equal(defaultConfig.model, 'gemini-3.5-flash');
    assert.equal(defaultConfig.chatModel, 'gemini-3.5-flash-lite');
    assert.equal(defaultConfig.maxRetries, 0);
    assert.equal(defaultConfig.apiKey, '');

    process.env.AI_PROVIDER = 'openai';
    const openAiConfig = getAiConfig();
    assert.equal(openAiConfig.provider, 'openai');
    assert.equal(openAiConfig.chatModel, openAiConfig.model);
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
});

test('Gemini chat model can be overridden independently of the planner model', () => {
  const names = ['AI_PROVIDER', 'AI_MODEL', 'GEMINI_MODEL', 'GEMINI_CHAT_MODEL'];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    process.env.AI_PROVIDER = 'gemini';
    delete process.env.AI_MODEL;
    process.env.GEMINI_MODEL = 'gemini-3.5-flash';
    process.env.GEMINI_CHAT_MODEL = 'gemini-3.5-flash';
    const config = getAiConfig();
    assert.equal(config.model, 'gemini-3.5-flash');
    assert.equal(config.chatModel, 'gemini-3.5-flash');
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
});

test('the Gemini example config points at the generateContent API', () => {
  const example = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env.example')));
  const names = ['AI_PROVIDER', 'AI_MODEL', 'GEMINI_MODEL', 'GEMINI_BASE_URL'];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    delete process.env.AI_MODEL;
    assert.equal(example.AI_PROVIDER, 'gemini');
    for (const name of ['GEMINI_MODEL', 'GEMINI_BASE_URL']) {
      process.env[name] = example[name];
    }
    process.env.AI_PROVIDER = 'gemini';
    const config = getAiConfig();
    assert.equal(config.provider, 'gemini');
    assert.equal(config.baseUrl, 'https://generativelanguage.googleapis.com/v1beta');
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
});
