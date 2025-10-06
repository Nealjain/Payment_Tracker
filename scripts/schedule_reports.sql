-- Function to generate monthly reports for all users
CREATE OR REPLACE FUNCTION generate_monthly_reports()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, username FROM users LOOP
    -- Create notification for monthly report
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data,
      action_url
    ) VALUES (
      user_record.id,
      'payment_request',
      'Monthly Report Available',
      'Your monthly financial report is ready to download',
      jsonb_build_object('report_type', 'monthly', 'auto_generated', true),
      '/reports'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate yearly reports for all users
CREATE OR REPLACE FUNCTION generate_yearly_reports()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, username FROM users LOOP
    -- Create notification for yearly report
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data,
      action_url
    ) VALUES (
      user_record.id,
      'payment_request',
      'Yearly Report Available',
      'Your annual financial report is ready to download',
      jsonb_build_object('report_type', 'yearly', 'auto_generated', true),
      '/reports'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly reports (1st of each month at 2 AM)
-- Requires pg_cron extension
-- SELECT cron.schedule('monthly-reports', '0 2 1 * *', 'SELECT generate_monthly_reports()');

-- Schedule yearly reports (January 1st at 2 AM)
-- SELECT cron.schedule('yearly-reports', '0 2 1 1 *', 'SELECT generate_yearly_reports()');

-- Manual execution (for testing)
-- SELECT generate_monthly_reports();
-- SELECT generate_yearly_reports();

-- Note: If pg_cron is not available, you can:
-- 1. Use an external cron job to call an API endpoint
-- 2. Use a serverless function (Vercel Cron, AWS Lambda, etc.)
-- 3. Manually run these functions periodically
