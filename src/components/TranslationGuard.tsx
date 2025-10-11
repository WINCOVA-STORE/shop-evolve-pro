import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Development component that detects hardcoded strings in the UI
 * Shows warnings when text is not using translation keys
 * Only active in development mode
 */
export const TranslationGuard = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const [warnings, setWarnings] = useState<string[]>([]);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!isDev) return;

    // In development, scan for hardcoded text patterns
    const detectHardcodedText = () => {
      const newWarnings: string[] = [];
      
      // Check current locale data completeness
      const currentLang = i18n.language;
      const translations = i18n.store.data[currentLang]?.translation || {};
      
      const countKeys = (obj: any, depth = 0): number => {
        if (depth > 10) return 0; // Prevent infinite recursion
        let count = 0;
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            count += countKeys(obj[key], depth + 1);
          } else {
            count++;
          }
        }
        return count;
      };

      const keyCount = countKeys(translations);
      
      if (keyCount < 50) {
        newWarnings.push(`Low translation key count (${keyCount}). Consider adding more structured translations.`);
      }

      // Check for common hardcoded patterns in the DOM
      const commonHardcodedPatterns = [
        /Ver imagen/gi,
        /Volver/gi,
        /Diagnóstico/gi,
        /Análisis/gi,
      ];

      const bodyText = document.body.innerText;
      commonHardcodedPatterns.forEach(pattern => {
        if (pattern.test(bodyText)) {
          newWarnings.push(`Possible hardcoded text detected: "${pattern.source}"`);
        }
      });

      setWarnings(newWarnings);
    };

    // Run check after a delay to allow DOM to load
    const timer = setTimeout(detectHardcodedText, 2000);
    return () => clearTimeout(timer);
  }, [i18n.language, isDev]);

  if (!isDev || warnings.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 max-w-md z-50">
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <Languages className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-600">Translation Warnings (Dev Only)</AlertTitle>
          <AlertDescription className="text-amber-600/80 text-xs space-y-1">
            {warnings.slice(0, 3).map((warning, idx) => (
              <div key={idx}>• {warning}</div>
            ))}
            {warnings.length > 3 && (
              <div className="text-xs italic">+ {warnings.length - 3} more warnings</div>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 h-7 text-xs"
              onClick={() => setWarnings([])}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
};
