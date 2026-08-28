const express = require("express");
const cors = require("cors");

const {
    getGames,
    getPlayerHistory,
    getGameStats
} = require("./database");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());


// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});


// Get all games
app.get("/api/games", async (req, res) => {
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


// Get player history for a game
app.get("/api/games/:id/history", async (req, res) => {
    try {
        const history = await getPlayerHistory(req.params.id);

        res.json(history);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve player history"
        });
    }
});





app.get("/api/games/:id/stats", async (req, res) => {
    try {
        const stats = await getGameStats(req.params.id);

        res.json(stats);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve game statistics"
        });
    }
});


app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});