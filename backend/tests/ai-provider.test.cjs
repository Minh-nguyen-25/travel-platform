const assert = require('node:assert/strict');
const test = require('node:test');

const relevantEnvironmentKeys = [
  'AI_PROVIDER',
  'AI_MODEL',
  'OPENAI_MODEL',
  'GEMINI_MODEL',
  'GEMINI_CHAT_MODEL',
  'GEMINI_API_KEY',
  'OLLAMA_MODEL',
  'OLLAMA_BASE_URL',
];
const originalEnvironment = Object.fromEntries(
  relevantEnvironmentKeys.map((key) => [key, process.env[key]])
);

const resetEnvironment = () => {
  for (const key of relevantEnvironmentKeys) {
    delete process.env[key];
  }
};

test.after(() => {
  resetEnvironment();
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value !== undefined) process.env[key] = value;
  }
});

test('defaults to Gemini with its dedicated chat model', () => {
  resetEnvironment();
  const { getAiConfig } = require('../dist/src/config/ai.js');

  const config = getAiConfig();

  assert.equal(config.provider, 'gemini');
  assert.equal(config.model, 'gemini-3.5-flash');
  assert.equal(config.chatModel, 'gemini-3.5-flash-lite');
});

test('allows OpenAI as an opt-in provider', () => {
  resetEnvironment();
  process.env.AI_PROVIDER = 'openai';
  const { getAiConfig } = require('../dist/src/config/ai.js');

  assert.equal(getAiConfig().provider, 'openai');
});

test('uses GEMINI_CHAT_MODEL when Gemini is selected', () => {
  resetEnvironment();
  process.env.AI_PROVIDER = 'gemini';
  process.env.GEMINI_CHAT_MODEL = 'gemini-custom-chat';
  const { getAiConfig } = require('../dist/src/config/ai.js');

  assert.equal(getAiConfig().chatModel, 'gemini-custom-chat');
});

test('rejects a blank GEMINI_CHAT_MODEL override', () => {
  resetEnvironment();
  process.env.AI_PROVIDER = 'gemini';
  process.env.GEMINI_CHAT_MODEL = '   ';
  const { getAiConfig } = require('../dist/src/config/ai.js');

  assert.throws(() => getAiConfig(), /GEMINI_CHAT_MODEL cannot be empty/);
});

test('uses a customized Gemini planner model as the chat model when no override is set', () => {
  resetEnvironment();
  process.env.AI_PROVIDER = 'gemini';
  process.env.GEMINI_MODEL = 'gemini-custom-planner';
  const { getAiConfig } = require('../dist/src/config/ai.js');

  assert.equal(getAiConfig().chatModel, 'gemini-custom-planner');
});

test('Ollama defaults to local inference and never inherits a cloud API key', () => {
  resetEnvironment();
  process.env.AI_PROVIDER = 'ollama';
  process.env.GEMINI_API_KEY = 'must-not-forward';
  const { getAiConfig } = require('../dist/src/config/ai.js');
  const config = getAiConfig();
  assert.equal(config.provider, 'ollama');
  assert.equal(config.baseUrl, 'http://127.0.0.1:11434');
  assert.equal(config.model, 'qwen2.5:7b');
  assert.equal(config.apiKey, '');
});

test('Ollama accepts a configured model and rejects non-HTTP server URLs', () => {
  resetEnvironment();
  process.env.AI_PROVIDER = 'ollama';
  process.env.OLLAMA_MODEL = 'local-model';
  const { getAiConfig } = require('../dist/src/config/ai.js');
  assert.equal(getAiConfig().model, 'local-model');
  process.env.OLLAMA_BASE_URL = 'file:///local-model';
  assert.throws(() => getAiConfig(), /OLLAMA_BASE_URL must use http or https/);
});
