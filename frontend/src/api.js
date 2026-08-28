const API_URL = "http://localhost:3000/api";

export async function getGames(){
    const response = await fetch(`${API_URL}/games`);
    if(!response.ok){
        throw new Error("Failed to fetch games");
    }

    return response.json();
}

export async function getPlayerHistory(gameId){
    const response = await fetch(`${API_URL}/games/${gameId}/history`);

    if(!response.ok){
        throw new Error("Failed to fetch player history");
    }


    return response.json();
}


export async function getGameStats(gameId) {
    const response = await fetch(
        `${API_URL}/games/${gameId}/stats`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch game statistics");
    }

    return response.json();
}