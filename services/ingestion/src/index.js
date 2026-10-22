const { invalidateGameCache, connectRedis } = require("./cache");


const {
    getPlayerCount,
    getMostPlayedAppIds,
    getAppName
} = require("./steam");

const {
    addGame,
    getGameIdBySteamAppId,
    addPlayerCount
} = require("./database");

// How many of Steam's most played games to track.
const TOP_GAMES_LIMIT = Number(process.env.TOP_GAMES_LIMIT) || 25;


// Looks up the game in the DB, adding it (with its store name) if it's new.
async function getOrAddGame(appId) {
    const existingId = await getGameIdBySteamAppId(appId);

    if (existingId) {
        return existingId;
    }

    const name = await getAppName(appId);

    return addGame(appId, name);
}


async function run() {
    console.log("Starting Steam ingestion...\n");

    let appIds;

    try {
        appIds = await getMostPlayedAppIds(TOP_GAMES_LIMIT);
    } catch (error) {
        console.error("Failed to fetch most played games:", error.message);
        return;
    }

    let inserted = 0;

    for (const appId of appIds) {
        try {
            const gameId = await getOrAddGame(appId);
            const playerCount = await getPlayerCount(appId);

            await addPlayerCount(gameId, playerCount);

            await invalidateGameCache(gameId);
            inserted++;

            console.log(
                `${appId}: ${playerCount.toLocaleString()} players`
            );
        } catch (error) {
            console.error(`Skipping app ${appId}:`, error.message);
        }
    }

    console.log(`\nInserted player counts for ${inserted}/${appIds.length} games.`);
}


async function start() {
    try {
        await connectRedis();
        console.log("Connected to Redis.");
    } catch (error) {
        console.error("Redis unavailable; continuing without cache.");
    }

    await run();

    setInterval(async () => {
        await run();
    }, 10 * 60 * 1000);
}

start();
