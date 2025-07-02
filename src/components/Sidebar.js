import { useState, useEffect, useRef } from 'react';
import { PlusIcon, ChevronDownIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import AirportSearch from './AirportSearch';
import DatePicker from './DatePicker';

export default function Sidebar() {
  // Direct state management (no tabs)
  const [dates, setDates] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showAirportSearch, setShowAirportSearch] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Region selection state
  const [selectedRegion, setSelectedRegion] = useState('Europe');
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  // Ref for datepicker container to detect clicks outside
  const datePickerRef = useRef(null);
  const regionDropdownRef = useRef(null);

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

      // Handle clicks outside region dropdown
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target)) {
        setIsRegionDropdownOpen(false);
      }
    };

    // Only add event listener when either dropdown is open
    if (isDatePickerOpen || isRegionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen, isRegionDropdownOpen]);

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
    setShowAirportSearch(true);
    setIsDatePickerOpen(false);
    setInputValue('');
  };

  const handleEditDates = () => {
    setShowAirportSearch(false);
    setIsDatePickerOpen(true);
  };

  const navigateMonth = (direction) => {
    const oldDate = currentDate;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    console.log('Sidebar navigateMonth:', {
      direction,
      oldMonth: oldDate.getMonth(),
      oldYear: oldDate.getFullYear(),
      newMonth: newDate.getMonth(),
      newYear: newDate.getFullYear()
    });
    setCurrentDate(newDate);
  };

  // Helper function to format date string for display using Berlin timezone
  const formatDateForDisplay = (dates) => {
    if (!dates || dates.length === 0) return '';
    
    const formatSingleDate = (dateString) => {
      // Parse the date string directly without timezone conversion
      // dateString is in format "YYYY-MM-DD"
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    };
    
    if (dates.length === 1) {
      return formatSingleDate(dates[0]);
    } else if (dates.length === 2) {
      const startFormatted = formatSingleDate(dates[0]);
      const endFormatted = formatSingleDate(dates[1]);
      return `${startFormatted} to ${endFormatted}`;
    }
    
    return '';
  };

  // Get current date in Berlin timezone
  const getBerlinToday = () => {
    const now = new Date();
    // Get Berlin time as a string, then parse it back to get the correct date
    const berlinTimeString = now.toLocaleDateString("en-CA", {timeZone: "Europe/Berlin"}); // YYYY-MM-DD format
    const berlinDate = new Date(berlinTimeString + 'T00:00:00');
    return berlinDate;
  };

  // Generate dynamic theme title based on selected dates
  const getThemeTitle = () => {
    if (!dates || dates.length === 0) {
      return 'Create Theme';
    }

    // Use the first selected date for the title
    const firstDate = dates[0];
    const [year, month, day] = firstDate.split('-');
    
    // Create a date object to get month name
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
    
    return `Theme of ${monthName} ${year}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="relative" ref={regionDropdownRef}>
            <button
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="flex items-center space-x-2 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900">{getThemeTitle()}</h2>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isRegionDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Region Selection Dropdown */}
            {isRegionDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border-2 border-red-500 rounded-lg shadow-xl z-[9999]">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setSelectedRegion('Europe');
                      setIsRegionDropdownOpen(false);
                      // Reset routes when changing regions
                      setRoutes([]);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-blue-200 ${
                      selectedRegion === 'Europe' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-900'
                    }`}
                  >
                    Europe
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={() => {
                      setSelectedRegion('South-East Asia');
                      setIsRegionDropdownOpen(false);
                      // Reset routes when changing regions
                      setRoutes([]);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-green-200 ${
                      selectedRegion === 'South-East Asia' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-900'
                    }`}
                  >
                    South-East Asia
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            className="p-1 rounded-full hover:bg-gray-100 opacity-50 cursor-not-allowed"
            disabled={true}
          >
            <PlusIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Date Picker Container - includes both input and dropdown */}
        <div className="relative mb-4" ref={datePickerRef}>
          {/* Date Picker Input */}
          <div className="relative">
            <label htmlFor="date-input" className="block text-sm font-bold text-gray-700 mb-2">
              Add date(s)
            </label>
            <div className="relative">
              <input
                id="date-input"
                type="text"
                className="w-full p-2 pr-10 border border-gray-300 rounded-md bg-white focus:outline-none focus:border-indigo-500"
                placeholder="DD/MM/YYYY"
                value={inputValue || (dates.length > 0 ? formatDateForDisplay(dates) : '')}
                onChange={(e) => {
                  // Allow full editing of the input field
                  handleInputChange(e.target.value);
                  if (!isDatePickerOpen) {
                    setIsDatePickerOpen(true);
                  }
                }}
                onFocus={() => {
                  // When focusing, if there's a selected date, show it in the input for editing
                  if (dates.length > 0 && !inputValue) {
                    setInputValue(formatDateForDisplay(dates));
                  }
                  if (!isDatePickerOpen) {
                    setIsDatePickerOpen(true);
                  }
                  setIsTyping(false); // Reset typing flag when focusing to edit existing date
                }}
                onClick={() => {
                  if (!isDatePickerOpen) {
                    setIsDatePickerOpen(true);
                  }
                  setIsTyping(false); // Reset typing flag when clicking
                }}
              />
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Date Picker Dropdown */}
          {isDatePickerOpen && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
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
                showAirportSearch={showAirportSearch}
              />
            </div>
          )}
        </div>

        {/* Create Theme Button */}
        {dates.length > 0 && !showAirportSearch && (
          <div className="mb-4">
            <button
              onClick={handleCreateTheme}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create theme
            </button>
          </div>
        )}

        {/* Airport Search and Routes */}
        {showAirportSearch && (
          <div className="mt-6">
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
      </div>

      {/* Create Themes Button - Sticky */}
      {routes.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-auto z-10">
          <button
            className={`w-full px-4 py-2 rounded-md transition-colors
              ${routes.length >= 2 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            disabled={routes.length < 2}
            onClick={() => {
              // Handle create themes logic here
              console.log('Creating themes...');
            }}
          >
            Create themes
          </button>
        </div>
      )}
    </div>
  );
} 