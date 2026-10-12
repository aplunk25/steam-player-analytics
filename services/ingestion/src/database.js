const { Pool } = require("pg");

// Falls back to the local docker-compose database when DATABASE_URL isn't set.
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
		|| "postgresql://postgres:postgres@localhost:5433/steam_analytics"
});

async function addGame(appId, name){
	const result = await pool.query(
		`
		INSERT INTO games (steam_app_id, name)
		VALUES ($1, $2)
		ON CONFLICT (steam_app_id)
		DO UPDATE SET name = EXCLUDED.name
		RETURNING id;
		`,
		[appId, name]
	);
	return result.rows[0].id; 
}

async function getGameIdBySteamAppId(appId){
	const result = await pool.query(
		`
		SELECT id
		FROM games
		WHERE steam_app_id = $1;
		`,
		[appId]
	);
	return result.rows[0] ? result.rows[0].id : null;
}

async function addPlayerCount(gameId, playerCount){
	await pool.query(
		`
		INSERT INTO player_counts
			(game_id, player_count, recorded_at)
		VALUES ($1, $2, NOW());
		`,
		[gameId, playerCount]
	);
}

async function closeDatabase(){
	await pool.end();	
}
	

module.exports = {
	addGame,
	getGameIdBySteamAppId,
	addPlayerCount,
	closeDatabase

};
