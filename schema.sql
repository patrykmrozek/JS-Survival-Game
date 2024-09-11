
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    user_id TEXT PRIMARY KEY,
    password TEXT NOT NULL
);



DROP TABLE IF EXISTS wave_leaderboard;

CREATE TABLE wave_leaderboard
(
    user_id TEXT PRIMARY KEY,
    waveCount INTEGER NOT NULL
);
