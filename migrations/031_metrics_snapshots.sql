-- Migration 031: Historique des métriques (MRR, utilisateurs) pour de vrais graphiques
-- Un instantané par jour, capturé par le cron quotidien (captureMetricsSnapshot).

CREATE TABLE IF NOT EXISTS metrics_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date TEXT NOT NULL UNIQUE, -- 'YYYY-MM-DD'
    total_users INTEGER NOT NULL,
    premium_users INTEGER NOT NULL,
    pro_users INTEGER NOT NULL,
    mrr INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_date ON metrics_snapshots(snapshot_date);
