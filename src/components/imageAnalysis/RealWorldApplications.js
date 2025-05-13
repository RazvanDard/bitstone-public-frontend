import React from 'react';
import { useTranslation } from '../../hooks/useTranslation'; // Adjusted path

function RealWorldApplications() {
  const t = useTranslation();
  
  return (
    <section id="examples" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-10 text-center">{t.realWorldApplications}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="relative">
              {/* Ensure /images/pothole.jpg is in main public/images folder */}
              <img 
                src="/images/pothole.jpg" 
                alt="Pothole detection" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 bg-accent text-white text-sm font-medium py-1 px-3 rounded-full">
                {t.roadIssues}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3">{t.potholeDetection}</h3>
              <p className="text-gray-600">{t.potholeDesc}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="relative">
              {/* Ensure /images/light1.jpg is in main public/images folder */}
              <img 
                src="/images/light1.jpg" 
                alt="Streetlight monitoring" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 bg-accent text-white text-sm font-medium py-1 px-3 rounded-full">
                {t.safety}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3">{t.streetlightMonitoring}</h3>
              <p className="text-gray-600">{t.streetlightDesc}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="relative">
              {/* Ensure /images/waste.jpg is in main public/images folder */}
              <img 
                src="/images/waste.jpg" 
                alt="Waste management" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 bg-accent text-white text-sm font-medium py-1 px-3 rounded-full">
                {t.sanitation}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3">{t.wasteManagement}</h3>
              <p className="text-gray-600">{t.wasteDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RealWorldApplications; 