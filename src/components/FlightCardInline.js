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
  const [isThemeBuilding, setIsThemeBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  // Circular progress bar component
  const CircularProgressBar = ({ progress, size = 24 }) => {
    const radius = (size - 4) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="white"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s ease-in-out'
            }}
          />
        </svg>
      </div>
    );
  };

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
        animation: isThemeBuilding ? 'none' : 'themedCardSlideIn 0.8s ease-out forwards'
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
        
        <div 
          className="flex justify-between items-stretch"
          style={{
            opacity: isThemeBuilding ? 0 : 1,
            animation: isThemeBuilding ? 'contentFadeOut 0.5s ease-out forwards' : 'none'
          }}
        >
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
                setIsThemeBuilding(false);
                setBuildProgress(0);
                console.log('Done clicked - exiting edit mode');
              }}
            >
              Done
            </button>
          </div>
        </div>
        
        {/* Circular progress bar when theme building */}
        {isThemeBuilding && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <CircularProgressBar progress={buildProgress} size={32} />
              <span className="text-white text-xs font-medium">Building theme...</span>
            </div>
          </div>
        )}
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
          
          {/* Edit button */}
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
                e.stopPropagation(); // Prevent card selection when clicking edit
                console.log('Edit flight card', index, segment);
                
                // Trigger animation sequence
                if (typeof onEditTheme === 'function') {
                  onEditTheme(index, segment);
                }
                setIsInEditMode(true);
                
                // Start theme building after a short delay
                setTimeout(() => {
                  setIsThemeBuilding(true);
                  
                  // Simulate progress updates
                  let progress = 0;
                  const progressInterval = setInterval(() => {
                    progress += Math.random() * 20 + 5; // Random progress increment
                    if (progress >= 100) {
                      progress = 100;
                      setBuildProgress(progress);
                      clearInterval(progressInterval);
                      
                      // Complete the theme building after progress reaches 100%
                      setTimeout(() => {
                        setIsThemeBuilding(false);
                        setIsInEditMode(false);
                        setBuildProgress(0);
                      }, 500);
                    } else {
                      setBuildProgress(progress);
                    }
                  }, 300);
                }, 1000);
              }}
            >
              Build theme
            </button>
          </div>

        </div>
        </div>
      </div>
    </>
  );
}


