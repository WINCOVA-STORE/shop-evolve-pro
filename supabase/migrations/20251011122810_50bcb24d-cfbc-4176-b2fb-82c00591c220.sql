-- Add hour and day configuration to backup_settings
ALTER TABLE backup_settings
ADD COLUMN IF NOT EXISTS backup_hour TEXT DEFAULT '03',
ADD COLUMN IF NOT EXISTS backup_day_of_week TEXT DEFAULT '1';