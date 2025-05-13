import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ImageAnalysisPage from './components/ImageAnalysisPage';

// TODO: Ensure LanguageProvider is copied to src/context/LanguageContext.js
// and its internal imports are updated if necessary.
import { LanguageProvider } from './context/LanguageContext'; 

function App() {
  return (
    <LanguageProvider>
      <Router> 
         {/* The outer div with bg-background might be redundant if ImageAnalysisPage and Dashboard handle their own backgrounds */}
        {/* Or, ensure it doesn't conflict. For now, it's kept. */}
        <div className="min-h-screen bg-background text-textColor">
          <Routes>
            <Route path="/" element={<ImageAnalysisPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App; 