# 📘 WINCOVA E-COMMERCE - Documentación Frontend

> **Estado**: Frontend completo en modo MOCK  
> **Última actualización**: 2024-02-23  
> **Stack**: React + TypeScript + Vite + Tailwind + Shadcn/ui

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Frontend](#arquitectura-del-frontend)
3. [Módulos Implementados](#módulos-implementados)
4. [Sistema de Datos Mock](#sistema-de-datos-mock)
5. [Componentes Principales](#componentes-principales)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Sistema de Diseño](#sistema-de-diseño)
8. [Rutas y Navegación](#rutas-y-navegación)
9. [Internacionalización](#internacionalización)
10. [Guía de Migración a Backend Real](#guía-de-migración-a-backend-real)
11. [Checklist de Producción](#checklist-de-producción)

---

## 🎯 Resumen Ejecutivo

### ✅ Completado al 100%

El frontend del e-commerce WINCOVA está **100% funcional en modo MOCK**, listo para:
- ✅ Demostración visual completa
- ✅ Testing de UX/UI
- ✅ Migración programada a backend real (Supabase/API)
- ✅ Exportación y clonación a otros entornos (Replit, Vercel, etc.)

### 🎨 Características Principales

- **Diseño Premium**: Sistema de diseño moderno basado en Tailwind + Shadcn/ui
- **Responsive 100%**: Adaptado móvil, tablet y desktop
- **Multi-idioma**: Soporte para EN, ES, FR, PT, ZH
- **Multi-moneda**: USD, EUR, GBP, MXN
- **Sistema de Rewards**: Puntos por compra
- **SEO Optimizado**: Meta tags, canonical URLs, structured data
- **Performance**: Lazy loading, optimización de imágenes, code splitting

---

## 🏗️ Arquitectura del Frontend

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base de Shadcn/ui
│   ├── admin/          # Componentes del panel admin
│   ├── wincova/        # Componentes específicos WINCOVA
│   ├── ProductCard.tsx
│   ├── ProductImageZoom.tsx
│   ├── ProductPurchaseSidebar.tsx
│   ├── CartSheet.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── pages/              # Páginas/Vistas
│   ├── Index.tsx       # Homepage
│   ├── ProductDetail.tsx
│   ├── Category.tsx
│   ├── Search.tsx
│   ├── Checkout.tsx
│   ├── Profile.tsx
│   ├── OrderDetail.tsx
│   └── ...
├── hooks/              # Custom hooks
│   ├── useProducts.ts
│   ├── useProductVariations.ts
│   ├── useAdvancedSearch.ts
│   ├── useTranslatedProduct.ts
│   └── ...
├── contexts/           # Context providers
│   ├── CartContext.tsx
│   ├── WishlistContext.tsx
│   ├── CompareContext.tsx
│   └── CurrencyContext.tsx
├── data/               # Datos estáticos y mock
│   ├── mockData.ts     # ⭐ Datos mock centralizados
│   └── categories.ts
├── i18n/               # Traducciones
│   ├── index.ts
│   └── locales/
│       ├── en.json
│       ├── es.json
│       ├── fr.json
│       ├── pt.json
│       └── zh.json
└── lib/                # Utilidades
    ├── utils.ts
    ├── secureStorage.ts
    └── marketData.ts
```

---

## 📦 Módulos Implementados

### 1️⃣ **Ficha de Producto** ✅ COMPLETO

**Archivos principales**:
- `src/pages/ProductDetail.tsx`
- `src/components/ProductCard.tsx`
- `src/components/ProductImageZoom.tsx`
- `src/components/ProductPurchaseSidebar.tsx`

**Funcionalidades**:
- ✅ Galería de imágenes con zoom (hasta 7 imágenes)
- ✅ Grid inteligente que se adapta al número de imágenes
- ✅ Descripción con traducciones multi-idioma
- ✅ Selector de cantidad
- ✅ Variantes de producto (color, talla)
- ✅ Precios con descuentos
- ✅ Sistema de reviews y ratings
- ✅ Wishlist y comparación
- ✅ Share social
- ✅ Cálculo de rewards

**Props esperados**:
```typescript
interface ProductCardProps extends Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  stock: number;
  tags: string[];
  reward_percentage: number;
}
```

---

### 2️⃣ **Carrito de Compras** ✅ COMPLETO

**Archivos principales**:
- `src/components/CartSheet.tsx`
- `src/contexts/CartContext.tsx`

**Funcionalidades**:
- ✅ Modal/Drawer deslizable
- ✅ Agregar/remover productos
- ✅ Incrementar/decrementar cantidad
- ✅ Cálculo automático de subtotal, tax, shipping
- ✅ Sistema de rewards points
- ✅ Uso de puntos para descuentos
- ✅ Botón de checkout
- ✅ Persistencia en localStorage
- ✅ Animaciones suaves

**API del CartContext**:
```typescript
interface CartContextType {
  items: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}
```

---

### 3️⃣ **Grid/Listado de Productos** ✅ COMPLETO

**Archivos principales**:
- `src/pages/Index.tsx` (Homepage grid)
- `src/pages/Category.tsx` (Grid por categoría)
- `src/pages/Search.tsx` (Grid de búsqueda con filtros)

**Funcionalidades**:
- ✅ Grid responsive (2-4 columnas según viewport)
- ✅ Filtros por categoría, precio, rating, stock
- ✅ Ordenamiento (precio, fecha, featured)
- ✅ Paginación
- ✅ Búsqueda con autocompletado
- ✅ Sticky filters en mobile
- ✅ Skeleton loaders
- ✅ Productos patrocinados intercalados

**Filtros disponibles**:
```typescript
interface SearchFilters {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStock: boolean;
}
```

---

### 4️⃣ **Panel de Usuario/Pedidos** ✅ COMPLETO

**Archivos principales**:
- `src/pages/Profile.tsx`
- `src/pages/OrderDetail.tsx`
- `src/pages/TrackOrder.tsx`

**Funcionalidades**:
- ✅ Tabs: Órdenes, Referrals, Rewards
- ✅ Historial de órdenes con estados
- ✅ Vista detallada de orden
- ✅ Tracking de envío con enlaces a carriers (UPS, FedEx, USPS, DHL)
- ✅ Resumen de compra con breakdown de costos
- ✅ Edición de perfil (nombre, dirección, teléfono, etc.)
- ✅ Sistema de referidos
- ✅ Balance de rewards points

**Estados de orden**:
- `pending`: Orden pendiente de confirmación
- `confirmed`: Orden confirmada
- `processing`: En preparación
- `shipped`: Enviada
- `delivered`: Entregada
- `cancelled`: Cancelada

---

### 5️⃣ **Checkout Paso a Paso** ✅ COMPLETO

**Archivos principales**:
- `src/pages/Checkout.tsx`
- `src/components/CheckoutForm.tsx`

**Funcionalidades**:
- ✅ Formulario de envío (nombre, email, dirección)
- ✅ Integración con Stripe para pagos (mock en frontend)
- ✅ Resumen de orden sticky
- ✅ Aplicación de rewards points
- ✅ Cálculo de tax y shipping
- ✅ Validación de formularios
- ✅ Confirmación visual
- ✅ Redirección a success page

**Flujo**:
1. Usuario llena datos de contacto
2. Ingresa datos de pago
3. Revisa resumen de orden
4. Confirma compra
5. Redirige a `/payment-success`

---

### 6️⃣ **Barra de Búsqueda y Sidebar de Filtros** ✅ COMPLETO

**Archivos principales**:
- `src/pages/Search.tsx`
- `src/components/StickyFilters.tsx`
- `src/components/AdvancedFilters.tsx`
- `src/hooks/useAdvancedSearch.ts`

**Funcionalidades**:
- ✅ Búsqueda en tiempo real con debounce
- ✅ Autocompletado de sugerencias
- ✅ Filtros multi-criterio:
  - Rango de precio (slider)
  - Categorías (checkboxes)
  - Rating mínimo
  - Solo en stock
- ✅ Drawer de filtros en mobile
- ✅ Sidebar fijo en desktop
- ✅ Contador de resultados
- ✅ Paginación de resultados

---

## 🎭 Sistema de Datos Mock

### Centralización de Mocks

Todo está centralizado en `src/data/mockData.ts`:

```typescript
// Productos mock (8 productos ejemplo)
export const MOCK_PRODUCTS: MockProduct[]

// Variaciones de productos
export const MOCK_VARIATIONS: MockVariation[]

// Órdenes de usuario
export const MOCK_ORDERS: MockOrder[]

// Usuario demo
export const MOCK_USER: MockUser
```

### Helper Functions

```typescript
// Obtener producto por ID
getMockProductById(id: string): MockProduct | undefined

// Obtener variaciones de un producto
getMockProductVariations(productId: string): MockVariation[]

// Obtener órdenes de un usuario
getMockOrdersByUserId(userId: string): MockOrder[]

// Obtener orden por ID
getMockOrderById(orderId: string): MockOrder | undefined

// Productos destacados
getFeaturedMockProducts(limit?: number): MockProduct[]

// Productos nuevos
getNewMockProducts(limit?: number): MockProduct[]

// Productos por categoría
getMockProductsByCategory(categoryId: string, limit?: number): MockProduct[]

// Búsqueda de productos
searchMockProducts(query: string): MockProduct[]
```

---

## 🧩 Componentes Principales

### ProductCard
**Ubicación**: `src/components/ProductCard.tsx`

**Props**:
```typescript
interface ProductCardProps extends Product {
  // Hereda todos los campos de Product
}
```

**Eventos**:
- `onClick`: Navega a detalle de producto
- `onAddToCart`: Agrega producto al carrito
- `onWishlist`: Toggle wishlist
- `onCompare`: Toggle comparación

---

### ProductImageZoom
**Ubicación**: `src/components/ProductImageZoom.tsx`

**Props**:
```typescript
interface ProductImageZoomProps {
  images: string[];
  alt: string;
  discount?: number;
  stock?: number;
  className?: string;
}
```

**Características**:
- Grid adaptativo (1-7 imágenes)
- Zoom lens con magnificación 250%
- Contador de imágenes (X / Y)
- Dots de navegación
- Badges de descuento y stock

---

### CartSheet
**Ubicación**: `src/components/CartSheet.tsx`

**Props**: Ninguno (usa CartContext)

**Estructura interna**:
```typescript
// CartItemDisplay: Renderiza cada item del carrito
const CartItemDisplay = ({ item, onUpdateQuantity, onRemove }) => { ... }

// CartSheet: Modal principal
export const CartSheet = () => { ... }
```

---

### Header
**Ubicación**: `src/components/Header.tsx`

**Características**:
- Logo
- Navegación principal
- Buscador
- Selector de idioma/moneda
- Wishlist count
- Cart count
- Login/Profile
- Responsive menu mobile

---

### Footer
**Ubicación**: `src/components/Footer.tsx`

**Secciones**:
- Links rápidos
- Categorías
- Legal (Terms, Privacy, Cookies)
- Newsletter signup
- Social media
- Payment methods

---

## 🎣 Hooks Personalizados

### useProducts
**Ubicación**: `src/hooks/useProducts.ts`

```typescript
// Obtener todos los productos activos
const { data: products, isLoading, error } = useProducts();

// Obtener productos destacados
const { data: featured } = useFeaturedProducts(limit);
```

**Nota**: Actualmente consulta Supabase. **PENDIENTE** migrar a mock.

---

### useProductVariations
**Ubicación**: `src/hooks/useProductVariations.ts`

```typescript
const { data: variations, isLoading } = useProductVariations(productId);

// Helpers
const attributes = getVariationAttributes(variations);
const selectedVariation = findVariationByAttributes(variations, { Color: 'Black', Size: 'M' });
```

---

### useAdvancedSearch
**Ubicación**: `src/hooks/useAdvancedSearch.ts`

```typescript
const {
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  results,
  totalResults,
  suggestions,
  availableCategories,
  loading,
  error,
  currentPage,
  totalPages,
  handlePageChange,
} = useAdvancedSearch({ pageSize: 12 });
```

**Ya usa datos mock** (`MOCK_PRODUCTS` interno).

---

### useTranslatedProduct
**Ubicación**: `src/hooks/useTranslatedProduct.ts`

```typescript
const { name, description } = useTranslatedProduct(product);
```

Devuelve el nombre y descripción traducidos según el idioma activo.

---

### CartContext (useCart)
**Ubicación**: `src/contexts/CartContext.tsx`

```typescript
const {
  items,
  cartTotal,
  cartCount,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} = useCart();
```

**Persistencia**: localStorage (`wincova-cart`)

---

### WishlistContext (useWishlist)
**Ubicación**: `src/contexts/WishlistContext.tsx`

```typescript
const {
  wishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  clearWishlist
} = useWishlist();
```

**Persistencia**: localStorage (`wincova-wishlist`)

---

### CompareContext (useCompare)
**Ubicación**: `src/contexts/CompareContext.tsx`

```typescript
const {
  compareList,
  addToCompare,
  removeFromCompare,
  isInCompare,
  clearCompare
} = useCompare();
```

---

### CurrencyContext (useCurrency)
**Ubicación**: `src/contexts/CurrencyContext.tsx`

```typescript
const {
  currency,
  setCurrency,
  exchangeRates,
  formatPrice
} = useCurrency();
```

**Monedas soportadas**: USD, EUR, GBP, MXN

---

## 🎨 Sistema de Diseño

### Tokens de Color (HSL)

Definidos en `src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 224 71.4% 4.1%;
  
  --primary: 25 95% 53%;        /* Naranja #e77600 */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 25 95% 53%;
  
  --radius: 0.5rem;
}
```

### Componentes UI (Shadcn/ui)

Todos los componentes base están en `src/components/ui/`:

- `button.tsx` - Variantes: default, destructive, outline, secondary, ghost, link
- `card.tsx` - Card, CardHeader, CardTitle, CardContent
- `dialog.tsx` - Modal/Dialog
- `sheet.tsx` - Drawer lateral
- `input.tsx` - Input field
- `select.tsx` - Dropdown select
- `checkbox.tsx` - Checkbox
- `slider.tsx` - Range slider
- `badge.tsx` - Badge/Tag
- `skeleton.tsx` - Loading skeleton
- `pagination.tsx` - Paginación
- `toast.tsx` - Notificaciones toast
- Y más...

### Animaciones

Definidas en `tailwind.config.ts`:

```typescript
animation: {
  "fade-in": "fade-in 0.3s ease-out",
  "scale-in": "scale-in 0.2s ease-out",
  "slide-in-right": "slide-in-right 0.3s ease-out",
}
```

---

## 🛣️ Rutas y Navegación

### Rutas Principales

```typescript
// src/App.tsx (simplificado)
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/product/:id" element={<ProductDetail />} />
  <Route path="/category/:slug" element={<Category />} />
  <Route path="/search" element={<Search />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/payment-success" element={<PaymentSuccess />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/order/:orderId" element={<OrderDetail />} />
  <Route path="/wishlist" element={<Wishlist />} />
  <Route path="/compare" element={<Compare />} />
  <Route path="/track-order" element={<TrackOrder />} />
  <Route path="/faq" element={<FAQ />} />
  <Route path="/terms" element={<Terms />} />
  <Route path="/return-policy" element={<ReturnPolicy />} />
  <Route path="/cookie-policy" element={<CookiePolicy />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Rutas Admin (Opcional)

```typescript
<Route path="/admin" element={<Admin />} />
<Route path="/admin/project" element={<AdminProject />} />
<Route path="/admin/phases" element={<ProjectPhases />} />
<Route path="/admin/tasks" element={<ProjectTasks />} />
<Route path="/admin/metrics" element={<ProjectMetrics />} />
```

---

## 🌍 Internacionalización

### Idiomas Soportados

- 🇺🇸 English (en)
- 🇪🇸 Español (es) 
- 🇫🇷 Français (fr)
- 🇧🇷 Português (pt)
- 🇨🇳 中文 (zh)

### Archivos de Traducción

```
src/i18n/locales/
├── en.json
├── es.json
├── fr.json
├── pt.json
└── zh.json
```

### Uso

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Traducir texto
<h1>{t('hero.title')}</h1>

// Cambiar idioma
i18n.changeLanguage('es');
```

### Estructura de Claves

```json
{
  "hero": {
    "title": "Discover Amazing Products",
    "subtitle": "Shop the latest trends",
    "cta": "Shop Now"
  },
  "products": {
    "featured": "Featured Products",
    "view_all": "View All",
    "add_to_cart": "Add to Cart",
    "out_of_stock": "Out of Stock"
  },
  "cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "subtotal": "Subtotal",
    "total": "Total",
    "checkout": "Checkout"
  }
}
```

---

## 🔄 Guía de Migración a Backend Real

### Paso 1: Crear Tablas en Supabase

```sql
-- Tabla de productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  category_id TEXT,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sku TEXT UNIQUE,
  tags TEXT[] DEFAULT '{}',
  reward_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Campos multi-idioma
  name_es TEXT,
  name_fr TEXT,
  name_pt TEXT,
  name_zh TEXT,
  description_es TEXT,
  description_fr TEXT,
  description_pt TEXT,
  description_zh TEXT
);

-- Tabla de variaciones de productos
CREATE TABLE product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  regular_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  attributes JSONB DEFAULT '[]',
  weight TEXT,
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de órdenes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  shipping_address TEXT,
  billing_address TEXT,
  tracking_number TEXT,
  carrier TEXT,
  estimated_delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Tabla de items de orden
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  phone TEXT,
  birthday DATE,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Paso 2: Habilitar RLS (Row Level Security)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para productos (público)
CREATE POLICY "Los productos son visibles para todos" 
ON products FOR SELECT 
USING (is_active = true);

-- Políticas para órdenes (privado por usuario)
CREATE POLICY "Los usuarios ven solo sus órdenes" 
ON orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios crean sus propias órdenes" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para perfiles
CREATE POLICY "Los usuarios ven su propio perfil" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Los usuarios actualizan su propio perfil" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);
```

### Paso 3: Insertar Datos Mock en Supabase

Ejecutar script para insertar los productos de `mockData.ts` en Supabase:

```typescript
// scripts/seed-supabase.ts
import { supabase } from '../src/integrations/supabase/client';
import { MOCK_PRODUCTS, MOCK_VARIATIONS } from '../src/data/mockData';

async function seedProducts() {
  for (const product of MOCK_PRODUCTS) {
    const { error } = await supabase
      .from('products')
      .insert(product);
    
    if (error) console.error('Error inserting product:', error);
  }
}

async function seedVariations() {
  for (const variation of MOCK_VARIATIONS) {
    const { error } = await supabase
      .from('product_variations')
      .insert(variation);
    
    if (error) console.error('Error inserting variation:', error);
  }
}

seedProducts().then(seedVariations);
```

### Paso 4: Actualizar Hooks

Cambiar de mock a Supabase en hooks:

**Antes (Mock)**:
```typescript
// src/hooks/useProducts.ts
import { MOCK_PRODUCTS } from '@/data/mockData';

export const useProducts = () => {
  return {
    data: MOCK_PRODUCTS,
    isLoading: false,
    error: null
  };
};
```

**Después (Supabase)**:
```typescript
// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });
};
```

### Paso 5: Actualizar Contextos

Persistir carrito en Supabase (opcional):

```typescript
// src/contexts/CartContext.tsx
const saveCartToSupabase = async (items: CartItem[]) => {
  if (!user) return;
  
  await supabase
    .from('cart_storage')
    .upsert({
      user_id: user.id,
      items: items
    });
};
```

### Paso 6: Testing y Validación

1. Crear usuario de prueba en Supabase Auth
2. Probar flujo completo:
   - Login
   - Agregar productos al carrito
   - Checkout
   - Ver órdenes en perfil
3. Verificar persistencia de datos
4. Comprobar RLS policies

---

## ✅ Checklist de Producción

### Frontend

- [x] Todos los componentes visuales funcionando
- [x] Responsive design (mobile, tablet, desktop)
- [x] Traducciones completas (5 idiomas)
- [x] Sistema de diseño coherente
- [x] Animaciones y transiciones
- [x] Manejo de estados de loading y error
- [x] Skeleton loaders implementados
- [x] SEO: Meta tags, canonical URLs
- [ ] **Migrar de mock a backend real**
- [ ] Implementar autenticación real (login/signup)
- [ ] Conectar con pasarela de pago real (Stripe)
- [ ] Configurar analytics (Google Analytics, etc.)
- [ ] Testing E2E (Cypress/Playwright)
- [ ] Optimización de performance (Lighthouse 90+)
- [ ] Configurar CDN para imágenes
- [ ] Configurar dominio personalizado

### Backend (Pendiente)

- [ ] Setup Supabase project
- [ ] Crear tablas y relaciones
- [ ] Configurar RLS policies
- [ ] Seed database con productos reales
- [ ] Implementar edge functions
- [ ] Configurar Stripe webhooks
- [ ] Configurar email transaccional
- [ ] Sistema de notificaciones
- [ ] Panel admin completo

### DevOps

- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Ambiente de staging
- [ ] Monitoring y alertas
- [ ] Backups automáticos
- [ ] Rate limiting
- [ ] SSL/HTTPS
- [ ] Logs centralizados

---

## 📝 Registro de Decisiones Técnicas

### 1. ¿Por qué datos mock centralizados?

**Decisión**: Centralizar todos los mocks en `src/data/mockData.ts`

**Razones**:
- Facilita migración a backend real
- Único punto de verdad para datos de desarrollo
- Permite testing sin backend
- Simplifica onboarding de desarrolladores

### 2. ¿Por qué usar Shadcn/ui?

**Decisión**: Usar Shadcn/ui en lugar de component libraries

**Razones**:
- Componentes copiables, no npm package
- 100% customizable
- No vendor lock-in
- Tailwind-first
- Accesibilidad integrada (a11y)

### 3. ¿Por qué Context API en lugar de Redux?

**Decisión**: Usar Context API para Cart, Wishlist, Compare

**Razones**:
- Estado simple, no necesita Redux
- Menos boilerplate
- Integración nativa con React
- Suficiente para e-commerce pequeño-mediano

### 4. ¿Por qué React Query?

**Decisión**: Usar `@tanstack/react-query` para fetching

**Razones**:
- Cache automático
- Refetch inteligente
- Estados de loading/error incluidos
- Optimistic updates
- DevTools integradas

---

## 🔗 Enlaces Útiles

- [Repositorio GitHub](https://github.com/WINCOVA-STORE/shop-evolve-pro)
- [Lovable Project](https://lovable.dev/projects/5a2eb3b3-00c8-460f-b355-686c7442387e)
- [Shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query Docs](https://tanstack.com/query/latest)
- [i18next Docs](https://www.i18next.com/)

---

## 📞 Contacto y Soporte

- **Desarrollador**: WINCOVA Team
- **Email**: dev@wincova.com
- **Slack**: #wincova-frontend

---

**Última actualización**: 2024-02-23  
**Versión**: 1.0.0  
**Estado**: ✅ Frontend completo en modo MOCK
