import React from 'react';
import ThreeJSAnimation from '../../components/imageAnalysis/ThreeJSAnimation';
import SplitSection from '../../components/imageAnalysis/SplitSection';
import AboutUs from '../../components/imageAnalysis/AboutUs';
import HowItWorks from '../../components/imageAnalysis/HowItWorks';
import RealWorldApplications from '../../components/imageAnalysis/RealWorldApplications';
import UploadImage from '../../components/imageAnalysis/UploadImage';
import ContactForm from '../../components/imageAnalysis/ContactForm';
import SectionDivider from '../../components/imageAnalysis/SectionDivider';

function Home() {
  return (
    <div>
      {/* Hero Section - White Background */}
      <ThreeJSAnimation />
      
      {/* Divider transitioning to light mint */}
      <SectionDivider nextSectionColor="bg-light-mint" height={80} useGradient={true} />
      
      {/* Split Section - Light Mint Background */}
      <div className="bg-light-mint">
        <SplitSection />
      </div>
      
      {/* Divider transitioning to white */}
      <SectionDivider nextSectionColor="bg-white" height={80} useGradient={true} />
      
      {/* About Us - White Background */}
      <div className="bg-white">
        <AboutUs />
      </div>
      
      {/* Divider transitioning to light blue */}
      <SectionDivider nextSectionColor="bg-light-blue" height={80} useGradient={true} />
      
      {/* Real World Applications - Light Blue Background */}
      <div className="bg-light-blue">
        <RealWorldApplications />
      </div>
      
      {/* Divider transitioning to white */}
      <SectionDivider nextSectionColor="bg-white" height={80} useGradient={true} />
      
      {/* How It Works - White Background */}
      <div className="bg-white">
        <HowItWorks />
      </div>
      
      {/* Divider transitioning to gradient */}
      <SectionDivider nextSectionColor="" height={80} useGradient={true} />
      
      {/* Upload Image - Gradient Background */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <UploadImage />
      </div>
      
      {/* Divider transitioning to white */}
      <SectionDivider nextSectionColor="bg-white" height={80} useGradient={true} />
      
      {/* Contact Form - White Background */}
      <div className="bg-white">
        <ContactForm />
      </div>
    </div>
  );
}

export default Home; 