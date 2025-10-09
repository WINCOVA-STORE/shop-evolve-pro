-- Add image columns to wincova_changes table for before/after visualizations
ALTER TABLE public.wincova_changes
ADD COLUMN IF NOT EXISTS before_image_url TEXT,
ADD COLUMN IF NOT EXISTS after_image_url TEXT;