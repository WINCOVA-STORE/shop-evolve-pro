import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'MXN';

interface CurrencyRates {
  [key: string]: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number, from?: Currency) => number;
  formatPrice: (price: number, from?: Currency) => string;
  rates: CurrencyRates;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (USD as base)
const DEFAULT_RATES: CurrencyRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  MXN: 17.5,
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    return (saved as Currency) || 'USD';
  });
  const [rates, setRates] = useState<CurrencyRates>(DEFAULT_RATES);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // In production, fetch real-time rates from an API
  useEffect(() => {
    // For now, using static rates
    // TODO: Implement real-time currency API (e.g., exchangerate-api.com)
    setRates(DEFAULT_RATES);
  }, []);

  const convertPrice = (price: number, from: Currency = 'USD'): number => {
    const fromRate = rates[from];
    const toRate = rates[currency];
    return (price / fromRate) * toRate;
  };

  const formatPrice = (price: number, from: Currency = 'USD'): string => {
    const converted = convertPrice(price, from);
    const symbols: { [key in Currency]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      MXN: '$',
    };
    
    return `${symbols[currency]}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
