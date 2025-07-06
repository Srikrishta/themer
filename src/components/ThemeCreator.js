import { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import AirportSearch from './AirportSearch';
import DatePicker from './DatePicker';

export default function ThemeCreator() {
  // Get current date in Berlin timezone for initial state
  const getBerlinTodayString = () => {
    const now = new Date();
    const berlinTimeString = now.toLocaleDateString("en-CA", {timeZone: "Europe/Berlin"}); // YYYY-MM-DD format
    return berlinTimeString;
  };

  // Direct state management (no tabs) - initialize with today's date
  const [dates, setDates] = useState([getBerlinTodayString()]);
  const [routes, setRoutes] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('down'); // 'up' or 'down'
  
  // Region selection state
  const [selectedRegion, setSelectedRegion] = useState('Europe');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Initial position
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // NEW: Theme creation state
  const [isCreatingThemes, setIsCreatingThemes] = useState(false);
  
  // Minimize/maximize state
  const [isMinimized, setIsMinimized] = useState(false);

  // Refs
  const datePickerRef = useRef(null);
  const containerRef = useRef(null);
  const flightCardsRef = useRef(null);

  // Function to calculate dropdown position
  const calculateDropdownPosition = () => {
    if (!datePickerRef.current) return 'down';
    
    const rect = datePickerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 420; // Approximate height of the DatePicker dropdown (calendar + padding)
    const buffer = 20; // Extra buffer for safety
    
    const spaceBelow = viewportHeight - rect.bottom - buffer;
    const spaceAbove = rect.top - buffer;
    
    // If there's not enough space below but enough space above, position upwards
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      return 'up';
    }
    
    // Default to downwards positioning
    return 'down';
  };

  // Update dropdown position when it opens or window resizes
  useEffect(() => {
    if (isDatePickerOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
  }, [isDatePickerOpen]);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isDatePickerOpen) {
        const position = calculateDropdownPosition();
        setDropdownPosition(position);
      }
    };

    if (isDatePickerOpen) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isDatePickerOpen]);

  // Handle clicks outside datepicker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        // Don't close if clicking on navigation buttons
        const clickedElement = event.target.closest('button');
        if (clickedElement && clickedElement.getAttribute('data-navigation')) {
          return;
        }
        
        setIsDatePickerOpen(false);
        setInputValue(''); // Clear any temporary input value
        setIsTyping(false); // Reset typing state
      }
    };

    // Only add event listener when dropdown is open
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  // Route management
  const handleRoutesUpdate = (newRoutes) => {
    // Update route types based on the number of routes
    const updatedRoutes = newRoutes.map((route, index) => {
      let type;
      if (newRoutes.length === 2) {
        type = index === 0 ? 'origin' : 'destination';
      } else {
        if (index === 0) type = 'origin';
        else if (index === newRoutes.length - 1) type = 'destination';
        else type = `leg ${index}`;
      }
      return { ...route, type };
    });

    setRoutes(updatedRoutes);
  };

  // Helper function to convert Date to YYYY-MM-DD string without timezone issues
  const dateToString = (date) => {
    // Use the local date values to avoid timezone conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date management functions
  const handleDateClick = (date, fromTyping = false) => {
    const dateString = dateToString(date);
    const currentDates = dates || [];
    
    // If user is typing, always replace the current selection
    if (fromTyping || isTyping) {
      setDates([dateString]);
      return;
    }
    
    // If no dates selected, or if clicking the same date, select single date
    if (currentDates.length === 0 || currentDates.includes(dateString)) {
      setDates([dateString]);
      return;
    }
    
    // If one date selected, create a range
    if (currentDates.length === 1) {
      const existingDate = new Date(currentDates[0] + 'T12:00:00');
      const newDate = new Date(dateString + 'T12:00:00');
      
      // Sort dates to ensure start date comes first
      const sortedDates = [existingDate, newDate].sort((a, b) => a - b);
      setDates([
        dateToString(sortedDates[0]),
        dateToString(sortedDates[1])
      ]);
      return;
    }
    
    // If two dates selected, start over with new single date
    setDates([dateString]);
  };

  const handleInputChange = (value, navigateToDate) => {
    setInputValue(value);
    setIsTyping(true);
    if (!isDatePickerOpen) {
      setIsDatePickerOpen(true);
    }
    if (navigateToDate) {
      setCurrentDate(navigateToDate);
    }
  };

  const handleCreateTheme = () => {
    setIsDatePickerOpen(false);
    setInputValue('');
  };

  // NEW: Handle create flight themes button click
  const handleCreateFlightThemes = () => {
    setIsCreatingThemes(true);
    setIsDatePickerOpen(false);
    setInputValue('');
  };

  // NEW: Handle back to route creation
  const handleBackToRouteCreation = () => {
    setIsCreatingThemes(false);
  };

  // Generate flight segments from routes
  const generateFlightSegments = () => {
    if (routes.length < 2) return [];
    
    const segments = [];
    for (let i = 0; i < routes.length - 1; i++) {
      segments.push({
        id: `flight-${i + 1}`,
        flightNumber: i + 1,
        origin: routes[i],
        destination: routes[i + 1],
        selectedTheme: null
      });
    }
    return segments;
  };

  // State for flight segments and theme selections
  const [flightSegments, setFlightSegments] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState({});
  const [timelineHeight, setTimelineHeight] = useState('calc(100% + 80px)');

  // Update flight segments when routes change or when entering theme creation mode
  useEffect(() => {
    if (isCreatingThemes) {
      const segments = generateFlightSegments();
      setFlightSegments(segments);
      // Initialize selected themes
      const initialThemes = {};
      segments.forEach(segment => {
        initialThemes[segment.id] = null;
      });
      setSelectedThemes(initialThemes);
    }
  }, [isCreatingThemes, routes]);

  // Calculate timeline height for flight cards
  useEffect(() => {
    const calculateTimelineHeight = () => {
      if (flightCardsRef.current && flightSegments.length > 1) {
        const flightCardsRect = flightCardsRef.current.getBoundingClientRect();
        const containerHeight = flightCardsRect.height;
        const calculatedHeight = Math.max(containerHeight - 40, 60); // Minimum 60px height
        setTimelineHeight(`${calculatedHeight}px`);
      }
    };

    if (isCreatingThemes && flightSegments.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(calculateTimelineHeight, 100);
      
      // Recalculate on window resize
      window.addEventListener('resize', calculateTimelineHeight);
      return () => window.removeEventListener('resize', calculateTimelineHeight);
    }
  }, [isCreatingThemes, flightSegments.length, selectedThemes]); // Re-calculate when themes change (affects card height)

  // Handle theme selection for a flight
  const handleThemeSelection = (flightId, themeIndex) => {
    setSelectedThemes(prev => ({
      ...prev,
      [flightId]: themeIndex
    }));
  };

  // Flight Card Component
  const FlightCard = ({ segment, index }) => {
    const themeOptions = [
      { id: 0, name: 'Theme 1', color: '#3B82F6' },
      { id: 1, name: 'Theme 2', color: '#EF4444' },
      { id: 2, name: 'Theme 3', color: '#10B981' },
      { id: 3, name: 'Theme 4', color: '#F59E0B' }
    ];

    return (
      <div className="relative w-full mb-4 flex items-start max-w-full">
        {/* Flight number dot */}
        <div className="flex-shrink-0 mr-3 flex justify-center items-center" style={{ width: '24px' }}>
          <div 
            className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold relative z-10"
            style={{ backgroundColor: '#6B7280' }}
          >
            {segment.flightNumber}
          </div>
        </div>

        {/* Flight Card Content */}
        <div className="flex-1 min-w-0 max-w-full">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all w-full">
            <div className="mb-3">
              <div className="min-w-0">
                <div className="text-base text-gray-900 flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{segment.origin.airport.code}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">{segment.destination.airport.code}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {segment.origin.airport.city} to {segment.destination.airport.city}
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-2">
              <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2 -mx-1 px-1">
                {themeOptions.map((theme) => (
                  <label
                    key={theme.id}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      selectedThemes[segment.id] === theme.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-700'
                        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`theme-${segment.id}`}
                      value={theme.id}
                      checked={selectedThemes[segment.id] === theme.id}
                      onChange={() => handleThemeSelection(segment.id, theme.id)}
                      className="sr-only"
                    />
                    <div 
                      className={`w-2 h-2 rounded-full mr-1.5 flex-shrink-0 border-2 ${
                        selectedThemes[segment.id] === theme.id 
                          ? 'border-white' 
                          : 'border-gray-300'
                      }`}
                      style={{ 
                        backgroundColor: theme.color,
                        boxShadow: selectedThemes[segment.id] === theme.id 
                          ? `0 0 0 1px ${theme.color}` 
                          : 'none'
                      }}
                    />
                    {theme.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Format dates for "Flights of" header
  const formatDatesForHeader = () => {
    if (dates.length === 0) return '';
    
    const formatDate = (dateString) => {
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    if (dates.length === 1) {
      return formatDate(dates[0]);
    } else if (dates.length === 2) {
      return `${formatDate(dates[0])} to ${formatDate(dates[1])}`;
    }
    
    return '';
  };

  const handleEditDates = () => {
    setIsDatePickerOpen(true);
  };

  const handleRemoveDate = (dateIndex) => {
    const newDates = [...dates];
    newDates.splice(dateIndex, 1);
    setDates(newDates);
  };

  // Format single date for badge display
  const formatSingleDateForBadge = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const navigateMonth = (direction) => {
    const oldDate = currentDate;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    console.log('ThemeCreator navigateMonth:', {
      direction,
      oldMonth: oldDate.getMonth(),
      oldYear: oldDate.getFullYear(),
      newMonth: newDate.getMonth(),
      newYear: newDate.getFullYear()
    });
    setCurrentDate(newDate);
  };

  // Get current date in Berlin timezone
  const getBerlinToday = () => {
    const now = new Date();
    // Get Berlin time as a string, then parse it back to get the correct date
    const berlinTimeString = now.toLocaleDateString("en-CA", {timeZone: "Europe/Berlin"}); // YYYY-MM-DD format
    const berlinDate = new Date(berlinTimeString + 'T00:00:00');
    return berlinDate;
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div 
      ref={containerRef}
      className={`bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-lg w-[480px] ${isMinimized ? 'min-h-0' : 'min-h-[600px]'}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Header - Changes based on state */}
      <div 
        className="mb-4 flex items-center justify-between select-none"
      >
        {isCreatingThemes ? (
          // Themes Creation Header
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToRouteCreation}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Flights of</h3>
              <button className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-bold bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="w-3 h-3 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"></path>
                </svg>
                {dates.length === 2 ? (
                  `${formatSingleDateForBadge(dates[0])} to ${formatSingleDateForBadge(dates[1])}`
                ) : dates.length === 1 ? (
                  formatSingleDateForBadge(dates[0])
                ) : (
                  'Select dates'
                )}
              </button>
            </div>
          </div>
        ) : (
          // Route Creation Header
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Create route for</h3>
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-bold bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <CalendarIcon className="w-3 h-3 mr-1.5" />
              {dates.length === 2 ? (
                `${formatSingleDateForBadge(dates[0])} to ${formatSingleDateForBadge(dates[1])}`
              ) : dates.length === 1 ? (
                formatSingleDateForBadge(dates[0])
              ) : (
                'Select dates'
              )}
            </button>
          </div>
        )}
        
        <button
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering drag when clicking chevron
            setIsMinimized(!isMinimized);
            // Close date picker when minimizing
            if (!isMinimized) {
              setIsDatePickerOpen(false);
              setInputValue('');
              setIsTyping(false);
            }
          }}
        >
          {isMinimized ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Drag Handle - Only visible when not minimized */}
      {!isMinimized && (
        <div 
          className="w-full h-2 mb-2 cursor-grab active:cursor-grabbing flex justify-center items-center"
          onMouseDown={handleMouseDown}
        >
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>
      )}
      
      {/* Content - Changes based on state */}
      {!isMinimized && (isCreatingThemes ? (
        // Theme Creation Content
        <div className="mt-4 relative">
          {/* Flight Cards */}
          <div ref={flightCardsRef} className="space-y-4 relative z-10">
            {flightSegments.map((segment, index) => (
              <FlightCard 
                key={segment.id} 
                segment={segment} 
                index={index}
              />
            ))}
          </div>

          {/* Timeline connecting flight cards */}
          {flightSegments.length > 1 && (
            <div 
              className="absolute z-0"
              style={{
                left: '12px',
                top: '20px',
                width: '12px',
                height: timelineHeight, // Dynamic height based on flight cards container
                borderLeft: '1px solid rgb(209, 213, 219)', // gray-300
                borderTop: '1px solid rgb(209, 213, 219)', // gray-300  
                borderBottom: '1px solid rgb(209, 213, 219)', // gray-300
                borderTopLeftRadius: '6px',
                borderBottomLeftRadius: '6px'
              }}
            />
          )}
        </div>
      ) : (
        // Route Creation Content
        <>
          {/* Date Picker Dropdown */}
          <div className="relative" ref={datePickerRef}>
            {isDatePickerOpen && (
              <div className={`absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
                dropdownPosition === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}>
                <DatePicker
                  currentDate={currentDate}
                  onNavigateMonth={navigateMonth}
                  selectedDates={dates}
                  onDateClick={handleDateClick}
                  onCreateTheme={handleCreateTheme}
                  onEditDates={handleEditDates}
                  inputValue={inputValue}
                  onInputChange={handleInputChange}
                  setCurrentDate={setCurrentDate}
                  berlinToday={getBerlinToday()}
                />
              </div>
            )}
          </div>

          {/* Airport Search and Routes - Show when dates are selected */}
          {dates.length > 0 && (
            <div className="mt-4">
              <AirportSearch
                routes={routes}
                setRoutes={handleRoutesUpdate}
                usedAirports={routes.map(r => r.airport.code)}
                selectedRegion={selectedRegion}
                selectedDates={dates}
                onRemoveRoute={(index) => {
                  const newRoutes = [...routes];
                  newRoutes.splice(index, 1);
                  handleRoutesUpdate(newRoutes);
                }}
              />
            </div>
          )}

          {/* Create Themes Button */}
          {routes.length > 0 && (
            <div className="mt-8 space-y-3">
              <button
                className={`w-full px-4 py-2 rounded-md transition-colors
                  ${routes.length >= 2 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                disabled={routes.length < 2}
                onClick={handleCreateFlightThemes}
              >
                Create flight themes
              </button>
              
              {/* Add New Route Button - Secondary */}
              <button
                className="w-full px-4 py-2 rounded-md transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                onClick={() => {
                  // Handle add new route logic here
                  console.log('Adding new route...');
                }}
              >
                Add new route
              </button>
            </div>
          )}
        </>
      ))}
    </div>
  );
} 