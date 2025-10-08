import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ShippingMode = 'free' | 'manual' | 'api' | 'dropshipping';

export interface ShippingConfig {
  id: string;
  store_id: string;
  mode: ShippingMode;
  manual_global_cost: number | null;
  manual_rules: Record<string, any>;
  show_free_badge: boolean;
  api_provider: string | null;
  api_credentials: Record<string, any> | null;
  dropshipping_includes_shipping: boolean;
  last_changed_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useShippingConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['shipping-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_config')
        .select('*')
        .eq('store_id', 'wincova_main')
        .single();

      if (error) throw error;
      return data as ShippingConfig;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  });

  const updateConfig = useMutation({
    mutationFn: async (updates: Partial<ShippingConfig>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('shipping_config')
        .update({
          ...updates,
          last_changed_by: user?.id,
        })
        .eq('store_id', 'wincova_main')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-config'] });
      toast({
        title: "✅ Configuración actualizada",
        description: "Los cambios se aplicarán en nuevos pedidos.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateShipping = (
    subtotal: number,
    categoryId?: string
  ): number => {
    if (!config) return 0;

    switch (config.mode) {
      case 'free':
        return 0;
      
      case 'manual':
        // Verificar reglas por categoría
        if (categoryId && config.manual_rules?.[categoryId]) {
          return config.manual_rules[categoryId];
        }
        return config.manual_global_cost || 0;
      
      case 'dropshipping':
        return config.dropshipping_includes_shipping ? 0 : 0;
      
      case 'api':
        // Placeholder para integraciones futuras
        return 0;
      
      default:
        return 0;
    }
  };

  return {
    config,
    isLoading,
    updateConfig: updateConfig.mutate,
    isUpdating: updateConfig.isPending,
    calculateShipping,
  };
};
