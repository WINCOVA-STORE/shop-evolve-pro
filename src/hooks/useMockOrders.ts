import { useQuery } from "@tanstack/react-query";
import { getMockOrdersByUserId, getMockOrderById } from "@/data/mockData";

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  currency: string;
  shipping_address: string;
  billing_address: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  notes?: string;
  items: Array<{
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
  }>;
}

/**
 * Hook to get user orders (MOCK MODE)
 * Returns mock orders for the specified user
 */
export const useMockOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return getMockOrdersByUserId(userId) as Order[];
    },
    enabled: !!userId,
  });
};

/**
 * Hook to get a single order by ID (MOCK MODE)
 */
export const useMockOrder = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return getMockOrderById(orderId) as Order | null;
    },
    enabled: !!orderId,
  });
};
