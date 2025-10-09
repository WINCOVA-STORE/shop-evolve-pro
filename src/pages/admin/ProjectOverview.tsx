import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PhaseCard } from "@/components/admin/PhaseCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProjectOverview() {
  const [phases, setPhases] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    blockedTasks: 0,
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get first organization (MVP: single org per user)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) {
        toast({
          title: "Sin organización",
          description: "Necesitas crear una organización primero",
          variant: "destructive",
        });
        return;
      }

      // Load phases
      const { data: phasesData } = await supabase
        .from('phases')
        .select('*, tasks(count)')
        .eq('organization_id', orgMember.organization_id)
        .order('order_index');

      // Load tasks stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('organization_id', orgMember.organization_id);

      setPhases(phasesData || []);
      
      if (tasks) {
        const completed = tasks.filter(t => t.status === 'done').length;
        const blocked = tasks.filter(t => t.status === 'blocked').length;
        
        setStats({
          totalTasks: tasks.length,
          completedTasks: completed,
          blockedTasks: blocked,
          overallProgress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const detectRisks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      const { data, error } = await supabase.functions.invoke('ai-detect-risks', {
        body: { organization_id: orgMember?.organization_id }
      });

      if (error) throw error;

      toast({
        title: "Análisis de riesgos completado",
        description: `Riesgo general: ${data.overall_risk}`,
      });
    } catch (error) {
      console.error('Error detecting risks:', error);
      toast({
        title: "Error",
        description: "No se pudo analizar los riesgos",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Proyecto</h1>
          <p className="text-muted-foreground">Gestiona todas las fases y tareas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={detectRisks} variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Detectar Riesgos
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Fase
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <Progress value={stats.overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Todas las fases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bloqueadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.blockedTasks}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Phases Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Fases del Proyecto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phases.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} />
          ))}
        </div>
      </div>
    </div>
  );
}
