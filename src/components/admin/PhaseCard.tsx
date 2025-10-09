import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, AlertCircle, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PhaseCardProps {
  phase: {
    id: string;
    name: string;
    goal?: string;
    status: string;
    progress_pct: number;
    risk_level: string;
    start_date?: string;
    end_date?: string;
    owner_user_id?: string;
  };
  onClick?: () => void;
}

const statusColors = {
  planned: "bg-blue-500",
  in_progress: "bg-yellow-500",
  blocked: "bg-red-500",
  completed: "bg-green-500",
};

const riskColors = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

export function PhaseCard({ phase, onClick }: PhaseCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{phase.name}</CardTitle>
          <Badge className={statusColors[phase.status as keyof typeof statusColors]}>
            {phase.status}
          </Badge>
        </div>
        {phase.goal && (
          <p className="text-sm text-muted-foreground mt-2">{phase.goal}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progreso</span>
            <span className="font-medium">{phase.progress_pct}%</span>
          </div>
          <Progress value={phase.progress_pct} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className={riskColors[phase.risk_level as keyof typeof riskColors]}>
              Riesgo: {phase.risk_level}
            </span>
          </div>
          {phase.end_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(phase.end_date), "dd MMM", { locale: es })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
