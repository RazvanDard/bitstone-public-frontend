import React from 'react';
import './imageAnalysisPage.css'; // Styles we created for animations

// TODO: Ensure these components are copied to the specified paths
// and their internal imports are updated.
import Navbar from './imageAnalysis/Navbar'; 
import Footer from './imageAnalysis/Footer';
import Home from '../pages/imageAnalysis/Home'; // Corrected path

// LanguageProvider will be used in App.jsx to wrap routes

function ImageAnalysisPage() {
  return (
    // The className "bg-background" relies on the --background CSS variable
    // being defined in your global src/index.css
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <Home />
      </main>
      <Footer />
    </div>
  );
}

export default ImageAnalysisPage; 