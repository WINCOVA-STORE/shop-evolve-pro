
-- Primero obtener algunos product_ids reales para actualizar los order_items
-- Actualizar los order_items con product_ids válidos de productos existentes
DO $$
DECLARE
  product_ids uuid[];
BEGIN
  -- Obtener los primeros 5 product_ids activos
  SELECT ARRAY(SELECT id FROM products WHERE is_active = true LIMIT 5) INTO product_ids;
  
  -- Si hay productos disponibles, actualizar los order_items
  IF array_length(product_ids, 1) >= 5 THEN
    UPDATE order_items SET product_id = product_ids[1] WHERE id = '660e8400-e29b-41d4-a716-446655440001';
    UPDATE order_items SET product_id = product_ids[2] WHERE id = '660e8400-e29b-41d4-a716-446655440002';
    UPDATE order_items SET product_id = product_ids[3] WHERE id = '660e8400-e29b-41d4-a716-446655440003';
    UPDATE order_items SET product_id = product_ids[4] WHERE id = '660e8400-e29b-41d4-a716-446655440004';
    UPDATE order_items SET product_id = product_ids[5] WHERE id = '660e8400-e29b-41d4-a716-446655440005';
  END IF;
END $$;
