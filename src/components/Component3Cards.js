import { getReadableOnColor } from '../utils/color';
const imgAddAnImageOfShoppingForAutumn = "http://localhost:3845/assets/1266af881a7ac302ff4354e6e0ba4679fe254e8e.png";
const img = "http://localhost:3845/assets/2fdc952022798f520df8d037b66e1f103b6d7faa.png";
const img1 = "http://localhost:3845/assets/8d7d40ef4f429a13e10999470feaad2d251c67ed.png";
const imgAutumnMeal = "http://localhost:3845/assets/67867be324b149fdbc2f5cc31419dd992f7ae245.png";
const imgAddAnAutumnMovie = "http://localhost:3845/assets/8ea70f2052f6ce510170e999f000793ea6f8a1cb.png";
const img2 = "http://localhost:3845/assets/1bd3170f3986d13a6502916089cd682ffee55e02.svg";

export default function Component3Cards({ themeColor = '#1E1E1E', routes = [], isPromptMode = false, onPromptHover, onPromptClick, promptStates = {}, animationProgress = 0, cruiseLabelShown = false, middleCardPromptClosed = false, isThemeBuildStarted = true }) {
  console.log('=== COMPONENT3CARDS RENDER ===', {
    isPromptMode, 
    cruiseLabelShown, 
    middleCardPromptClosed,
    hasOnPromptClick: !!onPromptClick
  });

  // Helper function to create lighter version of theme color
  const getLightThemeColor = (opacity = 0.3) => {
    if (themeColor.startsWith('#')) {
      // Convert hex to rgba with opacity
      const hex = themeColor.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return `rgba(255,255,255,${opacity})`; // fallback
  };
  // White placeholder component for loading state (no skeleton, just white background)
  const SkeletonCard = () => (
    <div
      className="h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
      style={{ width: '416px', backgroundColor: getLightThemeColor(0.1) }}
    >
    </div>
  );

  // Show skeletons only when not in prompt mode; in prompt mode, render interactive cards for hover/click
  // Stay skeleton until Build theme clicked, but allow prompt mode to render interactive PB wrappers
  const showAllSkeletons = ((!isThemeBuildStarted && !isPromptMode) || (routes.length < 2 && !isPromptMode));

  // Determine card content based on animation progress and cruise label state
  const getCardContent = (cardIndex) => {
    if (middleCardPromptClosed) {
      // When middle card prompt is closed, update both middle and left cards
      console.log('=== UPDATING CARD CONTENT ===', { cardIndex, middleCardPromptClosed });
      if (cardIndex === 0) {
        // Left card - French cuisine
        return {
          text: "Enjoy French cuisine",
          backgroundImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor(0.1)
        };
      } else if (cardIndex === 1) {
        // Middle card - Croissants
        return {
          text: "Croissants at 3€",
          backgroundImage: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor(0.1)
        };
      } else {
        // Right card - keep original content
        return {
          text: "Connect your device",
          backgroundImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor(0.1)
        };
      }
    } else if (cruiseLabelShown && !middleCardPromptClosed) {
      // When Cruise label has appeared - show "add text" (but only if middle card prompt hasn't closed)
      const cruiseContent = [
        { text: "add text", bgColor: getLightThemeColor(0.1) },
        { text: "add text", bgColor: getLightThemeColor(0.1) },
        { text: "add text", bgColor: "rgba(255,255,255,0.2)" }
      ];
      return cruiseContent[cardIndex];
    } else if (animationProgress >= 0.20) {
      // At 20% progress - themed state
      const themedContent = [
        { text: "Welcome drink", bgColor: "rgba(255,255,255,0.2)" },
        { text: "Settle in", bgColor: "rgba(255,255,255,0.2)" },
        { text: "Connect your device", bgColor: "rgba(255,255,255,0.2)" }
      ];
      return themedContent[cardIndex];
    } else if (animationProgress >= 0.05) {
      // At 5% progress - specific content with images
      const contentWithImages = [
        { 
          text: "Welcome drink", 
          backgroundImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor(0.1)
        },
        { 
          text: "Settle in", 
          backgroundImage: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor(0.1)
        },
        { 
          text: "Connect your device", 
          backgroundImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor(0.1)
        }
      ];
      return contentWithImages[cardIndex];
    } else {
      // Default state
      return { text: "Add experience", bgColor: getLightThemeColor(0.1) };
    }
  };

  // Use dark text for light backgrounds
  const onColor = '#000000';

  return (
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
          {/* All routes - show all cards filled */}
          <div
            className="h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
            style={{ 
              width: '416px', 
              backgroundColor: getCardContent(0).bgColor,
              backgroundImage: getCardContent(0).backgroundImage ? `url(${getCardContent(0).backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',

            }}

            data-name="croissants at 4€"
            id="node-82_35814"
            onMouseEnter={(e) => {
              if (isPromptMode && onPromptHover) {
                onPromptHover(true, 'promo-card', { cardIndex: 0, cardType: 'shopping' }, { x: e.clientX, y: e.clientY });
              }
            }}
            onMouseLeave={(e) => {
              if (isPromptMode && onPromptHover) {
                onPromptHover(false, 'promo-card', { cardIndex: 0, cardType: 'shopping' }, { x: e.clientX, y: e.clientY });
              }
            }}
            onMouseMove={(e) => {
              if (isPromptMode && onPromptHover) {
                onPromptHover(true, 'promo-card', { cardIndex: 0, cardType: 'shopping' }, { x: e.clientX, y: e.clientY });
              }
            }}
            onClick={(e) => {
              if (isPromptMode && onPromptClick) {
                e.stopPropagation();
                onPromptClick('promo-card', { cardIndex: 0, cardType: 'shopping' }, { x: e.clientX, y: e.clientY });
              }
            }}
          >
            {promptStates['promo-card-0'] && !middleCardPromptClosed ? (
              <div className="relative h-full w-full">
                <img 
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=416&h=200&fit=crop&crop=center" 
                  alt="Croissants" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                  <p className="block text-center text-white font-semibold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
                    Croissants at 3€
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative h-full w-full flex items-center justify-center">
                {getCardContent(0).backgroundImage && (
                  <>
                    <img 
                      src={getCardContent(0).backgroundImage}
                      alt="Background"
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
                  </>
                )}
                              <p className="block text-center font-semibold relative z-10" 
                 style={{ 
                   fontSize: '24px', 
                   lineHeight: '32px', 
                   margin: 0,
                   color: getCardContent(0).backgroundImage ? 'white' : onColor,
                   opacity: 0.7
                 }}>
                  {getCardContent(0).text}
                </p>

              </div>
            )}
          </div>
          <div
            className="h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
            style={{ 
              width: '416px', 
              backgroundColor: getCardContent(1).bgColor,
              backgroundImage: getCardContent(1).backgroundImage ? `url(${getCardContent(1).backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',

            }}
            data-name="autumn meal"
            id="node-82_35815"
            onMouseEnter={(e) => {
              if (isPromptMode && onPromptHover) {
                onPromptHover(true, 'promo-card', { cardIndex: 1, cardType: 'meal' }, { x: e.clientX, y: e.clientY });
              }
            }}
            onMouseLeave={(e) => {
              if (isPromptMode && onPromptHover) {
                onPromptHover(false, 'promo-card', { cardIndex: 1, cardType: 'meal' }, { x: e.clientX, y: e.clientY });
              }
            }}
            onMouseMove={(e) => {
              if (isPromptMode && onPromptHover) {
                onPromptHover(true, 'promo-card', { cardIndex: 1, cardType: 'meal' }, { x: e.clientX, y: e.clientY });
              }
            }}
            onClick={(e) => {
              console.log('=== MIDDLE CARD CLICKED ===', { 
                isPromptMode, 
                onPromptClick: !!onPromptClick,
                clientX: e.clientX,
                clientY: e.clientY
              });
              
              if (isPromptMode && onPromptClick) {
                e.stopPropagation();
                onPromptClick('promo-card', { cardIndex: 1, cardType: 'meal' }, { x: e.clientX, y: e.clientY });
              } else {
                console.log('=== CLICK NOT PROCESSED ===', { 
                  isPromptMode, 
                  hasOnPromptClick: !!onPromptClick 
                });
              }
            }}
          >
            <div className="relative h-full w-full flex items-center justify-center">
              {getCardContent(1).backgroundImage && (
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
              )}
              <p className="block text-center font-semibold relative z-10" 
                 style={{ 
                   fontSize: '24px', 
                   lineHeight: '32px', 
                   margin: 0,
                   color: getCardContent(1).backgroundImage ? 'white' : onColor,
                   opacity: 0.7
                 }}>
                {getCardContent(1).text}
              </p>
            </div>
          </div>
          <div
            className="h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
            style={{ 
              width: '416px', 
              backgroundColor: getCardContent(2).bgColor,
              backgroundImage: getCardContent(2).backgroundImage ? `url(${getCardContent(2).backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',

            }}
            data-name="add an autumn movie"
            id="node-82_35816"
            onMouseEnter={(e) => {
              if (isPromptMode && onPromptHover) {
                onPromptHover(true, 'promo-card', { cardIndex: 2, cardType: 'movie' }, { x: e.clientX, y: e.clientY });
              }
            }}
            onMouseLeave={(e) => {
              if (isPromptMode && onPromptHover) {
                onPromptHover(false, 'promo-card', { cardIndex: 2, cardType: 'movie' }, { x: e.clientX, y: e.clientY });
              }
            }}
            onMouseMove={(e) => {
              if (isPromptMode && onPromptHover) {
                onPromptHover(true, 'promo-card', { cardIndex: 2, cardType: 'movie' }, { x: e.clientX, y: e.clientY });
              }
            }}
            onClick={(e) => {
              if (isPromptMode && onPromptClick) {
                e.stopPropagation();
                onPromptClick('promo-card', { cardIndex: 2, cardType: 'movie' }, { x: e.clientX, y: e.clientY });
              }
            }}
          >
            <div className="relative h-full w-full flex items-center justify-center">
              {getCardContent(2).backgroundImage && (
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
              )}
              <p className="block text-center font-semibold relative z-10" 
                 style={{ 
                   fontSize: '24px', 
                   lineHeight: '32px', 
                   margin: 0,
                   color: getCardContent(2).backgroundImage ? 'white' : onColor,
                   opacity: 0.7
                 }}>
                {getCardContent(2).text}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 