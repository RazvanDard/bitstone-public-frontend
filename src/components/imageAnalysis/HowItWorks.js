import React from 'react';
import { useTranslation } from '../../hooks/useTranslation'; // Adjusted path

function HowItWorks() {
  const t = useTranslation();
  
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-10 text-center">{t.howItWorks}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center relative">
            <div className="hidden md:block absolute top-6 left-1/2 right-0 h-0.5 bg-secondary" style={{ width: 'calc(100% - 1.5rem)', left: 'calc(50% + 1.5rem)' }}></div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">1</div>
            <h3 className="text-xl font-semibold mb-3">{t.dataCollection}</h3>
            <p className="text-gray-600">{t.dataCollectionDesc2}</p>
          </div>
          
          <div className="text-center relative">
            <div className="hidden md:block absolute top-6 left-1/2 right-0 h-0.5 bg-secondary" style={{ width: 'calc(100% - 1.5rem)', left: 'calc(50% + 1.5rem)' }}></div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">2</div>
            <h3 className="text-xl font-semibold mb-3">{t.aiAnalysis}</h3>
            <p className="text-gray-600">{t.aiAnalysisDesc2}</p>
          </div>
          
          <div className="text-center relative">
            <div className="hidden md:block absolute top-6 left-1/2 right-0 h-0.5 bg-secondary" style={{ width: 'calc(100% - 1.5rem)', left: 'calc(50% + 1.5rem)' }}></div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">3</div>
            <h3 className="text-xl font-semibold mb-3">{t.alertGeneration}</h3>
            <p className="text-gray-600">{t.alertGenerationDesc}</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">4</div>
            <h3 className="text-xl font-semibold mb-3">{t.resolutionTracking}</h3>
            <p className="text-gray-600">{t.resolutionTrackingDesc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks; 