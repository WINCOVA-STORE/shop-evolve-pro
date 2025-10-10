import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, AlertCircle, Brain } from "lucide-react";
import { useRoadmapItems } from "@/hooks/useRoadmapItems";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DetectedProgress {
  taskId: string;
  taskName: string;
  filesModified: string[];
  completionPercentage: number;
  aiVerified?: boolean;
  missingItems?: string[];
  needsManualReview?: boolean;
}

export const AutoProgressDetector = () => {
  const { items, updateItemStatus } = useRoadmapItems();
  const [detectedTasks, setDetectedTasks] = useState<DetectedProgress[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const verifyTaskWithAI = async (taskId: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-analyze-task-completion', {
        body: { taskId }
      });

      if (error) throw error;

      return data.analysis;
    } catch (error) {
      console.error('Error verifying task:', error);
      toast.error('Error al verificar tarea con IA');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const detectProgress = async () => {
      const tasksInProgress = items.filter(item => 
        item.status === 'in_progress' && 
        item.files_affected && 
        item.files_affected.length > 0
      );

      const detected: DetectedProgress[] = [];

      for (const task of tasksInProgress) {
        // Simulación de archivos modificados (en producción: Git webhooks)
        const filesModified = task.files_affected.filter(() => Math.random() > 0.2);
        
        if (filesModified.length > 0) {
          const completionPercentage = Math.round(
            (filesModified.length / task.files_affected.length) * 100
          );

          if (completionPercentage >= 80 && !dismissed.has(task.id)) {
            // Verificar con AI si realmente está completa
            const aiAnalysis = await verifyTaskWithAI(task.id);
            
            detected.push({
              taskId: task.id,
              taskName: task.feature_name,
              filesModified,
              completionPercentage,
              aiVerified: aiAnalysis?.isComplete || false,
              missingItems: aiAnalysis?.missingItems || [],
              needsManualReview: aiAnalysis?.needsManualVerification || false
            });
          }
        }
      }

      setDetectedTasks(detected);
    };

    // Detectar cada 60 segundos
    const interval = setInterval(detectProgress, 60000);
    detectProgress();

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
        <Card key={task.taskId} className={`p-4 ${
          task.aiVerified 
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            : task.needsManualReview
            ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {task.aiVerified ? (
                  <>
                    <Brain className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      ✅ Tarea Verificada con IA
                    </h4>
                  </>
                ) : task.needsManualReview ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      ⚠️ Revisión Manual Requerida
                    </h4>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      🔍 Progreso Detectado
                    </h4>
                  </>
                )}
              </div>
              <p className={`text-sm mb-2 ${
                task.aiVerified ? 'text-green-800 dark:text-green-200' :
                task.needsManualReview ? 'text-yellow-800 dark:text-yellow-200' :
                'text-blue-800 dark:text-blue-200'
              }`}>
                <strong>{task.taskName}</strong> está {task.completionPercentage}% completada
              </p>
              <p className={`text-xs ${
                task.aiVerified ? 'text-green-700 dark:text-green-300' :
                task.needsManualReview ? 'text-yellow-700 dark:text-yellow-300' :
                'text-blue-700 dark:text-blue-300'
              }`}>
                {task.filesModified.length} archivos modificados
              </p>
              
              {task.missingItems && task.missingItems.length > 0 && (
                <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                  <strong>Pendiente:</strong>
                  <ul className="list-disc list-inside ml-2">
                    {task.missingItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleMarkAsDone(task.taskId, task.taskName)}
                className={
                  task.aiVerified 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }
                disabled={isAnalyzing}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {task.aiVerified ? 'Confirmar' : 'Marcar como Hecha'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(task.taskId)}
                disabled={isAnalyzing}
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