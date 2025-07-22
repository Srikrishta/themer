import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function PromptBubble({ 
  isVisible, 
  position, 
  elementType, 
  elementData, 
  onClose, 
  onSubmit,
  themeColor = '#1E1E1E',
  existingText = '',
  positionKey
}) {
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bubbleRef = useRef(null);
  const inputRef = useRef(null);

  // Flight phase chips for FPS
  const flightPhaseChips = [
    { id: 'takeoff', label: 'Takeoff', color: '#10B981' },
    { id: 'climb', label: 'Climb', color: '#3B82F6' },
    { id: 'cruise', label: 'Cruise', color: '#8B5CF6' },
    { id: 'descent', label: 'Descent', color: '#F59E0B' },
    { id: 'landing', label: 'Landing', color: '#EF4444' }
  ];

  // Focus input when bubble becomes visible and reset loading state
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
      setIsLoading(false);
      setPromptText(existingText); // Load existing text for this position
    }
  }, [isVisible, existingText]);

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
  };

  if (!isVisible) return null;

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
        left: Math.max(10, Math.min(position.x - 160, window.innerWidth - 400)),
        top: Math.max(10, Math.min(position.y - 60, window.innerHeight - 200)),
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
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={promptText}
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
          
          {/* Flight Phase Chips - Only show for flight-icon */}
          {elementType === 'flight-icon' && (
            <div className="flex flex-wrap gap-1 mt-2">
              {flightPhaseChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleChipClick(chip.label)}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border"
                  style={{
                    backgroundColor: `${chip.color}20`,
                    borderColor: chip.color,
                    color: elementType === 'promo-card' ? '#000000' : '#FFFFFF'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = `${chip.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = `${chip.color}20`;
                  }}
                >
                  {chip.label}
                  <PlusIcon className="w-3 h-3 ml-1.5 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!promptText.trim() || isLoading}
          className={`${elementType === 'promo-card' ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
} 