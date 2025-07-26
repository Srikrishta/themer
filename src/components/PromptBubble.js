import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';

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
  onVisibilityChange
}) {
  const [promptText, setPromptText] = useState(elementType === 'flight-icon' && positionKey === 'landing-demo' ? 'Cruise' : (elementType === 'promo-card' ? '' : ''));
  const [isLoading, setIsLoading] = useState(elementType === 'promo-card' ? true : false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [stickyPosition, setStickyPosition] = useState(null);
  const [selectedChip, setSelectedChip] = useState(elementType === 'flight-icon' && positionKey === 'landing-demo' ? 'cruise' : null);
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
    if (isVisible && position && !stickyPosition) {
      // Convert viewport coordinates to document coordinates
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      setStickyPosition({
        x: position.x + scrollX,
        y: position.y + scrollY
      });
    } else if (!isVisible) {
      setStickyPosition(null);
    }
  }, [isVisible, position, stickyPosition]);

  // Update position on scroll to maintain relative position
  useEffect(() => {
    if (!isVisible || !stickyPosition) return;

    const handleScroll = () => {
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      // Convert document coordinates back to viewport coordinates for fixed positioning
      const viewportX = stickyPosition.x - scrollX;
      const viewportY = stickyPosition.y - scrollY;
      
      if (bubbleRef.current) {
        bubbleRef.current.style.left = `${Math.max(10, Math.min(viewportX - 160, window.innerWidth - 400))}px`;
        bubbleRef.current.style.top = `${Math.max(10, Math.min(viewportY - 60, window.innerHeight - 200))}px`;
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

  // Auto-click effect: when send button color changes (Cruise selected), show loading after 2 seconds
  useEffect(() => {
    if (selectedChip === 'cruise' && elementType === 'flight-icon' && positionKey === 'landing-demo') {
      // Wait 5 seconds after Cruise is selected, then show loading
      setTimeout(() => {
        setIsLoading(true);
        setPromptText('loading...');
        // Show Cruise label immediately when loading appears
        onSubmit('Cruise', elementType, elementData, positionKey);
      }, 5000); // 5 seconds delay after Cruise selection
    }
  }, [selectedChip, elementType, positionKey, onSubmit, elementData]);

  // Function to simulate typing animation
  const startTypingAnimation = (text) => {
    setIsTyping(true);
    setTypedText('');
    let index = 0;
    
    const typeNextChar = () => {
      if (index < text.length) {
        setTypedText(prev => prev + text[index]);
        index++;
        setTimeout(typeNextChar, 100); // Type each character with 100ms delay
      } else {
        setIsTyping(false);
        setPromptText(text);
      }
    };
    
    typeNextChar();
  };

  // Focus input when bubble becomes visible and reset loading state
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
      if (elementType === 'promo-card' && existingText === '') {
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

  if (!isVisible || !stickyPosition) return null;

  const getElementDescription = () => {
    switch (elementType) {
      case 'flight-icon':
        return 'Add phase';
      case 'promo-card':
        return `Content Card ${elementData.cardIndex + 1} (${elementData.cardType})`;
      default:
        return 'Element';
    }
  };

  return (
    <div
      ref={bubbleRef}
      className="fixed z-50 shadow-xl border-2 p-3"
      style={{
        backgroundColor: themeColor,
        borderColor: themeColor,
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

      {/* Element Description - Only show for non-flight-icon and non-promo-card elements */}
      {elementType !== 'flight-icon' && elementType !== 'promo-card' && (
        <div 
          className={`${elementType === 'promo-card' ? 'text-black/80' : 'text-white/80'} text-xs mb-3 rounded-lg px-3 py-2`}
          style={{
            backgroundColor: `${themeColor}dd`, // Add some transparency
            filter: 'brightness(0.8)' // Make it slightly darker than the main bubble
          }}
        >
          {getElementDescription()}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={isTyping ? typedText : (isLoading ? 'loading...' : promptText)}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "loading..." : elementType === 'promo-card' ? "add image and text" : "add flight phase"}
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
        
        {/* Button Row - Only show for promo cards (PCs) */}
        {elementType === 'promo-card' && (
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                // Handle image upload functionality
                console.log('Image upload clicked');
                // TODO: Implement image upload logic
              }}
              className="text-black/70 hover:text-black transition-colors flex-shrink-0"
            >
              <PhotoIcon className="w-4 h-4" />
            </button>
            
            <button
              type="submit"
              disabled={!promptText.trim() || isLoading}
              className="text-black/70 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Send Button for Flight Phase Selection (FPS) */}
        {elementType !== 'promo-card' && (
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