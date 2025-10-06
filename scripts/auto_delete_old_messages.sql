-- Function to automatically delete expired messages
CREATE OR REPLACE FUNCTION delete_expired_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM group_messages
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run daily (requires pg_cron extension)
-- If pg_cron is not available, you can run this manually or via a cron job
-- SELECT cron.schedule('delete-expired-messages', '0 2 * * *', 'SELECT delete_expired_messages()');

-- Alternative: Create a trigger to delete on read
CREATE OR REPLACE FUNCTION cleanup_expired_messages_on_read()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM group_messages
  WHERE group_id = NEW.group_id 
  AND expires_at < NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger fires when messages are fetched
CREATE TRIGGER trigger_cleanup_expired_messages
AFTER INSERT ON group_messages
FOR EACH ROW
EXECUTE FUNCTION cleanup_expired_messages_on_read();

-- Manual cleanup query (run this periodically)
-- DELETE FROM group_messages WHERE expires_at < NOW();
