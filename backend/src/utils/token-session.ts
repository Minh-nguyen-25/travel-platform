import redisClient from '../config/redis';
import env from '../config/env';

// ─── Redis key patterns ───────────────────────────────────────────────────────
export const sessionKey = (jti: string): string => `refresh_session:${jti}`;
export const userSessionsKey = (userId: number): string => `user_refresh_sessions:${userId}`;

/**
 * Store a refresh session in Redis and register it in the user's reverse index Set.
 * TTL is taken from the validated env config — same source as the JWT expiry.
 * The reverse index Set TTL is kept at least as long as the session.
 */
export const setSession = async (jti: string, userId: number): Promise<void> => {
  const uKey = userSessionsKey(userId);
  const pipeline = redisClient.pipeline();
  pipeline.set(sessionKey(jti), String(userId), 'EX', env.REFRESH_TTL_SECONDS);
  pipeline.sadd(uKey, jti);
  pipeline.expire(uKey, env.REFRESH_TTL_SECONDS);
  await pipeline.exec();
};

/**
 * Atomically consume a session using Redis GETDEL (available since Redis 6.2).
 * Returns the stored userId string, or null if the session does not exist
 * (already consumed, expired, or revoked).
 *
 * If successfully consumed, removes the JTI from the user's reverse index.
 * Exactly one concurrent caller can consume a given JTI successfully.
 */
export const consumeSession = async (jti: string): Promise<string | null> => {
  const storedUserId = await redisClient.getdel(sessionKey(jti));
  if (storedUserId !== null) {
    const userId = Number(storedUserId);
    if (!Number.isNaN(userId)) {
      await redisClient.srem(userSessionsKey(userId), jti);
    }
  }
  return storedUserId;
};

/**
 * Delete a session unconditionally (used by logout).
 * Cleans up both the session key and the JTI from the user's reverse index.
 */
export const deleteSession = async (jti: string, userId?: number): Promise<void> => {
  if (userId !== undefined && !Number.isNaN(userId)) {
    const pipeline = redisClient.pipeline();
    pipeline.del(sessionKey(jti));
    pipeline.srem(userSessionsKey(userId), jti);
    await pipeline.exec();
    return;
  }

  const storedUserId = await redisClient.getdel(sessionKey(jti));
  if (storedUserId !== null) {
    const parsedUserId = Number(storedUserId);
    if (!Number.isNaN(parsedUserId)) {
      await redisClient.srem(userSessionsKey(parsedUserId), jti);
    }
  }
};

/**
 * Revoke all active refresh sessions for a specific user.
 * Fetches all JTIs from the reverse index Set, deletes each session key,
 * and clears the reverse index key.
 */
export const revokeAllUserSessions = async (userId: number): Promise<number> => {
  const uKey = userSessionsKey(userId);
  const jtis = await redisClient.smembers(uKey);

  const pipeline = redisClient.pipeline();
  if (jtis && jtis.length > 0) {
    for (const jti of jtis) {
      pipeline.del(sessionKey(jti));
    }
  }
  pipeline.del(uKey);
  await pipeline.exec();

  return jtis ? jtis.length : 0;
};
