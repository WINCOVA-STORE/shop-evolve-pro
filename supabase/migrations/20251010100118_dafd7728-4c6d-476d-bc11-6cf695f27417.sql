-- Create storage bucket for task documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-documents',
  'task-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/msword']
);

-- RLS policies for task documents
CREATE POLICY "Admins can upload task documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view task documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete task documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create table for task metrics and analytics
CREATE TABLE IF NOT EXISTS public.roadmap_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  in_progress_tasks INTEGER NOT NULL DEFAULT 0,
  blocked_tasks INTEGER NOT NULL DEFAULT 0,
  avg_completion_time_hours NUMERIC,
  velocity_tasks_per_week NUMERIC,
  risk_score NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for metrics
ALTER TABLE public.roadmap_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage metrics"
ON public.roadmap_metrics FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view metrics"
ON public.roadmap_metrics FOR SELECT
TO authenticated
USING (true);

-- Create index for better performance
CREATE INDEX idx_roadmap_metrics_date ON public.roadmap_metrics(date DESC);