import { Globe, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";

export const LanguageCurrencySelector = () => {
  const { i18n, t } = useTranslation();
  const { currency, setCurrency } = useCurrency();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  // Only USD visible, but keep others in code for future
  const currencies: { code: Currency; name: string; visible: boolean }[] = [
    { code: 'USD', name: t('currency.usd'), visible: true },
    { code: 'EUR', name: t('currency.eur'), visible: false },
    { code: 'GBP', name: t('currency.gbp'), visible: false },
    { code: 'MXN', name: t('currency.mxn'), visible: false },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="flex items-center gap-1">
      {/* Language Selector with Flags */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-secondary-foreground hover:bg-secondary/80 hover:scale-105 transition-all gap-1 px-2"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xl">{currentLanguage.flag}</span>
            <span className="hidden sm:inline text-xs font-semibold">{currentLanguage.code.toUpperCase()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background z-50">
          <DropdownMenuLabel className="text-xs">Language / Idioma / 语言</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`cursor-pointer hover:bg-primary/10 transition-colors ${
                i18n.language === lang.code ? "bg-primary/20 font-semibold" : ""
              }`}
            >
              <span className="text-xl mr-3">{lang.flag}</span>
              <span>{lang.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Currency Selector - Only USD visible */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-secondary-foreground hover:bg-secondary/80 hover:scale-105 transition-all gap-0.5 px-2"
          >
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-bold">{currency}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background z-50">
          <DropdownMenuLabel className="text-xs">Currency</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {currencies.filter(curr => curr.visible).map((curr) => (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => setCurrency(curr.code)}
              className={`cursor-pointer hover:bg-primary/10 transition-colors ${
                currency === curr.code ? "bg-primary/20 font-semibold" : ""
              }`}
            >
              {curr.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
