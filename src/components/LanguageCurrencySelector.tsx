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
  ];

  const currencies: { code: Currency; name: string }[] = [
    { code: 'USD', name: t('currency.usd') },
    { code: 'EUR', name: t('currency.eur') },
    { code: 'GBP', name: t('currency.gbp') },
    { code: 'MXN', name: t('currency.mxn') },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-secondary-foreground hover:bg-secondary/80">
            <Globe className="h-4 w-4 mr-2" />
            <span className="text-lg mr-1">{currentLanguage.flag}</span>
            {currentLanguage.code.toUpperCase()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={i18n.language === lang.code ? "bg-accent" : ""}
            >
              <span className="text-lg mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Currency Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-secondary-foreground hover:bg-secondary/80">
            <DollarSign className="h-4 w-4 mr-1" />
            {currency}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Currency</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {currencies.map((curr) => (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => setCurrency(curr.code)}
              className={currency === curr.code ? "bg-accent" : ""}
            >
              {curr.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
