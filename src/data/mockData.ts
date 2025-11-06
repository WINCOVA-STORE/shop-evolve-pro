/**
 * MOCK DATA CENTRALIZED
 * Todos los datos mock del e-commerce en un solo lugar
 * Facilita la migración futura a backend real (Supabase/API)
 */

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category_id: string;
  images: string[];
  stock: number;
  is_active: boolean;
  sku: string;
  tags: string[];
  reward_percentage: number;
  created_at: string;
  rating: number;
  reviews_count: number;
  // Multi-language fields
  name_es?: string;
  name_fr?: string;
  name_pt?: string;
  name_zh?: string;
  description_es?: string;
  description_fr?: string;
  description_pt?: string;
  description_zh?: string;
}

export interface MockVariation {
  id: string;
  product_id: string;
  sku: string;
  price: number;
  regular_price?: number;
  sale_price?: number;
  stock: number;
  is_active: boolean;
  images: string[];
  attributes: Array<{ name: string; value: string }>;
  weight?: string;
  dimensions?: any;
}

export interface MockOrder {
  id: string;
  user_id: string;
  order_number: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  currency: string;
  shipping_address: string;
  billing_address: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  notes?: string;
  items: MockOrderItem[];
}

export interface MockOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  birthday?: string;
  address?: string;
  city?: string;
  country?: string;
  created_at: string;
}

// === MOCK PRODUCTS ===
export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-001',
    name: 'Wireless Headphones Pro',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 129.99,
    compare_at_price: 179.99,
    category_id: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
      'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=500',
    ],
    stock: 45,
    is_active: true,
    sku: 'WHP-001',
    tags: ['electronics', 'audio', 'wireless', 'featured'],
    reward_percentage: 5,
    created_at: '2024-01-15T10:00:00Z',
    rating: 4.7,
    reviews_count: 234,
    name_es: 'Auriculares Inalámbricos Pro',
    description_es: 'Auriculares inalámbricos premium con cancelación activa de ruido y 30 horas de batería.',
  },
  {
    id: 'prod-002',
    name: 'Smart Watch Fitness Tracker',
    description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and sleep tracking.',
    price: 199.99,
    compare_at_price: 249.99,
    category_id: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500',
    ],
    stock: 67,
    is_active: true,
    sku: 'SWT-002',
    tags: ['electronics', 'fitness', 'wearable', 'new'],
    reward_percentage: 8,
    created_at: '2024-02-01T10:00:00Z',
    rating: 4.5,
    reviews_count: 189,
    name_es: 'Reloj Inteligente Fitness',
    description_es: 'Rastrea tus objetivos fitness con este reloj inteligente avanzado.',
  },
  {
    id: 'prod-003',
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof portable speaker with 360° sound and 12-hour battery life. Perfect for outdoor adventures.',
    price: 79.99,
    compare_at_price: 99.99,
    category_id: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500',
    ],
    stock: 120,
    is_active: true,
    sku: 'BTS-003',
    tags: ['electronics', 'audio', 'portable', 'sale'],
    reward_percentage: 6,
    created_at: '2024-01-20T10:00:00Z',
    rating: 4.8,
    reviews_count: 456,
    name_es: 'Altavoz Bluetooth Portátil',
    description_es: 'Altavoz portátil resistente al agua con sonido 360° y 12 horas de batería.',
  },
  {
    id: 'prod-004',
    name: 'USB-C Hub 7-in-1',
    description: 'Expand your laptop connectivity with HDMI, USB 3.0, SD/TF card reader, and USB-C PD charging.',
    price: 49.99,
    category_id: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
    ],
    stock: 200,
    is_active: true,
    sku: 'HUB-004',
    tags: ['electronics', 'accessories', 'productivity'],
    reward_percentage: 4,
    created_at: '2024-01-25T10:00:00Z',
    rating: 4.6,
    reviews_count: 312,
    name_es: 'Hub USB-C 7 en 1',
    description_es: 'Expande la conectividad de tu laptop con HDMI, USB 3.0 y carga PD.',
  },
  {
    id: 'prod-005',
    name: 'Mechanical Gaming Keyboard RGB',
    description: 'Professional mechanical keyboard with customizable RGB lighting and tactile switches.',
    price: 89.99,
    compare_at_price: 119.99,
    category_id: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500',
    ],
    stock: 85,
    is_active: true,
    sku: 'KEY-005',
    tags: ['electronics', 'gaming', 'peripherals', 'featured'],
    reward_percentage: 7,
    created_at: '2024-02-05T10:00:00Z',
    rating: 4.9,
    reviews_count: 567,
    name_es: 'Teclado Mecánico Gaming RGB',
    description_es: 'Teclado mecánico profesional con iluminación RGB personalizable.',
  },
  {
    id: 'prod-006',
    name: 'Wireless Gaming Mouse',
    description: 'Ultra-lightweight wireless mouse with 16000 DPI sensor and 70-hour battery life.',
    price: 69.99,
    category_id: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
    ],
    stock: 150,
    is_active: true,
    sku: 'MSE-006',
    tags: ['electronics', 'gaming', 'peripherals'],
    reward_percentage: 5,
    created_at: '2024-02-08T10:00:00Z',
    rating: 4.7,
    reviews_count: 423,
    name_es: 'Mouse Gaming Inalámbrico',
    description_es: 'Mouse inalámbrico ultra ligero con sensor de 16000 DPI.',
  },
  {
    id: 'prod-007',
    name: '4K Webcam Pro',
    description: 'Professional 4K webcam with autofocus, low-light correction, and dual microphones.',
    price: 159.99,
    category_id: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=500',
    ],
    stock: 42,
    is_active: true,
    sku: 'WBC-007',
    tags: ['electronics', 'streaming', 'productivity', 'new'],
    reward_percentage: 8,
    created_at: '2024-02-10T10:00:00Z',
    rating: 4.8,
    reviews_count: 201,
    name_es: 'Webcam 4K Pro',
    description_es: 'Webcam profesional 4K con enfoque automático y micrófonos duales.',
  },
  {
    id: 'prod-008',
    name: 'Laptop Stand Aluminum',
    description: 'Ergonomic aluminum laptop stand with adjustable height and angle for better posture.',
    price: 39.99,
    category_id: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    ],
    stock: 95,
    is_active: true,
    sku: 'LST-008',
    tags: ['electronics', 'accessories', 'ergonomic'],
    reward_percentage: 3,
    created_at: '2024-01-28T10:00:00Z',
    rating: 4.5,
    reviews_count: 178,
    name_es: 'Soporte para Laptop Aluminio',
    description_es: 'Soporte ergonómico de aluminio con altura y ángulo ajustables.',
  },
];

// === MOCK PRODUCT VARIATIONS ===
export const MOCK_VARIATIONS: MockVariation[] = [
  // Variations for Wireless Headphones Pro
  {
    id: 'var-001',
    product_id: 'prod-001',
    sku: 'WHP-001-BLK',
    price: 129.99,
    regular_price: 179.99,
    stock: 25,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
    attributes: [{ name: 'Color', value: 'Black' }],
    weight: '250g',
  },
  {
    id: 'var-002',
    product_id: 'prod-001',
    sku: 'WHP-001-WHT',
    price: 129.99,
    regular_price: 179.99,
    stock: 20,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'],
    attributes: [{ name: 'Color', value: 'White' }],
    weight: '250g',
  },
  // Variations for Smart Watch
  {
    id: 'var-003',
    product_id: 'prod-002',
    sku: 'SWT-002-BLK-S',
    price: 199.99,
    stock: 30,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
    attributes: [
      { name: 'Color', value: 'Black' },
      { name: 'Size', value: 'Small' },
    ],
    weight: '45g',
  },
  {
    id: 'var-004',
    product_id: 'prod-002',
    sku: 'SWT-002-BLU-L',
    price: 199.99,
    stock: 37,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'],
    attributes: [
      { name: 'Color', value: 'Blue' },
      { name: 'Size', value: 'Large' },
    ],
    weight: '48g',
  },
];

// === MOCK ORDERS ===
export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'order-001',
    user_id: 'user-001',
    order_number: 'ORD-2024-001234',
    created_at: '2024-02-15T14:30:00Z',
    status: 'delivered',
    payment_status: 'paid',
    total: 359.97,
    subtotal: 339.97,
    shipping: 0,
    tax: 20.00,
    currency: 'USD',
    shipping_address: 'John Doe\n123 Main St\nNew York, NY 10001\nUSA',
    billing_address: 'John Doe\n123 Main St\nNew York, NY 10001\nUSA',
    tracking_number: '1Z999AA10123456784',
    carrier: 'UPS',
    estimated_delivery_date: '2024-02-20T00:00:00Z',
    notes: 'Please leave at door',
    items: [
      {
        id: 'item-001',
        order_id: 'order-001',
        product_id: 'prod-001',
        product_name: 'Wireless Headphones Pro',
        product_price: 129.99,
        quantity: 1,
        subtotal: 129.99,
      },
      {
        id: 'item-002',
        order_id: 'order-001',
        product_id: 'prod-002',
        product_name: 'Smart Watch Fitness Tracker',
        product_price: 199.99,
        quantity: 1,
        subtotal: 199.99,
      },
    ],
  },
  {
    id: 'order-002',
    user_id: 'user-001',
    order_number: 'ORD-2024-001567',
    created_at: '2024-02-20T10:15:00Z',
    status: 'shipped',
    payment_status: 'paid',
    total: 89.99,
    subtotal: 79.99,
    shipping: 5.00,
    tax: 5.00,
    currency: 'USD',
    shipping_address: 'John Doe\n123 Main St\nNew York, NY 10001\nUSA',
    billing_address: 'John Doe\n123 Main St\nNew York, NY 10001\nUSA',
    tracking_number: 'FDX987654321',
    carrier: 'FedEx',
    estimated_delivery_date: '2024-02-25T00:00:00Z',
    items: [
      {
        id: 'item-003',
        order_id: 'order-002',
        product_id: 'prod-003',
        product_name: 'Portable Bluetooth Speaker',
        product_price: 79.99,
        quantity: 1,
        subtotal: 79.99,
      },
    ],
  },
  {
    id: 'order-003',
    user_id: 'user-001',
    order_number: 'ORD-2024-001890',
    created_at: '2024-02-22T16:45:00Z',
    status: 'pending',
    payment_status: 'pending',
    total: 149.98,
    subtotal: 139.98,
    shipping: 0,
    tax: 10.00,
    currency: 'USD',
    shipping_address: 'John Doe\n123 Main St\nNew York, NY 10001\nUSA',
    billing_address: 'John Doe\n123 Main St\nNew York, NY 10001\nUSA',
    items: [
      {
        id: 'item-004',
        order_id: 'order-003',
        product_id: 'prod-005',
        product_name: 'Mechanical Gaming Keyboard RGB',
        product_price: 89.99,
        quantity: 1,
        subtotal: 89.99,
      },
      {
        id: 'item-005',
        order_id: 'order-003',
        product_id: 'prod-004',
        product_name: 'USB-C Hub 7-in-1',
        product_price: 49.99,
        quantity: 1,
        subtotal: 49.99,
      },
    ],
  },
];

// === MOCK USER ===
export const MOCK_USER: MockUser = {
  id: 'user-001',
  email: 'demo@wincova.com',
  full_name: 'Demo User',
  phone: '+1 (555) 123-4567',
  birthday: '1990-01-15',
  address: '123 Main Street',
  city: 'New York',
  country: 'USA',
  created_at: '2024-01-01T00:00:00Z',
};

// === HELPER FUNCTIONS ===
export const getMockProductById = (id: string): MockProduct | undefined => {
  return MOCK_PRODUCTS.find(p => p.id === id);
};

export const getMockProductVariations = (productId: string): MockVariation[] => {
  return MOCK_VARIATIONS.filter(v => v.product_id === productId);
};

export const getMockOrdersByUserId = (userId: string): MockOrder[] => {
  return MOCK_ORDERS.filter(o => o.user_id === userId);
};

export const getMockOrderById = (orderId: string): MockOrder | undefined => {
  return MOCK_ORDERS.find(o => o.id === orderId);
};

export const getFeaturedMockProducts = (limit: number = 8): MockProduct[] => {
  return MOCK_PRODUCTS.filter(p => p.tags.includes('featured')).slice(0, limit);
};

export const getNewMockProducts = (limit: number = 8): MockProduct[] => {
  return MOCK_PRODUCTS.filter(p => p.tags.includes('new')).slice(0, limit);
};

export const getMockProductsByCategory = (categoryId: string, limit?: number): MockProduct[] => {
  const filtered = MOCK_PRODUCTS.filter(p => p.category_id === categoryId);
  return limit ? filtered.slice(0, limit) : filtered;
};

export const searchMockProducts = (query: string): MockProduct[] => {
  const lowerQuery = query.toLowerCase();
  return MOCK_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
