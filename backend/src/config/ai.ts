import { AiProvider } from '../types/ai.types';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  maxOutputTokens: number;
  maxDestinationCandidates: number;
  routingEnabled: boolean;
  maxRoutingLegs: number;
  routingConcurrency: number;
  routingDeadlineMs: number;
  openAiOrganization: string | null;
  openAiProject: string | null;
}

const readInteger = (
  name: string,
  fallback: number,
  minimum: number,
  maximum: number
): number => {
  const rawValue = process.env[name]?.trim();
  if (!rawValue) return fallback;

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
};

const readBoolean = (name: string, fallback: boolean): boolean => {
  const rawValue = process.env[name]?.trim().toLowerCase();
  if (!rawValue) return fallback;
  if (rawValue === 'true') return true;
  if (rawValue === 'false') return false;
  throw new Error(`${name} must be either true or false`);
};

const normalizeBaseUrl = (name: string, value: string): string => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`${name} must use http or https`);
  }

  return value.replace(/\/+$/, '');
};

const getProvider = (): AiProvider => {
  const provider = (process.env.AI_PROVIDER ?? 'openai').trim().toLowerCase();
  if (provider !== 'openai' && provider !== 'gemini') {
    throw new Error('AI_PROVIDER must be either openai or gemini');
  }
  return provider;
};

export const getAiConfig = (): AiConfig => {
  const provider = getProvider();
  const isOpenAi = provider === 'openai';
  const apiKey = (
    isOpenAi ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY
  )?.trim() ?? '';
  const model = (
    process.env.AI_MODEL ??
    (isOpenAi ? process.env.OPENAI_MODEL : process.env.GEMINI_MODEL) ??
    (isOpenAi ? 'gpt-5.6-luna' : 'gemini-3.5-flash')
  ).trim();
  const baseUrl = normalizeBaseUrl(
    isOpenAi ? 'OPENAI_BASE_URL' : 'GEMINI_BASE_URL',
    (
      isOpenAi
        ? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
        : process.env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta'
    ).trim()
  );

  if (!model) {
    throw new Error(`${isOpenAi ? 'OPENAI_MODEL' : 'GEMINI_MODEL'} cannot be empty`);
  }

  return {
    provider,
    apiKey,
    model,
    baseUrl,
    timeoutMs: readInteger('AI_REQUEST_TIMEOUT_MS', 60_000, 1_000, 180_000),
    maxRetries: readInteger('AI_MAX_RETRIES', 0, 0, 2),
    maxOutputTokens: readInteger('AI_MAX_OUTPUT_TOKENS', 12_000, 1_000, 64_000),
    maxDestinationCandidates: readInteger('AI_MAX_DESTINATION_CANDIDATES', 60, 1, 150),
    routingEnabled: readBoolean('AI_ROUTING_ENABLED', true),
    maxRoutingLegs: readInteger('AI_MAX_ROUTING_LEGS', 12, 1, 50),
    routingConcurrency: readInteger('AI_ROUTING_CONCURRENCY', 2, 1, 5),
    routingDeadlineMs: readInteger('AI_ROUTING_DEADLINE_MS', 15_000, 1_000, 60_000),
    openAiOrganization: process.env.OPENAI_ORGANIZATION?.trim() || null,
    openAiProject: process.env.OPENAI_PROJECT?.trim() || null,
  };
};
