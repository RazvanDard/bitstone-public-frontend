import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UrbanIssuesAnalyzer from './UrbanIssuesAnalyzer';
import MapView from './MapView';
import IssuesList from './IssuesList';

// Add API_BASE for backend endpoints
// const API_BASE = 'http://localhost:5000/api';
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://bitstone-backend-b7ff3c04c40d.herokuapp.com/api'
  : 'http://localhost:5000/api';

const Dashboard = () => {
  // Track already-patched issue IDs to avoid duplicate calls
  const processedPatches = useRef(new Set());
  const [activeView, setActiveView] = useState('urban-issues');
  const [analyzedImages, setAnalyzedImages] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Map state that should persist between tab switches
  const [mapCenter, setMapCenter] = useState([45.9443, 25.0094]); // Center of Romania
  const [mapZoom, setMapZoom] = useState(7);
  const [currentLocation, setCurrentLocation] = useState(null);

  const navigate = useNavigate();

  // Fetch persisted issues from backend on mount
  useEffect(() => {
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    // Add loading state or error handling if needed
    fetch(`${API_BASE}/issues`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch issues: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched issues from MongoDB:', data);
        const formatted = data.map((doc) => {
          // Extract detected issues from analysis
          const categories = [];
          if (doc.analysis?.urban_issues) {
            for (const [issue, info] of Object.entries(doc.analysis.urban_issues)) {
              if (info.detected) categories.push(issue);
            }
          }
          
          // Use the first detected issue as primary if available
          const primary = categories[0] || null;
          
          // Ensure location data is properly structured
          let locationData = doc.location;
          
          // Debug location data
          console.log(`Issue ${doc._id} location:`, locationData);
          
          // If location exists but lat/lng are not valid numbers, try to parse them
          if (locationData) {
            try {
              // Create a new location object with properly parsed coordinates
              locationData = {
                ...locationData,
                lat: typeof locationData.lat === 'number' ? locationData.lat : parseFloat(locationData.lat),
                lng: typeof locationData.lng === 'number' ? locationData.lng : parseFloat(locationData.lng)
              };
              
              // If parsing results in NaN, set location to null
              if (isNaN(locationData.lat) || isNaN(locationData.lng)) {
                console.warn(`Invalid coordinates for issue ${doc._id}, setting location to null`);
                locationData = null;
              } else {
                console.log("Converted location to numbers:", locationData);
              }
            } catch (e) {
              console.error("Failed to parse location coordinates:", e);
              locationData = null;
            }
          }
          
          return {
            id: doc._id,
            location: locationData,
            title: doc.filename,
            category: primary,
            categories: categories.length > 0 ? categories : [primary].filter(Boolean),
            preview: doc.image_url, // S3 image URL
            details: doc.analysis || {}, // Store all analysis data for details view
            s3_key: doc.s3_key, // Store S3 key if we need it later
            created_at: doc.created_at,
            solved: doc.solved || false
          };
        });
        
        // Log locations for debugging
        console.log('Issues with locations:', formatted.filter(issue => issue.location));
        console.log('Issues without locations:', formatted.filter(issue => !issue.location));
        
        setIssues(formatted);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching issues:', err);
        setError(`Failed to load issues: ${err.message}`);
        setIsLoading(false);
      });
  }, []);

  // Convert analyzedImages to issues format whenever it changes
  useEffect(() => {
    if (analyzedImages && analyzedImages.length > 0) {
      // Create issues from analyzedImages that have locations
      const imageIssues = analyzedImages
        .filter(image => image.location && image.location.lat && image.location.lng)
        .map(image => {
          // Extract all detected issues from the results
          const categories = [];
          if (image.results?.urban_issues) {
            for (const [issue, data] of Object.entries(image.results.urban_issues)) {
              if (data.detected) {
                categories.push(issue);
              }
            }
          }

          return {
            id: `image-${image.name}`,
            location: image.location,
            title: image.name,
            // Use all categories or primary one if no categories detected
            category: image.results?.primary_issue || 'default',
            categories: categories.length > 0 ? categories : [image.results?.primary_issue].filter(Boolean),
            preview: image.preview,
            details: image.results,
            solved: image.solved || false
          };
        });
      
      console.log("Dashboard - converted images to issues:", imageIssues);
      
      // Add to issues but avoid duplicates by checking the id
      setIssues(prevIssues => {
        // Create a map of existing issue IDs
        const existingIssueIds = new Set(prevIssues.map(issue => issue.id));
        
        // Filter out any image issues that already exist in the current issues
        const newImageIssues = imageIssues.filter(issue => !existingIssueIds.has(issue.id));
        
        // Keep existing issues that aren't in the new batch to preserve their properties
        const updatedExistingIssues = prevIssues.map(existingIssue => {
          const matchingNewIssue = imageIssues.find(issue => issue.id === existingIssue.id);
          return matchingNewIssue || existingIssue;
        });
        
        // Return the combined array
        return [...updatedExistingIssues, ...newImageIssues];
      });
    }
  }, [analyzedImages]);

  // Log when issues change to help debug
  useEffect(() => {
    console.log("Dashboard - current issues:", issues);
  }, [issues]);

  // Fetch issue details when selecting an issue that doesn't have full details
  const fetchIssueDetails = async (issueId) => {
    // Only fetch if it's a MongoDB issue (not a local image issue)
    if (!issueId || issueId.startsWith('image-')) return;
    
    // Check if we already have details for this issue
    const issue = issues.find(i => i.id === issueId);
    if (issue && issue.details && Object.keys(issue.details).length > 0) {
      console.log("Issue already has details, no need to fetch");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/issues/${issueId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch issue details: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched issue details:", data);
      
      // Update the issue with details
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            details: data.analysis || {},
            preview: data.image_url,
            s3_key: data.s3_key,
            created_at: data.created_at
          };
        }
        return issue;
      }));
      
    } catch (err) {
      console.error("Error fetching issue details:", err);
      setError(`Failed to load issue details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // New useEffect for admin check
  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('sessionToken');
      if (!token) {
        console.log("No session token found, user is not admin.");
        setIsAdmin(false);
        return;
      }
      try {
        console.log("Checking admin status...");
        const response = await fetch(`${API_BASE}/check_admin`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
           console.error(`Admin check failed: ${response.status}`);
           setIsAdmin(false);
           return;
        }
        const data = await response.json();
        console.log("Admin check response:", data);
        if (data && typeof data.is_admin === 'boolean') {
          setIsAdmin(data.is_admin);
          console.log(`User is ${data.is_admin ? '' : 'not '}dmin.`);
        } else {
          console.warn("Invalid admin check response format.");
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, []);

  // Define navItems based on isAdmin state
  const navItems = useMemo(() => [
    {
      id: 'urban-issues',
      name: 'Urban Issues Detection',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'map-view',
      name: 'Map View',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    // Conditionally add Issues List
    ...(isAdmin ? [{
      id: 'issues-list',
      name: 'Issues List',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    }] : [])
  ], [isAdmin]); // Recompute navItems when isAdmin changes

  // Callback to update analyzed images from UrbanIssuesAnalyzer
  const handleImagesUpdate = (images) => {
    // Compare new images with existing ones to prevent unnecessary updates
    const areImagesEqual = (newImages, oldImages) => {
      if (newImages.length !== oldImages.length) return false;
      
      // Simple serialization comparison to check if contents are the same
      return JSON.stringify(newImages) === JSON.stringify(oldImages);
    };
    
    // Only update state if images have actually changed
    if (!areImagesEqual(images, analyzedImages)) {
      setAnalyzedImages(images);
    }
  };

  // Handle issue selection
  const handleIssueSelect = (issueId) => {
    setSelectedIssueId(issueId);
    
    // Fetch issue details if needed
    fetchIssueDetails(issueId);
    
    // If selecting an issue from the issues list, switch to map view to see it
    if (issueId && activeView === 'issues-list') {
      setActiveView('map-view');
    }
  };

  // Handle map center and zoom changes
  const handleMapViewChange = (center, zoom) => {
    setMapCenter(center);
    setMapZoom(zoom);
  };

  // Handle current location change
  const handleCurrentLocationChange = (location) => {
    setCurrentLocation(location);
  };

  // Handle issue updates from MapView
  const handleIssuesUpdate = (updatedIssues) => {
    console.log('Updating issues from MapView:', updatedIssues);

    // Persist updates to backend for MongoDB issues, but only once per issue
    updatedIssues.forEach(issue => {
      // Only patch server-side for non-image issues
      if (!issue.id.startsWith('image-') && !processedPatches.current.has(issue.id)) {
        processedPatches.current.add(issue.id);
        fetch(`${API_BASE}/issues/${issue.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ solved: issue.solved, location: issue.location })
        })
        .then(res => {
          if (!res.ok) console.error(`Failed to update issue ${issue.id}:`, res.statusText);
        })
        .catch(err => console.error(`Error updating issue ${issue.id}:`, err));
      }
    });

    // Create a map of the updated issues for easy lookup
    const updatedIssuesMap = new Map();
    updatedIssues.forEach(issue => {
      updatedIssuesMap.set(issue.id, issue);
    });
    
    // Update issues preserving data for issues not in the updatedIssues list
    setIssues(prevIssues => {
      return prevIssues.map(existingIssue => {
        // If this issue was updated, use the updated version
        if (updatedIssuesMap.has(existingIssue.id)) {
          const updated = updatedIssuesMap.get(existingIssue.id);
          // Reset processed if toggled back so it can be repatched if user toggles again
          processedPatches.current.delete(existingIssue.id);
          return updated;
        }
        // Otherwise keep the existing issue unchanged
        return existingIssue;
      });
    });
    
    // Also update matching analyzed images - only for issues that start with 'image-'
    setAnalyzedImages(prevImages => {
      return prevImages.map(image => {
        const imageIssueId = `image-${image.name}`;
        const matchingUpdatedIssue = updatedIssuesMap.get(imageIssueId);
        
        if (matchingUpdatedIssue) {
          return { 
            ...image, 
            solved: matchingUpdatedIssue.solved,
            location: matchingUpdatedIssue.location 
          };
        }
        return image;
      });
    });
  };

  // New Delete Handler
  const handleIssueDelete = async (issueIdToDelete) => {
    if (!isAdmin) {
      console.error("Delete attempt by non-admin.");
      setError("You do not have permission to delete issues."); // Inform user
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to permanently delete this issue (${issueIdToDelete})? This cannot be undone.`);
    if (!confirmed) return;

    const token = localStorage.getItem('sessionToken');
    if (!token) {
      console.error("No session token found for delete operation.");
      setError("Authentication required to delete issues.");
      return;
    }

    // setError(''); // Clear previous errors
    // Optional: Indicate loading state

    try {
      console.log(`Attempting to delete issue: ${issueIdToDelete}`);
      const response = await fetch(`${API_BASE}/issues/${issueIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        let errorData = {};
        try { errorData = await response.json(); } catch (e) { /* ignore */ }
        const errorMsg = errorData.error || errorData.message || `Failed to delete issue: ${response.status}`;
        throw new Error(errorMsg);
      }

      console.log(`Issue ${issueIdToDelete} deleted successfully.`);
      setIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueIdToDelete));
      if (selectedIssueId === issueIdToDelete) {
          setSelectedIssueId(null);
      }
    } catch (err) {
      console.error("Error deleting issue:", err);
      setError(`Failed to delete issue: ${err.message}`); 
    } finally {
      // Optional: Reset loading state
    }
  };

  // ---> Simplified Landing Page Handler <--- 
  const handleGoToLanding = () => {
    localStorage.removeItem('sessionToken');
    console.log("Local session token removed.");
    // Reset admin state immediately on frontend if desired
    // setIsAdmin(false); 
    // Removed API call logic
    navigate('/');
  };
  // ---> End of Simplified Handler <--- 

  // Render content based on active view
  const renderContent = () => {
    // Show loading indicator if loading issues
    if (isLoading && issues.length === 0 && activeView !== 'urban-issues') {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
          </div>
        </div>
      );
    }
    
    // Show error message if there was an error
    if (error && issues.length === 0 && activeView !== 'urban-issues') {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error Loading Data</h3>
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      );
    }
    
    switch (activeView) {
      case 'urban-issues':
        return <UrbanIssuesAnalyzer 
          onImagesUpdate={handleImagesUpdate} 
          selectedIssueId={selectedIssueId}
        />;
      case 'map-view':
        return (
          <>
            {isLoading && (
              <div className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 shadow-md rounded-md px-4 py-2">
                <div className="flex items-center">
                  <svg className="animate-spin h-4 w-4 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              </div>
            )}
            <MapView 
              issues={issues}
              selectedIssueId={selectedIssueId}
              onIssueSelect={handleIssueSelect}
              initialCenter={mapCenter}
              initialZoom={mapZoom}
              initialCurrentLocation={currentLocation}
              onMapViewChange={handleMapViewChange}
              onCurrentLocationChange={handleCurrentLocationChange}
              onIssuesUpdate={handleIssuesUpdate}
              isAdmin={isAdmin}
              onIssueDelete={handleIssueDelete}
            />
          </>
        );
      case 'issues-list':
        if (!isAdmin) {
            // Maybe redirect or show a clearer message?
            // Redirecting to map view if Issues List is selected by non-admin
            setActiveView('map-view');
            return null; // Avoid rendering anything briefly
        }
        return (
          <>
            {isLoading && (
              <div className="mb-4 bg-white dark:bg-gray-800 shadow-md rounded-md px-4 py-2">
                <div className="flex items-center">
                  <svg className="animate-spin h-4 w-4 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              </div>
            )}
            <IssuesList 
              issues={issues}
              onIssueSelect={handleIssueSelect}
              onIssuesUpdate={handleIssuesUpdate}
              isAdmin={isAdmin}
              onIssueDelete={handleIssueDelete}
            />
          </>
        );
      default:
        return <div>Select a view</div>;
    }
  };

  return (
    <div className="flex h-screen bg-background text-textColor">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-gradient-to-b from-primary to-secondary shadow-md fixed h-full top-0 left-0 z-40 flex flex-col">
        <div className="p-4 md:px-6 md:py-8 flex-grow">
          <h1 className="hidden md:block text-xl font-bold text-white mb-6">
            Analiza Urbană
          </h1>

          <nav className="mt-2">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center w-full p-2 md:px-4 md:py-3 rounded-lg transform transition-all active:scale-95 ${
                      activeView === item.id
                        ? 'bg-white/20 text-white'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="md:mr-3">{item.icon}</span>
                    <span className="hidden md:block">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Landing Page Button at the bottom */}
        <div className="p-4 md:px-6 md:pb-8">
            <button
                onClick={handleGoToLanding}
                className={'flex items-center w-full p-2 md:px-4 md:py-3 rounded-lg transform transition-all active:scale-95 text-white hover:bg-white/10'}
            >
                <span className="md:mr-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </span>
                <span className="hidden md:block">Landing Page</span>
            </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto ml-16 md:ml-64">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard; 