import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import {
    getGames,
    getPlayerHistory,
    getGameStats
} from "./api";

function App() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        async function loadGames() {
            try {
                const data = await getGames();

                setGames(data);

                if (data.length > 0) {
                    setSelectedGame(data[0]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadGames();
    }, []);

    useEffect(() => {
    async function loadGameData() {
        if (!selectedGame) {
            return;
        }

        try {
            const [historyData, statsData] = await Promise.all([
                getPlayerHistory(selectedGame.id),
                getGameStats(selectedGame.id)
            ]);

            const formattedData = historyData.map((entry) => ({
                time: new Date(
                    entry.recorded_at
                ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                }),

                players: Number(entry.player_count)
            }));

            setHistory(formattedData);
            setStats(statsData);

        } catch (error) {
            console.error(error);
        }
    }

    loadGameData();
}, [selectedGame]);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    return (
        <div style={{ padding: "2rem" }}>

            <h1>Steam Player Analytics</h1>

            <p>
                Track player counts and analyze
                Steam game trends.
            </p>

            <hr />

            <h2>Games</h2>

            {games.map((game) => (
                <button
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    style={{
                        marginRight: "10px",
                        padding: "10px"
                    }}
                >
                    {game.name}
                </button>
            ))}

            {selectedGame && (
                <>
                    <h2>
                        {selectedGame.name}
                    </h2>

                    <div
                        style={{
                            width: "100%",
                            height: 400
                        }}
                    >
                        {stats && (
    <div>
        <div>
            <h3>Current Players</h3>
            <p>
                {stats.currentPlayers.toLocaleString()}
            </p>
        </div>

        <div>
            <h3>Peak Players</h3>
            <p>
                {stats.peakPlayers.toLocaleString()}
            </p>
        </div>

        <div>
            <h3>24h Average</h3>
            <p>
                {stats.averagePlayers.toLocaleString()}
            </p>
        </div>

        <div>
            <h3>24h Change</h3>
            <p>
                {stats.change24h === null
                    ? "Not enough data"
                    : `${stats.change24h.toFixed(2)}%`
                }
            </p>
        </div>
    </div>
)}
                        <ResponsiveContainer>
                            <LineChart data={history}>

                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis dataKey="time" />

                                <YAxis />

                                <Tooltip />

                                <Line
                                    type="monotone"
                                    dataKey="players"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                />

                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

        </div>
    );
}

export default App;