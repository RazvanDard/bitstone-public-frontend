import React from 'react';
import { useTranslation } from '../../hooks/useTranslation'; // Adjusted path

function Hero() {
  const t = useTranslation();
  
  return (
    <div className="text-left">
      <h2 className="text-4xl font-bold text-primary mb-4 leading-tight">
        {t.transformingCities}
      </h2>
      <p className="text-lg text-textColor mb-6">
        {t.leverageCuttingEdge}
      </p>
      <button className="bg-secondary text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-opacity-90 transition-colors shadow-md">
        {t.getStarted}
      </button>
      {/* You could add another secondary button here */}
    </div>
  );
}

export default Hero; 