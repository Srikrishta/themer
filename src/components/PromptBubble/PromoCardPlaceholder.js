import { useState, useRef, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Blinking cursor component
const BlinkingCursor = () => (
  <span 
    className="animate-pulse"
    style={{
      animation: 'blink 1s infinite',
      color: 'inherit'
    }}
  >
    |
  </span>
);

// CSS for blinking animation
const blinkingCSS = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

// Custom placeholder component for promo cards with editable inputs
const PromoCardPlaceholder = ({ 
  textColor, 
  onTextChange, 
  onImageTextChange, 
  textValue = '', 
  imageValue = '', 
  onTextFocus, 
  onTextBlur, 
  resetTrigger, 
  elementData, 
  onRemix, 
  isRemixLoading = false, 
  maxWidth = 300 
}) => {
  const [focusedField, setFocusedField] = useState(null); // Track which field is focused
  const textInputRef = useRef(null);
  const imageInputRef = useRef(null);
  
  // Reset focus when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      setFocusedField(null);
      if (textInputRef.current) textInputRef.current.blur();
      if (imageInputRef.current) imageInputRef.current.blur();
    }
  }, [resetTrigger]);

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // Auto-resize textareas when text values change
  useEffect(() => {
    if (textInputRef.current) {
      autoResizeTextarea(textInputRef.current);
    }
  }, [textValue]);

  useEffect(() => {
    if (imageInputRef.current) {
      autoResizeTextarea(imageInputRef.current);
    }
  }, [imageValue]);
  
  // Character limit for text field
  const TEXT_CHAR_LIMIT = 30;

  // Function to get accurate text width using canvas measurement
  const getTextWidth = (text) => {
    if (!text) return 0;
    
    // Create a canvas element to measure text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = 'bold 14px system-ui, -apple-system, sans-serif'; // Match the input font with bold weight
    
    return context.measureText(text).width;
  };
  
  return (
    <div style={{ color: textColor, fontSize: '14px', pointerEvents: 'auto', width: '100%' }}>
      <style>{blinkingCSS}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', lineHeight: '1.4', width: '100%' }}>
        <span>Change text to </span>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          {/* Show dots when no text and not focused */}
          {!textValue && focusedField !== 'text' && (
            <span 
              style={{ 
                opacity: 0.5, 
                cursor: 'text',
                position: 'absolute',
                left: '2px',
                pointerEvents: 'auto'
              }}
              onClick={() => {
                setFocusedField('text');
                setTimeout(() => textInputRef.current?.focus(), 0);
              }}
            >
              ••••••••••
            </span>
          )}
          
          <textarea
            ref={textInputRef}
            value={textValue}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= TEXT_CHAR_LIMIT) {
                onTextChange(newValue);
                // Auto-resize the textarea
                autoResizeTextarea(e.target);
              }
            }}
            onFocus={() => {
              setFocusedField('text');
              onTextFocus?.();
            }}
            onBlur={() => {
              setFocusedField(null);
              onTextBlur?.();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'bold',
              fontFamily: 'inherit',
              padding: '2px',
              margin: 0,
              resize: 'none',
              overflow: 'hidden',
              minHeight: '20px',
              maxWidth: `${maxWidth - 60}px`, // Prevent overflow
              width: `${Math.max(getTextWidth(textValue) + 10, 50)}px`,
              lineHeight: '1.4'
            }}
            placeholder=""
            rows={1}
          />
          
          {/* Show cursor when focused */}
          {focusedField === 'text' && (
            <BlinkingCursor />
          )}
        </div>
        
        <span>and image to </span>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          {/* Show dots when no image text and not focused */}
          {!imageValue && focusedField !== 'image' && (
            <span 
              style={{ 
                opacity: 0.5, 
                cursor: 'text',
                position: 'absolute',
                left: '2px',
                pointerEvents: 'auto'
              }}
              onClick={() => {
                setFocusedField('image');
                setTimeout(() => imageInputRef.current?.focus(), 0);
              }}
            >
              ••••••••••
            </span>
          )}
          
          <textarea
            ref={imageInputRef}
            value={imageValue}
            onChange={(e) => {
              onImageTextChange(e.target.value);
              // Auto-resize the textarea
              autoResizeTextarea(e.target);
            }}
            onFocus={() => {
              setFocusedField('image');
            }}
            onBlur={() => {
              setFocusedField(null);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'bold',
              fontFamily: 'inherit',
              padding: '2px',
              margin: 0,
              resize: 'none',
              overflow: 'hidden',
              minHeight: '20px',
              maxWidth: `${maxWidth - 60}px`, // Prevent overflow
              width: `${Math.max(getTextWidth(imageValue) + 10, 50)}px`,
              lineHeight: '1.4'
            }}
            placeholder=""
            rows={1}
          />
          
          {/* Show cursor when focused */}
          {focusedField === 'image' && (
            <BlinkingCursor />
          )}
        </div>
        
        {/* Remix button */}
        {elementData && (
          <button
            onClick={() => onRemix?.(elementData)}
            disabled={isRemixLoading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              opacity: isRemixLoading ? 0.5 : 1
            }}
          >
            {isRemixLoading ? (
              <div className="w-3 h-3 animate-spin">
                <ArrowPathIcon className="w-3 h-3" />
              </div>
            ) : (
              <ArrowPathIcon className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PromoCardPlaceholder;
