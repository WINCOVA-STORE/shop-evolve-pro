# Sistema de Gestión Inteligente del Roadmap con IA

## 🎯 Descripción General

Sistema completo de gestión automatizada del roadmap e-commerce de Wincova con capacidades de IA para generar tareas, detección automática de progreso y gestión manual flexible.

## 🚀 Características Principales

### 1. **Generador de Tareas con IA** 🤖

Convierte descripciones en lenguaje natural en tareas técnicas detalladas automáticamente.

**Cómo usar:**
1. Describe la funcionalidad que deseas agregar (ejemplo: "Quiero modelo 3D con fotos del cliente")
2. Selecciona si agregar a fase existente o crear nueva fase
3. La IA genera 3-5 tareas técnicas con:
   - Descripción detallada
   - Archivos afectados
   - Criterios de aceptación
   - Prioridad, esfuerzo e impacto
   - Estimación de sprint

**Tecnología:** Lovable AI (Gemini 2.5 Flash)

**Ejemplo de output:**
```json
{
  "phase": { "number": 2, "name": "Experiencia Visual" },
  "tasks": [
    {
      "feature_name": "Modelo 3D Interactivo",
      "priority": "high",
      "effort": "high",
      "impact": "high",
      "files_affected": [
        "src/components/3DViewer.tsx",
        "src/hooks/use3DModel.ts"
      ]
    }
  ]
}
```

### 2. **Detección Automática de Progreso** 📊

El sistema detecta automáticamente cuando archivos mencionados en `files_affected` son modificados y sugiere marcar tareas como completadas.

**Funcionamiento:**
- Monitorea tareas en progreso cada 30 segundos
- Compara archivos modificados vs `files_affected`
- Si 80%+ de archivos están modificados → Sugiere completar tarea
- Un click para aprobar y marcar como "Done"

**Beneficios:**
- Ahorra tiempo en actualización manual
- Mantiene roadmap sincronizado con el código real
- Visibilidad instantánea del progreso

### 3. **Gestión Manual Flexible** ✏️

#### Agregar Tarea Manual
Botón "Nueva Tarea" en cada fase permite:
- Crear tareas específicas sin IA
- Definir sprint, prioridad, esfuerzo, impacto
- Agregar descripción detallada

#### Editar Tareas Existentes
- Cambiar status (Todo → In Progress → Done)
- Agregar notas al bloquear/completar
- Asignar responsables

## 📁 Estructura de Archivos

```
supabase/functions/
  ai-generate-roadmap-tasks/
    index.ts                    # Edge function para generación con IA

src/components/admin/
  AITaskGenerator.tsx           # Interfaz de generación con IA
  AddTaskDialog.tsx             # Diálogo para tareas manuales
  AutoProgressDetector.tsx      # Detección automática de progreso
  RoadmapItemCard.tsx           # Card individual de tarea
  RoadmapProgressCard.tsx       # Card de progreso general

src/pages/admin/
  EcommerceRoadmap.tsx          # Dashboard principal del roadmap

src/hooks/
  useRoadmapItems.ts            # Hook para gestión de tareas
```

## 🔧 Configuración Técnica

### Edge Function Setup
```toml
# supabase/config.toml
[functions.ai-generate-roadmap-tasks]
verify_jwt = true
```

### Base de Datos
Tabla: `ecommerce_roadmap_items`

Campos clave:
- `phase_number`: Número de fase (1-5)
- `phase_name`: Nombre de la fase
- `sprint_number`: Sprint (ej: "1.1")
- `feature_name`: Nombre de la tarea
- `status`: todo | in_progress | done | blocked
- `files_affected`: Array de archivos
- `acceptance_criteria`: Criterios de aceptación
- `metadata`: Metadatos (ej: generado por IA)

### Secrets Requeridos
- `LOVABLE_API_KEY`: Auto-provisto por Lovable Cloud

## 💡 Casos de Uso

### Caso 1: Feature Nueva con IA
**Descripción:** "Quiero sistema de cupones de descuento con límite por usuario"

**Proceso:**
1. Abrir `/admin/ecommerce-roadmap`
2. Escribir descripción en "Generador de Tareas con IA"
3. Seleccionar "Agregar a fase existente" → Fase 1
4. Click "Generar Tareas"
5. IA crea 4 tareas:
   - Backend: Tabla de cupones
   - Frontend: Componente de aplicación de cupón
   - Lógica: Validación de uso por usuario
   - Testing: Casos de prueba

**Resultado:** 4 tareas listas para implementar en ~30 segundos

### Caso 2: Tarea Manual Específica
**Necesidad:** Agregar validación específica no detectada por IA

**Proceso:**
1. Ir a la fase correspondiente
2. Click "Nueva Tarea"
3. Completar formulario:
   - Nombre: "Validación de correo único"
   - Sprint: 1.2
   - Prioridad: High
   - Esfuerzo: Low
4. Guardar

**Resultado:** Tarea manual agregada en 1 minuto

### Caso 3: Detección Automática
**Escenario:** Implementaste filtros de búsqueda

**Proceso:**
1. Sistema detecta modificación de `SearchFilters.tsx`
2. Aparece notificación: "Búsqueda Avanzada está 80% completada"
3. Click "Marcar como Hecha"
4. Tarea se marca como Done automáticamente

**Resultado:** Roadmap actualizado sin intervención manual

## 📊 Métricas y Analytics

### Dashboard Principal Muestra:
- **Progreso General**: % completado de todas las fases
- **Tareas por Status**: Todo | In Progress | Done | Blocked
- **Progreso por Fase**: Visual de cada fase

### Filtros Disponibles:
- Por estado (todo, in_progress, done, blocked)
- Por fase (1-5)
- Vista agregada o por fase individual

## 🎨 UI/UX

### Componentes Visuales:
- **Card de Progreso**: Barra visual + métricas clave
- **Generador IA**: Card destacado con gradiente morado-rosa
- **Detector Auto**: Notificaciones azules cuando detecta progreso
- **Cards de Tareas**: Expandibles con todos los detalles

### Estados Visuales:
- ✅ Done: Verde
- 🔄 In Progress: Amarillo
- 📋 Todo: Gris
- 🚫 Blocked: Rojo

## 🔒 Seguridad

- Edge function requiere JWT (usuarios autenticados)
- Políticas RLS en tablas del roadmap
- Solo admins pueden gestionar roadmap

## 🚦 Próximos Pasos

### Fase Actual: ✅ Sistema Base Completo
- [x] Generación con IA
- [x] Detección automática
- [x] Gestión manual
- [x] Dashboard visual

### Mejoras Futuras:
- [ ] Integración con Git webhooks (progreso real en tiempo real)
- [ ] Notificaciones por email/Slack
- [ ] Estimaciones de tiempo automáticas
- [ ] Analytics predictivos de finalización
- [ ] Exportar a PDF/Excel

## 📖 Documentación Adicional

- **API Reference**: Ver `supabase/functions/ai-generate-roadmap-tasks/index.ts`
- **Database Schema**: Ver `ECOMMERCE_ROADMAP.md`
- **Hooks**: Ver `src/hooks/useRoadmapItems.ts`

## 🎓 Tips de Uso

1. **Sé específico con IA**: Mejores descripciones = mejores tareas
2. **Usa detección auto**: Marca tareas en progreso para que el sistema detecte
3. **Revisa archivos afectados**: Asegúrate que sean correctos para detección
4. **Actualiza regularmente**: Usa el botón "Actualizar" para ver cambios
5. **Filtra inteligentemente**: Usa filtros para focalizar en lo importante

## 🤝 Contribución

Este sistema es parte del proyecto Wincova y fue diseñado para escalar a otros proyectos e-commerce.

---

**Versión:** 1.0.0  
**Última actualización:** 2025  
**Contacto:** Equipo Elite Wincova