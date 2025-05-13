import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation'; // Adjusted path
import { useLanguage } from '../../context/LanguageContext'; // Adjusted path

// Helper function to interpolate between two hex colors
function interpolateColor(startHex, endHex, factor) {
  let r1 = parseInt(startHex.slice(1, 3), 16);
  let g1 = parseInt(startHex.slice(3, 5), 16);
  let b1 = parseInt(startHex.slice(5, 7), 16);

  let r2 = parseInt(endHex.slice(1, 3), 16);
  let g2 = parseInt(endHex.slice(3, 5), 16);
  let b2 = parseInt(endHex.slice(5, 7), 16);

  let r = Math.round(r1 + (r2 - r1) * factor);
  let g = Math.round(g1 + (g2 - g1) * factor);
  let b = Math.round(b1 + (b2 - b1) * factor);

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  const toHex = (c) => {
    const hexVal = c.toString(16);
    return hexVal.length === 1 ? "0" + hexVal : hexVal;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function DynamicTitle() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const t = useTranslation();
  const { language } = useLanguage();

  // Define titles with translations and calculated interpolated styles
  const getTitles = () => {
    const startColor = "#1d917d";
    const endColor = "#265c60"; 

    const titlesConfig = [
      { textKey: t.cities || "cities", interpolationFactor: 0 },
      { textKey: t.infrastructure || "infrastructure", interpolationFactor: 0.25 },
      { textKey: t.roads || "roads", interpolationFactor: 0.50 },
      { textKey: t.buildings || "buildings", interpolationFactor: 0.75 },
      { textKey: t.urbanSpaces || "urban spaces", interpolationFactor: 1.0 }
    ];
    return titlesConfig.map(item => ({
      text: item.textKey,
      style: { color: interpolateColor(startColor, endColor, item.interpolationFactor) }
    }));
  };

  // Reset animation when language changes
  useEffect(() => {
    setCurrentWord('');
    setIsDeleting(false);
    setTitleIndex(0);
  }, [language]);

  useEffect(() => {
    const titles = getTitles();
    const current = titles[titleIndex];
    
    const timeout = setTimeout(() => {
      // If deleting, remove the last character
      if (isDeleting) {
        setCurrentWord(prev => prev.slice(0, -1));
        setTypingSpeed(60);
      } 
      // If typing, add the next character
      else if (currentWord.length < current.text.length) {
        setCurrentWord(prev => current.text.slice(0, prev.length + 1));
        setTypingSpeed(150);
      }
      
      // If word is complete, start deleting after a pause
      if (!isDeleting && currentWord === current.text) {
        setTimeout(() => setIsDeleting(true), 1500);
      }
      
      // If word is deleted, move to next word
      if (isDeleting && currentWord === '') {
        setIsDeleting(false);
        setTitleIndex((prev) => (prev + 1) % titles.length);
        setTypingSpeed(150);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentWord, isDeleting, titleIndex, typingSpeed, language, getTitles]); // Added getTitles to dependency array

  const titles = getTitles();

  return (
    <div className="mb-4">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
        {t.aiPoweredAnalysisFor}{' '}
        <span style={titles[titleIndex].style} className="inline-flex items-center">
          {currentWord}
          <span className="animate-blink ml-1"></span>
        </span>
      </h1>
    </div>
  );
}

export default DynamicTitle; 