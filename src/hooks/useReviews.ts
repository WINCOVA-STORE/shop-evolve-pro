import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Get user profiles for all reviews
      if (reviews && reviews.length > 0) {
        const userIds = reviews.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        
        // Map profiles to reviews
        const reviewsWithProfiles = reviews.map(review => ({
          ...review,
          profiles: profiles?.find(p => p.id === review.user_id) || null
        }));
        
        return reviewsWithProfiles as Review[];
      }
      
      return reviews as Review[];
    },
  });
};

export const useCreateReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      product_id: string;
      order_id?: string;
      rating: number;
      title?: string;
      comment?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para dejar una reseña");

      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            ...review,
            user_id: user.id,
            is_verified_purchase: !!review.order_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.product_id] });
      toast({
        title: "¡Reseña publicada!",
        description: "Has ganado 100 puntos por tu reseña. ¡Gracias!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar la reseña",
        variant: "destructive",
      });
    },
  });
};

export const useUserOrders = () => {
  return useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          created_at,
          order_items (
            product_id,
            product_name
          )
        `)
        .eq("user_id", user.id)
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};