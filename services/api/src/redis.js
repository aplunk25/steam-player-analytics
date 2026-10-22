const { createClient } = require("redis");

const redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (error) => {
    console.error("Redis error:", error.message);
});

async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
}

module.exports = {redis, connectRedis };




async function invalidateGameCache(gameId) {
  const patterns = [
    "steam-analytics:/api/games",
    `steam-analytics:/api/games/${gameId}/history*`,
    `steam-analytics:/api/games/${gameId}/stats*`,
  ];

  for (const pattern of patterns) {
    const keys = [];

    for await (const key of redis.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}

module.exports = { invalidateGameCache };

module.exports = { redis, connectRedis };
