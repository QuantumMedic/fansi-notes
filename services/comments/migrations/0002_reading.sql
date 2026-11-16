ALTER TABLE comments ADD COLUMN read_at INTEGER;
CREATE INDEX comments_parent_status ON comments(parent_id,status,seq);
