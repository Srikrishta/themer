import React from 'react';

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

export default function FlightCardInline({ segment, index, activeIndex, onSelect, onTriggerPromptBubble, onEnterPromptMode, themeColor = '#1E1E1E' }) {

  const isActive = activeIndex === index;

  // Helper function to create animated border overlay for active state
  const getAnimatedBorderOverlay = () => {
    if (!isActive) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px', 
          bottom: '-2px',
          borderRadius: '9999px', // full rounded
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientAnimation 3s ease infinite',
          zIndex: -1,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          padding: '2px',
          opacity: 1
        }}
      />
    );
  };

  return (
    <>
      <style>{gradientAnimationCSS}</style>
      <div className="w-full flex-1 min-w-0 basis-0" onClick={() => typeof onSelect === 'function' && onSelect(index)}>
        <div 
          className={`backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.1)] pl-5 pr-3 py-4 rounded-full shadow-sm w-full relative ${isActive ? 'shadow-lg' : 'hover:shadow-md'}`}
          style={{
            position: 'relative',
            border: isActive ? '2px solid transparent' : 'none',
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
              className="px-3 py-1 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card selection when clicking edit
                // TODO: Add edit functionality
                console.log('Edit flight card', index, segment);
              }}
            >
              Edit
            </button>
          </div>

        </div>
        </div>
      </div>
    </>
  );
}


