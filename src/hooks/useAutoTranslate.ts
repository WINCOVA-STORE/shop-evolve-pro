import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook that automatically detects and fills missing translations
 * Usage: Add to App.tsx or main layout component
 */
export const useAutoTranslate = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const checkAndTranslate = async () => {
      try {
        // Get all current translations
        const localeKeys = {
          en: i18n.store.data.en?.translation || {},
          es: i18n.store.data.es?.translation || {},
          fr: i18n.store.data.fr?.translation || {},
          pt: i18n.store.data.pt?.translation || {},
          zh: i18n.store.data.zh?.translation || {},
        };

        // Check for missing translations
        const { data, error } = await supabase.functions.invoke('detect-missing-translations', {
          body: { localeKeys }
        });

        if (error) {
          console.error('Auto-translate error:', error);
          return;
        }

        if (data?.generatedTranslations) {
          console.log('🌐 Auto-generated translations:', data.generatedTranslations);
          
          // Optionally: Auto-update i18n store (for runtime only, not persisted to files)
          for (const [lang, translations] of Object.entries(data.generatedTranslations)) {
            if (translations && typeof translations === 'object') {
              i18n.addResources(lang, 'translation', translations as Record<string, string>);
            }
          }
        }
      } catch (err) {
        console.error('Auto-translate hook error:', err);
      }
    };

    // Check on mount and language change
    checkAndTranslate();
  }, [i18n.language]);
};
