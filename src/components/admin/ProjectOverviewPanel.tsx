import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoadmapItem } from "@/hooks/useRoadmapItems";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  Link2
} from "lucide-react";

interface ProjectOverviewPanelProps {
  items: RoadmapItem[];
}

export const ProjectOverviewPanel = ({ items }: ProjectOverviewPanelProps) => {
  // Calculate statistics
  const totalTasks = items.length;
  const completedTasks = items.filter(i => i.status === 'done').length;
  const inProgressTasks = items.filter(i => i.status === 'in_progress').length;
  const blockedTasks = items.filter(i => i.status === 'blocked').length;
  const todoTasks = items.filter(i => i.status === 'todo').length;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // AI-generated tasks
  const aiGeneratedTasks = items.filter(i => i.metadata?.generated_by_ai).length;
  
  // Tasks with dependencies
  const tasksWithDependencies = items.filter(i => 
    i.metadata?.dependencies && i.metadata.dependencies.length > 0
  ).length;
  
  // Tasks with risks
  const tasksWithRisks = items.filter(i => 
    i.metadata?.risks && i.metadata.risks.length > 0
  ).length;
  
  // Total estimated hours
  const totalEstimatedHours = items.reduce((sum, item) => 
    sum + (item.metadata?.estimated_hours || 0), 0
  );
  
  // Completed estimated hours
  const completedEstimatedHours = items
    .filter(i => i.status === 'done')
    .reduce((sum, item) => sum + (item.metadata?.estimated_hours || 0), 0);
  
  // Priority distribution
  const criticalTasks = items.filter(i => i.priority === 'critical').length;
  const highTasks = items.filter(i => i.priority === 'high').length;
  const mediumTasks = items.filter(i => i.priority === 'medium').length;
  const lowTasks = items.filter(i => i.priority === 'low').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          📊 Resumen General del Proyecto
        </CardTitle>
        <CardDescription>
          Vista panorámica del estado actual del roadmap
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Completion Stats */}
          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-600">
                {completionRate.toFixed(0)}%
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {completedTasks}/{totalTasks}
              </p>
              <p className="text-xs text-muted-foreground">Tareas Completadas</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg space-y-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
              <p className="text-xs text-muted-foreground">En Progreso</p>
            </div>
          </div>

          {/* Blocked */}
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg space-y-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{blockedTasks}</p>
              <p className="text-xs text-muted-foreground">Bloqueadas</p>
            </div>
          </div>

          {/* Todo */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <Target className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-600">{todoTasks}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </div>

          {/* Time Estimation */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg space-y-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {completedEstimatedHours.toFixed(0)}h/{totalEstimatedHours.toFixed(0)}h
              </p>
              <p className="text-xs text-muted-foreground">Horas Estimadas (IA)</p>
            </div>
          </div>

          {/* AI Tasks */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🤖</span>
              <Badge className="bg-indigo-600">{aiGeneratedTasks}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Generadas por IA</p>
            </div>
          </div>

          {/* Dependencies */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg space-y-2">
            <Link2 className="h-5 w-5 text-blue-700" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{tasksWithDependencies}</p>
              <p className="text-xs text-muted-foreground">Con Dependencias</p>
            </div>
          </div>

          {/* Risks */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg space-y-2">
            <AlertTriangle className="h-5 w-5 text-orange-700" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{tasksWithRisks}</p>
              <p className="text-xs text-muted-foreground">Con Riesgos Identificados</p>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="col-span-full p-4 bg-muted rounded-lg">
            <p className="font-semibold mb-3 flex items-center gap-2">
              🎯 Distribución por Prioridad
            </p>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <Badge className="bg-red-100 text-red-600 dark:bg-red-950 w-full">
                  CRITICAL
                </Badge>
                <p className="text-2xl font-bold mt-2">{criticalTasks}</p>
              </div>
              <div className="text-center">
                <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-950 w-full">
                  HIGH
                </Badge>
                <p className="text-2xl font-bold mt-2">{highTasks}</p>
              </div>
              <div className="text-center">
                <Badge className="bg-yellow-100 text-yellow-600 dark:bg-yellow-950 w-full">
                  MEDIUM
                </Badge>
                <p className="text-2xl font-bold mt-2">{mediumTasks}</p>
              </div>
              <div className="text-center">
                <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 w-full">
                  LOW
                </Badge>
                <p className="text-2xl font-bold mt-2">{lowTasks}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
