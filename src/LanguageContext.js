import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Add all your translation keys here
    welcome: 'Welcome',
    logout: 'Logout',
    dashboard: 'Dashboard',
    // ...add more global keys as needed
  },
  hi: {
    welcome: 'स्वागत है',
    logout: 'लॉगआउट',
    dashboard: 'डैशबोर्ड',
    // ...add more global keys as needed
  },
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('selectedLanguage') || 'en');

  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  const t = (key) => {
    // Try to find the key in the current language, fallback to English, then the key itself
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 