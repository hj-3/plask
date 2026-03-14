const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on('connect', () => console.log('[Redis] 연결됨'));
redis.on('error', (err) => console.error('[Redis] 오류:', err.message));

const QUEUE_NAME = process.env.QUEUE_NAME || 'enrollment-queue';

module.exports = { redis, QUEUE_NAME };
