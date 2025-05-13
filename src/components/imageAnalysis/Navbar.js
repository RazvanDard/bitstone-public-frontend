import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage, languages } from '../../context/LanguageContext';
import RegisterModal from '../auth/RegisterModal';
import LoginModal from '../auth/LoginModal';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const t = useTranslation();
  const { changeLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setActiveDropdown(null);
  };

  const handleDropdownEnter = (dropdown) => {
    clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(dropdown);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // 300ms delay before closing dropdown
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleEnglishSelect = () => {
    changeLanguage(languages.EN);
    setActiveDropdown(null);
  };

  const handleRomanianSelect = () => {
    changeLanguage(languages.RO);
    setActiveDropdown(null);
  };

  const handleHungarianSelect = () => {
    changeLanguage(languages.HU);
    setActiveDropdown(null);
  };

  const handleGermanSelect = () => {
    changeLanguage(languages.DE);
    setActiveDropdown(null);
  };

  return (
    <>
      <div className="sticky top-4 z-50 px-4">
        <nav className={`bg-white ${scrolled ? 'shadow-lg' : 'shadow-sm'} rounded-xl transition-all duration-300`}>
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center h-20">
              <div className="flex-shrink-0">
                <a href="/" className="flex items-center">
                  <img src="/images/snap-the-issue-logo.jpg" alt="Snap The Issue Logo" className="h-10 w-auto" />
                </a>
              </div>

              <div className="hidden md:flex items-center">
                <a href="#split-hero" className="px-4 py-2 text-gray-700 font-medium hover:text-primary transition-colors">
                  Solutions
                </a>

                <a href="#about" className="px-4 py-2 text-gray-700 font-medium hover:text-primary transition-colors">
                  Our mission
                </a>

                <a href="#examples" className="px-4 py-2 text-gray-700 font-medium hover:text-primary transition-colors">
                  Application
                </a>
                  
                <a href="#contact" className="px-4 py-2 text-gray-700 font-medium hover:text-primary transition-colors">
                  Contact us
                </a>
                
                <LanguageSelector />
              </div>

              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2 text-gray-700 font-medium hover:text-primary transition-colors"
                >
                  Register
                </button>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-md hover:opacity-90 transition-colors font-medium"
                >
                  Scan now
                </button>
              </div>

              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden bg-white shadow-lg rounded-b-xl">
              <div className="px-4 pt-2 pb-3 space-y-1">
                <div className="py-2 border-b border-gray-100">
                  <a href="#split-hero" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary">
                    Solutions
                  </a>
                </div>

                <div className="py-2 border-b border-gray-100">
                  <a href="#about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary">
                    Our mission
                  </a>
                </div>

                <div className="py-2 border-b border-gray-100">
                  <a href="#examples" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary">
                    Application
                  </a>
                </div>

                <a href="#contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary">
                  Contact us
                </a>

                <div className="py-2 border-b border-gray-100">
                  <button onClick={() => toggleDropdown('mobile-language')} className="w-full flex justify-between items-center px-3 py-2 text-base font-medium text-gray-700">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      {t.language}
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-language' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  {activeDropdown === 'mobile-language' && (
                    <div className="mt-2 pl-4 space-y-2">
                      <button onClick={handleEnglishSelect} className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:text-primary">English</button>
                      <button onClick={handleRomanianSelect} className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:text-primary">Română</button>
                      <button onClick={handleHungarianSelect} className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:text-primary">Magyar</button>
                      <button onClick={handleGermanSelect} className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:text-primary">Deutsch</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 space-y-2">
                <button
                  onClick={() => {
                    setShowRegisterModal(true);
                    setIsOpen(false);
                  }}
                  className="block w-full text-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md"
                >
                  Register
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsOpen(false);
                  }}
                  className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-md hover:opacity-90 transition-colors font-medium"
                >
                  Scan now
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>
      <RegisterModal
        show={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}

export default Navbar; 