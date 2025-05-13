import React, { useState, useEffect, useRef } from 'react';
import LocationAssigner from './LocationAssigner';
import ImageCache from './ImageCache';

const IssuesList = ({ issues = [], onIssueSelect, onIssuesUpdate, isAdmin, onIssueDelete }) => {
  // Ref for the scrollable issues container
  const scrollContainerRef = useRef(null);
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [showLocationAssigner, setShowLocationAssigner] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);

  // Filter issues whenever the search query or issues change
  useEffect(() => {
    let filtered = [...issues];

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(issue => {
        // Check if location address contains the query
        const addressMatch = issue.location?.address && 
          issue.location.address.toLowerCase().includes(query);
        
        // Check if title contains the query
        const titleMatch = issue.title && 
          issue.title.toLowerCase().includes(query);
        
        // Check if any of the categories contains the query
        let categoryMatch = false;
        if (issue.categories && issue.categories.length > 0) {
          categoryMatch = issue.categories.some(category => 
            category.replace(/_/g, ' ').toLowerCase().includes(query)
          );
        } else if (issue.category) {
          categoryMatch = issue.category.replace(/_/g, ' ').toLowerCase().includes(query);
        }
        
        return addressMatch || titleMatch || categoryMatch;
      });
    }

    // Sort filtered issues
    filtered.sort((a, b) => {
      if (sortBy === 'location') {
        const locationA = a.location?.address || '';
        const locationB = b.location?.address || '';
        return sortDirection === 'asc' 
          ? locationA.localeCompare(locationB) 
          : locationB.localeCompare(locationA);
      } else if (sortBy === 'category') {
        const categoryA = a.category || '';
        const categoryB = b.category || '';
        return sortDirection === 'asc' 
          ? categoryA.localeCompare(categoryB) 
          : categoryB.localeCompare(categoryA);
      } else if (sortBy === 'status') {
        // Sort by solved status
        if (sortDirection === 'asc') {
          return a.solved === b.solved ? 0 : a.solved ? 1 : -1;
        } else {
          return a.solved === b.solved ? 0 : a.solved ? -1 : 1;
        }
      } else if (sortBy === 'date') {
        // Sort by date if available, otherwise fallback to ID
        const dateA = a.created_at ? new Date(a.created_at) : null;
        const dateB = b.created_at ? new Date(b.created_at) : null;
        
        if (dateA && dateB) {
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        } else {
          // Fallback to ID
          return sortDirection === 'asc' 
            ? a.id.localeCompare(b.id) 
            : b.id.localeCompare(a.id);
        }
      } else {
        // Default sort by ID
        return sortDirection === 'asc' 
          ? a.id.localeCompare(b.id) 
          : b.id.localeCompare(a.id);
      }
    });

    setFilteredIssues(filtered);
  }, [issues, searchQuery, sortBy, sortDirection]);

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredIssues]);

  // Handle marking an issue as solved
  const handleMarkAsSolved = (issueId, e) => {
    // Prevent triggering the parent div's onClick
    e.stopPropagation();
    
    // Find and toggle only this issue
    const original = issues.find(issue => issue.id === issueId);
    if (!original) return;
    const updated = { ...original, solved: !original.solved };
    
    // Notify parent with single updated issue
    if (onIssuesUpdate) {
      onIssuesUpdate([updated]);
    }
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Toggle expanded issue details
  const handleToggleDetails = (issueId, e) => {
    e.stopPropagation();
    setExpandedIssueId(expandedIssueId === issueId ? null : issueId);
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Handle opening location assigner
  const handleAssignLocation = (issue, e) => {
    e.stopPropagation();
    setCurrentIssue(issue);
    setShowLocationAssigner(true);
  };

  // Handle location save
  const handleLocationSave = async (payload) => {
    const backendBaseUrl = process.env.NODE_ENV === 'production'
      ? 'https://bitstone-backend-b7ff3c04c40d.herokuapp.com' // Replace with your actual production URL
      : 'http://localhost:5000'; // Adjust if your local backend runs on a different port

    let newLocation;
    // Payload from LocationAssigner typically includes the new location within a .location property of the updated image object
    if (payload && payload.location && (typeof payload.location.lat !== 'undefined' || typeof payload.location.lng !== 'undefined')) {
      newLocation = payload.location;
    } else if (payload && (typeof payload.lat !== 'undefined' || typeof payload.lng !== 'undefined')) {
      // Fallback if payload itself is the location object
      newLocation = payload;
    } else {
      console.error("Invalid location payload received:", payload);
      setShowLocationAssigner(false); // Close modal
      return; // Exit if location data is not valid
    }

    if (currentIssue && newLocation) {
      const issueId = currentIssue.id;

      // Optimistic update for the UI (via parent)
      const updatedIssueForUI = { ...currentIssue, location: newLocation };
      if (onIssuesUpdate) {
        onIssuesUpdate([updatedIssueForUI]);
      }

      try {
        console.log(`Attempting to PATCH location for issue ID: ${issueId} in IssuesList`);
        const token = localStorage.getItem('authToken'); // Assuming token is stored with key 'authToken'

        const response = await fetch(`${backendBaseUrl}/api/issues/${issueId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ location: newLocation }) // Send only the location object
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Server error during location update in IssuesList.' }));
          console.error('Error updating location on backend from IssuesList:', response.status, errorData);
          // setErrorStateForComponent(`Failed to save location: ${errorData.error || errorData.message || 'Server error'}`);
          // Consider how to show errors to the user in IssuesList
          // Optionally: revert optimistic update by calling onIssuesUpdate with original currentIssue if needed
          return; // Stop further processing on error
        }

        const updatedIssueFromServer = await response.json();
        console.log('Location updated successfully on backend from IssuesList:', updatedIssueFromServer);
        
        // Call onIssuesUpdate again with the server-confirmed data to ensure parent state is accurate
        if (onIssuesUpdate) {
          // The server response might be the full updated issue object
          onIssuesUpdate([updatedIssueFromServer]); 
        }
        // Optionally show a success message

      } catch (error) {
        console.error('Network error or other issue while updating location from IssuesList:', error);
        // setErrorStateForComponent('Network error. Could not save location.');
        // Consider how to show errors to the user in IssuesList
      }
    }
    setShowLocationAssigner(false);
  };

  // Handle location cancel
  const handleLocationCancel = () => {
    setShowLocationAssigner(false);
  };

  return (
    <div className="container mx-auto p-4 h-full flex flex-col">
      <header className="text-center mb-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="inline-block mb-4 p-3 rounded-full bg-gradient-to-r from-primary to-secondary">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-black mb-4 tracking-tight">
          Issues <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">List</span>
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-4"></div>
        <p className="text-lg text-black max-w-2xl mx-auto font-medium">
          Browse, filter and manage detected urban issues
        </p>
      </header>

      {/* Scrollable issues content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scroll"
        onScroll={() => {
          if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 5 && visibleCount < filteredIssues.length) {
              setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filteredIssues.length));
            }
          }
        }}
      >

      {/* Search and filter controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-black mb-2">
              Search by location, title or category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-black"
              />
            </div>
          </div>
          
          <div className="flex-shrink-0 flex items-end gap-2 flex-wrap">
            <button 
              onClick={() => handleSortChange('date')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'date' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              onClick={() => handleSortChange('location')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'location' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Location {sortBy === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              onClick={() => handleSortChange('category')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'category' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Category {sortBy === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              onClick={() => handleSortChange('status')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'status' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Issues list */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
          <div className="inline-block mb-4 p-3 rounded-full bg-gray-100">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-black mb-2">
            {searchQuery.trim() 
              ? 'No issues match your search criteria' 
              : 'No issues to display yet'}
          </p>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery.trim() 
              ? 'Try adjusting your search term or filter criteria' 
              : 'Analyze some urban images to detect issues and see them listed here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIssues.slice(0, visibleCount).map((issue) => (
            <div 
              key={issue.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all h-fit ${
                issue.solved 
                  ? 'border-l-4 border-green-500' 
                  : 'border-l-4 border-red-500'
              }`}
              onClick={() => onIssueSelect && onIssueSelect(issue.id)}
            >
              {issue.preview && (
                <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                  <ImageCache 
                    src={issue.preview} 
                    alt={issue.title || 'Issue Image'} 
                    className="w-full h-full object-cover"
                    placeholderSrc="/placeholder.svg"
                    loading="lazy"
                    root={scrollContainerRef.current}
                  />
                  {issue.solved && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Rezolvată
                    </div>
                  )}
                  {issue.created_at && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {issue.title || 'Problemă detectată'}
                  </h3>
                  <button 
                    onClick={(e) => handleToggleDetails(issue.id, e)}
                    className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                        expandedIssueId === issue.id 
                          ? "M5 15l7-7 7 7" 
                          : "M19 9l-7 7-7-7"
                      } />
                    </svg>
                  </button>
                </div>
                
                {issue.categories && issue.categories.length > 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-medium">Categorii:</span> {issue.categories.map(category => 
                      category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    ).join(', ')}
                  </p>
                ) : issue.category && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-medium">Categorie:</span> {issue.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                )}
                
                {issue.location ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-medium">Locație:</span> {
                      issue.location.address || 
                      (issue.location.lat && issue.location.lng 
                        ? `${issue.location.lat.toFixed(4)}, ${issue.location.lng.toFixed(4)}` 
                        : 'Necunoscută')
                    }
                  </p>
                ) : (
                  <p className="text-sm text-red-500 dark:text-red-400 mb-2">
                    <span className="font-medium">Locație:</span> Nedefinită
                  </p>
                )}
                
                {issue.created_at && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Adăugat: {formatDate(issue.created_at)}
                  </p>
                )}
                
                {/* Expanded issue details */}
                {expandedIssueId === issue.id && issue.details && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">Detalii analiză</h4>
                    
                    {issue.details.urban_issues && Object.entries(issue.details.urban_issues)
                      .filter(([_, issueData]) => issueData.detected)
                      .map(([issueName, issueData]) => (
                        <div key={issueName} className="mb-3 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <p className="font-medium text-sm text-primary">
                            {issueName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          {issueData.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {issueData.description}
                            </p>
                          )}
                          {issueData.solution && (
                            <div className="mt-1 pl-2 border-l-2 border-yellow-400">
                              <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Soluție:</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{issueData.solution}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    
                    {issue.details.additional_details && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        <p className="font-medium">Analiză generală:</p>
                        <p className="mt-1 whitespace-pre-line">{issue.details.additional_details}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex mt-3 gap-2">
                  {isAdmin && (
                    <button 
                      onClick={(e) => handleMarkAsSolved(issue.id, e)}
                      className={`flex-1 py-1.5 text-sm font-medium rounded ${
                        issue.solved 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {issue.solved ? 'Marchează ca nerezolvată' : 'Marchează ca rezolvată'}
                    </button>
                  )}
                  <button 
                    onClick={(e) => handleAssignLocation(issue, e)}
                    className="flex-1 py-1.5 text-sm font-medium rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    {issue.location ? 'Editează locația' : 'Adaugă locație'}
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onIssueDelete(issue.id); }} 
                      className="flex-none py-1.5 px-3 text-sm font-medium rounded bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                      title="Delete Issue"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Loading indicator for fetching more */}
      {visibleCount < filteredIssues.length && (
        <div className="py-2 text-center text-gray-600">Loading more issues...</div>
      )}
      </div>

      {/* Location Assigner Modal */}
      {showLocationAssigner && currentIssue && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <LocationAssigner 
              image={currentIssue}
              onSave={handleLocationSave}
              onCancel={handleLocationCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesList; 