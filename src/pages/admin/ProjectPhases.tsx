import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PhaseCard } from "@/components/admin/PhaseCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProjectPhases() {
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPhases();
  }, []);

  const loadPhases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) return;

      const { data } = await supabase
        .from('phases')
        .select('*')
        .eq('organization_id', orgMember.organization_id)
        .order('order_index');

      setPhases(data || []);
    } catch (error) {
      console.error('Error loading phases:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las fases",
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
          <h1 className="text-3xl font-bold">Fases del Proyecto</h1>
          <p className="text-muted-foreground">Gestiona las fases del roadmap</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Fase
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </div>
    </div>
  );
}
