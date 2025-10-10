import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  FileCode,
  Target,
  Zap,
  TrendingUp,
  Link2,
  AlertTriangle,
  Timer,
  ArrowRight,
  Sparkles,
  Play,
} from "lucide-react";
import { RoadmapItem } from "@/hooks/useRoadmapItems";
import { ExecuteTaskDialog } from "@/components/admin/ExecuteTaskDialog";

interface RoadmapItemCardProps {
  item: RoadmapItem;
  onStatusChange: (itemId: string, status: RoadmapItem['status'], notes?: string) => Promise<any>;
  onExecute?: (task: RoadmapItem) => Promise<void>;
}

export const RoadmapItemCard = ({ item, onStatusChange, onExecute }: RoadmapItemCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');
  const [showDialog, setShowDialog] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      done: { variant: 'default' as const, className: 'bg-green-600' },
      in_progress: { variant: 'default' as const, className: 'bg-blue-600' },
      blocked: { variant: 'destructive' as const },
      todo: { variant: 'outline' as const },
    };
    return variants[status] || { variant: 'outline' as const };
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-600 bg-red-100 dark:bg-red-950',
      high: 'text-orange-600 bg-orange-100 dark:bg-orange-950',
      medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950',
      low: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
    };
    return colors[priority] || colors.medium;
  };

  const handleStatusChange = async (newStatus: RoadmapItem['status']) => {
    if (newStatus === 'blocked' || newStatus === 'done') {
      setShowDialog(true);
    } else {
      setIsUpdating(true);
      await onStatusChange(item.id, newStatus);
      setIsUpdating(false);
    }
  };

  const handleConfirmChange = async (status: RoadmapItem['status']) => {
    setIsUpdating(true);
    await onStatusChange(item.id, status, notes);
    setIsUpdating(false);
    setShowDialog(false);
  };

  const isChecked = item.status === 'done';

  return (
    <Card 
      id={`task-${item.id}`}
      className="hover:shadow-md transition-all duration-300"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleStatusChange('done');
                } else {
                  handleStatusChange('todo');
                }
              }}
              disabled={isUpdating}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">
                  {item.item_number}
                </span>
                <Badge className={getPriorityColor(item.priority)}>
                  {item.priority.toUpperCase()}
                </Badge>
              </div>
              <h4 className={`font-semibold ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                {item.feature_name}
              </h4>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          {/* Status Icon and Execute Button */}
          <div className="flex items-center gap-2">
            {getStatusIcon(item.status)}
            {onExecute && item.status === 'todo' && (
              <Button
                size="sm"
                onClick={() => setShowExecuteDialog(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Play className="h-3 w-3 mr-1" />
                Ejecutar
              </Button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>Impacto: {item.impact}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>Esfuerzo: {item.effort}</span>
          </div>
          {item.files_affected && item.files_affected.length > 0 && (
            <div className="flex items-center gap-1">
              <FileCode className="h-3 w-3" />
              <span>{item.files_affected.length} archivos</span>
            </div>
          )}
          {item.metadata?.estimated_hours && (
            <div className="flex items-center gap-1 text-blue-600">
              <Timer className="h-3 w-3" />
              <span>{item.metadata.estimated_hours}h estimadas</span>
            </div>
          )}
          {item.metadata?.implementation_order && (
            <div className="flex items-center gap-1 text-purple-600">
              <ArrowRight className="h-3 w-3" />
              <span>Orden: #{item.metadata.implementation_order}</span>
            </div>
          )}
          {item.metadata?.generated_by_ai && (
            <div className="flex items-center gap-1 text-indigo-600">
              <Sparkles className="h-3 w-3" />
              <span>AI</span>
            </div>
          )}
        </div>

        {/* AI Analysis - Dependencies */}
        {item.metadata?.dependencies && item.metadata.dependencies.length > 0 && (
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md space-y-1">
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Link2 className="h-3 w-3" />
              Dependencias detectadas:
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 pl-4">
              {item.metadata.dependencies.map((dep: string, idx: number) => (
                <div key={idx}>• {dep}</div>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis - Risks */}
        {item.metadata?.risks && item.metadata.risks.length > 0 && (
          <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-md space-y-1">
            <div className="flex items-center gap-1 text-xs font-semibold text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-3 w-3" />
              Riesgos identificados:
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 pl-4">
              {item.metadata.risks.map((risk: string, idx: number) => (
                <div key={idx}>• {risk}</div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {item.metadata?.ai_analysis?.recommendations && (
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-md">
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
              <Sparkles className="h-3 w-3" />
              Recomendaciones AI:
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              {item.metadata.ai_analysis.recommendations}
            </p>
          </div>
        )}

        {/* Status Selector */}
        <div className="flex items-center gap-2">
          <Select
            value={item.status}
            onValueChange={(value) => handleStatusChange(value as RoadmapItem['status'])}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-gray-400" />
                  Pendiente
                </div>
              </SelectItem>
              <SelectItem value="in_progress">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  En Progreso
                </div>
              </SelectItem>
              <SelectItem value="blocked">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Bloqueada
                </div>
              </SelectItem>
              <SelectItem value="done">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Completada
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Badge {...getStatusBadge(item.status)}>
            {item.status === 'todo' && 'Pendiente'}
            {item.status === 'in_progress' && 'En Progreso'}
            {item.status === 'blocked' && 'Bloqueada'}
            {item.status === 'done' && 'Completada'}
          </Badge>
        </div>

        {/* Blocked Reason */}
        {item.status === 'blocked' && item.blocked_reason && (
          <div className="p-2 bg-red-50 dark:bg-red-950 rounded text-sm text-red-800 dark:text-red-200">
            <strong>Bloqueada:</strong> {item.blocked_reason}
          </div>
        )}

        {/* Notes */}
        {item.notes && item.status !== 'blocked' && (
          <div className="p-2 bg-muted rounded text-sm">
            <strong>Notas:</strong> {item.notes}
          </div>
        )}

        {/* Dialog for Blocked/Done Status */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {item.status === 'blocked' ? 'Bloquear Tarea' : 'Completar Tarea'}
              </DialogTitle>
              <DialogDescription>
                {item.status === 'blocked'
                  ? 'Describe la razón del bloqueo'
                  : 'Agrega notas sobre la implementación (opcional)'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  item.status === 'blocked'
                    ? 'Ej: Esperando respuesta del equipo de backend...'
                    : 'Ej: Implementado con éxito usando...'
                }
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleConfirmChange(item.status)}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Guardando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Execute Task Dialog */}
        {onExecute && (
          <ExecuteTaskDialog
            task={item}
            open={showExecuteDialog}
            onOpenChange={setShowExecuteDialog}
            onExecute={onExecute}
          />
        )}
      </CardContent>
    </Card>
  );
};
