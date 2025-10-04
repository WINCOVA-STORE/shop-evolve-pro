import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/data/categories";

interface CategoryWithCount {
  name: string;
  slug: string;
  icon: any;
  productCount: number;
}

/**
 * Hook que devuelve solo las categorías que tienen productos activos
 * Filtra automáticamente las categorías vacías
 */
export const useCategoriesWithProducts = () => {
  return useQuery({
    queryKey: ['categories-with-products'],
    queryFn: async () => {
      // Obtener todas las categorías desde la base de datos con sus productos
      const { data: dbCategories, error } = await supabase
        .from('categories')
        .select('id, name');

      if (error) throw error;

      // Obtener conteo de productos activos por categoría
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_active', true);

      if (productsError) throw productsError;

      // Crear un mapa de conteos por categoría (usando el nombre en minúsculas para coincidencia)
      const categoryProductCounts = new Map<string, number>();
      
      products?.forEach((product) => {
        if (product.category_id) {
          const category = dbCategories?.find(cat => cat.id === product.category_id);
          if (category) {
            const categoryName = category.name.toLowerCase().trim();
            categoryProductCounts.set(
              categoryName,
              (categoryProductCounts.get(categoryName) || 0) + 1
            );
          }
        }
      });

      // Filtrar las categorías estáticas que tienen productos
      const categoriesWithProducts = categories
        .map(category => ({
          ...category,
          productCount: categoryProductCounts.get(category.name.toLowerCase().trim()) || 0
        }))
        .filter(category => category.productCount > 0)
        .sort((a, b) => b.productCount - a.productCount); // Ordenar por cantidad de productos

      return categoriesWithProducts as CategoryWithCount[];
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
};

/**
 * Hook para obtener solo las categorías principales con productos
 * Útil para mostrar en la página de inicio
 */
export const useMainCategoriesWithProducts = (limit?: number) => {
  return useQuery({
    queryKey: ['main-categories-with-products', limit],
    queryFn: async () => {
      // Obtener todas las categorías desde la base de datos
      const { data: dbCategories, error } = await supabase
        .from('categories')
        .select('id, name');

      if (error) throw error;

      // Obtener productos activos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_active', true);

      if (productsError) throw productsError;

      // Crear set de categorías con productos
      const categoriesWithProducts = new Set<string>();
      
      products?.forEach((product) => {
        if (product.category_id) {
          const category = dbCategories?.find(cat => cat.id === product.category_id);
          if (category) {
            categoriesWithProducts.add(category.name.toLowerCase().trim());
          }
        }
      });

      // Filtrar y limitar categorías
      const filteredCategories = categories
        .filter(category => 
          categoriesWithProducts.has(category.name.toLowerCase().trim())
        );

      return limit ? filteredCategories.slice(0, limit) : filteredCategories;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
};
