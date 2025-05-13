import React from 'react';
import Hero from './Hero';
import Video from './Video';

function SplitSection() {
  return (
    <section id="split-hero" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <Hero />
          </div>
          <div className="md:w-1/2">
            <Video />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SplitSection; 