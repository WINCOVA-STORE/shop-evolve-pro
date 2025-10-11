import { useTranslation } from 'react-i18next';

/**
 * Translate a category display name using its slug.
 * Falls back to the provided fallback if no translation key is found.
 */
export const useCategoryTranslation = () => {
  const { t } = useTranslation();

  const translateCategoryName = (slug: string, fallback: string) => {
    // Expect slugs like "electronics-technology"
    return t(`categories.names.${slug}`, fallback || slug.replace(/-/g, ' '));
  };

  return { translateCategoryName };
};