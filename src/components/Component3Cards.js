const imgAddAnImageOfShoppingForAutumn = "http://localhost:3845/assets/1266af881a7ac302ff4354e6e0ba4679fe254e8e.png";
const img = "http://localhost:3845/assets/2fdc952022798f520df8d037b66e1f103b6d7faa.png";
const img1 = "http://localhost:3845/assets/8d7d40ef4f429a13e10999470feaad2d251c67ed.png";
const imgAutumnMeal = "http://localhost:3845/assets/67867be324b149fdbc2f5cc31419dd992f7ae245.png";
const imgAddAnAutumnMovie = "http://localhost:3845/assets/8ea70f2052f6ce510170e999f000793ea6f8a1cb.png";
const img2 = "http://localhost:3845/assets/1bd3170f3986d13a6502916089cd682ffee55e02.svg";

export default function Component3Cards({ themeColor = '#1E1E1E', routes = [], isPromptMode = false, onPromptHover, onPromptClick, promptStates = {}, animationProgress = 0, cruiseLabelShown = false, middleCardPromptClosed = false }) {
  // Skeleton component for loading state
  const SkeletonCard = () => (
    <div
      className="h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center bg-gray-200"
      style={{ width: '416px' }}
    >
      <div className="animate-pulse space-y-3 text-center">
        <div className="h-8 bg-gray-300 rounded w-48 mx-auto"></div>
        <div className="h-6 bg-gray-300 rounded w-32 mx-auto"></div>
      </div>
    </div>
  );

  // Show skeleton state based on routes length
  const showAllSkeletons = routes.length < 2; // Keep skeletons until 2+ routes

  // Determine card content based on animation progress and cruise label state
  const getCardContent = (cardIndex) => {
    if (middleCardPromptClosed) {
      // When middle card prompt is closed, update both middle and left cards
      if (cardIndex === 0) {
        // Left card - French cuisine
        return {
          text: "Enjoy French cuisine",
          backgroundImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: "#f3f4f6"
        };
      } else if (cardIndex === 1) {
        // Middle card - Croissants
        return {
          text: "Croissants at 3€",
          backgroundImage: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: "#f3f4f6"
        };
      } else {
        // Right card - keep original content
        return {
          text: "Connect your device",
          backgroundImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: "#f3f4f6"
        };
      }
    } else if (cruiseLabelShown && !middleCardPromptClosed) {
      // When Cruise label has appeared - show "add text" (but only if middle card prompt hasn't closed)
      const cruiseContent = [
        { text: "add text", bgColor: themeColor },
        { text: "add text", bgColor: themeColor },
        { text: "add text", bgColor: themeColor }
      ];
      return cruiseContent[cardIndex];
    } else if (animationProgress >= 0.20) {
      // At 20% progress - themed state
      const themedContent = [
        { text: "Welcome drink", bgColor: themeColor },
        { text: "Settle in", bgColor: themeColor },
        { text: "Connect your device", bgColor: themeColor }
      ];
      return themedContent[cardIndex];
    } else if (animationProgress >= 0.05) {
      // At 5% progress - specific content with images
      const contentWithImages = [
        { 
          text: "Welcome drink", 
          backgroundImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: "#f3f4f6"
        },
        { 
          text: "Settle in", 
          backgroundImage: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: "#f3f4f6"
        },
        { 
          text: "Connect your device", 
          backgroundImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: "#f3f4f6"
        }
      ];
      return contentWithImages[cardIndex];
    } else {
      // Default state
      return { text: "Add title", bgColor: themeColor };
    }
  };

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
            className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
            style={{ 
              width: '416px', 
              background: getCardContent(0).bgColor,
              backgroundImage: getCardContent(0).backgroundImage ? `url(${getCardContent(0).backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
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
                  <p className="block text-center text-white font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
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
                <p className="block text-center font-bold relative z-10" 
                   style={{ 
                     fontSize: '28px', 
                     lineHeight: '36px', 
                     margin: 0,
                     color: getCardContent(0).backgroundImage ? 'white' : 'white'
                   }}>
                  {getCardContent(0).text}
                </p>

              </div>
            )}
          </div>
          <div
            className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
            style={{ 
              width: '416px', 
              background: getCardContent(1).bgColor,
              backgroundImage: getCardContent(1).backgroundImage ? `url(${getCardContent(1).backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
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
              if (isPromptMode && onPromptClick) {
                e.stopPropagation();
                onPromptClick('promo-card', { cardIndex: 1, cardType: 'meal' }, { x: e.clientX, y: e.clientY });
              }
            }}
          >
            <div className="relative h-full w-full flex items-center justify-center">
              {getCardContent(1).backgroundImage && (
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
              )}
              <p className="block text-center font-bold relative z-10" 
                 style={{ 
                   fontSize: '28px', 
                   lineHeight: '36px', 
                   margin: 0,
                   color: getCardContent(1).backgroundImage ? 'white' : 'white'
                 }}>
                {getCardContent(1).text}
              </p>
            </div>
          </div>
          <div
            className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
            style={{ 
              width: '416px', 
              background: getCardContent(2).bgColor,
              backgroundImage: getCardContent(2).backgroundImage ? `url(${getCardContent(2).backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
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
              <p className="block text-center font-bold relative z-10" 
                 style={{ 
                   fontSize: '28px', 
                   lineHeight: '36px', 
                   margin: 0,
                   color: getCardContent(2).backgroundImage ? 'white' : 'white'
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