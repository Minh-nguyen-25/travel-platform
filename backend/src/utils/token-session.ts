import redisClient from '../config/redis';
import env from '../config/env';

// ─── Redis key pattern ────────────────────────────────────────────────────────
const sessionKey = (jti: string): string => `refresh_session:${jti}`;

/**
 * Store a refresh session in Redis.
 * TTL is taken from the validated env config — same source as the JWT expiry.
 */
export const setSession = async (jti: string, userId: number): Promise<void> => {
  await redisClient.set(
    sessionKey(jti),
    String(userId),
    'EX',
    env.REFRESH_TTL_SECONDS
  );
};

/**
 * Atomically consume a session using Redis GETDEL (available since Redis 6.2).
 * Returns the stored userId string, or null if the session does not exist
 * (already consumed, expired, or revoked).
 *
 * Exactly one concurrent caller can consume a given JTI successfully —
 * any subsequent caller racing on the same JTI receives null.
 */
export const consumeSession = async (jti: string): Promise<string | null> => {
  return redisClient.getdel(sessionKey(jti));
};

/**
 * Delete a session unconditionally (used by logout).
 * Re-throws Redis errors — do NOT swallow unexpected failures here.
 */
export const deleteSession = async (jti: string): Promise<void> => {
  await redisClient.del(sessionKey(jti));
};
