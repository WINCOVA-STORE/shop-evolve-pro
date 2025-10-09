import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ProjectMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) return;

      const { data, error } = await supabase.functions.invoke('calculate-analytics', {
        body: { organization_id: orgMember.organization_id }
      });

      if (error) throw error;

      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las métricas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Métricas del Proyecto</h1>
          <p className="text-muted-foreground">Análisis y estadísticas en tiempo real</p>
        </div>
        <Button onClick={loadMetrics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Velocidad</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.velocity_tasks_per_day?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">tareas/día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avg_completion_time_hours?.toFixed(0) || 0}h
            </div>
            <p className="text-xs text-muted-foreground">por tarea</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilización</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.team_utilization_pct?.toFixed(0) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">del equipo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics?.risk_score?.toFixed(0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">score de riesgo</p>
          </CardContent>
        </Card>
      </div>

      {/* Burndown Chart */}
      {metrics?.metrics_json?.burndown && (
        <Card>
          <CardHeader>
            <CardTitle>Burndown Chart (últimos 30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.metrics_json.burndown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="remaining" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Task Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Tareas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Completadas</span>
              <span className="font-bold text-green-600">
                {metrics?.completed_tasks || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Bloqueadas</span>
              <span className="font-bold text-red-600">
                {metrics?.blocked_tasks || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Vencidas</span>
              <span className="font-bold text-orange-600">
                {metrics?.overdue_tasks || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Total de tareas: <strong>{metrics?.total_tasks || 0}</strong></p>
            <p>
              Tasa de finalización:{" "}
              <strong>
                {metrics?.total_tasks > 0
                  ? Math.round((metrics.completed_tasks / metrics.total_tasks) * 100)
                  : 0}
                %
              </strong>
            </p>
            <p className="text-muted-foreground">
              El equipo está completando aproximadamente{" "}
              {metrics?.velocity_tasks_per_day?.toFixed(1) || 0} tareas por día
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
