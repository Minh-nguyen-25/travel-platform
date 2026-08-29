import Redis from 'ioredis';
import env from './env';

// ─── Singleton ioredis client ─────────────────────────────────────────────────
// connectTimeout: abort connection attempt after 5 s
// maxRetriesPerRequest: fail fast on individual commands (do not retry forever)
// retryStrategy: bounded exponential back-off; give up after 5 consecutive failures
const redisClient = new Redis(env.REDIS_URL, {
  connectTimeout: 5000,           // ms — fail startup quickly if Redis is down
  maxRetriesPerRequest: 3,        // command-level retries before error is thrown
  retryStrategy(times: number) {
    if (times > 5) {
      // Stop retrying — ioredis will emit an error event
      return null;
    }
    // Exponential back-off capped at 2 s
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,              // do NOT auto-connect; server.ts calls ping() explicitly
});

redisClient.on('connect', () => {
  console.log('✅ Kết nối Redis thành công');
});

redisClient.on('error', (err: Error) => {
  console.error('❌ Redis lỗi:', err.message);
});

redisClient.on('reconnecting', () => {
  console.warn('⚠️  Đang kết nối lại Redis...');
});

// ─── Graceful shutdown helper ─────────────────────────────────────────────────
export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    console.log('✅ Redis đã ngắt kết nối');
  } catch {
    redisClient.disconnect();
  }
};

export default redisClient;
