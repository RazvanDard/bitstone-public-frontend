import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import FileUploader from './FileUploader';
import ResultsDisplay from './ResultsDisplay';
import LocationAssigner from './LocationAssigner';

const UrbanIssuesAnalyzer = ({ onImagesUpdate, selectedIssueId }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState('single'); // 'single', 'multiple', or 'zip'
  const [pasteEnabled] = useState(true);
  const [analyzedImages, setAnalyzedImages] = useState([]);
  const [showLocationAssigner, setShowLocationAssigner] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [assignAllMode, setAssignAllMode] = useState(false);
  const selectedImageRef = useRef(null);
  const analyzedImagesSectionRef = useRef(null);
  const [hasScrolledForCurrentAnalysis, setHasScrolledForCurrentAnalysis] = useState(false);

  // Update parent component whenever analyzedImages changes
  useEffect(() => {
    if (onImagesUpdate) {
      // Only include images that have at least one detected urban issue
      const imagesWithIssues = analyzedImages.filter(img => 
        img.results?.urban_issues && Object.values(img.results.urban_issues).some(issue => issue.detected)
      );
      
      // Only call onImagesUpdate if we have actual issues to report
      if (imagesWithIssues.length > 0) {
        onImagesUpdate(imagesWithIssues);
      }
    }
  }, [analyzedImages, onImagesUpdate]);

  // Focus on selected image when selectedIssueId changes
  useEffect(() => {
    if (selectedIssueId && selectedIssueId.startsWith('image-')) {
      // Extract the name from the issue ID format 'image-{name}'
      const imageName = selectedIssueId.substring(6); // Remove 'image-' prefix
      
      // Find the index of the image with this name
      const imageIndex = analyzedImages.findIndex(img => img.name === imageName);
      
      if (imageIndex !== -1) {
        setCurrentImageIndex(imageIndex);
        
        // Scroll to the image card if needed
        if (selectedImageRef.current) {
          selectedImageRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }
      }
    }
  }, [selectedIssueId, analyzedImages]);

  // Reset scroll flag when loading starts
  useEffect(() => {
    if (loading) {
      setHasScrolledForCurrentAnalysis(false);
    }
  }, [loading]);

  // Auto-scroll to analyzed images section when analysis completes and images are present
  useEffect(() => {
    if (!loading && analyzedImages.length > 0 && !hasScrolledForCurrentAnalysis && analyzedImagesSectionRef.current) {
      analyzedImagesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHasScrolledForCurrentAnalysis(true);
    }
  }, [loading, analyzedImages, hasScrolledForCurrentAnalysis]);

  // Function to handle files from FileUploader component
  const handleFilesSelected = (files, mode) => {
    setSelectedFiles(Array.from(files));
    setUploadMode(mode);
    setError('');
    setResults(null);
    setBatchResults([]);
  };

  const createZipFromImages = async (files) => {
    console.log('Creating ZIP from images, count:', files.length);
    const zip = new JSZip();
    
    // Add each file to the zip
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Generate a unique filename in case there are duplicates
      const filename = `image_${i}_${file.name}`;
      zip.file(filename, file);
    }
    
    // Generate the zip file
    console.log('Generating ZIP blob...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    console.log('ZIP blob created, size:', zipBlob.size);
    
    // Create a File object from the Blob
    return new File([zipBlob], 'batch_images.zip', { type: 'application/zip' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (selectedFiles.length === 0) {
      setError('Please select an image to analyze');
      return;
    }

    setLoading(true);
    setError('');

    // Determine backend base URL based on environment
    const backendBaseUrl = process.env.NODE_ENV === 'production'
      ? 'https://bitstone-backend-b7ff3c04c40d.herokuapp.com'
      : 'http://localhost:5000'; // Adjust if your local backend runs on a different port

    const singleAnalyzeUrl = `${backendBaseUrl}/api/analyze`;
    const batchAnalyzeUrl = `${backendBaseUrl}/api/analyze/batch`;

    try {
      console.log('Submitting with mode:', uploadMode, 'Files count:', selectedFiles.length);
      
      if (uploadMode === 'single') {
        // Single image upload
        const formData = new FormData();
        formData.append('image', selectedFiles[0]);

        console.log('Submitting single image to:', singleAnalyzeUrl, selectedFiles[0].name, 'Size:', selectedFiles[0].size, 'Type:', selectedFiles[0].type);
        
        try {
          const response = await fetch(singleAnalyzeUrl, {
            method: 'POST',
            body: formData
          });

          console.log('Response status:', response.status);
          const responseText = await response.text();
          console.log('Response text:', responseText);
          
          if (!response.ok) {
            let errorMessage = 'Server error';
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.error || 'Unknown server error';
            } catch (e) {
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
          }

          try {
            const data = JSON.parse(responseText);
            console.log('Parsed response data:', data);
            setResults(data);
            setBatchResults([]);
            
            // Create a file preview for the image
            const reader = new FileReader();
            reader.onloadend = () => {
              // Get analysis data from the new API structure
              const analysisData = data.analysis;
              
              // Determine the primary issue (the first detected issue)
              const primaryIssue = analysisData.urban_issues 
                ? Object.entries(analysisData.urban_issues)
                    .filter(([_, issueData]) => issueData.detected)
                    .map(([issue]) => issue)[0] || null
                : null;
              
              // Add to analyzed images
              setAnalyzedImages(prev => [...prev, {
                id: data.id,
                file: selectedFiles[0],
                name: selectedFiles[0].name,
                preview: reader.result,
                results: {
                  ...analysisData,
                  primary_issue: primaryIssue
                },
                // Use explicit location if present, otherwise fallback to extracted data
                location: data.location || data.extracted_location_data || null
              }]);
            };
            reader.readAsDataURL(selectedFiles[0]);
            
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            throw new Error('Invalid response from server. Response is not valid JSON.');
          }
        } catch (err) {
          if (err.message.includes('Failed to fetch')) {
            throw new Error(`Cannot connect to the backend server. Is it running at ${backendBaseUrl}?`);
          }
          throw err;
        }
      } else {
        // Multiple images or ZIP file
        let zipFile;
        // Build mapping from zip-internal names to original File objects for non-zip uploads
        let filenameToFileMap = {};
        if (uploadMode !== 'zip') {
          selectedFiles.forEach((file, i) => {
            const zipName = `image_${i}_${file.name}`;
            filenameToFileMap[zipName] = file;
          });
        }
        
        if (uploadMode === 'zip') {
          // Already have a ZIP file
          zipFile = selectedFiles[0];
          console.log('Using existing ZIP file:', zipFile.name);
        } else {
          // Create a ZIP from multiple images
          console.log('Creating ZIP from multiple images...');
          zipFile = await createZipFromImages(selectedFiles);
          console.log('ZIP file created:', zipFile.name, 'Size:', zipFile.size);
        }
        
        // Upload ZIP file to batch endpoint
        const formData = new FormData();
        formData.append('zip_file', zipFile);
        
        try {
          console.log('Submitting to batch endpoint:', batchAnalyzeUrl);
          const response = await fetch(batchAnalyzeUrl, {
            method: 'POST',
            body: formData
          });
          
          console.log('Batch response status:', response.status);
          const responseText = await response.text();
          console.log('Batch response text:', responseText);
          
          if (!response.ok) {
            let errorMessage = 'Server error';
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.error || 'Unknown server error';
            } catch (e) {
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
          }
          
          try {
            const data = JSON.parse(responseText);
            console.log('Parsed batch response data:', data);
            // Reorder results to match selected file order for multiple images
            let orderedResults = data.results;
            if (uploadMode !== 'zip') {
              orderedResults = selectedFiles.map((file, idx) => {
                const expectedName = `image_${idx}_${file.name}`;
                const found = data.results.find(r => r.filename === expectedName);
                return found || { filename: expectedName, success: false, error: 'No result found' };
              });
            }
            setBatchResults(orderedResults);
            setResults(null);
            
            // Create previews for successful images
            const newAnalyzedImages = [];
            
            // Process each result
            orderedResults.forEach((result, index) => {
              if (result.success) {
                // Determine the original file: use mapping for prefixed names if available
                const file = filenameToFileMap[result.filename] || selectedFiles[index];
                
                // Get analysis data from the new API structure
                const analysisData = result.analysis;
                
                // Determine the primary issue
                const primaryIssue = analysisData.urban_issues 
                  ? Object.entries(analysisData.urban_issues)
                      .filter(([_, issueData]) => issueData.detected)
                      .map(([issue]) => issue)[0] || null
                  : null;
                
                newAnalyzedImages.push({
                  id: result.id,
                  file,
                  name: result.filename || file.name,
                  results: {
                    ...analysisData,
                    primary_issue: primaryIssue
                  },
                  // Use explicit location if present, otherwise fallback to extracted data
                  location: result.location || result.extracted_location_data || null
                });
                
                // For the preview, we need to read the file
                if (file && file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    // Update the image with the preview
                    setAnalyzedImages(prev => 
                      prev.map(img => 
                        img.name === result.filename
                          ? { ...img, preview: reader.result }
                          : img
                      )
                    );
                  };
                  reader.readAsDataURL(file);
                }
              }
            });
            
            setAnalyzedImages(prev => [...prev, ...newAnalyzedImages]);
            
          } catch (parseError) {
            console.error('Error parsing batch response:', parseError);
            throw new Error('Invalid response from server. Response is not valid JSON.');
          }
        } catch (err) {
          if (err.message.includes('Failed to fetch')) {
            throw new Error(`Cannot connect to the backend server. Is it running at ${backendBaseUrl}?`);
          }
          throw err;
        }
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(`Error analyzing image: ${err.message}`);
      console.error('Error analyzing image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationButtonClick = (index) => {
    setCurrentImageIndex(index);
    setShowLocationAssigner(true);
  };

  const handleLocationSave = async (updatedImage) => {
    const backendBaseUrl = process.env.NODE_ENV === 'production'
      ? 'https://bitstone-backend-b7ff3c04c40d.herokuapp.com'
      : 'http://localhost:5000';

    if (assignAllMode) {
      const loc = updatedImage.location;
      const imagesToUpdate = analyzedImages.map(img => ({
        ...img,
        location: loc
      }));
      setAnalyzedImages(imagesToUpdate);

      // Optional: PATCH all images in assignAllMode
      // This would require a loop and multiple PATCH requests.
      // For now, focusing on single image update as per primary request.
      // You might want to add a confirmation or a batch update endpoint on the backend.
      console.warn("Assign All Mode: Backend PATCH for multiple images is not yet implemented in this snippet.");

    } else {
      const imageToUpdate = analyzedImages[currentImageIndex];
      const issueId = imageToUpdate?.id; // Get ID from the correct image in state
      const newLocation = updatedImage.location;

      if (!issueId) {
        console.error("Cannot save location: Issue ID is missing for the current image.", imageToUpdate);
        setError("Could not save location: issue ID missing.");
        // Optionally close modal or provide feedback
        setShowLocationAssigner(false);
        setAssignAllMode(false);
        return;
      }

      if (!newLocation) {
        console.error("Cannot save location: New location data is missing.", updatedImage);
        setError("Could not save location: location data missing.");
        setShowLocationAssigner(false);
        setAssignAllMode(false);
        return;
      }

      // Optimistic UI update
      setAnalyzedImages(
        analyzedImages.map((img, idx) =>
          idx === currentImageIndex ? { ...img, ...updatedImage, location: newLocation } : img
        )
      );

      try {
        console.log(`Attempting to PATCH location for issue ID: ${issueId}`);
        const token = localStorage.getItem('authToken'); // Assuming token is stored with key 'authToken'

        const response = await fetch(`${backendBaseUrl}/api/issues/${issueId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ location: newLocation })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Server error during location update.' }));
          console.error('Error updating location on backend:', response.status, errorData);
          setError(`Failed to save location: ${errorData.error || errorData.message || 'Server error'}`);
          // Optionally revert optimistic update here if needed
          // For simplicity, current optimistic update remains.
          return; // Stop further processing on error
        }

        const updatedIssueFromServer = await response.json();
        console.log('Location updated successfully on backend:', updatedIssueFromServer);
        // Update local state with the confirmed data from server to ensure consistency
        setAnalyzedImages(
          analyzedImages.map((img, idx) =>
            idx === currentImageIndex ? { ...img, ...updatedIssueFromServer, id: issueId } : img // Ensure id is string if backend sends ObjectId
          )
        );
        setError(''); // Clear any previous errors

      } catch (error) {
        console.error('Network error or other issue while updating location:', error);
        setError('Network error. Could not save location.');
        // Optionally revert optimistic update here
      }
    }
    setAssignAllMode(false);
    setShowLocationAssigner(false);
  };

  const handleLocationCancel = () => {
    setAssignAllMode(false);
    setShowLocationAssigner(false);
  };

  const renderDetectedIssues = (results) => {
    const analysisData = results.analysis;
    
    if (!analysisData) return null;
    
    const detectedIssues = analysisData.urban_issues 
      ? Object.entries(analysisData.urban_issues)
        .filter(([_, issueData]) => issueData.detected)
      : [];
    
    const wellMaintainedElements = analysisData.well_maintained_elements 
      ? Object.entries(analysisData.well_maintained_elements)
          .filter(([_, elementData]) => elementData && (typeof elementData === 'string' ? elementData.toLowerCase().startsWith("yes") : true))
      : [];

    const elementsToRender = [];

    if (detectedIssues.length > 0) {
      elementsToRender.push(
        <div key="detected-issues-section" className="space-y-6">
          <h3 className="text-lg font-medium dark:text-white">Urban Issues Detected:</h3>
          <div className="space-y-4">
            {detectedIssues.map(([issue, issueData]) => (
              <div key={issue} className="bg-red-50 dark:bg-red-900/20 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-red-100 dark:border-red-900/30 flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-base font-semibold text-red-800 dark:text-red-300">
                      {issue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-200">
                      {issueData.description || "Issue detected in image."}
                    </p>
                  </div>
                </div>
                {issueData.solution && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Recommended Solution</h5>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                          {issueData.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (wellMaintainedElements.length > 0) {
      elementsToRender.push(
        <div key="well-maintained-section" className={`space-y-6 ${detectedIssues.length > 0 ? 'mt-6' : ''}`}>
          <h3 className="text-lg font-medium dark:text-white">Well-Maintained Elements:</h3>
          <div className="space-y-4">
            {wellMaintainedElements.map(([element, elementData]) => (
              <div key={element} className="bg-green-50 dark:bg-green-900/20 rounded-lg overflow-hidden">
                <div className="p-4 flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-base font-semibold text-green-800 dark:text-green-300">
                      {element.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    {typeof elementData === 'string' && (
                      <p className="mt-1 text-sm text-green-700 dark:text-green-200">
                        {elementData.replace(/^Yes\s*with\s*/i, '')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (elementsToRender.length > 0) {
      return <>{elementsToRender}</>;
    } else {
      // This is when neither issues nor positive elements were found
      return (
        <div className="flex items-center mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="ml-3 text-sm font-medium text-green-700 dark:text-green-400">
            No urban issues or notable well-maintained elements detected in this image.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 bg-white p-8 rounded-xl shadow-lg">
          <div className="inline-block mb-4 p-3 rounded-full bg-gradient-to-r from-primary to-secondary">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-black mb-4 tracking-tight">
            Urban Issues <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Detection</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-4"></div>
          <p className="text-lg text-black max-w-2xl mx-auto font-medium">
            Upload images to detect urban issues using AI-powered analysis
          </p>
        </header>

        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-md overflow-hidden mb-8 transition-all duration-300">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Upload Images
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* File uploader component */}
              <FileUploader 
                onFilesSelected={handleFilesSelected}
                loading={loading}
                pasteEnabled={pasteEnabled}
                error={error}
              />
              
              {/* Submit button */}
              <button 
                type="submit" 
                disabled={loading || selectedFiles.length === 0}
                className="w-full bg-white text-primary hover:bg-gray-100 font-medium py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {uploadMode === 'single' ? 'Analyzing...' : `Analyzing ${selectedFiles.length} files...`}
                  </span>
                ) : (
                  uploadMode === 'single' ? 'Analyze Image' : `Analyze ${selectedFiles.length} files`
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results section */}
        <ResultsDisplay 
          loading={loading}
          results={results}
          batchResults={batchResults}
          uploadMode={uploadMode}
          selectedFiles={selectedFiles}
          renderDetectedIssues={renderDetectedIssues}
        />

        {/* List of analyzed images with location assignment */}
        {analyzedImages.length > 0 && (
          <div 
            ref={analyzedImagesSectionRef}
            className="mt-12 bg-gradient-to-r from-primary to-secondary shadow-lg rounded-xl overflow-hidden transition-all duration-300"
          >
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Analyzed Images
              </h2>
              <button
                onClick={() => { setAssignAllMode(true); setShowLocationAssigner(true); }}
                className="mb-4 px-4 py-2 bg-white text-primary text-sm rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Mark all as same location
              </button>
              <div className="space-y-6">
                <p className="text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Assign locations to your analyzed images to view them on the map.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyzedImages.map((image, index) => (
                    <div 
                      key={index} 
                      className={`rounded-xl overflow-hidden bg-white shadow-md transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                        selectedIssueId === `image-${image.name}` ? 'ring-2 ring-primary' : ''
                      }`}
                      ref={selectedIssueId === `image-${image.name}` ? selectedImageRef : null}
                    >
                      {image.preview && (
                        <div className="relative aspect-w-16 aspect-h-9 bg-gray-100">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="object-cover w-full h-full"
                          />
                          {image.results?.primary_issue && (
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary to-secondary text-white">
                                {image.results.primary_issue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 truncate">
                          {image.name}
                        </h3>
                        
                        {image.results && image.results.urban_issues && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(image.results.urban_issues)
                                .filter(([_, issueData]) => issueData.detected)
                                .map(([issue], i) => (
                                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    {issue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 mb-3 flex items-center">
                          {image.location ? (
                            <div className="flex items-center text-green-600">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {image.location.address || `${image.location.lat.toFixed(4)}, ${image.location.lng.toFixed(4)}`}
                            </div>
                          ) : (
                            <div className="flex items-center text-amber-600">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              No location assigned
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleLocationButtonClick(index)}
                          className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-primary to-secondary text-white text-sm rounded-lg hover:opacity-90 transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {image.location ? 'Edit Location' : 'Assign Location'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Location Assigner Modal */}
        {showLocationAssigner && (assignAllMode || currentImageIndex !== null) && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl relative">
              {/* Sticky X Close Button */}
              <button 
                onClick={handleLocationCancel} 
                className="absolute top-3 right-3 text-white hover:text-gray-300 transition-colors z-[5001] p-2 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40"
                aria-label="Close location assigner"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <LocationAssigner 
                image={assignAllMode ? {} : analyzedImages[currentImageIndex]}
                onSave={handleLocationSave}
                onCancel={handleLocationCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrbanIssuesAnalyzer; 