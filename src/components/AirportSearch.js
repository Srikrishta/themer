import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CalendarIcon, PlusIcon, MapPinIcon, ClockIcon, Bars3Icon, ChevronRightIcon } from '@heroicons/react/24/outline';
import DatePicker from './DatePicker';
import festivalsData from '../data/festivals.json';

// Airport data
const AIRPORTS = [
  // European Airports
  { code: 'CDG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy' }
];

const ITEM_TYPE = 'ROUTE_CARD';

// Helper function to get festivals for a specific city and dates
const getFestivalsForCityAndDates = (city, selectedDates) => {
  if (!selectedDates || selectedDates.length === 0) return [];
  
  const festivals = [];
  
  // Check each selected date
  selectedDates.forEach(dateString => {
    const date = new Date(dateString + 'T12:00:00');
    const month = date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const dayOfMonth = date.getDate();
    
    const monthData = festivalsData[month];
    if (!monthData) return;
    
    monthData.forEach(festival => {
      // Extract city name from location (remove flag emoji and trim)
      const festivalCity = festival.location.replace(/🇩🇪|🇫🇷|🇳🇱|🇮🇹/g, '').trim();
      
      // Check if festival is in this city and overlaps with this date
      if (festivalCity === city && 
          dayOfMonth >= festival.startDay && 
          dayOfMonth <= festival.endDay) {
        // Only add if not already in the list
        if (!festivals.find(f => f.name === festival.name)) {
          festivals.push(festival);
        }
      }
    });
  });
  
  return festivals;
};

function RouteCard({ route, index, moveCard, onRemove, selectedDates = [], defaultLabel, dotRef, cardRef }) {
  const ref = useRef(null);
  
  // Get festivals for this route's city
  const routeFestivals = getFestivalsForCityAndDates(route.airport.city, selectedDates);

  const [{ handlerId }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      return { id: route.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Separate drag handle from the preview
  const opacity = isDragging ? 0.5 : 1;

  // Create separate refs for drag and drop
  const dragRef = useRef(null);
  
  // Combine refs properly
  drop(ref);
  drag(dragRef);



  // Calculate scheduled time based on route position in aircraft schedule
  const getScheduledTime = (routeIndex, routeType) => {
    // Base schedule starts at 01:30 AM
    const baseTime = new Date();
    baseTime.setHours(1, 30, 0, 0); // 01:30 AM
    
    // Schedule pattern based on the provided table
    const schedulePattern = [
      { departure: '01:30 AM', arrival: '02:45 AM' }, // Leg 1
      { departure: '03:30 AM', arrival: '04:15 AM' }, // Leg 2  
      { departure: '05:00 AM', arrival: '05:55 AM' }, // Leg 3
      { departure: '06:45 AM', arrival: '08:15 AM' }, // Leg 4
      { departure: '09:00 AM', arrival: '09:55 AM' }, // Leg 5
      { departure: '10:40 AM', arrival: '11:35 AM' }, // Leg 6
    ];
    
    // For routes beyond the predefined schedule, continue the pattern
    const getTimeForIndex = (index) => {
      if (index < schedulePattern.length) {
        return schedulePattern[index];
      }
      
      // Generate times for additional legs (continuing the pattern)
      const baseMinutes = 730 + (index * 120); // Start from 12:10 PM and add 2 hours per leg
      const depHour = Math.floor(baseMinutes / 60) % 24;
      const depMin = baseMinutes % 60;
      const arrivalMinutes = baseMinutes + 75; // ~1.25 hour flight time
      const arrHour = Math.floor(arrivalMinutes / 60) % 24;
      const arrMin = arrivalMinutes % 60;
      
      const formatTime = (hour, minute) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
      };
      
      return {
        departure: formatTime(depHour, depMin),
        arrival: formatTime(arrHour, arrMin)
      };
    };
    
    const timeSlot = getTimeForIndex(routeIndex);
    
    // Origin shows departure time, destination shows arrival time
    if (routeType === 'origin' || routeType.startsWith('leg')) {
      return timeSlot.departure;
    } else if (routeType === 'destination') {
      return timeSlot.arrival;
    }
    
    return timeSlot.departure;
  };

  // Determine circle color based on festivals
  const circleColor = routeFestivals.length > 0 ? routeFestivals[0].color : '#000';

  return (
    <div
      ref={cardRef ? cardRef : ref}
      className="relative w-full mb-2"
      style={{ 
        opacity,
        position: 'relative'
      }}
      data-handler-id={handlerId}
    >


      {/* Card Content */}
      <div 
        className="w-full cursor-grab hover:cursor-grab"
      >
        {/* Full height drag handle - outside the card - DISABLED */}
        {/* <div 
          ref={dragRef}
          className="absolute w-1 rounded-md cursor-grab active:cursor-grabbing opacity-40"
          style={{ 
            backgroundColor: routeFestivals.length > 0 ? routeFestivals[0].color : '#6B7280',
            left: '11px',
            top: '8px',
            bottom: '8px'
          }}
        /> */}
        
        <div 
          ref={dragRef}
          className={`bg-white p-4 rounded-full border shadow-sm transition-all cursor-grab active:cursor-grabbing hover:cursor-grab w-full ${
            isDragging ? 'border-indigo-300 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: circleColor }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-base font-medium text-gray-900 break-words">
                    {route.airport.city} ({route.airport.code})
                  </h3>
                </div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-3 flex-wrap break-words">
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPinIcon className="w-3 h-3" />
                    {route.type.charAt(0).toUpperCase() + route.type.slice(1)}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <ClockIcon className="w-3 h-3" />
                    {getScheduledTime(index, route.type)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors z-10 relative"
              title="Remove from route"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteList({ routes, setRoutes, onRemoveRoute, selectedDates = [], inputFieldRef, defaultLabel, lastCardRef }) {
  const moveCard = useCallback((dragIndex, hoverIndex) => {
    const newRoutes = [...routes];
    const [reorderedRoute] = newRoutes.splice(dragIndex, 1);
    newRoutes.splice(hoverIndex, 0, reorderedRoute);
    // Recalculate types after reordering
    const updatedRoutes = newRoutes.map((route, index) => ({
      ...route,
      type: index === 0 ? 'origin' : index === newRoutes.length - 1 ? 'destination' : `leg ${index}`
    }));
    setRoutes(updatedRoutes);
  }, [routes, setRoutes]);

  return (
    <div className="relative">
      {/* Route Cards */}
      <div className="relative z-10 flex flex-row items-start w-full">
        {routes.map((route, index) => (
          <React.Fragment key={route.id}>
            <div className="flex-1">
              <RouteCard
                route={route}
                index={index}
                moveCard={moveCard}
                onRemove={() => onRemoveRoute(index)}
                selectedDates={selectedDates}
                defaultLabel={defaultLabel}
                cardRef={index === routes.length - 1 ? lastCardRef : undefined}
              />
            </div>
            {/* Arrow between cards - show for all except the last card */}
            {index < routes.length - 1 && (
              <div className="flex items-center justify-center px-2 py-8">
                <span className="text-gray-600 text-lg font-bold" style={{ fontSize: '18px', fontWeight: '300' }}>→</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function AirportSearchCore({ routes = [], setRoutes, usedAirports = [], selectedRegion = 'Europe', onRemoveRoute, selectedDates = [], defaultLabel, isMinimized, onToggleMinimized }) {
  // Date picker state and logic (moved from ThemeCreator)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dates, setDates] = useState(selectedDates || []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const datePickerRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState('down');

  // Airport search dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle state is now controlled by parent ThemeCreator via isMinimized prop

  const dateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date, fromTyping = false) => {
    const dateString = dateToString(date);
    const currentDates = dates || [];
    if (fromTyping || isTyping) {
      setDates([dateString]);
      return;
    }
    if (currentDates.length === 0 || currentDates.includes(dateString)) {
      setDates([dateString]);
      return;
    }
    if (currentDates.length === 1) {
      const existingDate = new Date(currentDates[0] + 'T12:00:00');
      const newDate = new Date(dateString + 'T12:00:00');
      const sortedDates = [existingDate, newDate].sort((a, b) => a - b);
      setDates([
        dateToString(sortedDates[0]),
        dateToString(sortedDates[1])
      ]);
      return;
    }
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

  const handleEditDates = () => {
    setIsDatePickerOpen(true);
  };

  const navigateMonth = (direction) => {
    const oldDate = currentDate;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(newDate);
  };

  // Refs for positioning
  const dropdownRef = useRef(null);
  const inputFieldRef = useRef(null);
  const lastCardRef = useRef(null);
  const [linePos, setLinePos] = useState({ top: 0, height: 0 });

  // Function to calculate dropdown position
  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return 'down';
    
    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 240; // max-h-60 = 240px
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

  // Update dropdown position when it opens
  useEffect(() => {
    if (isDropdownOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
  }, [isDropdownOpen]);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isDropdownOpen) {
        const position = calculateDropdownPosition();
        setDropdownPosition(position);
      }
    };

    if (isDropdownOpen) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isDropdownOpen]);

  // Filter airports by search term (all airports are European now)
  const filteredAirports = AIRPORTS.filter(airport => {
    const matchesSearch = (
      airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const isNotUsed = !usedAirports.includes(airport.code);
    return matchesSearch && isNotUsed;
  });

  // Group airports by country for better organization
  const groupedAirports = filteredAirports.reduce((groups, airport) => {
    const country = airport.country;
    
    if (!groups[country]) {
      groups[country] = [];
    }
    groups[country].push(airport);
    return groups;
  }, {});

  const handleAirportSelect = (airport) => {
    if (routes.length < 5 && !usedAirports.includes(airport.code)) {
      const newRoute = {
        id: Date.now(),
        airport,
        type: routes.length === 0 ? 'origin' : routes.length === 4 ? 'destination' : 'leg'
      };
      setRoutes([...routes, newRoute]);
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  };

  const handleRemoveRoute = (routeIndex) => {
    // Call the parent's remove function to keep data in sync
    if (onRemoveRoute) {
      onRemoveRoute(routeIndex);
    }
  };

  // Handle badge click for adding/removing airports
  const handleBadgeClick = (airport, isActive) => {
    if (isActive) {
      // Remove from routes
      const routeIndex = routes.findIndex(route => route.airport.code === airport.code);
      if (routeIndex !== -1) {
        handleRemoveRoute(routeIndex);
      }
    } else {
      // Add to routes
      handleAirportSelect(airport);
    }
  };

  // Calculate line position and height
  useEffect(() => {
    const calcLine = () => {
      if (!inputFieldRef?.current || !lastCardRef.current) return;
      const inputRect = inputFieldRef.current.getBoundingClientRect();
      const lastCardRect = lastCardRef.current.getBoundingClientRect();
      const container = inputFieldRef.current.closest('.space-y-4');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      // Center of input field
      const inputCenter = inputRect.top + inputRect.height / 2 - containerRect.top;
      // Center of last card
      const lastCardCenter = lastCardRect.top + lastCardRect.height / 2 - containerRect.top;
      // Line starts at inputCenter, ends at lastCardCenter
      const top = inputCenter;
      const height = lastCardCenter - inputCenter;
      setLinePos({ top, height });
      console.log('Timeline line height:', height, 'px'); // <-- log the height
    };
    if (routes.length > 0) {
      calcLine();
      window.addEventListener('resize', calcLine);
      return () => window.removeEventListener('resize', calcLine);
    }
  }, [routes.length, inputFieldRef, isMinimized]); // <-- add isMinimized

  return (
    <div className="space-y-4 relative">
      {/* Timeline line - from input field center to last card center */}
      {/* Input field and toggle button container */}
      <div className="flex items-start gap-3">
        {/* Input field and badges */}
        <div className="relative w-[484px]" ref={dropdownRef}>
          {/* Custom input container with badges - offset to avoid timeline overlap */}
          <div ref={inputFieldRef} className="relative min-h-[3rem] px-4 py-3 border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-0 w-full">
                          {/* Airport badges - showing only available airports (not in routes) */}
              <div className="flex flex-wrap gap-2 items-center w-full">
                {AIRPORTS.filter(airport => !routes.some(route => route.airport.code === airport.code)).map((airport) => {
                  // Only show airports that aren't already in routes
                  const themeColor = '#D1D5DB'; // Default gray-300 for available badges
                  return (
                    <span 
                      key={airport.code} 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-600 relative group"
                      onClick={() => handleBadgeClick(airport, false)}
                      title={`${airport.name}, ${airport.city}, ${airport.country}`}
                    >
                      {/* Colored dot */}
                      <div 
                        className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
                        style={{ backgroundColor: themeColor }}
                      />
                      {airport.code}
                      {/* Plus icon */}
                      <div className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-200 transition-colors">
                        <PlusIcon className="w-3 h-3" />
                      </div>
                      
                      {/* Custom tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs text-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <div className="font-medium text-gray-900">{airport.name}</div>
                        <div className="text-gray-500">{airport.city}, {airport.country}</div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                      </div>
                    </span>
                  );
                })}
              {/* Input field - hidden when not searching */}
              {searchTerm && (
                <input
                  id="airport-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search airports..."
                  className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 placeholder-gray-400"
                />
              )}
              {/* Show message if all airports are selected */}
              {AIRPORTS.every(airport => routes.some(route => route.airport.code === airport.code)) && !searchTerm && (
                <span className="text-gray-300 text-sm select-none">All airports have been selected</span>
              )}
            </div>
          </div>
          
          {/* Label - adjusted for offset container */}
          <label 
            htmlFor="airport-search" 
            className="absolute -top-2.5 bg-gray-50 px-2 text-sm font-medium text-gray-600 left-3"
          >
            Add route
          </label>
        </div>
        
        {/* Date picker input field - styled like add route input field */}
        <div className="relative w-[400px]">
          {/* Custom input container for date picker */}
          <div className="relative min-h-[3rem] px-4 py-3 border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-0 w-full cursor-pointer" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
            {/* Date display */}
            <div className="flex items-center w-full">
              <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-900 text-sm">
                {dates.length === 2 ? `${dates[0]} to ${dates[1]}` : dates.length === 1 ? dates[0] : 'Select date'}
              </span>
            </div>
          </div>
          
          {/* Label for date picker */}
          <label 
            className="absolute -top-2.5 bg-gray-50 px-2 text-sm font-medium text-gray-600 left-3"
          >
            Add date
          </label>
          
          {/* Date Picker Dropdown */}
          {isDatePickerOpen && (
            <div className="absolute right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 top-full mt-1" style={{ width: '400px' }}>
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
                berlinToday={new Date()}
              />
            </div>
          )}
        </div>
        
        {/* Toggle button - positioned outside and to the right of input field */}
        <button
          type="button"
          className={`inline-flex items-center p-2 rounded-md text-sm font-bold transition-all duration-200 hover:bg-gray-100 flex-shrink-0 ${
            isMinimized 
              ? 'text-gray-600 hover:text-gray-900'
              : 'text-indigo-600 hover:text-indigo-900' 
          }`}
          onClick={() => {
            if (typeof onToggleMinimized === 'function') {
              onToggleMinimized();
            }
          }}
          title={isMinimized ? "Expand ThemeCreator" : "Collapse ThemeCreator"}
        >
          {/* Custom toggle icon */}
          <svg 
            className="w-6 h-6" 
            viewBox="0 0 24 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main rectangle with rounded corners */}
            <rect 
              x="1" 
              y="1" 
              width="22" 
              height="14" 
              rx="3" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              fill="none"
            />
            {/* Vertical divider line */}
            <line 
              x1="8" 
              y1="2" 
              x2="8" 
              y2="14" 
              stroke="currentColor" 
              strokeWidth="1.5"
            />
            {/* Three horizontal lines in left section */}
            <line x1="3" y1="5" x2="6" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="3" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="3" y1="11" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Route Cards with Drag and Drop - now below input field */}
      {routes.length > 0 && (
        <RouteList 
          routes={routes} 
          setRoutes={setRoutes} 
          onRemoveRoute={onRemoveRoute}
          selectedDates={selectedDates}
          inputFieldRef={inputFieldRef}
          defaultLabel={defaultLabel}
          lastCardRef={lastCardRef}
        />
      )}
    </div>
  );
}

export default function AirportSearch(props) {
  return (
    <DndProvider backend={HTML5Backend}>
      <AirportSearchCore {...props} />
    </DndProvider>
  );
}