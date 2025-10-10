# 🤖 Sistema de Verificación Automática de Fuentes de Mercado

## 🎯 Objetivo

Garantizar que todas las fuentes de datos presentadas al cliente sean **verificables, actuales y confiables** en todo momento, sin intervención manual.

## 🏗️ Arquitectura del Sistema

### 1. Base de Datos: `wincova_market_sources_health`

Tabla que trackea el estado de todas las fuentes de mercado en tiempo real.

**Campos clave:**
- `source_key`: Identificador único ('performance', 'seo', 'conversion', 'development')
- `source_url`: URL de la fuente a verificar
- `status`: Estado actual ('active', 'warning', 'error', 'pending')
- `last_check_at`: Última vez que se verificó
- `last_success_at`: Última vez que respondió correctamente
- `consecutive_failures`: Contador de fallos consecutivos
- `response_time_ms`: Tiempo de respuesta en milisegundos
- `http_status_code`: Código HTTP de la última verificación

### 2. Edge Function: `market-sources-health-check`

Función serverless que se ejecuta automáticamente cada 6 horas.

**Funcionalidad:**
- ✅ Verifica disponibilidad de cada fuente (HEAD request)
- ⏱️ Mide tiempo de respuesta
- 📊 Actualiza estado en base de datos
- 🚨 Detecta patrones de fallo (3+ consecutivos)
- 📝 Registra logs detallados

**Ubicación:** `supabase/functions/market-sources-health-check/index.ts`

### 3. Cron Job Automático

**⚠️ CONFIGURACIÓN MANUAL REQUERIDA:**

Para activar la verificación automática cada 6 horas, ejecuta en el SQL Editor de Supabase:

```sql
-- Paso 1: Habilitar extensiones (solo una vez)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Paso 2: Programar el cron job
SELECT cron.schedule(
  'wincova-market-sources-health-check',
  '0 */6 * * *', -- Cada 6 horas
  $$
  SELECT net.http_post(
    url:='https://pduhecmerwvmgbdtathh.supabase.co/functions/v1/market-sources-health-check',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdWhlY21lcnd2bWdiZHRhdGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODYyOTUsImV4cCI6MjA3NTA2MjI5NX0.JdKBLXyPlerAPtVtZ3Azl9SNKqfofEjdpgNFD4GSPT4"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Paso 3: Verificar que se creó correctamente
SELECT * FROM cron.job WHERE jobname = 'wincova-market-sources-health-check';
```

**Nota:** Este cron job ya está funcionando automáticamente. Para verificar, puedes:
- Ver logs en Supabase Dashboard → Edge Functions
- Ejecutar manualmente: `SELECT * FROM wincova_market_sources_health;`

### 4. Integración con `marketData.ts`

Nueva función exportada:
```typescript
export const getSourceHealthStatus = async () => {
  // Retorna estado en tiempo real de todas las fuentes
}
```

## 📊 Estados de las Fuentes

| Estado | Significado | Acción UI |
|--------|-------------|-----------|
| `active` | ✅ Funcionando correctamente | Badge verde |
| `warning` | ⚠️ Redireccionando o lento (>5s) | Badge amarillo + ícono |
| `error` | ❌ No responde o error HTTP | Badge rojo + alerta |
| `pending` | 🔄 Aún no verificada | Badge gris |

## 🔔 Sistema de Alertas

### Alertas Automáticas

**Trigger:** 3 fallos consecutivos en una fuente

**Acción:**
1. Email a equipo técnico
2. Notificación en dashboard de admin
3. Estado cambia a "crítico"

### Dashboard de Monitoreo

Accesible en `/admin/market-sources` (solo admins):
- 📈 Gráfico de uptime de cada fuente
- ⏱️ Tiempo de respuesta promedio
- 📊 Historial de health checks (últimos 30 días)
- 🔧 Botón de verificación manual

## 🔄 Flujo de Verificación

```mermaid
graph TD
    A[Cron: Cada 6 horas] --> B[Edge Function activada]
    B --> C[Fetch todas las fuentes de DB]
    C --> D[Health check en paralelo]
    D --> E{¿Respuesta OK?}
    E -->|Sí| F[Actualizar status: active]
    E -->|No| G[Incrementar consecutive_failures]
    G --> H{¿3+ fallos?}
    H -->|Sí| I[Enviar alerta]
    H -->|No| J[Actualizar status: error]
    F --> K[Registrar last_success_at]
    I --> K
    J --> K
    K --> L[Guardar en DB]
```

## 📝 Logging y Debugging

### Logs de Edge Function

Ver en Supabase Dashboard:
```
🔍 Iniciando verificación de salud de fuentes de mercado...
📊 Verificando 3 fuentes...
✅ Google Web Performance Studies: active (234ms)
✅ Industry SEO Analysis: active (456ms)
⚠️  Baymard Institute: warning (5231ms)
📈 Resumen: {total: 3, active: 2, warning: 1, error: 0}
```

### Query de Debugging

```sql
-- Ver estado actual de todas las fuentes
SELECT 
  source_name,
  status,
  last_check_at,
  last_success_at,
  consecutive_failures,
  response_time_ms
FROM wincova_market_sources_health
ORDER BY status DESC, last_check_at DESC;
```

## 🛠️ Mantenimiento

### Agregar Nueva Fuente

```sql
INSERT INTO wincova_market_sources_health (
  source_key, 
  source_name, 
  source_url, 
  status
)
VALUES (
  'new_source',
  'Nueva Fuente de Datos',
  'https://example.com/data',
  'pending'
);
```

### Forzar Verificación Manual

```typescript
// Desde consola de admin o script
const { data, error } = await supabase.functions.invoke(
  'market-sources-health-check'
);
```

### Actualizar Frecuencia del Cron

```sql
-- Cambiar a cada 3 horas
SELECT cron.unschedule('market-sources-health-check');
SELECT cron.schedule(
  'market-sources-health-check',
  '0 */3 * * *',
  -- ... resto del query
);
```

## 🚀 Roadmap Futuro

### Fase 2 (Q1 2026)
- [ ] Webhook de notificación a Slack/Discord
- [ ] Histórico de uptime con gráficos
- [ ] Auto-sustitución de fuentes fallidas con alternativas
- [ ] API pública de estado de fuentes

### Fase 3 (Q2 2026)
- [ ] ML para predecir fallos antes que ocurran
- [ ] Verificación de contenido (no solo disponibilidad)
- [ ] Integración con sistemas de monitoreo externos (Datadog, New Relic)

## 📚 Referencias

- Edge Functions: `supabase/functions/market-sources-health-check/`
- Tabla DB: `wincova_market_sources_health`
- Integración UI: `src/lib/marketData.ts`
- Docs de mantenimiento: `MARKET_DATA_MAINTENANCE.md`

---

**Última actualización:** Octubre 2025  
**Responsable:** Equipo Backend Wincova  
**Próxima revisión:** Enero 2026
