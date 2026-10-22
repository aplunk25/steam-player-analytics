
const { redis } = require("./redis");

function cacheResponse(ttlSeconds) {
  return async (req, res, next) => {
    const key = `steam-analytics:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);

      if (cached !== null) {
        res.set("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.error("Redis cache read failed:", err.message);
    }

    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Cache successful responses only.
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis
          .set(key, JSON.stringify(body), { EX: ttlSeconds })
          .catch((err) => {
            console.error("Redis cache write failed:", err.message);
          });
      }

      res.set("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
}

module.exports = { cacheResponse };
