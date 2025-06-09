import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CurrencyContextType {
  selectedCurrency: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

// Currency mapping based on locale
const getCurrencyFromLocale = (locale: string): string => {
  const currencyMap: Record<string, string> = {
    'en-GB': '£',
    'en-US': '$',
    'en-CA': '$',
    'en-AU': '$',
    'en-NZ': '$',
    'de-DE': '€',
    'fr-FR': '€',
    'es-ES': '€',
    'it-IT': '€',
    'nl-NL': '€',
    'pt-PT': '€',
    'ja-JP': '¥',
    'ko-KR': '₩',
    'zh-CN': '¥',
    'ru-RU': '₽',
    'in-IN': '₹',
  };

  // Try exact match first
  if (currencyMap[locale]) {
    return currencyMap[locale];
  }

  // Try language code only
  const languageCode = locale.split('-')[0];
  const languageMap: Record<string, string> = {
    'en': '$',
    'de': '€',
    'fr': '€',
    'es': '€',
    'it': '€',
    'nl': '€',
    'pt': '€',
    'ja': '¥',
    'ko': '₩',
    'zh': '¥',
    'ru': '₽',
    'hi': '₹',
  };

  return languageMap[languageCode] || '£'; // Default to GBP
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('£');

  // Initialize currency based on browser locale
  useEffect(() => {
    const browserLocale = navigator.language || 'en-GB';
    const detectedCurrency = getCurrencyFromLocale(browserLocale);
    setSelectedCurrency(detectedCurrency);
  }, []);

  const setCurrency = (currency: string) => {
    setSelectedCurrency(currency);
  };

  const value = {
    selectedCurrency,
    setCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};