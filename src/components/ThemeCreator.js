import { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import AirportSearch from './AirportSearch';
import DatePicker from './DatePicker';
import festivalsData from '../data/festivals.json';
import { HexColorPicker } from 'react-colorful';

export default function ThemeCreator({ routes, setRoutes, initialMinimized, onFlightCardSelect, onThemeColorChange, initialWidth }) {
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
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Initial position
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // NEW: Theme creation state
  const [isCreatingThemes, setIsCreatingThemes] = useState(false);
  
  // Minimize/maximize state
  const [isMinimized, setIsMinimized] = useState(initialMinimized || false);

  // Refs
  const datePickerRef = useRef(null);
  const containerRef = useRef(null);
  const flightCardsRef = useRef(null);

  // NEW: Badge hover state
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);

  // Add after isMinimized state
  const IFE_FRAME_WIDTH = 1400;
  const [containerWidth, setContainerWidth] = useState(initialWidth || 480); // px
  const minWidth = 318;
  const maxWidth = 480;
  const [isResizing, setIsResizing] = useState(false);
  const [resizeSide, setResizeSide] = useState(null); // 'left' | 'right' | null

  // Refs for first card title and last card bottom
  const firstTitleRef = useRef(null);
  const lastCardBottomRef = useRef(null);
  const [timelineLine, setTimelineLine] = useState({ top: 0, height: 0 });

  // Active flight card state
  const [activeFlightIndex, setActiveFlightIndex] = useState(null);

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
      flightCardsRef.current
    ) {
      const containerRect = flightCardsRef.current.getBoundingClientRect();
      const firstTitleRect = firstTitleRef.current.getBoundingClientRect();
      const lastBottomRect = lastCardBottomRef.current.getBoundingClientRect();
      const top = firstTitleRect.top - containerRect.top;
      const height = lastBottomRect.bottom - containerRect.top - top;
      setTimelineLine({ top, height });
    }
  }, [isCreatingThemes, flightSegments.length, selectedThemes, isMinimized]); // <-- add isMinimized

  // Flight Card Component
  const FlightCard = ({ segment, index, activeFlightIndex, setActiveFlightIndex }) => {
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
        className="relative w-full mb-4 flex items-center max-w-full gap-x-3"
        onClick={() => {
          setActiveFlightIndex(index);
          if (typeof onFlightCardSelect === 'function') {
            onFlightCardSelect(segment);
          }
          // Also update theme color in parent when card is selected
          if (typeof onThemeColorChange === 'function') {
            const selectedThemeId = selectedThemes[segment.id];
            const selectedTheme = themeOptions.find(t => t.id === selectedThemeId);
            onThemeColorChange(selectedTheme ? selectedTheme.color : '#1E1E1E');
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        {/* Flight number dot */}
        <div
          className="flex-shrink-0 flex justify-center items-center"
          style={{ width: '48px', position: 'relative', zIndex: 2 }}
        >
          <div 
            className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold relative z-10"
            style={{ backgroundColor: (() => {
              const selectedThemeId = selectedThemes[segment.id];
              const selectedTheme = themeOptions.find(t => t.id === selectedThemeId);
              return selectedTheme ? selectedTheme.color : '#1E1E1E';
            })() }}
          >
            {segment.flightNumber}
          </div>
        </div>
        {/* Flight Card Content */}
        <div className="flex-1 min-w-0 max-w-full">
          <div className="p-3 rounded-lg border shadow-sm transition-all w-full bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
            <div className="mb-3">
              <div className="min-w-0">
                <div
                  className="text-base text-gray-900 flex items-center gap-2 flex-wrap"
                  ref={index === 0 ? firstTitleRef : undefined}
                >
                  <span className="font-medium">{segment.origin.airport.city} ({segment.origin.airport.code})</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">{segment.destination.airport.city} ({segment.destination.airport.code})</span>
                </div>
              </div>
            </div>
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
    if (!isResizing || !resizeSide) {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('no-select');
      }
      return;
    }
    if (typeof document !== 'undefined') {
      document.body.classList.add('no-select');
    }
    const handleMouseMove = (e) => {
      if (resizeSide === 'right') {
        // Only allow horizontal resizing from right
        const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - position.x));
        setContainerWidth(newWidth);
      } else if (resizeSide === 'left') {
        // Calculate new width and new left position
        const container = containerRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        let newX = e.clientX;
        let newWidth = containerRect.right - newX;
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        // Clamp newX so the container doesn't go out of bounds
        const maxX = containerRect.right - minWidth;
        const minX = containerRect.right - maxWidth;
        newX = Math.max(minX, Math.min(maxX, newX));
        setContainerWidth(newWidth);
        setPosition(pos => ({ ...pos, x: newX }));
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeSide(null);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('no-select');
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('no-select');
      }
    };
  }, [isResizing, resizeSide, position.x]);

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
      className={`bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-lg ${isMinimized ? 'min-h-0 themer-animated-border' : ''}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
        width: isMinimized ? `${containerWidth}px` : `${IFE_FRAME_WIDTH}px`,
        minWidth: isMinimized ? `${minWidth}px` : `${IFE_FRAME_WIDTH}px`,
        maxWidth: isMinimized ? `${maxWidth}px` : `${IFE_FRAME_WIDTH}px`,
        height: '300px',
        maxHeight: '300px',
        transition: isResizing ? 'none' : 'width 0.2s',
        padding: isMinimized && containerWidth === minWidth ? '8px 20px' : undefined,
        backgroundColor: isMinimized ? 'white' : undefined, // Solid white fill when minimized
        borderRadius: isMinimized ? '100px' : undefined, // 100px radius when minimized
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Left/Right Resizer handles (only show if minimized) */}
      {isMinimized && <>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '8px',
            cursor: 'ew-resize',
            zIndex: 1100,
          }}
          onMouseDown={e => {
            e.stopPropagation();
            setIsResizing(true);
            setResizeSide('left');
          }}
          title="Resize from left"
        />
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
            setResizeSide('right');
          }}
          title="Resize from right"
        />
      </>}
      {/* Header - Changes based on state */}
      <div className="mb-4 flex flex-col items-start select-none w-full">
        <div style={{ width: isMinimized ? '100%' : 480, maxWidth: '100%' }} className="flex flex-row items-center w-full justify-between">
          {/* Collapsed + min width: show only 'edit for', date, chevron */}
          {isMinimized && containerWidth === minWidth ? (
            <div className="flex items-center gap-2 w-full">
              <h3 className="text-lg font-semibold text-gray-900">{isCreatingThemes ? 'Flights of' : ''}</h3>
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
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {isCreatingThemes ? (
                  // Themes Creation Header
                  <>
                    <button
                      onClick={handleBackToRouteCreation}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">Flights of</h3>
                      {/* Date picker button removed as requested */}
                    </div>
                  </>
                ) : (
                  // Route Creation Header
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
                )}
              </div>
              <button
                className="p-1 rounded-full hover:bg-gray-100 transition-colors ml-auto"
                onClick={e => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                  if (!isMinimized) {
                    setIsDatePickerOpen(false);
                    setInputValue('');
                    setIsTyping(false);
                    setContainerWidth(minWidth); // Always set to minWidth (318px) when minimizing
                  }
                }}
                title={isMinimized ? "Expand" : "Collapse"}
              >
                {isMinimized ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content - Changes based on state */}
      {!isMinimized && (isCreatingThemes ? (
        // Theme Creation Content
        <>
          {/* Date Picker Dropdown for Flights of view */}
          <div className="relative" ref={datePickerRef} style={{ width: 480 }}>
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
          {/* Flight Cards */}
          <div ref={flightCardsRef} className="space-y-4 relative z-10" style={{ width: '100%' }}>
            {flightSegments.map((segment, index) => (
              <FlightCard 
                key={segment.id} 
                segment={segment} 
                index={index}
                activeFlightIndex={activeFlightIndex}
                setActiveFlightIndex={setActiveFlightIndex}
              />
            ))}
          </div>

          {/* Create Theme Button below flight cards */}
          <div className="mt-8 flex flex-row justify-end" style={{ width: 480, marginLeft: 'auto' }}>
            <button
              className="px-4 py-2 rounded-md bg-black text-white text-base font-semibold hover:bg-gray-800 transition-colors shadow"
              onClick={handleCreateTheme}
            >
              Create Theme
            </button>
          </div>
        </>
      ) : (
        // Route Creation Content
        <>
          {/* Date Picker Dropdown removed; now handled in AirportSearch */}

          {/* Add Route Label and Input */}
          {dates.length > 0 && (
            <div className="mt-4 relative" style={{ width: isMinimized ? 480 : '100%' }}>
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
                defaultLabel="Default Theme"
                isMinimized={isMinimized} // <-- pass isMinimized
              />
            </div>
          )}

          {/* Create Themes Button */}
          {routes.length > 0 && (
            <div className="mt-8 flex flex-row gap-3 justify-end" style={{ width: 480, marginLeft: 'auto' }}>
              <button
                className="flex-1 px-4 py-2 rounded-md transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                onClick={() => {
                  // Handle add new route logic here
                  console.log('Adding new route...');
                }}
              >
                Add new route
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-md transition-colors
                  ${routes.length >= 2 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                disabled={routes.length < 2}
                onClick={handleCreateFlightThemes}
              >
                Generate flight plan
              </button>
            </div>
          )}
        </>
      ))}
    </div>
  );
} 