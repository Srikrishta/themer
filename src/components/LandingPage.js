import { useNavigate } from 'react-router-dom';
import FlightJourneyBar from './FlightJourneyBar';
import FlightProgress from './FlightProgress';
import Component3Cards from './Component3Cards';

export default function LandingPage() {
  const navigate = useNavigate();

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
          <div className="mx-auto max-w-7xl px-0 pb-32 pt-36 sm:pt-60 lg:px-1 lg:pt-32">
            <div className="mx-auto max-w-2xl gap-x-20 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
              <div className="w-full max-w-xl lg:basis-1/3 xl:basis-1/3 lg:shrink-0 xl:max-w-2xl">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Craft Personalized In-flight Experiences
                </h1>
                <p className="relative mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none">
                  Create welcoming and localized themes for your passengers' journey.
                  Customize the in-flight entertainment experience based on their destination.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <div
                    onClick={() => navigate('/dashboard', { state: { minimizeThemeCreator: true } })}
                    className="bg-white border border-gray-200 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 themer-animated-border"
                    style={{
                      width: '318px',
                      height: '48px',
                      borderRadius: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="text-lg font-semibold text-gray-700">Create route</span>
                  </div>
                </div>
              </div>
              <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-24 lg:mt-0 lg:pl-8">
                <div className="flex-1 lg:basis-2/3 flex items-center justify-center h-full">
                  <div className="relative w-full h-[650px] max-w-4xl flex items-center justify-center">
                    {/* IFE frame SVG */}
                    <img
                      src={process.env.PUBLIC_URL + '/ife-frame.svg'}
                      alt="IFE Frame"
                      style={{ position: 'absolute', top: -30, left: -50, width: '1000px', height: '800px', zIndex: 1, pointerEvents: 'none' }}
                    />
                    {/* Theme preview content */}
                    <div style={{ position: 'relative', zIndex: 2, width: 1302, margin: '92px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, transform: 'scale(0.6) translateX(-16px)', transformOrigin: 'top center' }}>
                      <div style={{ width: 1328, maxWidth: 1328, marginLeft: -2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: '#1E1E1E14', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, paddingTop: 80, paddingBottom: 40, marginTop: 4 }}>
                        <div style={{ width: '100%', marginTop: -32, display: 'flex', flexDirection: 'column', gap: 28 }}>
                          <FlightJourneyBar />
                          <FlightProgress />
                        </div>
                      </div>
                      <Component3Cards />
                    </div>
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