import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, PlusIcon, PhotoIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { HexColorPicker } from 'react-colorful';
import { getReadableOnColor } from '../utils/color';
import { argbFromHex } from '@material/material-color-utilities';

export default function PromptBubble({ 
  isVisible, 
  position, 
 elementType, 
  elementData, 
  onClose, 
  onSubmit,
  themeColor = '#1E1E1E',
  isThemeBuildStarted = false,
  existingText = '',
  positionKey,
  fpsPrompts = {},
  onLoadingStateChange,
  onVisibilityChange,
  onThemeColorChange,
  themeChips = [],
  selectedLogo = null,
  onLogoSelect,
  flightsGenerated = false
}) {
  console.log('=== PROMPT BUBBLE RENDER ===', {
    isVisible,
    position,
    elementType,
    positionKey,
    themeColor
  });

  const [promptText, setPromptText] = useState((elementType === 'flight-icon' || elementType === 'flight-phase-button') && positionKey === 'landing-demo' ? 'Cruise' : (elementType === 'promo-card' ? '' : ''));
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [autoTyping, setAutoTyping] = useState(false);
  const [autoTypeIndex, setAutoTypeIndex] = useState(0);
  const [stickyPosition, setStickyPosition] = useState(null);
  const [selectedChip, setSelectedChip] = useState((elementType === 'flight-icon' || elementType === 'flight-phase-button') && positionKey === 'landing-demo' ? 'cruise' : null);
  const [selectedLogoChip, setSelectedLogoChip] = useState(null);
  const [logoStep, setLogoStep] = useState(1); // 1: choose logo, 2: describe animation
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(() => {
    // Initialize with logo color if available, otherwise use themeColor
    if (selectedLogo && selectedLogo.id) {
      const logoColorMap = {
        'discover': '#1E72AE',
        'lufthansa': '#050F43',
        'swiss': '#CB0300'
      };
      return logoColorMap[selectedLogo.id] || themeColor;
    }
    return themeColor;
  });
  const bubbleRef = useRef(null);
  const inputRef = useRef(null);
  const logoFileInputRef = useRef(null);

  // Ensure selectedColor is always in sync with the current theme/logo
  useEffect(() => {
    // If we have a selected logo, prioritize its color
    if (selectedLogo && selectedLogo.id) {
      const logoColorMap = {
        'discover': '#1E72AE',
        'lufthansa': '#050F43',
        'swiss': '#CB0300'
      };
      const logoColor = logoColorMap[selectedLogo.id];
      if (logoColor) {
        setSelectedColor(logoColor);
        return;
      }
    }
    
    // Otherwise, use the theme color
    setSelectedColor(themeColor);
  }, [selectedLogo, themeColor]);

  // Determine text/icon color for readability on promo-card bubbles (dashboard)
  const actualBackgroundColor = elementType === 'promo-card' && positionKey === 'middle-card-demo' 
    ? 'rgba(255,255,255,0.2)'
    : (elementType === 'logo-placeholder' ? selectedColor : (selectedColor || themeColor));
  const isGradient = typeof actualBackgroundColor === 'string' && actualBackgroundColor.includes('gradient');
  const parseHex = (hex) => {
    if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  };
  const getLuminance = ({ r, g, b }) => {
    const srgb = [r, g, b].map(v => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };
  const shouldUseLightText = (color) => {
    if (isGradient) return true;
    if (typeof color === 'string' && color.startsWith('#') && (color.length === 7)) {
      const lum = getLuminance(parseHex(color));
      return lum < 0.5; // dark bg => light text
    }
    // Fallback to light text
    return true;
  };
  // Decide readable text/icon color for ALL bubble types
  const useLightText = (() => {
    if (positionKey === 'middle-card-landing' || positionKey === 'fjb-landing') return true;
    
    if (actualBackgroundColor === 'rgba(255,255,255,0.2)') return true;
    return shouldUseLightText(actualBackgroundColor);
  })();

  // Choose a contrasting border color so the bubble edge is always visible
  const contrastingBorderColor = useLightText ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)';
  
  // Compute Material readable on-color for chip borders/text
  const onHex = getReadableOnColor(actualBackgroundColor);
  const onRgb = (() => {
    try {
      const { r, g, b } = parseHex(onHex);
      return { r, g, b };
    } catch (error) {
      console.warn('Failed to parse onHex color:', onHex, error);
      return { r: 255, g: 255, b: 255 }; // fallback to white
    }
  })();
  
  // Create adaptive text colors that ensure good contrast
  const adaptiveTextColor = (() => {
    // For very light backgrounds, use dark text; for dark backgrounds, use light text
    if (useLightText) {
      // Dark background - use light text with good contrast
      return '#FFFFFF'; // Pure white for maximum contrast
    } else {
      // Light background - use dark text with good contrast
      return '#000000'; // Pure black for maximum contrast
    }
  })();
  
  // Text colors with different opacities for hierarchy
  const onText90 = `rgba(${onRgb.r}, ${onRgb.g}, ${onRgb.b}, 0.9)`; // Primary text
  const onText70 = `rgba(${onRgb.r}, ${onRgb.g}, ${onRgb.b}, 0.7)`; // Secondary text
  const onText50 = `rgba(${onRgb.r}, ${onRgb.g}, ${onRgb.b}, 0.5)`; // Hint text
  
  const onBorder20 = `rgba(${onRgb.r}, ${onRgb.g}, ${onRgb.b}, 0.2)`;
  
  // Fallback border color if onBorder20 calculation fails - ensure it's always visible
  const fallbackBorderColor = useLightText ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
  
  // Ensure we always have a valid border color
  const safeBorderColor = onBorder20 || fallbackBorderColor;
  
  // Additional safety: if the calculated border color is too transparent, use the fallback
  const finalBorderColor = (() => {
    if (safeBorderColor && safeBorderColor.includes('rgba')) {
      const alphaMatch = safeBorderColor.match(/rgba\([^)]+,\s*([^)]+)\)/);
      if (alphaMatch) {
        const alpha = parseFloat(alphaMatch[1]);
        if (alpha < 0.3) {
          console.log('Border color too transparent, using fallback');
          return fallbackBorderColor;
        }
      }
    }
    return safeBorderColor;
  })();
  
  // Debug logging for border colors
  console.log('Border color debug:', {
    actualBackgroundColor,
    onHex,
    onBorder20,
    fallbackBorderColor,
    safeBorderColor,
    finalBorderColor,
    useLightText
  });
  
  // Calculate contrast ratio between selected color and a reference color (white)
  const calculateContrastRatio = (color1, color2 = '#FFFFFF') => {
    try {
      if (!color1 || !color2) return null;
      
      // Handle gradients by extracting first hex color
      const extractHex = (input) => {
        if (typeof input !== 'string') return null;
        if (input.includes('gradient')) {
          const hexMatch = input.match(/#([0-9a-fA-F]{6})/);
          return hexMatch ? `#${hexMatch[1]}` : null;
        }
        return input.match(/^#([0-9a-fA-F]{6})$/) ? input : null;
      };
      
      const hex1 = extractHex(color1);
      const hex2 = extractHex(color2);
      
      if (!hex1 || !hex2) return null;
      
      const argb1 = argbFromHex(hex1);
      const argb2 = argbFromHex(hex2);
      
      // Convert ARGB to RGB
      const argbToRgb = (argb) => ({
        r: (argb >> 16) & 0xff,
        g: (argb >> 8) & 0xff, 
        b: argb & 0xff
      });
      
      // Calculate relative luminance
      const relativeLuminance = ({ r, g, b }) => {
        const toLinear = (c) => {
          const v = c / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
      };
      
      const l1 = relativeLuminance(argbToRgb(argb1));
      const l2 = relativeLuminance(argbToRgb(argb2));
      const [L1, L2] = l1 > l2 ? [l1, l2] : [l2, l1];
      
      return (L1 + 0.05) / (L2 + 0.05);
    } catch (error) {
      console.warn('Error calculating contrast ratio:', error);
      return null;
    }
  };

  // Bubble width (wider for FJB to accommodate more chips)
  const bubbleWidth = elementType === 'flight-journey-bar' ? 360 : 250;

  // Flight phase chips for FPS
  const flightPhaseChips = [
    { id: 'takeoff', label: 'Takeoff', color: '#6B7280' },
    { id: 'climb', label: 'Climb', color: '#6B7280' },
    { id: 'cruise', label: 'Cruise', color: '#6B7280' },
    { id: 'descent', label: 'Descent', color: '#6B7280' },
    { id: 'landing', label: 'Landing', color: '#6B7280' },
    { id: 'add-new', label: 'Add new', color: '#6B7280' }
  ];
  // Logo placeholder chips
  const logoChips = [
    { id: 'discover', label: 'Discover' },
    { id: 'lufthansa', label: 'Lufthansa' },
    { id: 'swiss', label: 'Swiss' }
  ];

  // Set sticky position when bubble becomes visible or when target changes
  useEffect(() => {
    console.log('=== PROMPT BUBBLE POSITION UPDATE ===', { 
      isVisible, position, elementType, positionKey 
    });
    if (!isVisible || !position) {
      setStickyPosition(null);
      return;
    }
    // Choose the appropriate container based on element type and position key
    let containerLeft = 0;
    let containerTop = 0;
    let containerSelector = '';

    if (elementType === 'flight-icon' || positionKey === 'landing-demo') {
      // Check if this is a button trigger (position is in viewport coords) vs progress bar trigger (container coords)
      // Button triggers have specific elementData values: progress: 0.5, minutesLeft: 200
      if (elementData && elementData.progress === 0.5 && elementData.minutesLeft === 200) {
        // Button trigger: position is given in viewport coords; convert to document
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        setStickyPosition({ x: position.x + scrollX, y: position.y + scrollY });
        return;
      }
      // FPS prompt bubbles use flight progress bar container; position is relative to container
      containerSelector = '.flight-progress-bar-container';
    } else if (elementType === 'flight-journey-bar' || positionKey === 'fjb-demo' || positionKey === 'fjb-landing') {
      // FJB: position is given in viewport coords; convert to document
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      setStickyPosition({ x: position.x + scrollX, y: position.y + scrollY });
      return;
    } else if (elementType === 'promo-card' || elementType === 'logo-placeholder' || elementType === 'flight-phase-button' || positionKey === 'middle-card-demo' || positionKey === 'middle-card-landing') {
      // Promo-card/logo-placeholder/flight-phase-button: viewport -> document
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      setStickyPosition({ x: position.x + scrollX, y: position.y + scrollY });
      return;
    } else {
      containerSelector = '.flight-progress-bar-container';
    }

    const targetContainer = document.querySelector(containerSelector);
    if (targetContainer) {
      const containerRect = targetContainer.getBoundingClientRect();
      containerLeft = containerRect.left;
      containerTop = containerRect.top;
    }

    // Convert relative coordinates to document coordinates
    const absoluteX = containerLeft + position.x;
    const absoluteY = containerTop + position.y;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const newStickyPosition = { x: absoluteX + scrollX, y: absoluteY + scrollY };

    console.log('=== SETTING STICKY POSITION ===', {
      elementType, positionKey, containerSelector, position, newStickyPosition
    });
    setStickyPosition(newStickyPosition);
  }, [isVisible, position, elementType, positionKey]);

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
      
      // Position bubble at the pointer with minimal clamping (no offsets)
      const finalX = Math.max(4, Math.min(viewportX, window.innerWidth - (bubbleWidth + 10)));
      const finalY = Math.max(4, Math.min(viewportY, window.innerHeight - 200));
      
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

  // Auto-typing effect for middle card landing page and FJB landing page
  useEffect(() => {
    if (isVisible && ((positionKey === 'middle-card-landing' && elementType === 'promo-card') || (positionKey === 'fjb-landing' && elementType === 'flight-journey-bar')) && !autoTyping) {
      console.log('=== STARTING AUTO TYPING ===', { positionKey, elementType });
      setIsLoading(false); // Stop loading state
      setAutoTyping(true);
      setAutoTypeIndex(0);
      setPromptText(''); // Clear any existing text
    }
  }, [isVisible, positionKey, elementType, autoTyping]);

  // Auto-typing animation
  useEffect(() => {
    if (autoTyping) {
      let targetText = '';
      let positionKeyToCheck = '';
      
      if (positionKey === 'middle-card-landing') {
        targetText = 'Croissants at 3€';
        positionKeyToCheck = 'middle-card-landing';
      } else if (positionKey === 'fjb-landing') {
        targetText = 'add spring theme in paris';
        positionKeyToCheck = 'fjb-landing';
      }
      
      if (targetText && positionKey === positionKeyToCheck) {
        if (autoTypeIndex < targetText.length) {
          const timer = setTimeout(() => {
            setPromptText(targetText.substring(0, autoTypeIndex + 1));
            setAutoTypeIndex(autoTypeIndex + 1);
          }, 100); // Type at 100ms per character
          
          return () => clearTimeout(timer);
        } else {
          // Finished typing - trigger continuation after a short delay
          setAutoTyping(false);
          console.log('=== AUTO TYPING COMPLETE ===', { positionKey });
          
          // Auto-submit after typing is complete
          setTimeout(() => {
            console.log('=== AUTO SUBMITTING PROMPT ===', { positionKey });
            console.log('=== CHECKING POSITION KEY ===', { 
              positionKey, 
              isFJBLanding: positionKey === 'fjb-landing',
              elementType,
              promptText 
            });
            
            // For FJB landing page, auto-click gradient button and then submit
            if (positionKey === 'fjb-landing') {
              console.log('=== AUTO CLICKING GRADIENT BUTTON ===');
              handleColorChange('#96e6a1'); // Set gradient color
              console.log('=== GRADIENT BUTTON CLICKED ===');
              
              // Auto-submit after a short delay
              setTimeout(() => {
                console.log('=== AUTO SUBMITTING FJB PROMPT ===');
                console.log('=== CALLING onSubmit WITH DATA ===', { 
                  promptText, 
                  elementType, 
                  elementData, 
                  positionKey,
                  onSubmitExists: !!onSubmit 
                });
                if (onSubmit) {
                  onSubmit(promptText, elementType, elementData, positionKey);
                  console.log('=== onSubmit CALLED SUCCESSFULLY ===');
                } else {
                  console.log('=== ERROR: onSubmit IS NULL ===');
                }
              }, 500); // 0.5 second delay after clicking gradient button
            } else {
              // For other prompt bubbles, submit normally
              console.log('=== NOT FJB LANDING - SUBMITTING NORMALLY ===', { positionKey });
              if (onSubmit) {
                onSubmit(promptText, elementType, elementData, positionKey);
              }
            }
          }, 1500); // 1.5 second delay after typing completes
        }
      }
    }
  }, [autoTyping, autoTypeIndex, positionKey]);

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
    if (elementType !== 'flight-icon' && elementType !== 'flight-phase-button') return flightPhaseChips;
    
    const usedPrompts = getUsedPrompts();
    const currentText = existingText.toLowerCase();
    
    // If flights are generated (showMovingIcon is true), show all chips as selected except "Add new"
    if (flightsGenerated) {
      return flightPhaseChips;
    }
    
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
      console.log('=== PROMPT BUBBLE BECAME VISIBLE ===', { elementType, positionKey, isVisible, existingText });
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
      } else if (elementType === 'promo-card' && positionKey === 'middle-card-demo') {
        // Only demo card should auto type; dashboard promo cards should not
        setIsLoading(false);
        setTimeout(() => {
          startTypingAnimation('Croissants at 3€');
        }, 300);
      } else {
        console.log('=== PROMPT BUBBLE FALLBACK CASE ===', { elementType, positionKey, existingText });
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
    
    // Check if submission is valid based on element type and step
    const isValidSubmission = elementType === 'logo-placeholder'
      ? (logoStep === 1 ? selectedLogoChip && selectedLogoChip !== 'add-new' : promptText.trim())
      : elementType === 'flight-journey-bar'
      ? true // No text input required for theme selection
      : promptText.trim();
    
    if (isValidSubmission && !isLoading) {
      setIsLoading(true);
      
      // Apply logo selection when submitting (for logo-placeholder elementType)
      if (elementType === 'logo-placeholder' && selectedLogoChip && selectedLogoChip !== 'add-new') {
        try {
          if (typeof onLogoSelect === 'function') {
            let src = null;
            let themeColor = null;
            if (selectedLogoChip === 'discover') {
              src = process.env.PUBLIC_URL + '/discover.svg';
              themeColor = '#1E72AE';
            } else if (selectedLogoChip === 'lufthansa') {
              src = process.env.PUBLIC_URL + '/Lufthansa_Logo_2018.svg.png';
              themeColor = '#050F43';
            } else if (selectedLogoChip === 'swiss') {
              src = process.env.PUBLIC_URL + '/swiss.png';
              themeColor = '#CB0300';
            }
            onLogoSelect({ id: selectedLogoChip, src });
            
            // Change theme color to match the selected airline
            if (themeColor && typeof onThemeColorChange === 'function') {
              onThemeColorChange(themeColor, { label: selectedLogoChip, color: themeColor });
            }
            
            // Update the prompt bubble's own color to match the selected logo
            setSelectedColor(themeColor);
          }
        } catch {}
        
        // For logo selection in step 1, don't close the bubble automatically
        setIsLoading(false);
        // Don't call onSubmit for logo selection as it would close the bubble
        // onSubmit(promptText.trim() || '', elementType, elementData, positionKey);
        return; // Don't execute the normal flow
      }
      
      onSubmit(promptText.trim() || '', elementType, elementData, positionKey);
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
        
        // Check if submission is valid based on element type and step
        const isValidSubmission = elementType === 'logo-placeholder'
          ? (logoStep === 1 ? selectedLogoChip && selectedLogoChip !== 'add-new' : promptText.trim())
          : elementType === 'flight-journey-bar'
          ? true // No text input required for theme selection
          : promptText.trim();
        
        if (isValidSubmission) {
          setIsLoading(true);
          
          // Apply logo selection when submitting (for logo-placeholder elementType)
          if (elementType === 'logo-placeholder' && selectedLogoChip && selectedLogoChip !== 'add-new') {
            try {
              if (typeof onLogoSelect === 'function') {
                let src = null;
                let themeColor = null;
                if (selectedLogoChip === 'discover') {
                  src = process.env.PUBLIC_URL + '/discover.svg';
                  themeColor = '#1E72AE';
                } else if (selectedLogoChip === 'lufthansa') {
                  src = process.env.PUBLIC_URL + '/Lufthansa_Logo_2018.svg.png';
                  themeColor = '#050F43';
                } else if (selectedLogoChip === 'swiss') {
                  src = process.env.PUBLIC_URL + '/swiss.png';
                  themeColor = '#CB0300';
                }
                onLogoSelect({ id: selectedLogoChip, src });
                
                // Change theme color to match the selected airline
                if (themeColor && typeof onThemeColorChange === 'function') {
                  onThemeColorChange(themeColor, { label: selectedLogoChip, color: themeColor });
                }
                
                // Update the prompt bubble's own color to match the selected logo
                setSelectedColor(themeColor);
              }
            } catch {}
            
            // For logo selection in step 1, don't close the bubble automatically
            setIsLoading(false);
            // Don't call onSubmit for logo selection as it would close the bubble
            // onSubmit(promptText.trim() || '', elementType, elementData, positionKey);
            return; // Don't execute the normal flow
          }
          
          onSubmit(promptText.trim() || '', elementType, elementData, positionKey);
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

  const handleColorChange = (color, chipData) => {
    setSelectedColor(color);
    if (onThemeColorChange) {
      onThemeColorChange(color, chipData);
    }
  };

  const handleLogoChipClick = (chip) => {
    if (chip.id === 'add-new') {
      try {
        if (logoFileInputRef.current) logoFileInputRef.current.click();
      } catch {}
      return;
    }
    // Only update the visual selection state, don't apply logo/color changes yet
    setSelectedLogoChip(chip.id);
  };

  if (!isVisible || !stickyPosition) return null;



  return (
    <div
      ref={bubbleRef}
      className="fixed z-50 shadow-xl border p-3 backdrop-blur-[10px] backdrop-filter"
      style={{
        backgroundColor: elementType === 'promo-card' && positionKey === 'middle-card-demo' 
          ? 'rgba(255,255,255,0.2)'
          : (elementType === 'logo-placeholder' ? selectedColor : (selectedColor || themeColor)),
        borderColor: elementType === 'promo-card' && positionKey === 'middle-card-demo'
          ? 'rgba(0,0,0,0.2)'
          : contrastingBorderColor,
        borderTopLeftRadius: 0,
        borderTopRightRadius: '24px',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        width: `${bubbleWidth}px`,
        maxWidth: `${bubbleWidth}px`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {elementType === 'logo-placeholder' && logoStep === 2 && (
            <button
              type="button"
              onClick={() => setLogoStep(1)}
              className={`${useLightText ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'} transition-colors p-1`}
              title="Back"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
          )}
          {/* Title */}
          <span className={`text-sm font-semibold ${useLightText ? 'text-white' : 'text-black'}`}>
            {(() => {
              switch (elementType) {
                case 'flight-journey-bar':
                  return 'Change Theme';
                case 'flight-icon':
                case 'flight-phase-button':
                  return 'Select Flight Phase';
                case 'promo-card':
                  return 'Edit Promo Card';
                case 'logo-placeholder':
                  return logoStep === 1 ? 'Select Airline Logo' : 'Add Animation';
                default:
                  return 'Edit';
              }
            })()}
          </span>
          {elementType === 'logo-placeholder' && logoStep === 1 && (
            <button
              type="button"
              onClick={() => setLogoStep(2)}
              className={`${useLightText ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'} transition-colors p-1`}
              title="Go to Add Animation"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className={`${useLightText ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'} transition-colors p-1`}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>



      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Hidden file input for logo upload (triggered by image icon) */}
        {elementType === 'logo-placeholder' && (
          <input
            ref={logoFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file) {
                // Validate image dimensions
                const img = new Image();
                img.onload = () => {
                  if (img.width === 312 && img.height === 100) {
                    console.log('Valid logo image selected:', file.name, `${img.width}x${img.height}`);
                    // Handle valid image upload
                    // You can add logic here to process the uploaded image
                  } else {
                    console.warn('Invalid image dimensions:', `${img.width}x${img.height}`, 'Expected: 312x100');
                    alert('Please select an image with dimensions 312x100 pixels.');
                  }
                };
                img.src = URL.createObjectURL(file);
              }
            }}
          />
        )}
        <div className="relative flex-1">
          {!(elementType === 'logo-placeholder' && logoStep === 1) && elementType !== 'flight-journey-bar' && elementType !== 'flight-icon' && elementType !== 'flight-phase-button' && (
            <textarea
              ref={inputRef}
              value={isTyping ? typedText : (isLoading && elementType !== 'promo-card' ? 'loading...' : promptText)}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading && elementType !== 'promo-card'
                  ? 'loading...'
                  : elementType === 'promo-card'
                  ? 'add image and text'
                  : elementType === 'flight-journey-bar'
                  ? 'change theme or add animation'
                  : elementType === 'logo-placeholder'
                  ? 'Type here'
                  : 'select flight phase'
              }
              className={`bg-transparent border-0 text-sm ${useLightText ? 'text-white placeholder-white/60' : 'text-black placeholder-black/60'} resize-none focus:ring-0 focus:outline-none`}
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
          )}
          
          {/* Flight Phase Chips - Only show for flight-icon and flight-phase-button and filter out used ones */}
          {(elementType === 'flight-icon' || elementType === 'flight-phase-button') && availableChips.length > 0 && (
            <div className="mt-2">
              <div 
                className="flex gap-2 overflow-x-auto pb-2" 
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  cursor: 'grab'
                }}
                onWheel={(e) => {
                  // Enable natural horizontal scrolling with mouse wheel
                  e.preventDefault();
                  const container = e.currentTarget;
                  const scrollAmount = e.deltaY;
                  container.scrollLeft += scrollAmount;
                }}
                onMouseDown={(e) => {
                  // Enable click and drag scrolling
                  const container = e.currentTarget;
                  const startX = e.pageX - container.offsetLeft;
                  const startScrollLeft = container.scrollLeft;
                  
                  const handleMouseMove = (e) => {
                    e.preventDefault();
                    const x = e.pageX - container.offsetLeft;
                    const walk = (x - startX) * 2;
                    container.scrollLeft = startScrollLeft - walk;
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    container.style.cursor = 'grab';
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                  container.style.cursor = 'grabbing';
                }}
              >
                {availableChips.map((chip) => {
                  // Show all chips as selected when flights are generated, except "Add new"
                  const isSelected = flightsGenerated 
                    ? chip.id !== 'add-new' 
                    : selectedChip === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      data-chip={chip.id}
                      onClick={() => handleChipClick(chip.label)}
                      className={`inline-flex items-center px-3 py-2 rounded-full text-xs transition-all cursor-pointer border font-medium flex-shrink-0`}
                      style={{
                        backgroundColor: `${chip.color}10`,
                        borderColor: finalBorderColor,
                        color: adaptiveTextColor
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = `${chip.color}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = `${chip.color}10`;
                      }}
                    >
                      {isSelected && <CheckIcon className="w-3 h-3 mr-1.5 flex-shrink-0" />}
                      {chip.label}
                      {!isSelected && <PlusIcon className="w-3 h-3 ml-1.5 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Logo Placeholder Label and Chips */}
          {elementType === 'logo-placeholder' && logoStep === 1 && (
            <>
              <div className="flex flex-wrap gap-1">
              {logoChips.map((chip) => {
                const isSelected = selectedLogoChip === chip.id;
                
                // Get logo image source based on chip ID
                const getLogoSource = (chipId) => {
                  switch (chipId) {
                    case 'discover':
                      return '/discover.svg';
                    case 'lufthansa':
                      return '/lufthansa.png';
                    case 'swiss':
                      return '/swiss.png';
                    default:
                      return null;
                  }
                };
                
                const logoSource = getLogoSource(chip.id);
                
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleLogoChipClick(chip)}
                    className={`inline-flex items-center px-2 text-xs transition-all cursor-pointer border font-medium`}
                    style={{
                      backgroundColor: `rgba(255,255,255,0.08)`,
                      borderColor: finalBorderColor,
                      color: adaptiveTextColor,
                      borderRadius: '8px',
                      width: '120px',
                      justifyContent: 'center',
                      paddingTop: '0px',
                      paddingBottom: '0px'
                    }}
                  >
                    {isSelected && <CheckIcon className="w-3 h-3 mr-1.5 flex-shrink-0" />}
                    {logoSource ? (
                      <img 
                        src={logoSource} 
                        alt={`${chip.label} logo`}
                        className="w-16 h-16 object-contain flex-shrink-0"
                        onError={(e) => {
                          // Fallback to text if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline';
                        }}
                      />
                    ) : null}
                    <span style={{ display: logoSource ? 'none' : 'inline' }}>
                      {chip.label}
                    </span>
                  </button>
                );
              })}
              </div>
            </>
          )}
          {elementType === 'logo-placeholder' && logoStep === 2 && (
            null
          )}
        </div>
        
        {/* Actions for promo cards and flight journey bar */}
        {elementType === 'flight-journey-bar' && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {(() => {
                // Get base chips
                const baseChips = themeChips && themeChips.length > 0
                  ? themeChips
                  : [
                      { label: 'Default', color: '#000000' },
                      { label: 'Milan Theme', color: '#EF4444' },
                      { label: 'Time of the Day', color: '#F59E0B' }
                    ];
                
                // If a logo is selected, add/prioritize the logo color chip
                if (selectedLogo && selectedLogo.id) {
                  const logoColorMap = {
                    'discover': { label: 'Discover', color: '#1E72AE' },
                    'lufthansa': { label: 'Lufthansa', color: '#050F43' },
                    'swiss': { label: 'Swiss', color: '#CB0300' }
                  };
                  
                  const logoChip = logoColorMap[selectedLogo.id];
                  if (logoChip) {
                    // Remove any existing chip with the same color or label
                    const filteredChips = baseChips.filter(chip => 
                      chip.color !== logoChip.color && chip.label !== logoChip.label
                    );
                    // Add logo chip as first chip
                    return [logoChip, ...filteredChips];
                  }
                }
                
                return baseChips;
              })().map((chip, idx) => {
                // Get the original chip color for the color circle
                const originalChipColor = typeof chip === 'object' ? chip.color : String(chip);
                
                // In routes view, use the same color for chip display but keep original for color circles
                const chipColor = !isThemeBuildStarted ? themeColor : originalChipColor;
                const label = typeof chip === 'object'
                  ? chip.label
                  : (String(originalChipColor).includes('gradient') ? 'Gradient' : String(originalChipColor));
                const isGrad = String(originalChipColor).includes('gradient');
                // Normalize colors for comparison (handle case differences)
                const normalizeColor = (color) => {
                  if (typeof color === 'string' && color.startsWith('#')) {
                    return color.toUpperCase();
                  }
                  return color;
                };
                const isSelected = normalizeColor(selectedColor) === normalizeColor(originalChipColor);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleColorChange(originalChipColor, chip)}
                    className={`transition-colors`}
                    title={label}
                  >
                    <div 
                      className={`flex items-center gap-2 px-2 py-1 border rounded-full max-w-full`} 
                      style={{ 
                        borderColor: finalBorderColor,
                        backgroundColor: isSelected ? `${originalChipColor}15` : 'transparent'
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border flex-shrink-0"
                        style={{
                          background: isGrad ? originalChipColor : undefined,
                          backgroundColor: isGrad ? undefined : originalChipColor,
                          borderColor: finalBorderColor
                        }}
                      />
                      <span className={`text-xs font-medium break-words`} style={{ color: adaptiveTextColor }}>{label}</span>
                    </div>
                  </button>
                );
              })}
              
              {/* Color Picker Chip - moved inline with other chips */}
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`transition-colors flex-shrink-0`}
              >
                <div className="flex items-center gap-2 px-2 py-1 border rounded-full" style={{ borderColor: finalBorderColor }}>
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
                  <span className={`text-xs font-medium`} style={{ color: adaptiveTextColor }}>{selectedColor}</span>
                </div>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Accessibility Score Text - left side */}
              {(() => {
                const ratioWhite = calculateContrastRatio(selectedColor, '#FFFFFF');
                const ratioBlack = calculateContrastRatio(selectedColor, '#000000');
                if (!ratioWhite || !ratioBlack) return null;
                
                // Choose the better contrast ratio to display
                const ratio = Math.max(ratioWhite, ratioBlack);
                const background = ratioWhite > ratioBlack ? 'vs white' : 'vs black';
                const formattedRatio = ratio.toFixed(1);
                const isAccessible = ratio >= 4.5;
                const isAAA = ratio >= 7;
                
                return (
                  <span 
                    className="text-xs font-medium" 
                    style={{ color: adaptiveTextColor }}
                    title={`Best contrast ratio ${background}: ${formattedRatio}:1 ${isAAA ? '(AAA - Excellent)' : isAccessible ? '(AA - Good)' : '(Fail - Poor accessibility)'}`}
                  >
                    Accessibility score: {formattedRatio}:1
                  </span>
                );
              })()}
              
              {/* Send Button - right side */}
              <button
                type="submit"
                disabled={!promptText.trim() || isLoading}
                className={`${useLightText ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
                style={{
                  color: useLightText ? '#FFFFFF' : 'rgba(0, 0, 0, 0.7)'
                }}
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {elementType === 'promo-card' && (
          <div className="flex items-center gap-3 justify-end">
            <button
              type="submit"
              disabled={!promptText.trim() || isLoading}
              className={`${useLightText ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
              style={{
                color: useLightText ? '#FFFFFF' : 'rgba(0, 0, 0, 0.7)'
              }}
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {elementType === 'logo-placeholder' && (
          <div className="flex items-center justify-between mt-2">
            {/* Hint Text - left side */}
            <span 
              className="text-xs font-medium" 
              style={{ color: adaptiveTextColor }}
            >
              {logoStep === 1 ? 'Size: 312 x 100' : 'Format: GIF under 500kB'}
            </span>
            
            {/* Right side: Image Icon + Send Button */}
            <div className="flex items-center gap-3">
              {/* Image Icon */}
              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                className="p-1 hover:opacity-80 transition-opacity"
                title="Upload custom logo (312x100 dimensions)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: adaptiveTextColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
              
              {/* Send Button */}
              <button
                type="submit"
                disabled={
                  isLoading || 
                  (logoStep === 1 ? !selectedLogoChip || selectedLogoChip === 'add-new' : !promptText.trim())
                }
                className={`${useLightText ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
                style={{
                  color: useLightText ? '#FFFFFF' : 'rgba(0, 0, 0, 0.7)'
                }}
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Color Picker for FJB */}
        {elementType === 'flight-journey-bar' && showColorPicker && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <HexColorPicker
              color={selectedColor}
              onChange={(color) => handleColorChange(color, { label: 'Custom Color', color: color })}
              className="shadow-lg rounded-lg"
            />
          </div>
        )}
        
        {/* Send Button for Flight Phase Selection (FPS) */}
        {elementType !== 'promo-card' && elementType !== 'flight-journey-bar' && elementType !== 'logo-placeholder' && (
          <button
            type="submit"
            disabled={!promptText.trim() || isLoading}
            className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 self-end"
            style={{
              color: selectedChip === 'cruise' ? '#10B981' : (useLightText ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)')
            }}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
} 