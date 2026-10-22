
const { redis } = require("./redis");

function cacheResponse(ttlSeconds) {
    return async (req, res, next) => {
        const key = `steam-analytics:${req.originalUrl}`;

        // If Redis is unavailable, skip caching.
        if (!redis.isReady) {
            res.set("X-Cache", "BYPASS");
            return next();
        }

        try {
            const cached = await redis.get(key);

            if (cached !== null) {
                res.set("X-Cache", "HIT");
                return res.json(JSON.parse(cached));
            }
        } catch (error) {
            console.error("Redis cache read failed:", error.message);
            res.set("X-Cache", "BYPASS");
            return next();
        }

        const originalJson = res.json.bind(res);

        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                redis
                    .set(key, JSON.stringify(body), { EX: ttlSeconds })
                    .catch((error) => {
                        console.error(
                            "Redis cache write failed:",
                            error.message
                        );
                    });
            }

            res.set("X-Cache", "MISS");
            return originalJson(body);
        };

        next();
    };
}

module.exports = { cacheResponse };
