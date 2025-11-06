import { useQuery } from "@tanstack/react-query";
import { MOCK_PRODUCTS, getFeaturedMockProducts } from "@/data/mockData";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  images: string[];
  stock: number;
  is_active: boolean;
  sku: string | null;
  tags: string[];
  reward_percentage: number;
  created_at: string;
  updated_at: string;
  // Multi-language fields
  name_es?: string | null;
  name_fr?: string | null;
  name_pt?: string | null;
  name_zh?: string | null;
  description_es?: string | null;
  description_fr?: string | null;
  description_pt?: string | null;
  description_zh?: string | null;
}

/**
 * Hook to get all products (MOCK MODE)
 * Returns mock data from centralized mockData.ts
 */
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_PRODUCTS as Product[];
    },
  });
};

/**
 * Hook to get featured products (MOCK MODE)
 * Returns mock featured products from centralized mockData.ts
 */
export const useFeaturedProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return getFeaturedMockProducts(limit) as Product[];
    },
  });
};
