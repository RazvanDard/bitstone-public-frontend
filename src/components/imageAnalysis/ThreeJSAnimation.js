import React from 'react';
import DynamicTitle from './DynamicTitle'; // Will be in the same folder
import { useTranslation } from '../../hooks/useTranslation'; // Adjusted path
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function ThreeJSAnimation() {
  const t = useTranslation();
  const navigate = useNavigate(); // Get the navigate function

  return (
    <div className="relative h-[650px] bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden flex flex-col justify-center">
      {/* Background pattern/decoration */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animate-blob-color"></div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animate-blob-color animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animate-blob-color animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-6 z-10 text-center md:text-left h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <DynamicTitle />
            <p className="mt-4 text-lg md:text-xl text-gray-600 mb-8">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-md hover:opacity-90 transition-colors font-medium text-center"
              >
                {t.seeItInAction}
              </button>
              <a 
                href="#split-hero" 
                className="px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors font-medium text-center"
              >
                {t.learnMore}
              </a>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Local video file */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-white/40 backdrop-blur-sm">
                <div className="relative aspect-w-16 aspect-h-9 w-full">
                  <video
                    className="absolute w-full h-full object-cover"
                    controls
                    preload="metadata"
                  >
                    <source src="/videos/video.mp4" type="video/mp4" />
                    {t.browserNotSupportVideo}
                  </video>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary rounded-lg transform rotate-12 opacity-70"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary rounded-full transform opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreeJSAnimation; 