import React from 'react';

const ImageAnalysis = ({ results, renderDetectedIssues }) => {
  // Access analysis data from the new API structure
  const analysisData = results.analysis;

  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Analysis Results
        </h2>
        
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {renderDetectedIssues(results)}

          {analysisData.additional_details && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-3">
                Analysis Details
              </h3>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="text-white whitespace-pre-line">
                  {analysisData.additional_details}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysis; 