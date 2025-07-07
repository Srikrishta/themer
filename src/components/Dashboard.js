import { useState, useRef, useEffect } from 'react';
import ThemeCreator from './ThemeCreator';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
}

function FrameContent({ origin, destination, minutesLeft, landingIn, maxFlightMinutes, handleProgressChange }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, width: 1302, margin: '140px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      <FlightJourneyBar origin={origin} destination={destination} minutesLeft={minutesLeft} />
      <FlightProgress landingIn={landingIn} maxFlightMinutes={maxFlightMinutes} minutesLeft={minutesLeft} onProgressChange={handleProgressChange} />
      <Component3Cards />
    </div>
  );
}

export default function Dashboard() {
  // Lifted state for routes
  const [routes, setRoutes] = useState([]);
  const origin = routes.length > 0 ? routes[0] : null;
  const destination = routes.length > 1 ? routes[routes.length - 1] : null;

  // Countdown state
  const maxFlightMinutes = 370; // 6h10m
  const [minutesLeft, setMinutesLeft] = useState(maxFlightMinutes);
  const timerRef = useRef();
  const [dragging, setDragging] = useState(false);

  // Calculate initial position for ThemeCreator (bottom center)
  const [initialThemeCreatorPosition, setInitialThemeCreatorPosition] = useState(null);
  useEffect(() => {
    // Only set on first render
    if (initialThemeCreatorPosition === null) {
      const containerWidth = 480; // px, should match ThemeCreator default
      const containerHeight = 600; // px, min height
      const x = Math.max(0, (window.innerWidth - containerWidth) / 2);
      const y = Math.max(0, window.innerHeight - containerHeight - 32); // 32px margin from bottom
      setInitialThemeCreatorPosition({ x, y });
    }
  }, [initialThemeCreatorPosition]);

  useEffect(() => {
    setMinutesLeft(maxFlightMinutes);
  }, [maxFlightMinutes]);

  useEffect(() => {
    if (dragging) return; // Pause timer while dragging
    if (minutesLeft <= 0) return;
    timerRef.current = setTimeout(() => {
      setMinutesLeft((m) => (m > 0 ? m - 1 : 0));
    }, 60000);
    return () => clearTimeout(timerRef.current);
  }, [minutesLeft, dragging]);

  const landingIn = formatTime(minutesLeft);

  // Handle progress bar drag
  const handleProgressChange = (progress) => {
    setDragging(true);
    const newMinutes = Math.round(maxFlightMinutes * (1 - progress));
    setMinutesLeft(newMinutes);
  };
  useEffect(() => {
    if (!dragging) return;
    const handleUp = () => setDragging(false);
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, [dragging]);

  return (
    <div className="h-screen overflow-hidden">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold themer-gradient">Themer</span>
          </div>
        </div>
      </header>
      {/* Mobile Frame Wrapper */}
      <div className="w-full flex justify-center" style={{ marginTop: -56 }}>
        <div style={{ position: 'relative', width: 1400, height: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <img
            src={process.env.PUBLIC_URL + '/ife-frame.svg'}
            alt="Mobile Frame"
            style={{ position: 'absolute', top: -40, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
          />
          <FrameContent
            origin={origin}
            destination={destination}
            minutesLeft={minutesLeft}
            landingIn={landingIn}
            maxFlightMinutes={maxFlightMinutes}
            handleProgressChange={handleProgressChange}
          />
        </div>
      </div>
      {/* Main Content */}
      <div className="p-8">
        {/* ThemeCreator is now positioned absolutely and draggable */}
        {initialThemeCreatorPosition && (
          <ThemeCreator routes={routes} setRoutes={setRoutes} initialPosition={initialThemeCreatorPosition} />
        )}
      </div>
    </div>
  );
} 