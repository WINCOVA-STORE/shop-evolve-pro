import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/hooks/useProducts';

/**
 * Ensure product translations exist for the current language.
 * - For single product or arrays
 * - Non-blocking for lists (fire-and-forget)
 * - Limits parallel calls to avoid rate limiting
 */
export const useEnsureProductTranslations = (
  products: Product | Product[] | null | undefined,
  options?: { batchLimit?: number }
) => {
  const { i18n } = useTranslation();
  const inflight = useRef<Set<string>>(new Set());
  const batchLimit = options?.batchLimit ?? 6;

  useEffect(() => {
    if (!products) return;
    const baseLang = (i18n.language || 'en').toLowerCase().split(/[-_]/)[0];
    const supported = ['es', 'fr', 'pt', 'zh'];
    if (!supported.includes(baseLang)) return;

    const list = Array.isArray(products) ? products : [products];

    const missing = list.filter((p) => {
      const nameKey = `name_${baseLang}` as keyof Product;
      const descKey = `description_${baseLang}` as keyof Product;
      return !p[nameKey] || !p[descKey];
    });

    const toTranslate = missing.slice(0, batchLimit);

    toTranslate.forEach(async (p) => {
      if (inflight.current.has(p.id)) return;
      inflight.current.add(p.id);
      try {
        await supabase.functions.invoke('auto-translate-content', {
          body: {
            table_name: 'products',
            record_id: p.id,
            source_text_name: p.name,
            source_text_description: p.description || ''
          },
        });
      } catch (e) {
        console.error('ensure translations error', e);
      } finally {
        inflight.current.delete(p.id);
      }
    });
  }, [products, i18n.language]);
};
