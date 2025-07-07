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

export default function FlightProgress({ landingIn = "LANDING IN 2H 55M", maxFlightMinutes = 370, minutesLeft: externalMinutesLeft, onProgressChange }) {
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
    if (!dragging) return;
    const handleMouseMove = (e) => {
      // Check if mouse is still over the icon
      if (iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          setDragging(false);
          return;
        }
      }
      const barRect = barRef.current.getBoundingClientRect();
      let x = e.clientX - barRect.left;
      x = Math.max(0, Math.min(x, barWidth));
      const newProgress = x / barWidth;
      if (onProgressChange) onProgressChange(newProgress);
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, onProgressChange, barWidth]);

  // Click-to-move logic
  const handleBarClick = (e) => {
    // Prevent click if dragging (to avoid jump on mouseup)
    if (dragging) return;
    const rect = barRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, barWidth));
    const newProgress = x / barWidth;
    if (onProgressChange) onProgressChange(newProgress);
  };

  return (
    <div className="flight-progress-bar-container" ref={barRef} onClick={handleBarClick}>
      <div className="flight-path"></div>
      <div className="flight-progress" style={{ width: `${progressWidth}px` }}></div>
      <div
        className="flight-progress-icon"
        ref={iconRef}
        style={{ left: `${iconLeft}px`, cursor: 'pointer' }}
        onMouseDown={handleIconMouseDown}
        onMouseLeave={handleIconMouseLeave}
      >
        <span className="icon"></span>
      </div>
    </div>
  );
} 