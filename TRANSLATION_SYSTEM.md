# 🌐 Sistema de Traducción Automática | Automatic Translation System

## 📋 Descripción del Sistema | System Description

### Español 🇪🇸

Este proyecto implementa un **sistema de traducción automática profesional** que elimina la necesidad de traducir manualmente cada elemento nuevo. El sistema funciona en tres capas:

#### 1. **Detección Automática (TranslationGuard)**
- Componente que se ejecuta en **modo desarrollo**
- Detecta texto hardcodeado que no usa el sistema de traducción
- Muestra advertencias visuales cuando encuentra texto sin traducir
- Se ejecuta automáticamente cada vez que cambias de idioma

#### 2. **Auto-Traducción en Tiempo Real (useAutoTranslate)**
- Hook que se ejecuta automáticamente en la aplicación
- Analiza las claves de traducción existentes
- Detecta traducciones faltantes
- Usa IA (Google Gemini) para generar traducciones automáticamente
- Las traducciones generadas se cargan en memoria (runtime)

#### 3. **Edge Function para Contenido Dinámico**
- `detect-missing-translations`: Analiza y genera traducciones faltantes
- `auto-translate-content`: Traduce contenido de base de datos (productos, etc.)
- Se puede llamar manualmente para actualizar archivos de traducción

### Cómo Usar el Sistema

#### Para Desarrolladores:

1. **SIEMPRE usa el sistema de traducción:**
   ```tsx
   // ❌ INCORRECTO
   <h1>Manual de Recuperación</h1>
   
   // ✅ CORRECTO
   const { t } = useTranslation();
   <h1>{t('recovery.title')}</h1>
   ```

2. **Agrega las claves en los archivos de idioma:**
   - `src/i18n/locales/es.json` (español - fuente principal)
   - `src/i18n/locales/en.json` (inglés)
   - Los demás idiomas (fr, pt, zh) se auto-traducen

3. **El sistema detectará automáticamente:**
   - Claves sin traducir en otros idiomas
   - Texto hardcodeado en desarrollo
   - Traducciones faltantes o vacías

#### Modo Desarrollo:

En desarrollo verás alertas cuando:
- Hay texto hardcodeado (no usa `t()`)
- Faltan traducciones en algún idioma
- El conteo de claves es muy bajo

#### Modo Producción:

El sistema NO muestra alertas pero SÍ:
- Auto-genera traducciones faltantes
- Las carga en memoria para uso inmediato
- Registra las traducciones generadas en la consola

### Flujo de Trabajo Recomendado:

1. **Crea nueva página/componente** → Usa `t()` para TODO el texto
2. **Agrega claves en es.json** → El español es tu idioma fuente
3. **Agrega claves en en.json** → El inglés como segundo idioma
4. **Los demás se auto-traducen** → fr, pt, zh se generan automáticamente

### Para Actualizar Archivos de Traducción:

Si quieres persistir las traducciones auto-generadas en los archivos:

```typescript
// En tu código, después de que el sistema detecte faltantes:
const { data } = await supabase.functions.invoke('detect-missing-translations', {
  body: { localeKeys: i18n.store.data }
});

console.log('Traducciones generadas:', data.generatedTranslations);
// Copia estas traducciones a tus archivos .json
```

---

## English 🇺🇸

This project implements a **professional automatic translation system** that eliminates the need to manually translate each new element. The system works in three layers:

#### 1. **Automatic Detection (TranslationGuard)**
- Component that runs in **development mode**
- Detects hardcoded text not using the translation system
- Shows visual warnings when it finds untranslated text
- Runs automatically every time you change language

#### 2. **Real-Time Auto-Translation (useAutoTranslate)**
- Hook that runs automatically in the application
- Analyzes existing translation keys
- Detects missing translations
- Uses AI (Google Gemini) to generate translations automatically
- Generated translations are loaded into memory (runtime)

#### 3. **Edge Function for Dynamic Content**
- `detect-missing-translations`: Analyzes and generates missing translations
- `auto-translate-content`: Translates database content (products, etc.)
- Can be called manually to update translation files

### How to Use the System

#### For Developers:

1. **ALWAYS use the translation system:**
   ```tsx
   // ❌ WRONG
   <h1>Recovery Manual</h1>
   
   // ✅ CORRECT
   const { t } = useTranslation();
   <h1>{t('recovery.title')}</h1>
   ```

2. **Add keys in language files:**
   - `src/i18n/locales/es.json` (Spanish - main source)
   - `src/i18n/locales/en.json` (English)
   - Other languages (fr, pt, zh) auto-translate

3. **The system will automatically detect:**
   - Keys without translations in other languages
   - Hardcoded text in development
   - Missing or empty translations

#### Development Mode:

In development you'll see alerts when:
- There's hardcoded text (not using `t()`)
- Translations are missing in any language
- The key count is very low

#### Production Mode:

The system does NOT show alerts but DOES:
- Auto-generate missing translations
- Load them into memory for immediate use
- Log generated translations to console

### Recommended Workflow:

1. **Create new page/component** → Use `t()` for ALL text
2. **Add keys in es.json** → Spanish is your source language
3. **Add keys in en.json** → English as second language
4. **Others auto-translate** → fr, pt, zh generate automatically

### To Update Translation Files:

If you want to persist auto-generated translations in files:

```typescript
// In your code, after the system detects missing:
const { data } = await supabase.functions.invoke('detect-missing-translations', {
  body: { localeKeys: i18n.store.data }
});

console.log('Generated translations:', data.generatedTranslations);
// Copy these translations to your .json files
```

---

## 🔧 Archivos del Sistema | System Files

- `src/hooks/useAutoTranslate.ts` - Auto-detection and translation hook
- `src/components/TranslationGuard.tsx` - Development-mode guard component
- `supabase/functions/detect-missing-translations/index.ts` - Edge function for analysis
- `supabase/functions/auto-translate-content/index.ts` - Edge function for DB content

---

## 💡 Ventajas | Benefits

✅ **Automático** - No necesitas recordar traducir cada cambio  
✅ **Inteligente** - Usa IA para generar traducciones naturales  
✅ **Preventivo** - Te avisa en desarrollo si algo no está traducido  
✅ **Profesional** - Mantiene consistencia y calidad en todas las traducciones  
✅ **Escalable** - Funciona con cualquier número de idiomas
