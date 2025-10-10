# 📊 Guía de Mantenimiento: Sistema de Datos de Mercado

## 🤖 Actualización Automática

El archivo `src/lib/marketData.ts` está diseñado para **actualizarse automáticamente** sin necesidad de intervención manual cada año.

### ¿Cómo Funciona?

```javascript
const currentYear = new Date().getFullYear(); // Obtiene año actual del sistema
const lastYear = currentYear - 1; // Calcula año anterior automáticamente
```

### Ejemplos de Comportamiento Automático

| Fecha del Sistema | currentYear | lastYear | Rango Mostrado |
|-------------------|-------------|----------|----------------|
| Enero 2025        | 2025        | 2024     | "2024-2025"    |
| Diciembre 2025    | 2025        | 2024     | "2024-2025"    |
| Enero 2026        | 2026        | 2025     | "2025-2026"    |
| Enero 2030        | 2030        | 2029     | "2029-2030"    |

**No se requiere edición del código cada año** ✅

---

## 📅 Cronograma de Revisiones

### Revisión Trimestral (Cada 3 meses)
**Responsable:** Equipo de datos
**Tiempo estimado:** 30 minutos

**Verificar:**
1. ✅ URLs de fuentes siguen activas
2. ✅ No hay estudios más recientes disponibles
3. ✅ Fórmulas de cálculo siguen siendo válidas

**Acción si cambió algo:**
- Actualizar solo la sección `MARKET_SOURCES` con nuevos datos
- Mantener la estructura dinámica de años intacta

### Revisión Anual (Una vez al año)
**Responsable:** Lead técnico
**Tiempo estimado:** 2 horas

**Tareas:**
1. Verificar que las metodologías de estudios no hayan cambiado significativamente
2. Revisar si hay nuevas fuentes más confiables
3. Validar que los precios de mercado sigan en el rango correcto
4. Actualizar este documento con fecha de última revisión

---

## 🔧 Cuándo SE Requiere Edición Manual

### Caso 1: Nueva Fuente de Datos Más Confiable
Si encuentras un estudio más reciente o confiable:

```javascript
// ANTES
performance: {
  name: "Google Web Performance Studies",
  // ...
},

// DESPUÉS (ejemplo)
performance: {
  name: "Google Core Web Vitals 2026 Report", // Actualizar nombre
  // Actualizar keyFindings con nuevos datos
},
```

### Caso 2: Cambio en Metodología de Cálculo
Si los estudios demuestran que las fórmulas necesitan ajuste:

```javascript
// ANTES
performanceImpact: (score: number): number => {
  if (score >= 90) return 0;
  return Math.round(((90 - score) / 10) * 7);
},

// DESPUÉS (ejemplo si nueva investigación muestra diferente impacto)
performanceImpact: (score: number): number => {
  if (score >= 90) return 0;
  return Math.round(((90 - score) / 10) * 8.5); // Nueva investigación mostró 8.5%
},
```

### Caso 3: Actualización de Rangos de Precios
Si los precios de mercado cambian significativamente:

```javascript
// Actualizar valores en development.keyFindings
'SEO': { 
  low: 2500,  // Ajustar si el mercado cambió
  high: 5000, // Ajustar si el mercado cambió
  avg: 3750,  // Recalcular promedio
  source: 'Fuente actualizada'
},
```

---

## ⚠️ LO QUE NUNCA DEBES HACER

❌ **NO cambies el cálculo de `currentYear` y `lastYear`**
```javascript
// ❌ MAL - Hardcodear años
const currentYear = 2025; 

// ✅ BIEN - Dejar dinámico
const currentYear = new Date().getFullYear();
```

❌ **NO agregues años fijos en los strings de UI**
```javascript
// ❌ MAL
name: "Google Study (2024)"

// ✅ BIEN
name: "Google Web Performance Studies",
years: `${lastYear}-${currentYear}`, // Se actualiza solo
```

❌ **NO cambies la estructura de retorno de funciones**
Las interfaces TypeScript dependen de esta estructura

---

## 🔍 Cómo Verificar que Funciona

### Test Manual Rápido
1. Abre DevTools Console
2. Ejecuta:
```javascript
console.log(new Date().getFullYear()); // Debe mostrar año actual
```
3. Verifica que en la UI se muestre el rango correcto (ej: "2024-2025" en 2025)

### Test de Componentes
Navega a `/wincova/diagnosis/[id]` y verifica:
- ✅ Modal "Metodología" muestra años correctos
- ✅ Modal "Fuentes" muestra años correctos
- ✅ Tooltips muestran "Última actualización: Q[X] [año]"
- ✅ No hay años hardcodeados visibles

---

## 📝 Historial de Revisiones

| Fecha | Revisor | Cambios Realizados | Próxima Revisión |
|-------|---------|-------------------|------------------|
| 2025-10-10 | Sistema | Implementación inicial del sistema dinámico | 2026-01-10 |
| | | | |

---

## 🆘 Soporte

Si necesitas ayuda con el mantenimiento de este sistema:
- 📧 Email: dev@wincova.com
- 📚 Documentación técnica: `/docs/market-data-system.md`
- 🐛 Reportar bugs: GitHub Issues

---

**Última actualización de este documento:** Octubre 2025
**Próxima revisión programada:** Enero 2026
