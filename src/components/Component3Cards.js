import { getReadableOnColor } from '../utils/color';
import { useState, useEffect, useCallback } from 'react';

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
  isThemeBuildStarted = true
}) {


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


  // Helper function to get animated border overlay for specific cards
  const getAnimatedBorderOverlay = (cardIndex) => {
    if (!(isPromptMode && isThemeBuildStarted && promptStates[cardIndex]?.showAnimation)) {
      return null;
    }
    
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
      background: cardContent.bgColor,
      border: 'none'
    };


    return (
      <div
        key={`card-${originalCardIndex}-${displayPosition}`}
        className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
        style={cardStyle}
        data-name={cardInfo.name}
        data-card-index={originalCardIndex}
        id={cardInfo.id}
        // Hover and click handlers removed for promo cards
      >
        {getAnimatedBorderOverlay(originalCardIndex)}
          <div className="relative h-full w-full">
            
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
      <style>{gradientAnimationCSS}</style>
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