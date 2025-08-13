import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getReadableOnColor } from '../utils/color';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';
import PromptBubble from './PromptBubble';

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Mock data for the theme preview
  const mockOrigin = { airport: { city: 'Berlin', code: 'BER' } };
  const mockDestination = { airport: { city: 'Paris', code: 'CDG' } };
  const mockRoutes = [mockOrigin, mockDestination];
  
  // Countdown state for landing time
  const maxFlightMinutes = 185; // 3h 05m
  const [minutesLeft, setMinutesLeft] = useState(maxFlightMinutes);
  const timerRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [showMovingIcon, setShowMovingIcon] = useState(true); // Start with animation
  const [promoCardLoading, setPromoCardLoading] = useState(false);
  const [promoCardFinishedLoading, setPromoCardFinishedLoading] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  // Theme colors for landing page (brand blue)
  // Using a single brand color to avoid cycling and ensure consistency
  const themeColors = [
    '#1E73AF'
  ];
  
  const [cruiseLabelShown, setCruiseLabelShown] = useState(false);
  const [middleCardPromptClosed, setMiddleCardPromptClosed] = useState(false);
  const [showMiddleCardPrompt, setShowMiddleCardPrompt] = useState(false);
  const [middleCardPromptPosition, setMiddleCardPromptPosition] = useState({ x: 0, y: 0 });
  const [showFJBPrompt, setShowFJBPrompt] = useState(false);
  const [fJBPromptPosition, setFJBPromptPosition] = useState({ x: 0, y: 0 });
  const [recommendedTiles, setRecommendedTiles] = useState([
    { id: 1, color: themeColors[0] },
    { id: 2, color: themeColors[0] },
    { id: 3, color: themeColors[0] },
    { id: 4, color: themeColors[0] }
  ]);
  const [draggedTile, setDraggedTile] = useState(null);
  
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
  };
  
  // Countdown timer effect - only run when not in animation mode
  useEffect(() => {
    setMinutesLeft(maxFlightMinutes);
  }, [maxFlightMinutes]);

  useEffect(() => {
    if (dragging) return; // Pause timer while dragging
    if (minutesLeft <= 0) return;
    if (showMovingIcon) return; // Pause timer during flight icon animation
    
    console.log('Setting timer for minutesLeft:', minutesLeft);
    timerRef.current = setTimeout(() => {
      console.log('Timer fired, updating minutesLeft from:', minutesLeft, 'to:', minutesLeft - 1);
      setMinutesLeft((m) => (m > 0 ? m - 1 : 0));
    }, 60000); // Update every minute (same as Dashboard)
    return () => clearTimeout(timerRef.current);
  }, [minutesLeft, dragging, showMovingIcon]);

  // Handle animation progress changes
  const handleAnimationProgressChange = (newMinutes) => {
    console.log('Animation progress changed minutes to:', newMinutes);
    setMinutesLeft(newMinutes);
  };

  // Handle animation progress from FlightProgress
  const handleAnimationProgress = (progress) => {
    setAnimationProgress(progress);
  };

  // Handle Cruise label show event
  const handleCruiseLabelShow = (isShown) => {
    console.log('=== CRUISE LABEL SHOW EVENT ===', { isShown, cruiseLabelShown });
    setCruiseLabelShown(isShown);
    console.log('=== CRUISE LABEL STATE UPDATED ===', { newState: isShown });
  };

  const handleMiddleCardPromptClose = (isClosed) => {
    console.log('=== LandingPage: handleMiddleCardPromptClose called ===', { isClosed });
    setMiddleCardPromptClosed(isClosed);
  };

  const handleMiddleCardPromptClick = (elementType, elementData, position) => {
    console.log('=== MIDDLE CARD PROMPT CLICK HANDLER CALLED ===', { 
      elementType, 
      elementData, 
      position,
      showMiddleCardPrompt,
      middleCardPromptClosed
    });
    setMiddleCardPromptPosition(position);
    setShowMiddleCardPrompt(true);
    console.log('=== PROMPT BUBBLE STATE UPDATED ===', { 
      newPosition: position, 
      showPrompt: true 
    });
  };

  const handleMiddleCardPromptBubbleClose = () => {
    console.log('=== MIDDLE CARD PROMPT BUBBLE CLOSED ===');
    setShowMiddleCardPrompt(false);
    setMiddleCardPromptClosed(true);
    handleMiddleCardPromptClose(true);
  };

  const handleFJBPromptBubbleClose = () => {
    console.log('=== FJB PROMPT BUBBLE CLOSED ===');
    setShowFJBPrompt(false);
  };

  const handleFJBPromptSubmit = (promptText, elementType, elementData, positionKey) => {
    console.log('=== FJB PROMPT SUBMITTED ===', { promptText, elementType, elementData, positionKey });
    console.log('=== FJB SUBMIT HANDLER CALLED ===');
    setShowFJBPrompt(false);
    
    // Update theme color to gradient green for FJB landing page
    if (positionKey === 'fjb-landing') {
      console.log('=== UPDATING THEME TO GRADIENT GREEN ===');
      console.log('=== BEFORE THEME UPDATE ===', { currentThemeColor, mockThemeColor });
      
      // Set the theme color directly to the gradient and enable gradient mode
      const gradientColor = 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)';
      setCurrentThemeColor(gradientColor);
      setIsGradientMode(true);
      console.log('=== AFTER THEME UPDATE ===', { newGradient: gradientColor, isGradientMode: true });
      console.log('=== THEME UPDATE COMPLETE ===');
    } else {
      console.log('=== POSITION KEY NOT FJB-LANDING ===', { positionKey });
    }
  };

  const handleMiddleCardPromptSubmit = (promptText, elementType, elementData, positionKey) => {
    console.log('=== MIDDLE CARD PROMPT SUBMITTED ===', { promptText, elementType, elementData, positionKey });
    console.log('=== TRIGGERING CARD CONTENT UPDATE AND ANIMATION CONTINUATION ===');
    setShowMiddleCardPrompt(false);
    setMiddleCardPromptClosed(true);
    handleMiddleCardPromptClose(true);
    console.log('=== MIDDLE CARD PROMPT CLOSED - ANIMATION SHOULD CONTINUE TO FJB ===');
    
    // Trigger FJB prompt bubble after middle card is complete
    setTimeout(() => {
      console.log('=== TRIGGERING FJB PROMPT BUBBLE ===');
      const fjbElement = document.querySelector('[data-name="flight journey bar"]');
      if (fjbElement) {
        const rect = fjbElement.getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2 + 20, // Center + offset for plus button
          y: rect.top + rect.height / 2
        };
        setFJBPromptPosition(position);
        setShowFJBPrompt(true);
        console.log('=== FJB PROMPT BUBBLE POSITIONED ===', { position });
        console.log('=== FJB PROMPT BUBBLE SHOWN ===', { showFJBPrompt: true });
      } else {
        console.error('FJB element not found');
      }
    }, 1000); // 1 second delay after middle card prompt closes
  };

  const handleThemeColorChange = (newColor) => {
    // Update the theme color when changed from the color picker
    console.log('=== handleThemeColorChange CALLED ===', { newColor });
    console.log('=== BEFORE THEME CHANGE ===', { currentThemeColor });
    
    // Check if it's a gradient
    const isGradient = newColor.includes('gradient');
    setIsGradientMode(isGradient);
    setCurrentThemeColor(newColor);
    console.log('=== AFTER THEME CHANGE ===', { newColor, isGradient });
    
    // Also update the index if the color is in our predefined array (only for solid colors)
    if (!isGradient) {
      const colorIndex = themeColors.indexOf(newColor);
      if (colorIndex !== -1) {
        setCurrentThemeColorIndex(colorIndex);
      }
    }
  };

  // Drag and drop handlers for recommended tiles
  const handleDragStart = (e, tileId) => {
    setDraggedTile(tileId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTileId) => {
    e.preventDefault();
    if (draggedTile && draggedTile !== targetTileId) {
      const draggedIndex = recommendedTiles.findIndex(tile => tile.id === draggedTile);
      const targetIndex = recommendedTiles.findIndex(tile => tile.id === targetTileId);
      
      const newTiles = [...recommendedTiles];
      const [draggedItem] = newTiles.splice(draggedIndex, 1);
      newTiles.splice(targetIndex, 0, draggedItem);
      
      setRecommendedTiles(newTiles);
    }
    setDraggedTile(null);
  };

  const handleDragEnd = () => {
    setDraggedTile(null);
  };

  // Handle progress bar drag
  const handleProgressChange = (newMinutes) => {
    setDragging(true);
    setMinutesLeft(newMinutes);
  };

  const handlePromoCardLoadingChange = (isLoading) => {
    setPromoCardLoading(isLoading);
    if (!isLoading && promoCardLoading) {
      // Loading just finished
      setPromoCardFinishedLoading(true);
    }
    // Don't automatically show prompt bubble - let FlightProgress control this
  };

  useEffect(() => {
    if (!dragging) return;
    const handleUp = () => setDragging(false);
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, [dragging]);
  
  const [currentThemeColorIndex, setCurrentThemeColorIndex] = useState(0);
  const [currentThemeColor, setCurrentThemeColor] = useState(themeColors[0]);
  const [isGradientMode, setIsGradientMode] = useState(false);
  const mockThemeColor = currentThemeColor;
  
  // Helper function to convert hex to rgba with opacity
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Helper function to get background color with proper opacity handling
  const getBackgroundColor = (color) => {
    if (color.includes('gradient')) {
      return color;
    } else {
      return hexToRgba(color, 0.14);
    }
  };
  
  // Debug theme color changes
  useEffect(() => {
    console.log('=== THEME COLOR CHANGED ===', { currentThemeColor, mockThemeColor });
    console.log('=== BACKGROUND COLOR ===', { background: getBackgroundColor(mockThemeColor) });
    if (mockThemeColor.includes('gradient')) {
      console.log('=== GRADIENT THEME APPLIED ===', { gradient: mockThemeColor });
      console.log('=== GRADIENT LENGTH ===', mockThemeColor.length);
      console.log('=== GRADIENT VALIDATION ===', {
        hasLinear: mockThemeColor.includes('linear-gradient'),
        hasDegrees: mockThemeColor.includes('120deg'),
        hasColors: mockThemeColor.includes('#d4fc79') && mockThemeColor.includes('#96e6a1')
      });
    }
  }, [currentThemeColor, mockThemeColor]);
  
  // Cycle through theme colors every 7 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentThemeColorIndex((prevIndex) => 
  //       (prevIndex + 1) % themeColors.length
  //     );
  //   }, 7000);
    
  //   return () => clearInterval(interval);
  // }, []);

  // Update currentThemeColor when currentThemeColorIndex changes (only for solid colors)
  useEffect(() => {
    // Only update if not in gradient mode
    if (!isGradientMode) {
      setCurrentThemeColor(themeColors[currentThemeColorIndex]);
    }
  }, [currentThemeColorIndex, themeColors, isGradientMode]);

  // Update tiles when theme color changes
  useEffect(() => {
    setRecommendedTiles(prevTiles => 
      prevTiles.map(tile => ({
        ...tile,
        color: mockThemeColor
      }))
    );
  }, [mockThemeColor]);
  
  const landingIn = formatTime(minutesLeft);
  console.log('LandingPage - minutesLeft:', minutesLeft, 'landingIn:', landingIn);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E9EFF5' }}>
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold themer-gradient">Themer</span>
            </a>
          </div>
        </nav>
      </header>

      <main className="relative isolate">
        {/* Hero section */}
        <div className="overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-4 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-4xl gap-x-20 lg:mx-0 lg:flex lg:max-w-none lg:items-center lg:justify-center">
              <div className="w-full max-w-3xl lg:basis-1/2 xl:basis-1/2 lg:shrink-0 xl:max-w-3xl flex flex-col items-center text-center">
                <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 whitespace-nowrap text-center">
                  Personalize in-flight experiences.
                </h1>
                <p className="relative mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none text-center whitespace-nowrap">
                  Curate experiences your passengers would love.
                </p>
                <div className="mt-10 flex items-center justify-center">
                  <div
                    onClick={() => {
                      console.log('=== CREATE BUTTON CLICKED ===');
                      console.log('=== NAVIGATING TO DASHBOARD ===');
                      navigate('/dashboard');
                    }}
                    className="shadow-md cursor-pointer transition-all duration-200 hover:opacity-90"
                    style={{
                      width: '200px',
                      height: '48px',
                      borderTopLeftRadius: '0px',
                      borderTopRightRadius: '24px',
                      borderBottomLeftRadius: '24px',
                      borderBottomRightRadius: '24px',
                      ...(typeof mockThemeColor === 'string' && mockThemeColor.includes('gradient')
                        ? { background: mockThemeColor }
                        : { backgroundColor: mockThemeColor }),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span
                      className="text-lg font-semibold"
                      style={{ color: getReadableOnColor(mockThemeColor) }}
                    >
                      Build themes
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Theme Preview Section */}
        <div className="w-full flex justify-center" style={{ marginTop: 0 }}>
          <div style={{ position: 'relative', width: 1400, height: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <img
              src={process.env.PUBLIC_URL + '/ife-frame.svg'}
              alt="Mobile Frame"
              style={{ position: 'absolute', top: -40, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
            />
            <div style={{ position: 'relative', zIndex: 2, width: 1302, margin: '92px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
              <div className="fjb-fps-container" style={{ width: 1328, maxWidth: 1328, marginLeft: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: getBackgroundColor(mockThemeColor), borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, paddingTop: 80, paddingBottom: 40, marginTop: 4 }}>
                <div style={{ width: '100%', marginTop: -32, display: 'flex', flexDirection: 'column', gap: 28 }}>
                  <FlightJourneyBar origin={mockOrigin} destination={mockDestination} minutesLeft={minutesLeft} themeColor={mockThemeColor} isLandingPage={true} />
                  <FlightProgress 
                    landingIn={landingIn} 
                    maxFlightMinutes={maxFlightMinutes} 
                    minutesLeft={minutesLeft} 
                    onProgressChange={handleProgressChange} 
                    themeColor={mockThemeColor}
                    isPromptMode={false}
                    onPromptHover={() => {}}
                    onPromptClick={() => {}}
                    fpsPrompts={{}}
                    showMovingIcon={showMovingIcon}
                    onAnimationProgressChange={handleAnimationProgressChange}
                    onPromoCardLoadingChange={handlePromoCardLoadingChange}
                    onAnimationProgress={handleAnimationProgress}
                    onCruiseLabelShow={handleCruiseLabelShow}
                    onMiddleCardPromptClose={handleMiddleCardPromptClose}
                    onThemeColorChange={handleThemeColorChange}
                  />
                </div>
              </div>
              <Component3Cards 
                themeColor={mockThemeColor} 
                routes={mockRoutes}
                isPromptMode={cruiseLabelShown && !middleCardPromptClosed}
                onPromptHover={() => {}}
                onPromptClick={handleMiddleCardPromptClick}
                promptStates={{ 'promo-card-0': false }} // Don't show promo card prompt bubble until FlightProgress controls it
                animationProgress={animationProgress}
                cruiseLabelShown={cruiseLabelShown}
                middleCardPromptClosed={middleCardPromptClosed}
              />
              
              {/* Debug Info */}
              {console.log('=== COMPONENT3CARDS PROPS ===', {
                cruiseLabelShown,
                middleCardPromptClosed,
                isPromptMode: cruiseLabelShown && !middleCardPromptClosed,
                showMiddleCardPrompt,
                showMovingIcon
              })}
              
              {/* Recommended for you section */}
              <div
                className="flex flex-col items-start"
                style={{ width: '1302px', gap: '24px' }}
              >
                <p className="block text-left text-black font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
                  Recommended for you
                </p>
                
                {/* 4 Recommended Tiles */}
                <div
                  className="grid grid-cols-4 gap-6"
                  style={{ width: '100%' }}
                >
                  {recommendedTiles.map((tile) => (
                    <div
                      key={tile.id}
                      draggable
                      className="bg-black overflow-clip relative shrink-0 flex items-center justify-center cursor-move hover:opacity-80 transition-opacity"
                      style={{ 
                        width: '100%', 
                        height: '184px',
                        background: tile.color,
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        borderBottomLeftRadius: '0px',
                        borderBottomRightRadius: '0px',
                        opacity: draggedTile === tile.id ? 0.5 : 1
                      }}
                      onDragStart={(e) => handleDragStart(e, tile.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, tile.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="text-white text-sm font-medium">Tile {tile.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Middle Card Prompt Bubble */}
      {showMiddleCardPrompt && (
        <PromptBubble
          isVisible={showMiddleCardPrompt}
          position={middleCardPromptPosition}
          elementType="promo-card"
          elementData={{ cardIndex: 1, cardType: 'middle' }}
          onClose={handleMiddleCardPromptBubbleClose}
          onSubmit={handleMiddleCardPromptSubmit}
          themeColor={mockThemeColor}
          existingText=""
          positionKey="middle-card-landing"
          fpsPrompts={{}}
        />
      )}

      {/* FJB Prompt Bubble */}
      {console.log('=== RENDERING FJB PROMPT BUBBLE ===', { showFJBPrompt, fJBPromptPosition })}
      {showFJBPrompt && (
        <PromptBubble
          isVisible={showFJBPrompt}
          position={fJBPromptPosition}
          elementType="flight-journey-bar"
          elementData={{ themeColor: mockThemeColor }}
          onClose={handleFJBPromptBubbleClose}
          onSubmit={handleFJBPromptSubmit}
          themeColor={mockThemeColor}
          existingText=""
          positionKey="fjb-landing"
          fpsPrompts={{}}
        />
      )}
    </div>
  );
} 