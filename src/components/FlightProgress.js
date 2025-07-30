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

export default function FlightProgress({ landingIn = "LANDING IN 2H 55M", maxFlightMinutes = 370, minutesLeft: externalMinutesLeft, onProgressChange, themeColor = '#1E1E1E', isPromptMode = false, onPromptHover, onPromptClick, fpsPrompts = {}, showMovingIcon = false, onAnimationProgressChange, onPromoCardLoadingChange, onAnimationProgress, onCruiseLabelShow, onMiddleCardPromptClose, onThemeColorChange }) {
  console.log('=== FlightProgress themeColor ===', { themeColor, isGradient: themeColor.includes('gradient') });
  
  // Helper function to determine color based on theme type
  const getElementColor = () => {
    return themeColor.includes('gradient') ? '#000000' : themeColor;
  };
  
  const barWidth = 1302;
  const [dragging, setDragging] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(showMovingIcon ? 0.02 : 0); // Start with 2% progress if showing moving icon
  const [hasReachedTarget, setHasReachedTarget] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const [showPlusButton, setShowPlusButton] = useState(false);
  const [showPromptBubble, setShowPromptBubble] = useState(false);
  const [promptBubblePosition, setPromptBubblePosition] = useState({ x: 0, y: 0 });
  const [showTakeoffLabel, setShowTakeoffLabel] = useState(false);
  const [showCruiseLabel, setShowCruiseLabel] = useState(false);
  const [movePointerToCard, setMovePointerToCard] = useState(false);
  const [pointerCardPosition, setPointerCardPosition] = useState({ x: 0, y: 0 });
  const [showPlusButtonAtCard, setShowPlusButtonAtCard] = useState(false);
  const [showPromptBubbleAtCard, setShowPromptBubbleAtCard] = useState(false);
  const [promptBubbleCardPosition, setPromptBubbleCardPosition] = useState({ x: 0, y: 0 });
  const [promoCardLoading, setPromoCardLoading] = useState(false);
  const [promptBubbleLoading, setPromptBubbleLoading] = useState(false);
  const [movePointerToSecondTile, setMovePointerToSecondTile] = useState(false);
  const [secondTilePosition, setSecondTilePosition] = useState({ x: 0, y: 0 });
  const lastProgressRef = useRef(0.02);
  const [movePointerToMiddleCard, setMovePointerToMiddleCard] = useState(false);
  const [middleCardPosition, setMiddleCardPosition] = useState({ x: 0, y: 0 });
  const [showPlusButtonAtMiddleCard, setShowPlusButtonAtMiddleCard] = useState(false);
  const [middleCardPromptClosed, setMiddleCardPromptClosed] = useState(false);
  const [movePointerToFJB, setMovePointerToFJB] = useState(false);
  const [fjbPosition, setFjbPosition] = useState({ x: 0, y: 0 });
  const [showPlusButtonAtFJB, setShowPlusButtonAtFJB] = useState(false);
  const [showPromptBubbleAtFJB, setShowPromptBubbleAtFJB] = useState(false);
  const [promptBubbleFJBPosition, setPromptBubbleFJBPosition] = useState({ x: 0, y: 0 });
  const barRef = useRef();
  const iconRef = useRef();

  // Set CSS custom property for theme color
  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.setProperty('--theme-color', themeColor);
    }
  }, [themeColor]);

  // Debug: Track when showPromptBubble changes
  useEffect(() => {
    console.log('=== showPromptBubble changed ===', { 
      showPromptBubble, 
      showMovingIcon, 
      hasReachedTarget,
      animationProgress 
    });
  }, [showPromptBubble, showMovingIcon, hasReachedTarget, animationProgress]);

  // Move pointer to FJB after middle card prompt closes
  useEffect(() => {
    console.log('=== MIDDLE CARD PROMPT CLOSURE CHECK ===', { middleCardPromptClosed, showMovingIcon });
    if (middleCardPromptClosed && showMovingIcon) {
      console.log('=== MIDDLE CARD PROMPT CLOSED - MOVING POINTER TO FJB ===');
      
      // Move pointer to FJB after a delay
      setTimeout(() => {
        console.log('=== HIDING MIDDLE CARD ELEMENTS AND MOVING TO FJB ===');
        setShowPointer(false);
        setMovePointerToMiddleCard(false);
        setShowPlusButtonAtMiddleCard(false);
        setMovePointerToFJB(true);
        
        // Show plus button after pointer appears at FJB
        setTimeout(() => {
          console.log('=== SHOWING PLUS BUTTON AT FJB ===');
          setShowPlusButtonAtFJB(true);
          
          // Show prompt bubble after plus button appears
          setTimeout(() => {
            console.log('=== PREPARING FJB PROMPT BUBBLE ===');
            // Calculate FJB prompt bubble position
            // Add a small delay to ensure DOM is ready
            setTimeout(() => {
              // Calculate absolute position like Dashboard does
              // Find the flight progress bar container to get its absolute position
              const flightProgressContainer = document.querySelector('.flight-progress-bar-container');
              if (flightProgressContainer) {
                const containerRect = flightProgressContainer.getBoundingClientRect();
                
                // Plus button is at barWidth / 2 + 20, top: -12px (relative to progress bar)
                // Calculate absolute position relative to viewport
                const absoluteX = containerRect.left + barWidth / 2 + 20; // Plus button X (no spacing)
                const absoluteY = containerRect.top + (-12 + 16); // Plus button Y + half button height (reduced Y distance)
                
                console.log('=== FJB BUBBLE POSITION ===', {
                  barWidth,
                  containerRect: { left: containerRect.left, top: containerRect.top },
                  absoluteX,
                  absoluteY
                });
                
                setPromptBubbleFJBPosition({ x: absoluteX, y: absoluteY });
                              setShowPromptBubbleAtFJB(true);
              console.log('=== FJB PROMPT BUBBLE SHOWN FROM FLIGHTPROGRESS ===');
              console.log('=== FJB PROMPT BUBBLE STATE ===', { 
                showPromptBubbleAtFJB: true, 
                showMovingIcon,
                position: { x: absoluteX, y: absoluteY } 
              });
              } else {
                console.error('flight-progress-bar-container not found');
              }
            }, 100); // Small delay to ensure DOM is ready
                      }, 800); // 0.8 second delay after plus button appears
        }, 300); // 0.3 second delay after pointer appears at FJB
      }, 500); // 0.5 second delay after middle card prompt closed
    }
  }, [middleCardPromptClosed, showMovingIcon]);

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

    console.log('=== ANIMATION START ===', { 
      animationProgress, 
      startProgress: animationProgress, 
      targetProgress: 0.2,
      hasReachedTarget 
    });

    // Don't show Cruise label during animation - only show after prompt submission

    // If we've already reached the target, don't restart animation
    if (hasReachedTarget) return;

    // Add a delay to ensure DOM elements are ready
    const startAnimation = () => {
      const animationDuration = 8000; // 8 seconds to reach 20% (increased from 3 seconds)
      const startTime = Date.now();
      // Always start from the highest progress we've achieved to prevent backward movement
      const currentProgress = Math.max(0.02, animationProgress);
      const startProgress = Math.max(currentProgress, lastProgressRef.current);
      lastProgressRef.current = startProgress;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / animationDuration, 1);
        const newProgress = startProgress + (targetProgress - startProgress) * progressRatio;
        
        // Update both progress and icon position in the same frame
        setAnimationProgress(newProgress);
        
        // Update the last progress ref to track the highest progress achieved
        lastProgressRef.current = Math.max(lastProgressRef.current, newProgress);
        
        // Debug: Log animation progress (only log occasionally to avoid spam)
        if (newProgress % 0.05 < 0.01) { // Log every 5% progress
          console.log('=== ANIMATION PROGRESS ===', {
            elapsed,
            progressRatio,
            startProgress,
            newProgress,
            percentage: (newProgress * 100).toFixed(1) + '%',
            lastProgress: lastProgressRef.current
          });
        }
        
        // Debug: Log progress values
        if (newProgress >= 0.19 && newProgress <= 0.21) {
          console.log('Progress tracking:', {
            newProgress,
            percentage: (newProgress * 100).toFixed(1) + '%',
            hasReachedTarget
          });
        }
        
        // Show Takeoff label at 5% progress
        if (newProgress >= 0.05 && newProgress <= 0.06 && !showTakeoffLabel) {
          setShowTakeoffLabel(true);
        }
        
        // Pass animation progress to parent
        if (onAnimationProgress) {
          onAnimationProgress(newProgress);
        }
        
        // Don't show Cruise label during animation - only show after prompt submission
        
        // Show prompt bubble exactly at 20% progress
        if (newProgress >= 0.20 && newProgress <= 0.205 && !hasReachedTarget) {
          console.log('=== 20% PROGRESS REACHED ===', { 
            newProgress, 
            hasReachedTarget,
            exactProgress: (newProgress * 100).toFixed(1) + '%'
          });
          setHasReachedTarget(true);
        }
        
        // Calculate and update countdown timer based on animation progress
        if (onAnimationProgressChange) {
          const startMinutes = 185; // 3H 05M
          const endMinutes = 148;   // 2H 28M (20% progress)
          const currentMinutes = startMinutes - (newProgress * (startMinutes - endMinutes) / 0.2);
          onAnimationProgressChange(Math.round(currentMinutes));
        }
        
        if (progressRatio < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation has completed - flight icon has stopped
          console.log('=== FLIGHT ICON STOPPED ===', { 
            finalProgress: newProgress,
            percentage: (newProgress * 100).toFixed(1) + '%'
          });
          
          // Show dummy mouse pointer first
          setTimeout(() => {
            setShowPointer(true);
          }, 500); // Reduced from 2000ms to 500ms
          
          // Show plus button after pointer appears
          setTimeout(() => {
            setShowPlusButton(true);
            
            // Show prompt bubble below the plus button after 1 second
            setTimeout(() => {
              setShowPromptBubble(true);
              setShowPlusButton(false); // Hide plus button when prompt bubble appears
              
              // Calculate position for prompt bubble below the plus button
              // Use target progress (20%) to ensure correct positioning
              const targetIconLeft = Math.max(0, Math.min(barWidth * targetProgress - 16, barWidth - 32));
              // Plus button is at targetIconLeft + 8, top: 48px
              // Position bubble 2px away from the plus button
              const bubbleX = targetIconLeft + 8 + 2; // 2px to the right of plus button
              const bubbleY = 48 + 32 + 10; // Plus button Y + button height + spacing
              
              console.log('=== FPS BUBBLE POSITION CALCULATION ===', {
                iconLeft,
                targetIconLeft,
                plusButtonX: targetIconLeft + 8,
                plusButtonY: 48,
                bubbleX,
                bubbleY,
                animationProgress,
                barWidth,
                targetProgress
              });
              
              setPromptBubblePosition({ x: bubbleX, y: bubbleY });
            }, 1000); // Reduced from 2000ms to 1000ms
          }, 1000); // Reduced from 3000ms to 1000ms
        }
      };

      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    };

    // Start animation after a delay to ensure DOM is ready
    const timer = setTimeout(startAnimation, 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, [showMovingIcon, showTakeoffLabel, showCruiseLabel, hasReachedTarget]);

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

  const handlePromoCardLoadingChange = (isLoading) => {
    setPromoCardLoading(isLoading);
    if (onPromoCardLoadingChange) {
      onPromoCardLoadingChange(isLoading);
    }
  };

  const handlePromoCardVisibilityChange = (isVisible) => {
    if (onPromoCardLoadingChange) {
      // Notify parent that the prompt bubble is visible (this will trigger showing the croissant image)
      onPromoCardLoadingChange(!isVisible); // Pass false to indicate loading is finished
    }
    
    // If the prompt bubble becomes visible, schedule the next steps
    if (isVisible) {
      // After 2 seconds, close the prompt bubble and move pointer to 2nd tile
      setTimeout(() => {
        setShowPromptBubbleAtCard(false);
        
        // Calculate position for 2nd tile in "Recommended for you" section
        // The 2nd tile is in a 4-column grid with gap-6 (24px gap)
        // Each tile takes 1/4 of the width minus the gaps
        const containerWidth = 1302;
        const tileWidth = (containerWidth - 72) / 4; // 72px = 3 gaps of 24px each
        const gap = 24;
        
        // Position of 2nd tile (index 1)
        const secondTileX = gap + tileWidth + gap; // First gap + first tile + second gap
        const secondTileY = 184 / 2; // Center of tile height
        
        // Convert to absolute position relative to the flight progress bar container
        // Component3Cards is positioned below the flight progress bar with gap: 32
        // "Recommended for you" section is below Component3Cards with gap: 24
        const flightProgressHeight = 32; // Height of flight progress bar
        const gapBetweenComponents = 32; // Gap between flight progress and Component3Cards
        const component3CardsHeight = 200; // Height of Component3Cards
        const gapToRecommended = 24; // Gap between Component3Cards and "Recommended for you"
        const recommendedTitleHeight = 28; // Height of "Recommended for you" title
        
        setSecondTilePosition({ 
          x: secondTileX, 
          y: flightProgressHeight + gapBetweenComponents + component3CardsHeight + gapToRecommended + recommendedTitleHeight + secondTileY 
        });
        
        // Move pointer to 2nd tile after a short delay
        setTimeout(() => {
          setMovePointerToCard(false); // Hide pointer at promo card
          setMovePointerToSecondTile(true);
        }, 500);
      }, 2000); // 2 seconds after prompt bubble appears
    }
  };

  const handlePromptBubbleSubmit = (promptText, elementType, elementData, positionKey) => {
    // Handle the prompt submission for landing page demo
    console.log('=== HANDLE PROMPT BUBBLE SUBMIT CALLED ===');
    console.log('Prompt submitted:', promptText, elementType, elementData, positionKey);
    console.log('Prompt text comparison:', {
      submitted: promptText,
      expected: "Cruise",
      isMatch: promptText === "Cruise",
      trimmed: promptText.trim(),
      trimmedMatch: promptText.trim() === "Cruise"
    });
    
    // Show the Cruise label below the flight icon
    if (promptText.trim() === "Cruise") {
      console.log('=== CRUISE DETECTED - SHOWING LABEL ===');
      setShowCruiseLabel(true);
      setShowPromptBubble(false); // Close prompt bubble immediately
      
      // Notify parent that Cruise label has appeared
      if (onCruiseLabelShow) {
        onCruiseLabelShow(true);
      }
      
      // Move cursor to middle promo card after a short delay
      setTimeout(() => {
        console.log('=== MOVING TO MIDDLE CARD ===');
        // Calculate position for middle promo card (Component3Cards)
        // Component3Cards is positioned below the flight progress bar with gap: 32
        // The middle card is the 2nd card (index 1) in a 3-card layout with gap-8 (32px gap)
        const containerWidth = 1302;
        const cardWidth = 416;
        const gap = 32;
        const totalCardsWidth = cardWidth * 3 + gap * 2; // 3 cards + 2 gaps
        const startX = (containerWidth - totalCardsWidth) / 2; // Center the cards
        
        // Position of middle card (index 1)
        const middleCardX = startX + cardWidth + gap; // First card + gap
        const middleCardY = 100; // Center of card height (200px / 2)
        
        // Position relative to the flight progress bar container (same as dummy mouse pointer)
        // Component3Cards is positioned below the flight progress bar with gap: 32
        const flightProgressHeight = 32; // Height of flight progress bar
        const gapBetweenFPSAndComponent3Cards = 32; // Gap between FPS and Component3Cards
        
        setMiddleCardPosition({ 
          x: middleCardX, 
          y: flightProgressHeight + gapBetweenFPSAndComponent3Cards + middleCardY 
        });
        
        // Hide pointer at flight icon and move to middle card
        setShowPointer(false);
        setMovePointerToMiddleCard(true);
        
        // Show plus button at middle card after cursor moves
        setTimeout(() => {
          console.log('=== SHOWING PLUS BUTTON AT MIDDLE CARD ===');
          console.log('=== MIDDLE CARD POSITION WHEN PLUS APPEARS ===', middleCardPosition);
          setShowPlusButtonAtMiddleCard(true);
          
          // Show prompt bubble at middle card after 1 second
          setTimeout(() => {
            console.log('=== SHOWING PROMPT BUBBLE AT MIDDLE CARD ===');
            setShowPlusButtonAtMiddleCard(false); // Hide plus button
            
            // Trigger prompt bubble to appear on the actual middle card
            console.log('=== ATTEMPTING TO FIND MIDDLE CARD ===');
            
            // Try multiple selectors to find the middle card
            const selectors = [
              '[data-name="autumn meal"]',
              '[data-name="3-cards"] > div:nth-child(2)', 
              '.flex.flex-row.gap-8 > div:nth-child(2)',
              'div[style*="width: 416px"]:nth-child(2)'
            ];
            
            let middleCardElement = null;
            let usedSelector = '';
            
            for (const selector of selectors) {
              middleCardElement = document.querySelector(selector);
              if (middleCardElement) {
                usedSelector = selector;
                break;
              }
            }
            
            if (middleCardElement) {
              const rect = middleCardElement.getBoundingClientRect();
              console.log('=== FOUND MIDDLE CARD ===', { 
                usedSelector, 
                rect,
                element: middleCardElement
              });
              
              // Create and dispatch a click event
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
              });
              
              console.log('=== DISPATCHING CLICK EVENT ===', {
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
              });
              
              middleCardElement.dispatchEvent(clickEvent);
            } else {
              console.error('Middle card element not found with any selector');
              console.log('=== ALL AVAILABLE ELEMENTS ===');
              document.querySelectorAll('[data-name="3-cards"] > div').forEach((el, i) => {
                console.log(`Card ${i}:`, el);
              });
            }
          }, 1000);
        }, 300);
      }, 1000); // 1 second delay after Cruise label appears
      
      // Animation ends here - no more interactions with promo cards
    } else {
      console.log('=== CRUISE NOT DETECTED ===');
    }
  };

  return (
    <div className="flight-progress-bar-container" ref={barRef} onClick={handleBarClick}>
      <div className="flight-path"></div>
      <div className="flight-progress" style={{ 
        width: `${progressWidth}px`, 
        background: getElementColor(),
        opacity: 1,
        // Ensure minimum contrast - if theme color is very light, use a darker fallback
        filter: themeColor.includes('gradient') ? 'none' : (themeColor && themeColor.toLowerCase() !== '#ffffff' && themeColor.toLowerCase() !== '#fff' ? 'none' : 'brightness(0.2)'),
        // Ensure minimum width for visibility when animating
        minWidth: showMovingIcon ? '4px' : '0px'
      }}></div>
      <div
        className={`flight-progress-icon ${showMovingIcon ? 'moving-icon' : ''} ${hasReachedTarget ? 'reached-target' : ''}`}
        ref={iconRef}
        style={{ 
          left: `${iconLeft}px`, 
          cursor: showMovingIcon ? 'default' : 'pointer', 
          background: getElementColor(), 
          borderColor: getElementColor(),
          opacity: 1,
          // Ensure minimum contrast for the icon as well
          filter: themeColor.includes('gradient') ? 'none' : (themeColor && themeColor.toLowerCase() !== '#ffffff' && themeColor.toLowerCase() !== '#fff' ? 'none' : 'brightness(0.2)'),
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
      
      {/* Plus button below flight icon */}
      {showPlusButton && showMovingIcon && !showPromptBubble && (
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
      
      {/* Dummy mouse pointer */}
      {showPointer && showMovingIcon && !movePointerToCard && !movePointerToSecondTile && (
        <div 
          className="dummy-mouse-pointer"
          style={{
            position: 'absolute',
            left: `${iconLeft + 16}px`,
            top: '48px', // Position below the flight icon (same as plus button)
            zIndex: 20, // Higher z-index to appear above plus button
            pointerEvents: 'none'
          }}
        >
        </div>
      )}
      
      {/* Dummy mouse pointer at promo card position */}
      {/* {movePointerToCard && showMovingIcon && (
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
      )} */}
      
      {/* Dummy mouse pointer at 2nd tile position */}
      {/* {movePointerToSecondTile && showMovingIcon && (
        <div 
          className="dummy-mouse-pointer"
          style={{
            position: 'absolute',
            left: `${secondTilePosition.x}px`,
            top: `${secondTilePosition.y}px`,
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
        </div>
      )} */}
      
      {/* Dummy mouse pointer at middle promo card position */}
      {movePointerToMiddleCard && showMovingIcon && (
        <div 
          className="dummy-mouse-pointer"
          style={{
            position: 'absolute',
            left: `${middleCardPosition.x}px`,
            top: `${middleCardPosition.y}px`,
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
        </div>
      )}
      
      {/* Plus button at middle promo card position */}
      {showPlusButtonAtMiddleCard && showMovingIcon && (
        <div 
          className="landing-plus-button"
          style={{
            position: 'absolute',
            left: `${middleCardPosition.x + 8}px`,
            top: `${middleCardPosition.y + 8}px`,
            zIndex: 25,
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
              }}>
              +
            </span>
          </div>
        </div>
      )}

      {/* Dummy mouse pointer at FJB position */}
      {movePointerToFJB && showMovingIcon && (
        <div 
          className="dummy-mouse-pointer"
          style={{
            position: 'absolute',
            left: `${barWidth / 2}px`, // Center of the flight progress bar
            top: '-12px', // Position much higher above the flight progress bar
            zIndex: 20,
            pointerEvents: 'none',
            transform: 'translateX(-50%)' // Center the pointer horizontally
          }}
        >
        </div>
      )}

      {/* Plus button at FJB position */}
      {showPlusButtonAtFJB && showMovingIcon && (
        <div 
          className="landing-plus-button"
          style={{
            position: 'absolute',
            left: `${barWidth / 2 + 20}px`, // Position to the right of the dummy pointer
            top: '-12px',
            zIndex: 25,
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
              }}>
              +
            </span>
          </div>
        </div>
      )}


      
      {/* Takeoff Label - Sticky at 5% position */}
      {showTakeoffLabel && (
        <div 
          className="flight-prompt-label"
          style={{
            position: 'absolute',
            left: `${barWidth * 0.05}px`, // 5% position
            top: '40px',
            color: getElementColor(),
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            zIndex: 10,
            transform: 'translateX(-50%)' // Center the label text
          }}
        >
          TAKEOFF
        </div>
      )}
      
      {/* Takeoff Position Dot */}
      {showTakeoffLabel && (
        <div 
          className="flight-progress-dot"
          style={{
            position: 'absolute',
            left: `${barWidth * 0.05}px`, // 5% position
            top: '14px', // Center of the progress bar (adjusted for larger size)
            width: '12px',
            height: '12px',
            backgroundColor: getElementColor(),
            borderRadius: '50%',
            zIndex: 1,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transform: 'translateX(-50%)' // Center the dot
          }}
        />
      )}
      

      
      {/* Cruise Label - Fixed at 20% position */}
      {showCruiseLabel && (
        <div 
          className="flight-prompt-label"
          style={{
            position: 'absolute',
            left: `${barWidth * 0.20}px`, // Fixed 20% position
            top: '40px', // Same spacing as Takeoff label
            color: getElementColor(),
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            zIndex: 10,
            animation: 'label-appear 0.5s ease-out',
            transform: 'translateX(-50%)', // Center the label text
            transition: 'none' // Ensure no CSS transitions affect positioning
          }}
        >
          CRUISE
        </div>
      )}
      
      {/* Cruise Position Dot */}
      {showCruiseLabel && (
        <div 
          className="flight-progress-dot"
          style={{
            position: 'absolute',
            left: `${barWidth * 0.20}px`, // Fixed 20% position
            top: '14px', // Center of the progress bar (same as Takeoff dot)
            width: '12px',
            height: '12px',
            backgroundColor: getElementColor(),
            borderRadius: '50%',
            zIndex: 1,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transform: 'translateX(-50%)', // Center the dot
            transition: 'none' // Ensure no CSS transitions affect positioning
          }}
        />
      )}
      
      {/* Prompt Bubble */}
      <PromptBubble
        isVisible={showPromptBubble && showMovingIcon && hasReachedTarget}
        position={promptBubblePosition}
        elementType="flight-icon"
        elementData={{ progress, minutesLeft: displayMinutes }}
        onClose={handlePromptBubbleClose}
        onSubmit={handlePromptBubbleSubmit}
        themeColor={themeColor}
        existingText={promptBubbleLoading ? "loading..." : ""}
        positionKey="landing-demo"
        fpsPrompts={{}}
      />
      


      {/* Prompt Bubble at FJB */}
      <PromptBubble
        isVisible={showPromptBubbleAtFJB && showMovingIcon}
        position={promptBubbleFJBPosition}
        elementType="flight-journey-bar"
        elementData={{ barWidth, themeColor }}
        onClose={() => {
          console.log('=== FJB PROMPT BUBBLE CLOSED ===');
          setShowPromptBubbleAtFJB(false);
        }}
        onSubmit={(promptText, elementType, elementData, positionKey) => {
          console.log('=== FJB PROMPT SUBMITTED FROM FLIGHTPROGRESS ===', { 
            promptText, 
            elementType, 
            elementData, 
            positionKey 
          });
          console.log('=== FLIGHTPROGRESS ONSUBMIT HANDLER CALLED ===');
          setShowPromptBubbleAtFJB(false);
          
          // Update theme color to gradient green for FJB landing page
          console.log('=== CHECKING POSITION KEY IN FLIGHTPROGRESS ===', { 
            positionKey, 
            isFJBLanding: positionKey === 'fjb-landing' 
          });
          if (positionKey === 'fjb-landing') {
            console.log('=== UPDATING THEME FROM FLIGHTPROGRESS ===');
            console.log('=== onThemeColorChange EXISTS ===', { exists: !!onThemeColorChange });
            if (onThemeColorChange) {
              console.log('=== CALLING onThemeColorChange WITH GRADIENT ===');
              onThemeColorChange('linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)');
              console.log('=== THEME COLOR CHANGE CALLED SUCCESSFULLY ===');
            } else {
              console.log('=== ERROR: onThemeColorChange IS NULL ===');
            }
          } else {
            console.log('=== POSITION KEY IS NOT FJB-LANDING ===', { positionKey });
          }
        }}
        themeColor={themeColor}
        existingText=""
        positionKey="fjb-landing"
        fpsPrompts={{}}
        onThemeColorChange={onThemeColorChange}
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