/**
 * Constants for PromptBubble component
 */

// Character limit for text field
export const TEXT_CHAR_LIMIT = 30;

// Bubble width configurations
export const BUBBLE_WIDTHS = {
  DEFAULT: 250,
  FLIGHT_JOURNEY_BAR: 360,
  FLIGHT_JOURNEY_BAR_ANIMATION: 360
};

/**
 * Get bubble width based on element type
 * @param {string} elementType - Type of element
 * @returns {number} Bubble width in pixels
 */
export const getBubbleWidth = (elementType) => {
  if (elementType === 'flight-journey-bar' || elementType === 'flight-journey-bar-animation') {
    return BUBBLE_WIDTHS.FLIGHT_JOURNEY_BAR;
  }
  return BUBBLE_WIDTHS.DEFAULT;
};

// Flight phase chips for FPS
export const FLIGHT_PHASE_CHIPS = [
  { id: 'takeoff', label: 'Takeoff', color: '#6B7280' },
  { id: 'climb', label: 'Climb', color: '#6B7280' },
  { id: 'cruise', label: 'Cruise', color: '#6B7280' },
  { id: 'descent', label: 'Descent', color: '#6B7280' },
  { id: 'landing', label: 'Landing', color: '#6B7280' },
  { id: 'add-new', label: 'Add new', color: '#6B7280' }
];

// Logo placeholder chips
export const LOGO_CHIPS = [
  { id: 'discover', label: 'Discover' }
];

// Default gradient stops
export const DEFAULT_GRADIENT_STOPS = [
  { position: 0, color: '#5079BE', opacity: 100 },
  { position: 100, color: '#253858', opacity: 100 }
];

// Default gradient direction
export const DEFAULT_GRADIENT_DIRECTION = '120deg';

// Animation delays
export const ANIMATION_DELAYS = {
  TYPING_CHAR_DELAY: 100, // ms between characters
  AUTO_SUBMIT_DELAY: 2000, // ms before auto-submit
  BUBBLE_CLOSE_DELAY: 500, // ms before closing bubble
  TYPING_START_DELAY: 1000, // ms before starting typing animation
  FJB_TYPING_DELAY: 500 // ms before FJB typing animation
};

// Position offsets
export const POSITION_OFFSETS = {
  HOVER_TIP_HEIGHT: 50,
  BELOW_HOVER_TIP: 60,
  FJB_BELOW_HOVER: 8,
  MIN_MOVEMENT_THRESHOLD: 4
};
