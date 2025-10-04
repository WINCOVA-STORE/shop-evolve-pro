-- Add multi-language columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS name_fr TEXT,
ADD COLUMN IF NOT EXISTS name_pt TEXT,
ADD COLUMN IF NOT EXISTS name_zh TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_fr TEXT,
ADD COLUMN IF NOT EXISTS description_pt TEXT,
ADD COLUMN IF NOT EXISTS description_zh TEXT;