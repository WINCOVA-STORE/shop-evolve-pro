import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from './useProducts';

interface SuggestionsResponse {
  suggestions: any[];
  reasoning?: string;
}

export const useCartSuggestions = (cartItems: any[]) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: allProducts } = useProducts();

  useEffect(() => {
    if (!cartItems || cartItems.length === 0 || !allProducts) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        // Get cart item IDs and categories
        const cartItemIds = cartItems.map(item => item.id);
        const cartCategories = [...new Set(cartItems.map(item => item.category_id).filter(Boolean))];
        const cartItemNames = cartItems.map(item => item.name).join(', ');

        // Call AI suggestions edge function
        const { data, error } = await supabase.functions.invoke('ai-cart-suggestions', {
          body: {
            cartItems: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              category_id: item.category_id,
              price: item.price,
              tags: item.tags || []
            })),
            availableProducts: allProducts
              .filter(p => !cartItemIds.includes(p.id) && p.is_active && p.stock > 0)
              .map(p => ({
                id: p.id,
                name: p.name,
                category_id: p.category_id,
                price: p.price,
                compare_at_price: p.compare_at_price,
                tags: p.tags || [],
                images: p.images,
                stock: p.stock
              }))
          }
        });

        if (error) {
          console.error('Error fetching AI suggestions:', error);
          // Fallback to rule-based suggestions
          const fallbackSuggestions = getFallbackSuggestions(
            cartItems, 
            allProducts, 
            cartItemIds, 
            cartCategories
          );
          setSuggestions(fallbackSuggestions);
        } else {
          setSuggestions(data?.suggestions || []);
        }
      } catch (error) {
        console.error('Error in useCartSuggestions:', error);
        // Fallback to rule-based suggestions
        const fallbackSuggestions = getFallbackSuggestions(
          cartItems, 
          allProducts, 
          cartItems.map(item => item.id), 
          [...new Set(cartItems.map(item => item.category_id).filter(Boolean))]
        );
        setSuggestions(fallbackSuggestions);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch to avoid too many calls
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(timer);
  }, [cartItems, allProducts]);

  return { suggestions, loading };
};

// Fallback rule-based suggestions
const getFallbackSuggestions = (
  cartItems: any[], 
  allProducts: any[], 
  cartItemIds: string[], 
  cartCategories: string[]
) => {
  // Filter out items already in cart
  let available = allProducts.filter(p => 
    !cartItemIds.includes(p.id) && 
    p.is_active && 
    p.stock > 0
  );

  // Priority 1: Same category items
  const sameCategorySuggestions = available
    .filter(p => cartCategories.includes(p.category_id))
    .sort((a, b) => {
      // Prioritize discounted items
      const aDiscount = a.compare_at_price ? (a.compare_at_price - a.price) : 0;
      const bDiscount = b.compare_at_price ? (b.compare_at_price - b.price) : 0;
      return bDiscount - aDiscount;
    })
    .slice(0, 3);

  // Priority 2: Complementary items (different categories)
  const complementarySuggestions = available
    .filter(p => !cartCategories.includes(p.category_id))
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 2);

  // Combine suggestions
  const combined = [...sameCategorySuggestions, ...complementarySuggestions];
  
  // Remove duplicates and limit to 5
  return combined
    .filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    )
    .slice(0, 5);
};
