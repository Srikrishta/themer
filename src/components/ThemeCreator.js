import React, { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, PencilIcon, Cog6ToothIcon, SquaresPlusIcon, ArrowsUpDownIcon, TrashIcon, PhotoIcon, PaperAirplaneIcon, PlayIcon, CheckIcon } from '@heroicons/react/24/outline';
import AirportSearch from './AirportSearch';
import DatePicker from './DatePicker';
import festivalsData from '../data/festivals.json';
import { HexColorPicker } from 'react-colorful';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { getReadableOnColor } from '../utils/color';

export default function ThemeCreator({ routes, setRoutes, initialMinimized, onColorCardSelect, onThemeColorChange, initialWidth, onExpand, onStateChange, initialFlightCreationMode, onEnterPromptMode, isPromptMode, activeSegmentId, onFilterChipSelect, isInHeader, onExposeThemeChips, onStartThemeBuild, themeColor = '#1E1E1E', onTriggerPromptBubble, selectedLogo, onThemeAnimationComplete, onGeneratingStateChange, onBuildThemes }) {
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
  const [revealFlightsCount, setRevealFlightsCount] = useState(0);
  
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
  // Sticky chips only after user scrolls
  const chipsInitialTopRef = useRef(null);
  const [isChipsSticky, setIsChipsSticky] = useState(false);
  const lastScrollYRef = useRef(0);
  // Auto-enter prompt mode on first chip after generating flights
  const autoPromptOnFirstChipRef = useRef(false);

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
    // Mark that when chips render we should select first and enter prompt mode
    autoPromptOnFirstChipRef.current = true;
    // Smooth scroll to flight chips (and build theme button)
    // Scrolling handled centrally in Dashboard when flights view starts
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
        // Auto-select first chip and enter prompt mode
        setActiveFlightIndex(0);
        if (typeof onColorCardSelect === 'function') onColorCardSelect(currentSeg);
        if (typeof onFilterChipSelect === 'function') onFilterChipSelect(true);
        if (typeof onEnterPromptMode === 'function') onEnterPromptMode(currentSeg?.id);
      }
    } catch {}
  };

  // Listen for AirportSearch generate flights
  useEffect(() => {
    const handler = () => {
      // Reserved: generation event observed
    };
    window.addEventListener('airport-search-generate-flights', handler);
    return () => window.removeEventListener('airport-search-generate-flights', handler);
  }, [routes.length]);

  // Listen for Show Preview to navigate to flights view
  useEffect(() => {
    const goPreview = () => {
      try {
        setIsCreatingThemes(true);
        setHasStartedThemeBuild(true);
        if (typeof onStartThemeBuild === 'function') onStartThemeBuild(true);
        // Scroll behavior is already handled elsewhere
      } catch {}
    };
    window.addEventListener('airport-search-show-preview', goPreview);
    return () => window.removeEventListener('airport-search-show-preview', goPreview);
  }, []);

  // Collapse flight chips to compact (dots) view when scrolled past the chips
  useEffect(() => {
    if (!isCreatingThemes) {
      setIsChipsCollapsed(false);
      setIsChipsSticky(false);
      return;
    }
    const updateThreshold = () => {
      const node = flightChipsRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      chipsInitialBottomRef.current = rect.top + scrollY + rect.height;
      chipsInitialTopRef.current = rect.top + scrollY;
    };
    // Initialize threshold
    updateThreshold();
    const handleScroll = () => {
      if (!chipsInitialBottomRef.current) return;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const lastY = lastScrollYRef.current || 0;
      const isScrollingUp = scrollY < lastY;
      lastScrollYRef.current = scrollY;
      // Collapse once user has scrolled 100px past the initial bottom of chips
      setIsChipsCollapsed(scrollY > chipsInitialBottomRef.current + 100);
      // Become sticky once the top of chips reaches the top of the viewport
      if (typeof chipsInitialTopRef.current === 'number') {
        if (isScrollingUp) {
          // On upward scroll, exit sticky to reveal entire TC
          setIsChipsSticky(false);
        } else {
          setIsChipsSticky(scrollY >= Math.max(0, chipsInitialTopRef.current - 8));
        }
      }
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

  // Keep flight segments in sync with routes while in flights-for-view or reveal state
  useEffect(() => {
    if (!isCreatingThemes && !(revealFlightsCount > 0)) return;
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
  }, [routes, isCreatingThemes, revealFlightsCount]);

  // Ensure we select the first chip and enter prompt mode after Generate flights
  useEffect(() => {
    if (!isCreatingThemes) return;
    if (!autoPromptOnFirstChipRef.current) return;
    if (!flightSegments || flightSegments.length === 0) return;
    const firstSeg = flightSegments[0];
    setActiveFlightIndex(0);
    try {
      if (typeof onColorCardSelect === 'function') onColorCardSelect(firstSeg);
      if (typeof onFilterChipSelect === 'function') onFilterChipSelect(true);
      if (typeof onEnterPromptMode === 'function') onEnterPromptMode(firstSeg?.id);
      if (typeof onStartThemeBuild === 'function') onStartThemeBuild(true);
    } catch {}
    autoPromptOnFirstChipRef.current = false;
  }, [isCreatingThemes, flightSegments]);

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

  function FlightCard({ segment, index, activeFlightIndex, selectedThemeId, onSelect, collapsed, selectedLogo, themeColor }) {
    const ref = useRef(null);
    const [selectedActionId, setSelectedActionId] = useState(null);

    // Keep Add theme button selected when it should be expanded
    useEffect(() => {
      if (selectedActionId === 1) {
        console.log('Add theme button selected, maintaining expanded state');
      }
    }, [selectedActionId]);
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
    const dotOnColor = getReadableOnColor(dotColor);

    drag(drop(ref));

    return (
      <div
        ref={ref}
        data-handler-id={handlerId}
        className={`backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] pl-5 pr-3 py-4 rounded-full shadow-sm transition-all cursor-move w-full ${
          activeFlightIndex === index 
            ? 'shadow-lg ring-2 ring-blue-500/60 bg-blue-600/10' 
            : 'hover:shadow-md hover:bg-blue-600/5'
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
        <div className={`flex justify-between items-stretch ${activeFlightIndex === index ? 'opacity-100' : 'opacity-70'}`}>
          <div className="flex items-start gap-1 flex-none pr-0" style={{ paddingRight: 6 }}>
            <div className="flex-none">
              <div className="flex items-center gap-2">
                {!collapsed && (
                  <h3 className="text-base font-semibold text-white break-words">
                    {segment.origin.airport.code} → {segment.destination.airport.code}
                  </h3>
                )}
              </div>
              {!collapsed && (
                <div className="text-xs text-white mt-1 flex items-center gap-3 flex-wrap break-words">
                  <span className="flex items-center gap-1 font-semibold">Flight {index + 1}</span>
                </div>
              )}
            </div>
          </div>
          {activeFlightIndex === index && isInHeader && (
            <>
              <div className="hidden md:flex w-px mx-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div className="hidden md:flex items-center gap-1" style={{ marginLeft: 5 }}>
                {[
                  { 
                    id: 0, 
                    label: selectedLogo ? 'Logo added' : 'Add logo', 
                    title: selectedLogo ? 'Logo added' : 'Add logo', 
                    icon: selectedLogo ? CheckIcon : PhotoIcon,
                    isLogoAdded: !!selectedLogo
                  },
                  { id: 1, label: 'Change theme', title: 'Change theme', icon: null, variant: 'primary', isThemerDot: true, themeColor: themeColor },
                  { id: 2, label: 'Modify flight phase', title: 'Modify flight phase', icon: null, isFlightIcon: true }
                ].map(({ id, label, title, icon: Icon, variant, isThemerDot, isFlightIcon, isLogoAdded, themeColor: buttonThemeColor }) => {
                  const isSelected = selectedActionId === id;
                  // Special handling for Add theme button to ensure it shows text when selected
                  const shouldShowText = isSelected && (id === 1 || id !== 1);
                  const isAddThemeButton = id === 1;
                  
                  // For the Change theme button, use the theme color if available
                  const baseColor = (() => {
                    if (isSelected) {
                      return 'bg-blue-600 text-white hover:bg-blue-700';
                    }
                    if (isLogoAdded) {
                      return 'bg-green-600 text-white hover:bg-green-700';
                    }
                    if (id === 1 && buttonThemeColor) {
                      // Use the theme color for the Change theme button
                      return 'text-white hover:opacity-80';
                    }
                    return 'bg-white/10 text-white hover:bg-white/15';
                  })();
                  
                  const layout = (isSelected || isLogoAdded) ? 'h-9 px-3' : 'h-9 w-9 justify-center px-0';
                  // Force proper layout for Add theme button when selected
                  const isAddLogoButton = id === 0;
                  const isModifyFlightPhaseButton = id === 2;
                  const finalLayout = ((isAddThemeButton || isAddLogoButton || isModifyFlightPhaseButton) && (isSelected || isLogoAdded)) ? 'h-9 px-3' : layout;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`inline-flex items-center rounded-[24px] transition-colors ${baseColor} ${finalLayout} shrink-0`}
                      style={{
                        ...(isSelected ? { borderTopLeftRadius: '0px' } : {}),
                        ...(id === 1 && buttonThemeColor ? { backgroundColor: buttonThemeColor } : {})
                      }}
                      title={title}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        console.log('Button clicked - setting selectedActionId to:', id, 'for label:', label);
                        setSelectedActionId(id); 
                        
                        // Delay onSelect for Add theme, Add logo, and Modify flight phase buttons to prevent state reset
                        if (id !== 1 && id !== 0 && id !== 2) {
                          // For other buttons (not Add logo, Add theme, or Modify flight phase), call onSelect immediately
                          onSelect(index, segment);
                        } 
                        
                        // If this is the "Add theme" button (id: 1), trigger the prompt bubble
                        if (id === 1 && typeof onTriggerPromptBubble === 'function') {
                          // Delay triggering the prompt bubble to allow the button to expand first
                          setTimeout(() => {
                            // Position the prompt bubble right below the clicked button
                            const buttonRect = e.target.getBoundingClientRect();
                            const position = {
                              x: buttonRect.left + buttonRect.width / 2, // Center of the button horizontally
                              y: buttonRect.bottom + 20 // Below the button with proper spacing
                            };
                            // Enter prompt mode first, then trigger prompt bubble
                            if (typeof onEnterPromptMode === 'function') {
                              onEnterPromptMode(segment?.id);
                            }
                            onTriggerPromptBubble('flight-journey-bar', { themeColor: themeColor }, position);
                            // Call onSelect after the prompt bubble is triggered to avoid state reset
                            onSelect(index, segment);
                          }, 150); // Delay to allow button state update and expansion
                        }
                        
                        // If this is the "Add logo" button (id: 0), trigger the logo prompt bubble
                        if (id === 0 && typeof onTriggerPromptBubble === 'function') {
                          // Delay triggering the prompt bubble to allow the button to expand first
                          setTimeout(() => {
                            // Position the prompt bubble right below the clicked button
                            const buttonRect = e.target.getBoundingClientRect();
                            const position = {
                              x: buttonRect.left + buttonRect.width / 2, // Center of the button horizontally
                              y: buttonRect.bottom + 20 // Below the button with proper spacing
                            };
                            // Enter prompt mode first, then trigger prompt bubble
                            if (typeof onEnterPromptMode === 'function') {
                              onEnterPromptMode(segment?.id);
                            }
                            onTriggerPromptBubble('logo-placeholder', {}, position);
                            // Call onSelect after the prompt bubble is triggered to avoid state reset
                            onSelect(index, segment);
                          }, 150); // Delay to allow button state update and expansion
                        }
                        
                        // If this is the "Modify flight phase" button (id: 2), trigger the flight phase prompt bubble
                        if (id === 2 && typeof onTriggerPromptBubble === 'function') {
                          // Delay triggering the prompt bubble to allow the button to expand first
                          setTimeout(() => {
                            // Position the prompt bubble right below the clicked button
                            const buttonRect = e.target.getBoundingClientRect();
                            const position = {
                              x: buttonRect.left + buttonRect.width / 2, // Center of the button horizontally
                              y: buttonRect.bottom + 20 // Below the button with proper spacing
                            };
                            // Enter prompt mode first, then trigger prompt bubble
                            if (typeof onEnterPromptMode === 'function') {
                              onEnterPromptMode(segment?.id);
                            }
                            onTriggerPromptBubble('flight-phase-button', { progress: 0.5, minutesLeft: 2 }, position);
                            // Call onSelect after the prompt bubble is triggered to avoid state reset
                            onSelect(index, segment);
                          }, 150); // Delay to allow button state update and expansion
                        }
                      }}
                    >
                      {/* Show color circle for Change theme button when theme color is available */}
                      {id === 1 && buttonThemeColor && (
                        <div 
                          className="w-3 h-3 rounded-full border border-white/30 flex-shrink-0 mr-2"
                          style={{ backgroundColor: buttonThemeColor }}
                        />
                      )}
                      {(isSelected || (isAddThemeButton && selectedActionId === 1) || (isAddLogoButton && (selectedActionId === 0 || isLogoAdded)) || (isModifyFlightPhaseButton && selectedActionId === 2)) && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
                      {isThemerDot ? (
                        <div 
                          className={`w-4 h-4 rounded-full ${isSelected ? 'ml-2' : ''}`}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientSweep 3s ease-in-out infinite'
                          }}
                        />
                      ) : isFlightIcon ? (
                        <img 
                          src={process.env.PUBLIC_URL + '/flight icon.svg'} 
                          alt="Flight icon" 
                          className={`w-4 h-4 ${isSelected ? 'ml-2' : ''}`}
                        />
                      ) : (
                        <Icon className={`w-4 h-4 ${isSelected ? 'ml-2' : ''}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
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
      className={`px-10 py-3 border border-gray-200 ${isCreatingThemes && isChipsSticky ? 'sticky top-0 z-40' : ''}`}
      style={{
        width: '100%',
        minWidth: '100%',
        maxWidth: '100%',
        height: isInHeader ? 'auto' : '400px',
        minHeight: isInHeader ? undefined : '400px',
        maxHeight: isInHeader ? 'none' : '400px',
        transition: 'width 0.2s, height 0.2s',
        paddingLeft: '170px',
        paddingRight: '170px',
        paddingTop: isCreatingThemes ? '48px' : undefined,
        paddingBottom: isCreatingThemes ? '72px' : undefined,
        backgroundColor: DEFAULT_THEME_COLOR,
        borderRadius: undefined,
        marginTop: isInHeader ? '0' : '0px',
        overflow: isInHeader ? 'visible' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >

      {/* Collapse/expand icon removed */}

      {/* Flights view shows only the flight cards (no logo/header) */}

      {/* Only Flight Cards Row - Full Width */}
      {isCreatingThemes && !isMinimized && (
        <div ref={flightChipsRef} className="w-full" style={{ marginBottom: ((isCreatingThemes ? 48 : 0) + 8) }}>
          {/* Themer logo in flights view */}
          <div className="mt-2 mb-8" data-name="themer-logo">
            <span
              className="text-2xl font-bold themer-gradient cursor-pointer"
              title="Go to landing page"
              onClick={() => navigate('/')}
            >
              Themer
            </span>
          </div>
          <DndProvider backend={HTML5Backend}>
            <div className="flex items-stretch gap-6 w-full">
              {flightSegments.map((segment, index) => {
                // Safety checks for segment data
                if (!segment || !segment.origin || !segment.destination || !segment.origin.airport || !segment.destination.airport) {
                  return null;
                }
                const selectedThemeId = selectedThemes[segment.id];
                return (
                  <div
                    key={segment.id}
                    className={`flex items-center gap-6 min-w-0 ${
                      activeFlightIndex === index ? 'flex-[2]' : 'flex-1'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <FlightCard
                        segment={segment}
                        index={index}
                        activeFlightIndex={activeFlightIndex}
                        selectedThemeId={selectedThemeId}
                        collapsed={isChipsCollapsed}
                        selectedLogo={selectedLogo}
                        themeColor={themeColor}
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
                      <div className="flex items-center justify-center flex-shrink-0 px-1 py-6">
                        <span className="text-white text-lg font-bold opacity-60" style={{ fontSize: '18px', fontWeight: '300' }}>→</span>
                      </div>
                    )}
                    {index === flightSegments.length - 1 && (
                      <div className="flex items-center justify-center flex-shrink-0 px-1 py-6 invisible">
                        <span className="text-white text-lg font-bold" style={{ fontSize: '18px', fontWeight: '300' }}>→</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DndProvider>
        </div>
      )}

      {/* Content - Changes based on state */}
      {!isMinimized && (isCreatingThemes ? (
        // Theme Creation Content
        <>
          {/* Flights view: no extra UI below, chips above handle selection */}
        </>
      ) : (
        // Route Creation Content
        <>
          {/* Date Picker Dropdown removed; now handled in AirportSearch */}

          {/* Brand logo above Add Route input (visible on dashboard inside theme container) */}
          {!isMinimized && dates.length > 0 && (
            <div className="mb-6" style={{ marginTop: '50px' }} data-name="themer-logo">
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
                themeColor={themeColor}
                onEnterPromptMode={onEnterPromptMode}
                onTriggerPromptBubble={onTriggerPromptBubble}
                onGeneratingStateChange={(isGenerating) => {
                  if (onGeneratingStateChange) {
                    onGeneratingStateChange(isGenerating);
                  }
                }}
                onBuildThemes={() => {
                  if (onBuildThemes) {
                    onBuildThemes();
                  }
                }}
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