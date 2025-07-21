import { useState, useRef, useEffect } from 'react';
import ThemeCreator from './ThemeCreator';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';
import { useLocation, useNavigate } from 'react-router-dom';

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
}

function FrameContent({ origin, destination, minutesLeft, landingIn, maxFlightMinutes, handleProgressChange, themeColor }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, width: 1302, margin: '92px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      <div className="fjb-fps-container" style={{ width: 1328, maxWidth: 1328, marginLeft: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: themeColor + '14', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, paddingTop: 80, paddingBottom: 40, marginTop: 4 }}>
        <div style={{ width: '100%', marginTop: -32, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <FlightJourneyBar origin={origin} destination={destination} minutesLeft={minutesLeft} themeColor={themeColor} />
          <FlightProgress landingIn={landingIn} maxFlightMinutes={maxFlightMinutes} minutesLeft={minutesLeft} onProgressChange={handleProgressChange} themeColor={themeColor} />
        </div>
      </div>
      <Component3Cards themeColor={themeColor} />
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const minimizeThemeCreator = location.state?.minimizeThemeCreator;
  // Lifted state for routes
  const [routes, setRoutes] = useState([]);
  // NEW: State for selected segment (flight card)
  const [selectedSegment, setSelectedSegment] = useState(null);
  // NEW: State for current theme color
  const [currentThemeColor, setCurrentThemeColor] = useState('#1E1E1E');

  // Use selected segment's origin/destination if set, else default to full route
  const origin = selectedSegment?.origin || (routes.length > 0 ? routes[0] : null);
  const destination = selectedSegment?.destination || (routes.length > 1 ? routes[routes.length - 1] : null);

  // Countdown state
  const maxFlightMinutes = 370; // 6h10m
  const [minutesLeft, setMinutesLeft] = useState(maxFlightMinutes);
  const timerRef = useRef();
  const [dragging, setDragging] = useState(false);

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
    <div className="min-h-screen">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-3 fixed top-0 left-0 w-full z-50" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span
              className="text-2xl font-bold themer-gradient cursor-pointer"
              onClick={() => navigate('/')}
              title="Go to landing page"
            >
              Themer
            </span>
          </div>
        </div>
      </header>
      {/* Mobile Frame Wrapper */}
      <div className="w-full flex justify-center" style={{ marginTop: 180 + 64 + 100 }}>
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
            themeColor={currentThemeColor}
          />
        </div>
      </div>
      {/* Main Content */}
      <div className="p-8">
        {/* ThemeCreator is now positioned absolutely and draggable */}
        <ThemeCreator
          routes={routes}
          setRoutes={setRoutes}
          initialMinimized={minimizeThemeCreator}
          initialWidth={minimizeThemeCreator ? 318 : undefined}
          onFlightCardSelect={segment => setSelectedSegment(segment)}
          onThemeColorChange={color => setCurrentThemeColor(color)}
        />
      </div>
    </div>
  );
} 