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
            <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
              <div className="w-full max-w-xl lg:basis-1/3 xl:basis-1/3 lg:shrink-0 xl:max-w-2xl">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Craft Personalized In-flight Experiences
                </h1>
                <p className="relative mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none">
                  Create welcoming and localized themes for your passengers' journey.
                  Customize the in-flight entertainment experience based on their destination.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <button
                    onClick={() => navigate('/dashboard', { state: { minimizeThemeCreator: true } })}
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Create themes
                  </button>
                </div>
              </div>
              <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                <div className="flex-1 lg:basis-2/3 flex items-center justify-center h-full">
                  <div className="relative w-full h-[550px] max-w-2xl flex items-center justify-center">
                    {/* Scaled-down IFE frame SVG */}
                    <img
                      src={process.env.PUBLIC_URL + '/ife-frame.svg'}
                      alt="IFE Frame"
                      style={{ position: 'absolute', top: -36, left: -16, width: '732px', height: '582px', zIndex: 1, pointerEvents: 'none' }}
                    />
                    {/* Scaled-down frame content */}
                    <div style={{ position: 'relative', zIndex: 2, width: 683, margin: '86px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, transform: 'scale(0.5)', transformOrigin: 'top left' }}>
                      <div style={{ width: 651, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <FlightJourneyBar />
                        <FlightProgress />
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