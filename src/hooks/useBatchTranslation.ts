import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for batch translating products efficiently
 * Minimizes AI calls by processing multiple products at once
 */
export const useBatchTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<{
    total: number;
    translated: number;
    aiCalls: number;
  } | null>(null);
  const { toast } = useToast();

  const translateProducts = async () => {
    setIsTranslating(true);
    setProgress(null);

    try {
      toast({
        title: '🔄 Iniciando traducción en batch...',
        description: 'Procesando productos de forma eficiente'
      });

      const { data, error } = await supabase.functions.invoke('batch-translate-products');

      if (error) throw error;

      if (data.success) {
        setProgress({
          total: data.productsProcessed,
          translated: data.translated,
          aiCalls: data.aiCallsMade
        });

        toast({
          title: '✅ Traducción completada',
          description: `${data.translated} productos traducidos usando solo ${data.aiCallsMade} llamadas a IA`,
          duration: 5000
        });
      }

      return data;
    } catch (error) {
      console.error('Batch translation error:', error);
      toast({
        title: '❌ Error en traducción',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  const translateInBackground = async () => {
    // Silent background translation - no UI feedback
    try {
      await supabase.functions.invoke('batch-translate-products');
    } catch (error) {
      console.error('Background translation error:', error);
    }
  };

  return {
    translateProducts,
    translateInBackground,
    isTranslating,
    progress
  };
};
