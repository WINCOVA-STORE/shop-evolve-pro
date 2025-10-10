import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RoadmapItem } from "@/hooks/useRoadmapItems";
import { useToast } from "@/hooks/use-toast";
import { Zap, AlertTriangle, CheckCircle2, Clock, FileCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExecuteTaskDialogProps {
  task: RoadmapItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecute: (task: RoadmapItem) => Promise<void>;
}

export const ExecuteTaskDialog = ({
  task,
  open,
  onOpenChange,
  onExecute,
}: ExecuteTaskDialogProps) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await onExecute(task);
      toast({
        title: "✅ Tarea en ejecución",
        description: "La IA está generando el código necesario...",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error executing task:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo ejecutar la tarea",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getPriorityColor = (priority: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline',
    };
    return colors[priority] || 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Ejecutar Tarea con IA
          </DialogTitle>
          <DialogDescription>
            La IA analizará los requisitos y generará el código necesario automáticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Info */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority.toUpperCase()}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                {task.item_number}
              </span>
            </div>
            <h3 className="font-semibold text-lg">{task.feature_name}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
          </div>

          {/* Estimated Impact */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600">Estimación</span>
              </div>
              <p className="text-sm font-bold text-blue-600">
                {task.metadata?.estimated_hours || '?'}h
              </p>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-green-600">Impacto</span>
              </div>
              <p className="text-sm font-bold text-green-600">
                {task.impact.toUpperCase()}
              </p>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <FileCode className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-600">Archivos</span>
              </div>
              <p className="text-sm font-bold text-purple-600">
                {task.files_affected?.length || 0}
              </p>
            </div>
          </div>

          {/* Dependencies Warning */}
          {task.metadata?.dependencies && task.metadata.dependencies.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dependencias detectadas:</strong>
                <ul className="mt-2 space-y-1">
                  {task.metadata.dependencies.map((dep: string, idx: number) => (
                    <li key={idx} className="text-sm">• {dep}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Risks Warning */}
          {task.metadata?.risks && task.metadata.risks.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Riesgos identificados:</strong>
                <ul className="mt-2 space-y-1">
                  {task.metadata.risks.map((risk: string, idx: number) => (
                    <li key={idx} className="text-sm">• {risk}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Files Affected */}
          {task.files_affected && task.files_affected.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs font-semibold mb-2">Archivos que se modificarán:</p>
              <div className="flex flex-wrap gap-1">
                {task.files_affected.slice(0, 5).map((file, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-mono">
                    {file}
                  </Badge>
                ))}
                {task.files_affected.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{task.files_affected.length - 5} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {task.metadata?.ai_analysis?.recommendations && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Recomendaciones de la IA:</strong>
                <p className="text-sm mt-1">{task.metadata.ai_analysis.recommendations}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExecuting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            {isExecuting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Ejecutar Ahora
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
