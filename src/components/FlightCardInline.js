import React from 'react';

export default function FlightCardInline({ segment, index, activeIndex, onSelect, onTriggerPromptBubble, onEnterPromptMode, themeColor = '#1E1E1E' }) {

  const isActive = activeIndex === index;

  return (
    <div className="w-full flex-1 min-w-0 basis-0" onClick={() => typeof onSelect === 'function' && onSelect(index)}>
      <div className={`backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.1)] pl-5 pr-3 py-4 rounded-full shadow-sm w-full ${isActive ? 'shadow-lg ring-2 ring-blue-500/60 bg-blue-600/10' : 'hover:shadow-md hover:bg-blue-600/5'}`}>
        <div className={`flex justify-between items-stretch ${isActive ? 'opacity-100' : 'opacity-70'}`}>
          <div className="flex items-start gap-1 flex-none pr-0" style={{ paddingRight: 6 }}>
            <div className="flex-none">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-white text-black"
                >
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold text-white break-words">
                  {segment?.origin?.airport?.city} → {segment?.destination?.airport?.city}
                </h3>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


