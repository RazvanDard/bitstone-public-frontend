import React from 'react';
import ImageAnalysis from './ImageAnalysis';
import BatchAnalysis from './BatchAnalysis';
import LoadingIndicator from './LoadingIndicator';

const ResultsDisplay = ({ 
  loading, 
  results, 
  batchResults, 
  uploadMode, 
  selectedFiles,
  renderDetectedIssues
}) => {
  if (loading) {
    return (
      <LoadingIndicator 
        uploadMode={uploadMode} 
        selectedFiles={selectedFiles} 
      />
    );
  }
  
  if (results) {
    return (
      <ImageAnalysis 
        results={results} 
        renderDetectedIssues={renderDetectedIssues} 
      />
    );
  }
  
  if (batchResults.length > 0) {
    return (
      <BatchAnalysis 
        batchResults={batchResults} 
        renderDetectedIssues={renderDetectedIssues} 
      />
    );
  }
  
  return null;
};

export default ResultsDisplay; 