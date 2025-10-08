import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface RewardsConfig {
  id: string;
  store_id: string;
  earning_type: 'percentage' | 'fixed';
  earning_percentage: number | null;
  earning_fixed_amount: number | null;
  points_per_dollar: number;
  max_usage_percentage: number;
  min_points_to_use: number;
  default_expiration_days: number;
  show_percentage_to_users: boolean;
  show_conversion_rate: boolean;
  vip_multiplier: number;
  seasonal_multiplier: number;
  include_tax_in_points: boolean;
  include_shipping_in_points: boolean;
  calculation_notes: string | null;
}

export const useRewardsConfig = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<RewardsConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rewards_config')
        .select('*')
        .eq('store_id', 'wincova_main')
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error fetching rewards config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<RewardsConfig>) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const { data, error } = await supabase
        .from('rewards_config')
        .update({
          ...updates,
          last_changed_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('store_id', 'wincova_main')
        .select()
        .single();

      if (error) throw error;
      setConfig(data);
      return { success: true };
    } catch (error) {
      console.error('Error updating rewards config:', error);
      throw error;
    }
  };

  return {
    config,
    loading,
    updateConfig,
    refetch: fetchConfig,
  };
};
