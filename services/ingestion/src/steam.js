const axios = require("axios");

const STEAM_API_URL = "https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/";

async function getPlayerCount(appId){
	const response = await axios.get(STEAM_API_URL, {
		params: {
			appid: appId
		}
	});

	return response.data.response.player_count;
}

module.exports = {
	getPlayerCount
};
