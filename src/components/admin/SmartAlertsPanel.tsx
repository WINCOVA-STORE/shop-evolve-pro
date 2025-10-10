import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoadmapItem } from "@/hooks/useRoadmapItems";
import { 
  AlertTriangle, 
  Clock, 
  Target,
  UserX,
  Link2,
  TrendingDown,
  Bell,
  ExternalLink
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface SmartAlertsPanelProps {
  items: RoadmapItem[];
  onFilterChange?: (status?: string, priority?: string) => void;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  taskId?: string;
  taskName?: string;
  actionable: boolean;
}

export const SmartAlertsPanel = ({ items, onFilterChange }: SmartAlertsPanelProps) => {
  const { toast } = useToast();

  const handleViewAlert = (alert: Alert) => {
    if (alert.taskId) {
      // Scroll to the specific task
      const taskElement = document.getElementById(`task-${alert.taskId}`);
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        taskElement.classList.add('ring-2', 'ring-orange-500', 'ring-offset-2');
        setTimeout(() => {
          taskElement.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-2');
        }, 3000);
      } else {
        toast({
          title: "Tarea no visible",
          description: "Ajusta los filtros para ver esta tarea",
          variant: "destructive",
        });
      }
    } else if (alert.id === 'unassigned-high' && onFilterChange) {
      // Filter by high/critical priority and todo status
      onFilterChange('todo', 'high');
      toast({
        title: "✅ Filtro aplicado",
        description: "Scroll abajo para ver el filtro de prioridad HIGH activado. Las tareas se muestran más abajo.",
      });
    } else if (alert.id === 'unresolved-deps') {
      toast({
        title: "Revisar dependencias",
        description: "Busca las tareas con el badge 🔗 azul de dependencias",
      });
    } else if (alert.id === 'unmitigated-risks') {
      toast({
        title: "Revisar riesgos",
        description: "Busca las tareas con el badge ⚠️ naranja de riesgos",
      });
    }
  };

  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    // 1. Tareas bloqueadas por más de 3 días
    const now = new Date();
    items
      .filter(item => item.status === 'blocked')
      .forEach(item => {
        const blockedDate = item.updated_at ? new Date(item.updated_at) : now;
        const daysBlocked = differenceInDays(now, blockedDate);
        
        if (daysBlocked >= 3) {
          alerts.push({
            id: `blocked-${item.id}`,
            type: 'critical',
            category: '🚫 Bloqueada',
            title: `Tarea bloqueada ${daysBlocked} días`,
            description: `"${item.feature_name}" está bloqueada: ${item.blocked_reason || 'Sin razón especificada'}`,
            icon: <AlertTriangle className="h-4 w-4" />,
            taskId: item.id,
            taskName: item.feature_name,
            actionable: true,
          });
        }
      });

    // 2. Tareas de alta prioridad sin asignar
    const unassignedHighPriority = items.filter(
      item => (item.priority === 'critical' || item.priority === 'high') 
        && !item.assigned_to 
        && item.status === 'todo'
    );
    
    if (unassignedHighPriority.length > 0) {
      alerts.push({
        id: 'unassigned-high',
        type: 'warning',
        category: '👤 Sin Asignar',
        title: `${unassignedHighPriority.length} tareas prioritarias sin asignar`,
        description: `Hay tareas CRITICAL/HIGH sin responsable. Esto puede retrasar el proyecto.`,
        icon: <UserX className="h-4 w-4" />,
        actionable: true,
      });
    }

    // 3. Tareas en progreso por más de 7 días
    items
      .filter(item => item.status === 'in_progress' && item.started_at)
      .forEach(item => {
        const startDate = new Date(item.started_at!);
        const daysInProgress = differenceInDays(now, startDate);
        const estimatedHours = item.metadata?.estimated_hours || 8;
        const expectedDays = Math.ceil(estimatedHours / 8);
        
        if (daysInProgress > expectedDays * 2) {
          alerts.push({
            id: `stalled-${item.id}`,
            type: 'warning',
            category: '⏱️ Estancada',
            title: `Tarea en progreso ${daysInProgress} días`,
            description: `"${item.feature_name}" lleva ${daysInProgress} días (esperado: ${expectedDays} días)`,
            icon: <Clock className="h-4 w-4" />,
            taskId: item.id,
            taskName: item.feature_name,
            actionable: true,
          });
        }
      });

    // 4. Dependencias no resueltas
    const tasksWithUnresolvedDeps = items.filter(item => {
      if (!item.metadata?.dependencies || item.metadata.dependencies.length === 0) return false;
      
      // Verificar si alguna dependencia no está completada
      const hasPendingDeps = item.metadata.dependencies.some((dep: string) => {
        // Buscar si hay tareas que contengan este texto en su nombre
        return !items.some(
          i => i.feature_name.toLowerCase().includes(dep.toLowerCase()) 
            && i.status === 'done'
        );
      });
      
      return hasPendingDeps && item.status !== 'blocked';
    });

    if (tasksWithUnresolvedDeps.length > 0) {
      alerts.push({
        id: 'unresolved-deps',
        type: 'warning',
        category: '🔗 Dependencias',
        title: `${tasksWithUnresolvedDeps.length} tareas con dependencias pendientes`,
        description: 'Hay tareas que dependen de otras que aún no están completadas.',
        icon: <Link2 className="h-4 w-4" />,
        actionable: true,
      });
    }

    // 5. Riesgos identificados sin mitigar
    const tasksWithRisks = items.filter(
      item => item.metadata?.risks 
        && item.metadata.risks.length > 0 
        && item.status !== 'done'
    );

    if (tasksWithRisks.length > 0) {
      alerts.push({
        id: 'unmitigated-risks',
        type: 'warning',
        category: '⚠️ Riesgos',
        title: `${tasksWithRisks.length} tareas con riesgos identificados`,
        description: 'La IA detectó riesgos técnicos o de negocio que requieren atención.',
        icon: <AlertTriangle className="h-4 w-4" />,
        actionable: true,
      });
    }

    // 6. Velocidad baja (menos del 50% de tareas completadas)
    const totalTasks = items.length;
    const completedTasks = items.filter(i => i.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (completionRate < 30 && totalTasks > 10) {
      alerts.push({
        id: 'low-velocity',
        type: 'info',
        category: '📉 Velocidad',
        title: 'Velocidad del proyecto baja',
        description: `Solo ${completionRate.toFixed(0)}% de tareas completadas. Considera revisar prioridades.`,
        icon: <TrendingDown className="h-4 w-4" />,
        actionable: false,
      });
    }

    // Ordenar por criticidad
    return alerts.sort((a, b) => {
      const priority = { critical: 0, warning: 1, info: 2 };
      return priority[a.type] - priority[b.type];
    });
  };

  const alerts = generateAlerts();
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    }
  };

  const getAlertBadge = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <Badge className="bg-red-600">CRÍTICO</Badge>;
      case 'warning':
        return <Badge className="bg-orange-600">ADVERTENCIA</Badge>;
      case 'info':
        return <Badge className="bg-blue-600">INFO</Badge>;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-600">✅ Todo bajo control</CardTitle>
          </div>
          <CardDescription>
            No hay alertas activas. El proyecto avanza según lo esperado.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <CardTitle>🔔 Alertas Inteligentes</CardTitle>
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-600">
                {criticalCount} Críticas
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-orange-600">
                {warningCount} Advertencias
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Sistema de monitoreo automático que detecta problemas antes de que impacten el proyecto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${getAlertColor(alert.type)} space-y-2`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{alert.icon}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {alert.category}
                    </span>
                    {getAlertBadge(alert.type)}
                  </div>
                  <h4 className="font-semibold">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                  {alert.taskName && (
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      📋 Tarea: {alert.taskName}
                    </p>
                  )}
                </div>
              </div>
              {alert.actionable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => handleViewAlert(alert)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
