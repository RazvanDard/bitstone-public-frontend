import React, { useState, useRef, useEffect } from 'react';

const FileUploader = ({ 
  onFilesSelected, 
  loading, 
  pasteEnabled,
  error
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState('single'); // 'single', 'multiple', or 'zip'
  
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const zipInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Add paste event listener for direct image pasting
  useEffect(() => {
    const handlePaste = (event) => {
      if (!pasteEnabled || loading) return;
      
      const items = event.clipboardData?.items;
      if (!items) return;

      // Find image item
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          // Get file content
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelected([file]);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    
    // Cleanup
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [pasteEnabled, loading]);

  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to trigger folder input click
  const triggerFolderInput = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  // Function to trigger ZIP input click
  const triggerZipInput = () => {
    if (zipInputRef.current) {
      zipInputRef.current.click();
    }
  };

  // Function to handle file selection from any source
  const handleFileSelected = (files) => {
    if (!files || files.length === 0) return;
    
    // Determine upload mode based on files
    if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
      // ZIP file
      setUploadMode('zip');
      setSelectedFiles([files[0]]);
      setPreviews([]);
      
      // Show success message for ZIP
      const successMsg = document.getElementById('paste-success');
      if (successMsg) {
        successMsg.textContent = "ZIP file selected!";
        successMsg.classList.remove('opacity-0');
        successMsg.classList.add('opacity-100');
        setTimeout(() => {
          successMsg.classList.remove('opacity-100');
          successMsg.classList.add('opacity-0');
        }, 3000);
      }
    } else if (files.length > 1) {
      // Multiple images
      setUploadMode('multiple');
      setSelectedFiles(Array.from(files));
      
      // Create previews for multiple images (limit to first 10 for performance)
      const filesToPreview = Array.from(files).slice(0, 10);
      const newPreviews = [];
      
      filesToPreview.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push({
              file: file,
              preview: reader.result
            });
            if (newPreviews.length === filesToPreview.length) {
              setPreviews(newPreviews);
            }
          };
          reader.readAsDataURL(file);
        }
      });
      
      // Show success message
      const successMsg = document.getElementById('paste-success');
      if (successMsg) {
        successMsg.textContent = `${files.length} images selected!`;
        successMsg.classList.remove('opacity-0');
        successMsg.classList.add('opacity-100');
        setTimeout(() => {
          successMsg.classList.remove('opacity-100');
          successMsg.classList.add('opacity-0');
        }, 3000);
      }
    } else {
      // Single image
      setUploadMode('single');
      setSelectedFiles([files[0]]);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews([{
          file: files[0],
          preview: reader.result
        }]);
      };
      reader.readAsDataURL(files[0]);
      
      // Show success message
      const successMsg = document.getElementById('paste-success');
      if (successMsg) {
        successMsg.textContent = "Image selected!";
        successMsg.classList.remove('opacity-0');
        successMsg.classList.add('opacity-100');
        setTimeout(() => {
          successMsg.classList.remove('opacity-100');
          successMsg.classList.add('opacity-0');
        }, 3000);
      }
    }
    
    // Pass the files back to the parent component
    onFilesSelected(files, uploadMode === 'zip' ? 'zip' : (files.length > 1 ? 'multiple' : 'single'));
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelected(files);
    }
  };

  const handleFolderChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Filter only image files from folder
      const imageFiles = Array.from(files).filter(
        file => file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        handleFileSelected(imageFiles);
      }
    }
  };

  const handleZipChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0 && files[0].name.toLowerCase().endsWith('.zip')) {
      handleFileSelected([files[0]]);
    }
  };

  // Function to clear selected image
  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setUploadMode('single');
    
    // Reset the file inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
    if (zipInputRef.current) {
      zipInputRef.current.value = '';
    }
    
    // Notify parent component
    onFilesSelected([], 'single');
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (loading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Check if dropped item is a zip file
      if (e.dataTransfer.files.length === 1 && e.dataTransfer.files[0].name.toLowerCase().endsWith('.zip')) {
        handleFileSelected([e.dataTransfer.files[0]]);
        return;
      }
      
      // Filter only image files
      const imageFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );
      
      if (imageFiles.length > 0) {
        handleFileSelected(imageFiles);
      }
    }
  };

  return (
    <div className="mb-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        id="image-upload"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        multiple
        className="sr-only"
      />
      <input
        type="file"
        id="folder-upload"
        ref={folderInputRef}
        accept="image/*"
        onChange={handleFolderChange}
        multiple
        webkitdirectory=""
        directory=""
        className="sr-only"
      />
      <input
        type="file"
        id="zip-upload"
        ref={zipInputRef}
        accept=".zip"
        onChange={handleZipChange}
        className="sr-only"
      />
      
      {previews.length === 0 ? (
        <div 
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragging 
              ? 'border-white bg-white/10' 
              : 'border-white/50 hover:border-white'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <svg className={`w-12 h-12 ${isDragging ? 'text-white' : 'text-white/80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            <div>
              <p className="font-medium text-white">
                {isDragging ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className="text-sm text-white/80 mt-1">
                PNG, JPG or JPEG (max 10MB each) or ZIP file
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={triggerFileInput}
                className="px-4 py-2 text-sm font-medium text-primary bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Select Files
              </button>
              <button
                type="button"
                onClick={triggerFolderInput}
                className="px-4 py-2 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-md hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Select Folder
              </button>

            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          {uploadMode === 'single' ? (
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={previews[0].preview} 
                alt="Preview" 
                className="w-full object-contain max-h-80" 
              />
              {/* Replace image button with animation */}
              <div 
                onClick={triggerFileInput}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300"
              >
                <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-md font-medium transform transition-transform duration-300 hover:scale-110 hover:shadow-lg">
                  Replace Image
                </span>
              </div>
              {/* X button to remove image */}
              <button
                type="button"
                onClick={clearSelectedFiles}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transform transition-transform duration-200 hover:scale-110"
                aria-label="Remove image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : uploadMode === 'multiple' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedFiles.length} images selected
                </h3>
                <button
                  type="button"
                  onClick={clearSelectedFiles}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {previews.map((item, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden h-32 bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={item.preview} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
                
                {selectedFiles.length > previews.length && (
                  <div className="flex items-center justify-center rounded-lg h-32 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    +{selectedFiles.length - previews.length} more
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFiles[0].name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={clearSelectedFiles}
                className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
                aria-label="Remove file"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center mt-3 text-sm text-white/80">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span>Or paste image directly (Ctrl+V)</span>
        <span 
          id="paste-success" 
          className="ml-2 text-white transition-opacity duration-300 opacity-0"
        >
          Image selected!
        </span>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-sm rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-white">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 