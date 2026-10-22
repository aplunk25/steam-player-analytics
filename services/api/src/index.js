
const express = require("express");
const cors = require("cors");
const { cacheResponse } = require("./cache");
const { connectRedis } = require("./redis");

const migrate = require("./migrate");

const {
    pool,
    getGames,
    getPlayerHistory,
    getGameStats
} = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check — do not cache.
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// Get all games — cache for 30 seconds.
app.get("/api/games", cacheResponse(30), async (req, res) => {
    try {
        const games = await getGames();
        res.json(games);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to retrieve games"
        });
    }
});

// Get player history — cache for 15 seconds.
app.get(
    "/api/games/:id/history",
    cacheResponse(15),
    async (req, res) => {
        try {
            const history = await getPlayerHistory(req.params.id);
            res.json(history);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Failed to retrieve player history"
            });
        }
    }
);

// Get game statistics — cache for 30 seconds.
app.get(
    "/api/games/:id/stats",
    cacheResponse(30),
    async (req, res) => {
        try {
            const stats = await getGameStats(req.params.id);
            res.json(stats);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Failed to retrieve game statistics"
            });
        }
    }
);

// Start the API after migrations complete.
if (require.main === module) {
    migrate(pool)
        .then(async () => {
            try {
                await connectRedis();
                console.log("Connected to Redis.");
            } catch (error) {
                console.error(
                    "Redis unavailable; API will attempt to serve uncached responses:",
                    error.message
                );
            }

            app.listen(PORT, () => {
                console.log(`API server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Migration failed:", error);
            process.exit(1);
        });
}

module.exports = app;
