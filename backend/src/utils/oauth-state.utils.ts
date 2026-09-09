import { randomBytes } from 'crypto';
import redisClient from '../config/redis';

// ─── Redis key patterns ────────────────────────────────────────────────────────

const STATE_TTL_SECONDS = 10 * 60; // 10 minutes — matches state cookie maxAge
const TICKET_TTL_SECONDS = 60;     // 60 seconds — one-time navigation ticket

export const oauthStateKey = (state: string): string => `oauth_state:${state}`;
export const oauthTicketKey = (ticket: string): string => `oauth_ticket:${ticket}`;

// ─── Return path validation ───────────────────────────────────────────────────

/**
 * Validates that a return path is a safe relative path.
 *
 * Rules:
 * 1. Must be a non-empty string <= 200 characters.
 * 2. Rejects any control characters, unencoded spaces, or backslashes.
 * 3. Decodes URI components to reject encoded backslashes (%5C), control chars, or protocol-relative paths.
 * 4. Must start with a single "/" and never "//" or "/\".
 * 5. Rejects external schemes (colon before query/hash).
 * 6. Normalizes dot segments via URL parser and rejects auth callback loops (/login, /register, /oauth/callback, /api).
 * 7. Preserves valid query strings and hashes.
 * Falls back to "/" if any check fails.
 */
export const validateReturnPath = (raw?: string | null): string => {
  if (!raw || typeof raw !== 'string') return '/';
  if (raw.length > 200) return '/';

  // Reject ASCII control characters and DEL
  if (/[\x00-\x1F\x7F]/.test(raw)) return '/';

  // Reject literal backslash and protocol-relative or backslash-prefixed paths
  if (raw.includes('\\') || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) {
    return '/';
  }

  // Check URL-decoded version for disguised backslashes, control characters, or protocol-relative paths
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return '/';
  }

  if (/[\x00-\x1F\x7F]/.test(decoded)) return '/';
  if (decoded.includes('\\') || !decoded.startsWith('/') || decoded.startsWith('//') || decoded.startsWith('/\\')) {
    return '/';
  }

  // Parse path relative to a dummy local origin to normalize dot-segments and validate structure
  let parsed: URL;
  try {
    parsed = new URL(raw, 'http://dummy.local');
  } catch {
    return '/';
  }

  // Ensure origin and host were not manipulated (e.g. via scheme tricks)
  if (parsed.origin !== 'http://dummy.local' || parsed.host !== 'dummy.local') {
    return '/';
  }

  const pathname = parsed.pathname.toLowerCase();

  // Prevent authentication callback loops and API route redirection
  if (
    pathname === '/oauth/callback' ||
    pathname.startsWith('/oauth/callback/') ||
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/register' ||
    pathname.startsWith('/register/') ||
    pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname === '/'
  ) {
    return '/';
  }

  return parsed.pathname + parsed.search + parsed.hash;
};

// ─── State stored in Redis ────────────────────────────────────────────────────

interface OAuthStateData {
  returnPath: string;
}

/**
 * Generates a cryptographically random state, stores `{ returnPath }` in Redis
 * with a 10-minute TTL, and returns the state string.
 *
 * The state string is also stored as a short-lived HttpOnly cookie by the caller.
 * CSRF validation requires both cookie AND Redis key to match — double-lock.
 */
export const createOAuthState = async (rawReturnPath?: string | null): Promise<string> => {
  const state = randomBytes(32).toString('hex');
  const returnPath = validateReturnPath(rawReturnPath);
  const data: OAuthStateData = { returnPath };
  await redisClient.set(oauthStateKey(state), JSON.stringify(data), 'EX', STATE_TTL_SECONDS);
  return state;
};

/**
 * Atomically consumes a state key from Redis using GETDEL.
 * Returns the stored OAuthStateData, or null if the key is missing (expired or replayed).
 */
export const consumeOAuthState = async (state: string): Promise<OAuthStateData | null> => {
  if (!state) return null;
  const raw = await redisClient.getdel(oauthStateKey(state));
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as OAuthStateData;
    data.returnPath = validateReturnPath(data.returnPath);
    return data;
  } catch {
    return null;
  }
};

// ─── One-Time Return Ticket ───────────────────────────────────────────────────

interface OAuthTicketData {
  userId: number;
  returnPath: string;
}

/**
 * Creates a cryptographically random one-time ticket in Redis containing
 * the authenticated user's ID and validated returnPath with a 60-second TTL.
 *
 * The ticket never grants authentication; it only conveys the pre-validated returnPath
 * after the client has authenticated via access token.
 */
export const createOAuthTicket = async (userId: number, rawReturnPath?: string | null): Promise<string> => {
  const ticket = randomBytes(32).toString('hex');
  const returnPath = validateReturnPath(rawReturnPath);
  const data: OAuthTicketData = { userId, returnPath };
  await redisClient.set(oauthTicketKey(ticket), JSON.stringify(data), 'EX', TICKET_TTL_SECONDS);
  return ticket;
};

/**
 * Atomically consumes an OAuth return-path ticket using Redis GETDEL.
 * Validates ownership against expectedUserId. If missing, expired, replayed,
 * or mismatched, safely falls back to "/".
 */
export const consumeOAuthTicket = async (ticket: string, expectedUserId: number): Promise<string> => {
  if (!ticket) return '/';
  const raw = await redisClient.getdel(oauthTicketKey(ticket));
  if (!raw) return '/';
  try {
    const data = JSON.parse(raw) as OAuthTicketData;
    if (data.userId !== expectedUserId) {
      return '/';
    }
    return validateReturnPath(data.returnPath);
  } catch {
    return '/';
  }
};

