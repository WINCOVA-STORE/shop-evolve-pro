-- Create backups storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- Create system_backups table
CREATE TABLE IF NOT EXISTS public.system_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('manual', 'automatic')),
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('completed', 'failed', 'in_progress')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT
);

-- Create backup_settings table
CREATE TABLE IF NOT EXISTS public.backup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auto_backup_enabled BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  last_backup_at TIMESTAMP WITH TIME ZONE,
  next_backup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default backup settings
INSERT INTO public.backup_settings (auto_backup_enabled, frequency)
VALUES (false, 'daily')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_backups
CREATE POLICY "Admins can view all backups"
  ON public.system_backups
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create backups"
  ON public.system_backups
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can delete backups"
  ON public.system_backups
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for backup_settings
CREATE POLICY "Admins can view backup settings"
  ON public.backup_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update backup settings"
  ON public.backup_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for backups bucket
CREATE POLICY "Admins can upload backups"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'backups' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can view backups"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'backups' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete backups"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'backups' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_backups_created_at ON public.system_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_backups_status ON public.system_backups(status);