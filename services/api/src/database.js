const { Pool } = require("pg");


// Falls back to the local docker-compose database when DATABASE_URL isn't set.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
        || "postgresql://postgres:postgres@localhost:5433/steam_analytics"
});



async function getGames(){
    const result = await pool.query(
        `
        SELECT 
            id,
            steam_app_id,
            name,
            created_at
        FROM games
        ORDER BY name;
        `
    );


    return result.rows;
}


async function getPlayerHistory(gameId){
    const result = await pool.query(
        `
        SELECT
            player_count,
            recorded_at
        FROM player_counts
        WHERE game_id = $1
        ORDER BY recorded_at ASC;
        `,
        [gameId]);

        return result.rows;
}




async function getGameStats(gameId) {
    const result = await pool.query(`
        SELECT
            MAX(player_count) AS peak_players,
            ROUND(AVG(player_count)) AS average_players
        FROM player_counts
        WHERE game_id = $1
          AND recorded_at >= NOW() - INTERVAL '24 hours';
    `, [gameId]);

    const latestResult = await pool.query(`
        SELECT player_count, recorded_at
        FROM player_counts
        WHERE game_id = $1
        ORDER BY recorded_at DESC
        LIMIT 1;
    `, [gameId]);

    const previousResult = await pool.query(`
        SELECT player_count, recorded_at
        FROM player_counts
        WHERE game_id = $1
          AND recorded_at <= NOW() - INTERVAL '24 hours'
        ORDER BY recorded_at DESC
        LIMIT 1;
    `, [gameId]);

    const stats = result.rows[0];

    const currentPlayers = latestResult.rows[0]
        ? Number(latestResult.rows[0].player_count)
        : 0;

    let change24h = null;

    if (previousResult.rows[0]) {
        const previousPlayers = Number(
            previousResult.rows[0].player_count
        );

        change24h =
            ((currentPlayers - previousPlayers) /
                previousPlayers) * 100;
    }

    return {
        currentPlayers,
        peakPlayers: stats.peak_players
            ? Number(stats.peak_players)
            : 0,
        averagePlayers: stats.average_players
            ? Number(stats.average_players)
            : 0,
        change24h
    };
}

module.exports = {
    pool,
    getGames, 
    getPlayerHistory,
    getGameStats
};