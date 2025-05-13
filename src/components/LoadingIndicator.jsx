import React from 'react';

const LoadingIndicator = ({ uploadMode, selectedFiles }) => {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-md overflow-hidden p-8 text-center transition-all duration-300">
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-white">
          Analyzing with Gemini AI...
        </p>
        <p className="mt-2 text-sm text-white text-opacity-80">
          {uploadMode === 'single' 
            ? 'This may take a few moments' 
            : `Processing ${selectedFiles.length} files. This may take several minutes.`
          }
        </p>
      </div>
    </div>
  );
};

export default LoadingIndicator; 