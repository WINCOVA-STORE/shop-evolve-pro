# Sistema Multi-Idioma - Guía de Integración

## 📋 Resumen

El sistema multi-idioma está implementado y listo para usar. Los productos se mostrarán automáticamente en el idioma seleccionado por el usuario (ES, FR, PT, ZH), con fallback a inglés si no hay traducción disponible.

## 🗄️ Estructura de Base de Datos

### Tabla `products` - Nuevas Columnas

```sql
-- Nombres traducidos
name_es     TEXT  -- Español
name_fr     TEXT  -- Francés
name_pt     TEXT  -- Portugués
name_zh     TEXT  -- Chino

-- Descripciones traducidas
description_es     TEXT  -- Español
description_fr     TEXT  -- Francés
description_pt     TEXT  -- Portugués
description_zh     TEXT  -- Chino

-- Las columnas originales sirven como inglés (en)
name               TEXT  -- Inglés (default)
description        TEXT  -- Inglés (default)
```

## 🔄 Flujo de Trabajo Recomendado

### Para Productos de Spocket

```
1. Importar producto desde Spocket (inglés)
   ↓
2. Tu sistema de optimización procesa el producto
   ↓
3. DURANTE LA OPTIMIZACIÓN:
   - Optimiza el contenido en inglés
   - Traduce a los 4 idiomas restantes
   - Guarda todo en la base de datos
   ↓
4. Frontend muestra la versión según idioma del usuario
```

### Para Productos Manuales

```
1. Agregar producto manualmente (cualquier idioma)
   ↓
2. Traducir automáticamente a los otros idiomas
   ↓
3. Revisar/editar traducciones si es necesario
   ↓
4. Publicar
```

## 🤖 Integrar Traducción en tu Automatización

### Opción A: Usar Lovable AI (Recomendado)

```typescript
// En tu edge function de optimización
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { productData } = await req.json();
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  // 1. Optimiza el contenido en inglés
  const optimizedContent = await optimizeProduct(productData);
  
  // 2. Traduce a los 4 idiomas
  const translations = await Promise.all([
    translateToLanguage(optimizedContent.name, optimizedContent.description, 'es', LOVABLE_API_KEY),
    translateToLanguage(optimizedContent.name, optimizedContent.description, 'fr', LOVABLE_API_KEY),
    translateToLanguage(optimizedContent.name, optimizedContent.description, 'pt', LOVABLE_API_KEY),
    translateToLanguage(optimizedContent.name, optimizedContent.description, 'zh', LOVABLE_API_KEY),
  ]);
  
  // 3. Guarda en la base de datos
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: optimizedContent.name,              // inglés
      description: optimizedContent.description, // inglés
      name_es: translations[0].name,
      description_es: translations[0].description,
      name_fr: translations[1].name,
      description_fr: translations[1].description,
      name_pt: translations[2].name,
      description_pt: translations[2].description,
      name_zh: translations[3].name,
      description_zh: translations[3].description,
      // ... otros campos
    });
    
  return new Response(JSON.stringify({ success: true }));
});

async function translateToLanguage(name: string, description: string, targetLang: string, apiKey: string) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `You are a professional e-commerce translator. Translate product content to ${targetLang}. 
                   Maintain marketing tone, keep brand names unchanged, and optimize for SEO.
                   Return ONLY a JSON object with "name" and "description" fields.`
        },
        {
          role: 'user',
          content: `Translate this product:\nName: ${name}\nDescription: ${description}`
        }
      ],
    }),
  });
  
  const data = await response.json();
  const translatedText = data.choices[0].message.content;
  
  // Parse the JSON response
  const translated = JSON.parse(translatedText);
  return {
    name: translated.name,
    description: translated.description
  };
}
```

### Opción B: MyMemory Translation API (Gratis, 10K/día)

```typescript
async function translateWithMyMemory(text: string, targetLang: string) {
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
  );
  const data = await response.json();
  return data.responseData.translatedText;
}

// Uso:
const nameEs = await translateWithMyMemory(product.name, 'es');
const descEs = await translateWithMyMemory(product.description, 'es');
```

## 📊 Formato de Inserción de Productos

### Ejemplo Completo

```typescript
const productData = {
  // Campos básicos
  id: "uuid-here",
  sku: "PROD-001",
  price: 99.99,
  compare_at_price: 129.99,
  stock: 50,
  is_active: true,
  images: ["url1", "url2"],
  tags: ["new", "featured"],
  
  // Contenido en inglés (default)
  name: "Premium Wireless Headphones",
  description: "Experience crystal-clear audio with our premium wireless headphones...",
  
  // Traducciones
  name_es: "Auriculares Inalámbricos Premium",
  description_es: "Experimenta audio cristalino con nuestros auriculares inalámbricos premium...",
  
  name_fr: "Écouteurs Sans Fil Premium",
  description_fr: "Découvrez un son cristallin avec nos écouteurs sans fil premium...",
  
  name_pt: "Fones de Ouvido Sem Fio Premium",
  description_pt: "Experimente áudio cristalino com nossos fones de ouvido sem fio premium...",
  
  name_zh: "高级无线耳机",
  description_zh: "使用我们的高级无线耳机体验水晶般清晰的音频...",
};
```

## 🎯 Frontend - Cómo Funciona

### Automático

El frontend YA está configurado. Los componentes `ProductCard` y `ProductDetail` usan el hook `useTranslatedProduct` que:

1. Detecta el idioma actual del usuario
2. Lee la columna correspondiente de la base de datos
3. Hace fallback a inglés si no hay traducción
4. Actualiza automáticamente cuando el usuario cambia de idioma

### No Requiere Cambios

Los desarrolladores frontend NO necesitan hacer nada especial. El sistema funciona automáticamente.

## ✅ Panel de Administración (Futuro)

Para facilitar la gestión, se puede crear un panel donde:

1. Ver todos los productos y su estado de traducción
2. Ver qué idiomas están completos para cada producto
3. Editar manualmente cualquier traducción
4. Re-traducir productos masivamente
5. Ver preview en cada idioma

## 🔍 Verificación

### Consulta SQL para Ver Traducciones

```sql
-- Ver un producto con todas sus traducciones
SELECT 
  id,
  name,        -- inglés
  name_es,     -- español
  name_fr,     -- francés
  name_pt,     -- portugués
  name_zh      -- chino
FROM products
WHERE id = 'product-id-here';
```

### Verificar en Frontend

1. Abre tu app
2. Cambia el idioma en el selector
3. Los productos deben cambiar automáticamente
4. Si no hay traducción, se muestra en inglés

## 💡 Mejores Prácticas

### 1. Traduce Durante la Optimización
- **NO** traduzcas productos viejos todos a la vez (costoso)
- **SÍ** traduce nuevos productos durante su procesamiento
- Consolida optimización + traducción en 1 proceso

### 2. Cache y Reutilización
- Si un producto ya tiene traducciones, no las re-traduzcas
- Guarda traducciones comunes (marcas, términos técnicos)

### 3. Calidad > Cantidad
- Es mejor 100 productos bien traducidos que 1000 mal traducidos
- Revisa traducciones de productos principales
- Usa traducciones automáticas para productos secundarios

### 4. SEO
- Las traducciones mejoran el SEO en cada idioma
- Google indexa el contenido traducido
- Usuarios encuentran productos en su idioma nativo

## 🚀 Próximos Pasos

1. **Integra la traducción en tu sistema de optimización**
   - Modifica tu edge function de optimización
   - Agrega llamadas a API de traducción
   - Guarda todo en las nuevas columnas

2. **Prueba con 1-2 productos**
   - Inserta productos con traducciones manualmente
   - Verifica que se muestran correctamente en cada idioma

3. **Escala gradualmente**
   - Una vez confirmado que funciona
   - Habilita traducción automática para todos los productos nuevos

4. **Monitorea costos** (si usas Lovable AI)
   - Revisa el uso de créditos
   - Si excedes free tier, considera MyMemory para productos menos importantes

## 📞 Soporte

Si tienes preguntas sobre la implementación:
1. Revisa este documento
2. Verifica los ejemplos de código
3. Prueba con productos de prueba primero
4. Escala gradualmente

---

**Sistema implementado y listo para usar.** 🎉
