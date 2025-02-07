import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';


const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {

  enableOfflineQueue: true, // Prevents storing commands when Redis is offline
  retryStrategy: (times) => Math.min(times * 50, 2000), // Retry logic
});

redisClient.on('connect', () => console.log('✅ Connected to Redis'));
redisClient.on('error', (err) => console.error('❌ Redis Connection Error:', err));

const createRateLimiter = ({ windowMs, max, keyPrefix }) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args), // ✅ Fix for sendCommand issue
      client: redisClient,
      prefix: keyPrefix,
    }),
    windowMs,
    max,
    message: {
      status: 429,
      error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// ✅ Authentication rate limiter (5 requests per 15 mins)
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyPrefix: 'auth:',
});

// ✅ API rate limiter (100 requests per minute)
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyPrefix: 'api:',
});

// ✅ Password reset rate limiter (5 requests per 15 mins)
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many password reset attempts, please try again later",
});
