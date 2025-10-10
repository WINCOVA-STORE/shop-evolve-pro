-- Limpiar duplicados de Fase 1
-- Eliminar tareas duplicadas con nombre incorrecto
DELETE FROM public.ecommerce_roadmap_items 
WHERE phase_name = 'FASE 1: FUNCIONALIDAD CRÍTICA';

-- Verificar integridad de datos
-- Asegurar que no haya tareas huérfanas o mal formateadas