# 🛒 WINCOVA Cart System - Documentación Técnica Completa

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Principales](#componentes-principales)
4. [Edge Functions](#edge-functions)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Neuroventas e Interacciones](#neuroventas-e-interacciones)
7. [Integraciones](#integraciones)
8. [Métricas y Conversión](#métricas-y-conversión)
9. [Guía de Implementación](#guía-de-implementación)

---

## 🎯 Resumen Ejecutivo

### Objetivo
Crear el **mejor carrito de compras del mundo**, superando estándares de Amazon, Shopify y Stripe, con enfoque en:
- ✅ **Neuroventas**: Micro-interacciones dopaminérgicas que generan adicción positiva
- ✅ **Conversión máxima**: Reducción de fricción a near-zero
- ✅ **IA Predictiva**: Sugerencias inteligentes en tiempo real
- ✅ **Confianza absoluta**: Badges de seguridad y protección visible
- ✅ **Estética premium**: Diseño internacional de clase mundial

### Métricas Objetivo
- **Conversión de carrito a checkout**: >75% (vs. 50% promedio industria)
- **Valor promedio de orden (AOV)**: +35% mediante sugerencias IA
- **Tiempo de decisión**: <30 segundos (vs. 2-3 minutos promedio)
- **Tasa de abandono**: <15% (vs. 70% promedio industria)

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
```yaml
Frontend:
  - React + TypeScript
  - Tailwind CSS + shadcn/ui
  - React Query (TanStack Query)
  - Zustand/Context API

Backend:
  - Supabase (Lovable Cloud)
  - Edge Functions (Deno)
  - Lovable AI Gateway (Gemini 2.5 Flash)

Integraciones:
  - Stripe Checkout (embedded)
  - Sistema de Recompensas WINCOVA
  - Wishlist sincronizada
  - Analytics en tiempo real
```

### Diagrama de Arquitectura
```
┌─────────────────────────────────────────────────────────────┐
│                    WINCOVA Cart System                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Cart Drawer │───▶│ AI Suggestions│───▶│   Checkout   │  │
│  │  Component   │    │    Panel      │    │     Page     │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘  │
│         │                   │                               │
│         ▼                   ▼                               │
│  ┌──────────────────────────────────┐                       │
│  │      CartContext (State)         │                       │
│  └──────────────┬───────────────────┘                       │
│                 │                                            │
│                 ▼                                            │
│  ┌──────────────────────────────────┐                       │
│  │   Edge Function: ai-cart-        │                       │
│  │      suggestions                 │                       │
│  └──────────────┬───────────────────┘                       │
│                 │                                            │
│                 ▼                                            │
│  ┌──────────────────────────────────┐                       │
│  │  Lovable AI Gateway (Gemini)     │                       │
│  └──────────────────────────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes Principales

### 1. WincovaCartDrawer.tsx
**Propósito**: Drawer principal del carrito con todas las funcionalidades premium

**Props**:
```typescript
// No props - usa contexts directamente
```

**Características clave**:
- ✨ Animaciones dopaminérgicas en todas las interacciones
- 🎯 Resumen sticky dinámico con desglose de precios
- 🏆 Integración visual del sistema de puntos/recompensas
- 🛡️ Badges de confianza (Compra Protegida, Envío Rápido)
- 💚 Wishlist integrada (mover items fácilmente)
- 📊 Indicadores de stock dinámicos con alertas visuales
- 🎨 Gradientes y efectos visuales premium
- ♿ Accesibilidad completa (ARIA labels, keyboard navigation)

**Estados**:
```typescript
const [pointsToUse, setPointsToUse] = useState(0);
const [isOpen, setIsOpen] = useState(false);
const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
```

**Cálculos**:
```typescript
// Impuestos
const taxRate = 0.1;
const taxAmount = cartTotal * taxRate;

// Envío
const shippingCost = calculateShipping(cartTotal);

// Descuento por puntos
const pointsDiscount = pointsToDollars(pointsToUse);

// Total final
const total = Math.max(0, subtotalWithShipping - pointsDiscount);

// Puntos a ganar
const pointsToEarn = calculateEarningPoints(cartTotal);
```

---

### 2. WincovaCartItem (Componente Interno)
**Propósito**: Renderizar cada producto en el carrito con controles y estado

**Props**:
```typescript
interface CartItemProps {
  item: Product;
}
```

**Características**:
- 🔄 Controles de cantidad con validación de stock
- ❤️ Botón "Mover a Wishlist" (aparece en hover)
- 📈 Indicador visual de stock (barra de progreso)
- 🎨 Animaciones de entrada/salida
- 🗑️ Eliminación con confirmación visual

**Interacciones**:
```typescript
// Mover a wishlist
const handleMoveToWishlist = () => {
  setShowWishlistAnimation(true);
  setTimeout(() => {
    addToWishlist(item);
    removeFromCart(item.id);
  }, 300);
};

// Eliminar con animación
const handleRemove = () => {
  setShowRemoveAnimation(true);
  setTimeout(() => removeFromCart(item.id), 300);
};
```

---

### 3. CartSuggestionsPanel.tsx
**Propósito**: Panel de sugerencias IA con productos complementarios y upsells

**Props**:
```typescript
interface CartSuggestionsPanelProps {
  cartItems: Product[];
}
```

**Características**:
- 🤖 Sugerencias impulsadas por IA en tiempo real
- 🎯 Algoritmo de priorización (complementarios > upsells > ofertas)
- 👥 Social proof ("50+ personas lo compraron hoy")
- ⚡ Añadir al carrito con un clic
- 📱 Responsive con scroll horizontal en mobile
- 🎨 Diseño con gradientes y efectos de hover

**Lógica de sugerencias**:
```typescript
// Prioridad 1: Productos complementarios (misma categoría)
// Prioridad 2: Upsells estratégicos (mayor valor)
// Prioridad 3: Ofertas y descuentos
// Prioridad 4: Productos populares
```

---

### 4. useCartSuggestions.ts (Hook)
**Propósito**: Hook personalizado para gestionar sugerencias IA y fallback rule-based

**Signatura**:
```typescript
const { suggestions, loading } = useCartSuggestions(cartItems: Product[]);
```

**Flujo**:
```
1. Detecta cambios en cartItems
   ↓
2. Llama a edge function `ai-cart-suggestions`
   ↓
3. Si falla IA → Fallback a sugerencias rule-based
   ↓
4. Retorna lista de productos sugeridos
```

**Fallback rule-based**:
```typescript
const getFallbackSuggestions = (cartItems, allProducts, cartItemIds, cartCategories) => {
  // 1. Filtrar productos ya en carrito
  // 2. Priorizar misma categoría con descuentos
  // 3. Añadir productos complementarios de otras categorías
  // 4. Ordenar por relevancia y precio
  // 5. Limitar a 5 sugerencias
};
```

---

## ⚡ Edge Functions

### ai-cart-suggestions
**Ruta**: `supabase/functions/ai-cart-suggestions/index.ts`

**Propósito**: Generar sugerencias de productos usando IA basadas en el contenido del carrito

**Input**:
```typescript
{
  cartItems: Array<{
    id: string;
    name: string;
    category_id: string;
    price: number;
    tags: string[];
  }>;
  availableProducts: Array<Product>;
}
```

**Output**:
```typescript
{
  suggestions: Array<Product & { reason: string }>;
  powered_by: "WINCOVA AI Engine";
}
```

**Modelo IA**: `google/gemini-2.5-flash`

**Prompt del Sistema**:
```
You are a highly intelligent e-commerce recommendation engine for WINCOVA.
Your goal is to maximize conversion, cross-selling, and customer satisfaction.

Analyze the user's cart and suggest 3-5 complementary products that:
1. Create value bundles (items that work together)
2. Offer strategic upsells (higher-value alternatives or upgrades)
3. Include best deals (discounted items that provide savings)
4. Match user preferences based on cart contents
5. Prioritize items with good stock availability
```

**Manejo de errores**:
- ❌ Si falla IA → Retorna array vacío
- ❌ Si no hay LOVABLE_API_KEY → Log error y retorna vacío
- ❌ Si parsing JSON falla → Intenta extraer JSON con regex
- ✅ Validación de sugerencias contra productos disponibles

**Rate Limiting**:
- Debounce de 500ms en el hook
- Cache en frontend para evitar llamadas repetidas

---

## 🎭 Flujos de Usuario

### Flujo 1: Añadir Producto al Carrito
```
Usuario hace clic en "Añadir al carrito" en ProductCard
   ↓
addToCart() actualiza CartContext
   ↓
Toast de confirmación con animación
   ↓
Badge del carrito se actualiza con contador animado
   ↓
useCartSuggestions detecta cambio y llama a edge function
   ↓
Panel de sugerencias se actualiza con productos IA
```

### Flujo 2: Usar Puntos de Recompensa
```
Usuario abre carrito
   ↓
Si está autenticado → Muestra sección de puntos disponibles
   ↓
Usuario ingresa cantidad de puntos a usar
   ↓
Validación: max = getMaxUsablePoints(cartTotal, availablePoints)
   ↓
Descuento se aplica en tiempo real con animación
   ↓
Total se actualiza mostrando ahorro con badge verde
```

### Flujo 3: Mover Item a Wishlist
```
Usuario hace hover sobre item en carrito
   ↓
Botón de corazón aparece con fade-in
   ↓
Usuario hace clic en corazón
   ↓
Animación slide-out-right del item
   ↓
addToWishlist() + removeFromCart() ejecutan
   ↓
Toast de confirmación "Movido a favoritos"
   ↓
Carrito se actualiza sin el item
```

### Flujo 4: Checkout
```
Usuario hace clic en "Proceder al Checkout Seguro"
   ↓
Animación de éxito (checkmark + scale-in)
   ↓
Navegación a /checkout con query params:
  - pointsUsed
  - pointsDiscount
   ↓
Drawer se cierra con transición suave
```

---

## 🧠 Neuroventas e Interacciones Dopaminérgicas

### Principios Aplicados

#### 1. **Feedback Instantáneo (<100ms)**
- ✅ Hover effects en todos los botones
- ✅ Animaciones de scale en interacciones
- ✅ Progress bars que responden en tiempo real
- ✅ Toasts de confirmación inmediatos

#### 2. **Progreso Visible**
- 📊 Indicadores de stock con barras de progreso
- 🎯 Barra de envío gratis (si implementada)
- 💰 Contador de ahorro total visible
- 🏆 Puntos a ganar mostrados prominentemente

#### 3. **Recompensas Visuales**
- 🎉 Animaciones de "¡Genial!" al usar puntos
- 💚 Badge verde pulsante de "Total Ahorrado"
- ✨ Sparkles animados en puntos a ganar
- 🛡️ Badges de confianza con iconos premium

#### 4. **Reducción de Fricción**
- 🔄 Edición inline de cantidades sin modales
- ❤️ Mover a wishlist con un clic
- 🎯 Botón "Usar Máximo" para puntos
- 📱 Drawer vs. página completa (más rápido)

#### 5. **Social Proof y Urgencia**
- 👥 "50+ personas lo compraron hoy"
- ⚠️ Badges de "Solo quedan X" pulsantes
- 🔥 "Stock limitado" con indicadores visuales
- ⏰ Estimación de entrega visible

### Animaciones Clave

```typescript
// Entrada de items
"animate-fade-in" // Fade + translate Y

// Confirmación exitosa
"animate-scale-in" // Scale from 0.95 to 1

// Eliminación
"animate-scale-out" // Scale to 0.95 + fade out

// Mover a wishlist
"animate-slide-out-right" // Slide to right + fade

// Pulse para urgencia
"animate-pulse" // Badge de stock bajo

// Hover en items
"hover:scale-[1.02]" // Micro-scale en hover
```

---

## 🔌 Integraciones

### 1. Sistema de Recompensas
**Hooks utilizados**:
- `useRewards()` - Obtiene puntos disponibles
- `useRewardsCalculation()` - Cálculos dinámicos basados en config admin

**Flujo**:
```typescript
// Obtener puntos disponibles
const { availablePoints } = useRewards();

// Calcular máximo uso (config dinámica: 2% del subtotal)
const maxUsablePoints = getMaxUsablePoints(cartTotal, availablePoints);

// Calcular descuento
const pointsDiscount = pointsToDollars(pointsToUse);

// Calcular puntos a ganar (config dinámica: % de compra)
const pointsToEarn = calculateEarningPoints(cartTotal);
```

### 2. Wishlist
**Context utilizado**: `WishlistContext`

**Operaciones**:
```typescript
const { addToWishlist, isInWishlist } = useWishlist();

// Mover de carrito a wishlist
addToWishlist(product);
removeFromCart(product.id);
```

### 3. Envío
**Hook**: `useShippingConfig()`

**Cálculo dinámico**:
```typescript
const { config: shippingConfig, calculateShipping } = useShippingConfig();

const shippingCost = calculateShipping(cartTotal);

// Si envío gratis activado y cumple umbral
{shippingCost === 0 && shippingConfig?.show_free_badge && (
  <FreeShippingBadge />
)}
```

### 4. Traducción
**Hook**: `useTranslatedProduct()`

**Uso**:
```typescript
const { name } = useTranslatedProduct(product);
// Retorna nombre traducido según idioma activo
```

---

## 📊 Métricas y Conversión

### KPIs a Trackear

#### 1. Conversión de Carrito
```typescript
// Eventos a trackear:
- cart_opened
- cart_viewed_time (duración)
- cart_item_added
- cart_item_removed
- cart_item_moved_to_wishlist
- cart_checkout_clicked
- cart_abandoned (si cierra sin checkout)
```

#### 2. Valor de Orden
```typescript
// Métricas:
- average_cart_value
- items_per_cart
- discount_usage_rate (puntos)
- upsell_success_rate (sugerencias IA añadidas)
```

#### 3. Engagement con IA
```typescript
// Eventos:
- ai_suggestions_viewed
- ai_suggestion_clicked
- ai_suggestion_added_to_cart
- ai_suggestion_conversion_rate
```

#### 4. Puntos y Recompensas
```typescript
// Métricas:
- points_usage_rate
- average_points_used_per_order
- max_points_usage_frequency
- points_earned_per_order
```

### Implementación de Tracking (Sugerido)

```typescript
// En WincovaCartDrawer.tsx
useEffect(() => {
  if (isOpen) {
    // Track cart opened
    trackEvent('cart_opened', {
      items_count: cartCount,
      cart_value: cartTotal,
      timestamp: Date.now()
    });
  }
}, [isOpen]);

// En CartSuggestionsPanel.tsx
const handleAddToCart = (product) => {
  addToCart(product, 1);
  
  trackEvent('ai_suggestion_added', {
    product_id: product.id,
    product_name: product.name,
    position_in_suggestions: index,
    cart_value_before: cartTotal,
    timestamp: Date.now()
  });
};
```

---

## 🚀 Guía de Implementación

### Paso 1: Instalar Dependencias
```bash
# Ya instaladas en el proyecto:
- vaul (drawer component)
- lucide-react (icons)
- @tanstack/react-query
- tailwindcss
- shadcn/ui components
```

### Paso 2: Configurar Edge Function
```bash
# La función ya está creada en:
supabase/functions/ai-cart-suggestions/index.ts

# Asegurarse de que LOVABLE_API_KEY esté configurado
# (Auto-provisionado por Lovable Cloud)
```

### Paso 3: Actualizar Navegación
```typescript
// En Header.tsx o donde esté el carrito actual
import { WincovaCartDrawer } from '@/components/WincovaCartDrawer';

// Reemplazar CartSheet con:
<WincovaCartDrawer />
```

### Paso 4: Configurar Rutas de Checkout
```typescript
// Asegurarse de que /checkout esté configurado
// Y pueda recibir query params: pointsUsed, pointsDiscount
```

### Paso 5: Testing

#### Test 1: Flujo Básico
```
1. Añadir productos al carrito
2. Abrir drawer → ✅ Se muestra correctamente
3. Cambiar cantidades → ✅ Se actualiza total
4. Eliminar item → ✅ Animación + actualización
5. Mover a wishlist → ✅ Animación + confirmación
```

#### Test 2: Puntos de Recompensa
```
1. Login como usuario con puntos
2. Abrir carrito → ✅ Sección de puntos visible
3. Ingresar puntos → ✅ Descuento se aplica
4. Usar máximo → ✅ Input se llena correctamente
5. Verificar límite → ✅ No permite más del máximo
```

#### Test 3: Sugerencias IA
```
1. Añadir productos al carrito
2. Esperar sugerencias (debounce 500ms)
3. Verificar que aparecen sugerencias relevantes
4. Añadir sugerencia → ✅ Se añade al carrito
5. Verificar que no se repiten productos ya en carrito
```

#### Test 4: Responsive
```
1. Probar en mobile → ✅ Drawer full-height
2. Probar en tablet → ✅ Layout adaptado
3. Probar en desktop → ✅ Max-width controlado
4. Probar scroll → ✅ Sticky footer funciona
```

---

## 🔒 Seguridad y Validación

### Validaciones Implementadas

#### 1. Stock
```typescript
// Al actualizar cantidad
onClick={() => updateQuantity(item.id, item.quantity + 1)}
disabled={item.quantity >= item.stock}
```

#### 2. Puntos
```typescript
// Al ingresar puntos
const value = parseInt(e.target.value) || 0;
setPointsToUse(Math.min(value, maxUsablePoints));
```

#### 3. Input Sanitization
```typescript
// En edge function
if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
  return error response;
}
```

#### 4. CORS
```typescript
// En edge function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## 📝 Roadmap Futuro

### Fase 2: Checkout Embebido
- [ ] Formulario 3 pasos (datos, pago, confirmación)
- [ ] Integración Stripe Checkout embebido
- [ ] Validación en tiempo real
- [ ] Micro-interacciones en cada paso
- [ ] Badges de confianza (SSL, Stripe, Klarna)

### Fase 3: Optimizaciones Avanzadas
- [ ] A/B testing de sugerencias IA
- [ ] Personalización basada en historial
- [ ] Predicción de abandono de carrito
- [ ] Notificaciones push para carritos abandonados
- [ ] Carrito compartible (link único)

### Fase 4: Analytics y BI
- [ ] Dashboard de conversión en tiempo real
- [ ] Heatmaps de interacciones
- [ ] Funnel analysis automático
- [ ] Recomendaciones de optimización por IA

---

## 🎓 Best Practices

### DO ✅
- Usar animaciones sutiles (<300ms)
- Mostrar feedback inmediato (<100ms)
- Mantener estado sincronizado entre carrito y wishlist
- Validar stock antes de añadir
- Usar semantic tokens de Tailwind
- Implementar loading states
- Añadir ARIA labels para accesibilidad
- Optimizar llamadas a edge functions (debounce)

### DON'T ❌
- No hacer animaciones >500ms
- No bloquear UI mientras carga IA
- No permitir cantidades > stock
- No usar colores hardcoded (usar semantic tokens)
- No hacer llamadas IA sin debounce
- No omitir estados de error
- No ignorar responsive design
- No omitir tracking de eventos

---

## 🆘 Troubleshooting

### Problema: Sugerencias IA no aparecen
**Causa**: LOVABLE_API_KEY no configurado o edge function falla

**Solución**:
1. Verificar que LOVABLE_API_KEY está en Supabase secrets
2. Verificar logs de edge function: `supabase functions logs ai-cart-suggestions`
3. Verificar que fallback rule-based está funcionando
4. Revisar console para errores de fetch

### Problema: Animaciones lentas
**Causa**: Re-renders excesivos o animaciones CSS pesadas

**Solución**:
1. Usar `React.memo()` en componentes pesados
2. Optimizar useEffect dependencies
3. Reducir duración de animaciones
4. Usar `transform` en lugar de `width/height` para animaciones

### Problema: Puntos no se aplican correctamente
**Causa**: Configuración de recompensas incorrecta o cálculo erróneo

**Solución**:
1. Verificar `useRewardsCalculation()` retorna valores correctos
2. Revisar configuración en admin panel
3. Verificar que `maxUsablePoints` está limitado correctamente
4. Log valores intermedios para debug

---

## 📚 Referencias

### Documentación Externa
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Lovable AI Gateway](https://docs.lovable.dev/features/ai)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vaul Drawer](https://vaul.emilkowal.ski/)

### Documentos WINCOVA Relacionados
- `WINCOVA_PRODUCT_PAGE_ENHANCEMENTS.md`
- `WINCOVA_IMAGE_GALLERY_SPECS.md`
- `frontend-modules.yaml`
- `wincova-cart-architecture.yaml` (este documento exportado)

---

## ✅ Checklist de Validación

Antes de considerar el carrito como "PRODUCTION READY":

- [x] Todas las animaciones funcionan suavemente (<300ms)
- [x] Sugerencias IA aparecen y son relevantes
- [x] Fallback rule-based funciona si IA falla
- [x] Puntos se aplican y calculan correctamente
- [x] Wishlist integration funciona sin bugs
- [x] Stock se valida en todo momento
- [x] Responsive funciona en mobile/tablet/desktop
- [x] Accesibilidad (keyboard navigation + ARIA)
- [x] Error handling robusto
- [x] Loading states en todas las async operations
- [ ] Tracking de eventos implementado (siguiente fase)
- [ ] Tests E2E escritos (siguiente fase)
- [ ] Performance optimizado (<2s FCP) (siguiente fase)

---

## 🎉 Conclusión

El **WINCOVA Cart System** representa el estado del arte en carritos de e-commerce, combinando:
- 🤖 **IA avanzada** para maximizar conversión
- 🎨 **Diseño premium** nivel internacional
- 🧠 **Neuroventas** con interacciones dopaminérgicas
- 🛡️ **Confianza absoluta** con badges y seguridad visible
- ⚡ **Rendimiento** near-zero friction

Este sistema está diseñado para ser el **benchmark global** contra el cual se midan todos los demás carritos.

---

**Última actualización**: 2025-11-07  
**Versión**: 1.0.0  
**Estado**: PRODUCTION READY - Módulo Carrito  
**Próximo Sprint**: Checkout Embebido con Stripe
