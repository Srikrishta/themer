import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Mock data for the theme preview
  const mockOrigin = { airport: { city: 'Berlin', code: 'BER' } };
  const mockDestination = { airport: { city: 'Paris', code: 'CDG' } };
  const mockRoutes = [mockOrigin, mockDestination];
  
  // Countdown state for landing time
  const maxFlightMinutes = 185; // 3h 05m
  const [minutesLeft, setMinutesLeft] = useState(maxFlightMinutes);
  const timerRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [showMovingIcon, setShowMovingIcon] = useState(true); // Start with animation
  const [promoCardLoading, setPromoCardLoading] = useState(false);
  const [promoCardFinishedLoading, setPromoCardFinishedLoading] = useState(false);
  const [promptBubbleVisible, setPromptBubbleVisible] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  // Theme colors that will cycle every 3 seconds
  const themeColors = [
    '#3b82f6', // blue-500
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#84cc16'  // lime-500
  ];
  
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
  };
  
  // Countdown timer effect - only run when not in animation mode
  useEffect(() => {
    setMinutesLeft(maxFlightMinutes);
  }, [maxFlightMinutes]);

  useEffect(() => {
    if (dragging) return; // Pause timer while dragging
    if (minutesLeft <= 0) return;
    if (showMovingIcon) return; // Pause timer during flight icon animation
    
    console.log('Setting timer for minutesLeft:', minutesLeft);
    timerRef.current = setTimeout(() => {
      console.log('Timer fired, updating minutesLeft from:', minutesLeft, 'to:', minutesLeft - 1);
      setMinutesLeft((m) => (m > 0 ? m - 1 : 0));
    }, 60000); // Update every minute (same as Dashboard)
    return () => clearTimeout(timerRef.current);
  }, [minutesLeft, dragging, showMovingIcon]);

  // Handle animation progress changes
  const handleAnimationProgressChange = (newMinutes) => {
    console.log('Animation progress changed minutes to:', newMinutes);
    setMinutesLeft(newMinutes);
  };

  // Handle animation progress from FlightProgress
  const handleAnimationProgress = (progress) => {
    setAnimationProgress(progress);
  };

  // Handle progress bar drag
  const handleProgressChange = (newMinutes) => {
    setDragging(true);
    setMinutesLeft(newMinutes);
  };

  const handlePromoCardLoadingChange = (isLoading) => {
    setPromoCardLoading(isLoading);
    if (!isLoading && promoCardLoading) {
      // Loading just finished
      setPromoCardFinishedLoading(true);
    }
    // Don't automatically show prompt bubble - let FlightProgress control this
  };

  useEffect(() => {
    if (!dragging) return;
    const handleUp = () => setDragging(false);
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, [dragging]);
  
  const [currentThemeColorIndex, setCurrentThemeColorIndex] = useState(0);
  const mockThemeColor = themeColors[currentThemeColorIndex];
  
  // Cycle through theme colors every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThemeColorIndex((prevIndex) => 
        (prevIndex + 1) % themeColors.length
      );
    }, 7000);
    
    return () => clearInterval(interval);
  }, []);
  
  const landingIn = formatTime(minutesLeft);
  console.log('LandingPage - minutesLeft:', minutesLeft, 'landingIn:', landingIn);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold themer-gradient">Themer</span>
            </a>
          </div>
        </nav>
      </header>

      <main className="relative isolate">
        {/* Hero section */}
        <div className="overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-4 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-4xl gap-x-20 lg:mx-0 lg:flex lg:max-w-none lg:items-center lg:justify-center">
              <div className="w-full max-w-3xl lg:basis-1/2 xl:basis-1/2 lg:shrink-0 xl:max-w-3xl flex flex-col items-center text-center">
                <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 whitespace-nowrap text-center">
                  Personalize in-flight experiences.
                </h1>
                <p className="relative mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none text-center whitespace-nowrap">
                  Customize the in-flight entertainment experience based on their destination.
                </p>
                <div className="mt-10 flex items-center justify-center">
                  <div
                    onClick={() => navigate('/dashboard')}
                    className="bg-black shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 themer-animated-border"
                    style={{
                      width: '200px',
                      height: '48px',
                      borderRadius: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="text-lg font-semibold text-white">Create</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Theme Preview Section */}
        <div className="w-full flex justify-center" style={{ marginTop: 0 }}>
          <div style={{ position: 'relative', width: 1400, height: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <img
              src={process.env.PUBLIC_URL + '/ife-frame.svg'}
              alt="Mobile Frame"
              style={{ position: 'absolute', top: -40, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
            />
            <div style={{ position: 'relative', zIndex: 2, width: 1302, margin: '92px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
              <div className="fjb-fps-container" style={{ width: 1328, maxWidth: 1328, marginLeft: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: mockThemeColor + '14', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, paddingTop: 80, paddingBottom: 40, marginTop: 4 }}>
                <div style={{ width: '100%', marginTop: -32, display: 'flex', flexDirection: 'column', gap: 28 }}>
                  <FlightJourneyBar origin={mockOrigin} destination={mockDestination} minutesLeft={minutesLeft} themeColor={mockThemeColor} />
                  <FlightProgress 
                    landingIn={landingIn} 
                    maxFlightMinutes={maxFlightMinutes} 
                    minutesLeft={minutesLeft} 
                    onProgressChange={handleProgressChange} 
                    themeColor={mockThemeColor}
                    isPromptMode={false}
                    onPromptHover={() => {}}
                    onPromptClick={() => {}}
                    fpsPrompts={{}}
                    showMovingIcon={showMovingIcon}
                    onAnimationProgressChange={handleAnimationProgressChange}
                    onPromoCardLoadingChange={handlePromoCardLoadingChange}
                    onAnimationProgress={handleAnimationProgress}
                  />
                </div>
              </div>
              <Component3Cards 
                themeColor={mockThemeColor} 
                routes={mockRoutes}
                isPromptMode={false}
                onPromptHover={() => {}}
                onPromptClick={() => {}}
                promptStates={{ 'promo-card-0': false }} // Don't show promo card prompt bubble until FlightProgress controls it
                animationProgress={animationProgress}
              />
              
              {/* Recommended for you section */}
              <div
                className="flex flex-col items-start"
                style={{ width: '1302px', gap: '24px' }}
              >
                <p className="block text-left text-black font-bold" style={{ fontSize: '28px', lineHeight: '36px', margin: 0 }}>
                  Recommended for you
                </p>
                
                {/* 4 Recommended Tiles */}
                <div
                  className="grid grid-cols-4 gap-6"
                  style={{ width: '100%' }}
                >
                  {/* Tile 1 */}
                  <div
                    className="bg-black overflow-clip relative shrink-0 flex items-center justify-center"
                    style={{ 
                      width: '100%', 
                      height: '184px',
                      background: mockThemeColor,
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      borderBottomLeftRadius: '0px',
                      borderBottomRightRadius: '0px'
                    }}
                  >
                  </div>
                  
                  {/* Tile 2 */}
                  <div
                    className="bg-black overflow-clip relative shrink-0 flex items-center justify-center"
                    style={{ 
                      width: '100%', 
                      height: '184px',
                      background: mockThemeColor,
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      borderBottomLeftRadius: '0px',
                      borderBottomRightRadius: '0px'
                    }}
                  >
                  </div>
                  
                  {/* Tile 3 */}
                  <div
                    className="bg-black overflow-clip relative shrink-0 flex items-center justify-center"
                    style={{ 
                      width: '100%', 
                      height: '184px',
                      background: mockThemeColor,
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      borderBottomLeftRadius: '0px',
                      borderBottomRightRadius: '0px'
                    }}
                  >
                  </div>
                  
                  {/* Tile 4 */}
                  <div
                    className="bg-black overflow-clip relative shrink-0 flex items-center justify-center"
                    style={{ 
                      width: '100%', 
                      height: '184px',
                      background: mockThemeColor,
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      borderBottomLeftRadius: '0px',
                      borderBottomRightRadius: '0px'
                    }}
                  >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 