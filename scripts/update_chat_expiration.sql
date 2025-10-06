-- Update chat message expiration from 30 days to 15 days
ALTER TABLE group_messages 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '15 days');

-- Update existing messages to expire in 15 days from creation
UPDATE group_messages 
SET expires_at = created_at + interval '15 days'
WHERE expires_at > created_at + interval '15 days';
