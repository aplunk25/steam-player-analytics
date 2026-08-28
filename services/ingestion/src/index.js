const { getPlayerCount } = require("./steam");

const {
    addGame,
    addPlayerCount
} = require("./database");

const games = [
    {
        appId: 730,
        name: "Counter-Strike 2"
    },
    {
        appId: 570,
        name: "Dota 2"
    },
    {
        appId: 578080,
        name: "PUBG: Battlegrounds"
    }
];


async function run() {
    console.log("Starting Steam ingestion...\n");

    try {
        for (const game of games) {
            const playerCount = await getPlayerCount(game.appId);

            console.log(
                `${game.name}: ${playerCount.toLocaleString()} players`
            );

            const gameId = await addGame(
                game.appId,
                game.name
            );

            await addPlayerCount(
                gameId,
                playerCount
            );
        }

        console.log("\nSuccessfully inserted player counts.");
    } catch (error) {
        console.error("Ingestion failed:", error.message);
    }
}


async function start() {
    await run();

    setInterval(async () => {
        await run();
    }, 10 * 60 * 1000);
}


start();