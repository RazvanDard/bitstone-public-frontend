import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    dblclick: (e) => {
      const { lat, lng } = e.latlng;
      // Limit to Romania's boundaries
      if (lat >= 43.5 && lat <= 48.3 && lng >= 20.2 && lng <= 30.0) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
          .then(response => response.json())
          .then(data => {
            onLocationSelect({
              lat,
              lng,
              address: data.display_name
            });
          })
          .catch(error => {
            console.error('Error fetching address:', error);
            onLocationSelect({
              lat,
              lng,
              address: 'Unknown location'
            });
          });
      }
    }
  });
  return null;
};

const MapCenterUpdater = ({ center, zoom }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const LocationAssigner = ({ image, onSave, onCancel }) => {
  const [location, setLocation] = useState(image?.location || null);
  const [address, setAddress] = useState(image?.location?.address || '');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const resultsRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(
    location 
      ? [location.lat, location.lng] 
      : [45.9443, 25.0094] // Center of Romania
  );
  const [zoom, setZoom] = useState(location ? 16 : 7);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update address when location changes
  useEffect(() => {
    if (location) {
      setAddress(location.address || '');
    }
  }, [location]);

  // Enhanced search functionality with addressdetails and better formatting
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchInput.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError('');

      try {
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
        setError('Eroare la căutare. Încercați din nou.');
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchSelect = (result) => {
    const { lat, lon, display_name, formatted_display, type } = result;
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    
    const newLocation = {
      lat: parsedLat,
      lng: parsedLon,
      address: display_name
    };
    
    setLocation(newLocation);
    setAddress(display_name);
    setSearchInput(formatted_display || display_name);
    setSearchResults([]);
    setShowResults(false);
    
    // Set map center and zoom
    setMapCenter([parsedLat, parsedLon]);
    setZoom(
      type === 'street' || type === 'road' ? 17 :
      type === 'suburb' || type === 'neighbourhood' ? 15 :
      type === 'city' || type === 'town' || type === 'village' ? 13 :
      type === 'county' ? 10 : 16
    );
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&countrycodes=ro&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name, type } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);
        
        const newLocation = {
          lat: parsedLat,
          lng: parsedLon,
          address: display_name
        };
        
        setLocation(newLocation);
        setAddress(display_name);
        setMapCenter([parsedLat, parsedLon]);
        setZoom(
          type === 'street' || type === 'road' ? 17 :
          type === 'suburb' || type === 'neighbourhood' ? 15 :
          type === 'city' || type === 'town' || type === 'village' ? 13 :
          type === 'county' ? 10 : 16
        );
      } else {
        setError('Locație negăsită. Încercați o căutare diferită.');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      setError('Eroare la căutarea locației. Vă rugăm încercați din nou.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Check if the coordinates are within Romania's boundaries
          if (latitude >= 43.5 && latitude <= 48.3 && longitude >= 20.2 && longitude <= 30.0) {
            // Get the address for these coordinates
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
              .then(response => response.json())
              .then(data => {
                const newLocation = {
                  lat: latitude,
                  lng: longitude,
                  address: data.display_name || 'Locația curentă'
                };
                
                setLocation(newLocation);
                setAddress(data.display_name || 'Locația curentă');
                setMapCenter([latitude, longitude]);
                setZoom(16);
              })
              .catch(error => {
                console.error('Error fetching address:', error);
                const newLocation = {
                  lat: latitude,
                  lng: longitude,
                  address: 'Locația curentă'
                };
                
                setLocation(newLocation);
                setAddress('Locația curentă');
                setMapCenter([latitude, longitude]);
                setZoom(16);
              });
          } else {
            setError('Locația detectată este în afara României.');
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          setError('Nu am putut obține locația curentă. Verificați permisiunile browserului.');
        }
      );
    } else {
      setError('Geolocalizarea nu este suportată de acest browser.');
    }
  };

  const handleLocationSelected = (newLocation) => {
    console.log("New location selected:", newLocation);
    
    // Ensure lat and lng are numbers
    if (newLocation) {
      const lat = typeof newLocation.lat === 'string' ? parseFloat(newLocation.lat) : newLocation.lat;
      const lng = typeof newLocation.lng === 'string' ? parseFloat(newLocation.lng) : newLocation.lng;
      
      // Only set if they're valid numbers
      if (!isNaN(lat) && !isNaN(lng)) {
        const formattedLocation = {
          ...newLocation,
          lat,
          lng
        };
        console.log("Setting formatted location:", formattedLocation);
        setLocation(formattedLocation);
        // Make sure we also update the address
        if (newLocation.address) {
          setAddress(newLocation.address);
        }
      } else {
        console.error("Invalid coordinates:", newLocation);
      }
    }
  };

  const handleSave = () => {
    if (!location) {
      setError('Please select a location first');
      return;
    }
    
    // Ensure lat and lng are numbers before saving
    const lat = typeof location.lat === 'string' ? parseFloat(location.lat) : location.lat;
    const lng = typeof location.lng === 'string' ? parseFloat(location.lng) : location.lng;
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid location coordinates');
      return;
    }
    
    // Format with numeric coordinates
    const formattedLocation = {
      ...location,
      lat,
      lng
    };
    
    console.log("Saving formatted location:", formattedLocation);
    
    // Save with updated image
    onSave({
      ...image,
      location: formattedLocation
    });
  };

  // When location changes (from search or map click), recenter the map
  useEffect(() => {
    if (location && location.lat && location.lng) {
      setMapCenter([location.lat, location.lng]);
      setZoom(16);
    }
  }, [location]);

  return (
    <div className="bg-gradient-to-br from-primary to-secondary p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl mx-auto transform transition-all duration-300 ease-out max-h-[85vh] overflow-y-auto">
      {/* Inner container to constrain content width */}
      <div className="w-full max-w-2xl mx-auto">
        {/* इंश्योर X Button is removed from here */}

        {/* Header removed as per request */}
        {/* 
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Alegere locație {image.name ? `pentru ${image.name}` : ''}
        </h2>
        */}

        {image.preview && (
          <div className="mb-6 rounded-lg overflow-hidden shadow-lg max-h-40 flex justify-center items-center bg-black bg-opacity-20">
            <img 
              src={image.preview} 
              alt={image.name || 'Previzualizare imagine'} 
              className="max-h-40 object-contain w-auto"
            />
          </div>
        )}

        {/* Search and Current Location Section */}
        <div className="mb-6 p-4 sm:p-6 bg-white bg-opacity-10 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Caută adresă, stradă sau orașul din România..."
              className="flex-grow p-3 border border-white border-opacity-30 rounded-md shadow-sm focus:ring-2 focus:ring-white focus:border-transparent bg-white bg-opacity-20 text-white placeholder-gray-300 text-sm"
            />
            <button
              onClick={handleManualSearch}
              disabled={isSearching || !searchInput.trim()}
              className="px-6 py-3 bg-white text-primary hover:bg-gray-100 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
            >
              {isSearching ? (
                <svg className="animate-spin h-5 w-5 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Caută'
              )}
            </button>
          </div>
          <button
            onClick={handleGetCurrentLocation}
            disabled={isSearching}
            className="flex items-center text-white hover:text-gray-200 transition-all duration-150 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed group active:scale-95 transform"
          >
            <svg className="w-5 h-5 mr-2 text-white group-hover:text-gray-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isSearching && !searchInput ? 'Se obține locația...' : 'Folosește locația mea actuală'}
          </button>
        </div>

        {/* Map Section */}
        <div className="mb-6 relative" style={{ minHeight: 400 }}>
          {/* Absolute UI overlay for search and autocomplete */}
          <div className="absolute top-0 left-0 w-full z-[2000] pointer-events-none">
            <div className="max-w-2xl mx-auto pointer-events-auto">
              <div className="bg-white dark:bg-gray-800 rounded-t-lg p-3 shadow-lg relative">
                {showResults && searchResults.length > 0 && (
                  <div className="absolute left-0 w-full z-[2100] bg-white dark:bg-gray-700 mt-1 rounded-md shadow-lg max-h-80 overflow-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white border-b last:border-b-0 border-gray-100 dark:border-gray-600"
                        onClick={() => handleSearchSelect(result)}
                      >
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <div className="font-medium">{result.formatted_display || result.display_name}</div>
                            {result.type && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            </div>
          </div>
          {/* MAP RESTORED HERE */}
          <div className="w-full h-96 rounded-lg overflow-hidden relative z-10">
            <MapContainer 
              center={mapCenter} 
              zoom={zoom} 
              style={{ height: '100%', width: '100%' }}
              minZoom={6}
              zoomControl={false}
              doubleClickZoom={false}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenterUpdater center={mapCenter} zoom={zoom} />
              <LocationSelector onLocationSelect={handleLocationSelected} />
              {location && (
                <Marker position={[location.lat, location.lng]} />
              )}
            </MapContainer>
          </div>
          <div className="absolute bottom-2 left-2 right-2 bg-white dark:bg-gray-700 bg-opacity-80 dark:bg-opacity-80 p-2 rounded text-xs text-gray-600 dark:text-gray-300 z-[1000]">
            Faceți clic pe hartă pentru a alege o locație sau utilizați bara de căutare pentru a găsi o adresă.
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-1">
            Adresa selectată
          </label>
          <input
            type="text"
            value={address || ''}
            readOnly
            className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md text-white"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-white border-opacity-30 rounded-md text-white hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
          >
            Anulează
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-white text-primary rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
            disabled={!location}
          >
            Salvează locația
          </button>
        </div>
      </div> {/* End of inner container */}
    </div>
  );
};

LocationAssigner.propTypes = {
  image: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default LocationAssigner; 