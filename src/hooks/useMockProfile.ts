import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MOCK_USER } from "@/data/mockData";
import { useState } from "react";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  birthday: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
}

/**
 * Hook to get user profile (MOCK MODE)
 * Returns mock user data
 */
export const useMockProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return MOCK_USER as Profile;
    },
    enabled: !!userId,
  });
};

/**
 * Hook to update user profile (MOCK MODE)
 * Simulates profile update without actual backend
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<Profile>) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, this would update the backend
      console.log("Mock: Profile updated", profile);
      
      return { ...MOCK_USER, ...profile };
    },
    onSuccess: (data) => {
      // Update the cache
      queryClient.setQueryData(['profile', data.id], data);
    },
  });
};

/**
 * Hook to manage mock referrals
 */
export const useMockReferrals = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['referrals', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mock referrals data
      return [
        {
          id: 'ref-001',
          referrer_id: userId,
          referral_code: 'DEMO2024',
          created_at: new Date().toISOString(),
          reward_earned: 10,
        }
      ];
    },
    enabled: !!userId,
  });
};

/**
 * Hook to manage mock rewards
 */
export const useMockRewards = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['rewards', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mock rewards data
      return [
        {
          id: 'reward-001',
          user_id: userId,
          amount: 500,
          type: 'purchase',
          description: 'Compra del 15/01/2024',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 'reward-002',
          user_id: userId,
          amount: 1000,
          type: 'welcome',
          description: 'Bono de bienvenida',
          created_at: '2024-01-01T00:00:00Z',
        }
      ];
    },
    enabled: !!userId,
  });
};
