import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconShadow from 'leaflet/dist/images/marker-shadow.png';
import PropTypes from 'prop-types';
import ImageCache from './ImageCache';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon,
  iconUrl: markerIcon,
  shadowUrl: markerIconShadow,
});

// Different marker icons for issue types
const issueIcons = {
  default: new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  potholes: new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'marker-red'
  }),
  graffiti: new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'marker-purple'
  }),
  overflowing_trash_bins: new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'marker-yellow'
  }),
  // Change from grey to green for solved issues
  solved: new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'marker-green'
  }),
};

// Component to update map view when center or zoom props change
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  // Optional: Check if map view actually needs changing
  const currentCenter = map.getCenter();
  const currentZoom = map.getZoom();
  if (Math.abs(currentCenter.lat - center[0]) > 0.00001 ||
      Math.abs(currentCenter.lng - center[1]) > 0.00001 ||
      currentZoom !== zoom) {
    map.setView(center, zoom);
  }
  return null;
};

// PopupContent: displays one issue from a group and arrows to navigate
const PopupContent = ({ group, initialIndex, onMarkSolved, isAdmin, onIssueDelete }) => {
  const [idx, setIdx] = useState(initialIndex);
  const issue = group[idx];
  const handlePrev = () => setIdx((idx - 1 + group.length) % group.length);
  const handleNext = () => setIdx((idx + 1) % group.length);
  
  // Debug the issue data being displayed
  useEffect(() => {
    console.log("Popup content for issue:", issue);
  }, [issue]);
  
  return (
    <div className="text-sm">
      {group.length > 1 && (
        <div className="flex justify-between mb-2">
          <button onClick={handlePrev} className="px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-black transition-colors">◀</button>
          <span className="text-xs font-medium flex items-center text-black">{idx + 1}/{group.length}</span>
          <button onClick={handleNext} className="px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-black transition-colors">▶</button>
        </div>
      )}
      <p className="font-medium text-black text-base mb-2">{issue.title || 'Detected Issue'}</p>
      
      {/* Display S3 image with fallback */}
      {issue.preview && (
        <div className="my-2 max-w-[200px] overflow-hidden rounded-lg border border-gray-200">
          <ImageCache
            src={issue.preview} 
            alt={issue.title || 'Issue Image'} 
            className="w-full h-auto"
            loading="lazy"
            placeholderSrc="/placeholder.svg"
            onError={() => console.error(`Failed to load image: ${issue.preview}`)}
          />
        </div>
      )}
      
      {/* Show location address if available */}
      {issue.location?.address && (
        <p className="text-black mt-2 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {issue.location.address}
        </p>
      )}
      
      {/* Show lat/lng if no address */}
      {!issue.location?.address && issue.location?.lat && issue.location?.lng && (
        <p className="text-black mt-2 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          Latitude: {issue.location.lat.toFixed(6)}, Longitude: {issue.location.lng.toFixed(6)}
        </p>
      )}
      
      {/* Show issue categories */}
      {issue.categories?.length > 0 ? (
        <div className="mt-2">
          <p className="font-medium text-black mb-1">Categories:</p>
          <div className="flex flex-wrap gap-1">
            {issue.categories.map((category, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary to-secondary text-white">
                {category.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      ) : issue.category && (
        <div className="mt-2">
          <p className="font-medium text-black mb-1">Category:</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary to-secondary text-white">
            {issue.category.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
          </span>
        </div>
      )}
      
      {/* Show issue details if available */}
      {issue.details && issue.details.urban_issues && (
        <div className="mt-3 text-xs border-t border-gray-200 pt-2">
          <p className="font-medium text-black mb-1">Analysis Details:</p>
          {Object.entries(issue.details.urban_issues)
            .filter(([_, data]) => data.detected)
            .map(([issueName, data]) => (
              <div key={issueName} className="mb-2 bg-gray-50 rounded-lg p-2">
                <p className="font-medium text-black">
                  {issueName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                {data.description && (
                  <p className="text-gray-600 text-xs mt-1">{data.description}</p>
                )}
                {data.solution && (
                  <div className="mt-1 pl-2 border-l-2 border-yellow-400">
                    <p className="text-xs font-medium text-yellow-600">Solution:</p>
                    <p className="text-xs text-gray-600">{data.solution}</p>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
      
      {/* Show creation date if available */}
      {issue.created_at && (
        <p className="mt-2 text-xs text-gray-500">
          Added: {new Date(issue.created_at).toLocaleDateString()}
        </p>
      )}
      
      {/* Admin Actions Container */}
      {isAdmin && (
        <div className="mt-3 space-y-2">
          {/* Mark as solved button */} 
          <button 
            onClick={() => onMarkSolved(issue.id)} 
            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
              issue.solved 
                ? 'bg-gray-100 text-black hover:bg-gray-200' 
                : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
            }`}
          >
            {issue.solved ? 'Mark as Unresolved' : 'Mark as Resolved'}
          </button>
          {/* Delete Issue button */} 
          <button 
            onClick={(e) => { e.stopPropagation(); onIssueDelete(issue.id); }} 
            className="w-full py-1.5 rounded-lg text-sm font-medium transition-colors bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
          >
            Delete Issue
          </button>
        </div>
      )}
    </div>
  );
};
PopupContent.propTypes = {
  group: PropTypes.array.isRequired,
  initialIndex: PropTypes.number.isRequired,
  onMarkSolved: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onIssueDelete: PropTypes.func.isRequired
};

const MapView = ({
  issues = [],
  selectedIssueId,
  onIssueSelect,
  initialCenter = [45.9443, 25.0094],
  initialZoom = 7,
  initialCurrentLocation = null,
  onMapViewChange,
  onCurrentLocationChange,
  onIssuesUpdate,
  isAdmin,
  onIssueDelete
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const autocompleteRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(initialCurrentLocation);
  
  // New state for issue filters and solved status
  const [activeFilters, setActiveFilters] = useState([]);
  const [showSolved, setShowSolved] = useState(true);
  const [localIssues, setLocalIssues] = useState([]);
  const [isFilterContentVisible, setIsFilterContentVisible] = useState(true);
  const mapRef = useRef(null);

  // Update localIssues whenever issues prop changes
  useEffect(() => {
    console.log("MapView - Updating localIssues from issues prop");
    setLocalIssues(issues);
  }, [issues]);

  // Update parent component when center or zoom changes
  useEffect(() => {
    if (onMapViewChange) {
      onMapViewChange(center, zoom);
    }
  }, [center, zoom, onMapViewChange]);

  // Update parent component when current location changes
  useEffect(() => {
    if (onCurrentLocationChange && currentLocation) {
      onCurrentLocationChange(currentLocation);
    }
  }, [currentLocation, onCurrentLocationChange]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter issues to get valid markers
  const markers = useMemo(() => {
    console.log("Filtering issues for map display:", localIssues);
    
    return localIssues.filter(issue => {
      // Debug each issue's location
      console.log(`Issue ${issue.id} location:`, issue.location);
      
      if (!issue.location) {
        console.log(`Issue ${issue.id} has no location data`);
        return false;
      }
      
      const { lat, lng } = issue.location;
      
      // Validate that lat and lng exist and are valid numbers
      if (typeof lat !== 'number' || typeof lng !== 'number' || 
          isNaN(lat) || isNaN(lng) ||
          lat === undefined || lng === undefined) {
        console.log(`Issue ${issue.id} has invalid location data:`, { lat, lng });
        try {
          // Try to parse string values as numbers before rejecting
          const parsedLat = parseFloat(lat);
          const parsedLng = parseFloat(lng);
          if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            // Update the issue with parsed values
            issue.location.lat = parsedLat;
            issue.location.lng = parsedLng;
            return true;
          }
        } catch (e) {
          console.error(`Failed to parse coordinates for issue ${issue.id}:`, e);
        }
        return false;
      }
      
      // Filter by solved status
      if (issue.solved && !showSolved) return false;
      
      // Filter by category if activeFilters is not empty
      if (activeFilters.length > 0) {
        // Check if primary category is in activeFilters
        const primaryCategoryMatch = issue.category && activeFilters.includes(issue.category);
        
        // Check if any of the issue's categories are in activeFilters
        const anyCategoryMatch = issue.categories && 
          issue.categories.some(category => activeFilters.includes(category));
        
        // If neither match, filter out this issue
        if (!primaryCategoryMatch && !anyCategoryMatch) return false;
      }
      
      return true;
    });
  }, [localIssues, showSolved, activeFilters]);

  // Refined focus on the selected issue
  useEffect(() => {
    if (selectedIssueId && mapRef.current) { 
      const selectedIssue = localIssues.find(item => item.id === selectedIssueId);
      if (selectedIssue?.location?.lat && selectedIssue?.location?.lng) {
        const { lat, lng } = selectedIssue.location;
        if (!isNaN(lat) && !isNaN(lng)) {
          const currentCenter = mapRef.current.getCenter();
          const currentZoom = mapRef.current.getZoom();
          const targetZoom = 16;

          const needsCenterChange = Math.abs(currentCenter.lat - lat) > 0.00001 || Math.abs(currentCenter.lng - lng) > 0.00001;
          const needsZoomChange = currentZoom !== targetZoom;

          if (needsCenterChange || needsZoomChange) {
            console.log(`Refocusing map on ${selectedIssueId}`); 
            mapRef.current.setView([lat, lng], targetZoom);
            // Optionally update state if other components rely on it immediately
            // setCenter([lat, lng]); 
            // setZoom(targetZoom);
          } else {
            console.log(`Map already focused on ${selectedIssueId}, skipping refocus.`); 
          }
        }
      }
    }
  }, [selectedIssueId, localIssues]);

  // Enhanced autocomplete search functionality
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchInput.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        // Using Nominatim API with enhanced parameters for better Romania street results
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&countrycodes=ro&addressdetails=1&limit=7&viewbox=20.2,48.3,30.0,43.5&bounded=1`
        );
        const data = await response.json();
        
        // Process the results to improve display
        const processedResults = data.map(item => {
          let displayName = item.display_name;
          
          // If this is a street, format it nicely
          if (item.type === 'street' || item.type === 'road' || item.class === 'highway') {
            const address = item.address || {};
            const components = [];
            
            if (address.road || address.street) 
              components.push(address.road || address.street);
            if (address.suburb) 
              components.push(address.suburb);
            if (address.city || address.town || address.village) 
              components.push(address.city || address.town || address.village);
            if (address.county) 
              components.push(address.county);
            
            if (components.length > 0) {
              displayName = components.join(', ');
            }
          }
          
          return {
            ...item,
            formatted_display: displayName
          };
        });
        
        setSearchResults(processedResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle search submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&countrycodes=ro&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);
        
        setCenter([parsedLat, parsedLon]);
        
        // Set zoom level based on type of location
        if (data[0].type === 'street' || data[0].type === 'road') {
          setZoom(17);
        } else if (data[0].type === 'suburb' || data[0].type === 'neighbourhood') {
          setZoom(15);
        } else if (data[0].type === 'city' || data[0].type === 'town' || data[0].type === 'village') {
          setZoom(13);
        } else if (data[0].type === 'county') {
          setZoom(10);
        } else {
          setZoom(16);
        }
        
        setCurrentLocation({
          lat: parsedLat,
          lng: parsedLon,
          address: data[0].display_name
        });
      } else {
        setSearchError('Locație negăsită. Încercați o căutare diferită.');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      setSearchError('Eroare la căutarea locației. Vă rugăm încercați din nou.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selection from autocomplete results
  const handleResultSelect = (result) => {
    const { lat, lon, display_name, formatted_display, type } = result;
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    
    setCenter([parsedLat, parsedLon]);
    
    // Set zoom level based on type of location
    if (type === 'street' || type === 'road') {
      setZoom(17);
    } else if (type === 'suburb' || type === 'neighbourhood') {
      setZoom(15);
    } else if (type === 'city' || type === 'town' || type === 'village') {
      setZoom(13);
    } else if (type === 'county') {
      setZoom(10);
    } else {
      setZoom(16);
    }
    
    setSearchInput(formatted_display || display_name);
    setSearchResults([]);
    setShowAutocomplete(false);
    
    setCurrentLocation({
      lat: parsedLat,
      lng: parsedLon,
      address: display_name
    });
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Check if the coordinates are within Romania's boundaries
          if (latitude >= 43.5 && latitude <= 48.3 && longitude >= 20.2 && longitude <= 30.0) {
            setCenter([latitude, longitude]);
            setZoom(16);
            
            // Get the address for these coordinates
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
              .then(response => response.json())
              .then(data => {
                setCurrentLocation({
                  lat: latitude,
                  lng: longitude,
                  address: data.display_name || 'Locația curentă'
                });
              })
              .catch(error => {
                console.error('Error fetching address:', error);
                setCurrentLocation({
                  lat: latitude,
                  lng: longitude,
                  address: 'Locația curentă'
                });
              });
          } else {
            setSearchError('Locația detectată este în afara României.');
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          setSearchError('Nu am putut obține locația curentă. Verificați permisiunile browserului.');
        }
      );
    } else {
      setSearchError('Geolocalizarea nu este suportată de acest browser.');
    }
  };

  // Handle clicking on an issue marker
  const handleIssueClick = (issueId) => {
    if (onIssueSelect) {
      onIssueSelect(issueId);
    }
  };

  // New function to mark an issue as solved
  const handleMarkAsSolved = (issueId) => {
    // Find and toggle the issue's solved status
    const issueToUpdate = localIssues.find(issue => issue.id === issueId);
    if (!issueToUpdate) return;
    const updatedIssue = { ...issueToUpdate, solved: !issueToUpdate.solved };

    // Update local state
    setLocalIssues(prev => prev.map(issue => 
      issue.id === issueId ? updatedIssue : issue
    ));

    // Only send the single changed issue to the parent for PATCH
    if (onIssuesUpdate) {
      onIssuesUpdate([updatedIssue]);
    }
  };

  // Toggle filter for an issue category
  const toggleFilter = (category) => {
    setActiveFilters(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // For debugging
  useEffect(() => {
    console.log("MapView - Received issues:", issues);
    console.log("MapView - Valid markers:", markers);
  }, [issues, markers]);

  // Get all available issue categories
  const availableCategories = useMemo(() => {
    const categories = new Set();
    
    localIssues.forEach(issue => {
      // Add the primary category if it exists
      if (issue.category) {
        categories.add(issue.category);
      }
      
      // Add all categories from the categories array if it exists
      if (issue.categories && issue.categories.length > 0) {
        issue.categories.forEach(category => {
          categories.add(category);
        });
      }
    });
    
    return Array.from(categories);
  }, [localIssues]);

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 w-full z-[1000] p-3 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <div 
              className="bg-white rounded-lg p-4 shadow-lg relative" 
              onClick={(e) => e.stopPropagation()} 
              onMouseDown={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setShowAutocomplete(true);
                    }}
                    onFocus={(e) => { 
                      setShowAutocomplete(true); 
                      e.stopPropagation(); 
                    }}
                    placeholder="Search for a location in Romania..."
                    className="w-full pl-10 px-4 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 text-sm rounded-r-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                  disabled={isSearching || !searchInput.trim()}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation(); // Stop propagation
                    setIsFilterContentVisible(!isFilterContentVisible); 
                  }}
                  onMouseDown={(e) => e.stopPropagation()} // Also stop mousedown
                  className="p-2 ml-2 text-gray-600 hover:text-primary focus:outline-none transition-colors"
                  aria-label={isFilterContentVisible ? "Hide filters" : "Show filters"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor" style={{ transform: isFilterContentVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>

              <div 
                style={{
                  maxHeight: isFilterContentVisible ? '1000px' : '0px',
                  opacity: isFilterContentVisible ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease-in-out, opacity 0.2s ease-in-out'
                }}
              >
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm font-medium text-black">Filter by issue type:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableCategories.map(category => (
                      <button
                        key={category}
                        onClick={(e) => { 
                          e.stopPropagation(); // Stop propagation
                          toggleFilter(category); 
                        }}
                        onMouseDown={(e) => e.stopPropagation()} // Also stop mousedown
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                          activeFilters.includes(category)
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                    {activeFilters.length > 0 && (
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); // Stop propagation
                          setActiveFilters([]); 
                        }}
                        onMouseDown={(e) => e.stopPropagation()} // Also stop mousedown
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-200 text-black hover:bg-gray-300 transition-colors"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="show-solved"
                        checked={showSolved}
                        onChange={() => setShowSolved(!showSolved)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary"></div>
                      <span className="ms-3 text-sm font-medium text-black">Show resolved issues</span>
                    </label>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 flex">
                  <button
                    onClick={handleGetCurrentLocation}
                    className="text-black text-sm hover:text-primary transition-colors focus:outline-none flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use my current location
                  </button>
                </div>
              </div>

              {isSearching && (
                <div className="absolute right-12 top-6">
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}

              {showAutocomplete && searchResults.length > 0 && (
                <div className="absolute left-0 w-full z-[2100] bg-white mt-1 rounded-md shadow-lg max-h-80 overflow-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b last:border-b-0 border-gray-100 text-black"
                      onClick={() => handleResultSelect(result)}
                    >
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <div className="font-medium">{result.formatted_display || result.display_name}</div>
                          {result.type && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                              {result.address?.county ? `, ${result.address.county}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchError && (
                <p className="text-red-500 text-sm mt-1">{searchError}</p>
              )}
            </div>
          </div>
        </div>
        
        <MapContainer 
          ref={mapRef}
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          minZoom={6}
          zoomControl={false}
          className="z-0"
        >
          <ChangeView center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {markers.length > 0 && markers.map((issue) => {
            const markerCategory = issue.solved ? 'solved' : (issue.categories?.[0] || issue.category);
            const group = markers.filter(i => i.location.lat === issue.location.lat && i.location.lng === issue.location.lng);
            const initialIndex = group.findIndex(i => i.id === issue.id);
            return (
              <Marker key={issue.id} position={[issue.location.lat, issue.location.lng]} icon={issueIcons[markerCategory] || issueIcons.default} eventHandlers={{ click: () => handleIssueClick(issue.id) }}>
                <Popup maxWidth={150} maxHeight={250} autoPan={false}>
                  <PopupContent 
                    group={group} 
                    initialIndex={initialIndex} 
                    onMarkSolved={handleMarkAsSolved} 
                    isAdmin={isAdmin} 
                    onIssueDelete={onIssueDelete}
                  />
                </Popup>
              </Marker>
            );
          })}

          <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control leaflet-bar bg-white dark:bg-gray-800 p-2 rounded-md shadow-md mr-2 mb-8">
              <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Legendă</div>
              <div className="space-y-1">
                {markers.some(issue => {
                  if (issue.solved) return false;
                  if (issue.categories && issue.categories.includes('potholes')) return true;
                  return issue.category === 'potholes';
                }) && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-2 relative flex-shrink-0">
                      <div className="absolute inset-0 marker-red">
                        <img src={markerIcon} alt="Red marker" className="h-5" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">Gropi în asfalt</span>
                  </div>
                )}
                {markers.some(issue => {
                  if (issue.solved) return false;
                  if (issue.categories && issue.categories.includes('graffiti')) return true;
                  return issue.category === 'graffiti';
                }) && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-2 relative flex-shrink-0">
                      <div className="absolute inset-0 marker-purple">
                        <img src={markerIcon} alt="Purple marker" className="h-5" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">Graffiti</span>
                  </div>
                )}
                {markers.some(issue => {
                  if (issue.solved) return false;
                  if (issue.categories && issue.categories.includes('overflowing_trash_bins')) return true;
                  return issue.category === 'overflowing_trash_bins';
                }) && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-2 relative flex-shrink-0">
                      <div className="absolute inset-0 marker-yellow">
                        <img src={markerIcon} alt="Yellow marker" className="h-5" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">Deșeuri</span>
                  </div>
                )}
                {markers.some(issue => {
                  if (issue.solved) return false;
                  const otherCategories = ['potholes', 'graffiti', 'overflowing_trash_bins'];
                  // Check for other categories in the categories array
                  if (issue.categories && issue.categories.length > 0) {
                    const hasOnlyKnownCategories = issue.categories.every(cat => otherCategories.includes(cat));
                    return !hasOnlyKnownCategories;
                  }
                  // Check the primary category
                  return issue.category && !otherCategories.includes(issue.category);
                }) && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-2 relative flex-shrink-0">
                      <img src={markerIcon} alt="Blue marker" className="h-5" />
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">Alte probleme</span>
                  </div>
                )}
                {markers.some(issue => issue.solved) && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-2 relative flex-shrink-0">
                      <div className="absolute inset-0 marker-green">
                        <img src={markerIcon} alt="Green marker" className="h-5" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-500">Probleme rezolvate</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {markers.length === 0 && (
            <div className="leaflet-top leaflet-left mt-2 ml-2">
              <div className="leaflet-control leaflet-bar bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-sm">
                Nu există probleme cu locații definite pentru afișare pe hartă.
              </div>
            </div>
          )}
        </MapContainer>
        
        <div className="absolute top-2 right-2 z-[1000]">
          <div className="flex flex-col gap-1">
            <button 
              className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setZoom(prev => Math.max(prev - 1, 6))}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView; 