import { createHash } from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { HTTP_STATUS } from '../constants';
import { CreateTripInput } from '../types/trip.types';
import { createTripSchema } from '../validators/trip.validator';
import { AppError } from './app-error';

const PROOF_TYPE = 'AI_TRIP_DRAFT';
const PROOF_ISSUER = 'travel-platform-backend';
const PROOF_AUDIENCE = 'trip-create';

interface AiDraftProofPayload extends JwtPayload {
  type: typeof PROOF_TYPE;
  userId: number;
  draftHash: string;
}

const canonicalize = (value: unknown): string => {
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Cannot sign a non-finite number');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalize(entryValue)}`)
      .join(',')}}`;
  }

  throw new TypeError('Cannot sign unsupported AI draft data');
};

export const normalizeAiTripDraft = (tripDraft: CreateTripInput): CreateTripInput => {
  const normalizedDraft = createTripSchema.parse(tripDraft);
  delete normalizedDraft.aiRawData;
  delete normalizedDraft.aiProofToken;
  return normalizedDraft;
};

const draftHash = (tripDraft: CreateTripInput, aiRawData: string): string =>
  createHash('sha256')
    .update(canonicalize({ tripDraft: normalizeAiTripDraft(tripDraft), aiRawData }), 'utf8')
    .digest('hex');

const getProofSecret = (): string => {
  const secret = process.env.AI_DRAFT_SECRET?.trim() || process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new AppError(
      'Dịch vụ AI chưa được cấu hình khóa ký bản nháp',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
  return secret;
};

export const createAiDraftProof = (
  userId: number,
  tripDraft: CreateTripInput,
  aiRawData: string
): string =>
  jwt.sign(
    {
      type: PROOF_TYPE,
      userId,
      draftHash: draftHash(tripDraft, aiRawData),
    } satisfies Omit<AiDraftProofPayload, keyof JwtPayload>,
    getProofSecret(),
    {
      algorithm: 'HS256',
      audience: PROOF_AUDIENCE,
      issuer: PROOF_ISSUER,
      expiresIn: (process.env.AI_DRAFT_PROOF_EXPIRES_IN || '30m') as jwt.SignOptions['expiresIn'],
    }
  );

export const verifyAiDraftProof = (
  token: string,
  userId: number,
  tripDraft: CreateTripInput,
  aiRawData: string
): boolean => {
  try {
    const payload = jwt.verify(token, getProofSecret(), {
      algorithms: ['HS256'],
      audience: PROOF_AUDIENCE,
      issuer: PROOF_ISSUER,
    }) as AiDraftProofPayload;

    return (
      payload.type === PROOF_TYPE &&
      payload.userId === userId &&
      payload.draftHash === draftHash(tripDraft, aiRawData)
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    return false;
  }
};
