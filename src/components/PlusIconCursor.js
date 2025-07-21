import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function PlusIconCursor({ isVisible, themeColor = '#1E1E1E' }) {
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

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x + 15, // Offset from cursor
        top: position.y - 15,
        transform: 'translate(0, 0)',
      }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-150 ease-out"
        style={{ 
          backgroundColor: themeColor,
          borderColor: 'white'
        }}
      >
        <PlusIcon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>
    </div>
  );
} 