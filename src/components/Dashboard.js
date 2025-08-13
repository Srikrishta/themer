import { useState, useRef, useEffect } from 'react';
import ThemeCreator from './ThemeCreator';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';
import PlusIconCursor from './PlusIconCursor';
import PromptBubble from './PromptBubble';
import MousePointer from './MousePointer';
import { useLocation } from 'react-router-dom';

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
}

function FrameContent({ origin, destination, minutesLeft, landingIn, maxFlightMinutes, handleProgressChange, themeColor, routes, isPromptMode, onPromptHover, onPromptClick, fpsPrompts }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, width: 1302, margin: '92px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      <div
        className="fjb-fps-container"
        style={{ width: 1328, maxWidth: 1328, marginLeft: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: themeColor + '14', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, paddingTop: 80, paddingBottom: 40, marginTop: 4, position: 'relative' }}
        onMouseEnter={(e) => {
          if (!isPromptMode) return;
          const isOverProgress = e.target.closest('.flight-progress-bar-container') || e.target.closest('.flight-progress-icon');
          if (!isOverProgress && typeof onPromptHover === 'function') {
            onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseMove={(e) => {
          if (!isPromptMode) return;
          const isOverProgress = e.target.closest('.flight-progress-bar-container') || e.target.closest('.flight-progress-icon');
          if (!isOverProgress && typeof onPromptHover === 'function') {
            onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
          } else if (typeof onPromptHover === 'function') {
            onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseLeave={(e) => {
          if (!isPromptMode) return;
          if (typeof onPromptHover === 'function') {
            onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
          }
        }}
        onClick={(e) => {
          if (!isPromptMode || typeof onPromptClick !== 'function') return;
          const isOverProgress = e.target.closest('.flight-progress-bar-container') || e.target.closest('.flight-progress-icon');
          if (!isOverProgress) {
            onPromptClick('flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
          }
        }}
      >
        <div style={{ width: '100%', marginTop: -32, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <FlightJourneyBar 
            origin={origin} 
            destination={destination} 
            minutesLeft={minutesLeft} 
            themeColor={themeColor} 
            isPromptMode={isPromptMode}
            onPromptHover={onPromptHover}
            onPromptClick={onPromptClick}
          />
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
      
      {/* Recommended for you section */}
      <div
        className="flex flex-col items-start"
        style={{ width: '1302px', gap: '24px' }}
      >
        <p className="block text-left text-black font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
          Recommended for you
        </p>
        
        {/* 4 Recommended Tiles */}
        <div className="grid grid-cols-4 gap-6" style={{ width: '100%' }}>
          {routes.length === 0 ? (
            // Skeleton tiles when no routes added
            <>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="overflow-clip relative shrink-0 flex items-center justify-center bg-gray-200"
                  style={{
                    width: '100%',
                    height: '184px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    borderBottomLeftRadius: '0px',
                    borderBottomRightRadius: '0px'
                  }}
                >
                  <div className="space-y-3 text-center w-3/4">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Tile 1 */}
              <div
                className="bg-black overflow-clip relative shrink-0 flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '184px',
                  background: themeColor,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px'
                }}
              ></div>
              {/* Tile 2 */}
              <div
                className="bg-black overflow-clip relative shrink-0 flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '184px',
                  background: themeColor,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px'
                }}
              ></div>
              {/* Tile 3 */}
              <div
                className="bg-black overflow-clip relative shrink-0 flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '184px',
                  background: themeColor,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px'
                }}
              ></div>
              {/* Tile 4 */}
              <div
                className="bg-black overflow-clip relative shrink-0 flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '184px',
                  background: themeColor,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px'
                }}
              ></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();
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
  
  // Mouse pointer state
  const [showMousePointer, setShowMousePointer] = useState(false);
  // Hover hint bubble for FJB ("add theme")
  const [fjbHoverTip, setFjbHoverTip] = useState({ visible: false, x: 0, y: 0 });
  // Theme chips (colors) exposed from ThemeCreator for the active flight
  const [fjbThemeChips, setFjbThemeChips] = useState([]);
  // Hover hint bubble for FPS ("Add flight phase")
  const [fpsHoverTip, setFpsHoverTip] = useState({ visible: false, x: 0, y: 0, progress: 0 });
  // Hover hint bubble for Promo Cards ("Edit promo card")
  const [pcHoverTip, setPcHoverTip] = useState({ visible: false, x: 0, y: 0, elementData: null });

  // Compute contrasting border color for hover tip PBs (same logic as main PB)
  const isGradientTheme = typeof currentThemeColor === 'string' && currentThemeColor.includes('gradient');
  const parseHex = (hex) => {
    if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  };
  const getLuminance = ({ r, g, b }) => {
    const srgb = [r, g, b].map(v => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };
  const hoverUseLightText = isGradientTheme
    ? true
    : (typeof currentThemeColor === 'string' && currentThemeColor.startsWith('#') && currentThemeColor.length === 7
        ? getLuminance(parseHex(currentThemeColor)) < 0.5
        : true);
  const hoverBorderColor = hoverUseLightText ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)';
  
  // Removed scroll-collapsed header behavior

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
    if (!isPromptMode) return;
    // For FJB: do NOT show the icon-only plus; show hover bubble with "+ add theme"
    if (elementType === 'flight-journey-bar') {
      if (!promptBubble) {
        // Avoid flicker by only updating when moved enough pixels
        setShowPlusIcon(false);
        setFjbHoverTip(prev => {
          if (!isHovering) return { visible: false, x: 0, y: 0 };
          const dx = Math.abs(prev.x - position.x);
          const dy = Math.abs(prev.y - position.y);
          if (!prev.visible || dx > 4 || dy > 4) {
            return { visible: true, x: position.x, y: position.y };
          }
          return prev;
        });
      } else {
        setFjbHoverTip({ visible: false, x: 0, y: 0 });
      }
      return;
    }
    if (elementType === 'flight-icon') {
      if (!promptBubble) {
        // Replace cursor plus with hover tip for FPS
        setShowPlusIcon(false);
        setFpsHoverTip(prev => {
          if (!isHovering) return { visible: false, x: 0, y: 0, progress: 0 };
          const dx = Math.abs(prev.x - position.x);
          const dy = Math.abs(prev.y - position.y);
          if (!prev.visible || dx > 4 || dy > 4 || Math.abs((prev.progress || 0) - (elementData?.progress || 0)) > 0.01) {
            return { visible: true, x: position.x, y: position.y, progress: elementData?.progress || prev.progress || 0 };
          }
          return prev;
        });
      } else {
        setFpsHoverTip({ visible: false, x: 0, y: 0, progress: 0 });
      }
      return;
    }
    if (elementType === 'promo-card') {
      if (!promptBubble) {
        setShowPlusIcon(false);
        setPcHoverTip(prev => {
          if (!isHovering) return { visible: false, x: 0, y: 0, elementData: null };
          const dx = Math.abs(prev.x - position.x);
          const dy = Math.abs(prev.y - position.y);
          const changed = !prev.visible || dx > 4 || dy > 4;
          if (changed) return { visible: true, x: position.x, y: position.y, elementData };
          return prev;
        });
      } else {
        setPcHoverTip({ visible: false, x: 0, y: 0, elementData: null });
      }
      return;
    }
    if (promptBubble) return;
    // Default behavior for other elements (none for now)
    console.log('Prompt hover:', isHovering, elementType, elementData, position);
  };

  const handlePromptClick = (elementType, elementData, position) => {
    if (isPromptMode) {
      // Generate unique key for different element types
      let positionKey;
      if (elementType === 'flight-icon') {
        positionKey = `fps-${Math.round(elementData.progress * 1000)}`; // Use progress as unique identifier
      } else if (elementType === 'flight-journey-bar') {
        positionKey = 'fjb-dashboard'; // Single key for FJB on dashboard
      } else {
        positionKey = `${elementType}-${elementData.cardIndex || 0}`;
      }
      
      // Get existing text for this position
      const existingText = fpsPrompts[positionKey] || '';
      
      // Positioning per element type: FPS relative to container, others at viewport point
      if (elementType === 'flight-icon') {
        const container = document.querySelector('.flight-progress-bar-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const relX = Math.max(0, Math.min(position.x - rect.left + 2, rect.width));
          const relY = Math.max(0, position.y - rect.top + 10);
          setPromptBubble({
            x: relX,
            y: relY,
            elementType,
            elementData,
            positionKey,
            existingText
          });
        } else {
          setPromptBubble({
            x: position.x,
            y: position.y,
            elementType,
            elementData,
            positionKey,
            existingText
          });
        }
      } else if (elementType === 'promo-card') {
        // For promo-card, place exactly at pointer (Viewport -> document handled in PromptBubble)
        setPromptBubble({
          x: position.x,
          y: position.y,
          elementType,
          elementData,
          positionKey,
          existingText
        });
      } else {
        setPromptBubble({
          x: position.x,
          y: position.y,
          elementType,
          elementData,
          positionKey,
          existingText
        });
      }
      setShowPlusIcon(false); // Hide plus icon when bubble appears
      setFjbHoverTip({ visible: false, x: 0, y: 0 });
      setFpsHoverTip({ visible: false, x: 0, y: 0, progress: 0 });
      setPcHoverTip({ visible: false, x: 0, y: 0, elementData: null });
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
    setFjbHoverTip({ visible: false, x: 0, y: 0 });
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

  // Removed scroll detection and header collapse behavior

  return (
    <div className="min-h-screen">
            {/* Dashboard Header */}
      {/* Header removed as requested */}
      {/* ThemeCreator positioned below header (always visible) */}
      <div className="w-full flex justify-center transition-all duration-300" style={{ marginTop: 0 }}>
        <ThemeCreator
          routes={routes}
          setRoutes={setRoutes}
          initialMinimized={minimizeThemeCreator}
          initialWidth={minimizeThemeCreator ? 318 : undefined}
          initialFlightCreationMode={false}
          onColorCardSelect={segment => setSelectedSegment(segment)}
          onThemeColorChange={color => setCurrentThemeColor(color)}
          onStateChange={() => {}}
          onEnterPromptMode={(segmentId) => {
            setIsPromptMode(true);
            setActiveSegmentId(segmentId);
          }}
          onFilterChipSelect={handleFilterChipSelect}
          isPromptMode={isPromptMode}
          activeSegmentId={activeSegmentId}
          onExposeThemeChips={(chips) => setFjbThemeChips(chips || [])}
        />
      </div>
      
      {/* Plus Icon Cursor for Prompt Mode */}
      <PlusIconCursor 
        isVisible={isPromptMode && showPlusIcon} 
        themeColor={currentThemeColor} 
      />

      {/* Mouse Pointer Cursor */}
      <MousePointer 
        isVisible={showMousePointer}
        themeColor={currentThemeColor}
        size="normal"
        showShadow={true}
        animated={true}
      />

      {/* Prompt Bubble */}
      <PromptBubble
        isVisible={!!promptBubble}
        position={promptBubble || { x: 0, y: 0 }}
        elementType={promptBubble?.elementType}
        elementData={promptBubble?.elementData}
        onClose={handlePromptBubbleClose}
        onSubmit={handlePromptBubbleSubmit}
        themeColor={currentThemeColor}
        existingText={promptBubble?.existingText || ''}
        positionKey={promptBubble?.positionKey}
        fpsPrompts={fpsPrompts}
        onThemeColorChange={(color) => {
          if (typeof color === 'string' && color.length > 0) setCurrentThemeColor(color);
        }}
        themeChips={promptBubble?.elementType === 'flight-journey-bar' ? fjbThemeChips : []}
      />

      {/* FJB hover tip bubble: shows label and plus; click opens color PB */}
      {isPromptMode && fjbHoverTip.visible && !promptBubble && (
        <div
          className="fixed z-40"
          style={{ left: fjbHoverTip.x, top: fjbHoverTip.y, pointerEvents: 'none' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 shadow-md"
            style={{
              ...(typeof currentThemeColor === 'string' && currentThemeColor.includes('gradient')
                ? { background: currentThemeColor }
                : { backgroundColor: currentThemeColor }),
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePromptClick('flight-journey-bar', { themeColor: currentThemeColor }, { x: fjbHoverTip.x, y: fjbHoverTip.y });
              }}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white"
              title="Add theme"
              style={{ pointerEvents: 'auto' }}
            >
              +
            </button>
            <span className="text-white text-xs font-bold">Add theme</span>
          </div>
        </div>
      )}

      {/* FPS hover tip bubble: shows label and plus; click opens FPS PB */}
      {isPromptMode && fpsHoverTip.visible && !promptBubble && (
        <div
          className="fixed z-40"
          style={{ left: fpsHoverTip.x, top: fpsHoverTip.y, pointerEvents: 'none' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 shadow-md"
            style={{
              ...(typeof currentThemeColor === 'string' && currentThemeColor.includes('gradient')
                ? { background: currentThemeColor }
                : { backgroundColor: currentThemeColor }),
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Compute progress for click if available
                let progress = fpsHoverTip.progress || 0;
                try {
                  const container = document.querySelector('.flight-progress-bar-container');
                  if (container) {
                    const rect = container.getBoundingClientRect();
                    const barWidth = 1302;
                    const offsetX = fpsHoverTip.x - rect.left;
                    progress = Math.max(0, Math.min(1, offsetX / barWidth));
                  }
                } catch {}
                handlePromptClick('flight-icon', { progress, minutesLeft }, { x: fpsHoverTip.x, y: fpsHoverTip.y });
              }}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white"
              title="Add flight phase"
              style={{ pointerEvents: 'auto' }}
            >
              +
            </button>
            <span className="text-white text-xs font-bold">Add flight phase</span>
          </div>
        </div>
      )}

      {/* Promo Card hover tip bubble: shows label and plus; click opens PC PB */}
      {isPromptMode && pcHoverTip.visible && !promptBubble && (
        <div
          className="fixed z-40"
          style={{ left: pcHoverTip.x, top: pcHoverTip.y, pointerEvents: 'none' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 shadow-md"
            style={{
              ...(typeof currentThemeColor === 'string' && currentThemeColor.includes('gradient')
                ? { background: currentThemeColor }
                : { backgroundColor: currentThemeColor }),
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                const ed = pcHoverTip.elementData || { cardIndex: 0, cardType: 'meal' };
                handlePromptClick('promo-card', ed, { x: pcHoverTip.x, y: pcHoverTip.y });
              }}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white"
              title="Edit promo card"
              style={{ pointerEvents: 'auto' }}
            >
              +
            </button>
            <span className="text-white text-xs font-bold">Edit promo card</span>
          </div>
        </div>
      )}
      
      {/* IFE Frame Wrapper - Always show below ThemeCreator; skeletons render until data is available */}
      <div className="w-full flex justify-center" style={{ marginTop: 8 }}>
        <div style={{ position: 'relative', width: 1400, height: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', contain: 'layout paint' }}>
          <img
            src={process.env.PUBLIC_URL + '/ife-frame.svg'}
            alt="Mobile Frame"
            style={{ position: 'absolute', top: -40, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', willChange: 'transform', transform: 'translateZ(0)' }}
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
    </div>
  );
} 