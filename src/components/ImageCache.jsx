import React, { useState, useEffect } from 'react';

// Cache to store loaded image statuses globally
const globalImageCache = new Map();

const ImageCache = ({ 
  src, 
  alt, 
  root = null,  // custom scroll root for IntersectionObserver
  className, 
  placeholderSrc = '/placeholder.svg',
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(globalImageCache.has(src) ? src : placeholderSrc);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(globalImageCache.has(src));
  const containerRef = React.useRef(null);

  useEffect(() => {
    if (!src) {
      setImageSrc(placeholderSrc);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // Observe for viewport or custom root entry to trigger load
    if (!shouldLoad && containerRef.current) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      }, { root: root || null, rootMargin: '0px', threshold: 0.1 });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
    // If image is already cached or should load
    if (!shouldLoad) return;
    if (globalImageCache.has(src)) {
      setImageSrc(src);
      setHasError(false);
      return;
    }

    // Load the image and update cache
    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      globalImageCache.set(src, true);
      setImageSrc(src);
      setIsLoading(false);
      if (onLoad) onLoad();
    };
    
    img.onerror = (error) => {
      console.error(`Failed to load image: ${src}`, error);
      setImageSrc(placeholderSrc);
      setHasError(true);
      setIsLoading(false);
      if (onError) onError(error);
    };
    
    img.src = src;
    
    return () => {
      // Clean up event listeners
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholderSrc, onLoad, onError, shouldLoad, root]);

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <img
        src={imageSrc}
        alt={alt || "Image"} 
        className={`${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300 ${className || ''}`}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default ImageCache; 