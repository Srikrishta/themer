import { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import AirportSearch from './AirportSearch';
import DatePicker from './DatePicker';
import festivalsData from '../data/festivals.json';

export default function ThemeCreator({ routes, setRoutes, initialPosition }) {
  // Get current date in Berlin timezone for initial state
  const getBerlinTodayString = () => {
    const now = new Date();
    const berlinTimeString = now.toLocaleDateString("en-CA", {timeZone: "Europe/Berlin"}); // YYYY-MM-DD format
    return berlinTimeString;
  };

  // Direct state management (no tabs) - initialize with today's date
  const [dates, setDates] = useState([getBerlinTodayString()]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('down'); // 'up' or 'down'
  
  // Region selection state
  const [selectedRegion, setSelectedRegion] = useState('Europe');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 }); // Use prop if provided
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // NEW: Theme creation state
  const [isCreatingThemes, setIsCreatingThemes] = useState(false);
  
  // Minimize/maximize state
  const [isMinimized, setIsMinimized] = useState(false);

  // Refs
  const datePickerRef = useRef(null);
  const containerRef = useRef(null);
  const flightCardsRef = useRef(null);

  // NEW: Badge hover state
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);

  // Add after isMinimized state
  const [containerWidth, setContainerWidth] = useState(480); // px
  const minWidth = 318;
  const maxWidth = 480;
  const [isResizing, setIsResizing] = useState(false);

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
  const hasInitializedThemes = useRef(false);

  // Update flight segments and selected themes only when entering theme creation mode for the first time
  useEffect(() => {
    if (isCreatingThemes && !hasInitializedThemes.current && Object.keys(selectedThemes).length === 0) {
      const segments = generateFlightSegments();
      setFlightSegments(segments);
      // Initialize selected themes
      const initialThemes = {};
      segments.forEach(segment => {
        // Determine if a festival is present for this segment
        const destinationCity = segment.destination.airport.city;
        const festival = (() => {
          if (!dates || dates.length === 0) return null;
          const results = [];
          dates.forEach(dateString => {
            const [year, month, day] = dateString.split('-');
            const monthName = new Date(year, month - 1, day).toLocaleString('en-US', { month: 'long' }).toLowerCase();
            const dayOfMonth = parseInt(day, 10);
            const monthFestivals = festivalsData[monthName];
            if (monthFestivals) {
              monthFestivals.forEach(festival => {
                if (festival.location.toLowerCase().includes(destinationCity.toLowerCase())) {
                  if (dayOfMonth >= festival.startDay && dayOfMonth <= festival.endDay) {
                    results.push(festival);
                  }
                }
              });
            }
          });
          return results.length > 0 ? results[0] : null;
        })();
        // If festival exists, select festival theme (id: 2), else select Default (id: 0)
        initialThemes[segment.id] = festival ? 2 : 0;
      });
      setSelectedThemes(initialThemes);
      hasInitializedThemes.current = true;
    }
    if (!isCreatingThemes) {
      hasInitializedThemes.current = false;
    }
  }, [isCreatingThemes]);

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

  // Flight Card Component
  const FlightCard = ({ segment, index }) => {
    // Helper to get festival for a city and date
    const getFestivalForCityAndDate = (city, dates) => {
      if (!dates || dates.length === 0) return null;
      // Use the first date for single, or all dates for range
      const results = [];
      dates.forEach(dateString => {
        const [year, month, day] = dateString.split('-');
        const monthName = new Date(year, month - 1, day).toLocaleString('en-US', { month: 'long' }).toLowerCase();
        const dayOfMonth = parseInt(day, 10);
        const monthFestivals = festivalsData[monthName];
        if (monthFestivals) {
          monthFestivals.forEach(festival => {
            // Match city (case-insensitive, ignore emoji/flag)
            if (festival.location.toLowerCase().includes(city.toLowerCase())) {
              if (dayOfMonth >= festival.startDay && dayOfMonth <= festival.endDay) {
                results.push(festival);
              }
            }
          });
        }
      });
      // Return the first festival found (or null)
      return results.length > 0 ? results[0] : null;
    };

    // Prepare theme options with stable ids
    const destinationCity = segment.destination.airport.city;
    const festival = getFestivalForCityAndDate(destinationCity, dates);
    const themeOptions = [
      { id: 0, name: 'Default', color: '#1E1E1E' },
      { id: 1, name: `${destinationCity} Theme`, color: '#EF4444' },
      // Festival always id: 2, but only included if present
      ...(festival ? [{ id: 2, name: festival.name, color: festival.color || '#10B981' }] : []),
      { id: 3, name: 'Time of the Day', color: '#F59E0B' }
    ];

    // Debug log for selection and theme options
    console.log('segment.id:', segment.id, 'selected:', selectedThemes[segment.id], 'themeOptions:', themeOptions.map(t => t.id + ':' + t.name));

    const badgeRowRef = useRef(null);

    // Move handleThemeSelection inside FlightCard for latest closure
    const handleThemeSelection = (flightId, themeIndex) => {
      setSelectedThemes(prev => {
        const updated = { ...prev, [flightId]: themeIndex };
        console.log('handleThemeSelection called:', flightId, themeIndex, 'updated selectedThemes:', updated);
        return updated;
      });
    };

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
                  <span className="font-medium">{segment.origin.airport.city} ({segment.origin.airport.code})</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">{segment.destination.airport.city} ({segment.destination.airport.code})</span>
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-2 relative">
              {/* Remove chevrons and make theme options vertical */}
              <div
                ref={badgeRowRef}
                className="grid grid-cols-2 gap-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseEnter={() => setIsBadgeHovered(true)}
                onMouseLeave={() => setIsBadgeHovered(false)}
              >
                {themeOptions.map((theme) => (
                  <div
                    key={theme.id}
                    className={`flex items-center gap-3 cursor-pointer px-2 py-1 rounded transition-all flex-shrink-0 ${
                      selectedThemes[segment.id] === theme.id
                        ? 'bg-gray-200/60 border border-black/30'
                        : 'bg-gray-50/60 border border-gray-200/60 hover:bg-gray-100/60'
                    }`}
                    style={{ minWidth: 0 }}
                    onClick={() => handleThemeSelection(segment.id, theme.id)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedThemes[segment.id] === theme.id}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') handleThemeSelection(segment.id, theme.id);
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-md border"
                      style={{
                        backgroundColor: theme.color,
                        borderColor: '#888',
                        boxShadow: 'none',
                        transition: 'box-shadow 0.15s, border-color 0.15s',
                      }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span
                        className={["text-sm text-gray-900 truncate", selectedThemes[segment.id] === theme.id ? "font-semibold" : ""].join(" ")}
                        style={{ maxWidth: 140 }}
                      >
                        {theme.name}
                      </span>
                    </div>
                  </div>
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

  // Drag handlers
  const handleMouseDown = (e) => {
    // Prevent drag if clicking on an interactive element or a RouteCard
    const interactiveTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    if (
      interactiveTags.includes(e.target.tagName) ||
      e.target.isContentEditable ||
      e.target.closest('button, input, select, textarea, [contenteditable="true"]')
    ) {
      return;
    }
    // Prevent drag if inside a RouteCard (AirportSearch RouteCard root has 'flex items-center' and 'mb-2')
    if (e.target.closest('.mb-2.flex.items-center')) {
      return;
    }
    // Prevent drag if inside add route input field
    if (e.target.closest('.border-gray-300.rounded-lg.bg-white')) {
      return;
    }
    // Prevent drag if inside create flights button
    if (e.target.closest('.w-full.px-4.py-2.rounded-md.bg-black')) {
      return;
    }
    // Prevent drag if inside add new route button
    if (e.target.closest('.w-full.px-4.py-2.rounded-md.bg-white')) {
      return;
    }
    // Prevent drag if inside DatePicker calendar
    if (e.target.closest('.bg-white.border.border-gray-200.rounded-lg.shadow-lg')) {
      return;
    }
    // Prevent drag if inside a Flight Card (theme selection)
    if (e.target.closest('.bg-white.p-3.rounded-lg.border')) {
      return;
    }
    // Prevent drag if inside Create Theme button
    if (e.target.closest('.px-6.py-2.rounded-md.bg-black')) {
      return;
    }
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
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      // Clamp to viewport
      newX = Math.max(0, Math.min(newX, window.innerWidth - width));
      newY = Math.max(0, Math.min(newY, window.innerHeight - height));
      setPosition({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse events for resizing
  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e) => {
      // Only allow horizontal resizing
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - position.x));
      setContainerWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, position.x]);

  // Add this at the end of the file for local CSS
  if (typeof document !== 'undefined' && !document.getElementById('hide-scrollbar-style')) {
    const style = document.createElement('style');
    style.id = 'hide-scrollbar-style';
    style.innerHTML = `
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    `;
    document.head.appendChild(style);
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-lg max-h-screen overflow-y-auto hide-scrollbar ${isMinimized ? 'min-h-0' : ''}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
        width: `${containerWidth}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
        transition: isResizing ? 'none' : 'width 0.2s',
        padding: isMinimized && containerWidth === minWidth ? '8px 12px' : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Resizer handle - show in all modes */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '8px',
          cursor: 'ew-resize',
          zIndex: 1100,
        }}
        onMouseDown={e => {
          e.stopPropagation();
          setIsResizing(true);
        }}
        title="Resize"
      />
      {/* Header - Changes based on state */}
      <div 
        className="mb-4 flex items-center justify-between select-none"
        style={isMinimized && containerWidth === minWidth ? {marginBottom: 0} : {}}
      >
        {/* Collapsed + min width: show only 'edit for', date, chevron */}
        {isMinimized && containerWidth === minWidth ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{isCreatingThemes ? 'Flights of' : 'Route for'}</h3>
            <button
              onClick={() => {
                setIsMinimized(false);
                setContainerWidth(minWidth);
                setIsDatePickerOpen(true);
              }}
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
            <button
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              style={{marginLeft: 4}}
              onClick={e => {
                e.stopPropagation();
                setIsMinimized(false);
                setContainerWidth(minWidth);
              }}
              title="Expand"
            >
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        ) : (
          <>
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
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Flights of</h3>
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
          </>
        )}
      </div>
      {/* Rest of the component content */}
      {/* ... (rest of the existing code) */}
    </div>
  );
}