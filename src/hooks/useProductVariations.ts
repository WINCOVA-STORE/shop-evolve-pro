import { useQuery } from "@tanstack/react-query";
import { getMockProductVariations } from "@/data/mockData";

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

/**
 * Hook to get product variations (MOCK MODE)
 * Returns mock variations from centralized mockData.ts
 */
export const useProductVariations = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product-variations', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return getMockProductVariations(productId).map(variation => ({
        ...variation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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