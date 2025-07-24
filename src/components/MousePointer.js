import { useState, useEffect } from 'react';

export default function MousePointer({ 
  isVisible = true, 
  position = null, 
  themeColor = '#333333',
  size = 'normal', // 'small', 'normal', 'large'
  showShadow = true,
  animated = true
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let moveTimeout;
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      
      // Clear previous timeout
      if (moveTimeout) {
        clearTimeout(moveTimeout);
      }
      
      // Set timeout to stop moving animation
      moveTimeout = setTimeout(() => {
        setIsMoving(false);
      }, 150);
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (moveTimeout) {
        clearTimeout(moveTimeout);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // Use provided position or mouse position
  const currentPosition = position || mousePosition;
  
  // Size configurations
  const sizeConfig = {
    small: { width: 12, height: 12, shadowSize: 16 },
    normal: { width: 16, height: 16, shadowSize: 20 },
    large: { width: 20, height: 20, shadowSize: 24 }
  };
  
  const config = sizeConfig[size] || sizeConfig.normal;

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: currentPosition.x,
        top: currentPosition.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Mouse pointer shadow */}
      {showShadow && (
        <div
          className="absolute rounded-full"
          style={{
            width: config.shadowSize,
            height: config.shadowSize,
            background: `rgba(${themeColor === '#333333' ? '51, 51, 51' : '0, 0, 0'}, 0.2)`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(2px)',
            animation: animated && isMoving ? 'pointer-shadow-pulse 0.3s ease-out' : 'none'
          }}
        />
      )}
      
      {/* Mouse pointer dot */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.width,
          height: config.height,
          background: themeColor,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          animation: animated && isMoving ? 'pointer-dot-pulse 0.3s ease-out' : 'none'
        }}
      />
      
      {/* Mouse pointer arrow (optional) */}
      <div
        className="absolute"
        style={{
          width: 0,
          height: 0,
          borderLeft: `${config.width / 2}px solid transparent`,
          borderRight: `${config.width / 2}px solid transparent`,
          borderTop: `${config.height / 2}px solid ${themeColor}`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) translateY(-1px)',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
        }}
      />
    </div>
  );
} 