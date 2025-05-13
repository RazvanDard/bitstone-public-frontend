import React from 'react';

function Video() {
  return (
    <div className="rounded-lg overflow-hidden shadow-xl">
      {/* Local video file - ensure /videos/video.mp4 is in your main public/videos/ folder */}
      <div className="relative aspect-w-16 aspect-h-9">
        <video
          className="absolute w-full h-full object-cover"
          controls
          preload="metadata"
        >
          <source src="/videos/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default Video; 