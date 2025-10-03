import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Reward {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  expires_at: string | null;
}

export const useRewards = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [availablePoints, setAvailablePoints] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRewards();
    } else {
      setRewards([]);
      setAvailablePoints(0);
      setLoading(false);
    }
  }, [user]);

  const fetchRewards = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validRewards = (data || []).filter((reward: Reward) => {
        // Filter out expired rewards
        if (reward.expires_at) {
          return new Date(reward.expires_at) > new Date();
        }
        return true;
      });

      setRewards(validRewards);
      
      // Calculate total available points
      const total = validRewards.reduce((sum, reward) => sum + Number(reward.amount), 0);
      setAvailablePoints(total);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setRewards([]);
      setAvailablePoints(0);
    } finally {
      setLoading(false);
    }
  };

  // Convert points to dollars (1000 points = $1)
  const pointsToDollars = (points: number): number => {
    return points / 1000;
  };

  // Convert dollars to points (1000 points = $1)
  const dollarsToPoints = (dollars: number): number => {
    return Math.floor(dollars * 1000);
  };

  // Calculate maximum points that can be used (2% of purchase)
  const getMaxUsablePoints = (purchaseAmount: number): number => {
    const maxDollars = purchaseAmount * 0.02; // 2% max
    const maxPoints = dollarsToPoints(maxDollars);
    return Math.min(maxPoints, availablePoints);
  };

  return {
    rewards,
    availablePoints,
    loading,
    pointsToDollars,
    dollarsToPoints,
    getMaxUsablePoints,
    refetch: fetchRewards,
  };
};
