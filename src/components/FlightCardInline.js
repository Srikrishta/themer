import React, { useState } from 'react';
import { PhotoIcon, ArrowsUpDownIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function FlightCardInline({ segment, index, activeIndex, onSelect, onTriggerPromptBubble, onEnterPromptMode, themeColor = '#1E1E1E' }) {
  const [themeClicked, setThemeClicked] = useState(false);
  const [logoClicked, setLogoClicked] = useState(true); // Start with logo as text button
  const [phaseClicked, setPhaseClicked] = useState(false);
  const handleAction = (e, type) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const segId = `inline-flight-${index + 1}`;
    if (typeof onEnterPromptMode === 'function') onEnterPromptMode(segId);
    if (typeof onTriggerPromptBubble === 'function') {
      if (type === 'logo') {
        // Position prompt bubble at top left of the button
        const position = { x: rect.left, y: rect.top };
        setLogoClicked(true);
        setThemeClicked(false);
        setPhaseClicked(false);
        onTriggerPromptBubble('logo-placeholder', {}, position, segId);
      }
      else if (type === 'theme') {
        // Position prompt bubble at top left of the theme button
        const position = { x: rect.left, y: rect.top };
        setThemeClicked(true);
        setLogoClicked(false);
        setPhaseClicked(false);
        onTriggerPromptBubble('flight-journey-bar', { themeColor }, position, segId);
      }
      else if (type === 'phase') {
        // Position prompt bubble at top left of the phase button
        const position = { x: rect.left, y: rect.top };
        setPhaseClicked(true);
        setLogoClicked(false);
        setThemeClicked(false);
        onTriggerPromptBubble('flight-phase-button', { progress: 0.5, minutesLeft: 200 }, position, segId);
      }
    }
  };

  const isActive = activeIndex === index;

  return (
    <div className="w-full flex-1 min-w-0 basis-0" onClick={() => typeof onSelect === 'function' && onSelect(index)}>
      <div className={`backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.2)] pl-5 pr-3 py-4 rounded-full shadow-sm w-full ${isActive ? 'shadow-lg ring-2 ring-blue-500/60 bg-blue-600/10' : 'hover:shadow-md hover:bg-blue-600/5'}`}>
        <div className={`flex justify-between items-stretch ${isActive ? 'opacity-100' : 'opacity-70'}`}>
          <div className="flex items-start gap-1 flex-none pr-0" style={{ paddingRight: 6 }}>
            <div className="flex-none">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white break-words">
                  {segment?.origin?.airport?.code} → {segment?.destination?.airport?.code}
                </h3>
              </div>
              <div className="text-xs text-white mt-1 flex items-center gap-3 flex-wrap break-words">
                <span className="flex items-center gap-1 font-semibold">Flight {index + 1}</span>
              </div>
            </div>
          </div>
          {isActive && (
            <>
              <div className="hidden md:flex w-px mx-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div className="hidden md:flex items-center gap-1" style={{ marginLeft: 5 }}>
                {logoClicked ? (
                  <button type="button" className="h-9 px-4 rounded-tl-[0px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[24px] transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 text-sm" title="Add Airline Logo" onClick={(e) => handleAction(e, 'logo')}>
                    <span>Add Airline Logo</span>
                  </button>
                ) : (
                  <button type="button" className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" title="Add logo" onClick={(e) => handleAction(e, 'logo')}>
                    <PhotoIcon className="w-4 h-4" />
                  </button>
                )}
                {themeClicked ? (
                  <button type="button" className="h-9 px-4 rounded-tl-[0px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[24px] transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 text-sm" title="Change Theme" onClick={(e) => handleAction(e, 'theme')}>
                    <span>Change Theme</span>
                  </button>
                ) : (
                  <button type="button" className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" title="Add theme" onClick={(e) => handleAction(e, 'theme')}>
                    <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)', backgroundSize: '200% 200%' }} />
                  </button>
                )}
                {phaseClicked ? (
                  <button type="button" className="h-9 px-4 rounded-tl-[0px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[24px] transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 text-sm" title="Add Flight Content" onClick={(e) => handleAction(e, 'phase')}>
                    <span>Add Flight Content</span>
                  </button>
                ) : (
                  <button type="button" className="inline-flex items-center rounded-[24px] bg-white/10 text-white hover:bg-white/15 h-9 w-9 justify-center px-0 shrink-0" title="Modify flight phase" onClick={(e) => handleAction(e, 'phase')}>
                    <img src={process.env.PUBLIC_URL + '/flight icon.svg'} alt="Flight icon" className="w-4 h-4" />
                  </button>
                )}

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


