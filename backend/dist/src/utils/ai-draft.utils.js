"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAiDraftProof = exports.createAiDraftProof = exports.normalizeAiTripDraft = void 0;
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../constants");
const trip_validator_1 = require("../validators/trip.validator");
const app_error_1 = require("./app-error");
const PROOF_TYPE = 'AI_TRIP_DRAFT';
const PROOF_ISSUER = 'travel-platform-backend';
const PROOF_AUDIENCE = 'trip-create';
const canonicalize = (value) => {
    if (value === null)
        return 'null';
    if (typeof value === 'string' || typeof value === 'boolean')
        return JSON.stringify(value);
    if (typeof value === 'number') {
        if (!Number.isFinite(value))
            throw new TypeError('Cannot sign a non-finite number');
        return JSON.stringify(value);
    }
    if (Array.isArray(value))
        return `[${value.map(canonicalize).join(',')}]`;
    if (typeof value === 'object') {
        const entries = Object.entries(value)
            .filter(([, entryValue]) => entryValue !== undefined)
            .sort(([left], [right]) => left.localeCompare(right));
        return `{${entries
            .map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalize(entryValue)}`)
            .join(',')}}`;
    }
    throw new TypeError('Cannot sign unsupported AI draft data');
};
const normalizeAiTripDraft = (tripDraft) => {
    const normalizedDraft = trip_validator_1.createTripSchema.parse(tripDraft);
    delete normalizedDraft.aiRawData;
    delete normalizedDraft.aiProofToken;
    return normalizedDraft;
};
exports.normalizeAiTripDraft = normalizeAiTripDraft;
const draftHash = (tripDraft, aiRawData) => (0, crypto_1.createHash)('sha256')
    .update(canonicalize({ tripDraft: (0, exports.normalizeAiTripDraft)(tripDraft), aiRawData }), 'utf8')
    .digest('hex');
const getProofSecret = () => {
    const secret = process.env.AI_DRAFT_SECRET?.trim() || process.env.JWT_SECRET?.trim();
    if (!secret) {
        throw new app_error_1.AppError('Dịch vụ AI chưa được cấu hình khóa ký bản nháp', constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    return secret;
};
const createAiDraftProof = (userId, tripDraft, aiRawData) => jsonwebtoken_1.default.sign({
    type: PROOF_TYPE,
    userId,
    draftHash: draftHash(tripDraft, aiRawData),
}, getProofSecret(), {
    algorithm: 'HS256',
    audience: PROOF_AUDIENCE,
    issuer: PROOF_ISSUER,
    expiresIn: (process.env.AI_DRAFT_PROOF_EXPIRES_IN || '30m'),
});
exports.createAiDraftProof = createAiDraftProof;
const verifyAiDraftProof = (token, userId, tripDraft, aiRawData) => {
    try {
        const payload = jsonwebtoken_1.default.verify(token, getProofSecret(), {
            algorithms: ['HS256'],
            audience: PROOF_AUDIENCE,
            issuer: PROOF_ISSUER,
        });
        return (payload.type === PROOF_TYPE &&
            payload.userId === userId &&
            payload.draftHash === draftHash(tripDraft, aiRawData));
    }
    catch (error) {
        if (error instanceof app_error_1.AppError)
            throw error;
        return false;
    }
};
exports.verifyAiDraftProof = verifyAiDraftProof;
//# sourceMappingURL=ai-draft.utils.js.map