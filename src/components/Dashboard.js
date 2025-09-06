import { useState, useRef, useEffect, useCallback } from 'react';
import { getReadableOnColor, getTextColorForImage } from '../utils/color';
import { getFestivalsForFlightSegment, formatFestivalChips, getContentCardContent, shouldUseFestivalContent, getAllContentCardContent, getPrimaryFestival } from '../utils/festivalUtils';
import { getFestivalContent } from '../data/festivalContent.js';
import ThemeCreator from './ThemeCreator';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';
import PlusIconCursor from './PlusIconCursor';
import PromptBubble from './PromptBubble';
import MousePointer from './MousePointer';
import { useLocation } from 'react-router-dom';
import { mapThemeChipToAnimation } from '../utils/themeAnimationMapper';
import { PhotoIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';



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

// Helper function to generate AI images for content cards and promo cards
const generateAIImageSync = (description) => {
  console.log('=== GENERATING AI IMAGE ===', { description });
  
  // Detect different categories and enhance accordingly
  const isMovie = /\b(movie|film|cinema|theater|dvd|streaming|entertainment|crocodile|dundee)\b/i.test(description);
  const isGuide = /\b(guide|travel|tour|destination|city|country|vacation|trip)\b/i.test(description);
  const isGame = /\b(game|gaming|play|console|video|poster|arcade)\b/i.test(description);
  const isPodcast = /\b(podcast|audio|radio|broadcast|talk|show)\b/i.test(description);
  const isDrink = /\b(drink|beverage|welcome|cocktail|wine|beer|juice|coffee|tea|soda|water)\b/i.test(description);
  const isHome = /\b(home|settle|comfort|relax|cozy|warm|comfortable|rest|peaceful|calm|tranquil|domestic)\b/i.test(description);
  const isDevice = /\b(phone|device|mobile|smartphone|tablet|computer|laptop|tech|technology|connect)\b/i.test(description);
  
  let enhancedPrompt;
  
  if (isMovie) {
    enhancedPrompt = `high quality movie poster or cinema photography of ${description}, cinematic lighting, professional movie poster style, 4k, photorealistic`;
  } else if (isGuide) {
    enhancedPrompt = `beautiful travel photography of ${description}, scenic view, tourist destination, professional travel photography, 4k, high quality`;
  } else if (isGame) {
    enhancedPrompt = `modern gaming photography of ${description}, video game poster style, digital art, gaming aesthetic, 4k, professional quality`;
  } else if (isPodcast) {
    enhancedPrompt = `professional podcast studio photography of ${description}, audio equipment, modern podcast setup, clean background, 4k, photorealistic`;
  } else if (isDrink) {
    enhancedPrompt = `high quality professional beverage photography of ${description}, elegant glassware, beautiful presentation, restaurant style, soft lighting, 4k, photorealistic, appetizing drink`;
  } else if (isHome) {
    enhancedPrompt = `cozy home lifestyle photography of ${description}, warm lighting, comfortable atmosphere, domestic setting, inviting, peaceful, 4k, photorealistic, home comfort`;
  } else if (isDevice) {
    enhancedPrompt = `modern technology photography of ${description}, sleek design, professional lighting, futuristic, clean background, 4k, high quality`;
  } else {
    // Generic enhancement for any other content
    enhancedPrompt = `high quality professional photography of ${description}, beautiful composition, excellent lighting, vibrant colors, 4k, photorealistic, detailed`;
  }
  
  // Use Pollinations AI API with deterministic seed for consistent generation
  const seed = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=416&height=200&seed=${seed}&model=flux&enhance=true&nologo=true`;
  
  console.log('=== GENERATING AI IMAGE FOR CONTENT CARD ===', {
    originalDescription: description,
    category: isMovie ? 'movie' : isGuide ? 'guide' : isGame ? 'game' : isPodcast ? 'podcast' : 'generic',
    enhancedPrompt,
    aiImageUrl,
    seed
  });
  
  return aiImageUrl;
};

// Helper function to get Unsplash fallback for content cards and promo cards
const getUnsplashFallback = (description) => {
  console.log('=== GETTING UNSPLASH FALLBACK ===', { description });
  
  // Keyword-based mappings for content cards and promo cards
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
    'audio': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    // Promo card categories
    'drink': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=416&h=200&fit=crop&crop=center&auto=format',
    'welcome': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=416&h=200&fit=crop&crop=center&auto=format',
    'settle': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=416&h=200&fit=crop&crop=center&auto=format',
    'home': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=416&h=200&fit=crop&crop=center&auto=format',
    'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'device': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'aircraft': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format'
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
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format', // podcast
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=416&h=200&fit=crop&crop=center&auto=format', // drink
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=416&h=200&fit=crop&crop=center&auto=format', // home
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format'  // aircraft
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



function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
}

function FrameContent({ origin, destination, minutesLeft, landingIn, maxFlightMinutes, handleProgressChange, themeColor, routes, isPromptMode, onPromptHover, onPromptClick, fpsPrompts, isThemeBuildStarted, selectedLogo, flightsGenerated, onAnimationProgress, onFlightPhaseSelect, selectedFlightPhase, promoCardContents, cardOrder, onCardReorder, contentCardOrder, onContentCardReorder, onContentCardHover, colorPromptClosedWithoutSave, colorPromptSaved, recommendedContentCards, contentCardImages, contentCardTextColors, setContentCardTextColors, getCurrentRouteKey, isModifyClicked, isCurrentRouteModified, handleContentCardHover, selectedDates = [] }) {
  
  // Drag and drop state for content cards
  const [draggedContentCardIndex, setDraggedContentCardIndex] = useState(null);
  const [dragOverContentIndex, setDragOverContentIndex] = useState(null);

  // Helper function to get route-specific content cards
  const getRouteContentCards = () => {
    // Since we're inside FrameContent, we need to access the recommendedContentCards prop
    if (!recommendedContentCards || typeof recommendedContentCards === 'string') {
      return [
        { id: 1, title: 'Add content', type: 'default' },
        { id: 2, title: 'Add content', type: 'default' },
        { id: 3, title: 'Add content', type: 'default' },
        { id: 4, title: 'Add content', type: 'default' }
      ];
    }
    return recommendedContentCards;
  };
  
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

  // Helper function to get content text based on flight phase with festival support
  const getContentText = (cardIndex) => {
    const routeContentCards = getRouteContentCards();
    console.log('🎯 getContentText called with:', { 
      cardIndex, 
      routeContentCards, 
      selectedFlightPhase,
      contentCard: routeContentCards && routeContentCards[cardIndex]
    });
    
    // If we have recommended content cards, use their titles
    const contentCard = routeContentCards && routeContentCards[cardIndex];
    if (contentCard && contentCard.title) {
      console.log('🎯 Using content card title:', contentCard.title);
      return contentCard.title;
    }
    
    // Check if we should use festival content
    const useFestivalContent = shouldUseFestivalContent(routes[0], selectedDates);
    
    if (useFestivalContent && selectedFlightPhase) {
      const festivalContent = getContentCardContent(routes[0], selectedDates, selectedFlightPhase, cardIndex);
      if (festivalContent && festivalContent.text) {
        console.log('🎯 Using festival content text:', festivalContent.text);
        return festivalContent.text;
      }
    }
    
    // Fallback to flight phase based text
    const fallbackText = selectedFlightPhase 
      ? `Add content for ${selectedFlightPhase.charAt(0).toUpperCase() + selectedFlightPhase.slice(1)}`
      : "Add content";
    console.log('🎯 Using fallback text:', fallbackText);
    return fallbackText;
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

  // Helper function to detect text color for content card image
  const detectTextColorForContentCard = useCallback(async (imageUrl, cardIndex) => {
    if (!imageUrl) return;
    
    const routeKey = getCurrentRouteKey();
    if (!routeKey) return;
    
    try {
      const textColor = await getTextColorForImage(imageUrl);
      setContentCardTextColors(prev => ({
        ...prev,
        [routeKey]: {
          ...prev[routeKey],
          [cardIndex]: textColor
        }
      }));
      console.log('=== DETECTED TEXT COLOR FOR CONTENT CARD ===', { routeKey, cardIndex, imageUrl, textColor });
    } catch (error) {
      console.error('Error detecting text color for content card:', error);
      // Default to white on error
      setContentCardTextColors(prev => ({
        ...prev,
        [routeKey]: {
          ...prev[routeKey],
          [cardIndex]: 'white'
        }
      }));
    }
  }, []);

  // Helper function to get background color for cards (handles both solid and gradient)
  const getCardBackgroundColor = (color) => {
    if (typeof color === 'string' && color.includes('gradient')) {
      // For gradients, use a light version of the first color in the gradient
      const hexMatch = color.match(/#([0-9a-fA-F]{6})/);
      if (hexMatch) {
        const hex = hexMatch[1];
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'rgba(255,255,255,0.1)';
    } else if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'rgba(255,255,255,0.1)';
  };

  // Helper function to render a single content card
  const renderContentCard = (originalCardIndex, displayPosition) => {
    const isDragging = draggedContentCardIndex === displayPosition;
    const isDragOver = dragOverContentIndex === displayPosition;
    
    // Get content card image for this route and card index
    const routeKey = getCurrentRouteKey();
    const cardImage = contentCardImages[routeKey]?.[originalCardIndex];
    
    // Detect text color for the background image
    if (cardImage) {
      detectTextColorForContentCard(cardImage, originalCardIndex);
    }
    
    const cardStyle = {
      width: '100%',
      height: '184px',
      background: cardImage ? `url(${cardImage})` : getCardBackgroundColor(themeColor),
      backgroundSize: cardImage ? 'cover' : 'auto',
      backgroundPosition: cardImage ? 'center' : 'auto',
      backgroundRepeat: cardImage ? 'no-repeat' : 'auto',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottomLeftRadius: '0px',
      borderBottomRightRadius: '0px',
      transform: isDragging ? 'rotate(5deg)' : 'none',
      border: 'none',
      opacity: isDragging ? 0.8 : 1,
      cursor: 'grab',
      transition: 'transform 0.2s ease, opacity 0.2s ease'
    };

    return (
      <div
        key={`content-card-${originalCardIndex}-${displayPosition}`}
        draggable
        className="overflow-clip relative shrink-0 flex items-center justify-center backdrop-blur-[10px] backdrop-filter group"
        style={cardStyle}
        onDragStart={(e) => handleContentCardDragStart(e, displayPosition)}
        onDragEnd={handleContentCardDragEnd}
        onDragOver={(e) => handleContentCardDragOver(e, displayPosition)}
        onDragEnter={(e) => handleContentCardDragEnter(e, displayPosition)}
        onDragLeave={handleContentCardDragLeave}
        onDrop={(e) => handleContentCardDrop(e, displayPosition)}
        onMouseEnter={(e) => {
          if (isPromptMode && onPromptHover) {
            onPromptHover(true, 'content-card', { cardIndex: originalCardIndex, cardType: 'content-card' }, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseMove={(e) => {
          if (isPromptMode && onPromptHover) {
            onPromptHover(true, 'content-card', { cardIndex: originalCardIndex, cardType: 'content-card' }, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseLeave={(e) => {
          if (isPromptMode && onPromptHover) {
            onPromptHover(false, 'content-card', { cardIndex: originalCardIndex, cardType: 'content-card' }, { x: e.clientX, y: e.clientY });
          }
        }}
        onClick={(e) => {
          if (isPromptMode && onPromptClick) {
            e.stopPropagation();
            onPromptClick('content-card', { cardIndex: originalCardIndex, cardType: 'content-card' }, { x: e.clientX, y: e.clientY });
          }
        }}
      >
        {/* Drag handle */}
        <div className="absolute top-2 left-2 z-20 cursor-grab">
          <div className="w-6 h-6 bg-white bg-opacity-80 rounded flex items-center justify-center">
            <div className="flex flex-col gap-0.5">
              <div className="w-3 h-0.5 bg-gray-600"></div>
              <div className="w-3 h-0.5 bg-gray-600"></div>
              <div className="w-3 h-0.5 bg-gray-600"></div>
            </div>
          </div>
        </div>
        
        {getAnimatedBorderOverlay()}
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
        
        {/* Bottom rectangle with text field */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-10 p-2 backdrop-blur-md backdrop-filter shadow-none"
          style={{ 
            backgroundColor: getReadableOnColor(themeColor) + 'CC',
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
               ...(themeColor.includes('gradient') 
                 ? { background: themeColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                 : { color: themeColor }
               )
             }}>
            {getContentText(originalCardIndex)}
          </p>
        </div>
        

      </div>
    );
  };

  return (
    <>
      <style>{gradientAnimationCSS}</style>
      <div style={{ position: 'relative', zIndex: 10001, width: 1302, margin: '92px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      <div
        className="fjb-fps-container"
        style={{ width: 1336, maxWidth: 1336, marginLeft: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: themeColor, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, paddingTop: 80, paddingBottom: 40, marginTop: 4, position: 'relative', zIndex: 1 }}
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
            onPromptClick('flight-journey-bar', { themeColor, origin, destination }, { x: e.clientX, y: e.clientY });
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
        origin={origin}
        destination={destination}
        routes={routes}
        isPromptMode={isPromptMode}
        onPromptHover={onPromptHover}
        onPromptClick={onPromptClick}
        isThemeBuildStarted={isThemeBuildStarted}
        selectedFlightPhase={selectedFlightPhase}
        promoCardContents={promoCardContents}
        cardOrder={cardOrder}
        onCardReorder={onCardReorder}
        colorPromptClosedWithoutSave={colorPromptClosedWithoutSave}
        colorPromptSaved={colorPromptSaved}
        currentRouteKey={getCurrentRouteKey()}
        isModifyClicked={isCurrentRouteModified()}
        selectedDates={selectedDates}
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
        <div className="grid grid-cols-4 gap-6" style={{ width: '100%' }} key={`content-cards-${JSON.stringify(getRouteContentCards())}`}>
          {!isThemeBuildStarted ? (
            // Show white placeholders when no theme is built
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
                  backgroundColor: getCardBackgroundColor(themeColor)
                }}
              >
                <span style={{ color: 'black', fontSize: '14px' }}>Placeholder 1 (isThemeBuildStarted: {isThemeBuildStarted.toString()})</span>
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
                  backgroundColor: getCardBackgroundColor(themeColor)
                }}
              >
                <span style={{ color: 'black', fontSize: '14px' }}>Placeholder 2</span>
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
                  backgroundColor: getCardBackgroundColor(themeColor)
                }}
              >
                <span style={{ color: 'black', fontSize: '14px' }}>Placeholder 3</span>
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
                  backgroundColor: getCardBackgroundColor(themeColor)
                }}
              >
                <span style={{ color: 'black', fontSize: '14px' }}>Placeholder 4</span>
              </div>
            </>
          ) : (
            // Show themed content when theme is built and routes are available - now with drag-and-drop
            contentCardOrder.map((originalCardIndex, displayPosition) => {
              console.log('🎯 Rendering content card:', { 
                originalCardIndex, 
                displayPosition, 
                contentCardOrder,
                routeContentCards: getRouteContentCards() 
              });
              return renderContentCard(originalCardIndex, displayPosition);
            })
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
  // NEW: State to track fixed hover button position for FJB
  const [fjbFixedPosition, setFjbFixedPosition] = useState(null);
  // NEW: State to track fixed hover tip positions for promo cards and content cards
  const [pcFixedPosition, setPcFixedPosition] = useState(null);
  const [ccFixedPosition, setCcFixedPosition] = useState(null);

  // NEW: Per-flight-route theme tracking
  const [flightThemes, setFlightThemes] = useState({}); // { [flightKey]: themeColor }
  const [currentFlightKey, setCurrentFlightKey] = useState(null); // Current flight route key
  
  // NEW: Per-flight-route progress tracking
  const [flightRouteProgress, setFlightRouteProgress] = useState({}); // { [flightKey]: progressPercentage }

  
  // NEW: Prompt mode state
  const [isPromptMode, setIsPromptMode] = useState(false);
  const [modifiedRoutes, setModifiedRoutes] = useState({});
  const [activeSegmentId, setActiveSegmentId] = useState(null); // Track which segment is in prompt mode
  const [routePromptBubbles, setRoutePromptBubbles] = useState({}); // { routeKey: { x, y, elementType, elementData } }
  const [colorPromptClosedWithoutSave, setColorPromptClosedWithoutSave] = useState(false); // Track if color PB was closed without saving
  const [colorPromptSaved, setColorPromptSaved] = useState(false); // Track if color PB was saved
  const [selectedLogo, setSelectedLogo] = useState(null); // { id, src }
  const [ifeFrameThemeColor, setIfeFrameThemeColor] = useState('#1E1E1E'); // Preserve airline theme for IFE frame
  const [showPlusIcon, setShowPlusIcon] = useState(false);
  const [ifeFrameHover, setIfeFrameHover] = useState({ isHovering: false, x: 0, y: 0 }); // Track IFE frame hover state
  const [contentCardHover, setContentCardHover] = useState({ isHovering: false, x: 0, y: 0 }); // Track content card hover state
  
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
  // Route-specific promo card contents: { [routeKey]: { [cardIndex]: content } }
  const [promoCardContents, setPromoCardContents] = useState({});
  // NEW: Track the order of promo cards for drag-drop functionality
  const [cardOrder, setCardOrder] = useState([0, 1, 2]); // Default order: left, middle, right
  // NEW: Track the order of content cards for drag-drop functionality
  const [contentCardOrder, setContentCardOrder] = useState([0, 1, 2, 3]); // Default order: 1, 2, 3, 4
  // NEW: Track the currently selected flight segment for FJB
  const [selectedFlightSegment, setSelectedFlightSegment] = useState(null);
  // NEW: Track selected dates for festival chips
  const [selectedDates, setSelectedDates] = useState([]);
  // NEW: Track flight card progress percentages (flight card index -> progress percentage)
  const [flightCardProgress, setFlightCardProgress] = useState({});
  // Route-specific recommended content cards: { [routeKey]: contentCards }
  const [recommendedContentCards, setRecommendedContentCards] = useState({});
  // Route-specific content card images: { [routeKey]: { [cardIndex]: imageUrl } }
  const [contentCardImages, setContentCardImages] = useState({});
  // Route-specific text colors for content cards: { [routeKey]: { [cardIndex]: color } }
  const [contentCardTextColors, setContentCardTextColors] = useState({});
  // Modified chip colors for persistence across prompt bubble reopenings: { [chipKey]: color }
  const [modifiedChipColors, setModifiedChipColors] = useState({});
  // Hover hint bubble for FPS ("Select flight phase")
  const [fpsHoverTip, setFpsHoverTip] = useState({ visible: false, x: 0, y: 0, progress: 0 });
  // Hover hint bubble for Promo Cards ("Edit promo card")
  const [pcHoverTip, setPcHoverTip] = useState({ visible: false, x: 0, y: 0, elementData: null });
  // Add state for content card hover tip
  const [ccHoverTip, setCCHoverTip] = useState({ visible: false, x: 0, y: 0, elementData: null });

  // Callback for remix image loading
  const handleRemixImageLoaded = (cardIndex) => {
    console.log('=== DASHBOARD REMIX CALLBACK CALLED ===', { cardIndex });
    // Clear loading state for the specific card in the current route
    const routeKey = getCurrentRouteKey();
    if (routeKey) {
      setPromoCardContents(prev => ({
        ...prev,
        [routeKey]: {
          ...prev[routeKey],
          [cardIndex]: {
            ...prev[routeKey]?.[cardIndex],
            isLoading: false
          }
        }
      }));
    }
  };

  // Removed scroll-collapsed header behavior

  // Use selected flight segment if available, then selected segment, else default to full route
  const origin = selectedFlightSegment?.origin || selectedSegment?.origin || (routes.length > 0 ? routes[0] : null);
  const destination = selectedFlightSegment?.destination || selectedSegment?.destination || (routes.length > 1 ? routes[routes.length - 1] : null);

  // Helper function to generate flight key
  const getFlightKey = (origin, destination) => {
    if (!origin || !destination) return null;
    return `${origin.airport?.code || origin.airport?.city || 'unknown'}-${destination.airport?.code || destination.airport?.city || 'unknown'}`;
  };
  
  // Helper function to get current route key
  const getCurrentRouteKey = () => {
    return getFlightKey(origin, destination);
  };
  
  // Helper function to get route-specific promo card contents
  const getRoutePromoCardContents = () => {
    const routeKey = getCurrentRouteKey();
    if (!routeKey) return {};
    return promoCardContents[routeKey] || {};
  };
  
  // Helper function to set route-specific promo card contents
  const setRoutePromoCardContents = (cardIndex, content) => {
    const routeKey = getCurrentRouteKey();
    if (!routeKey) return;
    
    setPromoCardContents(prev => ({
      ...prev,
      [routeKey]: {
        ...prev[routeKey],
        [cardIndex]: content
      }
    }));
  };
  
  // Helper function to get route-specific content cards
  const getRouteContentCards = () => {
    const routeKey = getCurrentRouteKey();
    if (!routeKey) return [
      { id: 1, title: 'Add content', type: 'default' },
      { id: 2, title: 'Add content', type: 'default' },
      { id: 3, title: 'Add content', type: 'default' },
      { id: 4, title: 'Add content', type: 'default' }
    ];
    return recommendedContentCards[routeKey] || [
      { id: 1, title: 'Add content', type: 'default' },
      { id: 2, title: 'Add content', type: 'default' },
      { id: 3, title: 'Add content', type: 'default' },
      { id: 4, title: 'Add content', type: 'default' }
    ];
  };
  
  // Helper function to set route-specific content cards
  const setRouteContentCards = (contentCards) => {
    const routeKey = getCurrentRouteKey();
    if (!routeKey) return;
    
    setRecommendedContentCards(prev => ({
      ...prev,
      [routeKey]: contentCards
    }));
  };
  
  // Helper function to get current flight theme
  const getCurrentFlightTheme = () => {
    const flightKey = getFlightKey(origin, destination);
    if (!flightKey) return '#1E72AE'; // Default Discover blue
    
    // Return the theme for this specific flight, or default if none set
    return flightThemes[flightKey] || '#1E72AE';
  };

  // Helper function to create lighter version of theme color
  const getLightThemeColor = (opacity = 0.1) => {
    if (activeThemeColor.startsWith('#')) {
      // Convert hex to rgba with opacity
      const hex = activeThemeColor.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return 'rgba(255,255,255,0.1)';
  };

  // Helper function to get phase-specific content for promo cards
  const getPhaseSpecificContent = (cardIndex) => {
    if (!selectedFlightPhase) return null;
    
    const phaseContent = {
      'takeoff': [
        { text: "Enjoy your welcome drink", bgColor: getLightThemeColor() },
        { text: "Relax at your seat", bgColor: getLightThemeColor() },
        { text: "Connect your device", bgColor: getLightThemeColor() }
      ],
      'climb': [
        { text: "Order food", bgColor: getLightThemeColor() },
        { text: "Offers onboard", bgColor: getLightThemeColor() },
        { text: "Latest entertainment", bgColor: getLightThemeColor() }
      ],
      'cruise': [
        { text: "Popcorn with movie", bgColor: getLightThemeColor() },
        { text: "Buy gifts", bgColor: getLightThemeColor() },
        { text: "Latest entertainment", bgColor: getLightThemeColor() }
      ],
      'descent': [
        { text: "Buy guides at discont", bgColor: getLightThemeColor() },
        { text: "Buy gifts", bgColor: getLightThemeColor() },
        { text: "Save on your next flight", bgColor: getLightThemeColor() }
      ],
      'landing': [
        { text: "Buy guides at discont", bgColor: getLightThemeColor() },
        { text: "Buy gifts", bgColor: getLightThemeColor() },
        { text: "Save on your next flight", bgColor: getLightThemeColor() }
      ]
    };
    
    const content = phaseContent[selectedFlightPhase];
    return content && content[cardIndex] ? content[cardIndex] : null;
  };

  // Helper function to get phase-specific image keywords for AI generation
  const getPhaseSpecificImageKeyword = (cardIndex) => {
    if (!selectedFlightPhase) return null;
    
    const phaseImageKeywords = {
      'takeoff': [
        "welcome drink", // welcome drink
        "Relax in economy class in flight", // Relax in economy class in flight
        "phone in an aircraft" // phone in an aircraft
      ],
      'climb': [
        "meal", // meal
        "offers", // offers
        "movie" // movie
      ],
      'cruise': [
        "popcorn", // popcorn
        "gifts", // gifts
        "movie" // movie
      ],
      'descent': [
        "get your guide", // get your guide
        "gifts", // gifts
        "flight ticket offer" // flight ticket offer
      ],
      'landing': [
        "get your guide", // get your guide
        "gifts", // gifts
        "flight ticket offer" // flight ticket offer
      ]
    };
    
    const keywords = phaseImageKeywords[selectedFlightPhase];
    return keywords && keywords[cardIndex] ? keywords[cardIndex] : null;
  };
  
  // Helper function to get current flight progress
  const getCurrentFlightProgress = () => {
    const flightKey = getFlightKey(origin, destination);
    if (!flightKey) return 0; // Default 0% progress
    
    // Return the progress for this specific flight, or 0 if none set
    return flightRouteProgress[flightKey] || 0;
  };
  
  // Helper function to check if current route is modified
  const isCurrentRouteModified = () => {
    const routeKey = getCurrentRouteKey();
    if (!routeKey) return false;
    return modifiedRoutes[routeKey] || false;
  };
  
  // Helper function to mark current route as modified
  const markCurrentRouteAsModified = () => {
    const routeKey = getCurrentRouteKey();
    if (!routeKey) return;
    setModifiedRoutes(prev => ({
      ...prev,
      [routeKey]: true
    }));
  };
  
  // Helper function to get current route's prompt bubble
  const getCurrentRoutePromptBubble = () => {
    const routeKey = getCurrentRouteKey();
    if (!routeKey) return null;
    const bubble = routePromptBubbles[routeKey] || null;
    console.log('🎯 Getting prompt bubble for route:', { routeKey, bubble, allBubbles: routePromptBubbles });
    return bubble;
  };
  
  // Helper function to set current route's prompt bubble
  const setCurrentRoutePromptBubble = (bubbleData) => {
    const routeKey = getCurrentRouteKey();
    if (!routeKey) return;
    console.log('🎯 Setting prompt bubble for route:', { routeKey, bubbleData });
    setRoutePromptBubbles(prev => {
      const newState = {
        ...prev,
        [routeKey]: bubbleData
      };
      console.log('🎯 Updated route prompt bubbles:', newState);
      return newState;
    });
  };

  // Add debugging for when routePromptBubbles state changes
  useEffect(() => {
    console.log('🎯 routePromptBubbles state changed:', routePromptBubbles);
  }, [routePromptBubbles]);
  
  // Update current flight key when origin/destination changes
  useEffect(() => {
    const newFlightKey = getFlightKey(origin, destination);
    if (newFlightKey !== currentFlightKey) {
      setCurrentFlightKey(newFlightKey);
      console.log('🎯 Flight route changed:', { 
        from: currentFlightKey, 
        to: newFlightKey,
        availableThemes: Object.keys(flightThemes),
        availableProgress: Object.keys(flightRouteProgress),
        routePromptBubbles: routePromptBubbles
      });
    }
  }, [origin, destination, currentFlightKey, flightThemes, flightRouteProgress]);
  
  // Use the current flight's theme instead of global theme
  const activeThemeColor = getCurrentFlightTheme();

  // Compute contrasting border color for hover tip PBs (same logic as main PB)
  const isGradientTheme = typeof activeThemeColor === 'string' && activeThemeColor.includes('gradient');
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
    : (typeof activeThemeColor === 'string' && activeThemeColor.startsWith('#') && activeThemeColor.length === 7
        ? getLuminance(parseHex(activeThemeColor)) < 0.5
        : true);
  const hoverBorderColor = hoverUseLightText ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)';
  // Material-based readable on-color for text/icons over activeThemeColor
  const hoverOnColor = getReadableOnColor(activeThemeColor);

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
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isFlightContentSticky, setIsFlightContentSticky] = useState(false);
  const [darkContainerHeight, setDarkContainerHeight] = useState(0);

  // DEBUG: Track recommendedContentCards changes
  useEffect(() => {
    console.log('🎯 recommendedContentCards state changed:', recommendedContentCards);
  }, [recommendedContentCards]);

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
    console.log('=== HANDLE PROMPT HOVER ===', { isHovering, elementType, isPromptMode, colorPromptClosedWithoutSave });
    if (!isPromptMode) return;
    
    // If color prompt hasn't been saved, only allow flight-journey-bar hovers
    if (!colorPromptSaved && elementType !== 'flight-journey-bar') {
      console.log('🎯 Prompt hover ignored - color prompt not saved, only FJB allowed');
      return;
    }
    
    // Prevent promo card hover from showing until color has been saved at least once
    if (elementType === 'promo-card' && !colorPromptSaved && colorPromptClosedWithoutSave) {
      console.log('=== BLOCKING PROMO CARD HOVER - COLOR NEVER SAVED ===');
      return;
    }
    
    // For FJB: do NOT show the icon-only plus; show hover bubble with "+ add theme"
    if (elementType === 'flight-journey-bar') {
      if (!getCurrentRoutePromptBubble()) {
        // Avoid flicker by only updating when moved enough pixels
        setShowPlusIcon(false);
        setFjbHoverTip(prev => {
          if (!isHovering) return { visible: false, x: 0, y: 0 };
          
          // If we have a fixed position, use it instead of following mouse
          // The fixed position is already the hover button position (50px above click)
          const targetPosition = fjbFixedPosition || position;
          
          const dx = Math.abs(prev.x - targetPosition.x);
          const dy = Math.abs(prev.y - targetPosition.y);
          if (!prev.visible || dx > 4 || dy > 4) {
            return { visible: true, x: targetPosition.x, y: targetPosition.y };
          }
          return prev;
        });
      } else {
        // When prompt bubble is open, keep hover tip visible at fixed position
        if (fjbFixedPosition) {
          setFjbHoverTip({ visible: true, x: fjbFixedPosition.x, y: fjbFixedPosition.y });
        }
      }
      return;
    }
    if (elementType === 'flight-icon') {
      if (!getCurrentRoutePromptBubble()) {
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
      // Don't show promo card hover tips if there's a fixed flight journey bar hover tip
      if (fjbFixedPosition) {
        setPcHoverTip({ visible: false, x: 0, y: 0, elementData: null });
        return;
      }
      
      if (!getCurrentRoutePromptBubble()) {
        setShowPlusIcon(false);
        setPcHoverTip(prev => {
          if (!isHovering) return { visible: false, x: 0, y: 0, elementData: null };
          
          // If we have a fixed position, use it instead of following mouse
          const targetPosition = pcFixedPosition || position;
          
          const dx = Math.abs(prev.x - targetPosition.x);
          const dy = Math.abs(prev.y - targetPosition.y);
          const changed = !prev.visible || dx > 4 || dy > 4;
          if (changed) return { visible: true, x: targetPosition.x, y: targetPosition.y, elementData };
          return prev;
        });
      } else {
        // When prompt bubble is open, keep hover tip visible at fixed position
        if (pcFixedPosition) {
          setPcHoverTip({ visible: true, x: pcFixedPosition.x, y: pcFixedPosition.y - 2, elementData });
        }
      }
      return;
    }

    if (elementType === 'content-card') {
      // Don't show content card hover tips if there's a fixed flight journey bar hover tip
      if (fjbFixedPosition) {
        setCCHoverTip({ visible: false, x: 0, y: 0, elementData: null });
        return;
      }
      
      if (!getCurrentRoutePromptBubble()) {
        setShowPlusIcon(false);
        setCCHoverTip(prev => {
          if (!isHovering) return { visible: false, x: 0, y: 0, elementData: null };
          
          // If we have a fixed position, use it instead of following mouse
          const targetPosition = ccFixedPosition || position;
          
          const dx = Math.abs(prev.x - targetPosition.x);
          const dy = Math.abs(prev.y - targetPosition.y);
          const changed = !prev.visible || dx > 4 || dy > 4;
          if (changed) return { visible: true, x: targetPosition.x, y: targetPosition.y, elementData };
          return prev;
        });
      } else {
        // When prompt bubble is open, keep hover tip visible at fixed position
        if (ccFixedPosition) {
          setCCHoverTip({ visible: true, x: ccFixedPosition.x, y: ccFixedPosition.y, elementData });
        }
      }
      return;
    }
    if (getCurrentRoutePromptBubble()) return;
    // Default behavior for other elements (none for now)
    console.log('Prompt hover:', isHovering, elementType, elementData, position);
  };

  const handlePromptClick = (elementType, elementData, position) => {
    // Only allow prompt clicks if the current route has been modified (Add button clicked)
    if (!isCurrentRouteModified()) {
      console.log('🎯 Prompt click ignored - route not modified (Add button not clicked)');
      return;
    }
    
    // If color prompt hasn't been saved, only allow flight-journey-bar clicks
    if (!colorPromptSaved && elementType !== 'flight-journey-bar') {
      console.log('🎯 Prompt click ignored - color prompt not saved, only FJB allowed');
      return;
    }
    
    console.log('=== PROMPT CLICK CALLED ===', { 
      elementType, 
      elementData, 
      position, 
      isPromptMode,
      currentPromoCardContents: promoCardContents,
      colorPromptClosedWithoutSave
    });
    
    // Clear the closed without save state when opening a new color prompt
    if (elementType === 'flight-journey-bar') {
      setColorPromptClosedWithoutSave(false);
      // Set the fixed position for the hover button at the click position
      setFjbFixedPosition({ x: position.x, y: position.y });
      // Immediately show hover tip at fixed position
      setFjbHoverTip({ visible: true, x: position.x, y: position.y });
    }
    
    // Set fixed positions for promo cards and content cards
    if (elementType === 'promo-card') {
      setPcFixedPosition({ x: position.x, y: position.y });
              // Immediately show hover tip at fixed position
        setPcHoverTip({ visible: true, x: position.x, y: position.y - 2, elementData });
    }
    
    if (elementType === 'content-card') {
      setCcFixedPosition({ x: position.x, y: position.y });
      // Immediately show hover tip at fixed position
      setCCHoverTip({ visible: true, x: position.x, y: position.y, elementData });
    }
    
    // Prevent promo card prompt bubble from showing until color has been saved at least once
    if (elementType === 'promo-card' && !colorPromptSaved && colorPromptClosedWithoutSave) {
      console.log('=== BLOCKING PROMO CARD PROMPT - COLOR NEVER SAVED ===');
      return;
    }
    
    if (isPromptMode) {
      // Generate unique key for different element types
      let positionKey;
      if (elementType === 'flight-icon') {
        positionKey = `fps-${Math.round(elementData.progress * 1000)}`; // Use progress as unique identifier
      } else if (elementType === 'flight-phase-button') {
        positionKey = 'flight-phase-button-dashboard'; // Single key for flight phase button
      } else if (elementType === 'flight-journey-bar') {
        positionKey = 'fjb-dashboard'; // Single key for FJB on dashboard

      } else {
        positionKey = `${elementType}-${elementData.cardIndex || 0}`;
      }
      
      // Get existing text for this position
      let existingText = '';
      if (elementType === 'content-card' && elementData?.cardIndex !== undefined) {
        // For content cards, get existing content from route-specific content cards
        const routeContentCards = getRouteContentCards();
        const contentCard = routeContentCards[elementData.cardIndex];
        console.log('=== DEBUG ROUTE-SPECIFIC CONTENT CARD RETRIEVAL ===', {
          elementType,
          cardIndex: elementData.cardIndex,
          routeKey: getCurrentRouteKey(),
          routeContentCards,
          contentCard
        });
        if (contentCard && contentCard.title) {
          existingText = contentCard.title;
          console.log('=== CONTENT CARD EXISTING TEXT ===', { existingText });
        } else {
          console.log('=== NO CONTENT CARD CONTENT FOUND ===', { 
            hasContentCard: !!contentCard,
            routeContentCards,
            cardIndex: elementData.cardIndex,
            routeKey: getCurrentRouteKey()
          });
        }
      } else if (elementType === 'promo-card' && elementData?.cardIndex !== undefined) {
        // Check if this is a content card (passed as promo-card type)
        if (elementData.cardType === 'content-card') {
          // For content cards, get existing content from route-specific content cards
          const routeContentCards = getRouteContentCards();
          const contentCard = routeContentCards[elementData.cardIndex];
          console.log('=== DEBUG ROUTE-SPECIFIC CONTENT CARD RETRIEVAL ===', {
          elementType,
          cardIndex: elementData.cardIndex,
            routeKey: getCurrentRouteKey(),
            routeContentCards,
            contentCard
          });
          if (contentCard && contentCard.title) {
            existingText = contentCard.title;
            console.log('=== CONTENT CARD EXISTING TEXT ===', { existingText });
          } else {
            console.log('=== NO CONTENT CARD CONTENT FOUND ===', { 
              hasContentCard: !!contentCard,
              routeContentCards,
              cardIndex: elementData.cardIndex,
              routeKey: getCurrentRouteKey()
            });
          }
        } else {
          // For promo cards, get existing content from route-specific promoCardContents
          const routeContents = getRoutePromoCardContents();
          const cardContent = routeContents[elementData.cardIndex];
          console.log('=== DEBUG ROUTE-SPECIFIC PROMO CARD RETRIEVAL ===', {
            elementType,
            cardIndex: elementData.cardIndex,
            routeKey: getCurrentRouteKey(),
            routeContents,
          cardContent,
            hasUpdated: cardContent?.updated,
            allRoutes: Object.keys(promoCardContents)
        });
        if (cardContent && cardContent.updated && !selectedFlightPhase) {
          // Use existing content only if no flight phase is selected
          existingText = `text:${cardContent.text || ''},image:${cardContent.image || ''}`;
          console.log('=== FORMATTED EXISTING TEXT ===', { existingText });
        } else {
          console.log('=== NO EXISTING CONTENT FOUND OR FLIGHT PHASE SELECTED ===', { 
            hasCardContent: !!cardContent,
            hasUpdated: cardContent?.updated,
              routeContents,
            cardIndex: elementData.cardIndex,
              routeKey: getCurrentRouteKey(),
            selectedFlightPhase
          });
          
          // If a flight phase is selected, provide phase-specific default content
          if (selectedFlightPhase) {
            const phaseContent = getPhaseSpecificContent(elementData.cardIndex);
            const imageKeyword = getPhaseSpecificImageKeyword(elementData.cardIndex);
            if (phaseContent) {
              existingText = `text:${phaseContent.text || ''},image:${imageKeyword || ''}`;
              console.log('=== PHASE-SPECIFIC DEFAULT CONTENT ===', { existingText, phase: selectedFlightPhase });
            }
          }
        }
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
          setCurrentRoutePromptBubble({
            x: relX,
            y: relY,
            elementType,
            elementData,
            positionKey,
            existingText
          });
        } else {
          setCurrentRoutePromptBubble({
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
        setCurrentRoutePromptBubble({
          x: position.x,
          y: position.y,
          elementType,
          elementData,
          positionKey,
          existingText
        });
      } else if (elementType === 'promo-card') {
        // For promo-card, place below the hover tip (hover tip is typically 50px tall)
        setCurrentRoutePromptBubble({
          x: position.x,
          y: position.y + 60, // Position below hover tip with enough spacing to avoid overlap
          elementType,
          elementData,
          positionKey,
          existingText
        });
      } else if (elementType === 'content-card') {
        // For content-card, place below the hover tip (hover tip is typically 50px tall)
        setCurrentRoutePromptBubble({
          x: position.x,
          y: position.y + 60, // Position below hover tip with enough spacing to avoid overlap
          elementType,
          elementData,
          positionKey,
          existingText
        });
      } else {
        // For flight-journey-bar and other elements, position below the hover tip
        // FJB hover tip is now at click position, so add 8px to get 8px spacing
        const offsetY = elementType === 'flight-journey-bar' ? 8 : 0; // 8px below hover tip
        setCurrentRoutePromptBubble({
          x: position.x,
          y: position.y + offsetY,
          elementType,
          elementData,
          positionKey,
          existingText
        });
      }
      setShowPlusIcon(false); // Hide plus icon when bubble appears
      
      // Ensure hover tips remain visible at fixed positions when prompt bubbles open
      if (elementType === 'flight-journey-bar' && fjbFixedPosition) {
        setFjbHoverTip({ visible: true, x: fjbFixedPosition.x, y: fjbFixedPosition.y });
              } else if (elementType === 'promo-card' && pcFixedPosition) {
          setPcHoverTip({ visible: true, x: pcFixedPosition.x, y: pcFixedPosition.y - 2, elementData });
        }
  
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
    setCurrentRoutePromptBubble(null);
    setShowPlusIcon(false);
    // Clear all fixed positions when exiting prompt mode
    setFjbFixedPosition(null);
    setPcFixedPosition(null);
    setCcFixedPosition(null);
  };

  const handlePromptBubbleClose = () => {
    setCurrentRoutePromptBubble(null);
    setShowPlusIcon(false); // Ensure plus icon is hidden when bubble closes
    setFjbHoverTip({ visible: false, x: 0, y: 0 });
    setPcHoverTip({ visible: false, x: 0, y: 0, elementData: null });
    setCCHoverTip({ visible: false, x: 0, y: 0, elementData: null });
    // Clear all fixed positions when prompt bubble closes
    setFjbFixedPosition(null);
    setPcFixedPosition(null);
    setCcFixedPosition(null);
  };

  const handlePromptBubbleSubmit = (promptText, elementType, elementData, positionKey, options = {}) => {
    console.log('🚀 === PROMPT BUBBLE SUBMIT START ===');
    console.log('=== PROMPT BUBBLE SUBMIT CALLED ===', {
      promptText, 
      elementType, 
      elementData, 
      positionKey,
      options,
      currentPromoCardContents: promoCardContents
    });
    
    // Handle flight journey bar theme color submissions (don't reset card content)
    if (elementType === 'flight-journey-bar') {
      console.log('=== FLIGHT JOURNEY BAR SUBMISSION - NO CARD RESET ===');
      // Theme color changes are handled by onThemeColorChange, not here
      // Just close the prompt bubble
      setCurrentRoutePromptBubble(null);
      return;
    }
    
        // Handle promo card and content card submissions
    if ((elementType === 'promo-card' || elementType === 'content-card') && elementData && elementData.cardIndex !== undefined) {
      console.log('=== DASHBOARD RECEIVED CARD SUBMISSION ===', { 
        promptText, 
        elementType, 
        elementData, 
        positionKey,
        isRemix: options.isRemix
      });
      
      // Check if this is a content card
      if (elementType === 'content-card' || elementData.cardType === 'content-card') {
        // Handle content card submissions
        console.log('=== HANDLING CONTENT CARD SUBMISSION ===', { promptText, isRemix: options.isRemix });
        
        if (options.isRemix) {
          // For content card remix, generate a new AI image
          const routeKey = getCurrentRouteKey();
          if (routeKey) {
            // Extract the image description from the remix prompt
            const imageDescription = promptText.replace('remix:', '').trim();
            console.log('=== GENERATING NEW AI IMAGE FOR CONTENT CARD ===', { 
              cardIndex: elementData.cardIndex, 
              imageDescription, 
              routeKey 
            });
            
            try {
              // Generate new AI image
              const newImageUrl = generateAIImageSync(imageDescription);
              
              // Update the content card image
              setContentCardImages(prev => ({
                ...prev,
                [routeKey]: {
                  ...prev[routeKey],
                  [elementData.cardIndex]: newImageUrl
                }
              }));
              
              console.log('=== CONTENT CARD IMAGE UPDATED ===', { 
                cardIndex: elementData.cardIndex, 
                newImageUrl 
              });
            } catch (error) {
              console.error('=== AI IMAGE GENERATION FAILED FOR CONTENT CARD REMIX ===', { error, imageDescription });
              // Fallback to Unsplash image
              const fallbackUrl = getUnsplashFallback(imageDescription);
              setContentCardImages(prev => ({
                ...prev,
                [routeKey]: {
                  ...prev[routeKey],
                  [elementData.cardIndex]: fallbackUrl
                }
              }));
            }
          }
        } else {
          // For regular content card submission, parse text and image like promo cards
          console.log('=== HANDLING REGULAR CONTENT CARD SUBMISSION ===', { promptText });
          
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
          
          // If no format detected, treat the entire text as title
          if (!textContent && !imageContent) {
            textContent = promptText.trim();
          }
          
          console.log('=== PARSED CONTENT CARD CONTENT ===', { 
            parts, 
            textContent, 
            imageContent 
          });
          
          const routeKey = getCurrentRouteKey();
          if (routeKey) {
            // Update the title
            if (textContent) {
              setRecommendedContentCards(prev => {
                const routeCards = prev[routeKey] || [];
                const updatedCards = [...routeCards];
                if (updatedCards[elementData.cardIndex]) {
                  updatedCards[elementData.cardIndex] = {
                    ...updatedCards[elementData.cardIndex],
                    title: textContent
                  };
                }
                return {
                  ...prev,
                  [routeKey]: updatedCards
                };
              });
            }
            
            // Update the image if provided
            if (imageContent) {
              try {
                // Generate new AI image
                const newImageUrl = generateAIImageSync(imageContent);
                
                // Update the content card image
                setContentCardImages(prev => ({
                  ...prev,
                  [routeKey]: {
                    ...prev[routeKey],
                    [elementData.cardIndex]: newImageUrl
                  }
                }));
                
                console.log('=== CONTENT CARD IMAGE UPDATED ===', { 
                  cardIndex: elementData.cardIndex, 
                  newImageUrl 
                });
              } catch (error) {
                console.error('=== AI IMAGE GENERATION FAILED FOR CONTENT CARD ===', { error, imageContent });
                // Fallback to Unsplash image
                const fallbackUrl = getUnsplashFallback(imageContent);
                setContentCardImages(prev => ({
                  ...prev,
                  [routeKey]: {
                    ...prev[routeKey],
                    [elementData.cardIndex]: fallbackUrl
                  }
                }));
              }
            }
          }
        }
      } else {
        // Handle promo card submissions
        console.log('=== HANDLING PROMO CARD SUBMISSION ===', { promptText, isRemix: options.isRemix });
      
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
      
        // Update the promo card content for the current route
        const routeKey = getCurrentRouteKey();
        if (routeKey) {
          setPromoCardContents(prev => {
            const routeContents = prev[routeKey] || {};
            const existingContent = routeContents[elementData.cardIndex] || {};
            
            // Update the specific card that was edited
            const updatedRouteContents = {
              ...routeContents,
              [elementData.cardIndex]: {
                // For remix operations, preserve existing text content
                text: options.isRemix ? existingContent.text : textContent,
                // Use remixed image URL if provided, otherwise use image content or existing image
                image: options.remixedImageUrl ? options.remixedImageUrl : (imageContent.trim() ? imageContent : existingContent.image),
                backgroundImage: options.remixedImageUrl || existingContent.backgroundImage,
                updated: true,
                // Add remix counter for remix operations to trigger re-render
                remixCount: options.isRemix ? (existingContent.remixCount || 0) + 1 : 0,
                // Add loading state for remix operations
                isLoading: options.isRemix ? true : false
              }
            };
            
            // If this is the first time saving content for this route, populate all flight phase cards
            const hasAnyUpdatedCards = Object.values(routeContents).some(card => card.updated);
            if (!hasAnyUpdatedCards) {
              // Populate all flight phase cards with default content
              updatedRouteContents[0] = { text: 'Enjoy your welcome drink', image: 'welcome drink', updated: true };
              updatedRouteContents[1] = { text: 'Feel at home', image: 'Settle in', updated: true };
              updatedRouteContents[2] = { text: 'Connect your device', image: 'phone in an aircraft', updated: true };
            }
            
            const newContent = {
              ...prev,
              [routeKey]: updatedRouteContents
            };
            
            console.log('=== UPDATING ROUTE-SPECIFIC PROMO CARD CONTENTS ===', {
              routeKey,
              cardIndex: elementData.cardIndex,
              textContent,
              imageContent,
              isRemix: options.isRemix,
              remixCount: updatedRouteContents[elementData.cardIndex].remixCount,
              previousRouteContents: routeContents,
              newRouteContents: updatedRouteContents,
              allRoutes: Object.keys(prev),
              hasAnyUpdatedCards,
              populatedAllCards: !hasAnyUpdatedCards
            });
            return newContent;
          });
        }
      
      console.log('=== PROMO CARD CONTENT UPDATED ===', { 
        cardIndex: elementData.cardIndex, 
        textContent, 
        imageContent 
      });
      }
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
    // Don't close the bubble for remix operations (keep bubble open for continued editing)
    if (elementType !== 'logo-placeholder' && !options.isRemix) {
      setCurrentRoutePromptBubble(null);
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
    console.log('🚀 === PROMPT BUBBLE SUBMIT END ===');
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

  // Handle sticky positioning for flight content when dark container scrolls up
  useEffect(() => {
    if (!showInFlightPreview) return;

    const handleScroll = () => {
      // Find the ThemeCreator dark container
      const themeCreatorContainer = document.querySelector('[data-component="ThemeCreator"]');
      if (!themeCreatorContainer) return;

      const containerRect = themeCreatorContainer.getBoundingClientRect();
      const containerBottom = containerRect.bottom;
      const containerTop = containerRect.top;

      // Bidirectional sticky behavior:
      // - Stick when container bottom goes above viewport (scrolling down)
      // - Unstick when container top comes back into view (scrolling up)
      let shouldBeSticky;
      
      if (containerTop >= 0) {
        // Dark container is visible at top - unstick flight content
        shouldBeSticky = false;
      } else if (containerBottom <= 100) {
        // Dark container mostly out of view - stick flight content
        shouldBeSticky = true;
        } else {
        // In transition zone - maintain current state
        shouldBeSticky = isFlightContentSticky;
      }
      
      setIsFlightContentSticky(shouldBeSticky);
      
      // Store the dark container height for positioning calculations
      if (containerRect.height !== darkContainerHeight) {
        setDarkContainerHeight(containerRect.height);
      }

      // Debug logging
      console.log('🔍 Scroll Debug:', {
        containerTop,
        containerBottom,
        shouldBeSticky,
        isFlightContentSticky,
        canUserScroll: true // User can always scroll
      });
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showInFlightPreview, darkContainerHeight, isFlightContentSticky]);

  // Keep all elements visible - no auto-scroll to hide themer logo or input fields
  // Removed auto-scroll to maintain visibility of input fields and generate flights button

  // NEW: Handle flight phase selection from FlightProgress
  const handleFlightPhaseSelect = (phase) => {
    console.log('🚀 === FLIGHT PHASE SELECT START ===');
    console.log('🎯 Flight phase selected:', { phase, currentPhase: selectedFlightPhase });
    setSelectedFlightPhase(phase);
    
    // Store the current content for the previous phase before switching
    const routeKey = getCurrentRouteKey();
                if (routeKey && isCurrentRouteModified()) {
      setPromoCardContents(prev => {
        const newState = { ...prev };
        const currentPhase = selectedFlightPhase;
        
        // If we have a current phase and current content, store it
        if (currentPhase && newState[routeKey]) {
          newState[`${routeKey}-${currentPhase}`] = newState[routeKey];
        }
        
        // If we're switching to a phase that has stored content, restore it
        if (newState[`${routeKey}-${phase}`]) {
          newState[routeKey] = newState[`${routeKey}-${phase}`];
        } else {
                  // If no stored content for this phase, set phase-specific default content
        const phaseSpecificContent = getPhaseSpecificDefaultContent(phase);
        console.log('🚨 RESETTING PROMO CARDS TO PHASE-SPECIFIC DEFAULTS:', { phase, phaseSpecificContent });
        newState[routeKey] = phaseSpecificContent;
        }
        
        return newState;
      });
    } else if (routeKey) {
      console.log('🎯 Skipping phase-specific content update - route not modified yet');
    }
    console.log('🚀 === FLIGHT PHASE SELECT END ===');
  };

  // Helper function to get phase-specific default content
  const getPhaseSpecificDefaultContent = (phase) => {
    const phaseContent = {
      'takeoff': {
        0: { text: 'Enjoy your welcome drink', image: 'welcome drink', updated: false },
        1: { text: 'Feel at home', image: 'Settle in', updated: false },
        2: { text: 'Connect your device', image: 'phone in an aircraft', updated: false }
      },
      'climb': {
        0: { text: 'Order food', image: 'meal', updated: false },
        1: { text: 'Offers onboard', image: 'offers', updated: false },
        2: { text: 'Latest entertainment', image: 'movie', updated: false }
      },
      'cruise': {
        0: { text: 'Popcorn with movie', image: 'popcorn', updated: false },
        1: { text: 'Buy gifts', image: 'gifts', updated: false },
        2: { text: 'Latest entertainment', image: 'movie', updated: false }
      },
      'descent': {
        0: { text: 'Buy guides at discount', image: 'get your guide', updated: false },
        1: { text: 'Buy gifts', image: 'gifts', updated: false },
        2: { text: 'Save on your next flight', image: 'flight ticket offer', updated: false }
      },
      'landing': {
        0: { text: 'Buy guides at discount', image: 'get your guide', updated: false },
        1: { text: 'Buy gifts', image: 'gifts', updated: false },
        2: { text: 'Save on your next flight', image: 'flight ticket offer', updated: false }
      }
    };
    
    return phaseContent[phase] || phaseContent['takeoff'];
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
    
    // Update route-specific promoCardContents to maintain the correct association
    const routeKey = getCurrentRouteKey();
    if (routeKey) {
      const routeContents = getRoutePromoCardContents();
    const updatedContents = {};
    newOrder.forEach((originalCardId, newPosition) => {
        if (routeContents[originalCardId]) {
        updatedContents[newPosition] = {
            ...routeContents[originalCardId],
          // Keep the original content but update any position-dependent logic if needed
        };
      }
    });
    
    // Update promoCardContents with the new positions while preserving content
    const finalContents = {};
    newOrder.forEach((originalCardId, newPosition) => {
        if (routeContents[originalCardId]) {
          finalContents[newPosition] = routeContents[originalCardId];
      }
    });
    
    if (Object.keys(finalContents).length > 0) {
        setPromoCardContents(prev => {
          const newState = {
            ...prev,
            [routeKey]: finalContents
          };
          console.log('=== UPDATED ROUTE-SPECIFIC PROMO CARD CONTENTS AFTER REORDER ===', {
            routeKey,
            finalContents,
            allRoutes: Object.keys(newState)
          });
          return newState;
        });
      }
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
  
  // Add handler for content card hover
  const handleContentCardHover = (isHovering, x, y, elementData) => {
    // Don't show content card hover tips if there's a fixed flight journey bar hover tip
    if (fjbFixedPosition) {
      setCCHoverTip({ visible: false, x: 0, y: 0, elementData: null });
      return;
    }
    
    if (isHovering) {
      // If we have a fixed position, use it instead of following mouse
      const targetPosition = ccFixedPosition || { x, y };
      setCCHoverTip({ visible: true, x: targetPosition.x, y: targetPosition.y, elementData });
    } else {
      // Only hide if no prompt bubble is open
      if (!getCurrentRoutePromptBubble()) {
        setCCHoverTip({ visible: false, x: 0, y: 0, elementData: null });
      } else {
        // When prompt bubble is open, keep hover tip visible at fixed position
        if (ccFixedPosition) {
          setCCHoverTip({ visible: true, x: ccFixedPosition.x, y: ccFixedPosition.y, elementData });
        }
      }
    }
  };

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
            // Store theme for the current flight route
            const flightKey = getFlightKey(origin, destination);
            if (flightKey) {
              setFlightThemes(prev => ({
                ...prev,
                [flightKey]: color
              }));
              console.log('🎯 ThemeCreator: Stored theme for flight route:', { flightKey, color });
              
              // Mark the route as modified when theme is saved from ThemeCreator
              markCurrentRouteAsModified();
            }
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
          themeColor={activeThemeColor}
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
          flightCardProgress={flightRouteProgress}
          showIFEFrame={showIFEFrame}
          onAirlineSelect={(logoInfo, themeColor) => {
            console.log('🎯 Dashboard: Airline selected:', logoInfo, themeColor);
            setSelectedLogo(logoInfo); // logoInfo can be null for "All Airlines" reset
            
            // Store theme for the current flight route
            const flightKey = getFlightKey(origin, destination);
            if (flightKey && themeColor) {
              setFlightThemes(prev => ({
                ...prev,
                [flightKey]: themeColor
              }));
              console.log('🎯 Dashboard: Stored airline theme for flight route:', { flightKey, themeColor });
              
              // Mark the route as modified when airline theme is saved
              markCurrentRouteAsModified();
            }
          }}
          onModifyClicked={() => {
            // Mark the current route as modified when Add button is clicked
            console.log('🎯 Add button clicked - marking route as modified');
            markCurrentRouteAsModified();
          }}
          onDatesChange={(dates) => {
            setSelectedDates(dates);
            console.log('🎯 Dashboard: Dates updated from ThemeCreator:', dates);
          }}
          onShowPreview={(show) => {
            console.log('🎯 Dashboard: onShowPreview called with:', show);
            setShowInFlightPreview(show);
            setShowIFEFrame(show);
            setIsPromptMode(show);
            setIsScrollingUp(show);
            
            if (show) {
              // Scroll the page to bring the content to the top after animation
              setTimeout(() => {
                console.log('🎯 Attempting to scroll to top');
                
                // Try multiple approaches to scroll to top
                const flightCardContainer = document.getElementById('flight-card-container');
                console.log('🎯 Flight card container found:', !!flightCardContainer);
                
                if (flightCardContainer) {
                  const rect = flightCardContainer.getBoundingClientRect();
                  console.log('🎯 Container position:', rect.top, rect.left);
                  
                  // Calculate scroll position to bring container to top
                  const scrollTop = window.pageYOffset + rect.top - 20; // 20px from top
                  console.log('🎯 Scrolling to position:', scrollTop);
                  
                  // Force scroll to top
                  window.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                  });
                }
              }, 800); // Wait for animations to complete
            }
            
            console.log('🎯 Dashboard: States IMMEDIATELY after set - showInFlightPreview:', show, 'showIFEFrame:', show, 'isPromptMode:', show, 'isScrollingUp:', show);
            
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
              // Notify components that layout has changed
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('layoutChanged', { detail: { type: 'ifePreviewShown' } }));
              }, 300);
            }, 250);
          }}
        />
      </div>
      
      {/* Theme preview label */}
      <div 
        className="w-full flex justify-center"
        style={{
          marginTop: 20,
          marginBottom: 20
        }}
      >
        <h1 
          className="text-6xl font-extrabold tracking-tight text-gray-900"
          style={{
            opacity: 0.1
          }}
        >
          Theme preview
        </h1>
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

      {/* Flight card and chevrons in place of Select Theme text */}
      {showInFlightPreview && (
        <div 
          id="flight-card-container"
          className="w-full flex justify-center"
          style={{
            marginTop: isFlightContentSticky ? 0 : 20,
            opacity: showInFlightPreview ? 1 : 0,
            transform: showInFlightPreview ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out, position 0.3s ease-out, top 0.3s ease-out',
            position: isFlightContentSticky ? 'fixed' : 'relative',
            top: isFlightContentSticky ? '20px' : 'auto',
            left: isFlightContentSticky ? '0' : 'auto',
            right: isFlightContentSticky ? '0' : 'auto',
            zIndex: isFlightContentSticky ? 1000 : 'auto',
            minHeight: '120px'
          }}
        >
          {/* Flight card will be positioned here via AirportSearch */}
        </div>
      )}

      {/* IFE frame - Shows when preview mode is active */}
      {showInFlightPreview && (
        <div 
          className="w-full flex justify-center" 
          style={{ 
            marginTop: isFlightContentSticky ? 0 : 8, 
            height: '880px',
            opacity: showInFlightPreview ? 1 : 0,
            transform: showInFlightPreview ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out, position 0.3s ease-out, top 0.3s ease-out',
            position: isFlightContentSticky ? 'fixed' : 'relative',
            top: isFlightContentSticky ? '140px' : 'auto',
            left: isFlightContentSticky ? '0' : 'auto',
            right: isFlightContentSticky ? '0' : 'auto',
            zIndex: isFlightContentSticky ? 999 : 'auto'
          }}
        >
          <div 
            style={{ position: 'relative', width: 1400, height: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', transform: 'scale(0.8)', transformOrigin: 'top center' }}
                          onMouseEnter={(e) => {
                // Check if hover is on promo or content card to avoid triggering hover effects
                const target = e.target;
                const isPromoOrContentCard = (
                  target.closest('[data-promo-card]') || 
                  target.closest('[data-content-card]') ||
                  target.closest('.promo-card') ||
                  target.closest('.content-card')
                );
                
                if (!isPromoOrContentCard) {
                  setIfeFrameHover({ isHovering: true, x: e.clientX, y: e.clientY });
                }
              }}
              onMouseMove={(e) => {
                // Check if hover is on promo or content card to avoid triggering hover effects
                const target = e.target;
                const isPromoOrContentCard = (
                  target.closest('[data-promo-card]') || 
                  target.closest('[data-content-card]') ||
                  target.closest('.promo-card') ||
                  target.closest('.content-card')
                );
                
                if (!isPromoOrContentCard) {
                  setIfeFrameHover({ isHovering: true, x: e.clientX, y: e.clientY });
                }
              }}
            onMouseLeave={() => {
              setIfeFrameHover({ isHovering: false, x: 0, y: 0 });
            }}
            onClick={(e) => {
              // Only allow IFE frame clicks if the current route has been modified (Add button clicked)
              if (!isCurrentRouteModified()) {
                console.log('🎯 IFE frame click ignored - route not modified (Add button not clicked)');
                return;
              }
              
              // Check if click is on promo or content card to avoid triggering color prompt
              const target = e.target;
              const isPromoOrContentCard = (
                target.closest('[data-promo-card]') || 
                target.closest('[data-content-card]') ||
                target.closest('.promo-card') ||
                target.closest('.content-card')
              );
              
              if (isPromoOrContentCard) {
                console.log('🎯 IFE frame click ignored - click on promo/content card');
                return;
              }
              
              // Global click delegation for "Change Theme" buttons in IFE frame
              const isChangeThemeButton = (
                target.textContent?.includes('Change theme') || 
                target.textContent?.includes('Change Theme') ||
                target.title?.includes('Change Theme') ||
                target.title?.includes('Change theme')
              );
              
              if (isChangeThemeButton && isPromptMode) {
                console.log('🎯 Global IFE frame click delegation caught Change Theme button');
                e.stopPropagation();
                handlePromptClick('flight-journey-bar', { themeColor: ifeFrameThemeColor }, { x: e.clientX, y: e.clientY });
                return;
              }
              
              // If color prompt was closed without save, clicking anywhere in IFE frame should open color prompt
              if (colorPromptClosedWithoutSave && isPromptMode) {
                console.log('🎯 IFE frame click - opening color prompt because color was not saved');
                e.stopPropagation();
                handlePromptClick('flight-journey-bar', { themeColor: ifeFrameThemeColor }, { x: e.clientX, y: e.clientY });
              }
            }}
          >
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
              themeColor={activeThemeColor}
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
              promoCardContents={getRoutePromoCardContents()}
              cardOrder={cardOrder}
              onCardReorder={handleCardReorder}
              contentCardOrder={contentCardOrder}
              onContentCardReorder={handleContentCardReorder}
              recommendedContentCards={getRouteContentCards()}
              onContentCardHover={(isHovering, x, y) => {
                console.log('=== CONTENT CARD HOVER ===', { isHovering, x, y });
                setContentCardHover({ isHovering, x, y });
              }}
              colorPromptClosedWithoutSave={colorPromptClosedWithoutSave}
              colorPromptSaved={colorPromptSaved}
              contentCardImages={contentCardImages}
              contentCardTextColors={contentCardTextColors}
              setContentCardTextColors={setContentCardTextColors}
              getCurrentRouteKey={getCurrentRouteKey}
              isModifyClicked={isCurrentRouteModified()}
              isCurrentRouteModified={isCurrentRouteModified}
              handleContentCardHover={handleContentCardHover}
              selectedDates={selectedDates}
            />
          </div>
        </div>
      )}
      

      


      
      {/* Plus Icon Cursor for Prompt Mode */}
      <PlusIconCursor 
        isVisible={isPromptMode && showPlusIcon} 
        themeColor={activeThemeColor} 
      />

      {/* Mouse Pointer Cursor */}
      <MousePointer 
        isVisible={showMousePointer}
        themeColor={activeThemeColor}
        size="normal"
        showShadow={true}
        animated={true}
      />

      {/* Prompt Bubble */}
      <PromptBubble
        key={`${getCurrentRoutePromptBubble()?.elementType}-${getCurrentRoutePromptBubble()?.positionKey}-${getCurrentRoutePromptBubble()?.existingText?.length || 0}`}
        isVisible={!!getCurrentRoutePromptBubble()}
        position={getCurrentRoutePromptBubble() || { x: 0, y: 0 }}
        elementType={getCurrentRoutePromptBubble()?.elementType}
        elementData={getCurrentRoutePromptBubble()?.elementData}
        onClose={handlePromptBubbleClose}
        onSubmit={handlePromptBubbleSubmit}
        onCloseWithoutSave={() => {
          console.log('=== COLOR PROMPT CLOSED WITHOUT SAVE ===');
          setColorPromptClosedWithoutSave(true);
        }}
        themeColor={activeThemeColor}
        isThemeBuildStarted={isThemeBuildStarted}
        existingText={getCurrentRoutePromptBubble()?.existingText || ''}
        positionKey={getCurrentRoutePromptBubble()?.positionKey}
        fpsPrompts={fpsPrompts}
        onThemeColorChange={(color, chipData) => {
          if (typeof color === 'string' && color.length > 0) {
            console.log('🚀 === THEME COLOR CHANGE START ===');
            console.log('🎯 onThemeColorChange called with:', { color, chipData, isThemeBuildStarted });
            
            // Store theme for the current flight route
            const flightKey = getFlightKey(origin, destination);
            if (flightKey) {
              setFlightThemes(prev => ({
                ...prev,
                [flightKey]: color
              }));
              console.log('🎯 Stored theme for flight route:', { flightKey, color, allThemes: { ...flightThemes, [flightKey]: color } });
              
              // Store progress for the current flight route (100% when theme is saved)
              setFlightRouteProgress(prev => ({
                ...prev,
                [flightKey]: 100
              }));
              console.log('🎯 Stored progress for flight route:', { flightKey, progress: 100, allProgress: { ...flightRouteProgress, [flightKey]: 100 } });
            }
            
            // Clear the closed without save state since the user saved
            setColorPromptClosedWithoutSave(false);
            setColorPromptSaved(true);
            
            // Clear fixed position so hover tip follows cursor again
            setFjbFixedPosition(null);
            // Hide the hover tip immediately after saving
            setFjbHoverTip({ visible: false, x: 0, y: 0 });
            
            // Update selected theme chip and apply logo animation
            if (chipData && chipData.label) {
              setSelectedThemeChip(chipData);
              const animationType = mapThemeChipToAnimation(chipData.label, chipData.color);
              setSelectedLogo(prev => ({ 
                ...(prev || {}), 
                animationType: animationType 
              }));
            }
            
            // Auto-select takeoff flight phase
            console.log('🚨 ABOUT TO CALL setSelectedFlightPhase("takeoff") - THIS MIGHT TRIGGER CARD RESET');
            setSelectedFlightPhase('takeoff');
            console.log('🎯 Auto-selected takeoff flight phase');
            
            // Mark the route as modified when theme is saved
            markCurrentRouteAsModified();
            
            // Update route-specific promo card contents (preserve existing custom content)
            const routeKey = getCurrentRouteKey();
            if (routeKey) {
              setPromoCardContents(prev => {
                const existingContent = prev[routeKey] || {};
                const defaultContent = {
                  0: { text: 'Enjoy your welcome drink', image: 'welcome drink', updated: false, backgroundImage: null },
                  1: { text: 'Feel at home', image: 'Settle in', updated: false, backgroundImage: null },
                  2: { text: 'Connect your device', image: 'phone in an aircraft', updated: false, backgroundImage: null }
                };
                
                // Preserve existing custom content, only use defaults for cards that haven't been customized
                const preservedContent = {};
                for (let i = 0; i < 3; i++) {
                  if (existingContent[i] && existingContent[i].updated) {
                    // Keep existing custom content
                    preservedContent[i] = existingContent[i];
                  } else {
                    // Use default content for uncustomized cards
                    preservedContent[i] = defaultContent[i];
                  }
                }
                
                const newState = {
                  ...prev,
                  [routeKey]: preservedContent
                };
                console.log('🎯 Updated route-specific promo card contents (preserving custom content):', {
                  routeKey,
                  existingContent,
                  preservedContent,
                  allRoutes: Object.keys(newState)
                });
                return newState;
              });
              
              // Generate images for promo cards (only for cards without existing images)
              const generatePromoCardImages = async () => {
                const imagePrompts = [
                  'welcome drink',
                  'Settle in', 
                  'phone in an aircraft'
                ];
                
                const promoCardImages = {};
                
                // Generate images one by one to avoid overwhelming the API
                for (let index = 0; index < imagePrompts.length; index++) {
                  const prompt = imagePrompts[index];
                  
                  // Check if this card already has a custom image
                  setPromoCardContents(prev => {
                    const currentCard = prev[routeKey]?.[index];
                    if (currentCard && currentCard.backgroundImage) {
                      // Card already has a custom image, skip generation
                      console.log('🎯 Skipping image generation for promo card (already has custom image):', { index, existingImage: currentCard.backgroundImage });
                      return prev;
                    }
                    
                    // Generate new image for this card
                    try {
                      const aiImageUrl = generateAIImageSync(prompt);
                      promoCardImages[index] = aiImageUrl;
                      
                      // Update the card with the new image
                      const updatedState = { ...prev };
                      if (updatedState[routeKey] && updatedState[routeKey][index]) {
                        updatedState[routeKey][index] = {
                          ...updatedState[routeKey][index],
                          backgroundImage: aiImageUrl
                        };
                      }
                      
                      console.log('🎯 Generated image for promo card:', { index, prompt, aiImageUrl });
                      return updatedState;
                    } catch (error) {
                      console.error('=== AI IMAGE GENERATION FAILED FOR PROMO CARD ===', { error, prompt });
                      const fallbackUrl = getUnsplashFallback(prompt);
                      promoCardImages[index] = fallbackUrl;
                      
                      // Update with fallback image
                      const updatedState = { ...prev };
                      if (updatedState[routeKey] && updatedState[routeKey][index]) {
                        updatedState[routeKey][index] = {
                          ...updatedState[routeKey][index],
                          backgroundImage: fallbackUrl
                        };
                      }
                      return updatedState;
                    }
                  });
                  
                  // Small delay between requests to avoid rate limiting
                  await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                console.log('🎯 Completed generating images for promo cards (preserving existing images):', {
                  routeKey,
                  promoCardImages
                });
              };
              
              // Start generating images
              generatePromoCardImages();
            }
            
            // Update route-specific recommended content cards based on selected chip type
            if (routeKey) {
              setRecommendedContentCards(prev => {
                const segment = { origin, destination };
                const phase = selectedFlightPhase || 'takeoff';
                let computedCards = [];
                
                // If a festival chip was chosen, pull festival-based content. Otherwise, use defaults
                if (chipData && chipData.isFestival) {
                  try {
                    const festivalCards = getFestivalContent?.(getPrimaryFestival(segment, selectedDates, color)?.name, phase, 'content') || [];
                    const fromUtils = getAllContentCardContent(segment, selectedDates, phase, color) || [];
                    const source = festivalCards.length > 0 ? festivalCards : fromUtils;
                    computedCards = source.slice(0, 4).map((item, idx) => ({
                      id: idx + 1,
                      title: item?.title || item?.text || 'Add content',
                      type: item?.type || 'default'
                    }));
                  } catch (err) {
                    console.warn('Could not build festival content cards, falling back to defaults', err);
                  }
                }
                
                if (computedCards.length === 0) {
                  // Defaults for non-festival chips (Airline Brand, City, Gradient)
                  computedCards = [
                    { id: 1, title: 'Crocodile Dundee Movie', type: 'movie' },
                    { id: 2, title: 'Get Your Guide', type: 'guide' },
                    { id: 3, title: 'Game Poster', type: 'game' },
                    { id: 4, title: 'A Podcast', type: 'podcast' }
                  ];
                }
                
                const newState = {
                  ...prev,
                  [routeKey]: computedCards
                };
                console.log('🎯 Updated route-specific content cards (chip-aware):', {
                  routeKey,
                  chipData,
                  phase,
                  computedCards
                });
                return newState;
              });
            }
            
            // Generate AI images for content cards (only for cards without existing images)
            const currentRouteKey = getCurrentRouteKey();
            if (currentRouteKey) {
              setRecommendedContentCards(prev => {
                const currentContentCards = prev[currentRouteKey] || [];
                const isFestivalChip = !!(chipData && chipData.isFestival);
                const existingImages = contentCardImages[currentRouteKey] || {};
                
                // If switching away from festival to default (airline/city/gradient/custom),
                // reset images so they regenerate to match the new titles
                // Always regenerate images to match the newly selected theme titles (festival or default)
                // This avoids stale images when switching between festival and non-festival chips
                const baseImages = {};
                const newContentCardImages = { ...baseImages };
                
                currentContentCards.forEach((card, index) => {
                  if (!newContentCardImages[index] && card.title && card.title !== 'Add content') {
                    try {
                      const aiImageUrl = generateAIImageSync(card.title);
                      newContentCardImages[index] = aiImageUrl;
                    } catch (error) {
                      console.error('=== AI IMAGE GENERATION FAILED FOR CONTENT CARD ===', { error, cardTitle: card.title });
                      const fallbackUrl = getUnsplashFallback(card.title);
                      newContentCardImages[index] = fallbackUrl;
                    }
                  }
                });
                
                // Overwrite images for this route (reset when not festival)
                setContentCardImages(prevImages => ({
                  ...prevImages,
                  [currentRouteKey]: newContentCardImages
                }));
                
                console.log('🎯 Generated AI images for content cards (reset-aware):', {
                  routeKey: currentRouteKey,
                  isFestivalChip,
                  newContentCardImages
                });
                
                return prev; // Return unchanged state since we're only updating images
              });
            }
            
            console.log('🎯 Completed theme save with preserved card content');
            console.log('🚀 === THEME COLOR CHANGE END ===');
            
            // Close the prompt bubble after saving the color
            setCurrentRoutePromptBubble(null);
          }
        }}
        themeChips={getCurrentRoutePromptBubble()?.elementType === 'flight-journey-bar' ? fjbThemeChips : []}
        selectedLogo={selectedLogo}
        onLogoSelect={(info) => {
          setSelectedLogo(info);
          // Auto-set theme color based on selected logo
          if (info && info.id) {
            const logoColorMap = {
              'discover': '#1E72AE',
              'lufthansa': '#0A1D3D', 
              'swiss': '#CB0300'
            };
            const newColor = logoColorMap[info.id];
            if (newColor) {
              // Store theme for the current flight route
              const flightKey = getFlightKey(origin, destination);
              if (flightKey) {
                setFlightThemes(prev => ({
                  ...prev,
                  [flightKey]: newColor
                }));
                console.log('🎯 Dashboard: Stored logo theme for flight route:', { flightKey, newColor });
                
                // Mark the route as modified when logo theme is saved
                markCurrentRouteAsModified();
              }
            }
          }
        }}
        flightsGenerated={flightsGenerated}
        selectedFlightPhase={selectedFlightPhase}
        onFlightPhaseSelect={handleFlightPhaseSelect}
        selectedFlightSegment={selectedFlightSegment}
        selectedDates={selectedDates}
        modifiedChipColors={modifiedChipColors}
        setModifiedChipColors={setModifiedChipColors}
      />

      {/* Change Theme Button - Shows when hovering IFE frame after color prompt was closed without save */}
      {/* REMOVED: Dummy change theme button that was showing as overlay */}

      {/* FJB hover tip bubble: shows label and plus; click opens color PB */}
      {isCurrentRouteModified() && isPromptMode && fjbHoverTip.visible && (
        <div
          key={`fjb-hover-${activeThemeColor}`}
          className="fixed"
          style={{ left: fjbHoverTip.x, top: fjbHoverTip.y - 50, pointerEvents: 'none', zIndex: 999999999 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md"
            style={{
              backgroundColor: '#1f2937', // Dark container color
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>Change theme</span>
            <div className="w-px h-4 bg-white/30"></div>
            <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>Animation</span>
            <div className="w-px h-4 bg-white/30"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Close the prompt bubble if it's open
                setRoutePromptBubbles({});
                setIsPromptMode(false);
              }}
              className="w-4 h-4 flex items-center justify-center ml-1"
              style={{ pointerEvents: 'auto', color: '#FFFFFF' }}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* FPS hover tip bubble: shows label and plus; click opens FPS PB */}
      {isCurrentRouteModified() && isPromptMode && fpsHoverTip.visible && !getCurrentRoutePromptBubble() && (
        <div
          key={`fps-hover-${activeThemeColor}`}
          className="fixed"
          style={{ left: fpsHoverTip.x, top: fpsHoverTip.y, pointerEvents: 'none', zIndex: 999999999 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md"
            style={{
              backgroundColor: '#1f2937', // Dark container color
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>Select flight phase</span>
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
              style={{ pointerEvents: 'auto', borderColor: '#FFFFFF', color: '#FFFFFF' }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Promo Card hover tip bubble when color saved: shows "Edit promo card" */}
      {isCurrentRouteModified() && isPromptMode && pcHoverTip.visible && colorPromptSaved && (
        <div
          key={`pc-hover-edit-${activeThemeColor}`}
          className="fixed"
          style={{ left: pcHoverTip.x, top: pcHoverTip.y, pointerEvents: 'none', zIndex: 999999999 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md"
            style={{
              backgroundColor: '#1f2937', // Dark container color
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
              Content
            </span>
            <div className="w-px h-4 bg-white/30"></div>
            <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
              Analytics
            </span>
            <div className="w-px h-4 bg-white/30"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRoutePromptBubbles({});
                setIsPromptMode(false);
              }}
              className="w-4 h-4 flex items-center justify-center ml-1"
              style={{ pointerEvents: 'auto', color: '#FFFFFF' }}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Promo Card hover tip bubble when color not saved: shows "Change theme" */}
      {isCurrentRouteModified() && isPromptMode && pcHoverTip.visible && !colorPromptSaved && colorPromptClosedWithoutSave && (
        <div
          key={`pc-hover-change-${activeThemeColor}`}
          className="fixed"
          style={{ left: pcHoverTip.x, top: pcHoverTip.y, pointerEvents: 'none', zIndex: 999999999 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md"
            style={{
              backgroundColor: '#1f2937', // Dark container color
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>Change theme</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePromptClick('flight-journey-bar', { themeColor: activeThemeColor }, { x: pcHoverTip.x, y: pcHoverTip.y });
              }}
              className="w-6 h-6 rounded-full border flex items-center justify-center"
              title="Change theme"
              style={{ pointerEvents: 'auto', borderColor: '#FFFFFF', color: '#FFFFFF' }}
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
                    ...(typeof activeThemeColor === 'string' && activeThemeColor.includes('gradient')
                      ? { background: activeThemeColor }
                      : { backgroundColor: activeThemeColor })
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
                            handlePromptClick('flight-journey-bar', { themeColor: activeThemeColor }, position);
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

      {/* Content Card hover tip bubble */}
      {isCurrentRouteModified() && isPromptMode && ccHoverTip.visible && colorPromptSaved && (
        <div
          key={`cc-hover-${activeThemeColor}`}
          className="fixed"
          style={{ left: ccHoverTip.x, top: ccHoverTip.y, pointerEvents: 'none', zIndex: 999999999 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md"
            style={{
              backgroundColor: '#1f2937', // Dark container color
              borderColor: hoverBorderColor,
              opacity: 1,
              borderTopLeftRadius: 0
            }}
          >
            <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
              Content
            </span>
            <div className="w-px h-4 bg-white/30"></div>
            <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
              Analytics
            </span>
            <div className="w-px h-4 bg-white/30"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRoutePromptBubbles({});
                setIsPromptMode(false);
              }}
              className="w-4 h-4 flex items-center justify-center ml-1"
              style={{ pointerEvents: 'auto', color: '#FFFFFF' }}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
