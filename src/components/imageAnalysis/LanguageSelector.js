import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, languages } from '../../context/LanguageContext'; // Corrected path
import { translations } from '../../translations'; // Corrected path

function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (lang) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  // Get translations for current language
  const t = translations[language];

  // Get the language code to display in the button
  const getLanguageCode = () => {
    if (language === languages.EN) return 'EN';
    if (language === languages.RO) return 'RO';
    if (language === languages.HU) return 'HU';
    if (language === languages.DE) return 'DE';
    return 'RO'; // Default to Romanian
  };

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={togglePopup}
        className="flex items-center px-4 py-2 text-gray-700 font-medium hover:text-primary transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {getLanguageCode()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
          <div className="px-4 py-2 text-sm text-gray-500 font-bold border-b border-gray-100">
            {t.selectLanguage}
          </div>
          <button
            onClick={() => handleLanguageSelect(languages.EN)}
            className={`w-full text-left px-4 py-2 text-sm ${language === languages.EN ? 'text-primary font-medium' : 'text-gray-700'} hover:bg-gray-50`}
          >
            {t.english}
          </button>
          <button
            onClick={() => handleLanguageSelect(languages.RO)}
            className={`w-full text-left px-4 py-2 text-sm ${language === languages.RO ? 'text-primary font-medium' : 'text-gray-700'} hover:bg-gray-50`}
          >
            {t.romanian}
          </button>
          <button
            onClick={() => handleLanguageSelect(languages.HU)}
            className={`w-full text-left px-4 py-2 text-sm ${language === languages.HU ? 'text-primary font-medium' : 'text-gray-700'} hover:bg-gray-50`}
          >
            {t.hungarian}
          </button>
          <button
            onClick={() => handleLanguageSelect(languages.DE)}
            className={`w-full text-left px-4 py-2 text-sm ${language === languages.DE ? 'text-primary font-medium' : 'text-gray-700'} hover:bg-gray-50`}
          >
            {t.german}
          </button>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector; 