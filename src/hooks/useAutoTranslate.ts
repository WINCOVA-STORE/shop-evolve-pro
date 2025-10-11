import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook that automatically detects, translates, and FIXES missing translations
 * NO HUMAN INTERVENTION REQUIRED - Runs automatically
 */
export const useAutoTranslate = () => {
  const { i18n } = useTranslation();
  const isFixing = useRef(false);
  const lastCheck = useRef<string>('');

  useEffect(() => {
    const autoFixTranslations = async () => {
      // Prevent duplicate calls
      const checkKey = `${i18n.language}-${Object.keys(i18n.store.data.en?.translation || {}).length}`;
      if (isFixing.current || lastCheck.current === checkKey) return;
      
      isFixing.current = true;
      lastCheck.current = checkKey;

      try {
        console.log('🔍 Auto-checking translations...');

        // Get all current translations
        const localeData = {
          en: i18n.store.data.en?.translation || {},
          es: i18n.store.data.es?.translation || {},
          fr: i18n.store.data.fr?.translation || {},
          pt: i18n.store.data.pt?.translation || {},
          zh: i18n.store.data.zh?.translation || {},
        };

        // Call auto-fix function
        const { data, error } = await supabase.functions.invoke('auto-fix-translations', {
          body: { 
            localeData,
            targetLanguages: ['es', 'fr', 'pt', 'zh']
          }
        });

        if (error) {
          console.error('❌ Auto-fix error:', error);
          isFixing.current = false;
          return;
        }

        if (data?.success && data?.totalFixed > 0) {
          console.log(`✅ Auto-fixed ${data.totalFixed} translations!`);
          
          // Update i18n store with fixed translations
          for (const [lang, result] of Object.entries(data.results)) {
            if ((result as any).updatedLocale) {
              i18n.addResources(lang, 'translation', (result as any).updatedLocale);
            }
          }

          // Force re-render by changing language and back
          const currentLang = i18n.language;
          await i18n.changeLanguage('en');
          await i18n.changeLanguage(currentLang);
          
          console.log('🎉 Translations updated and applied!');
        } else {
          console.log('✓ All translations are complete');
        }
      } catch (err) {
        console.error('❌ Auto-fix error:', err);
      } finally {
        isFixing.current = false;
      }
    };

    // Run auto-fix on mount and language change (with debounce)
    const timer = setTimeout(autoFixTranslations, 2000);
    return () => clearTimeout(timer);
  }, [i18n.language]);
};
