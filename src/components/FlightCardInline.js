import React, { useState } from 'react';

// Add CSS animation for gradient border and edit theme animations
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
  
  @keyframes containerScrollUp {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh);
      opacity: 0;
    }
  }
  
  @keyframes themedCardSlideIn {
    0% {
      transform: translateY(100vh);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes contentFadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default function FlightCardInline({ segment, index, activeIndex, onSelect, onTriggerPromptBubble, onEnterPromptMode, themeColor = '#1E1E1E', onEditTheme }) {

  const isActive = activeIndex === index;
  const [isInEditMode, setIsInEditMode] = useState(false);



  // Helper function to create animated border overlay for active state
  const getAnimatedBorderOverlay = () => {
    if (!isActive) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          top: '-1px',
          left: '-1px',
          right: '-1px', 
          bottom: '-1px',
          borderRadius: '9999px', // full rounded
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientAnimation 3s ease infinite',
          zIndex: -1,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          padding: '1px',
          opacity: 1
        }}
      />
    );
  };

  // Themed flight card component with 3 buttons that slides in from bottom
  const ThemedFlightCard = () => (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        animation: 'themedCardSlideIn 0.8s ease-out forwards'
      }}
    >
      <div 
        className="backdrop-blur-[10px] backdrop-filter pl-5 pr-3 py-4 rounded-full shadow-lg relative"
        style={{
          ...(typeof themeColor === 'string' && themeColor.includes('gradient')
            ? { background: themeColor }
            : { backgroundColor: themeColor }),
          width: 'auto',
          minWidth: '500px',
          border: isActive ? '1px solid transparent' : 'none'
        }}
      >
        {/* Animated border overlay for selected card in dark overlay */}
        {isActive && (
          <div
            style={{
              position: 'absolute',
              top: '-1px',
              left: '-1px',
              right: '-1px', 
              bottom: '-1px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientAnimation 3s ease infinite',
              zIndex: -1,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              padding: '1px',
              opacity: 1
            }}
          />
        )}
        
        <div className="flex justify-between items-stretch">
          <div className="flex items-start gap-1 flex-none pr-0" style={{ paddingRight: 6 }}>
            <div className="flex-none">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-white text-black"
                >
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold text-white break-words">
                  {segment?.origin?.airport?.city} → {segment?.destination?.airport?.city}
                </h3>
              </div>
            </div>
          </div>
          
          {/* Build theme button with progress bar */}
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Add logo clicked', index, segment);
              }}
            >
              Add logo
            </button>
            <button
              className="px-3 py-1 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Change theme clicked', index, segment);
                // Trigger the color change prompt bubble
                if (typeof onTriggerPromptBubble === 'function') {
                  const position = { x: window.innerWidth / 2, y: 400 };
                  onTriggerPromptBubble('flight-journey-bar', { themeColor: themeColor }, position);
                }
              }}
            >
              Change theme
            </button>
            <button
              className="px-3 py-1 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Modify flight content clicked', index, segment);
              }}
            >
              Modify flight content
            </button>
            <button
              className="px-3 py-1 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors ml-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsInEditMode(false);
                console.log('Done clicked - exiting edit mode');
              }}
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <>
      <style>{gradientAnimationCSS}</style>
      
      {/* Show themed card overlay when in edit mode */}
      {isInEditMode && <ThemedFlightCard />}
      
      <div className="w-full flex-1 min-w-0 basis-0" onClick={() => typeof onSelect === 'function' && onSelect(index)}>
        <div 
          className={`backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.1)] pl-5 pr-3 py-4 rounded-full shadow-sm w-full relative ${isActive ? 'shadow-lg' : 'hover:shadow-md'}`}
          style={{
            position: 'relative',
            border: isActive ? '1px solid transparent' : 'none',
          }}
        >
          {getAnimatedBorderOverlay()}
          <div className={`flex justify-between items-stretch ${isActive ? 'opacity-100' : 'opacity-70'}`}>
          <div className="flex items-start gap-1 flex-none pr-0" style={{ paddingRight: 6 }}>
            <div className="flex-none">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-white text-black"
                >
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold text-white break-words">
                  {segment?.origin?.airport?.city} → {segment?.destination?.airport?.city}
                </h3>
              </div>
            </div>
          </div>
          
          {/* Modify button */}
          <div className="flex items-center">
            <button
              className={`px-3 py-1 text-xs font-medium text-white transition-colors ${
                isActive 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              style={{ 
                borderTopLeftRadius: '0px', 
                borderTopRightRadius: '9999px', 
                borderBottomLeftRadius: '9999px', 
                borderBottomRightRadius: '9999px' 
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card selection when clicking build theme
                console.log('Build Theme clicked', index, segment);
                
                // Trigger animation sequence
                if (typeof onEditTheme === 'function') {
                  onEditTheme(index, segment);
                }
                setIsInEditMode(true);
              }}
            >
              Build Theme
            </button>
          </div>

        </div>
        </div>
      </div>
    </>
  );
}


