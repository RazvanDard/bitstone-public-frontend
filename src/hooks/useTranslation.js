import { useLanguage } from '../context/LanguageContext'; // Adjusted path
import { translations } from '../translations'; // Adjusted path

/**
 * Custom hook to access translations based on the current language
 * @returns {Object} Translation object for the current language
 */
export const useTranslation = () => {
  const { language } = useLanguage();
  
  // Get translations for the current language
  const t = translations[language];
  
  return t;
}; 