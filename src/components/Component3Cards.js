import { getReadableOnColor } from '../utils/color';
import { useState, useEffect, useCallback } from 'react';
import { getPromoCardContent, shouldUseFestivalContent } from '../utils/festivalUtils';
import { getPollinationsImage } from '../utils/unsplash';


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
  selectedDates
}) {

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

  // Helper function to create lighter version of theme color (same as content cards)
  const getLightThemeColor = (opacity = 0.1) => {
    if (themeColor.startsWith('#')) {
      // Convert hex to rgba with opacity
      const hex = themeColor.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return 'rgba(255,255,255,0.1)';
  };



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
    // If theme is saved, try to get festival content
    if (colorPromptSaved && selectedFlightPhase && origin && destination) {
      console.log('=== GETTING FESTIVAL CONTENT FOR PROMO CARD ===', {
        colorPromptSaved,
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
      
      const useFestivalContent = shouldUseFestivalContent(segment, datesToUse, themeColor);
      
      console.log('=== FESTIVAL CONTENT CHECK ===', {
        segment,
        useFestivalContent,
        themeColor
      });
      
      if (useFestivalContent) {
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
            bgColor: getLightThemeColor() 
          };
        }
      }
    }
    
    // Fallback to default content
    return { text: "Add experience", bgColor: getLightThemeColor() };
  };






  // Helper function to render a single card with original styling
  const renderCard = (originalCardIndex, displayPosition) => {
    // Simple card content - always show "Add experience"
    const cardContent = getDefaultCardContent(originalCardIndex);
    
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
        // Hover and click handlers removed for promo cards
      >
          <div className="relative h-full w-full">
            
            {/* Image area - show image if available */}
            {cardContent.image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full">
                  <img 
                    src={getPollinationsImage(cardContent.image)}
                    alt={cardContent.image}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      console.log('=== POLLINATIONS IMAGE LOAD ERROR ===', { src: e.target.src, alt: cardContent.image });
                      e.target.style.display = 'none';
                    }}
                  />
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