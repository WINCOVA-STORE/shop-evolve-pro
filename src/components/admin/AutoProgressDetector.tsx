import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { useRoadmapItems } from "@/hooks/useRoadmapItems";
import { toast } from "sonner";

interface DetectedProgress {
  taskId: string;
  taskName: string;
  filesModified: string[];
  completionPercentage: number;
}

export const AutoProgressDetector = () => {
  const { items, updateItemStatus } = useRoadmapItems();
  const [detectedTasks, setDetectedTasks] = useState<DetectedProgress[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulación de detección de archivos modificados
    // En producción, esto se haría mediante webhooks de Git o file watchers
    const detectProgress = () => {
      const tasksInProgress = items.filter(item => 
        item.status === 'in_progress' && 
        item.files_affected && 
        item.files_affected.length > 0
      );

      const detected: DetectedProgress[] = [];

      tasksInProgress.forEach(task => {
        // Aquí iría la lógica real de detección de archivos modificados
        // Por ahora, simulamos con un 80% de probabilidad de detectar cambios
        const filesModified = task.files_affected.filter(() => Math.random() > 0.2);
        
        if (filesModified.length > 0) {
          const completionPercentage = Math.round(
            (filesModified.length / task.files_affected.length) * 100
          );

          if (completionPercentage >= 80 && !dismissed.has(task.id)) {
            detected.push({
              taskId: task.id,
              taskName: task.feature_name,
              filesModified,
              completionPercentage
            });
          }
        }
      });

      setDetectedTasks(detected);
    };

    // Detectar cada 30 segundos
    const interval = setInterval(detectProgress, 30000);
    detectProgress(); // Primera ejecución inmediata

    return () => clearInterval(interval);
  }, [items, dismissed]);

  const handleMarkAsDone = async (taskId: string, taskName: string) => {
    try {
      const result = await updateItemStatus(taskId, 'done', 'Completado automáticamente por detección de cambios');
      
      if (result.success) {
        toast.success(`✅ Tarea "${taskName}" marcada como completada`);
        setDismissed(prev => new Set(prev).add(taskId));
        setDetectedTasks(prev => prev.filter(t => t.taskId !== taskId));
      }
    } catch (error) {
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleDismiss = (taskId: string) => {
    setDismissed(prev => new Set(prev).add(taskId));
    setDetectedTasks(prev => prev.filter(t => t.taskId !== taskId));
  };

  if (detectedTasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {detectedTasks.map(task => (
        <Card key={task.taskId} className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Progreso Detectado
                </h4>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>{task.taskName}</strong> está {task.completionPercentage}% completada
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {task.filesModified.length} de {task.filesModified.length} archivos modificados
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleMarkAsDone(task.taskId, task.taskName)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Hecha
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(task.taskId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};