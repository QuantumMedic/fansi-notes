-- Apply ONLY to the explicitly authorized production verification DB.
-- Persisted expiry rejects writes that finish after the HTTP lease check.
CREATE TABLE IF NOT EXISTS verification_window (id INTEGER PRIMARY KEY CHECK(id=1),active INTEGER NOT NULL CHECK(active IN(0,1)),expires INTEGER NOT NULL);
CREATE TRIGGER IF NOT EXISTS verification_insert BEFORE INSERT ON comments WHEN EXISTS(SELECT 1 FROM verification_window WHERE active=0 OR expires<=CAST(strftime('%s','now') AS INTEGER)*1000) BEGIN SELECT RAISE(ABORT,'verification_closed'); END;
CREATE TRIGGER IF NOT EXISTS verification_update BEFORE UPDATE ON comments WHEN EXISTS(SELECT 1 FROM verification_window WHERE active=0 OR expires<=CAST(strftime('%s','now') AS INTEGER)*1000) BEGIN SELECT RAISE(ABORT,'verification_closed'); END;
CREATE TRIGGER IF NOT EXISTS verification_delete BEFORE DELETE ON comments WHEN EXISTS(SELECT 1 FROM verification_window WHERE active=0 OR expires<=CAST(strftime('%s','now') AS INTEGER)*1000) BEGIN SELECT RAISE(ABORT,'verification_closed'); END;
CREATE TRIGGER IF NOT EXISTS verification_unpause BEFORE UPDATE ON settings WHEN NEW.paused=0 AND EXISTS(SELECT 1 FROM verification_window WHERE active=0 OR expires<=CAST(strftime('%s','now') AS INTEGER)*1000) BEGIN SELECT RAISE(ABORT,'verification_closed'); END;
