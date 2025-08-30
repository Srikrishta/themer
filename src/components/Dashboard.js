

import { useState, useRef, useEffect } from 'react';
import { getReadableOnColor } from '../utils/color';
import ThemeCreator from './ThemeCreator';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';
import PlusIconCursor from './PlusIconCursor';
import PromptBubble from './PromptBubble';
import MousePointer from './MousePointer';
import { useLocation } from 'react-router-dom';
import { mapThemeChipToAnimation } from '../utils/themeAnimationMapper';
import { PhotoIcon, ChevronRightIcon } from '@heroicons/react/24/outline';



// Add CSS animation for gradient border
const gradientAnimationCSS = `
  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
}

function FrameContent({ origin, destination, minutesLeft, landingIn, maxFlightMinutes, handleProgressChange, themeColor, routes, isPromptMode, onPromptHover, onPromptClick, fpsPrompts, isThemeBuildStarted, selectedLogo, flightsGenerated, onAnimationProgress, onFlightPhaseSelect, selectedFlightPhase, promoCardContents, cardOrder, onCardReorder, contentCardOrder, onContentCardReorder }) {
  
  // Drag and drop state for content cards
  const [draggedContentCardIndex, setDraggedContentCardIndex] = useState(null);
  const [dragOverContentIndex, setDragOverContentIndex] = useState(null);

  // Helper function to get border style when flight phase is selected
  const getBorderStyle = () => {
    if (selectedFlightPhase) {
      return {
        position: 'relative',
        border: '2px solid transparent',
      };
    }
    return {};
  };

  // Helper function to create animated border overlay for content cards
  const getAnimatedBorderOverlay = () => {
    if (!selectedFlightPhase) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          top: '-12px',
          left: '-12px',
          right: '-12px', 
          bottom: '-12px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientAnimation 3s ease infinite',
          zIndex: -1,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          padding: '12px',
          opacity: 1
        }}
      />
    );
  };

  // Helper function to get content text based on flight phase
  const getContentText = () => {
    return selectedFlightPhase 
      ? `Add content for ${selectedFlightPhase.charAt(0).toUpperCase() + selectedFlightPhase.slice(1)}`
      : "Add content";
  };

  // Drag and drop handlers for content cards
  const handleContentCardDragStart = (e, displayPosition) => {
    console.log('=== CONTENT CARD DRAG START ===', { displayPosition });
    setDraggedContentCardIndex(displayPosition);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleContentCardDragEnd = () => {
    console.log('=== CONTENT CARD DRAG END ===');
    setDraggedContentCardIndex(null);
    setDragOverContentIndex(null);
  };

  const handleContentCardDragOver = (e, displayPosition) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleContentCardDragEnter = (e, displayPosition) => {
    e.preventDefault();
    if (displayPosition !== draggedContentCardIndex) {
      setDragOverContentIndex(displayPosition);
    }
  };

  const handleContentCardDragLeave = () => {
    setDragOverContentIndex(null);
  };

  const handleContentCardDrop = (e, displayPosition) => {
    e.preventDefault();
    console.log('=== CONTENT CARD DROP ===', { draggedContentCardIndex, displayPosition });
    
    if (draggedContentCardIndex !== null && draggedContentCardIndex !== displayPosition) {
      onContentCardReorder(draggedContentCardIndex, displayPosition);
    }
    
    setDraggedContentCardIndex(null);
    setDragOverContentIndex(null);
  };

  // Helper function to render a single content card
  const renderContentCard = (originalCardIndex, displayPosition) => {
    const isDragging = draggedContentCardIndex === displayPosition;
    const isDragOver = dragOverContentIndex === displayPosition;
    
    const cardStyle = {
      width: '100%',
      height: '184px',
      background: (() => {
        if (themeColor.startsWith('#')) {
          const hex = themeColor.slice(1);
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          return `rgba(${r}, ${g}, ${b}, 0.1)`;
        }
        return 'rgba(255,255,255,0.1)';
      })(),
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottomLeftRadius: '0px',
      borderBottomRightRadius: '0px',
      transform: isDragging ? 'rotate(5deg)' : 'none',
      border: isDragOver ? '3px dashed #3b82f6' : 'none',
      opacity: isDragging ? 0.8 : 1,
      cursor: 'grab',
      transition: 'transform 0.2s ease, opacity 0.2s ease',
      ...getBorderStyle()
    };

    return (
      <div
        key={`content-card-${originalCardIndex}-${displayPosition}`}
        draggable
        className="overflow-clip relative shrink-0 flex items-center justify-center backdrop-blur-[10px] backdrop-filter"
        style={cardStyle}
        onDragStart={(e) => handleContentCardDragStart(e, displayPosition)}
        onDragEnd={handleContentCardDragEnd}
        onDragOver={(e) => handleContentCardDragOver(e, displayPosition)}
        onDragEnter={(e) => handleContentCardDragEnter(e, displayPosition)}
        onDragLeave={handleContentCardDragLeave}
        onDrop={(e) => handleContentCardDrop(e, displayPosition)}
      >
        {getAnimatedBorderOverlay()}
        <span className="font-semibold" style={{ 
          color: getReadableOnColor((() => {
            if (themeColor.startsWith('#')) {
              const hex = themeColor.slice(1);
              const r = parseInt(hex.substr(0, 2), 16);
              const g = parseInt(hex.substr(2, 2), 16);
              const b = parseInt(hex.substr(4, 2), 16);
              return `rgba(${r}, ${g}, ${b}, 0.1)`;
            }
            return 'rgba(255,255,255,0.1)';
          })()), 
          fontSize: '24px', 
          lineHeight: '32px', 
          opacity: 0.7 
        }}>
          {getContentText()}
        </span>
      </div>
    );
  };

  return (
    <>
      <style>{gradientAnimationCSS}</style>
      <div style={{ position: 'relative', zIndex: 2, width: 1302, margin: '92px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      <div
        className="fjb-fps-container"
        style={{ width: 1336, maxWidth: 1336, marginLeft: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: themeColor, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, paddingTop: 80, paddingBottom: 40, marginTop: 4, position: 'relative' }}
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
          const isOverLogoPlaceholder = e.target.closest('[data-name="logo placeholder"]');
          if (isOverLogoPlaceholder) {
            // Let the logo-placeholder element handle its own click to open the correct PB
            return;
          }
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
            selectedLogo={selectedLogo}
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
            flightsGenerated={flightsGenerated}
            onAnimationProgress={onAnimationProgress}
            onFlightPhaseSelect={onFlightPhaseSelect}
            selectedFlightPhase={selectedFlightPhase}
          />
        </div>
      </div>
      <Component3Cards 
        themeColor={themeColor} 
        routes={routes}
        isPromptMode={isPromptMode}
        onPromptHover={onPromptHover}
        onPromptClick={onPromptClick}
        isThemeBuildStarted={isThemeBuildStarted}
        selectedFlightPhase={selectedFlightPhase}
        promoCardContents={promoCardContents}
        cardOrder={cardOrder}
        onCardReorder={onCardReorder}
      />
      
      {/* Recommended for you section */}
      <div
        className="flex flex-col items-start"
        style={{ width: '1302px', gap: '24px' }}
      >
        <p className="block text-left font-bold text-black" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
          Recommended for you
        </p>
        
        {/* 4 Recommended Tiles */}
        <div className="grid grid-cols-4 gap-6" style={{ width: '100%' }}>
          {!isThemeBuildStarted || routes.length < 2 ? (
            // Show white placeholders when no theme is built or insufficient routes
            <>
              <div
                className="overflow-clip relative shrink-0 flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '184px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                  backgroundColor: (() => {
                    if (themeColor.startsWith('#')) {
                      const hex = themeColor.slice(1);
                      const r = parseInt(hex.substr(0, 2), 16);
                      const g = parseInt(hex.substr(2, 2), 16);
                      const b = parseInt(hex.substr(4, 2), 16);
                      return `rgba(${r}, ${g}, ${b}, 0.1)`;
                    }
                    return 'rgba(255,255,255,0.1)';
                  })()
                }}
              >
              </div>
              <div
                className="overflow-clip relative shrink-0 flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '184px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                  backgroundColor: (() => {
                    if (themeColor.startsWith('#')) {
                      const hex = themeColor.slice(1);
                      const r = parseInt(hex.substr(0, 2), 16);
                      const g = parseInt(hex.substr(2, 2), 16);
                      const b = parseInt(hex.substr(4, 2), 16);
                      return `rgba(${r}, ${g}, ${b}, 0.1)`;
                    }
                    return 'rgba(255,255,255,0.1)';
                  })()
                }}
              >
              </div>
              <div
                className="overflow-clip relative shrink-0 flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '184px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                  backgroundColor: (() => {
                    if (themeColor.startsWith('#')) {
                      const hex = themeColor.slice(1);
                      const r = parseInt(hex.substr(0, 2), 16);
                      const g = parseInt(hex.substr(2, 2), 16);
                      const b = parseInt(hex.substr(4, 2), 16);
                      return `rgba(${r}, ${g}, ${b}, 0.1)`;
                    }
                    return 'rgba(255,255,255,0.1)';
                  })()
                }}
              >
              </div>
              <div
                className="overflow-clip relative shrink-0 flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '184px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                  backgroundColor: (() => {
                    if (themeColor.startsWith('#')) {
                      const hex = themeColor.slice(1);
                      const r = parseInt(hex.substr(0, 2), 16);
                      const g = parseInt(hex.substr(2, 2), 16);
                      const b = parseInt(hex.substr(4, 2), 16);
                      return `rgba(${r}, ${g}, ${b}, 0.1)`;
                    }
                    return 'rgba(255,255,255,0.1)';
                  })()
                }}
              >
              </div>
            </>
          ) : (
            // Show themed content when theme is built and routes are available - now with drag-and-drop
            contentCardOrder.map((originalCardIndex, displayPosition) => 
              renderContentCard(originalCardIndex, displayPosition)
            )
          )}
        </div>
      </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const minimizeThemeCreator = location.state?.minimizeThemeCreator;
  // Lifted state for routes
  const [routes, setRoutes] = useState([]);
  // Track if user has started building theme (enables 3PCs content and PB)
  const [isThemeBuildStarted, setIsThemeBuildStarted] = useState(true);
  const [themeAnimationComplete, setThemeAnimationComplete] = useState(false);
  // NEW: State for selected segment (color card)
  const [selectedSegment, setSelectedSegment] = useState(null);
  // NEW: State for current theme color
  const [currentThemeColor, setCurrentThemeColor] = useState('#1E72AE'); // Always Discover blue for flights view


  
  // NEW: Prompt mode state
  const [isPromptMode, setIsPromptMode] = useState(false);
  const [activeSegmentId, setActiveSegmentId] = useState(null); // Track which segment is in prompt mode
  const [promptBubble, setPromptBubble] = useState(null); // { x, y, elementType, elementData }
  const [selectedLogo, setSelectedLogo] = useState(null); // { id, src }
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
  // Track the currently selected theme chip for logo animation
  const [selectedThemeChip, setSelectedThemeChip] = useState(null);
  // NEW: Track the currently selected flight phase
  const [selectedFlightPhase, setSelectedFlightPhase] = useState(null);
  const [promoCardContents, setPromoCardContents] = useState({});
  // NEW: Track the order of promo cards for drag-drop functionality
  const [cardOrder, setCardOrder] = useState([0, 1, 2]); // Default order: left, middle, right
  // NEW: Track the order of content cards for drag-drop functionality
  const [contentCardOrder, setContentCardOrder] = useState([0, 1, 2, 3]); // Default order: 1, 2, 3, 4
  // NEW: Track the currently selected flight segment for FJB
  const [selectedFlightSegment, setSelectedFlightSegment] = useState(null);
  // Hover hint bubble for FPS ("Select flight phase")
  const [fpsHoverTip, setFpsHoverTip] = useState({ visible: false, x: 0, y: 0, progress: 0 });
  // Hover hint bubble for Promo Cards ("Edit promo card")
  const [pcHoverTip, setPcHoverTip] = useState({ visible: false, x: 0, y: 0, elementData: null });
  // Hover hint bubble for Logo Placeholder ("Add logo animation")
  const [logoHoverTip, setLogoHoverTip] = useState({ visible: false, x: 0, y: 0 });

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
  // Material-based readable on-color for text/icons over currentThemeColor
  const hoverOnColor = getReadableOnColor(currentThemeColor);
  
  // Removed scroll-collapsed header behavior

  // Use selected flight segment if available, then selected segment, else default to full route
  const origin = selectedFlightSegment?.origin || selectedSegment?.origin || (routes.length > 0 ? routes[0] : null);
  const destination = selectedFlightSegment?.destination || selectedSegment?.destination || (routes.length > 1 ? routes[routes.length - 1] : null);

  // Countdown state
  const maxFlightMinutes = 370; // 6h10m
  const [minutesLeft, setMinutesLeft] = useState(maxFlightMinutes);
  const timerRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [flightsGenerated, setFlightsGenerated] = useState(false);
  const [isGeneratingFlights, setIsGeneratingFlights] = useState(false);
  const [showInFlightGUI, setShowInFlightGUI] = useState(false);
  const [showIFEFrame, setShowIFEFrame] = useState(false);
  const [showInFlightPreview, setShowInFlightPreview] = useState(false);
  const [showSweepAnimation, setShowSweepAnimation] = useState(false);

  // DEBUG: Track height changes
  const dashboardRef = useRef(null);
  useEffect(() => {
    console.log('🚀 DASHBOARD DEBUG: Component mounted/updated', {
      flightsGenerated,
      isGeneratingFlights,
      timestamp: new Date().toISOString()
    });
    
    if (dashboardRef.current) {
      const currentHeight = dashboardRef.current.getBoundingClientRect().height;
      console.log('🔍 DASHBOARD CURRENT HEIGHT:', currentHeight);
      
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          console.log('🔍 DASHBOARD HEIGHT CHANGE:', {
            height: entry.contentRect.height,
            flightsGenerated,
            isGeneratingFlights,
            timestamp: new Date().toISOString()
          });
        }
      });
      observer.observe(dashboardRef.current);
      return () => observer.disconnect();
    }
  }, [flightsGenerated, isGeneratingFlights]);

  // Listen for generate flights event
  useEffect(() => {
    const handleGenerateFlights = () => {
      console.log('🔥 FLIGHTS GENERATED EVENT TRIGGERED');
      setFlightsGenerated(true);
    };
    
    window.addEventListener('airport-search-generate-flights', handleGenerateFlights);
    return () => window.removeEventListener('airport-search-generate-flights', handleGenerateFlights);
  }, []);

  // Reset flightsGenerated when not generating flights
  useEffect(() => {
    if (!isGeneratingFlights) {
      setFlightsGenerated(false);
    }
  }, [isGeneratingFlights]);

  // Handle theme animation completion
  const handleThemeAnimationComplete = () => {
    setThemeAnimationComplete(true);
  };



  // Disable IFE frame animation - flight cards should appear in same position as route cards
  useEffect(() => {
    if (flightsGenerated) {
      // Just activate prompt mode immediately without any IFE frame
      setIsPromptMode(true);
      
      // Keep IFE frame hidden - flight cards appear in original position
      setShowInFlightGUI(false);
      setShowIFEFrame(false);
    } else {
      // Reset states when flights are not generated
      setShowInFlightGUI(false);
      setShowIFEFrame(false);
    }
  }, [flightsGenerated]);

  // Disable sweep animation - keep flight cards in original position
  useEffect(() => {
    setShowSweepAnimation(false);
  }, [isPromptMode, flightsGenerated]);

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
    if (elementType === 'logo-placeholder') {
      if (!promptBubble) {
        setShowPlusIcon(false);
        setLogoHoverTip(prev => {
          if (!isHovering) return { visible: false, x: 0, y: 0 };
          const dx = Math.abs(prev.x - position.x);
          const dy = Math.abs(prev.y - position.y);
          if (!prev.visible || dx > 4 || dy > 4) {
            return { visible: true, x: position.x, y: position.y };
          }
          return prev;
        });
      } else {
        setLogoHoverTip({ visible: false, x: 0, y: 0 });
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
    console.log('=== PROMPT CLICK CALLED ===', { 
      elementType, 
      elementData, 
      position, 
      isPromptMode,
      currentPromoCardContents: promoCardContents
    });
    if (isPromptMode) {
      // Generate unique key for different element types
      let positionKey;
      if (elementType === 'flight-icon') {
        positionKey = `fps-${Math.round(elementData.progress * 1000)}`; // Use progress as unique identifier
      } else if (elementType === 'flight-phase-button') {
        positionKey = 'flight-phase-button-dashboard'; // Single key for flight phase button
      } else if (elementType === 'flight-journey-bar') {
        positionKey = 'fjb-dashboard'; // Single key for FJB on dashboard
      } else if (elementType === 'logo-placeholder') {
        positionKey = 'logo-dashboard';
      } else {
        positionKey = `${elementType}-${elementData.cardIndex || 0}`;
      }
      
      // Get existing text for this position
      let existingText = '';
      if (elementType === 'promo-card' && elementData?.cardIndex !== undefined) {
        // For promo cards, get existing content from promoCardContents
        const cardContent = promoCardContents[elementData.cardIndex];
        console.log('=== DEBUG PROMO CARD RETRIEVAL ===', {
          elementType,
          cardIndex: elementData.cardIndex,
          promoCardContents,
          cardContent,
          hasUpdated: cardContent?.updated
        });
        if (cardContent && cardContent.updated) {
          existingText = `text:${cardContent.text || ''},image:${cardContent.image || ''}`;
          console.log('=== FORMATTED EXISTING TEXT ===', { existingText });
        } else {
          console.log('=== NO EXISTING CONTENT FOUND ===', { 
            hasCardContent: !!cardContent,
            hasUpdated: cardContent?.updated,
            fullPromoCardContents: promoCardContents,
            cardIndex: elementData.cardIndex,
            allKeys: Object.keys(promoCardContents)
          });
        }
      } else {
        existingText = fpsPrompts[positionKey] || '';
      }
      
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
      } else if (elementType === 'flight-phase-button') {
        // Flight phase button: position at the given point (viewport coordinates)
        setPromptBubble({
          x: position.x,
          y: position.y,
          elementType,
          elementData,
          positionKey,
          existingText
        });
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
      setLogoHoverTip({ visible: false, x: 0, y: 0 });
    }
  };

  // Listen for prompt events from routes view (inline flight cards)
  useEffect(() => {
    const handleEnterPrompt = (e) => {
      try {
        setIsPromptMode(true);
        const segId = e?.detail?.segId || null;
        setActiveSegmentId(segId);
      } catch {}
    };
    const handleTriggerPrompt = (e) => {
      try {
        const { elementType, elementData, position, segId } = e?.detail || {};
        // Ensure prompt mode before triggering
        setIsPromptMode(true);
        if (segId) setActiveSegmentId(segId);
        if (elementType) {
          setTimeout(() => {
            handlePromptClick(elementType, elementData || {}, position || { x: 0, y: 0 });
          }, 30);
        }
      } catch {}
    };
    window.addEventListener('enter-prompt-mode', handleEnterPrompt);
    window.addEventListener('trigger-prompt-bubble', handleTriggerPrompt);
    return () => {
      window.removeEventListener('enter-prompt-mode', handleEnterPrompt);
      window.removeEventListener('trigger-prompt-bubble', handleTriggerPrompt);
    };
  }, []);

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
    setLogoHoverTip({ visible: false, x: 0, y: 0 });
  };

  const handlePromptBubbleSubmit = (promptText, elementType, elementData, positionKey) => {
    console.log('=== PROMPT BUBBLE SUBMIT CALLED ===', {
      promptText, 
      elementType, 
      elementData, 
      positionKey,
      currentPromoCardContents: promoCardContents
    });
    
    // Handle promo card submissions
    if (elementType === 'promo-card' && elementData && elementData.cardIndex !== undefined) {
      console.log('=== DASHBOARD RECEIVED PROMO SUBMISSION ===', { 
        promptText, 
        elementType, 
        elementData, 
        positionKey 
      });
      
      // Parse the submitted text (format: "text:value,image:value")
      const parts = promptText.split(',');
      let textContent = '';
      let imageContent = '';
      
      parts.forEach(part => {
        if (part.startsWith('text:')) {
          textContent = part.substring(5).trim();
        } else if (part.startsWith('image:')) {
          imageContent = part.substring(6).trim();
        }
      });
      
      console.log('=== PARSED PROMO CONTENT ===', { 
        parts, 
        textContent, 
        imageContent 
      });
      
      // Update the promo card content
      setPromoCardContents(prev => {
        const existingContent = prev[elementData.cardIndex] || {};
        const newContent = {
          ...prev,
          [elementData.cardIndex]: {
            text: textContent,
            // Only update image if a new one is provided, otherwise keep existing
            image: imageContent.trim() ? imageContent : existingContent.image,
            updated: true
          }
        };
        console.log('=== UPDATING PROMO CARD CONTENTS ===', {
          cardIndex: elementData.cardIndex,
          textContent,
          imageContent,
          previousContent: prev,
          newContent
        });
        return newContent;
      });
      
      console.log('=== PROMO CARD CONTENT UPDATED ===', { 
        cardIndex: elementData.cardIndex, 
        textContent, 
        imageContent 
      });
    }
    
    // Store the submitted text for this position
    if (positionKey) {
      setFpsPrompts(prev => ({
        ...prev,
        [positionKey]: promptText
      }));
    }
    
    // TODO: Handle the actual prompt submission logic here
    // Don't close the bubble for logo placeholder submissions (keep bubble open for editing)
    if (elementType !== 'logo-placeholder') {
      setPromptBubble(null);
    }
    // Heuristic: if this is logo placeholder, parse prompt to choose or clear an animation
    if (elementType === 'logo-placeholder') {
      const text = (promptText || '').toLowerCase();
      // removal/disable intents
      const removalRegex = /(remove|clear|disable|turn\s*off|stop).*animation|animation.*(off|remove|clear|stop|disable)/;
      if (removalRegex.test(text)) {
        setSelectedLogo(prev => ({ ...(prev || {}), animationType: null }));
        return;
      }

      let type = 'sparkles';
      if (/confetti|celebrat|party|congrats/.test(text)) type = 'confetti';
      else if (/light|festive|bulb|christmas|string/.test(text)) type = 'lights';
      else if (/glow|neon|shine|halo/.test(text)) type = 'glow';
      setSelectedLogo(prev => ({ ...(prev || {}), animationType: type }));
    }
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

  // Manage body overflow - always allow scrolling in flights view
  useEffect(() => {
    console.log('Dashboard overflow effect: always allow scroll');
    // Always allow scrolling
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    };
  }, []);

  // Keep all elements visible - no auto-scroll to hide themer logo or input fields
  // Removed auto-scroll to maintain visibility of input fields and generate flights button

  // NEW: Handle flight phase selection from FlightProgress
  const handleFlightPhaseSelect = (phase) => {
    setSelectedFlightPhase(phase);
  };

  // NEW: Handle card reordering for drag-drop functionality
  const handleCardReorder = (dragIndex, hoverIndex) => {
    console.log('=== CARD REORDER ===', { dragIndex, hoverIndex, currentOrder: cardOrder });
    
    const draggedCardId = cardOrder[dragIndex];
    const newOrder = [...cardOrder];
    
    // Remove the dragged card from its current position
    newOrder.splice(dragIndex, 1);
    // Insert it at the new position
    newOrder.splice(hoverIndex, 0, draggedCardId);
    
    console.log('=== NEW CARD ORDER ===', { oldOrder: cardOrder, newOrder });
    setCardOrder(newOrder);
    
    // Also need to update the promoCardContents to maintain the correct association
    const updatedContents = {};
    newOrder.forEach((originalCardId, newPosition) => {
      if (promoCardContents[originalCardId]) {
        updatedContents[newPosition] = {
          ...promoCardContents[originalCardId],
          // Keep the original content but update any position-dependent logic if needed
        };
      }
    });
    
    // Update promoCardContents with the new positions while preserving content
    const finalContents = {};
    newOrder.forEach((originalCardId, newPosition) => {
      if (promoCardContents[originalCardId]) {
        finalContents[newPosition] = promoCardContents[originalCardId];
      }
    });
    
    if (Object.keys(finalContents).length > 0) {
      setPromoCardContents(finalContents);
      console.log('=== UPDATED PROMO CARD CONTENTS AFTER REORDER ===', finalContents);
    }
  };

  // NEW: Handle content card reordering for drag-drop functionality
  const handleContentCardReorder = (dragIndex, hoverIndex) => {
    console.log('=== CONTENT CARD REORDER ===', { dragIndex, hoverIndex, currentOrder: contentCardOrder });
    
    const draggedCardId = contentCardOrder[dragIndex];
    const newOrder = [...contentCardOrder];
    
    // Remove the dragged card from its current position
    newOrder.splice(dragIndex, 1);
    // Insert it at the new position
    newOrder.splice(hoverIndex, 0, draggedCardId);
    
    console.log('=== NEW CONTENT CARD ORDER ===', { oldOrder: contentCardOrder, newOrder });
    setContentCardOrder(newOrder);
  };

  console.log('🎯 Dashboard RENDER: showInFlightPreview =', showInFlightPreview, 'showIFEFrame =', showIFEFrame, 'isPromptMode =', isPromptMode);
  
  return (
    <div 
      ref={dashboardRef}
      className="min-h-screen"
      style={{
        height: 'auto',
        overflow: 'visible',
        overflowY: 'visible',
        position: 'relative',
        minHeight: '100vh',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px'
      }}
      data-name="dashboard-container"
    >
            {/* Dashboard Header */}
      {/* Header removed as requested */}
      {/* ThemeCreator positioned below header (always visible) */}
      <div 
        className="w-full flex justify-center"
        style={{ 
          marginTop: 0,
          marginBottom: 80
        }}
      >
        <ThemeCreator
          routes={routes}
          setRoutes={setRoutes}
          initialMinimized={minimizeThemeCreator}
          initialWidth={minimizeThemeCreator ? 318 : undefined}
          initialFlightCreationMode={false}
          onColorCardSelect={segment => setSelectedSegment(segment)}
          onThemeColorChange={color => {
            setCurrentThemeColor(color);
            // When theme color changes from ThemeCreator, clear any logo animation
            // as this is not from a theme chip selection
            setSelectedLogo(prev => ({ 
              ...(prev || {}), 
              animationType: null 
            }));
          }}
          onStateChange={() => {}}
          onEnterPromptMode={(segmentId) => {
            setIsPromptMode(true);
            setActiveSegmentId(segmentId);
          }}
          onFilterChipSelect={handleFilterChipSelect}
          isPromptMode={isPromptMode}
          activeSegmentId={activeSegmentId}
          onExposeThemeChips={(chips) => setFjbThemeChips(chips || [])}
          onStartThemeBuild={() => setIsThemeBuildStarted(true)}
          themeColor={currentThemeColor}
          onTriggerPromptBubble={handlePromptClick}
          selectedLogo={selectedLogo}
          isInHeader={false}
          onThemeAnimationComplete={handleThemeAnimationComplete}
          onGeneratingStateChange={(isGenerating) => {
            setIsGeneratingFlights(isGenerating);
          }}
          flightsGenerated={flightsGenerated}
                      onBuildThemes={() => {
              setIsThemeBuildStarted(true);
              // DIRECT TRIGGER: Show preview when build themes is clicked
              console.log('🎯 Dashboard: onBuildThemes called, triggering preview with delay');
              setTimeout(() => {
                console.log('🎯 Dashboard: Timer executed, setting preview states');
                setShowInFlightPreview(true);
                setShowIFEFrame(true);
                setIsPromptMode(true);
              }, 250); // Match ThemeCreator delay
            }}
                      onFlightSelect={(segment) => {
            setSelectedFlightSegment(segment);
          }}
          showIFEFrame={showIFEFrame}
          onShowPreview={(show) => {
            console.log('🎯 Dashboard: onShowPreview called with:', show);
            setShowInFlightPreview(show);
            setShowIFEFrame(show);
            setIsPromptMode(show);
            console.log('🎯 Dashboard: States IMMEDIATELY after set - showInFlightPreview:', show, 'showIFEFrame:', show, 'isPromptMode:', show);
            
            // Force a re-render check
            setTimeout(() => {
              console.log('🎯 Dashboard: States AFTER timeout - showInFlightPreview should be:', show);
            }, 100);
          }}
          onBuildThemeClicked={() => {
            console.log('🎯 Dashboard: Build theme clicked, triggering preview directly');
            setTimeout(() => {
              setShowInFlightPreview(true);
              setShowIFEFrame(true);
              setIsPromptMode(true);
            }, 250);
          }}
        />
      </div>
      
      {/* In-flight preview label */}
      {showInFlightPreview && (
        <div 
          className="w-full flex justify-center"
          style={{
            marginTop: 20,
            opacity: showInFlightPreview ? 1 : 0,
            transform: showInFlightPreview ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out'
          }}
        >

        </div>
      )}

      {/* IFE frame - Shows when preview mode is active */}
      {showInFlightPreview && (
        <div 
          className="w-full flex justify-center" 
          style={{ 
            marginTop: 8, 
            height: '880px',
            opacity: showInFlightPreview ? 1 : 0,
            transform: showInFlightPreview ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
          }}
        >
          <div style={{ position: 'relative', width: 1400, height: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', contain: 'layout paint', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
            {/* IFE Frame SVG */}
            <img
              src={process.env.PUBLIC_URL + '/ife-frame.svg'}
              alt="Mobile Frame"
              style={{ position: 'absolute', top: -40, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', willChange: 'transform', transform: 'translateZ(0)' }}
            />
            
            {/* Frame Content */}
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
              isThemeBuildStarted={isThemeBuildStarted}
              selectedLogo={selectedLogo}
              flightsGenerated={flightsGenerated}
              onAnimationProgress={(progress) => {
                if (progress >= 0.2 && !themeAnimationComplete) {
                  handleThemeAnimationComplete();
                }
              }}
              onFlightPhaseSelect={handleFlightPhaseSelect}
              selectedFlightPhase={selectedFlightPhase}
              promoCardContents={promoCardContents}
              cardOrder={cardOrder}
              onCardReorder={handleCardReorder}
              contentCardOrder={contentCardOrder}
              onContentCardReorder={handleContentCardReorder}
            />
          </div>
        </div>
      )}
      

      



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
        key={`${promptBubble?.elementType}-${promptBubble?.positionKey}-${promptBubble?.existingText?.length || 0}`}
        isVisible={!!promptBubble}
        position={promptBubble || { x: 0, y: 0 }}
        elementType={promptBubble?.elementType}
        elementData={promptBubble?.elementData}
        onClose={handlePromptBubbleClose}
        onSubmit={handlePromptBubbleSubmit}
        themeColor={currentThemeColor}
        isThemeBuildStarted={isThemeBuildStarted}
        existingText={promptBubble?.existingText || ''}
        positionKey={promptBubble?.positionKey}
        fpsPrompts={fpsPrompts}
        onThemeColorChange={(color, chipData) => {
          if (typeof color === 'string' && color.length > 0) {
            setCurrentThemeColor(color);
            // Update selected theme chip and apply logo animation
            if (chipData && chipData.label) {
              setSelectedThemeChip(chipData);
              const animationType = mapThemeChipToAnimation(chipData.label, chipData.color);
              setSelectedLogo(prev => ({ 
                ...(prev || {}), 
                animationType: animationType 
              }));
            }
          }
        }}
        themeChips={promptBubble?.elementType === 'flight-journey-bar' ? fjbThemeChips : []}
        selectedLogo={selectedLogo}
        onLogoSelect={(info) => {
          setSelectedLogo(info);
          // Auto-set theme color based on selected logo
          if (info && info.id) {
            const logoColorMap = {
              'discover': '#1E72AE',
              'lufthansa': '#050F43', 
              'swiss': '#CB0300'
            };
            const newColor = logoColorMap[info.id];
            if (newColor) {
              setCurrentThemeColor(newColor);
            }
          }
        }}
        flightsGenerated={flightsGenerated}
        selectedFlightPhase={selectedFlightPhase}
        onFlightPhaseSelect={handleFlightPhaseSelect}
      />

      {/* FJB hover tip bubble: shows label and plus; click opens color PB */}
      {isPromptMode && fjbHoverTip.visible && !promptBubble && (
        <div
          className="fixed z-40"
          style={{ left: fjbHoverTip.x, top: fjbHoverTip.y, pointerEvents: 'none' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md"
            style={{
              ...(typeof currentThemeColor === 'string' && currentThemeColor.includes('gradient')
                ? { background: currentThemeColor }
                : { backgroundColor: currentThemeColor }),
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <span className="text-xs font-bold" style={{ color: hoverOnColor }}>Change theme</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePromptClick('flight-journey-bar', { themeColor: currentThemeColor }, { x: fjbHoverTip.x, y: fjbHoverTip.y });
              }}
              className="w-6 h-6 rounded-full border flex items-center justify-center"
              title="Change theme"
              style={{ pointerEvents: 'auto', borderColor: hoverOnColor, color: hoverOnColor }}
            >
              +
            </button>
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
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md"
            style={{
              ...(typeof currentThemeColor === 'string' && currentThemeColor.includes('gradient')
                ? { background: currentThemeColor }
                : { backgroundColor: currentThemeColor }),
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <span className="text-xs font-bold" style={{ color: hoverOnColor }}>Select flight phase</span>
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
              className="w-6 h-6 rounded-full border flex items-center justify-center"
              title="Select flight phase"
              style={{ pointerEvents: 'auto', borderColor: hoverOnColor, color: hoverOnColor }}
            >
              +
            </button>
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
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md"
            style={{
              ...(typeof currentThemeColor === 'string' && currentThemeColor.includes('gradient')
                ? { background: currentThemeColor }
                : { backgroundColor: currentThemeColor }),
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <span className="text-xs font-bold" style={{ color: hoverOnColor }}>
              {pcHoverTip.elementData && typeof pcHoverTip.elementData.cardIndex === 'number' 
                ? `Edit promo card ${pcHoverTip.elementData.cardIndex + 1}` 
                : 'Edit promo card'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const ed = pcHoverTip.elementData || { cardIndex: 0, cardType: 'meal' };
                handlePromptClick('promo-card', ed, { x: pcHoverTip.x, y: pcHoverTip.y });
              }}
              className="w-6 h-6 rounded-full border flex items-center justify-center"
              title={pcHoverTip.elementData && typeof pcHoverTip.elementData.cardIndex === 'number' 
                ? `Edit promo card ${pcHoverTip.elementData.cardIndex + 1}` 
                : 'Edit promo card'}
              style={{ pointerEvents: 'auto', borderColor: hoverOnColor, color: hoverOnColor }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Logo Placeholder hover tip bubble: shows label and plus; click opens Logo PB */}
      {isPromptMode && logoHoverTip.visible && !promptBubble && (
        <div
          className="fixed z-40"
          style={{ left: logoHoverTip.x, top: logoHoverTip.y, pointerEvents: 'none' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md"
            style={{
              ...(typeof currentThemeColor === 'string' && currentThemeColor.includes('gradient')
                ? { background: currentThemeColor }
                : { backgroundColor: currentThemeColor }),
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <span className="text-xs font-bold" style={{ color: hoverOnColor }}>Add logo animation</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePromptClick('logo-placeholder', {}, { x: logoHoverTip.x, y: logoHoverTip.y });
              }}
              className="w-6 h-6 rounded-full border flex items-center justify-center"
              title="Add logo animation"
              style={{ pointerEvents: 'auto', borderColor: hoverOnColor, color: hoverOnColor }}
            >
              +
            </button>
          </div>
        </div>
      )}
      


      {/* IFE frame logic - DISABLED to keep flight cards in original position */}
      {false && (
        <>
          {/* In-flight GUI text - HIDDEN */}
          {false && (
          <div 
            className="w-full flex justify-center" 
            style={{ 
              marginTop: isThemeBuildStarted ? 12 : 24, 
              marginBottom: 32,
              opacity: showInFlightGUI ? 1 : 0,
              transform: showInFlightGUI ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1.2s ease-in-out, transform 1.2s ease-in-out'
            }}
          >
            <div style={{ width: '1302px' }}>
              <p className="block font-bold text-black text-center" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>In-flight GUI</p>
            </div>
          </div>
          )}

          {/* Selected Flight Card below In-flight GUI text - HIDDEN */}
          {false && (selectedFlightSegment || (origin && destination)) && (
            <div 
              className="w-full flex justify-center" 
              style={{ 
                marginBottom: 24,
                opacity: showInFlightGUI ? 1 : 0,
                transform: showInFlightGUI ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 1.2s ease-in-out, transform 1.2s ease-in-out'
              }}
            >
              <div className="flex items-center gap-4" style={{ width: '434px' }}>
                <div 
                  className="backdrop-blur-[10px] backdrop-filter pl-5 pr-3 py-4 rounded-full shadow-sm flex-1"
                  style={{
                    ...(typeof currentThemeColor === 'string' && currentThemeColor.includes('gradient')
                      ? { background: currentThemeColor }
                      : { backgroundColor: currentThemeColor })
                  }}
                >
                  <div className="flex justify-between items-stretch opacity-100">
                    <div className="flex items-start gap-1 flex-none pr-0" style={{ paddingRight: 6 }}>
                      <div className="flex-none">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-white break-words">
                            {selectedFlightSegment 
                              ? `${selectedFlightSegment.origin?.airport?.code} → ${selectedFlightSegment.destination?.airport?.code}`
                              : `${origin?.airport?.code} → ${destination?.airport?.code}`
                            }
                          </h3>
                        </div>
                        <div className="text-xs text-white mt-1 flex items-center gap-3 flex-wrap break-words">
                          <span className="flex items-center gap-1 font-semibold">Selected Flight</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex w-px mx-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <div className="hidden md:flex items-center gap-1" style={{ marginLeft: 5 }}>
                      <button 
                        type="button" 
                        className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" 
                        title="Add Airline Logo"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPromptMode && typeof handlePromptClick === 'function') {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const position = { x: rect.left, y: rect.top };
                            handlePromptClick('logo-placeholder', {}, position);
                          }
                        }}
                      >
                        <PhotoIcon className="w-4 h-4" />
                      </button>
                      <button 
                        type="button" 
                        className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" 
                        title="Change Theme"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPromptMode && typeof handlePromptClick === 'function') {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const position = { x: rect.left, y: rect.top };
                            handlePromptClick('flight-journey-bar', { themeColor: currentThemeColor }, position);
                          }
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
                            backgroundSize: '200% 200%'
                          }}
                        />
                      </button>
                      <button 
                        type="button" 
                        className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" 
                        title="Add Flight Content"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPromptMode && typeof handlePromptClick === 'function') {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const position = { x: rect.left, y: rect.top };
                            handlePromptClick('flight-phase-button', { progress: 0.5, minutesLeft: 200 }, position);
                          }
                        }}
                      >
                        <img src={process.env.PUBLIC_URL + '/flight icon.svg'} alt="Flight icon" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <ChevronRightIcon className="w-6 h-6 text-black opacity-60 flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Preview elements will be added here later */}

        </>
      )}
    </div>
  );
}
