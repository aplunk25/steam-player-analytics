const axios = require("axios");

const PLAYER_COUNT_URL = "https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/";
const MOST_PLAYED_URL = "https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/";
const APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails";

async function getPlayerCount(appId){
	const response = await axios.get(PLAYER_COUNT_URL, {
		params: {
			appid: appId
		}
	});

	return response.data.response.player_count;
}

// Returns the app IDs of Steam's most played games, in rank order.
async function getMostPlayedAppIds(limit){
	const response = await axios.get(MOST_PLAYED_URL);

	return response.data.response.ranks
		.slice(0, limit)
		.map((rank) => rank.appid);
}

async function getAppName(appId){
	const response = await axios.get(APP_DETAILS_URL, {
		params: {
			appids: appId,
			filters: "basic"
		}
	});

	const details = response.data[appId];

	if(!details || !details.success){
		throw new Error(`No store details for app ${appId}`);
	}

	return details.data.name;
}

module.exports = {
	getPlayerCount,
	getMostPlayedAppIds,
	getAppName
};
