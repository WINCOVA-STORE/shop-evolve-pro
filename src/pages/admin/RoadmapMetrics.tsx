import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function RoadmapMetrics() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Calcular métricas actuales
      const { data: calcData, error: calcError } = await supabase.functions.invoke(
        'calculate-roadmap-metrics'
      );

      if (calcError) throw calcError;
      setCurrentMetrics(calcData.metrics);

      // Cargar histórico (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: historyData, error: historyError } = await supabase
        .from('roadmap_metrics')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (historyError) throw historyError;

      setMetrics(historyData || []);

      toast({
        title: "Métricas actualizadas",
        description: "Datos del roadmap calculados correctamente",
      });
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
    return <div className="flex items-center justify-center h-96">Cargando métricas...</div>;
  }

  const getRiskColor = (score: number) => {
    if (score > 50) return 'text-red-600';
    if (score > 20) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Métricas del Roadmap</h1>
          <p className="text-muted-foreground">Análisis histórico y tendencias</p>
        </div>
        <Button onClick={loadMetrics} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Current Metrics */}
      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Progreso</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {currentMetrics.progress_percentage.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {currentMetrics.completed_tasks} de {currentMetrics.total_tasks} tareas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Velocidad</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {currentMetrics.velocity_tasks_per_week.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">tareas/semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {currentMetrics.avg_completion_time_hours.toFixed(0)}h
              </div>
              <p className="text-xs text-muted-foreground">por tarea</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nivel de Riesgo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRiskColor(currentMetrics.risk_score)}`}>
                {currentMetrics.risk_score.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentMetrics.blocked_tasks} bloqueadas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historical Charts */}
      {metrics.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Tareas (últimos 30 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completed_tasks" 
                    stroke="hsl(142 76% 36%)" 
                    strokeWidth={2}
                    name="Completadas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="in_progress_tasks" 
                    stroke="hsl(221 83% 53%)" 
                    strokeWidth={2}
                    name="En Progreso"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="blocked_tasks" 
                    stroke="hsl(0 84% 60%)" 
                    strokeWidth={2}
                    name="Bloqueadas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Velocidad y Riesgo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="velocity_tasks_per_week" 
                    stroke="hsl(262 83% 58%)" 
                    strokeWidth={2}
                    name="Velocidad (tareas/sem)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="risk_score" 
                    stroke="hsl(25 95% 53%)" 
                    strokeWidth={2}
                    name="Score de Riesgo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Insights de Optimización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-md">
            <strong className="text-green-700 dark:text-green-300">✅ Optimización de Costos:</strong>
            <p className="text-green-600 dark:text-green-400 mt-1">
              Usando <code>gemini-2.5-flash-lite</code> - El modelo más económico de Gemini.
              Ahorro estimado: 80% vs modelos premium.
            </p>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
            <strong className="text-blue-700 dark:text-blue-300">⚡ Eficiencia:</strong>
            <p className="text-blue-600 dark:text-blue-400 mt-1">
              Las métricas se calculan automáticamente y se cachean en DB.
              Cero llamadas AI redundantes - análisis se hace 1 vez por tarea.
            </p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-md">
            <strong className="text-purple-700 dark:text-purple-300">🎯 Reutilización:</strong>
            <p className="text-purple-600 dark:text-purple-400 mt-1">
              Metadata de AI (dependencias, riesgos, estimaciones) se guarda y reutiliza.
              No se vuelve a analizar la misma tarea.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}