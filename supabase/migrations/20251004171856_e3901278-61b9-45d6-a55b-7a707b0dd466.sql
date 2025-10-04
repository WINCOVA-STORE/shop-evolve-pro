
-- Eliminar datos de ejemplo existentes
DELETE FROM order_items WHERE order_id IN (
  SELECT id FROM orders WHERE user_id = 'a540474a-23f6-44e5-9289-f3fa970b0854'
);
DELETE FROM orders WHERE user_id = 'a540474a-23f6-44e5-9289-f3fa970b0854';

-- Insertar órdenes de ejemplo corregidas
INSERT INTO orders (id, user_id, order_number, status, payment_status, subtotal, shipping, tax, total, tracking_number, carrier, estimated_delivery_date, shipping_address, billing_address, currency, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'a540474a-23f6-44e5-9289-f3fa970b0854', 'ORD-2024-001234', 'shipped', 'completed', 129.99, 10.00, 12.00, 151.99, 'USPS9405511899560843607123', 'USPS', '2025-10-10', '123 Main St, Miami, FL 33101, USA', '123 Main St, Miami, FL 33101, USA', 'USD', '2025-10-01 10:30:00', '2025-10-03 14:20:00'),
  ('550e8400-e29b-41d4-a716-446655440002', 'a540474a-23f6-44e5-9289-f3fa970b0854', 'ORD-2024-001235', 'delivered', 'completed', 79.99, 10.00, 7.80, 97.79, 'UPS1Z999AA10123456784', 'UPS', '2025-10-05', '123 Main St, Miami, FL 33101, USA', '123 Main St, Miami, FL 33101, USA', 'USD', '2025-09-28 15:45:00', '2025-10-02 09:15:00'),
  ('550e8400-e29b-41d4-a716-446655440003', 'a540474a-23f6-44e5-9289-f3fa970b0854', 'ORD-2024-001236', 'processing', 'pending', 199.99, 15.00, 19.50, 234.49, NULL, NULL, '2025-10-15', '123 Main St, Miami, FL 33101, USA', '123 Main St, Miami, FL 33101, USA', 'USD', '2025-10-04 08:20:00', '2025-10-04 08:20:00');

-- Insertar items de las órdenes
INSERT INTO order_items (id, order_id, product_name, product_price, quantity, subtotal, created_at)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Reloj Inteligente', 89.99, 1, 89.99, '2025-10-01 10:30:00'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Auriculares Bluetooth', 39.99, 1, 39.99, '2025-10-01 10:30:00'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Zapatillas Deportivas', 79.99, 1, 79.99, '2025-09-28 15:45:00'),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Mochila para Laptop', 59.99, 2, 119.98, '2025-10-04 08:20:00'),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Mouse Inalámbrico', 39.99, 2, 79.98, '2025-10-04 08:20:00');
