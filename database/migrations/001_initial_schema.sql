CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    steam_app_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_counts (
    id BIGSERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    player_count INTEGER NOT NULL,
    recorded_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_player_counts_game_time
ON player_counts(game_id, recorded_at);
