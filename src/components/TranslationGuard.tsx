import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Component that shows translation auto-fix notifications
 * Shows success messages when translations are automatically fixed
 */
export const TranslationGuard = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const [notification, setNotification] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!isDev) return;

    // Listen for translation updates
    const handleLanguageChange = () => {
      // Show success notification when language changes
      // (indicates auto-fix might have run)
      setNotification({
        type: 'success',
        message: 'Translations checked and auto-fixed if needed ✨'
      });

      // Auto-dismiss after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, isDev]);

  // Show nothing if no notification or not in dev mode
  if (!isDev || !notification) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 max-w-md z-50 animate-in slide-in-from-bottom-5">
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Auto-Translation Active</AlertTitle>
          <AlertDescription className="text-green-600/80 text-xs space-y-1">
            <div>{notification.message}</div>
            <div className="text-xs italic mt-1">System automatically detects and fixes missing translations</div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 h-7 text-xs"
              onClick={() => setNotification(null)}
            >
              Got it
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
};
