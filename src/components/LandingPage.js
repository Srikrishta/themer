import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getReadableOnColor } from '../utils/color';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';
import PromptBubble from './PromptBubble';

// Helper function to generate AI images for content cards
const generateAIImageSync = (description) => {
  console.log('=== GENERATING AI IMAGE FOR CONTENT CARD (LANDING) ===', { description });
  
  // Detect different categories and enhance accordingly
  const isMovie = /\b(movie|film|cinema|theater|dvd|streaming|entertainment|crocodile|dundee)\b/i.test(description);
  const isGuide = /\b(guide|travel|tour|destination|city|country|vacation|trip)\b/i.test(description);
  const isGame = /\b(game|gaming|play|console|video|poster|arcade)\b/i.test(description);
  const isPodcast = /\b(podcast|audio|radio|broadcast|talk|show)\b/i.test(description);
  
  let enhancedPrompt;
  
  if (isMovie) {
    enhancedPrompt = `high quality movie poster or cinema photography of ${description}, cinematic lighting, professional movie poster style, 4k, photorealistic`;
  } else if (isGuide) {
    enhancedPrompt = `beautiful travel photography of ${description}, scenic view, tourist destination, professional travel photography, 4k, high quality`;
  } else if (isGame) {
    enhancedPrompt = `modern gaming photography of ${description}, video game poster style, digital art, gaming aesthetic, 4k, professional quality`;
  } else if (isPodcast) {
    enhancedPrompt = `professional podcast studio photography of ${description}, audio equipment, modern podcast setup, clean background, 4k, photorealistic`;
  } else {
    // Generic enhancement for any other content
    enhancedPrompt = `high quality professional photography of ${description}, beautiful composition, excellent lighting, vibrant colors, 4k, photorealistic, detailed`;
  }
  
  // Use Pollinations AI API with deterministic seed for consistent generation
  const seed = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=416&height=200&seed=${seed}&model=flux&enhance=true&nologo=true`;
  
  console.log('=== GENERATING AI IMAGE FOR CONTENT CARD (LANDING) ===', {
    originalDescription: description,
    category: isMovie ? 'movie' : isGuide ? 'guide' : isGame ? 'game' : isPodcast ? 'podcast' : 'generic',
    enhancedPrompt,
    aiImageUrl,
    seed
  });
  
  return aiImageUrl;
};

// Helper function to get Unsplash fallback for content cards
const getUnsplashFallback = (description) => {
  console.log('=== GETTING UNSPLASH FALLBACK FOR CONTENT CARD (LANDING) ===', { description });
  
  // Keyword-based mappings for content cards
  const keywordMappings = {
    // Movies
    'movie': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    'crocodile': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    'dundee': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    // Travel guides
    'guide': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    'travel': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    // Games
    'game': 'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format',
    'gaming': 'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format',
    // Podcasts
    'podcast': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'audio': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format'
  };
  
  // Check for direct keyword matches first
  const lowerDesc = description.toLowerCase();
  for (const [keyword, url] of Object.entries(keywordMappings)) {
    if (lowerDesc.includes(keyword)) {
      console.log('=== USING KEYWORD-BASED UNSPLASH IMAGE ===', { keyword, url });
      return url;
    }
  }
  
  // If no keyword match, use hash-based selection for consistency
  console.log('=== USING HASH-BASED UNSPLASH FALLBACK ===', { description });
  
  const fallbackImages = [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format', // movie
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format', // guide
    'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format', // game
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format'  // podcast
  ];
  
  // Create hash from description for consistent selection
  let hash = 0;
  for (let i = 0; i < description.length; i++) {
    const char = description.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % fallbackImages.length;
  const selectedUrl = fallbackImages[index];
  
  console.log('=== HASH-BASED SELECTION ===', { 
    description, 
    hash, 
    index, 
    selectedUrl,
    totalImages: fallbackImages.length 
  });
  
  return selectedUrl;
};

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
  const [contentCardImages, setContentCardImages] = useState({});
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
    
    timerRef.current = setTimeout(() => {
      setMinutesLeft((m) => (m > 0 ? m - 1 : 0));
    }, 60000); // Update every minute (same as Dashboard)
    return () => clearTimeout(timerRef.current);
  }, [minutesLeft, dragging, showMovingIcon]);

  // Handle animation progress changes
  const handleAnimationProgressChange = (newMinutes) => {
    setMinutesLeft(newMinutes);
  };

  // Handle animation progress from FlightProgress
  const handleAnimationProgress = (progress) => {
    setAnimationProgress(progress);
  };

  // Handle Cruise label show event
  const handleCruiseLabelShow = (isShown) => {
    setCruiseLabelShown(isShown);
  };

  const handleMiddleCardPromptClose = (isClosed) => {
    setMiddleCardPromptClosed(isClosed);
  };

  const handleMiddleCardPromptClick = (elementType, elementData, position) => {
    console.log('=== MIDDLE CARD PROMPT CLICK ===', {
      elementType, 
      elementData, 
      position,
      showMiddleCardPrompt,
      middleCardPromptClosed
    });
    setMiddleCardPromptPosition(position);
    setShowMiddleCardPrompt(true);
    console.log('=== UPDATED MIDDLE CARD STATE ===', {
      newPosition: position, 
      showPrompt: true 
    });
  };

  const handleMiddleCardPromptBubbleClose = () => {
    setShowMiddleCardPrompt(false);
    setMiddleCardPromptClosed(true);
    handleMiddleCardPromptClose(true);
  };

  const handleFJBPromptBubbleClose = () => {
    setShowFJBPrompt(false);
  };

  const handleFJBPromptSubmit = (promptText, elementType, elementData, positionKey) => {
    setShowFJBPrompt(false);
    
    // Update theme color to gradient green for FJB landing page
    if (positionKey === 'fjb-landing') {
      
      // Set the theme color directly to the gradient and enable gradient mode
      const gradientColor = 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)';
      setCurrentThemeColor(gradientColor);
      setIsGradientMode(true);
      
      // Generate AI images for content cards when color is saved
      const contentCardTitles = [
        'Crocodile Dundee Movie',
        'Get Your Guide', 
        'Game Poster',
        'A Podcast'
      ];
      
      const newContentCardImages = {};
      contentCardTitles.forEach((title, index) => {
        try {
          const aiImageUrl = generateAIImageSync(title);
          newContentCardImages[index + 1] = aiImageUrl; // Use tile.id (1-4) as key
        } catch (error) {
          console.error('=== AI IMAGE GENERATION FAILED FOR CONTENT CARD (LANDING) ===', { error, cardTitle: title });
          // Fallback to Unsplash image
          const fallbackUrl = getUnsplashFallback(title);
          newContentCardImages[index + 1] = fallbackUrl;
        }
      });
      
      setContentCardImages(newContentCardImages);
      
      console.log('🎯 Generated AI images for content cards (Landing):', {
        contentCardImages: newContentCardImages
      });
    } else {
    }
  };

  const handleMiddleCardPromptSubmit = (promptText, elementType, elementData, positionKey) => {
    setShowMiddleCardPrompt(false);
    setMiddleCardPromptClosed(true);
    handleMiddleCardPromptClose(true);
    
    // Trigger FJB prompt bubble after middle card is complete
    setTimeout(() => {
      const fjbElement = document.querySelector('[data-name="flight journey bar"]');
      if (fjbElement) {
        const rect = fjbElement.getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2 + 20, // Center + offset for plus button
          y: rect.top + rect.height / 2
        };
        setFJBPromptPosition(position);
        setShowFJBPrompt(true);
      } else {
        console.error('FJB element not found');
      }
    }, 1000); // 1 second delay after middle card prompt closes
  };

  const handleThemeColorChange = (newColor) => {
    // Update the theme color when changed from the color picker
    
    // Check if it's a gradient
    const isGradient = newColor.includes('gradient');
    setIsGradientMode(isGradient);
    setCurrentThemeColor(newColor);
    
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
  
  // Helper function to create lighter version of theme color (matching Component3Cards)
  const getLightThemeColor = (opacity = 0.1) => {
    if (mockThemeColor.startsWith('#')) {
      // Convert hex to rgba with opacity
      const hex = mockThemeColor.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return `rgba(255,255,255,${opacity})`; // fallback
  };
  
  // Debug theme color changes
  useEffect(() => {
    if (mockThemeColor.includes('gradient')) {
      console.log('=== GRADIENT THEME DEBUG ===', {
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
              <div className="fjb-fps-container" style={{ width: 1328, maxWidth: 1328, marginLeft: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: mockThemeColor, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, paddingTop: 80, paddingBottom: 40, marginTop: 4, position: 'relative' }}>
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
              {console.log('=== COMPONENT RENDER DEBUG ===', {
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
                  {recommendedTiles.map((tile) => {
                    const cardImage = contentCardImages[tile.id];
                    return (
                      <div
                        key={tile.id}
                        draggable
                        className="bg-black overflow-clip relative shrink-0 flex items-center justify-center cursor-move hover:opacity-80 transition-opacity group"
                        style={{ 
                          width: '100%', 
                          height: '184px',
                          background: cardImage ? `url(${cardImage})` : getLightThemeColor(0.1),
                          backgroundSize: cardImage ? 'cover' : 'auto',
                          backgroundPosition: cardImage ? 'center' : 'auto',
                          backgroundRepeat: cardImage ? 'no-repeat' : 'auto',
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
                        {/* Dark overlay for background images */}
                        {cardImage && (
                          <div 
                            className="absolute inset-0 bg-black bg-opacity-30 rounded-t-lg"
                            style={{
                              borderTopLeftRadius: '8px',
                              borderTopRightRadius: '8px'
                            }}
                          />
                        )}
                        
                        {/* Bottom rectangle with text field - same style as promo cards */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 z-10 p-2"
                          style={{ 
                            backgroundColor: getReadableOnColor(mockThemeColor),
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            borderTopLeftRadius: '0px',
                            borderTopRightRadius: '0px',
                            borderBottomLeftRadius: '0px',
                            borderBottomRightRadius: '0px'
                          }}
                        >
                          <p className="block font-semibold text-center uppercase" 
                             style={{ 
                               fontSize: '12px', 
                               lineHeight: '16px', 
                               margin: 0,
                               ...(mockThemeColor.includes('gradient') 
                                 ? { background: mockThemeColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                                 : { color: mockThemeColor }
                               )
                             }}>
                            Add content
                          </p>
                        </div>
                      
                      {/* Edit button for content cards */}
                      <button
                        className="absolute top-2 right-2 px-3 py-1 text-sm font-medium text-white transition-colors opacity-0 group-hover:opacity-100"
                        style={{ 
                          backgroundColor: mockThemeColor,
                          borderTopLeftRadius: '0px', 
                          borderTopRightRadius: '9999px', 
                          borderBottomLeftRadius: '9999px', 
                          borderBottomRightRadius: '9999px' 
                        }}
                        onMouseEnter={(e) => {
                          // Create a slightly darker version of the theme color for hover
                          if (mockThemeColor.startsWith('#')) {
                            const hex = mockThemeColor.slice(1);
                            const r = parseInt(hex.substr(0, 2), 16);
                            const g = parseInt(hex.substr(2, 2), 16);
                            const b = parseInt(hex.substr(4, 2), 16);
                            const darkerColor = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
                            e.target.style.backgroundColor = darkerColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = mockThemeColor;
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Edit content card clicked', tile.id);
                        }}
                      >
                        Edit content card
                      </button>
                    </div>
                  );
                })}
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