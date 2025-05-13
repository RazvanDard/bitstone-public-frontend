import React from 'react';
import { useTranslation } from '../../hooks/useTranslation'; // Adjusted path

function AboutUs() {
  const t = useTranslation();
  
  return (
    <section id="about" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">{t.ourMission}</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            {/* Actual image from the internet */}
            <div className="rounded-lg shadow-md h-64 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt={t.teamMeetingAlt} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:w-1/2">
            <p className="text-textColor mb-4 text-lg">
              {t.missionParagraph1}
            </p>
            <p className="text-textColor text-lg">
              {t.missionParagraph2}
            </p>
            {/* Add more content, team members, values etc. as needed */}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs; 