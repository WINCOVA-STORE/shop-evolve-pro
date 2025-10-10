import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { RoadmapProgress } from "@/hooks/useRoadmapItems";

interface RoadmapMetricsCardProps {
  progress: RoadmapProgress | null;
}

export const RoadmapMetricsCard = ({ progress }: RoadmapMetricsCardProps) => {
  if (!progress) return null;

  const velocity = progress.completed_items > 0 
    ? (progress.completed_items / Math.max(1, progress.in_progress_items + progress.completed_items)) * 100
    : 0;

  const riskScore = progress.blocked_items > 0 
    ? Math.min(100, (progress.blocked_items / progress.total_items) * 100 * 3)
    : 0;

  const metrics = [
    {
      label: "Progreso General",
      value: `${progress.progress_percentage}%`,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      label: "Velocidad",
      value: `${velocity.toFixed(0)}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      label: "En Progreso",
      value: progress.in_progress_items.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      label: "Nivel de Riesgo",
      value: riskScore > 50 ? "Alto" : riskScore > 20 ? "Medio" : "Bajo",
      icon: AlertTriangle,
      color: riskScore > 50 ? "text-red-600" : riskScore > 20 ? "text-yellow-600" : "text-green-600",
      bgColor: riskScore > 50 ? "bg-red-50 dark:bg-red-950/20" : riskScore > 20 ? "bg-yellow-50 dark:bg-yellow-950/20" : "bg-green-50 dark:bg-green-950/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className={metric.bgColor}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon className={`h-4 w-4 ${metric.color}`} />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};