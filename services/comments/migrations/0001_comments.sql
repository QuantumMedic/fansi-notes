CREATE TABLE IF NOT EXISTS comments (
 seq INTEGER PRIMARY KEY AUTOINCREMENT,
 id TEXT NOT NULL UNIQUE,
 thread TEXT NOT NULL,
 parent_id TEXT REFERENCES comments(id),
 nickname TEXT NOT NULL,
 body TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('published','pending','hidden','deleted')),
 author INTEGER NOT NULL DEFAULT 0,
 delete_hash TEXT,
 request_hash TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS thread_feed ON comments(thread,status,seq);
CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1),moderation INTEGER NOT NULL DEFAULT 0,paused INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO settings(id) VALUES(1);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS used_tokens (digest TEXT PRIMARY KEY,expires INTEGER NOT NULL);
