import './FlightProgress.css';
import { useEffect, useRef, useState } from 'react';
import PromptBubble from './PromptBubble';

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

export default function FlightProgress({ landingIn = "LANDING IN 2H 55M", maxFlightMinutes = 370, minutesLeft: externalMinutesLeft, onProgressChange, themeColor = '#1E1E1E', isPromptMode = false, onPromptHover, onPromptClick, fpsPrompts = {}, showMovingIcon = false }) {
  const barWidth = 1302;
  const [dragging, setDragging] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hasReachedTarget, setHasReachedTarget] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const [showPlusButton, setShowPlusButton] = useState(false);
  const [showPromptBubble, setShowPromptBubble] = useState(false);
  const [promptBubblePosition, setPromptBubblePosition] = useState({ x: 0, y: 0 });
  const [showTakeoffLabel, setShowTakeoffLabel] = useState(false);
  const barRef = useRef();
  const iconRef = useRef();

  // If externalMinutesLeft is provided, use it as the source of truth
  const displayMinutes = typeof externalMinutesLeft === 'number' ? externalMinutesLeft : parseTime(landingIn);
  const progress = 1 - (displayMinutes / maxFlightMinutes);
  const progressWidth = Math.max(0, Math.min(barWidth * progress, barWidth));
  
  // Target progress for landing page animation (20%)
  const targetProgress = 0.2;
  
  // Use animation progress for moving icon, otherwise use normal progress
  const iconLeft = showMovingIcon 
    ? Math.max(0, Math.min(barWidth * animationProgress - 16, barWidth - 32))
    : Math.max(0, Math.min(barWidth * progress - 16, barWidth - 32));

  // Animation for moving icon to 20% and stopping
  useEffect(() => {
    if (!showMovingIcon) return;

    const animationDuration = 3000; // 3 seconds to reach 20%
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / animationDuration, 1);
      const newProgress = targetProgress * progressRatio;
      
      setAnimationProgress(newProgress);
      
      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      } else {
        setHasReachedTarget(true);
        // Show pointer after a short delay
        setTimeout(() => {
          setShowPointer(true);
        }, 500);
        // Show plus button after pointer appears
        setTimeout(() => {
          setShowPlusButton(true);
        }, 1000);
        // Show prompt bubble after plus button appears
        setTimeout(() => {
          setShowPromptBubble(true);
          // Calculate position for prompt bubble (right below the flight icon)
          // Get the FPS container position relative to viewport
          if (barRef.current) {
            const containerRect = barRef.current.getBoundingClientRect();
            const bubbleX = containerRect.left + iconLeft + 16; // Flight icon center
            const bubbleY = containerRect.top + 48; // Below the flight icon
            setPromptBubblePosition({ x: bubbleX, y: bubbleY });
          }
          
          // Auto-click "Takeoff" chip after a longer delay to show the interaction
          setTimeout(() => {
            // First, simulate the chip being clicked (visual feedback)
            const takeoffChip = document.querySelector('[data-chip="takeoff"]');
            if (takeoffChip) {
              // Add clicked class for more prominent visual feedback
              takeoffChip.classList.add('chip-clicked');
              takeoffChip.style.transform = 'scale(0.9)';
              takeoffChip.style.backgroundColor = '#10B981';
              takeoffChip.style.borderColor = '#10B981';
              takeoffChip.style.color = 'white';
              takeoffChip.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
            }
            
            // Then submit after showing the click effect
            setTimeout(() => {
              handlePromptBubbleSubmit("Takeoff", "flight-icon", { progress, minutesLeft: displayMinutes }, "landing-demo");
            }, 800); // Longer delay to show the clicked state
          }, 2000); // Increased delay to 2 seconds
        }, 1500);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [showMovingIcon]);

  // Drag logic (only start drag from icon)
  const handleIconMouseDown = (e) => {
    if (showMovingIcon) return; // Disable dragging when showing moving icon
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
    if (dragging || showMovingIcon) return;
    
    const barRect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - barRect.left;
    const newProgress = Math.max(0, Math.min(1, offsetX / barWidth));
    const newMinutes = Math.round(maxFlightMinutes * (1 - newProgress));
    
    if (typeof onProgressChange === 'function') {
      onProgressChange(newMinutes);
    }
    
  };

  const handlePromptBubbleClose = () => {
    setShowPromptBubble(false);
  };

  const handlePromptBubbleSubmit = (promptText, elementType, elementData, positionKey) => {
    // Handle the prompt submission for landing page demo
    console.log('Prompt submitted:', promptText, elementType, elementData, positionKey);
    setShowPromptBubble(false);
    
    // Show the Takeoff label below the flight icon
    if (promptText === "Takeoff") {
      setShowTakeoffLabel(true);
      // Hide the plus button after the label appears
      setTimeout(() => {
        setShowPlusButton(false);
      }, 500); // Delay to show the label first
    }
  };

  return (
    <div className="flight-progress-bar-container" ref={barRef} onClick={handleBarClick}>
      <div className="flight-path"></div>
      <div className="flight-progress" style={{ width: `${progressWidth}px`, background: themeColor }}></div>
      <div
        className={`flight-progress-icon ${showMovingIcon ? 'moving-icon' : ''} ${hasReachedTarget ? 'reached-target' : ''}`}
        ref={iconRef}
        style={{ left: `${iconLeft}px`, cursor: showMovingIcon ? 'default' : 'pointer', background: themeColor, borderColor: themeColor }}
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
      
      {/* Dummy mouse pointer */}
      {showPointer && showMovingIcon && (
        <div 
          className="dummy-mouse-pointer"
          style={{
            position: 'absolute',
            left: `${iconLeft + 16}px`,
            top: '20px',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <div className="pointer-dot"></div>
          <div className="pointer-shadow"></div>
        </div>
      )}
      
      {/* Plus button at pointer position */}
      {showPlusButton && showMovingIcon && (
        <div 
          className="landing-plus-button"
          style={{
            position: 'absolute',
            left: `${iconLeft + 8}px`,
            top: '48px',
            zIndex: 15,
            pointerEvents: 'none'
          }}
        >
          <div 
            className="plus-button-inner"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: themeColor,
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              animation: 'plus-button-appear 0.5s ease-out'
            }}
          >
            <span 
              className="plus-icon"
              style={{
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                lineHeight: '1'
              }}
            >
              +
            </span>
          </div>
        </div>
      )}
      
      {/* Takeoff Label */}
      {showTakeoffLabel && (
        <div 
          className="flight-prompt-label"
          style={{
            position: 'absolute',
            left: `${iconLeft + 16}px`, // Same as dummy mouse pointer position
            top: '40px',
            color: themeColor,
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            zIndex: 10,
            animation: 'label-appear 0.5s ease-out',
            transform: 'translateX(-50%)' // Center the label text
          }}
        >
          TAKEOFF
        </div>
      )}
      
      {/* Prompt Bubble */}
      <PromptBubble
        isVisible={showPromptBubble && showMovingIcon}
        position={promptBubblePosition}
        elementType="flight-icon"
        elementData={{ progress, minutesLeft: displayMinutes }}
        onClose={handlePromptBubbleClose}
        onSubmit={handlePromptBubbleSubmit}
        themeColor={themeColor}
        existingText=""
        positionKey="landing-demo"
        fpsPrompts={{}}
      />
      
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