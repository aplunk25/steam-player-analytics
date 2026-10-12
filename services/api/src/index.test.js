const request = require("supertest");

jest.mock("./database"); // auto-mocks getGames, getPlayerHistory, getGameStats
const { getGames, getPlayerHistory, getGameStats } = require("./database");
const app = require("./index");

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // silence expected error logs
});

describe("GET /api/health", () => {
    it("returns ok", async () => {
        const res = await request(app).get("/api/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok" });
    });
});

describe("GET /api/games", () => {
    it("returns games from the database", async () => {
        getGames.mockResolvedValue([{ id: 730, name: "Counter-Strike 2" }]);

        const res = await request(app).get("/api/games");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 730, name: "Counter-Strike 2" }]);
    });

    it("returns 500 when the database fails", async () => {
        getGames.mockRejectedValue(new Error("db down"));

        const res = await request(app).get("/api/games");

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: "Failed to retrieve games" });
    });
});

describe("GET /api/games/:id/history", () => {
    it("passes the id through and returns history", async () => {
        getPlayerHistory.mockResolvedValue([{ players: 1000 }]);

        const res = await request(app).get("/api/games/730/history");

        expect(getPlayerHistory).toHaveBeenCalledWith("730"); // route params are strings
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ players: 1000 }]);
    });

    it("returns 500 on error", async () => {
        getPlayerHistory.mockRejectedValue(new Error("boom"));
        const res = await request(app).get("/api/games/730/history");
        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Failed to retrieve player history");
    });
});

describe("GET /api/games/:id/stats", () => {
    it("returns stats", async () => {
        getGameStats.mockResolvedValue({ peak: 1500000 });
        const res = await request(app).get("/api/games/730/stats");
        expect(getGameStats).toHaveBeenCalledWith("730");
        expect(res.body).toEqual({ peak: 1500000 });
    });

    it("returns 500 on error", async () => {
        getGameStats.mockRejectedValue(new Error("boom"));
        const res = await request(app).get("/api/games/730/stats");
        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Failed to retrieve game statistics");
    });
});
