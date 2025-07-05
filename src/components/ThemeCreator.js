import { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ChevronUpIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
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

  // Refs
  const datePickerRef = useRef(null);
  const containerRef = useRef(null);

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
      className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[600px] shadow-lg w-96"
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
        className="mb-4 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Flights of</h3>
              <p className="text-sm text-gray-600">{formatDatesForHeader()}</p>
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
          onClick={() => {
            // Handle collapse action here
            console.log('Collapsing widget...');
          }}
        >
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      {/* Content - Changes based on state */}
      {isCreatingThemes ? (
        // Theme Creation Content
        <div className="mt-4">
          <div className="text-center py-8">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Creating Flight Themes</h4>
            <p className="text-sm text-gray-600 mb-4">
              Generating personalized themes for your selected route and dates...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
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
      )}
    </div>
  );
} 