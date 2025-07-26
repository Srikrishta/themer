const imgAddAnImageOfShoppingForAutumn = "http://localhost:3845/assets/1266af881a7ac302ff4354e6e0ba4679fe254e8e.png";
const img = "http://localhost:3845/assets/2fdc952022798f520df8d037b66e1f103b6d7faa.png";
const img1 = "http://localhost:3845/assets/8d7d40ef4f429a13e10999470feaad2d251c67ed.png";
const imgAutumnMeal = "http://localhost:3845/assets/67867be324b149fdbc2f5cc31419dd992f7ae245.png";
const imgAddAnAutumnMovie = "http://localhost:3845/assets/8ea70d2052f6ce510170e999f000793ea6f8a1cb.png";
const img2 = "http://localhost:3845/assets/1bd3170f3986d13a6502916089cd682ffee55e02.svg";

export default function Component3Cards({ themeColor = '#1E1E1E', routes = [], isPromptMode = false, onPromptHover, onPromptClick, promptStates = {} }) {
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
            style={{ width: '416px', background: themeColor }}
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
            {promptStates['promo-card-0'] ? (
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
              <p className="block text-center text-white font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
                Add title
              </p>
            )}
          </div>
          <div
            className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
            style={{ width: '416px', background: themeColor }}
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
            <p className="block text-center text-white font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
              Add title
            </p>
          </div>
          <div
            className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
            style={{ width: '416px', background: themeColor }}
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
            <p className="block text-center text-white font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
              Add title
            </p>
          </div>
        </>
      )}
    </div>
  );
} 