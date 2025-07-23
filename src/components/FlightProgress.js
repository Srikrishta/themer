import './FlightProgress.css';
import { useEffect, useRef, useState } from 'react';

function parseTime(str) {
  // Example: "LANDING IN 2H 55M"
  const match = str.match(/(\d+)H\s*(\d+)M/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `LANDING IN ${h}H ${m.toString().padStart(2, '0')}M`;
}

export default function FlightProgress({ landingIn = "LANDING IN 2H 55M", maxFlightMinutes = 370, minutesLeft: externalMinutesLeft, onProgressChange, themeColor = '#1E1E1E', isPromptMode = false, onPromptHover, onPromptClick, fpsPrompts = {} }) {
  const barWidth = 1302;
  const [dragging, setDragging] = useState(false);
  const barRef = useRef();
  const iconRef = useRef();

  // If externalMinutesLeft is provided, use it as the source of truth
  const displayMinutes = typeof externalMinutesLeft === 'number' ? externalMinutesLeft : parseTime(landingIn);
  const progress = 1 - (displayMinutes / maxFlightMinutes);
  const progressWidth = Math.max(0, Math.min(barWidth * progress, barWidth));
  const iconLeft = Math.max(0, Math.min(barWidth * progress - 16, barWidth - 32));

  // Drag logic (only start drag from icon)
  const handleIconMouseDown = (e) => {
    setDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };
  const handleIconMouseLeave = () => {
    if (dragging) setDragging(false);
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging && barRef.current) {
        const barRect = barRef.current.getBoundingClientRect();
        const offsetX = e.clientX - barRect.left;
        const newProgress = Math.max(0, Math.min(1, offsetX / barWidth));
        const newMinutes = Math.round(maxFlightMinutes * (1 - newProgress));
        if (typeof onProgressChange === 'function') {
          onProgressChange(newMinutes);
        }
      }
    };

    const handleMouseUp = () => {
      if (dragging) {
        setDragging(false);
      }
    };

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, maxFlightMinutes, onProgressChange]);

  const handleBarClick = (e) => {
    if (dragging) return;
    
    const barRect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - barRect.left;
    const newProgress = Math.max(0, Math.min(1, offsetX / barWidth));
    const newMinutes = Math.round(maxFlightMinutes * (1 - newProgress));
    
    if (typeof onProgressChange === 'function') {
      onProgressChange(newMinutes);
    }
    
  };

  return (
    <div className="flight-progress-bar-container" ref={barRef} onClick={handleBarClick}>
      <div className="flight-path"></div>
      <div className="flight-progress" style={{ width: `${progressWidth}px`, background: themeColor }}></div>
      <div
        className="flight-progress-icon"
        ref={iconRef}
        style={{ left: `${iconLeft}px`, cursor: 'pointer', background: themeColor, borderColor: themeColor }}
        onMouseDown={handleIconMouseDown}
        onMouseLeave={(e) => {
          handleIconMouseLeave();
          if (isPromptMode && onPromptHover) {
            onPromptHover(false, 'flight-icon', { progress, minutesLeft: displayMinutes }, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseEnter={(e) => {
          if (isPromptMode && onPromptHover) {
            onPromptHover(true, 'flight-icon', { progress, minutesLeft: displayMinutes }, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseMove={(e) => {
          if (isPromptMode && onPromptHover) {
            onPromptHover(true, 'flight-icon', { progress, minutesLeft: displayMinutes }, { x: e.clientX, y: e.clientY });
          }
        }}
        onClick={(e) => {
          if (isPromptMode && onPromptClick) {
            e.stopPropagation();
            onPromptClick('flight-icon', { progress, minutesLeft: displayMinutes }, { x: e.clientX, y: e.clientY });
          }
        }}
      >
        <span className="icon"></span>
      </div>
      
      {/* Display ALL prompts at their FIXED positions */}
      {Object.entries(fpsPrompts).map(([positionKey, promptText]) => {
        if (!positionKey.startsWith('fps-')) return null;
        
        // Extract progress from position key
        const promptProgress = parseInt(positionKey.replace('fps-', '')) / 1000;
        const promptLeft = Math.max(0, Math.min(barWidth * promptProgress - 16, barWidth - 32));
        
        return (
          <div
            key={positionKey}
            className="flight-prompt-label"
            style={{
              position: 'absolute',
              left: `${promptLeft + 8}px`, // Fixed position based on original progress
              top: '40px',
              color: themeColor,
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              zIndex: 10
            }}
          >
            {promptText}
          </div>
        );
      })}
    </div>
  );
} 