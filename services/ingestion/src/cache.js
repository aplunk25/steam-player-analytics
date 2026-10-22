
const { createClient } = require("redis");

const redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (error) => {
    console.error("Redis error:", error.message);
});

async function invalidateGameCache(gameId) {
    // If Redis is unavailable, ingestion should still continue.
    if (!redis.isReady) {
        return;
    }

    const patterns = [
        "steam-analytics:/api/games",
        `steam-analytics:/api/games/${gameId}/history*`,
        `steam-analytics:/api/games/${gameId}/stats*`,
    ];

    for (const pattern of patterns) {
        const keys = [];

        // node-redis v5+ yields an array of keys per SCAN batch.
        for await (const batch of redis.scanIterator({
            MATCH: pattern,
            COUNT: 100,
        })) {
            keys.push(...batch);
        }

        if (keys.length > 0) {
            await redis.del(keys);
        }
    }
}

async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
}

module.exports = {
    redis,
    connectRedis,
    invalidateGameCache,
};
