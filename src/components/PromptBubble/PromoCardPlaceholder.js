import { useState, useRef, useEffect } from 'react';

// Custom placeholder component for promo cards with editable inputs
const PromoCardPlaceholder = ({ 
  textColor, 
  onTextChange, 
  onImageTextChange, 
  textValue = '', 
  imageValue = '', 
  onTextFocus, 
  onTextBlur, 
  onImageFocus,
  onImageBlur,
  resetTrigger, 
  elementData, 
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

  // Ensure only one field is focused at a time
  const handleFieldFocus = (fieldType) => {
    setFocusedField(fieldType);
  };
  
  // Character limit for text field
  const TEXT_CHAR_LIMIT = 30;
  // Character limit for image text field
  const IMAGE_CHAR_LIMIT = 100;

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
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', lineHeight: '1.4', width: '100%' }}>
        <span>Change text to </span>
        <textarea
          ref={textInputRef}
          value={textValue}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              // Allow Shift+Enter for line breaks, prevent Enter from submitting
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue.length <= TEXT_CHAR_LIMIT) {
              onTextChange(newValue);
              // Auto-resize height
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }
          }}
          onFocus={() => {
            handleFieldFocus('text');
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
            minWidth: '50px',
            maxWidth: `${maxWidth - 60}px`,
            width: `${Math.max(getTextWidth(textValue) + 10, 50)}px`,
            lineHeight: '1.4',
            cursor: 'text',
            resize: 'none',
            overflow: 'hidden',
            minHeight: '20px'
          }}
          placeholder={!textValue && focusedField !== 'text' ? '••••••••••' : ''}
          rows={1}
        />
        
        <span>and image to </span>
        <textarea
          ref={imageInputRef}
          value={imageValue}
          maxLength={IMAGE_CHAR_LIMIT}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              // Allow Shift+Enter for line breaks, prevent Enter from submitting
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const newValue = e.target.value;
            onImageTextChange(newValue.length <= IMAGE_CHAR_LIMIT ? newValue : newValue.slice(0, IMAGE_CHAR_LIMIT));
            // Auto-resize height
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onFocus={() => {
            handleFieldFocus('image');
            onImageFocus?.();
          }}
          onBlur={() => {
            setFocusedField(null);
            onImageBlur?.();
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
            minWidth: '50px',
            maxWidth: `${maxWidth - 60}px`,
            width: `${Math.max(getTextWidth(imageValue) + 10, 50)}px`,
            lineHeight: '1.4',
            cursor: 'text',
            resize: 'none',
            overflow: 'hidden',
            minHeight: '20px'
          }}
          placeholder={!imageValue && focusedField !== 'image' ? '••••••••••' : ''}
          rows={1}
        />
        
      </div>
    </div>
  );
};

export default PromoCardPlaceholder;
