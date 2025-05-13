import React from 'react';
import { useTranslation } from '../../hooks/useTranslation'; // Adjusted path
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function UploadImage() {
  const t = useTranslation();
  const navigate = useNavigate(); // Get the navigate function
  
  return (
    <section id="upload-section" className="py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.tryOurAiNow}</h2>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-3xl mx-auto">
            {t.uploadImageDesc}
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-xl">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md mb-8">
                <label
                  htmlFor="file-upload"
                  onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} // Modified to prevent default and navigate
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-white border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-12 h-12 mb-4 text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-lg text-white">
                      <span className="font-semibold">{t.clickToUpload}</span> {t.orDragAndDrop}
                    </p>
                    <p className="text-sm text-white/80">
                      {t.supportedFormats}
                    </p>
                  </div>
                  <input id="file-upload" type="file" className="hidden" />
                </label>
              </div>

              {/* Single Centered Button */}
              <div className="w-full max-w-xs mx-auto">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-6 py-3 bg-white rounded-lg font-medium text-primary hover:bg-opacity-90 transition-colors text-lg"
                >
                  {t.detectIssues}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row gap-6 justify-center items-center">
            <div className="flex items-center">
              <div className="mr-3 bg-white/20 p-2 rounded-full">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-white">{"Complet Gratuit"}</span>
            </div>
            <div className="flex items-center">
              <div className="mr-3 bg-white/20 p-2 rounded-full">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-white">{"Analize Nelimitate"}</span>
            </div>
            <div className="flex items-center">
              <div className="mr-3 bg-white/20 p-2 rounded-full">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-white">{"Simplu și Rapid"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UploadImage; 