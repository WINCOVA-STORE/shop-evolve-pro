import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    progress_pct: number;
    risk_level: string;
    tags?: string[];
  };
  onClick?: () => void;
}

const statusColors = {
  todo: "bg-gray-500",
  in_progress: "bg-blue-500",
  blocked: "bg-red-500",
  done: "bg-green-500",
  cancelled: "bg-gray-400",
};

const priorityColors = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-medium line-clamp-2">{task.title}</h3>
            <Badge className={statusColors[task.status as keyof typeof statusColors]}>
              {task.status}
            </Badge>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={priorityColors[task.priority as keyof typeof priorityColors]}>
                {task.priority}
              </span>
              {task.risk_level !== 'low' && (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            {task.due_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.due_date), "dd MMM", { locale: es })}</span>
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {task.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
