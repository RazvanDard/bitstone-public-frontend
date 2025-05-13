import React, { createContext, useState, useContext, useEffect } from 'react';

// Create language context
const LanguageContext = createContext();

// Define available languages
export const languages = {
  EN: 'en',
  RO: 'ro',
  HU: 'hu',
  DE: 'de'
};

// Language provider component
export const LanguageProvider = ({ children }) => {
  // Get saved language from localStorage or default to Romanian
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || languages.RO;
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Function to change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 