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
  const [animationProgress, setAnimationProgress] = useState(showMovingIcon ? 0.02 : 0); // Start with 2% progress if showing moving icon
  const [hasReachedTarget, setHasReachedTarget] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const [showPlusButton, setShowPlusButton] = useState(false);
  const [showPromptBubble, setShowPromptBubble] = useState(false);
  const [promptBubblePosition, setPromptBubblePosition] = useState({ x: 0, y: 0 });
  const [showTakeoffLabel, setShowTakeoffLabel] = useState(false);
  const [movePointerToCard, setMovePointerToCard] = useState(false);
  const [pointerCardPosition, setPointerCardPosition] = useState({ x: 0, y: 0 });
  const [showPlusButtonAtCard, setShowPlusButtonAtCard] = useState(false);
  const [showPromptBubbleAtCard, setShowPromptBubbleAtCard] = useState(false);
  const [promptBubbleCardPosition, setPromptBubbleCardPosition] = useState({ x: 0, y: 0 });
  const barRef = useRef();
  const iconRef = useRef();

  // Set CSS custom property for theme color
  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.setProperty('--theme-color', themeColor);
    }
  }, [themeColor]);

  // If externalMinutesLeft is provided, use it as the source of truth
  const displayMinutes = typeof externalMinutesLeft === 'number' ? externalMinutesLeft : parseTime(landingIn);
  const progress = 1 - (displayMinutes / maxFlightMinutes);
  
  // Target progress for landing page animation (20%)
  const targetProgress = 0.2;
  
  // Use animation progress for moving icon, otherwise use normal progress
  const iconLeft = showMovingIcon 
    ? Math.max(0, Math.min(barWidth * animationProgress - 16, barWidth - 32))
    : Math.max(0, Math.min(barWidth * progress - 16, barWidth - 32));

  // For moving icon, ensure we have a minimum progress width to show the bar
  const progressWidth = showMovingIcon 
    ? Math.max(4, Math.min(barWidth * animationProgress, barWidth)) // Minimum 4px width for visibility
    : Math.max(0, Math.min(barWidth * progress, barWidth));

  // Animation for moving icon to 20% and stopping
  useEffect(() => {
    if (!showMovingIcon) return;

    const animationDuration = 3000; // 3 seconds to reach 20%
    const startTime = Date.now();
    const startProgress = 0.02; // Start with 2% progress for visibility

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / animationDuration, 1);
      const newProgress = startProgress + (targetProgress - startProgress) * progressRatio;
      
      // Update both progress and icon position in the same frame
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
          // Hide plus button when prompt bubble appears
          setShowPlusButton(false);
          // Calculate position for prompt bubble (at the same position as plus button)
          // Get the FPS container position relative to viewport
          if (barRef.current) {
            const containerRect = barRef.current.getBoundingClientRect();
            // Account for PromptBubble's internal offset adjustments (-160 for x, -60 for y)
            const bubbleX = containerRect.left + iconLeft + 8 + 160; // Plus button position + offset
            const bubbleY = containerRect.top + 48 + 60; // Plus button position + offset
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
      
      // Move pointer to promo card after Takeoff label appears
      setTimeout(() => {
        setMovePointerToCard(true);
        // Calculate position for center of left promo card
        // Component3Cards uses flexbox with gap-8 (32px gap)
        const containerWidth = 1302;
        const cardWidth = 416;
        const cardHeight = 200;
        const gap = 32;
        
        // Calculate the position of the leftmost card
        // Total width of 3 cards + 2 gaps = 416*3 + 32*2 = 1312
        const totalCardsWidth = (cardWidth * 3) + (gap * 2);
        const leftMargin = (containerWidth - totalCardsWidth) / 2;
        
        // Center of left promo card relative to Component3Cards container
        const leftCardCenterX = leftMargin + cardWidth / 2;
        const leftCardCenterY = cardHeight / 2;
        
        // Convert to absolute position relative to the flight progress bar container
        // Component3Cards is positioned below the flight progress bar with gap: 32
        const flightProgressHeight = 32; // Height of flight progress bar
        const gapBetweenComponents = 32; // Gap between flight progress and Component3Cards
        
        setPointerCardPosition({ 
          x: leftCardCenterX, 
          y: flightProgressHeight + gapBetweenComponents + leftCardCenterY 
        });
        
        // Show plus button at promo card position after a short delay
        setTimeout(() => {
          console.log('Setting showPlusButtonAtCard to true');
          setShowPlusButtonAtCard(true);
          
          // Simulate click on plus button after it appears
          setTimeout(() => {
            console.log('Attempting to click plus button at card...');
            const plusButtonAtCard = document.querySelector('.landing-plus-button:last-child .plus-button-inner');
            console.log('Plus button found:', !!plusButtonAtCard);
            if (plusButtonAtCard) {
              // Add clicked state visual feedback
              plusButtonAtCard.style.transform = 'scale(0.9)';
              plusButtonAtCard.style.backgroundColor = '#10B981';
              plusButtonAtCard.style.borderColor = '#10B981';
              plusButtonAtCard.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
              console.log('Plus button clicked, showing prompt bubble in 300ms...');
              
              // Show prompt bubble and hide plus button after click effect
              setTimeout(() => {
                console.log('Setting showPromptBubbleAtCard to true');
                setShowPlusButtonAtCard(false);
                setShowPromptBubbleAtCard(true);
                
                // Calculate position for prompt bubble at the same position as plus button
                if (barRef.current) {
                  const containerRect = barRef.current.getBoundingClientRect();
                  // Account for PromptBubble's internal offset adjustments (-160 for x, -60 for y)
                  const bubbleX = containerRect.left + pointerCardPosition.x + 160; // Plus button position + offset
                  const bubbleY = containerRect.top + pointerCardPosition.y + 60; // Plus button position + offset
                  console.log('Promo card prompt bubble position:', { x: bubbleX, y: bubbleY });
                  console.log('pointerCardPosition:', pointerCardPosition);
                  console.log('containerRect:', { left: containerRect.left, top: containerRect.top });
                  setPromptBubbleCardPosition({ x: bubbleX, y: bubbleY });
                } else {
                  console.log('barRef.current is null');
                }
              }, 300); // Show prompt bubble after click effect
            }
          }, 800); // Click after 800ms of plus button appearing
        }, 500); // 500ms after pointer moves to card
      }, 1000); // 1 second after Takeoff label appears
    }
  };

  return (
    <div className="flight-progress-bar-container" ref={barRef} onClick={handleBarClick}>
      <div className="flight-path"></div>
      <div className="flight-progress" style={{ 
        width: `${progressWidth}px`, 
        background: themeColor,
        opacity: 1,
        // Ensure minimum contrast - if theme color is very light, use a darker fallback
        filter: themeColor && themeColor.toLowerCase() !== '#ffffff' && themeColor.toLowerCase() !== '#fff' ? 'none' : 'brightness(0.2)',
        // Ensure minimum width for visibility when animating
        minWidth: showMovingIcon ? '4px' : '0px'
      }}></div>
      <div
        className={`flight-progress-icon ${showMovingIcon ? 'moving-icon' : ''} ${hasReachedTarget ? 'reached-target' : ''}`}
        ref={iconRef}
        style={{ 
          left: `${iconLeft}px`, 
          cursor: showMovingIcon ? 'default' : 'pointer', 
          background: themeColor, 
          borderColor: themeColor,
          opacity: 1,
          // Ensure minimum contrast for the icon as well
          filter: themeColor && themeColor.toLowerCase() !== '#ffffff' && themeColor.toLowerCase() !== '#fff' ? 'none' : 'brightness(0.2)',
          // Ensure icon is visible even at start position
          visibility: showMovingIcon && iconLeft < 0 ? 'hidden' : 'visible'
        }}
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
        {/* Inline SVG for flight icon */}
        <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.38928 1.85868C4.90331 0.817318 6.26994 -0.0872904 7.0387 0.766884L14.2535 8.78446H18.2301C18.4449 8.7845 18.6582 8.81911 18.8619 8.887L21.7086 9.83524C22.62 10.1392 22.6198 11.4286 21.7086 11.7327L18.8619 12.6819C18.6582 12.7498 18.4448 12.7844 18.2301 12.7845H14.2535L7.0387 20.802C6.26994 21.6562 4.90331 20.7516 5.38928 19.7102L8.70081 12.6136L4.45764 11.7649C4.18241 11.7099 3.97824 11.5673 3.84436 11.3831L2.49866 15.2308C2.12666 16.2933 0.554321 16.0255 0.554321 14.8997V6.66825C0.554625 5.54267 2.12677 5.27563 2.49866 6.33817L3.84436 10.1849C3.97825 10.0009 4.18265 9.85899 4.45764 9.80399L8.70081 8.95438L5.38928 1.85868Z" fill="white"/>
        </svg>
      </div>
      
      {/* Dummy mouse pointer */}
      {showPointer && showMovingIcon && !movePointerToCard && (
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
        </div>
      )}
      
      {/* Dummy mouse pointer at promo card position */}
      {movePointerToCard && showMovingIcon && (
        <div 
          className="dummy-mouse-pointer"
          style={{
            position: 'absolute',
            left: `${pointerCardPosition.x}px`,
            top: `${pointerCardPosition.y}px`,
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
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
      
      {/* Plus button at promo card position */}
      {showPlusButtonAtCard && showMovingIcon && (
        <div 
          className="landing-plus-button"
          style={{
            position: 'absolute',
            left: `${pointerCardPosition.x}px`,
            top: `${pointerCardPosition.y}px`,
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
      
      {/* Prompt Bubble for Promo Card */}
      <PromptBubble
        isVisible={showPromptBubbleAtCard && showMovingIcon}
        position={promptBubbleCardPosition}
        elementType="promo-card"
        elementData={{ cardIndex: 0, cardType: 'shopping' }}
        onClose={() => setShowPromptBubbleAtCard(false)}
        onSubmit={(promptText, elementType, elementData, positionKey) => {
          console.log('Promo card prompt submitted:', promptText);
          setShowPromptBubbleAtCard(false);
        }}
        themeColor={themeColor}
        existingText=""
        positionKey="landing-demo-promo"
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