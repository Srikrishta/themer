import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Mock data for the theme preview
  const mockOrigin = { airport: { city: 'Berlin', code: 'BER' } };
  const mockDestination = { airport: { city: 'Paris', code: 'CDG' } };
  const mockMinutesLeft = 370;
  const mockRoutes = [mockOrigin, mockDestination];
  
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
  
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
  };
  
  const landingIn = formatTime(mockMinutesLeft);

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
                  <FlightJourneyBar origin={mockOrigin} destination={mockDestination} minutesLeft={mockMinutesLeft} themeColor={mockThemeColor} />
                  <FlightProgress 
                    landingIn={landingIn} 
                    maxFlightMinutes={370} 
                    minutesLeft={mockMinutesLeft} 
                    onProgressChange={() => {}} 
                    themeColor={mockThemeColor}
                    isPromptMode={false}
                    onPromptHover={() => {}}
                    onPromptClick={() => {}}
                    fpsPrompts={{}}
                    showMovingIcon={true}
                  />
                </div>
              </div>
              <Component3Cards 
                themeColor={mockThemeColor} 
                routes={mockRoutes}
                isPromptMode={false}
                onPromptHover={() => {}}
                onPromptClick={() => {}}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 