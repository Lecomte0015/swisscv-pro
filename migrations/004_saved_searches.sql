-- Migration 004: Recherches sauvegardées
CREATE TABLE IF NOT EXISTS saved_searches (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    keywords TEXT,
    location TEXT,
    filters TEXT, -- JSON: {salary_min, salary_max, contract_types, remote, experience}
    created_at INTEGER NOT NULL,
    last_used_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
