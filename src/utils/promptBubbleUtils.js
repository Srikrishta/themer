/**
 * Utility functions for PromptBubble component
 */

import { 
  getFestivalsForFlightSegment, 
  formatFestivalChips, 
  getPromoCardContent, 
  getContentCardContent, 
  shouldUseFestivalContent 
} from './festivalUtils';

/**
 * Get accurate text width using canvas measurement
 * @param {string} text - Text to measure
 * @returns {number} Width in pixels
 */
export const getTextWidth = (text) => {
  if (!text) return 0;
  
  // Create a canvas element to measure text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = 'bold 14px system-ui, -apple-system, sans-serif'; // Match the input font with bold weight
  
  return context.measureText(text).width;
};

/**
 * Calculate required height based on text content
 * @param {string} text - Text content
 * @param {string} imageText - Image text content
 * @param {string} elementType - Type of element
 * @param {number} bubbleWidth - Width of the bubble
 * @returns {string} Height in pixels or 'auto'
 */
export const calculateRequiredHeight = (text, imageText, elementType, bubbleWidth = 300) => {
  if (elementType !== 'promo-card' && elementType !== 'content-card') return 'auto';
  
  const maxWidth = bubbleWidth - 40; // Account for padding
  const lineHeight = 20; // Line height in pixels
  const baseHeight = 120; // Base height for the bubble
  
  // Calculate lines needed for text
  const textLines = text ? Math.ceil((getTextWidth(text) + 20) / maxWidth) : 0;
  
  // Calculate lines needed for image text
  const imageTextLines = imageText ? Math.ceil((getTextWidth(imageText) + 20) / maxWidth) : 0;
  
  const totalLines = Math.max(textLines, imageTextLines, 1);
  const requiredHeight = baseHeight + (totalLines - 1) * lineHeight;
  
  return `${requiredHeight}px`;
};

/**
 * Initialize promo card values from existing text
 * @param {string} elementType - Type of element
 * @param {string} existingText - Existing text content
 * @param {Object} elementData - Element data
 * @param {string} selectedFlightSegment - Selected flight segment
 * @param {Array} selectedDates - Selected dates
 * @param {string} selectedFlightPhase - Selected flight phase
 * @returns {Object} Initialized values { text, image }
 */
export const initializePromoValues = (
  elementType, 
  existingText, 
  elementData, 
  selectedFlightSegment, 
  selectedDates, 
  selectedFlightPhase
) => {
  if (elementType === 'promo-card' || elementType === 'content-card') {
    // Check if this is a content card
    if (elementType === 'content-card' || (elementData && elementData.cardType === 'content-card')) {
      // For content cards, use the existingText as the text content
      // Pre-populate image field with default values based on card index
      const cardIndex = elementData.cardIndex;
      
      // Check if we should use festival content for content cards
      const useFestivalContent = shouldUseFestivalContent(selectedFlightSegment, selectedDates);
      
      if (useFestivalContent && selectedFlightPhase) {
        const festivalContent = getContentCardContent(selectedFlightSegment, selectedDates, selectedFlightPhase, cardIndex);
        if (festivalContent) {
          return { 
            text: existingText || festivalContent.text || '', 
            image: festivalContent.image || '' 
          };
        }
      }
      
      // Content cards now show empty values - no default text
      return { text: existingText || '', image: '' };
    }
    
    // For regular promo cards, parse the existingText format
    if (existingText) {
      console.log('=== INITIALIZING PROMO VALUES FROM EXISTING TEXT ===', {
        existingText,
        elementData,
        existingTextLength: existingText.length
      });
      
      const parts = existingText.split(',');
      let textContent = '';
      let imageContent = '';
      
      parts.forEach(part => {
        console.log('=== PARSING PART ===', { part, trimmed: part.trim() });
        if (part.startsWith('text:')) {
          textContent = part.substring(5).trim();
          console.log('=== EXTRACTED TEXT ===', { textContent });
        } else if (part.startsWith('image:')) {
          imageContent = part.substring(6).trim();
          console.log('=== EXTRACTED IMAGE ===', { imageContent });
        }
      });
      
      console.log('=== PARSED PROMO VALUES ===', {
        textContent,
        imageContent,
        textLength: textContent.length,
        imageLength: imageContent.length
      });
      
      return { text: textContent, image: imageContent };
    } else {
      // Check if we should use festival content for promo cards
      const useFestivalContent = shouldUseFestivalContent(selectedFlightSegment, selectedDates);
      
      if (useFestivalContent && selectedFlightPhase && elementData) {
        const cardIndex = elementData.cardIndex;
        const festivalContent = getPromoCardContent(selectedFlightSegment, selectedDates, selectedFlightPhase, cardIndex);
        if (festivalContent) {
          return { 
            text: festivalContent.text || '', 
            image: festivalContent.image || '' 
          };
        }
      }
      
      // No existing text - return empty values to show placeholders
      return { text: '', image: '' };
    }
  }
  return { text: '', image: '' };
};

/**
 * Normalize colors for comparison
 * @param {string} color - Color to normalize
 * @returns {string} Normalized color
 */
export const normalizeColor = (color) => {
  if (typeof color === 'string') {
    if (color.startsWith('#')) {
      return color.toUpperCase();
    }
    // For gradients, normalize whitespace and case
    if (color.includes('gradient')) {
      return color.replace(/\s+/g, ' ').trim();
    }
  }
  return color;
};

/**
 * Update gradient string from gradient stops
 * @param {Array} gradientStops - Array of gradient stops
 * @param {string} gradientDirection - Gradient direction
 * @returns {string} Gradient string
 */
export const updateGradient = (gradientStops, gradientDirection) => {
  return `linear-gradient(${gradientDirection}, ${gradientStops.map(stop => `${stop.color}${stop.opacity !== 100 ? Math.round(stop.opacity * 2.55) : ''} ${stop.position}%`).join(', ')})`;
};

// Import festival utilities (these will be available from the existing file)
