import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, ListTodo } from "lucide-react";
import { RoadmapProgress } from "@/hooks/useRoadmapItems";

interface RoadmapProgressCardProps {
  progress: RoadmapProgress | null;
  loading: boolean;
}

export const RoadmapProgressCard = ({ progress, loading }: RoadmapProgressCardProps) => {
  if (loading || !progress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso Global del E-Commerce</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Completadas",
      value: progress.completed_items,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      label: "En Progreso",
      value: progress.in_progress_items,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      label: "Bloqueadas",
      value: progress.blocked_items,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-950",
    },
    {
      label: "Pendientes",
      value: progress.total_items - progress.completed_items - progress.in_progress_items - progress.blocked_items,
      icon: ListTodo,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-800",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Progreso Global del E-Commerce 🚀</CardTitle>
          <Badge variant="outline" className="text-lg font-bold">
            {progress.progress_percentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {progress.completed_items} de {progress.total_items} tareas completadas
            </span>
          </div>
          <Progress value={progress.progress_percentage} className="h-3" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-4 space-y-2`}
            >
              <div className="flex items-center gap-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
