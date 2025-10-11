-- Primero eliminar el default para poder cambiar el tipo
ALTER TABLE public.backup_settings 
ALTER COLUMN backup_day_of_week DROP DEFAULT;

-- Cambiar el tipo de columna a array
ALTER TABLE public.backup_settings 
ALTER COLUMN backup_day_of_week TYPE text[] 
USING CASE 
  WHEN backup_day_of_week IS NOT NULL THEN ARRAY[backup_day_of_week]
  ELSE ARRAY['1']::text[]
END;

-- Renombrar la columna para reflejar que ahora es plural
ALTER TABLE public.backup_settings 
RENAME COLUMN backup_day_of_week TO backup_days_of_week;

-- Agregar default como array
ALTER TABLE public.backup_settings 
ALTER COLUMN backup_days_of_week SET DEFAULT ARRAY['1']::text[];