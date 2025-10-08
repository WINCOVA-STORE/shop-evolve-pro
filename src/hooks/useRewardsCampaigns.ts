import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type CampaignType = 
  | 'welcome'
  | 'review'
  | 'referral'
  | 'purchase'
  | 'birthday'
  | 'share'
  | 'social_follow'
  | 'custom';

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'scheduled';
export type CampaignFrequency = 'once' | 'daily' | 'per_event' | 'unlimited';

export interface RewardsCampaign {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  campaign_type: CampaignType;
  status: CampaignStatus;
  reward_value: number;
  value_type: 'percentage' | 'fixed';
  frequency: CampaignFrequency;
  max_uses_per_user: number | null;
  max_uses_total: number | null;
  current_uses: number;
  budget_limit_dollars: number | null;
  budget_spent_dollars: number;
  budget_alert_threshold: number;
  auto_pause_on_budget: boolean;
  start_date: string;
  end_date: string | null;
  conditions: any;
  priority: number;
  allow_stacking: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export const useRewardsCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<RewardsCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rewards_campaigns')
        .select('*')
        .eq('store_id', 'wincova_main')
        .order('priority', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaign: Partial<RewardsCampaign>) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const { data, error } = await supabase
        .from('rewards_campaigns')
        .insert({
          name: campaign.name!,
          campaign_type: campaign.campaign_type!,
          reward_value: campaign.reward_value!,
          value_type: campaign.value_type || 'fixed',
          store_id: 'wincova_main',
          created_by: user.id,
          description: campaign.description || null,
          status: campaign.status || 'active',
          frequency: campaign.frequency || 'per_event',
          max_uses_per_user: campaign.max_uses_per_user,
          max_uses_total: campaign.max_uses_total,
          budget_limit_dollars: campaign.budget_limit_dollars,
          start_date: campaign.start_date || new Date().toISOString(),
          end_date: campaign.end_date || null,
          auto_pause_on_budget: campaign.auto_pause_on_budget ?? true,
          priority: campaign.priority || 0,
          allow_stacking: campaign.allow_stacking ?? true,
        } as any)
        .select()
        .single();

      if (error) throw error;
      await fetchCampaigns();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };

  const updateCampaign = async (id: string, updates: Partial<RewardsCampaign>) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const { data, error } = await supabase
        .from('rewards_campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchCampaigns();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const { error } = await supabase
        .from('rewards_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCampaigns();
      return { success: true };
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  };

  const getBudgetStatus = (campaign: RewardsCampaign) => {
    if (!campaign.budget_limit_dollars) return null;
    
    const percentage = (campaign.budget_spent_dollars / campaign.budget_limit_dollars) * 100;
    const isNearLimit = percentage >= (campaign.budget_alert_threshold * 100);
    const isAtLimit = percentage >= 100;

    return { percentage, isNearLimit, isAtLimit };
  };

  return {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getBudgetStatus,
    refetch: fetchCampaigns,
  };
};
