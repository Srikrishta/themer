import { getReadableOnColor, getLightCardBackgroundColor } from '../utils/color';
import { useState, useEffect, useCallback } from 'react';
import { getPromoCardContent, shouldUseFestivalContent } from '../utils/festivalUtils';
import { getNonFestiveCardContent } from '../data/festivalContent';
import { getPollinationsImage } from '../utils/unsplash';
import { ArrowPathIcon } from '@heroicons/react/24/outline';


export default function Component3Cards({ 
  themeColor = '#1E1E1E', 
  routes = [], 
  isPromptMode = false, 
  onPromptHover, 
  onPromptClick, 
  promptStates = {}, 
  animationProgress = 0, 
  cruiseLabelShown = false, 
  middleCardPromptClosed = false, 
  isThemeBuildStarted = true,
  colorPromptSaved = false,
  origin,
  destination,
  selectedFlightPhase,
  promoCardContents,
  colorPromptClosedWithoutSave,
  currentRouteKey,
  isModifyClicked,
  selectedDates,
  isCurrentThemeFestive,
  getRouteSelectedThemeChip,
  onPromoCardHover
}) {
  // State for tracking image loading
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Helper functions for image loading state management
  const setImageLoading = (cardIndex, isLoading) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [cardIndex]: isLoading
    }));
  };

  const isImageLoading = (cardIndex) => {
    return imageLoadingStates[cardIndex] || false;
  };

  // Force re-render when colorPromptSaved changes
  useEffect(() => {
    console.log('=== COMPONENT3CARDS COLORPROMPTSAVED CHANGED ===', {
      colorPromptSaved,
      selectedFlightPhase,
      origin,
      destination,
      themeColor,
      selectedDates,
      hasOrigin: !!origin,
      hasDestination: !!destination,
      hasSelectedFlightPhase: !!selectedFlightPhase,
      hasSelectedDates: !!selectedDates && selectedDates.length > 0
    });
  }, [colorPromptSaved, selectedFlightPhase, origin, destination, themeColor, selectedDates]);

  // Debug when promoCardContents changes
  useEffect(() => {
    console.log('=== COMPONENT3CARDS PROMOCARDCONTENTS CHANGED ===', {
      currentRouteKey,
      selectedFlightPhase,
      promoCardContents,
      routeContents: currentRouteKey ? promoCardContents[currentRouteKey] : null,
      phaseKey: currentRouteKey && selectedFlightPhase ? `${currentRouteKey}-${selectedFlightPhase}` : null,
      phaseContents: (currentRouteKey && selectedFlightPhase) ? promoCardContents[`${currentRouteKey}-${selectedFlightPhase}`] : null
    });
  }, [promoCardContents, currentRouteKey, selectedFlightPhase]);




  // Skeleton component for loading state
  const SkeletonCard = () => (
    <div
      className="h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center bg-white/60 border border-gray-300"
      style={{ width: '416px' }}
    >
      <div className="space-y-3 text-center w-full px-6">
        <div className="h-8 rounded w-48 mx-auto bg-gray-200"></div>
        <div className="h-6 rounded w-32 mx-auto bg-gray-200"></div>
      </div>
    </div>
  );

  // Show skeleton state based on routes length and theme build status
  const showAllSkeletons = ((!isThemeBuildStarted && !isPromptMode) || (routes.length < 2 && !isPromptMode));








  // Helper function for default card content
  const getDefaultCardContent = (cardIndex) => {
    console.log('=== GETDEFAULTCARDCONTENT CALLED ===', {
      cardIndex,
      currentRouteKey,
      selectedFlightPhase,
      promoCardContents,
      hasRouteKey: !!currentRouteKey,
      hasRouteContents: !!(currentRouteKey && promoCardContents[currentRouteKey]),
      hasCardContent: !!(currentRouteKey && promoCardContents[currentRouteKey] && promoCardContents[currentRouteKey][cardIndex])
    });

    // Prefer content saved for the current phase, then fallback to route-level saved content
    const phaseKey = (currentRouteKey && selectedFlightPhase)
      ? `${currentRouteKey}-${selectedFlightPhase}`
      : null;

    const savedForPhase = phaseKey && promoCardContents[phaseKey]
      ? promoCardContents[phaseKey][cardIndex]
      : undefined;

    const savedForRoute = (currentRouteKey && promoCardContents[currentRouteKey])
      ? promoCardContents[currentRouteKey][cardIndex]
      : undefined;

    const savedContent = savedForPhase || savedForRoute;

    if (savedContent) {
      console.log('=== USING SAVED PROMO CARD CONTENT ===', {
        currentRouteKey,
        phaseKey,
        cardIndex,
        from: savedForPhase ? 'phase' : 'route',
        savedContent,
        textValue: savedContent.text,
        imageValue: savedContent.image
      });
      return {
        text: savedContent.text || "Add experience",
        image: savedContent.image || '',
        backgroundImage: savedContent.backgroundImage || '',
        bgColor: getLightCardBackgroundColor(themeColor)
      };
    }
    
    // Only generate festival content if:
    // 1. Theme is saved for this route
    // 2. Current theme is actually festive (not non-festive like Lufthansa)
    // 3. Required data is available
    if (colorPromptSaved && isCurrentThemeFestive && isCurrentThemeFestive() && selectedFlightPhase && origin && destination) {
      console.log('=== GETTING FESTIVAL CONTENT FOR PROMO CARD ===', {
        colorPromptSaved,
        isFestive: isCurrentThemeFestive(),
        selectedThemeChip: getRouteSelectedThemeChip(),
        selectedFlightPhase,
        origin,
        destination,
        cardIndex,
        selectedDates
      });
      
      // Handle both string and object formats for origin/destination
      const originCity = typeof origin === 'string' ? origin : origin?.airport?.city || origin;
      const destCity = typeof destination === 'string' ? destination : destination?.airport?.city || destination;
      
      const segment = { 
        origin: { airport: { city: originCity } }, 
        destination: { airport: { city: destCity } } 
      };
      
      // Use default dates if none are selected
      const datesToUse = selectedDates && selectedDates.length > 0 ? selectedDates : ['2024-09-15'];
      
      const festivalContent = getPromoCardContent(segment, datesToUse, selectedFlightPhase, cardIndex, themeColor);
      console.log('=== FESTIVAL CONTENT RESULT ===', {
        festivalContent,
        hasText: !!festivalContent?.text,
        hasImage: !!festivalContent?.image
      });
      
      if (festivalContent && festivalContent.text) {
        return { 
          text: festivalContent.text, 
          image: festivalContent.image || '', 
          bgColor: getLightCardBackgroundColor(themeColor) 
        };
      }
    } else {
      console.log('=== SKIPPING FESTIVAL CONTENT GENERATION FOR PROMO CARD ===', {
        colorPromptSaved,
        isFestive: isCurrentThemeFestive ? isCurrentThemeFestive() : 'function not provided',
        selectedThemeChip: getRouteSelectedThemeChip ? getRouteSelectedThemeChip() : 'function not provided',
        reason: !colorPromptSaved ? 'theme not saved' : 
                !isCurrentThemeFestive ? 'validation function not provided' :
                !isCurrentThemeFestive() ? 'theme not festive' : 
                'missing required data'
      });
    }
    
    // For non-festive themes or when theme is saved but not festive, use non-festive content
    if (colorPromptSaved && selectedFlightPhase) {
      console.log('=== GETTING NON-FESTIVE CONTENT FOR PROMO CARD ===', {
        selectedFlightPhase,
        cardIndex,
        colorPromptSaved
      });
      
      const nonFestiveContent = getNonFestiveCardContent(selectedFlightPhase, 'promo', cardIndex);
      console.log('=== NON-FESTIVE CONTENT RESULT ===', {
        nonFestiveContent,
        hasText: !!nonFestiveContent?.text,
        hasImage: !!nonFestiveContent?.image
      });
      
      if (nonFestiveContent && nonFestiveContent.text) {
        return { 
          text: nonFestiveContent.text, 
          image: nonFestiveContent.image || '', 
          bgColor: getLightCardBackgroundColor(themeColor) 
        };
      }
    }
    
    // Final fallback for unsaved themes
    return { text: "Add experience", bgColor: getLightCardBackgroundColor(themeColor) };
  };






  // Helper function to render a single card with original styling
  const renderCard = (originalCardIndex, displayPosition) => {
    // Simple card content - always show "Add experience"
    const cardContent = getDefaultCardContent(originalCardIndex);
    
    console.log('=== RENDER CARD DEBUG ===', {
      originalCardIndex,
      displayPosition,
      cardContent,
      textValue: cardContent.text,
      imageValue: cardContent.image,
      textType: typeof cardContent.text,
      imageType: typeof cardContent.image
    });
    
    // Get card type mapping
    const cardTypeMap = {
      0: { type: 'shopping', name: 'add experience', id: 'node-82_35814' },
      1: { type: 'meal', name: 'add experience', id: 'node-82_35815' },
      2: { type: 'movie', name: 'add experience', id: 'node-82_35816' }
    };
    
    const cardInfo = cardTypeMap[originalCardIndex];
    
    const cardStyle = {
      width: '416px',
      background: cardContent.bgColor
    };

    return (
      <div
        key={`card-${originalCardIndex}-${displayPosition}`}
        className="h-[200px] overflow-clip relative shrink-0 flex items-center justify-center rounded-lg"
        style={cardStyle}
        data-name={cardInfo.name}
        data-card-index={originalCardIndex}
        id={cardInfo.id}
        onMouseEnter={(e) => {
          if (isPromptMode && colorPromptSaved && onPromoCardHover) {
            // Use actual mouse cursor position like FlightJourneyBar does
            const position = { x: e.clientX, y: e.clientY };
            onPromoCardHover(
              true,
              'promo-card',
              { cardIndex: originalCardIndex, cardType: cardInfo.type, currentContent: cardContent },
              position
            );
          }
        }}
        onMouseMove={(e) => {
          if (isPromptMode && colorPromptSaved && onPromoCardHover) {
            // Continuously update position as mouse moves within the card
            const position = { x: e.clientX, y: e.clientY };
            onPromoCardHover(
              true,
              'promo-card',
              { cardIndex: originalCardIndex, cardType: cardInfo.type, currentContent: cardContent },
              position
            );
          }
        }}
        onMouseLeave={(e) => {
          if (isPromptMode && colorPromptSaved && onPromoCardHover) {
            onPromoCardHover(false, 'promo-card', { cardIndex: originalCardIndex, cardType: cardInfo.type }, { x: 0, y: 0 });
          }
        }}
      >
          <div className="relative h-full w-full">
            
            {/* Image area - show image if available */}
            {cardContent.image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full relative">
                  {/* Loading spinner */}
                  {isImageLoading(originalCardIndex) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="flex flex-col items-center space-y-2">
                        <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-600" />
                        <span className="text-xs text-gray-600">Loading image...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Image */}
                  {(() => {
                    const imageSrc = (cardContent && cardContent.backgroundImage)
                      ? cardContent.backgroundImage
                      : getPollinationsImage(cardContent.image, themeColor);
                    return (
                      <img 
                        src={imageSrc}
                        alt={cardContent.image}
                        className="w-full h-full object-cover rounded-lg"
                        style={{ display: isImageLoading(originalCardIndex) ? 'none' : 'block' }}
                        onLoad={() => {
                          console.log('=== POLLINATIONS IMAGE LOADED ===', { cardIndex: originalCardIndex, alt: cardContent.image });
                          setImageLoading(originalCardIndex, false);
                        }}
                        onError={(e) => {
                          console.log('=== POLLINATIONS IMAGE LOAD ERROR ===', { src: e.target.src, alt: cardContent.image });
                          setImageLoading(originalCardIndex, false);
                          e.target.style.display = 'none';
                        }}
                        onLoadStart={() => {
                          console.log('=== POLLINATIONS IMAGE LOAD START ===', { cardIndex: originalCardIndex, alt: cardContent.image });
                          setImageLoading(originalCardIndex, true);
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            )}
            
            {/* Bottom rectangle with text field */}
            <div 
              className="absolute bottom-0 left-0 right-0 z-10 p-2 rounded-b-lg"
              style={{ 
                backgroundColor: getReadableOnColor(themeColor),
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center'
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
                {cardContent.text}
              </p>
            </div>
          </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="flex flex-row gap-8 items-center justify-center mx-auto"
        style={{ width: '1302px' }}
        data-name="3-cards"
        id="node-82_36633"
      >
      {showAllSkeletons ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          {/* Render cards in fixed order */}
          {[0, 1, 2].map((originalCardIndex, displayPosition) => 
            renderCard(originalCardIndex, displayPosition)
          )}
        </>
      )}
      </div>
    </>
  );
}