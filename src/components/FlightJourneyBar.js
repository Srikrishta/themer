import LogoAnimationOverlay from './LogoAnimationOverlay';
import { getReadableOnColor } from '../utils/color';
const img = "http://localhost:3845/assets/ff3d1da9a24aa2fb4488e3512b8899f58fd11a82.svg";
const img1 = "http://localhost:3845/assets/a2d0c66b9b0a23635dabe1c4fa6f42ce32813ae3.svg";
const img2 = "http://localhost:3845/assets/0ff569c01d28eabc86e809a3f7e631571ba23fb8.svg";
const img3 = "http://localhost:3845/assets/f510282b8dae4b16fd9f8655fc56c2fb2c42ce38.svg";
const img4 = "http://localhost:3845/assets/12ff138a200ba4f26363bc8b4c9c314031978dbd.svg";
const img5 = "http://localhost:3845/assets/5b430c457bb1a36eac34c8197e3558b70a889106.svg";
const img6 = "http://localhost:3845/assets/29fa6c4c59170f1b8aade086622c24fdce89c35a.svg";

export default function FlightJourneyBar({ origin, destination, minutesLeft, themeColor = '#1E1E1E', isLandingPage = false, isPromptMode = false, onPromptHover, onPromptClick, selectedLogo }) {
  function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
  }

  // Use adaptive text color based on FJB container background (themeColor)
  const textColor = getReadableOnColor(themeColor);

  // Placeholder component matching logo placeholder styling
  const SkeletonCard = ({ width, alignment = 'left' }) => (
    <div
      className={`h-[88px] relative rounded-2xl shrink-0 flex items-center justify-center ${isLandingPage ? 'bg-white border border-gray-300' : 'backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)]'}`}
      style={{ width }}
    >
    </div>
  );

  const SkeletonLandingCard = () => (
    <div className={`h-[88px] relative rounded-2xl shrink-0 w-[294px] flex items-center justify-center ${isLandingPage ? 'bg-white border border-gray-300' : 'backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)]'}`}>
    </div>
  );

  return (
    <div className="w-full flex justify-center select-none">
      <div
        className="box-border content-stretch flex flex-row gap-8 items-center justify-between p-0 relative mx-auto w-full select-none"
        data-name="flight journey bar"
        id="node-77_5469"
        onMouseEnter={(e) => {
          if (isPromptMode && onPromptHover) {
            // Only trigger hover for the flight journey bar itself, not areas below it
            const rect = e.currentTarget.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            // Only trigger if we're within the actual bounds of the flight journey bar
            if (relativeY >= 0 && relativeY <= rect.height) {
              onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
            }
          }
        }}
        onMouseLeave={(e) => {
          if (isPromptMode && onPromptHover) {
            onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseMove={(e) => {
          if (isPromptMode && onPromptHover) {
            // Only trigger hover for the flight journey bar itself, not areas below it
            const rect = e.currentTarget.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            // Only trigger if we're within the actual bounds of the flight journey bar
            if (relativeY >= 0 && relativeY <= rect.height) {
              onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
            } else {
              onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
            }
          }
        }}
        onClick={(e) => {
          if (isPromptMode && onPromptClick) {
            // Ignore clicks on the flight progress bar region
            const bar = document.querySelector('.flight-progress-bar-container');
            if (bar) {
              const rect = bar.getBoundingClientRect();
              const x = e.clientX, y = e.clientY;
              const withinBar = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
              if (withinBar) return;
            }
            // Only trigger click for the flight journey bar itself, not areas below it
            const rect = e.currentTarget.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            // Only trigger if we're within the actual bounds of the flight journey bar
            if (relativeY >= 0 && relativeY <= rect.height) {
              onPromptClick('flight-journey-bar', { themeColor, origin, destination }, { x: e.clientX, y: e.clientY });
            }
          }
        }}
      >
        {/* Background hover areas for prompt mode - positioned between functional elements */}
        {isPromptMode && (
          <>
            {/* Left background area - behind logo placeholder */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[120px] z-0"
              onMouseEnter={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (onPromptHover) {
                  onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                }
              }}
              onMouseMove={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  } else {
                    onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onClick={(e) => {
                if (onPromptClick) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptClick('flight-journey-bar', { themeColor, origin, destination }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
            />
            
            {/* Gap areas between cards */}
            <div
              className="absolute left-[128px] top-0 bottom-0 w-6 z-0"
              onMouseEnter={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (onPromptHover) {
                  onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                }
              }}
              onMouseMove={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  } else {
                    onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onClick={(e) => {
                if (onPromptClick) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptClick('flight-journey-bar', { themeColor, origin, destination }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
            />
            
            <div
              className="absolute left-[534px] top-0 bottom-0 w-6 z-0"
              onMouseEnter={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (onPromptHover) {
                  onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                }
              }}
              onMouseMove={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  } else {
                    onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onClick={(e) => {
                if (onPromptClick) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptClick('flight-journey-bar', { themeColor, origin, destination }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
            />
            
            <div
              className="absolute left-[834px] top-0 bottom-0 w-6 z-0"
              onMouseEnter={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (onPromptHover) {
                  onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                }
              }}
              onMouseMove={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  } else {
                    onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onClick={(e) => {
                if (onPromptClick) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptClick('flight-journey-bar', { themeColor, origin, destination }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
            />
            
            {/* Top/bottom background areas that don't interfere with cards */}
            <div
              className="absolute left-0 right-0 top-0 h-2 z-0"
              onMouseEnter={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (onPromptHover) {
                  onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                }
              }}
              onMouseMove={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  } else {
                    onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onClick={(e) => {
                if (onPromptClick) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptClick('flight-journey-bar', { themeColor, origin, destination }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
            />
            
            <div
              className="absolute left-0 right-0 bottom-0 h-2 z-0"
              onMouseEnter={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (onPromptHover) {
                  onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                }
              }}
              onMouseMove={(e) => {
                if (onPromptHover) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptHover(true, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  } else {
                    onPromptHover(false, 'flight-journey-bar', { themeColor }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
              onClick={(e) => {
                if (onPromptClick) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeY = e.clientY - rect.top;
                  if (relativeY >= 0 && relativeY <= rect.height) {
                    onPromptClick('flight-journey-bar', { themeColor, origin, destination }, { x: e.clientX, y: e.clientY });
                  }
                }
              }}
            />
          </>
        )}
        {/* Logo Placeholder */}
        <div
          className="h-[88px] relative rounded-2xl shrink-0 w-[120px] flex items-center justify-center backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)]"
          data-name="logo placeholder"
        >
          {isLandingPage ? (
            <img 
              src={process.env.PUBLIC_URL + '/discover1.svg'} 
              alt="Discover Logo" 
              className="w-full h-full object-contain p-2"
              style={{
                filter: `brightness(0) saturate(100%) invert(${textColor === '#FFFFFF' ? '1' : '0'})`
              }}
            />
          ) : selectedLogo?.src ? (
            <img
              src={selectedLogo.src}
              alt={`${selectedLogo.id || 'airline'} logo`}
              className="w-full h-full object-contain p-2"
              style={{
                filter: `brightness(0) saturate(100%) invert(${textColor === '#FFFFFF' ? '1' : '0'})`
              }}
            />
          ) : (
            <>
              <div className="text-center">
                <div className="text-[16px] font-semibold mb-1" style={{ color: textColor }}>LOGO</div>
                <div className="text-[12px]" style={{ color: textColor, opacity: 0.7 }}>PLACEHOLDER</div>
              </div>
              {!isPromptMode && (
                <div className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-2xl" />
              )}
            </>
          )}
          {!isLandingPage && (
            <LogoAnimationOverlay type={selectedLogo?.animationType} themeColor={themeColor} />
          )}
          {!isLandingPage && (
            <div className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-2xl" />
          )}
        </div>

        <div
          className="box-border content-stretch flex flex-row gap-6 items-center justify-center p-0 relative shrink-0 flex-1"
          data-name="airports info"
          id="node-77_5471"
        >
          {!origin ? (
            <SkeletonCard width="400px" alignment="left" />
          ) : (
          <div
            className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] h-[88px] relative rounded-2xl shrink-0 w-[400px]"
            data-name="origin info"
            id="node-77_5576"
          >
            <div className="h-[88px] overflow-clip relative w-[400px]">
              <div
                className="absolute box-border content-stretch flex flex-row gap-2 items-start justify-start leading-[0] left-6 not-italic p-0 text-[20px] text-left text-nowrap top-[13px]"
                style={{ color: textColor }}
                data-name="Departure location"
                id="node-77_5577"
              >
                <div
                  className="font-['Lufthansa_Text:Bold',_sans-serif] relative shrink-0 tracking-[0.8px]"
                  id="node-77_5578"
                >
                  <p className="adjustLetterSpacing block leading-[32px] text-nowrap whitespace-pre" style={{ fontWeight: 600 }}>
                    {(origin?.airport.city || 'Origin').toUpperCase()}
                  </p>
                </div>
                <div
                  className="font-['Lufthansa_Text:Regular',_sans-serif] relative shrink-0"
                  id="node-77_5579"
                >
                  <p className="block leading-[32px] text-nowrap whitespace-pre" style={{ fontWeight: 600 }}>
                    {(origin?.airport.code || 'Origin').toUpperCase()}
                  </p>
                </div>
              </div>
              <div
                className="absolute font-['Lufthansa_Text:Bold',_sans-serif] leading-[0] right-6 not-italic text-[20px] text-nowrap text-right top-[13px] tracking-[0.8px]"
                style={{ color: textColor }}
                id="node-77_5580"
              >
                <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">
                  14ºc
                </p>
              </div>
              <div
                className="absolute font-['Lufthansa_Text:Regular',_sans-serif] leading-[0] left-[26px] not-italic text-[0px] text-left text-nowrap top-[51px] tracking-[1.4px] uppercase"
                style={{ color: textColor }}
                id="node-77_5581"
              >
                <p className="leading-[24px] text-[14px] whitespace-pre">
                  <span className="font-['Lufthansa_Text:Bold',_sans-serif] not-italic tracking-[0.56px] uppercase">
                    13:00
                  </span>
                  <span className> </span>
                  <span className="adjustLetterSpacing font-['Lufthansa_Text:Regular',_sans-serif] not-italic tracking-[1.4px] uppercase">
                    CET
                  </span>
                </p>
              </div>

              <div
                className="absolute right-6 overflow-clip size-8 top-[45px]"
                data-name="Weather Icons"
                id="node-77_5583"
              >
                <div
                  className="absolute bottom-[28.125%] left-[12.5%] right-[18.75%] top-[21.875%]"
                  data-name="Cloud (Stroke)"
                  id="node-I77_5583-3377_95520"
                >
                  <img alt className="block max-w-none size-full" src={img} />
                </div>
                <div className="absolute bottom-[41.605%] flex items-center justify-center left-[45.581%] right-[0.98%] top-[4.956%]">
                  <div className="flex-none h-[15.456px] rotate-[315deg] w-[8.728px]">
                    <div
                      className="relative size-full"
                      data-name="Ellipse 57 (Stroke)"
                      id="node-I77_5583-3377_95521"
                    >
                      <img
                        alt
                        className="block max-w-none size-full"
                        src={img1}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-2xl select-none" />
          </div>
          )}
          {!origin || !destination ? (
            <SkeletonLandingCard />
          ) : (
          <div
            className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] h-[88px] relative rounded-2xl shrink-0 w-[294px]"
            data-name="landing info"
            id="node-77_5602"
          >
            <div className="box-border content-stretch flex flex-col gap-1.5 h-[88px] items-center justify-center leading-[0] not-italic overflow-clip px-5 py-0 relative text-left text-nowrap w-[294px]" style={{ color: textColor }}>
              <div
                className="font-['Lufthansa_Text:Bold',_sans-serif] relative shrink-0 text-[20px] tracking-[0.8px]"
                id="node-77_5603"
              >
                <p className="adjustLetterSpacing block leading-[32px] text-nowrap whitespace-pre" style={{ fontWeight: 600 }}>
                  {formatTime(typeof minutesLeft === 'number' ? minutesLeft : 175)}
                </p>
              </div>
              <div
                className="font-['Lufthansa_Text:Regular',_sans-serif] relative shrink-0 text-[0px] tracking-[1.4px] uppercase"
                id="node-77_5604"
              >
                <p className="leading-[24px] not-italic text-[14px] text-nowrap whitespace-pre">
                  <span className="font-['Lufthansa_Text:Regular',_sans-serif] tracking-[1.4px]">
                    Flight number –
                  </span>
                  <span className="adjustLetterSpacing font-['Lufthansa_Text:Bold',_sans-serif] tracking-[0.56px]">{` AQ001`}</span>
                </p>
              </div>
            </div>
            <div className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-2xl select-none" />
          </div>
          )}
          {!destination ? (
            <SkeletonCard width="400px" alignment="right" />
          ) : (
          <div
            className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] h-[88px] relative rounded-2xl shrink-0 w-[400px]"
            data-name="destination info"
            id="node-77_5605"
          >
            <div className="h-[88px] overflow-clip relative w-[400px]">
              <div
                className="absolute box-border content-stretch flex flex-row gap-2 items-start justify-end leading-[0] not-italic p-0 right-6 text-nowrap text-right top-[13px]"
                style={{ color: textColor }}
                data-name="Destionation"
                id="node-77_5606"
              >
                <div
                  className="font-['Lufthansa_Text:Bold',_sans-serif] relative shrink-0 text-[0px] tracking-[0.8px]"
                  id="node-77_5607"
                >
                  <p className="leading-[32px] text-[20px] text-nowrap whitespace-pre" style={{ fontWeight: 600 }}>
                    <span className="font-['Lufthansa_Text:Bold',_sans-serif] not-italic tracking-[0.8px]" style={{ fontWeight: 600 }}>
                      {(destination?.airport.city || 'Destination').toUpperCase()}
                    </span>
                    <span className="adjustLetterSpacing"> </span>
                  </p>
                </div>
                <div
                  className="font-['Lufthansa_Text:Regular',_sans-serif] relative shrink-0 text-[20px]"
                  id="node-77_5608"
                >
                  <p className="block leading-[32px] text-nowrap whitespace-pre" style={{ fontWeight: 600 }}>
                    {(destination?.airport.code || 'Destination').toUpperCase()}
                  </p>
                </div>
              </div>
              <div
                className="absolute font-['Lufthansa_Text:Bold',_sans-serif] leading-[0] left-6 not-italic text-[20px] text-left text-nowrap top-[13px] tracking-[0.8px]"
                style={{ color: textColor }}
                id="node-77_5609"
              >
                <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">
                  27ºc
                </p>
              </div>
              <div
                className="absolute font-['Lufthansa_Text:Regular',_sans-serif] leading-[0] not-italic right-6 text-[0px] text-nowrap text-right top-[51px] tracking-[1.4px] uppercase"
                style={{ color: textColor }}
                id="node-77_5610"
              >
                <p className="leading-[24px] text-[14px] whitespace-pre">
                  <span className="font-['Lufthansa_Text:Bold',_sans-serif] tracking-[0.56px]">{`15:55 `}</span>
                  <span className="adjustLetterSpacing font-['Lufthansa_Text:Regular',_sans-serif] tracking-[1.4px]">
                    CET
                  </span>
                </p>
              </div>

              <div
                className="absolute left-[24px] overflow-clip size-8 top-[45px]"
                data-name="Weather Icons"
                id="node-77_5612"
              >
                <div
                  className="absolute inset-1/4"
                  data-name="Ellipse 57 (Stroke)"
                  id="node-I77_5612-5251_52443"
                >
                  <img alt className="block max-w-none size-full" src={img2} />
                </div>
                <div
                  className="absolute bottom-[78.125%] left-[46.875%] right-[46.875%] top-[9.375%]"
                  data-name="Vector 67 (Stroke)"
                  id="node-I77_5612-5251_52444"
                >
                  <img alt className="block max-w-none size-full" src={img3} />
                </div>
                <div
                  className="absolute bottom-[9.375%] left-[46.875%] right-[46.875%] top-[78.125%]"
                  data-name="Vector 68 (Stroke)"
                  id="node-I77_5612-5251_52445"
                >
                  <img alt className="block max-w-none size-full" src={img3} />
                </div>
                <div className="absolute bottom-[46.875%] flex items-center justify-center left-[9.375%] right-[78.125%] top-[46.875%]">
                  <div className="flex-none h-1 rotate-[270deg] w-0.5">
                    <div
                      className="relative size-full"
                      data-name="Vector 69 (Stroke)"
                      id="node-I77_5612-5251_52446"
                    >
                      <img
                        alt
                        className="block max-w-none size-full"
                        src={img4}
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[46.875%] flex items-center justify-center left-[78.125%] right-[9.375%] top-[46.875%]">
                  <div className="flex-none h-1 rotate-[270deg] w-0.5">
                    <div
                      className="relative size-full"
                      data-name="Vector 70 (Stroke)"
                      id="node-I77_5612-5251_52447"
                    >
                      <img
                        alt
                        className="block max-w-none size-full"
                        src={img4}
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[67.678%] flex items-center justify-center left-[19.064%] right-[67.677%] top-[19.064%]">
                  <div className="flex-none h-1 rotate-[315deg] w-0.5">
                    <div
                      className="relative size-full"
                      data-name="Vector 71 (Stroke)"
                      id="node-I77_5612-5251_52448"
                    >
                      <img
                        alt
                        className="block max-w-none size-full"
                        src={img5}
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[18.149%] flex items-center justify-center left-[68.593%] right-[18.149%] top-[68.593%]">
                  <div className="flex-none h-1 rotate-[315deg] w-0.5">
                    <div
                      className="relative size-full"
                      data-name="Vector 72 (Stroke)"
                      id="node-I77_5612-5251_52449"
                    >
                      <img
                        alt
                        className="block max-w-none size-full"
                        src={img5}
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[19.064%] flex items-center justify-center left-[19.064%] right-[67.677%] top-[67.678%]">
                  <div className="flex-none h-1 rotate-[225deg] w-0.5">
                    <div
                      className="relative size-full"
                      data-name="Vector 73 (Stroke)"
                      id="node-I77_5612-5251_52450"
                    >
                      <img
                        alt
                        className="block max-w-none size-full"
                        src={img6}
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[68.593%] flex items-center justify-center left-[68.593%] right-[18.149%] top-[18.149%]">
                  <div className="flex-none h-1 rotate-[225deg] w-0.5">
                    <div
                      className="relative size-full"
                      data-name="Vector 74 (Stroke)"
                      id="node-I77_5612-5251_52451"
                    >
                      <img
                        alt
                        className="block max-w-none size-full"
                        src={img6}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-2xl select-none" />
          </div>
          )}
        </div>
      </div>
    </div>
  );
} 