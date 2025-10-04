import { useTranslation } from 'react-i18next';
import { Product } from './useProducts';

/**
 * Hook to get product content in the current language
 * Returns the translated name and description based on i18n language
 */
export const useTranslatedProduct = (product: Product | null | undefined) => {
  const { i18n } = useTranslation();
  
  if (!product) return { name: '', description: '' };
  
  const currentLang = i18n.language;
  
  // Map language codes to database column suffixes
  const langMap: Record<string, keyof Product> = {
    'es': 'name_es',
    'fr': 'name_fr',
    'pt': 'name_pt',
    'zh': 'name_zh',
  };
  
  const descLangMap: Record<string, keyof Product> = {
    'es': 'description_es',
    'fr': 'description_fr',
    'pt': 'description_pt',
    'zh': 'description_zh',
  };
  
  // Get translated name, fallback to English (default 'name' column)
  const nameKey = langMap[currentLang];
  const translatedName = (nameKey && product[nameKey as keyof Product]) || product.name;
  
  // Get translated description, fallback to English (default 'description' column)
  const descKey = descLangMap[currentLang];
  const translatedDescription = (descKey && product[descKey as keyof Product]) || product.description;
  
  return {
    name: translatedName as string,
    description: translatedDescription as string | null,
  };
};
