import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function PromptBubble({ 
  isVisible, 
  position, 
  elementType, 
  elementData, 
  onClose, 
  onSubmit 
}) {
  const [promptText, setPromptText] = useState('');
  const bubbleRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when bubble becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

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
    if (promptText.trim()) {
      onSubmit(promptText.trim(), elementType, elementData);
      setPromptText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isVisible) return null;

  const getElementDescription = () => {
    switch (elementType) {
      case 'flight-icon':
        return `Flight Progress (${Math.round((1 - elementData.progress) * 100)}% remaining)`;
      case 'promo-card':
        return `Content Card ${elementData.cardIndex + 1} (${elementData.cardType})`;
      default:
        return 'Element';
    }
  };

  return (
    <div
      ref={bubbleRef}
      className="fixed z-50 bg-blue-500 rounded-2xl shadow-xl border-2 border-blue-600 p-4 min-w-80 max-w-96"
      style={{
        left: Math.max(10, Math.min(position.x - 160, window.innerWidth - 400)),
        top: Math.max(10, Math.min(position.y - 60, window.innerHeight - 200)),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-end mb-3">
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors p-1"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Element Description */}
      <div className="text-white/80 text-xs mb-3 bg-blue-600 rounded-lg px-3 py-2">
        {getElementDescription()}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to create or modify..."
            className="w-full bg-transparent border-0 px-3 py-2 text-sm text-white placeholder-white/60 resize-none focus:ring-0 focus:outline-none"
            rows={3}
          />
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!promptText.trim()}
            className="flex items-center gap-2 bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 