-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any existing backup cron jobs
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname = 'automated-backup-job';

-- Create cron job to run daily at 3 AM
-- This will check backup_settings and run backup if enabled
SELECT cron.schedule(
  'automated-backup-job',
  '0 3 * * *', -- Every day at 3 AM
  $$
  SELECT
    net.http_post(
      url:='https://pduhecmerwvmgbdtathh.supabase.co/functions/v1/scheduled-backup',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdWhlY21lcnd2bWdiZHRhdGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODYyOTUsImV4cCI6MjA3NTA2MjI5NX0.JdKBLXyPlerAPtVtZ3Azl9SNKqfofEjdpgNFD4GSPT4"}'::jsonb,
      body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);