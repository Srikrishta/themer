import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getReadableOnColor } from '../utils/color';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CalendarIcon, PlusIcon, MapPinIcon, ClockIcon, Bars3Icon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, PhotoIcon, PlayIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import FlightCardInline from './FlightCardInline';
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

function RouteCard({ route, index, moveCard, onRemove, selectedDates = [], defaultLabel, dotRef, cardRef, isLast = false, isLoading = false }) {
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
      { departure: '01:30', arrival: '02:45' }, // Leg 1
      { departure: '03:30', arrival: '04:15' }, // Leg 2  
      { departure: '05:00', arrival: '05:55' }, // Leg 3
      { departure: '06:45', arrival: '08:15' }, // Leg 4
      { departure: '09:00', arrival: '09:55' }, // Leg 5
      { departure: '10:40', arrival: '11:35' }, // Leg 6
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
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
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
  const circleOnColor = getReadableOnColor(circleColor);

  return (
    <div
      ref={cardRef ? cardRef : ref}
      className="relative w-full mb-2"
      style={{ 
        opacity,
        position: 'relative'
      }}
      data-handler-id={handlerId}
      aria-busy={isLoading ? 'true' : undefined}
    >


      {/* Card Content */}
      {isLoading ? (
        <div className="w-full">
          <div className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] p-4 rounded-full shadow-sm w-full flex items-center justify-center" style={{ minHeight: '72px' }}>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
          </div>
        </div>
      ) : (
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
            className={`backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] p-4 rounded-full shadow-sm transition-all cursor-grab active:cursor-grabbing hover:cursor-grab w-full ${
              isDragging ? 'shadow-lg' : 'hover:shadow-md'
            }`}
          >
            <div className={`${isLast ? 'flex justify-between' : 'flex justify-start gap-1'} items-start opacity-70`}>
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: circleColor, color: circleOnColor, boxShadow: 'none' }}
                    >
                      {index + 1}
                    </div>
                    <h3 className="text-base font-semibold text-white break-words">
                      {route.airport.city} ({route.airport.code})
                    </h3>
                  </div>
                  <div className="text-xs text-white mt-1 flex items-center gap-3 flex-wrap break-words pl-8">
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <MapPinIcon className="w-3 h-3 text-white" />
                      {route.type.charAt(0).toUpperCase() + route.type.slice(1)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <ClockIcon className="w-3 h-3 text-white" />
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
      )}
    </div>
  );
}

function StaticFlightCard({ segment, index }) {
  return (
    <div className="w-full">
      <div className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] pl-5 pr-3 py-4 rounded-full shadow-sm w-full">
        <div className="flex justify-between items-stretch opacity-70">
          <div className="flex items-start gap-1 flex-none pr-0" style={{ paddingRight: 6 }}>
            <div className="flex-none">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white break-words">
                  {segment?.origin?.airport?.code} → {segment?.destination?.airport?.code}
                </h3>
              </div>
              <div className="text-xs text-white mt-1 flex items-center gap-3 flex-wrap break-words">
                <span className="flex items-center gap-1 font-semibold">Flight {index + 1}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1" style={{ marginLeft: 5 }}>
            <button type="button" className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" title="Add logo">
              <PhotoIcon className="w-4 h-4" />
            </button>
            <button type="button" className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" title="Add theme">
              <div 
                className="w-4 h-4 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
                  backgroundSize: '200% 200%'
                }}
              />
            </button>
            <button type="button" className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" title="Modify flight phase">
              <img src={process.env.PUBLIC_URL + '/flight icon.svg'} alt="Flight icon" className="w-4 h-4" />
            </button>
            <button type="button" className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" title="Update cards">
              <ArrowsUpDownIcon className="w-4 h-4" />
            </button>
            <button type="button" className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" title="Add content">
              <PlayIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteList({ routes, setRoutes, onRemoveRoute, selectedDates = [], inputFieldRef, defaultLabel, lastCardRef, isLoading = false, hideBeforeIndex = 0, themeColor = '#1E1E1E', replacementIndex = -1, selectedFlightIndex = 0, onSelectFlight, onEnterPromptMode, onTriggerPromptBubble }) {
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
      <div className="relative z-10 flex flex-row items-center w-full gap-2" data-flight-cards-container>
        {(() => { return null; })()}
        {/* Compute number of visible flight cards */}
        {/**/}
        {routes.map((route, index) => (
          <React.Fragment key={route.id}>
            {(() => {
              // Decide what to render for this slot; skip wrapper entirely if nothing
              // Hide the last route card during generation phase (no corresponding flight segment)
              const shouldHideLast = isLoading && index === routes.length - 1;
              if (shouldHideLast) return null;

              if (index <= replacementIndex && index < routes.length - 1) {
                const segIndex = index;
                const segment = { origin: routes[segIndex], destination: routes[segIndex + 1] };
                const flightsVisible = Math.min(replacementIndex + 1, routes.length - 1);
                const isActive = segIndex === selectedFlightIndex; // selected is active/expanded
                return (
                  <div className="basis-0" style={{ flex: flightsVisible >= 4 ? (isActive ? 2 : 1) : 1, minWidth: 0 }}>
                    <FlightCardInline
                      segment={segment}
                      index={segIndex}
                      activeIndex={selectedFlightIndex}
                      themeColor={themeColor}
                      onSelect={() => { if (typeof onSelectFlight === 'function') onSelectFlight(segIndex); }}
                      onEnterPromptMode={onEnterPromptMode}
                      onTriggerPromptBubble={onTriggerPromptBubble}
                    />
                  </div>
                );
              }
              return (
                <div className="flex-1 min-w-0 basis-0">
                  <RouteCard
                    route={route}
                    index={index}
                    moveCard={moveCard}
                    onRemove={() => onRemoveRoute(index)}
                    selectedDates={selectedDates}
                    defaultLabel={defaultLabel}
                    cardRef={index === routes.length - 1 ? lastCardRef : undefined}
                    isLast={index === routes.length - 1}
                    isLoading={isLoading}
                  />
                </div>
              );
            })()}
            {/* Arrow logic: show only if both left and right items are visible */}
            {(() => {
              if (index >= routes.length - 1) return false;
              // Slot is visible if it has either a flight (index <= replacementIndex) or a route (index >= hideBeforeIndex)
              const isSlotVisible = (i) => {
                if (isLoading && i === routes.length - 1) return false; // hide last during generation
                return i <= replacementIndex || i >= hideBeforeIndex;
              };
              return isSlotVisible(index) && isSlotVisible(index + 1);
            })() && (
              <div className="flex items-center justify-center flex-shrink-0 px-1 py-6">
                <span className="text-white text-lg font-bold opacity-60" style={{ fontSize: '18px', fontWeight: '300' }}>→</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function AirportSearchCore({ routes = [], setRoutes, usedAirports = [], selectedRegion = 'Europe', onRemoveRoute, selectedDates = [], defaultLabel, isMinimized, onToggleMinimized, onSelectedDatesChange, themeColor = '#1E1E1E', onEnterPromptMode, onTriggerPromptBubble, onGeneratingStateChange, onBuildThemes, onFlightSelect }) {
  // Date picker state and logic (moved from ThemeCreator)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dates, setDates] = useState(selectedDates || []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const datePickerRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgressIndex, setGeneratingProgressIndex] = useState(0);
  const [replacementIndex, setReplacementIndex] = useState(-1); // -1 means none replaced yet
  const [selectedInlineFlightIndex, setSelectedInlineFlightIndex] = useState(0);
  const [isReversingToRoutes, setIsReversingToRoutes] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 200, left: 200 });

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
      if (onSelectedDatesChange) onSelectedDatesChange([dateString]);
      return;
    }
    if (currentDates.length === 0 || currentDates.includes(dateString)) {
      setDates([dateString]);
      if (onSelectedDatesChange) onSelectedDatesChange([dateString]);
      return;
    }
    if (currentDates.length === 1) {
      const existingDate = new Date(currentDates[0] + 'T12:00:00');
      const newDate = new Date(dateString + 'T12:00:00');
      const sortedDates = [existingDate, newDate].sort((a, b) => a - b);
      const range = [
        dateToString(sortedDates[0]),
        dateToString(sortedDates[1])
      ];
      setDates(range);
      if (onSelectedDatesChange) onSelectedDatesChange(range);
      return;
    }
    setDates([dateString]);
    if (onSelectedDatesChange) onSelectedDatesChange([dateString]);
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

  // Calculate dropdown position relative to the date input field
  const calculateDateDropdownPosition = () => {
    try {
      const dateInputContainer = document.querySelector('[data-date-input-container]');
      if (dateInputContainer) {
        const rect = dateInputContainer.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left + (rect.width / 2) - 200 // Center the 400px dropdown
        });
      }
    } catch (error) {
      console.log('Could not calculate dropdown position:', error);
    }
  };

  // Progressive hide+replace: spinner on all, then replace route i with flight i left->right
  useEffect(() => {
    if (!isGenerating) return;
    setGeneratingProgressIndex(0);
    setReplacementIndex(-1);
    const total = routes.length;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setGeneratingProgressIndex(prev => (prev < total ? prev + 1 : prev));
      // start replacing after the first tick, progress i corresponds to replacing index i-1
      setReplacementIndex(prev => {
        const next = Math.min(routes.length - 2, (i - 1));
        return next;
      });
      if (i >= total) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [isGenerating, routes.length]);

  // Reverse animation: flight cards transform back to route cards left->right
  useEffect(() => {
    if (!isReversingToRoutes) return;
    const total = routes.length;
    let i = total;
    const id = setInterval(() => {
      i -= 1;
      // Reduce replacement index from right to left
      setReplacementIndex(prev => Math.max(-1, i - 1));
      if (i <= 0) {
        clearInterval(id);
        // Animation complete, reset states
        setIsReversingToRoutes(false);
        setIsGenerating(false);
        setGeneratingProgressIndex(0);
        setReplacementIndex(-1);
      }
    }, 500);
    return () => clearInterval(id);
  }, [isReversingToRoutes, routes.length]);

  // Recalculate dropdown position on window resize
  useEffect(() => {
    if (isDatePickerOpen) {
      const handleResize = () => calculateDateDropdownPosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isDatePickerOpen]);

  // Notify parent component when generating state changes
  useEffect(() => {
    console.log('=== AIRPORTSEARCH: isGenerating changed to ===', isGenerating);
    if (onGeneratingStateChange) {
      onGeneratingStateChange(isGenerating);
    }
  }, [isGenerating, onGeneratingStateChange]);

  // Clamp selected inline flight index to available flights and notify parent of selection
  useEffect(() => {
    const maxIndex = Math.max(0, Math.min(replacementIndex, routes.length - 2));
    if (replacementIndex >= 0 && selectedInlineFlightIndex > maxIndex) {
      setSelectedInlineFlightIndex(maxIndex);
    }
    
    // Automatically notify parent of the current selection when flights are generated
    if (replacementIndex >= 0 && onFlightSelect && routes.length > 1) {
      const currentIndex = Math.min(selectedInlineFlightIndex, maxIndex);
      if (routes.length > currentIndex + 1) {
        const segment = {
          origin: routes[currentIndex],
          destination: routes[currentIndex + 1]
        };
        onFlightSelect(segment);
      }
    }
  }, [replacementIndex, routes.length, selectedInlineFlightIndex, onFlightSelect]);

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

  // Tooltip colors should match ThemeCreator background, not theme color
  const tooltipBgColor = '#1E1E1E'; // Fixed to match TC background
  const tooltipTextColor = getReadableOnColor(tooltipBgColor);



  return (
    <div className="space-y-12 relative" style={{ overflow: 'visible' }}>
      {/* Timeline line - from input field center to last card center */}
      {/* Input field and toggle button container */}
      <div className="flex items-end gap-3" style={{ overflow: 'visible' }}>
        {/* Input field and badges */}
        <div className={`relative ${isGenerating ? 'w-[50%]' : 'w-[55%]'}`} ref={dropdownRef}>
          {/* Label above Add route input */}
          <div className="mb-1 text-white text-sm font-medium">Add route</div>
          {/* Custom input container with badges - offset to avoid timeline overlap */}
          <div ref={inputFieldRef} className="relative min-h-[3rem] px-4 py-3 rounded-lg backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] focus-within:ring-0 w-full">
                          {/* Airport badges - showing only available airports (not in routes) */}
              <div className="flex flex-wrap gap-2 items-center w-full">
                {AIRPORTS.filter(airport => !routes.some(route => route.airport.code === airport.code)).map((airport) => {
                  // Only show airports that aren't already in routes
                  return (
                    <span 
                      key={airport.code} 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer bg-transparent text-white/80 border border-white/40 hover:border-white/60 hover:bg-transparent hover:text-white relative group"
                      onClick={() => handleBadgeClick(airport, false)}
                      title={`${airport.name}, ${airport.city}, ${airport.country}`}
                    >
                      {/* Colored dot */}
                      <div 
                        className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
                        style={{ backgroundColor: '#1E1E1E' }}
                      />
                      {airport.code}
                      {/* Plus icon */}
                      <div className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-transparent transition-colors">
                        <PlusIcon className="w-3 h-3" />
                      </div>
                      
                      {/* Custom tooltip */}
                      <div
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                        style={{ backgroundColor: tooltipBgColor, color: tooltipTextColor }}
                      >
                        <div className="font-medium" style={{ color: tooltipTextColor }}>{airport.name}</div>
                        <div style={{ color: tooltipTextColor, opacity: 0.85 }}>{airport.city}, {airport.country}</div>
                        {/* Arrow */}
                        <div
                          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                          style={{ borderTopColor: tooltipBgColor }}
                        ></div>
                      </div>
                    </span>
                  );
                })}
              
              {/* Add new chip */}
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer bg-transparent text-white/80 border border-white/40 hover:border-white/60 hover:bg-transparent hover:text-white relative group"
                onClick={() => {
                  // Handle add new functionality - could open a modal or expand search
                  console.log('Add new clicked');
                }}
                title="Add new route"
              >
                Add new
                {/* Plus icon */}
                <div className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors">
                  <PlusIcon className="w-3 h-3" />
                </div>
              </span>
              
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
                <span className="text-gray-500 text-sm font-semibold select-none">All airports have been selected</span>
              )}
            </div>
          </div>
          
          {/* Former inline label removed; now rendered above input */}
        </div>
        
        {/* Date picker input field - styled like add route input field */}
        <div className="relative w-[50%] flex items-end gap-3" style={{ zIndex: 100000 }}>
          {/* Date input + centered dropdown wrapper */}
          <div className="relative flex-1" style={{ overflow: 'visible' }}>
            {/* Label above Add date input */}
            <div className="mb-1 text-white text-sm font-medium">Add date</div>
            {/* Custom input container for date picker */}
            <div 
              data-date-input-container
              className="relative min-h-[3rem] px-4 py-3 rounded-lg backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] focus-within:ring-0 w-full cursor-pointer" 
              onClick={() => {
                if (!isDatePickerOpen) {
                  calculateDateDropdownPosition();
                }
                setIsDatePickerOpen(!isDatePickerOpen);
              }}>
              {/* Date display */}
              <div className="flex items-center w-full">
                <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-500 text-sm font-semibold flex-1">
                  {dates.length === 2 ? `${dates[0]} to ${dates[1]}` : dates.length === 1 ? dates[0] : 'Select date'}
                </span>
                {/* Chevron toggle icon */}
                {isDatePickerOpen ? (
                  <ChevronUpIcon className="w-4 h-4 text-gray-400 ml-2" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-2" />
                )}
              </div>
            </div>
            {/* Former inline label removed; now rendered above input */}
            {/* Date Picker Dropdown - positioned using fixed to bypass parent clipping */}
            {isDatePickerOpen && (
              <div 
                className="fixed rounded-lg shadow-lg" 
                style={{ 
                  width: '400px', 
                  backgroundColor: '#1E1E1E', 
                  zIndex: 999999,
                  left: `${dropdownPosition.left}px`,
                  top: `${dropdownPosition.top}px`
                }}>
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
                  themeColor={themeColor}
                  containerBgColor="#1E1E1E"
                />
              </div>
            )}
          </div>

          {/* Generate flights / Add Themes button and Modify button */}
          {!isGenerating ? (
            // Show only Generate flights button when not generating
            <button
              className={`h-12 px-4 rounded-tl-[0px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[24px] transition-colors flex items-center justify-center w-[240px] relative overflow-hidden ${
                routes.length >= 2 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] text-white/70 cursor-not-allowed'
              }`}
              disabled={routes.length < 2}
              onClick={() => {
                setIsGenerating(true);
                const event = new CustomEvent('airport-search-generate-flights');
                window.dispatchEvent(event);
              }}
              title="Generate flights"
            >
              <span>Generate flights</span>
            </button>
          ) : (
            // Show both Add Themes and Modify buttons when generating
            <div className="flex gap-2">
              <button
                className="h-12 px-4 rounded-tl-[0px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[24px] transition-colors flex items-center justify-center w-[240px] relative overflow-hidden bg-blue-600 text-white hover:bg-blue-700 opacity-90"
                onClick={() => {
                  // When "Build themes" is clicked, trigger theme build
                  if (onBuildThemes) {
                    onBuildThemes();
                  }
                }}
                title="Add themes"
              >
                <span>Add Themes</span>
              </button>
              <button
                className="h-12 px-4 rounded-tl-[24px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[24px] transition-colors flex items-center justify-center w-[140px] relative overflow-hidden bg-gray-600 text-white hover:bg-gray-700"
                onClick={() => {
                  // Start reverse animation: flight cards transform back to route cards
                  setIsReversingToRoutes(true);
                }}
                title="Modify routes"
              >
                <span>Modify route</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Toggle button removed per request */}
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
          isLoading={isGenerating}
          hideBeforeIndex={generatingProgressIndex}
          replacementIndex={replacementIndex}
          themeColor={themeColor}
          selectedFlightIndex={selectedInlineFlightIndex}
          onSelectFlight={(i) => {
            setSelectedInlineFlightIndex(i);
            // Notify parent component of the selected flight segment
            if (onFlightSelect && routes.length > i + 1) {
              const segment = {
                origin: routes[i],
                destination: routes[i + 1]
              };
              onFlightSelect(segment);
            }
          }}
          onEnterPromptMode={onEnterPromptMode}
          onTriggerPromptBubble={onTriggerPromptBubble}
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