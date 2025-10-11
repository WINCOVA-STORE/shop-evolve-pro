import { useTranslation } from 'react-i18next';
import { Product } from './useProducts';

/**
 * Hook to get product content in the current language
 * Returns the translated name and description based on i18n language
 */
export const useTranslatedProduct = (product: Product | null | undefined) => {
  const { i18n } = useTranslation();
  
  if (!product) return { name: '', description: '' };
  
  // Normalize to base language (e.g., es-ES -> es)
  const baseLang = (i18n.language || 'en').toLowerCase().split(/[-_]/)[0];
  
  // Map language codes to database column suffixes
  const nameMap: Record<string, keyof Product> = {
    es: 'name_es',
    fr: 'name_fr',
    pt: 'name_pt',
    zh: 'name_zh',
  };
  
  const descMap: Record<string, keyof Product> = {
    es: 'description_es',
    fr: 'description_fr',
    pt: 'description_pt',
    zh: 'description_zh',
  };
  
  const nameKey = nameMap[baseLang];
  const rawName = (nameKey ? (product[nameKey] as string | null | undefined) : undefined) || product.name;
  const safeName = (rawName ?? '').toString();
  
  const descKey = descMap[baseLang];
  const rawDesc = (descKey ? (product[descKey] as string | null | undefined) : undefined) || product.description;
  const safeDesc = (rawDesc ?? null) as string | null;
  
  return {
    name: safeName,
    description: safeDesc,
  };
};
