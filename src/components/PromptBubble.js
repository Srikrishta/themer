import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { HexColorPicker } from 'react-colorful';

export default function PromptBubble({ 
  isVisible, 
  position, 
  elementType, 
  elementData, 
  onClose, 
  onSubmit,
  themeColor = '#1E1E1E',
  existingText = '',
  positionKey,
  fpsPrompts = {},
  onLoadingStateChange,
  onVisibilityChange,
  onThemeColorChange
}) {
  const [promptText, setPromptText] = useState(elementType === 'flight-icon' && positionKey === 'landing-demo' ? 'Cruise' : (elementType === 'promo-card' ? '' : ''));
  const [isLoading, setIsLoading] = useState(elementType === 'promo-card' ? true : false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [stickyPosition, setStickyPosition] = useState(null);
  const [selectedChip, setSelectedChip] = useState(elementType === 'flight-icon' && positionKey === 'landing-demo' ? 'cruise' : null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(themeColor);
  const bubbleRef = useRef(null);
  const inputRef = useRef(null);

  // Flight phase chips for FPS
  const flightPhaseChips = [
    { id: 'takeoff', label: 'Takeoff', color: '#6B7280' },
    { id: 'climb', label: 'Climb', color: '#6B7280' },
    { id: 'cruise', label: 'Cruise', color: '#6B7280' },
    { id: 'descent', label: 'Descent', color: '#6B7280' },
    { id: 'landing', label: 'Landing', color: '#6B7280' }
  ];

  // Set sticky position when bubble becomes visible
  useEffect(() => {
    console.log('=== PROMPT BUBBLE POSITION UPDATE ===', { 
      isVisible, 
      position, 
      stickyPosition,
      elementType,
      positionKey 
    });
    if (isVisible && position && !stickyPosition) {
      // For relative positioning, we need to get the container's position
      let containerLeft = 0;
      let containerTop = 0;
      
      // Find the flight progress container
      const flightProgressContainer = document.querySelector('.flight-progress-bar-container');
      if (flightProgressContainer) {
        const containerRect = flightProgressContainer.getBoundingClientRect();
        containerLeft = containerRect.left;
        containerTop = containerRect.top;
      }
      
      // Convert relative coordinates to absolute viewport coordinates
      const absoluteX = containerLeft + position.x;
      const absoluteY = containerTop + position.y;
      
      // Convert viewport coordinates to document coordinates
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      const newStickyPosition = {
        x: absoluteX + scrollX,
        y: absoluteY + scrollY
      };
      
      console.log('=== SETTING STICKY POSITION ===', {
        position,
        containerLeft,
        containerTop,
        absoluteX,
        absoluteY,
        scrollX,
        scrollY,
        newStickyPosition
      });
      
      setStickyPosition(newStickyPosition);
    } else if (!isVisible) {
      setStickyPosition(null);
    }
  }, [isVisible, position, stickyPosition]);

  // Update selectedColor when themeColor changes (for automatic theme cycling)
  useEffect(() => {
    setSelectedColor(themeColor);
  }, [themeColor]);

  // Update position on scroll to maintain relative position
  useEffect(() => {
    if (!isVisible || !stickyPosition) return;

    const handleScroll = () => {
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      // Convert document coordinates back to viewport coordinates for fixed positioning
      const viewportX = stickyPosition.x - scrollX;
      const viewportY = stickyPosition.y - scrollY;
      
      const finalX = Math.max(10, Math.min(viewportX - 160, window.innerWidth - 400));
      const finalY = Math.max(10, Math.min(viewportY - 60, window.innerHeight - 200));
      
      console.log('=== PROMPT BUBBLE SCROLL POSITION ===', {
        stickyPosition,
        scrollX,
        scrollY,
        viewportX,
        viewportY,
        finalX,
        finalY,
        elementType,
        positionKey
      });
      
      if (bubbleRef.current) {
        bubbleRef.current.style.left = `${finalX}px`;
        bubbleRef.current.style.top = `${finalY}px`;
      }
    };

    // Set initial position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible, stickyPosition]);

  // Get used prompts for filtering chips
  const getUsedPrompts = () => {
    const used = new Set();
    Object.values(fpsPrompts).forEach(promptText => {
      if (promptText) {
        used.add(promptText.toLowerCase());
      }
    });
    return used;
  };

  // Filter out chips that are already used at other positions
  const getAvailableChips = () => {
    if (elementType !== 'flight-icon') return flightPhaseChips;
    
    const usedPrompts = getUsedPrompts();
    const currentText = existingText.toLowerCase();
    
    return flightPhaseChips.filter(chip => {
      const chipLabel = chip.label.toLowerCase();
      // Show chip if it's not used elsewhere, OR if it's the current position's text
      return !usedPrompts.has(chipLabel) || chipLabel === currentText;
    });
  };

  const availableChips = getAvailableChips();

  // Auto-click send button for landing page demo
  useEffect(() => {
    if (elementType === 'flight-icon' && positionKey === 'landing-demo' && isVisible) {
      console.log('=== LANDING DEMO AUTO-SUBMISSION CHECK ===', { 
        promptText, 
        isLoading, 
        promptTextTrimmed: promptText.trim(),
        shouldSubmit: promptText.trim() && !isLoading 
      });
      // Wait 3 seconds after prompt bubble appears, then auto-submit
      const timer = setTimeout(() => {
        if (promptText.trim() && !isLoading) {
          console.log('=== AUTO-SUBMITTING CRUISE ===');
          setIsLoading(true);
          onSubmit(promptText.trim(), elementType, elementData, positionKey);
          setPromptText('');
        } else {
          console.log('=== AUTO-SUBMISSION FAILED ===', { 
            promptText, 
            isLoading, 
            promptTextTrimmed: promptText.trim() 
          });
        }
      }, 3000); // 3 seconds delay after prompt bubble appears
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, promptText, isLoading, elementType, positionKey, onSubmit, elementData]);

  // Auto-click send button for middle card demo
  useEffect(() => {
    if (elementType === 'promo-card' && positionKey === 'middle-card-demo' && isVisible && !isLoading && promptText.trim() && !isTyping) {
      console.log('=== MIDDLE CARD AUTO-SUBMISSION CHECK ===', { 
        promptText, 
        isLoading, 
        isTyping,
        promptTextTrimmed: promptText.trim(),
        shouldSubmit: promptText.trim() && !isLoading && !isTyping 
      });
      // Wait 2 seconds after typing animation completes, then auto-submit
      const timer = setTimeout(() => {
        console.log('=== AUTO-SUBMITTING MIDDLE CARD ===');
        setIsLoading(true);
        setPromptText('loading...');
        onSubmit(promptText.trim(), elementType, elementData, positionKey);
        // Close the bubble after submission
        setTimeout(() => {
          console.log('=== AUTO-CLOSING MIDDLE CARD BUBBLE ===');
          onClose();
        }, 500); // Close after 500ms to show loading state briefly
      }, 2000); // 2 seconds delay after text is ready
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, promptText, isLoading, isTyping, elementType, positionKey, onSubmit, elementData, onClose]);

  // Function to simulate typing animation
  const startTypingAnimation = (text) => {
    console.log('=== STARTING TYPING ANIMATION ===', { text });
    setIsTyping(true);
    setTypedText('');
    let index = 0;
    
    const typeNextChar = () => {
      if (index < text.length) {
        setTypedText(prev => prev + text[index]);
        index++;
        setTimeout(typeNextChar, 100); // Type each character with 100ms delay
      } else {
        console.log('=== TYPING ANIMATION COMPLETED ===');
        setIsTyping(false);
        setPromptText(text);
      }
    };
    
    typeNextChar();
  };

  // Focus input when bubble becomes visible and reset loading state
  useEffect(() => {
    if (isVisible && inputRef.current) {
      console.log('=== PROMPT BUBBLE BECAME VISIBLE ===', { elementType, positionKey, isVisible });
      inputRef.current.focus();
      if (elementType === 'promo-card' && positionKey === 'middle-card-demo') {
        console.log('=== STARTING MIDDLE CARD TYPING ANIMATION ===');
        // For middle card demo, start typing animation immediately without loading
        setIsLoading(false);
        setTimeout(() => {
          console.log('=== CALLING startTypingAnimation FOR MIDDLE CARD ===');
          startTypingAnimation('Croissants at 3€');
        }, 1000); // Increased delay to ensure DOM is ready
      } else if (elementType === 'flight-journey-bar' && positionKey === 'fjb-demo') {
        // For FJB demo, start typing animation immediately without loading
        setIsLoading(false);
        setTimeout(() => {
          startTypingAnimation('add eiffel tower animation');
        }, 500); // Small delay before starting typing animation
      } else if (elementType === 'promo-card' && existingText === '') {
        setIsLoading(true);
        // Start typing animation after loading is done
        setTimeout(() => {
          setIsLoading(false);
          // Start typing animation immediately after loading is done
          setTimeout(() => {
            startTypingAnimation('Croissants at 3€');
          }, 100); // Small delay after loading ends
        }, 1000); // 1 second loading time instead of 3 seconds
      } else {
        setIsLoading(false);
        setPromptText(existingText); // Load existing text for this position
      }
      
      // For landing page demo, show Cruise as already selected immediately
      if (elementType === 'flight-icon' && positionKey === 'landing-demo') {
        if (existingText === 'loading...') {
          setPromptText('loading...');
          setIsLoading(true);
        } else {
          setPromptText('Cruise');
          setSelectedChip('cruise');
        }
      }
    } else if (!isVisible) {
      // Reset states when bubble becomes invisible
      setSelectedChip(null);
      setPromptText('');
    }
  }, [isVisible, existingText, elementType, positionKey, onSubmit, elementData]);

  // Notify parent component when loading state changes
  useEffect(() => {
    if (onLoadingStateChange && elementType === 'promo-card') {
      onLoadingStateChange(isLoading);
    }
  }, [isLoading, elementType, onLoadingStateChange]);

  // Notify parent component when visibility changes
  useEffect(() => {
    if (onVisibilityChange && elementType === 'promo-card') {
      onVisibilityChange(isVisible);
    }
  }, [isVisible, elementType, onVisibilityChange]);

  // Handle click outside to close
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event) => {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (promptText.trim() && !isLoading) {
      setIsLoading(true);
      onSubmit(promptText.trim(), elementType, elementData, positionKey);
      setPromptText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: allow line break
        return;
      } else {
        // Enter: submit and show loading
        e.preventDefault();
        if (promptText.trim()) {
          setIsLoading(true);
          onSubmit(promptText.trim(), elementType, elementData, positionKey);
          setPromptText('');
        }
      }
    }
  };

  const handleChipClick = (chipLabel) => {
    setPromptText(chipLabel);
    // Find the chip id from the label
    const chip = flightPhaseChips.find(c => c.label === chipLabel);
    if (chip) {
      setSelectedChip(chip.id);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (onThemeColorChange) {
      onThemeColorChange(color);
    }
  };

  if (!isVisible || !stickyPosition) return null;



  return (
    <div
      ref={bubbleRef}
      className="fixed z-50 shadow-xl border-2 p-3 backdrop-blur-[10px] backdrop-filter"
      style={{
        backgroundColor: elementType === 'promo-card' && positionKey === 'middle-card-demo' 
          ? 'rgba(255,255,255,0.2)' // FJB color: semi-transparent white
          : themeColor,
        borderColor: elementType === 'promo-card' && positionKey === 'middle-card-demo'
          ? 'rgba(0,0,0,0.2)' // FJB border color
          : themeColor,
        borderTopLeftRadius: 0,
        borderTopRightRadius: '24px',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        width: '250px',
        maxWidth: '250px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={onClose}
          className={`${elementType === 'promo-card' ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'} transition-colors p-1`}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>



      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={isTyping ? typedText : (isLoading && elementType !== 'promo-card' ? 'loading...' : promptText)}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading && elementType !== 'promo-card' ? "loading..." : elementType === 'promo-card' ? "add image and text" : elementType === 'flight-journey-bar' ? "change theme or add animation" : "add flight phase"}
            className={`bg-transparent border-0 text-sm ${elementType === 'promo-card' ? 'text-black placeholder-black/60' : 'text-white placeholder-white/60'} resize-none focus:ring-0 focus:outline-none`}
            style={{
              width: '200px',
              maxWidth: '200px',
              minWidth: '1px',
              height: '20px',
              lineHeight: '20px',
              padding: 0,
              margin: 0,
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
              resize: 'none',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
            onInput={(e) => {
              // Auto-resize height
              e.target.style.height = '20px';
              const scrollHeight = e.target.scrollHeight;
              if (scrollHeight > 20) {
                e.target.style.height = `${scrollHeight}px`;
              }
            }}
          />
          
          {/* Flight Phase Chips - Only show for flight-icon and filter out used ones */}
          {elementType === 'flight-icon' && availableChips.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {availableChips.map((chip) => {
                const isSelected = selectedChip === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    data-chip={chip.id}
                    onClick={() => handleChipClick(chip.label)}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border"
                    style={{
                      backgroundColor: isSelected ? '#10B981' : `${chip.color}20`,
                      borderColor: isSelected ? '#10B981' : chip.color,
                      color: isSelected ? 'white' : (elementType === 'promo-card' ? '#000000' : '#FFFFFF'),
                      transform: isSelected ? 'scale(0.9)' : 'scale(1)',
                      boxShadow: isSelected ? '0 4px 8px rgba(16, 185, 129, 0.4)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = `${chip.color}40`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = `${chip.color}20`;
                      }
                    }}
                  >
                    {chip.label}
                    {!isSelected && <PlusIcon className="w-3 h-3 ml-1.5 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Button Row - Show for promo cards (PCs) and flight journey bar (FJB) */}
        {(elementType === 'promo-card' || elementType === 'flight-journey-bar') && (
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                if (elementType === 'flight-journey-bar') {
                  setShowColorPicker(!showColorPicker);
                } else {
                  // Handle image upload functionality
                  console.log('Image upload clicked');
                  // TODO: Implement image upload logic
                }
              }}
              className="text-black/70 hover:text-black transition-colors flex-shrink-0"
            >
              {elementType === 'flight-journey-bar' ? (
                <div className="flex items-center gap-2 px-2 py-1 border border-black/20 rounded-full">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <radialGradient id="colorWheelGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="white"/>
                        <stop offset="100%" stopColor="transparent"/>
                      </radialGradient>
                      <linearGradient id="colorWheelSpectrum" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff0000"/>
                        <stop offset="14.28%" stopColor="#ff8000"/>
                        <stop offset="28.57%" stopColor="#ffff00"/>
                        <stop offset="42.86%" stopColor="#80ff00"/>
                        <stop offset="57.14%" stopColor="#00ffff"/>
                        <stop offset="71.43%" stopColor="#0080ff"/>
                        <stop offset="85.71%" stopColor="#8000ff"/>
                        <stop offset="100%" stopColor="#ff0080"/>
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="10" fill="url(#colorWheelSpectrum)" stroke="#333" strokeWidth="0.5"/>
                    <circle cx="12" cy="12" r="3" fill="url(#colorWheelGradient)"/>
                  </svg>
                  <span className="text-xs font-mono text-black/70">{selectedColor}</span>
                </div>
              ) : (
                <PhotoIcon className="w-4 h-4" />
              )}
            </button>
            
            <button
              type="submit"
              disabled={!promptText.trim() || isLoading}
              className="text-black/70 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              style={{
                color: positionKey === 'middle-card-demo' ? '#000000' : 'rgba(0, 0, 0, 0.7)'
              }}
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Color Picker for FJB */}
        {elementType === 'flight-journey-bar' && showColorPicker && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <HexColorPicker
              color={selectedColor}
              onChange={handleColorChange}
              className="shadow-lg rounded-lg"
            />
          </div>
        )}
        
        {/* Send Button for Flight Phase Selection (FPS) */}
        {elementType !== 'promo-card' && elementType !== 'flight-journey-bar' && (
          <button
            type="submit"
            disabled={!promptText.trim() || isLoading}
            className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 self-end"
            style={{
              color: selectedChip === 'cruise' ? '#10B981' : 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
} 