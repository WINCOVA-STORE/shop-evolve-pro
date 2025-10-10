import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RoadmapItem {
  id: string;
  phase_number: number;
  phase_name: string;
  sprint_number: string;
  sprint_name: string;
  item_number: string;
  feature_name: string;
  description: string | null;
  files_affected: string[] | null;
  priority: string;
  impact: string;
  effort: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  assigned_to: string | null;
  completed_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  blocked_reason: string | null;
  notes: string | null;
  acceptance_criteria: any[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface RoadmapProgress {
  total_items: number;
  completed_items: number;
  in_progress_items: number;
  blocked_items: number;
  progress_percentage: number;
}

export const useRoadmapItems = () => {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [progress, setProgress] = useState<RoadmapProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('ecommerce_roadmap_items')
        .select('*')
        .order('phase_number', { ascending: true })
        .order('sprint_number', { ascending: true })
        .order('item_number', { ascending: true });

      if (error) throw error;
      setItems((data || []) as RoadmapItem[]);
    } catch (error) {
      console.error('Error fetching roadmap items:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los items del roadmap',
        variant: 'destructive',
      });
    }
  };

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase.rpc('get_roadmap_progress');
      if (error) throw error;
      if (data && data.length > 0) {
        setProgress(data[0]);
      }
    } catch (error) {
      console.error('Error fetching roadmap progress:', error);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchProgress()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('roadmap-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ecommerce_roadmap_items'
        },
        () => {
          console.log('Roadmap actualizado en tiempo real');
          fetchAll();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateItemStatus = async (
    itemId: string,
    status: RoadmapItem['status'],
    notes?: string
  ) => {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'in_progress' && !items.find(i => i.id === itemId)?.started_at) {
        updates.started_at = new Date().toISOString();
      }

      if (status === 'done') {
        updates.completed_at = new Date().toISOString();
        updates.completed_by = (await supabase.auth.getUser()).data.user?.id;
      }

      if (notes) {
        updates.notes = notes;
      }

      if (status === 'blocked') {
        updates.blocked_reason = notes || null;
      }

      const { error } = await supabase
        .from('ecommerce_roadmap_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Actualizado',
        description: 'Estado actualizado correctamente',
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating item status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
      return { success: false };
    }
  };

  const assignItem = async (itemId: string, userId: string | null) => {
    try {
      const { error } = await supabase
        .from('ecommerce_roadmap_items')
        .update({ assigned_to: userId })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Asignado',
        description: 'Item asignado correctamente',
      });
    } catch (error) {
      console.error('Error assigning item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo asignar el item',
        variant: 'destructive',
      });
    }
  };

  return {
    items,
    progress,
    loading,
    updateItemStatus,
    assignItem,
    refetch: fetchAll,
  };
};
