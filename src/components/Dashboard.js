import { useState, useRef, useEffect } from 'react';
import ThemeCreator from './ThemeCreator';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';
import PlusIconCursor from './PlusIconCursor';
import PromptBubble from './PromptBubble';
import { useLocation, useNavigate } from 'react-router-dom';

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
}

function FrameContent({ origin, destination, minutesLeft, landingIn, maxFlightMinutes, handleProgressChange, themeColor, routes, isPromptMode, onPromptHover, onPromptClick, fpsPrompts }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, width: 1302, margin: '92px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      <div className="fjb-fps-container" style={{ width: 1328, maxWidth: 1328, marginLeft: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: themeColor + '14', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, paddingTop: 80, paddingBottom: 40, marginTop: 4 }}>
        <div style={{ width: '100%', marginTop: -32, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <FlightJourneyBar origin={origin} destination={destination} minutesLeft={minutesLeft} themeColor={themeColor} />
          <FlightProgress 
            landingIn={landingIn} 
            maxFlightMinutes={maxFlightMinutes} 
            minutesLeft={minutesLeft} 
            onProgressChange={handleProgressChange} 
            themeColor={themeColor}
            isPromptMode={isPromptMode}
            onPromptHover={onPromptHover}
            onPromptClick={onPromptClick}
            fpsPrompts={fpsPrompts}
          />
        </div>
      </div>
      <Component3Cards 
        themeColor={themeColor} 
        routes={routes}
        isPromptMode={isPromptMode}
        onPromptHover={onPromptHover}
        onPromptClick={onPromptClick}
      />
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const minimizeThemeCreator = location.state?.minimizeThemeCreator;
  // Lifted state for routes
  const [routes, setRoutes] = useState([]);
  // NEW: State for selected segment (color card)
  const [selectedSegment, setSelectedSegment] = useState(null);
  // NEW: State for current theme color
  const [currentThemeColor, setCurrentThemeColor] = useState('#1E1E1E');
  
  // NEW: Prompt mode state
  const [isPromptMode, setIsPromptMode] = useState(false);
  const [activeSegmentId, setActiveSegmentId] = useState(null); // Track which segment is in prompt mode
  const [promptBubble, setPromptBubble] = useState(null); // { x, y, elementType, elementData }
  const [showPlusIcon, setShowPlusIcon] = useState(false);
  
  // Store submitted prompts by FPS position
  const [fpsPrompts, setFpsPrompts] = useState({}); // { [position]: text }
  
  // NEW: Track if any filter chip has been selected
  const [isFilterChipSelected, setIsFilterChipSelected] = useState(false);
  
  // Scroll state management
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isScrollCollapsed, setIsScrollCollapsed] = useState(false);
  // Track ThemeCreator state before scroll collapse
  const [preScrollThemeCreatorState, setPreScrollThemeCreatorState] = useState(null);
  const [preScrollFlightCreationState, setPreScrollFlightCreationState] = useState(false);

  // Use selected segment's origin/destination if set, else default to full route
  const origin = selectedSegment?.origin || (routes.length > 0 ? routes[0] : null);
  const destination = selectedSegment?.destination || (routes.length > 1 ? routes[routes.length - 1] : null);

  // Countdown state
  const maxFlightMinutes = 370; // 6h10m
  const [minutesLeft, setMinutesLeft] = useState(maxFlightMinutes);
  const timerRef = useRef();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setMinutesLeft(maxFlightMinutes);
  }, [maxFlightMinutes]);

  useEffect(() => {
    if (dragging) return; // Pause timer while dragging
    if (minutesLeft <= 0) return;
    timerRef.current = setTimeout(() => {
      setMinutesLeft((m) => (m > 0 ? m - 1 : 0));
    }, 60000);
    return () => clearTimeout(timerRef.current);
  }, [minutesLeft, dragging]);

  const landingIn = formatTime(minutesLeft);

  // Handle prompt mode interactions
  const handlePromptHover = (isHovering, elementType, elementData, position) => {
    // elementType: 'flight-icon' or 'promo-card'
    // elementData: contains specific data about the element
    // position: { x, y } cursor position
    if (isPromptMode && !promptBubble) { // Only show plus icon if no bubble is currently open
      setShowPlusIcon(isHovering);
      console.log('Prompt hover:', isHovering, elementType, elementData, position);
    }
  };

  const handlePromptClick = (elementType, elementData, position) => {
    if (isPromptMode) {
      // Generate unique key for FPS position
      const positionKey = elementType === 'flight-icon' 
        ? `fps-${Math.round(elementData.progress * 1000)}` // Use progress as unique identifier
        : `${elementType}-${elementData.cardIndex || 0}`;
      
      // Get existing text for this position
      const existingText = fpsPrompts[positionKey] || '';
      
      setPromptBubble({
        x: position.x,
        y: position.y,
        elementType,
        elementData,
        positionKey,
        existingText
      });
      setShowPlusIcon(false); // Hide plus icon when bubble appears
    }
  };

  const handleExitPromptMode = () => {
    setIsPromptMode(false);
    setActiveSegmentId(null);
    setPromptBubble(null);
    setShowPlusIcon(false);
  };

  const handlePromptBubbleClose = () => {
    setPromptBubble(null);
    setShowPlusIcon(false); // Ensure plus icon is hidden when bubble closes
  };

  const handlePromptBubbleSubmit = (promptText, elementType, elementData, positionKey) => {
    console.log('Prompt submitted:', promptText, 'for', elementType, elementData);
    
    // Store the submitted text for this position
    if (positionKey) {
      setFpsPrompts(prev => ({
        ...prev,
        [positionKey]: promptText
      }));
    }
    
    // TODO: Handle the actual prompt submission logic here
    setPromptBubble(null);
    // Optionally exit prompt mode after submission
    // handleExitPromptMode();
  };

  const handleFilterChipSelect = (isSelected) => {
    setIsFilterChipSelected(isSelected);
  };

  // Handle progress bar drag
  const handleProgressChange = (newMinutes) => {
    setDragging(true);
    setMinutesLeft(newMinutes);
  };
  useEffect(() => {
    if (!dragging) return;
    const handleUp = () => setDragging(false);
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, [dragging]);

  // Scroll detection
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      setScrollY(currentScrollY);
      setScrollDirection(direction);
      
      // Collapse when scrolling down past 150px, expand when scrolling up to near the top (20px)
      if (direction === 'down' && currentScrollY > 150 && !isScrollCollapsed) {
        // The state has already been captured by onStateChange callback
        // Now collapse to header
        setIsScrollCollapsed(true);
      } else if (direction === 'up' && currentScrollY <= 20 && isScrollCollapsed) {
        // Restore to main position - the saved state will be used automatically
        setIsScrollCollapsed(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollCollapsed]);

  return (
    <div className="min-h-screen">
            {/* Dashboard Header */}
      <header 
        className={`bg-white border-b border-gray-200 px-8 fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrollCollapsed ? 'py-2' : 'py-3'
        }`} 
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <span
              className="text-2xl font-bold themer-gradient cursor-pointer"
              onClick={() => navigate('/')}
              title="Go to landing page"
            >
              Themer
            </span>
          </div>
          
          {/* Collapsed ThemeCreator in header when scrolling */}
          {isScrollCollapsed && (
            <div className="flex justify-center flex-1 transition-all duration-300 ease-in-out">
                          <ThemeCreator
              routes={routes}
              setRoutes={setRoutes}
              initialMinimized={true}
              initialWidth={318}
              initialFlightCreationMode={preScrollFlightCreationState}
              onColorCardSelect={segment => setSelectedSegment(segment)}
              onThemeColorChange={color => setCurrentThemeColor(color)}
              onExpand={() => {
                setIsScrollCollapsed(false);
                // Don't clear the saved states - let them restore naturally when the main ThemeCreator mounts
              }}
              onEnterPromptMode={(segmentId) => {
                setIsPromptMode(true);
                setActiveSegmentId(segmentId);
                
                // Auto-scroll to default position for scrolled state
                const targetScrollPosition = 800; // Scroll to optimal position shown in design
                window.scrollTo({
                  top: targetScrollPosition,
                  behavior: 'smooth'
                });
                
                // Set collapsed state after a short delay to allow scroll to complete
                setTimeout(() => {
                  setIsScrollCollapsed(true);
                }, 500);
              }}
              onFilterChipSelect={handleFilterChipSelect}
              isPromptMode={isPromptMode}
              activeSegmentId={activeSegmentId}
              isInHeader={true}
              key="header-tc" // Force re-render for header position
            />
            </div>
          )}
          
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>
      </header>
      {/* ThemeCreator positioned below header */}
      {!isScrollCollapsed && (
        <div className="w-full flex justify-center transition-all duration-300" style={{ marginTop: 80 }}>
          <ThemeCreator
            routes={routes}
            setRoutes={setRoutes}
            initialMinimized={preScrollThemeCreatorState !== null ? preScrollThemeCreatorState : minimizeThemeCreator}
            initialWidth={(preScrollThemeCreatorState !== null ? preScrollThemeCreatorState : minimizeThemeCreator) ? 318 : undefined}
            initialFlightCreationMode={preScrollFlightCreationState}
            onColorCardSelect={segment => setSelectedSegment(segment)}
            onThemeColorChange={color => setCurrentThemeColor(color)}
            onStateChange={(isMinimized, isCreatingThemes) => {
              // Save the current state when it changes, but only if not currently scroll-collapsed
              if (!isScrollCollapsed) {
                setPreScrollThemeCreatorState(isMinimized);
                setPreScrollFlightCreationState(isCreatingThemes);
              }
            }}
            onEnterPromptMode={(segmentId) => {
              setIsPromptMode(true);
              setActiveSegmentId(segmentId);
              
              // Auto-scroll to default position for scrolled state
              const targetScrollPosition = 800; // Scroll to optimal position shown in design
              window.scrollTo({
                top: targetScrollPosition,
                behavior: 'smooth'
              });
              
              // Set collapsed state after a short delay to allow scroll to complete
              setTimeout(() => {
                setIsScrollCollapsed(true);
              }, 500);
            }}
            onFilterChipSelect={handleFilterChipSelect}
            isPromptMode={isPromptMode}
            activeSegmentId={activeSegmentId}
          />
        </div>
      )}
      
      {/* Plus Icon Cursor for Prompt Mode */}
      <PlusIconCursor 
        isVisible={isPromptMode && showPlusIcon} 
        themeColor={currentThemeColor} 
      />

      {/* Prompt Bubble */}
      <PromptBubble
        isVisible={!!promptBubble}
        position={promptBubble || { x: 0, y: 0 }}
        elementType={promptBubble?.elementType}
        elementData={promptBubble?.elementData}
        onClose={handlePromptBubbleClose}
        onSubmit={handlePromptBubbleSubmit}
        themeColor={promptBubble?.elementType === 'promo-card' ? '#FFFFFF' : currentThemeColor}
        existingText={promptBubble?.existingText || ''}
        positionKey={promptBubble?.positionKey}
        fpsPrompts={fpsPrompts}
      />
      
      {/* Mobile Frame Wrapper - Only show when filter chip is selected */}
      {isFilterChipSelected && (
        <div className="w-full flex justify-center" style={{ marginTop: 8 }}>
          <div style={{ position: 'relative', width: 1400, height: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <img
              src={process.env.PUBLIC_URL + '/ife-frame.svg'}
              alt="Mobile Frame"
              style={{ position: 'absolute', top: -40, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
            />
            <FrameContent
              origin={origin}
              destination={destination}
              minutesLeft={minutesLeft}
              landingIn={landingIn}
              maxFlightMinutes={maxFlightMinutes}
              handleProgressChange={handleProgressChange}
              themeColor={currentThemeColor}
              routes={routes}
              isPromptMode={isPromptMode}
              onPromptHover={handlePromptHover}
              onPromptClick={handlePromptClick}
              fpsPrompts={fpsPrompts}

            />
          </div>
        </div>
      )}
    </div>
  );
} 