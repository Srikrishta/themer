import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function PlusIconCursor({ isVisible, themeColor = '#1E1E1E', label = '' }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible]);

  if (!isVisible) return null;

  const hasLabel = typeof label === 'string' && label.trim().length > 0;
  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x + 15,
        top: position.y - 15,
        transform: 'translate(0, 0)'
      }}
    >
      {hasLabel ? (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-tl-[24px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[24px] shadow-xl"
          style={{ backgroundColor: '#1F1F1F', color: 'white', border: '2px solid rgba(0,0,0,0.35)' }}
        >
          <div
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: 'white' }}
          >
            <PlusIcon className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
        </div>
      ) : (
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-150 ease-out"
          style={{ backgroundColor: themeColor, borderColor: 'white' }}
        >
          <PlusIcon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
      )}
    </div>
  );
} 