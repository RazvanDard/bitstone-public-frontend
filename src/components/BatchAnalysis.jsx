import React from 'react';

const BatchAnalysis = ({ batchResults, renderDetectedIssues }) => {
  const successfulResults = batchResults.filter(result => result.success);
  const failedResults = batchResults.filter(result => !result.success);
  
  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Batch Analysis Results
        </h2>
        
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-sm font-medium text-white">
                {successfulResults.length} successful
              </span>
            </div>
            {failedResults.length > 0 && (
              <div className="bg-red-500 bg-opacity-20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium text-white">
                  {failedResults.length} failed
                </span>
              </div>
            )}
          </div>
          
          {successfulResults.map((result, index) => (
            <div key={index} className="bg-white bg-opacity-10 rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="border-b border-white border-opacity-20 px-4 py-3 bg-white bg-opacity-5">
                <h3 className="font-medium text-white truncate">
                  {result.filename}
                </h3>
              </div>
              <div className="p-4">
                {renderDetectedIssues(result)}
                {result.analysis && result.analysis.additional_details && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Analysis Details
                    </h3>
                    <div className="bg-white bg-opacity-10 rounded-lg p-4">
                      <p className="text-white whitespace-pre-line">
                        {result.analysis.additional_details}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {failedResults.length > 0 && (
            <div className="bg-red-500 bg-opacity-10 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-white mb-2">Failed to process:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {failedResults.map((result, index) => (
                  <li key={index} className="text-sm text-white">
                    {result.filename}: {result.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchAnalysis; 