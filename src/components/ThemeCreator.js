import React, { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import AirportSearch from './AirportSearch';
import DatePicker from './DatePicker';
import festivalsData from '../data/festivals.json';
import { HexColorPicker } from 'react-colorful';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';

export default function ThemeCreator({ routes, setRoutes, initialMinimized, onColorCardSelect, onThemeColorChange, initialWidth, onExpand, onStateChange, initialFlightCreationMode, onEnterPromptMode, isPromptMode, activeSegmentId, onFilterChipSelect, isInHeader, onExposeThemeChips, onStartThemeBuild }) {
  const navigate = useNavigate();
  const DEFAULT_THEME_COLOR = '#1E1E1E';
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



  // NEW: Theme creation state
  const [isCreatingThemes, setIsCreatingThemes] = useState(initialFlightCreationMode || false);
  const [hasStartedThemeBuild, setHasStartedThemeBuild] = useState(false);
  
  // Minimize/maximize state removed; always expanded
  const [isMinimized, setIsMinimized] = useState(false);

  // Notify parent when minimized state or flight creation state changes
  useEffect(() => {
    if (typeof onStateChange === 'function') {
      onStateChange(false, isCreatingThemes);
    }
  }, [isCreatingThemes, onStateChange]);

  // Refs
  const datePickerRef = useRef(null);
  const containerRef = useRef(null);
  const colorCardsRef = useRef(null);
  const flightChipsRef = useRef(null);
  const chipsInitialBottomRef = useRef(null);
  const [isChipsCollapsed, setIsChipsCollapsed] = useState(false);

  // NEW: Badge hover state
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);

  // Add after isMinimized state
  const IFE_FRAME_WIDTH = 1400;
  const [containerWidth, setContainerWidth] = useState(480); // px
  const minWidth = 318;
  const maxWidth = 480;

  // Refs for first card title and last card bottom
  const firstTitleRef = useRef(null);
  const lastCardBottomRef = useRef(null);
  const [timelineLine, setTimelineLine] = useState({ top: 0, height: 0 });

  // Active color card state
  const [activeFlightIndex, setActiveFlightIndex] = useState(null);

  // Helper to get festival for a city and selected dates (shared)
  const getFestivalForCityAndDate = (city, selectedDates) => {
    if (!selectedDates || selectedDates.length === 0) return null;
    const results = [];
    selectedDates.forEach(dateString => {
      const [year, month, day] = dateString.split('-');
      const monthName = new Date(year, month - 1, day).toLocaleString('en-US', { month: 'long' }).toLowerCase();
      const dayOfMonth = parseInt(day, 10);
      const monthFestivals = festivalsData[monthName];
      if (monthFestivals) {
        monthFestivals.forEach(festival => {
          // Match city (case-insensitive, ignore emoji/flag)
          if (festival.location.toLowerCase().includes((city || '').toLowerCase())) {
            if (dayOfMonth >= festival.startDay && dayOfMonth <= festival.endDay) {
              results.push(festival);
            }
          }
        });
      }
    });
    return results.length > 0 ? results[0] : null;
  };

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
    setHasStartedThemeBuild(true);
    setIsDatePickerOpen(false);
    setInputValue('');
    // Smooth scroll to flight chips (and build theme button)
    setTimeout(() => {
      try {
        const node = flightChipsRef.current;
        if (node) {
          const rect = node.getBoundingClientRect();
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;
          // Position chips a bit below top for breathing room
          const targetY = rect.top + scrollY - 24;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        }
      } catch {}
    }, 150);
    try {
      // If we have at least two routes, expose chips including festival (if any)
      const segments = generateFlightSegments();
      if (segments.length > 0) {
        const currentSeg = segments[0];
        const destCity = currentSeg?.destination?.airport?.city;
        const festival = getFestivalForCityAndDate(destCity, dates);
        const chips = [
          { label: 'Default', color: '#1E1E1E' },
          { label: `${destCity || 'City'} Theme`, color: '#EF4444' },
          ...(festival ? [{ label: festival.name, color: festival.color || '#10B981' }] : []),
          { label: 'Time of the Day', color: '#F59E0B' }
        ];
        if (typeof onExposeThemeChips === 'function') onExposeThemeChips(chips);
        if (typeof onStartThemeBuild === 'function') onStartThemeBuild(true);
      }
    } catch {}
  };

  // Listen for AirportSearch-local button to trigger generate flights
  useEffect(() => {
    const handler = () => handleCreateFlightThemes();
    window.addEventListener('airport-search-generate-flights', handler);
    return () => window.removeEventListener('airport-search-generate-flights', handler);
  }, []);

  // Collapse flight chips to compact (dots) view when scrolled past the chips
  useEffect(() => {
    if (!isCreatingThemes) {
      setIsChipsCollapsed(false);
      return;
    }
    const updateThreshold = () => {
      const node = flightChipsRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      chipsInitialBottomRef.current = rect.top + scrollY + rect.height;
    };
    // Initialize threshold
    updateThreshold();
    const handleScroll = () => {
      if (!chipsInitialBottomRef.current) return;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      // Collapse once user has scrolled 100px past the initial bottom of chips
      setIsChipsCollapsed(scrollY > chipsInitialBottomRef.current + 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateThreshold);
    // Run once
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateThreshold);
    };
  }, [isCreatingThemes]);

  // NEW: Handle back to route creation
  const handleBackToRouteCreation = () => {
    setIsCreatingThemes(false);
    setActiveFlightIndex(null);
    if (typeof onFilterChipSelect === 'function') {
      onFilterChipSelect(false);
    }
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
  // Track whether we've pushed a history state for flights view
  const hasPushedFlightsViewHistoryRef = useRef(false);

  const SEGMENT_ITEM_TYPE = 'FLIGHT_SEGMENT';

  const moveSegment = (fromIndex, toIndex) => {
    setFlightSegments(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
    setActiveFlightIndex(idx => {
      if (idx === fromIndex) return toIndex;
      if (fromIndex < idx && idx <= toIndex) return idx - 1;
      if (toIndex <= idx && idx < fromIndex) return idx + 1;
      return idx;
    });
  };

  // Update flight segments and selected themes only when entering theme creation mode for the first time
  useEffect(() => {
    if (isCreatingThemes && !hasInitializedThemes.current && Object.keys(selectedThemes).length === 0) {
      const segments = generateFlightSegments();
      setFlightSegments(segments);
      // Initialize selected themes
      const initialThemes = {};
      segments.forEach(segment => {
        // Skip if segment data is incomplete
        if (!segment?.destination?.airport?.city) return;
        
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

  // Browser back: when in flights view, pressing back exits to dashboard (keeps routes/state)
  useEffect(() => {
    if (!isCreatingThemes) return;
    // Push a history entry only once per entry into flights view
    if (!hasPushedFlightsViewHistoryRef.current) {
      try {
        window.history.pushState({ flightsView: true }, '');
        hasPushedFlightsViewHistoryRef.current = true;
      } catch {}
    }
    const handlePop = () => {
      setIsCreatingThemes(false);
      hasPushedFlightsViewHistoryRef.current = false;
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [isCreatingThemes]);

  // Keep flight segments in sync with routes while in flights-for-view
  useEffect(() => {
    if (!isCreatingThemes) return;
    const segments = generateFlightSegments();
    setFlightSegments(segments);

    // Remap selected themes to new segment ids by index; default to 0 if new
    setSelectedThemes(prev => {
      const remapped = {};
      segments.forEach((seg, i) => {
        const key = `flight-${i + 1}`; // stable per index
        remapped[seg.id] = prev[key] ?? prev[seg.id] ?? 0;
      });
      return remapped;
    });

    // Clamp active flight index
    setActiveFlightIndex(prevIdx => {
      if (segments.length === 0) return null;
      if (prevIdx == null) return 0;
      return Math.min(prevIdx, segments.length - 1);
    });
  }, [routes, isCreatingThemes]);

  // Calculate timeline height for color cards
  useEffect(() => {
    const calculateTimelineHeight = () => {
      if (colorCardsRef.current && flightSegments.length > 1) {
        const colorCardsRect = colorCardsRef.current.getBoundingClientRect();
        const containerHeight = colorCardsRect.height;
        // Subtract 24px (dot height) so the line ends at the center of the last dot
        const calculatedHeight = Math.max(containerHeight - 40 - 24, 36); // Minimum 36px height
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

  // Calculate timeline line position and height based on first title and last card bottom
  useEffect(() => {
    if (
      isCreatingThemes &&
      flightSegments.length > 1 &&
      firstTitleRef.current &&
      lastCardBottomRef.current &&
      colorCardsRef.current
    ) {
      const containerRect = colorCardsRef.current.getBoundingClientRect();
      const firstTitleRect = firstTitleRef.current.getBoundingClientRect();
      const lastBottomRect = lastCardBottomRef.current.getBoundingClientRect();
      const top = firstTitleRect.top - containerRect.top;
      const height = lastBottomRect.bottom - containerRect.top - top;
      setTimelineLine({ top, height });
    }
  }, [isCreatingThemes, flightSegments.length, selectedThemes, isMinimized]); // <-- add isMinimized

  function FlightChip({ segment, index, activeFlightIndex, selectedThemeId, onSelect, collapsed }) {
    const ref = useRef(null);
    const [{ handlerId }, drop] = useDrop({
      accept: SEGMENT_ITEM_TYPE,
      collect: monitor => ({ handlerId: monitor.getHandlerId() }),
      hover(item, monitor) {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;
        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;
        moveSegment(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    });

    const [{ isDragging }, drag] = useDrag({
      type: SEGMENT_ITEM_TYPE,
      item: () => ({ id: segment.id, index }),
      collect: monitor => ({ isDragging: monitor.isDragging() })
    });

    const destinationCity = segment?.destination?.airport?.city;
    const possibleFestival = getFestivalForCityAndDate(destinationCity, dates);
    const themeOptions = [
      { id: 0, name: 'Default', color: '#1E1E1E' },
      { id: 1, name: `${segment.destination.airport.city} Theme`, color: '#EF4444' },
      ...(possibleFestival ? [{ id: 2, name: possibleFestival.name, color: possibleFestival.color || '#10B981' }] : []),
      { id: 3, name: 'Time of the Day', color: '#F59E0B' }
    ];
    const selectedTheme = themeOptions.find(t => t.id === selectedThemeId);
    const dotColor = selectedTheme ? selectedTheme.color : '#1E1E1E';

    drag(drop(ref));

    return (
      <div
        ref={ref}
        data-handler-id={handlerId}
        className={`backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] p-4 rounded-full shadow-sm transition-all cursor-move w-full ${
          activeFlightIndex === index 
            ? 'shadow-lg ring-2 ring-white/50' 
            : 'hover:shadow-md'
        }`}
        style={{ opacity: isDragging ? 0.5 : 1, minWidth: 0 }}
        onClick={() => {
          onSelect(index, segment);
          try {
            if (typeof onExposeThemeChips === 'function') {
              const chips = themeOptions.map(t => ({ label: t.name, color: t.color }));
              onExposeThemeChips(chips);
            }
          } catch {}
        }}
      >
        <div className={`flex justify-between items-start ${activeFlightIndex === index ? 'opacity-100' : 'opacity-70'}`}>
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: dotColor }}
                >
                  {index + 1}
                </div>
                {!collapsed && (
                  <h3 className="text-base font-semibold text-white break-words">
                    {segment.origin.airport.city} → {segment.destination.airport.city}
                  </h3>
                )}
              </div>
              {!collapsed && (
                <div className="text-xs text-white mt-1 flex items-center gap-3 flex-wrap break-words pl-8">
                  <span className="flex items-center gap-1 font-semibold">Flight {index + 1}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Color Card Component
  const ColorCard = ({ segment, index, activeFlightIndex, setActiveFlightIndex }) => {
    const active = index === activeFlightIndex;
    const [showColorPickerFor, setShowColorPickerFor] = useState(null); // theme.id or null
    const [customColors, setCustomColors] = useState({}); // { [themeId]: color }
    const colorSwatchRefs = useRef({});
    const [pickerPosition, setPickerPosition] = useState({}); // { [themeId]: {top, left, right, bottom} }
    const containerNode = containerRef.current;

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
    const destinationCity = segment?.destination?.airport?.city || 'Unknown';
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
    const handleThemeSelection = (flightId, themeIndex, color) => {
      setSelectedThemes(prev => {
        const updated = { ...prev, [flightId]: themeIndex };
        // If this is the active card, call onThemeColorChange with the selected color
        if (active && typeof onThemeColorChange === 'function') {
          const selectedTheme = themeOptions.find(t => t.id === themeIndex);
          if (selectedTheme) {
            onThemeColorChange(color || customColors[themeIndex] || selectedTheme.color);
          }
        }
        return updated;
      });
    };

    return (
      <div
        className="relative flex flex-col gap-y-3"
        onClick={() => {
          setActiveFlightIndex(index);
          if (typeof onColorCardSelect === 'function') {
            onColorCardSelect(segment);
          }
          // Notify about filter chip selection
          if (typeof onFilterChipSelect === 'function') {
            onFilterChipSelect(true);
          }
          // Also update theme color in parent when card is selected
          if (typeof onThemeColorChange === 'function') {
            const selectedThemeId = selectedThemes[segment.id];
            const selectedTheme = themeOptions.find(t => t.id === selectedThemeId);
            onThemeColorChange(selectedTheme ? selectedTheme.color : '#1E1E1E');
          }
          // Also expose chips for this segment to the dashboard for PB
          try {
            if (typeof onExposeThemeChips === 'function') {
              const chips = themeOptions.map(t => ({ label: t.name, color: t.color }));
              onExposeThemeChips(chips);
            }
          } catch {}
        }}
        style={{ cursor: 'pointer' }}
      >
        {/* Color Card Content */}
        <div className="w-full">
          <div className="p-3 rounded-lg border shadow-sm transition-all w-full bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">

            {/* Conditional rendering based on active state */}
            {active ? (
              // Active: show theme selection
              <div className="space-y-2 relative">
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
                      onClick={e => {
                        e.stopPropagation();
                        setShowColorPickerFor(theme.id === showColorPickerFor ? null : theme.id);
                        handleThemeSelection(segment.id, theme.id, customColors[theme.id]);
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedThemes[segment.id] === theme.id}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') handleThemeSelection(segment.id, theme.id, customColors[theme.id]);
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-md border"
                        style={{
                          backgroundColor: customColors[theme.id] || theme.color,
                          borderColor: '#888',
                          boxShadow: 'none',
                          transition: 'box-shadow 0.15s, border-color 0.15s',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          // Calculate position for color picker
                          const swatchNode = colorSwatchRefs.current[theme.id];
                          if (swatchNode && containerNode) {
                            const swatchRect = swatchNode.getBoundingClientRect();
                            const containerRect = containerNode.getBoundingClientRect();
                            // Color picker size: 180x180px (react-colorful default)
                            const pickerWidth = 180, pickerHeight = 180;
                            let top = swatchRect.bottom - containerRect.top + 8; // default below
                            let left = swatchRect.left - containerRect.left;
                            // If not enough space below, show above
                            if (top + pickerHeight > containerRect.height) {
                              top = swatchRect.top - containerRect.top - pickerHeight - 8;
                            }
                            // Clamp left to fit in container
                            if (left + pickerWidth > containerRect.width) {
                              left = containerRect.width - pickerWidth - 8;
                            }
                            if (left < 0) left = 8;
                            setPickerPosition(pos => ({ ...pos, [theme.id]: { top, left } }));
                          }
                          setShowColorPickerFor(theme.id === showColorPickerFor ? null : theme.id);
                        }}
                        ref={el => (colorSwatchRefs.current[theme.id] = el)}
                      />
                      <div className="flex flex-col min-w-0">
                        <span
                          className={["text-sm text-gray-900 truncate", selectedThemes[segment.id] === theme.id ? "font-semibold" : ""].join(" ")}
                          style={{ maxWidth: 140 }}
                        >
                          {theme.name}
                        </span>
                      </div>
                      {/* Color Picker for custom color (for any theme) */}
                      {/* Color Picker temporarily disabled */}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Inactive: show summary of selected theme
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Theme:</span>
                <span className="text-sm font-medium">
                  {themeOptions.find(t => t.id === selectedThemes[segment.id])?.name || 'Default'}
                </span>
              </div>
            )}

            
            {/* Last card bottom ref for timeline */}
            {index === flightSegments.length - 1 && <div ref={lastCardBottomRef} style={{ height: 0 }} />}
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
  // Inject no-select CSS if not present
  if (typeof document !== 'undefined' && !document.getElementById('no-select-style')) {
    const style = document.createElement('style');
    style.id = 'no-select-style';
    style.innerHTML = `
      .no-select {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <div 
      ref={containerRef}
      className={`p-10 border border-gray-200 ${isCreatingThemes ? 'sticky top-0 z-40' : ''}`}
      style={{
        width: '100%',
        minWidth: '100%',
        maxWidth: '100%',
        height: isCreatingThemes ? '300px' : (routes.length === 0 ? '240px' : '380px'),
        minHeight: isCreatingThemes ? '300px' : (routes.length === 0 ? '240px' : '380px'),
        maxHeight: 'none',
        transition: 'width 0.2s, height 0.2s',
        paddingLeft: '170px',
        paddingRight: '170px',
        paddingBottom: isCreatingThemes ? '8px' : undefined,
        backgroundColor: DEFAULT_THEME_COLOR,
        borderRadius: undefined,
        marginTop: isInHeader ? '0' : '0px',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >

      {/* Collapse/expand icon removed */}

      {/* Logo above flights view */}
      {isCreatingThemes && !isMinimized && (
        <div className="mb-4">
          <span
            className="text-2xl font-bold themer-gradient cursor-pointer"
            title="Go to landing page"
            onClick={() => navigate('/')}
          >
            Themer
          </span>
        </div>
      )}

      {/* Header - Changes based on state */}
      <div className={`flex flex-col items-start select-none w-full ${isMinimized && containerWidth === minWidth ? 'h-full justify-center mb-0' : 'mb-4'}`}>
        <div style={{ width: isMinimized ? '100%' : 480, maxWidth: '100%' }} className="flex flex-row items-center w-full justify-between">
          {/* Collapsed + min width: show route creator or create route */}
          {isMinimized && containerWidth === minWidth ? (
            <div 
              className={`flex items-center w-full ${routes.length === 0 ? 'justify-center cursor-pointer' : 'justify-between'}`}
                             onClick={routes.length === 0 ? (e) => {
                 e.stopPropagation();
                 if (onExpand) {
                   onExpand();
                 } else {
                   setIsMinimized(false);
                   setContainerWidth(480);
                 }
               } : undefined}
            >
              <span className="text-lg font-semibold text-gray-700">
                {routes.length === 0 ? 'Create route' : 'Route creator'}
              </span>
              {routes.length > 0 && (
                <div></div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Header removed (back navigation and title) */}
              <div></div>
            </div>
          )}
        </div>
        
        {/* Filter Chips Row - Full Width */}
        {isCreatingThemes && !isMinimized && (
              <div ref={flightChipsRef} className="w-full mt-3">
                <DndProvider backend={HTML5Backend}>
                  <div className="flex items-stretch gap-12 w-full">
                {flightSegments.map((segment, index) => {
                // Safety checks for segment data
                if (!segment || !segment.origin || !segment.destination || !segment.origin.airport || !segment.destination.airport) {
                  return null;
                }
                  const selectedThemeId = selectedThemes[segment.id];
                  return (
                    <div key={segment.id} className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <FlightChip
                          segment={segment}
                          index={index}
                          activeFlightIndex={activeFlightIndex}
                          selectedThemeId={selectedThemeId}
                          collapsed={isChipsCollapsed}
                          onSelect={(idx, seg) => {
                            setActiveFlightIndex(idx);
                            if (typeof onColorCardSelect === 'function') onColorCardSelect(seg);
                            if (typeof onFilterChipSelect === 'function') onFilterChipSelect(true);
                            // Enter prompt mode immediately when a flight chip is selected
                            try {
                              if (typeof onStartThemeBuild === 'function') onStartThemeBuild(true);
                              if (typeof onEnterPromptMode === 'function') onEnterPromptMode(seg?.id);
                            } catch {}
                          }}
                        />
                      </div>
                      {index < flightSegments.length - 1 && (
                        <div className="flex items-center justify-center flex-shrink-0 px-2 py-8">
                          <span className="text-white text-lg font-bold opacity-60" style={{ fontSize: '18px', fontWeight: '300' }}>→</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </DndProvider>
          </div>
        )}
      </div>

      {/* Content - Changes based on state */}
      {!isMinimized && (isCreatingThemes ? (
        // Theme Creation Content
        <>
          {/* Date Picker Dropdown for Flights of view */}
          <div className="relative" ref={datePickerRef} style={{ width: 320 }}>
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
          {/* Color Card removed: theme selection happens via prompt bubble now */}

          {/* Build theme button removed: prompt mode starts when a chip is selected */}
        </>
      ) : (
        // Route Creation Content
        <>
          {/* Date Picker Dropdown removed; now handled in AirportSearch */}

          {/* Brand logo above Add Route input (visible on dashboard inside theme container) */}
          {!isMinimized && dates.length > 0 && (
            <div className="mt-2 mb-6">
              <span
                className="text-2xl font-bold themer-gradient cursor-pointer"
                title="Go to landing page"
                onClick={() => navigate('/')}
              >
                Themer
              </span>
            </div>
          )}

          {/* Add Route Label and Input */}
          {dates.length > 0 && (
            <div className="mt-2 relative w-full">
              <AirportSearch
                routes={routes}
                setRoutes={handleRoutesUpdate}
                usedAirports={routes.map(r => r.airport.code)}
                selectedRegion={selectedRegion}
                selectedDates={dates}
                onSelectedDatesChange={(newDates) => setDates(newDates)}
                onRemoveRoute={(index) => {
                  const newRoutes = [...routes];
                  newRoutes.splice(index, 1);
                  handleRoutesUpdate(newRoutes);
                }}
                defaultLabel="Default Theme"
                isMinimized={isMinimized}
                onToggleMinimized={() => {
                  setIsMinimized(!isMinimized);
                  if (!isMinimized) {
                    // When collapsing, close any open dropdowns and reset input
                    setIsDatePickerOpen(false);
                    setInputValue('');
                    setIsTyping(false);
                    setContainerWidth(minWidth);
                  } else {
                    // When expanding, restore to full width
                    setContainerWidth(480);
                  }
                }}
              />
            </div>
          )}

          {/* Action Buttons moved next to date input (inside AirportSearch) */}
        </>
      ))}
    </div>
  );
} 