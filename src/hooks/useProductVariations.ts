import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductVariation {
  id: string;
  product_id: string;
  sku: string | null;
  price: number;
  regular_price: number | null;
  sale_price: number | null;
  stock: number;
  is_active: boolean;
  images: string[];
  attributes: Array<{ name: string; value: string }>;
  weight: string | null;
  dimensions: any;
  created_at: string;
  updated_at: string;
}

export const useProductVariations = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product-variations', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching product variations:', error);
        throw error;
      }

      return (data || []).map(variation => ({
        ...variation,
        attributes: variation.attributes as Array<{ name: string; value: string }>,
        dimensions: variation.dimensions as any
      })) as ProductVariation[];
    },
    enabled: !!productId,
  });
};

// Helper: Get unique attribute names from variations
export const getVariationAttributes = (variations: ProductVariation[]) => {
  const attributesMap = new Map<string, Set<string>>();
  
  variations.forEach((variation) => {
    variation.attributes.forEach((attr) => {
      if (!attributesMap.has(attr.name)) {
        attributesMap.set(attr.name, new Set());
      }
      attributesMap.get(attr.name)!.add(attr.value);
    });
  });
  
  return Array.from(attributesMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));
};

// Helper: Find variation by selected attributes
export const findVariationByAttributes = (
  variations: ProductVariation[],
  selectedAttributes: Record<string, string>
): ProductVariation | undefined => {
  return variations.find((variation) => {
    return variation.attributes.every((attr) => {
      return selectedAttributes[attr.name] === attr.value;
    });
  });
};