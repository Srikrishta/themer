import { getReadableOnColor, getLightCardBackgroundColor } from '../utils/color';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getPromoCardContent, shouldUseFestivalContent } from '../utils/festivalUtils';
import { getNonFestiveCardContent } from '../data/festivalContent';
import { getPollinationsImage } from '../utils/unsplash';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useImageState } from '../hooks/useIsolatedState';
import { generateContextKey, useContextValidator, clearAllState, logStateChange } from '../utils/contextValidation';
import { useStateLeakageDetection } from '../utils/stateLeakageDetector';


export default function Component3Cards({ 
  themeColor = '#1E1E1E', 
  routes = [], 
  isPromptMode = false, 
  onPromptHover, 
  onPromptClick, 
  promptStates = {}, 
  animationProgress = 0, 
  cruiseLabelShown = false, 
  middleCardPromptClosed = false, 
  isThemeBuildStarted = true,
  colorPromptSaved = false,
  origin,
  destination,
  selectedFlightPhase,
  promoCardContents,
  colorPromptClosedWithoutSave,
  currentRouteKey,
  isModifyClicked,
  selectedDates,
  isCurrentThemeFestive,
  getRouteSelectedThemeChip,
  onPromoCardHover
}) {
  // Generate unique context key for state isolation
  // Include a themeVariantKey so that per-route theme tweaks (like chip selection or modified colors)
  // never leak across routes or phases
  const themeVariantKey = (() => {
    try {
      // Prefer selected theme chip label if available via prop function
      if (typeof getRouteSelectedThemeChip === 'function') {
        const chip = getRouteSelectedThemeChip();
        if (chip && (chip.label || chip.id)) {
          const label = (chip.label || chip.id || '').toString().toLowerCase();
          const color = (chip.color || '').toString().toLowerCase();
          return `chip:${label}|color:${color}`;
        }
      }
    } catch {}
    return 'no-variant';
  })();

  const contextKey = generateContextKey(
    currentRouteKey,
    selectedFlightPhase,
    themeColor,
    selectedDates,
    themeVariantKey
  );
  
  // Use isolated state management to prevent leakage
  const {
    remixedImages,
    editableDescriptions,
    editableTitles,
    imageLoadingStates,
    savedDescriptions,
    remixLoading,
    setRemixedImage,
    setImageLoading,
    setEditableDescription,
    setEditableTitle,
    setRemixLoading,
    clearState,
    // Legacy function names for backward compatibility
    setEditableTitles,
    setEditableDescriptions
  } = useImageState(contextKey);
  
  // Context validator to ensure proper isolation
  const { validateContext } = useContextValidator(contextKey, 'Component3Cards');
  
  // State leakage detection
  const { hasLeakage, warnings } = useStateLeakageDetection('Component3Cards', contextKey, {
    remixedImages,
    editableDescriptions,
    editableTitles,
    imageLoadingStates,
    savedDescriptions,
    remixLoading
  });
  
  // Log leakage warnings
  useEffect(() => {
    if (hasLeakage) {
      console.error('🚨 STATE LEAKAGE DETECTED IN COMPONENT3CARDS', {
        contextKey,
        warnings,
        state: { remixedImages, editableDescriptions, editableTitles, imageLoadingStates, savedDescriptions, remixLoading }
      });
    }
  }, [hasLeakage, warnings, contextKey, remixedImages, editableDescriptions, editableTitles, imageLoadingStates, savedDescriptions, remixLoading]);
  
  // Grid-based layout removes the need for JS measurement

  // Utility: place caret at the end of a contentEditable element
  const placeCaretAtEnd = (el) => {
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {}
  };

  // Compute linear caret offset within a contentEditable element
  const getCaretOffset = (el) => {
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      const range = sel.getRangeAt(0).cloneRange();
      // Ensure the selection is inside the element
      if (!el.contains(range.endContainer)) return null;
      const pre = document.createRange();
      pre.selectNodeContents(el);
      pre.setEnd(range.endContainer, range.endOffset);
      return pre.toString().length;
    } catch {
      return null;
    }
  };

  // Restore caret to a linear offset within a contentEditable element
  const setCaretOffset = (el, offset) => {
    try {
      let remaining = Math.max(0, offset);
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      let node = walker.nextNode();
      while (node) {
        const len = node.nodeValue?.length || 0;
        if (remaining <= len) {
          const range = document.createRange();
          range.setStart(node, remaining);
          range.collapse(true);
          const sel = window.getSelection();
          if (!sel) return;
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }
        remaining -= len;
        node = walker.nextNode();
      }
      // Fallback to end
      placeCaretAtEnd(el);
    } catch {}
  };

  // Refs for inline editable spans
  const titleEditableRef = useRef(null);
  const descEditableRef = useRef(null);
  const [activeEditable, setActiveEditable] = useState('title'); // 'title' | 'desc'

  // Keep DOM in sync with state without disturbing caret when content doesn't change
  useEffect(() => {
    const el = titleEditableRef.current;
    if (!el) return;
    const stateText = editableTitles[0] ?? (() => { const c = getDefaultCardContent(0); return c.text || ''; })();
    if (el.innerText !== stateText) {
      const offset = getCaretOffset(el);
      el.innerText = stateText;
      // If user is currently editing title, try to keep caret close to previous offset
      if (activeEditable === 'title' && offset != null) {
        const newOffset = Math.min(offset, stateText.length);
        setCaretOffset(el, newOffset);
      }
    }
  }, [editableTitles, activeEditable]);

  useEffect(() => {
    const el = descEditableRef.current;
    if (!el) return;
    const stateText = editableDescriptions[0] ?? (() => { const c = getDefaultCardContent(0); return c.image || c.text || ''; })();
    if (el.innerText !== stateText) {
      const offset = getCaretOffset(el);
      el.innerText = stateText;
      if (activeEditable === 'desc' && offset != null) {
        const newOffset = Math.min(offset, stateText.length);
        setCaretOffset(el, newOffset);
      }
    }
  }, [editableDescriptions, activeEditable]);
  

  // Helper functions for image loading state management
  const isImageLoading = (cardIndex) => {
    return imageLoadingStates[cardIndex] || false;
  };

  // Force re-render when colorPromptSaved changes
  useEffect(() => {
    console.log('=== COMPONENT3CARDS COLORPROMPTSAVED CHANGED ===', {
      colorPromptSaved,
      selectedFlightPhase,
      origin,
      destination,
      themeColor,
      selectedDates,
      hasOrigin: !!origin,
      hasDestination: !!destination,
      hasSelectedFlightPhase: !!selectedFlightPhase,
      hasSelectedDates: !!selectedDates && selectedDates.length > 0
    });
  }, [colorPromptSaved, selectedFlightPhase, origin, destination, themeColor, selectedDates]);

  // Log context changes for debugging
  useEffect(() => {
    console.log('🔄 COMPONENT3CARDS CONTEXT CHANGED', {
      contextKey,
      currentRouteKey,
      selectedFlightPhase,
      themeColor,
      selectedDates,
      reason: 'Context change detected - state will be automatically cleared'
    });
  }, [contextKey, currentRouteKey, selectedFlightPhase, themeColor, selectedDates]);

  // Debug when promoCardContents changes
  useEffect(() => {
    console.log('=== COMPONENT3CARDS PROMOCARDCONTENTS CHANGED ===', {
      currentRouteKey,
      selectedFlightPhase,
      promoCardContents,
      routeContents: currentRouteKey ? promoCardContents[currentRouteKey] : null,
      phaseKey: currentRouteKey && selectedFlightPhase ? `${currentRouteKey}-${selectedFlightPhase}` : null,
      phaseContents: (currentRouteKey && selectedFlightPhase) ? promoCardContents[`${currentRouteKey}-${selectedFlightPhase}`] : null
    });
  }, [promoCardContents, currentRouteKey, selectedFlightPhase]);




  // Skeleton component for loading state
  const SkeletonCard = () => (
    <div
      className="h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center bg-white/60 border border-gray-300"
      style={{ width: '416px' }}
    >
      <div className="space-y-3 text-center w-full px-6">
        <div className="h-8 rounded w-48 mx-auto bg-gray-200"></div>
        <div className="h-6 rounded w-32 mx-auto bg-gray-200"></div>
      </div>
    </div>
  );

  // Show skeleton state based on routes length and theme build status
  const showAllSkeletons = ((!isThemeBuildStarted && !isPromptMode) || (routes.length < 2 && !isPromptMode));








  // Helper function for default card content
  const getDefaultCardContent = (cardIndex) => {
    console.log('=== GETDEFAULTCARDCONTENT CALLED ===', {
      cardIndex,
      currentRouteKey,
      selectedFlightPhase,
      promoCardContents,
      hasRouteKey: !!currentRouteKey,
      hasRouteContents: !!(currentRouteKey && promoCardContents[currentRouteKey]),
      hasCardContent: !!(currentRouteKey && promoCardContents[currentRouteKey] && promoCardContents[currentRouteKey][cardIndex])
    });

    // Prefer content saved for the current phase, then fallback to route-level saved content
    const phaseKey = (currentRouteKey && selectedFlightPhase)
      ? `${currentRouteKey}-${selectedFlightPhase}`
      : null;

    const savedForPhase = phaseKey && promoCardContents[phaseKey]
      ? promoCardContents[phaseKey][cardIndex]
      : undefined;

    const savedForRoute = (currentRouteKey && promoCardContents[currentRouteKey])
      ? promoCardContents[currentRouteKey][cardIndex]
      : undefined;

    const savedContent = savedForPhase || savedForRoute;

    if (savedContent) {
      console.log('=== USING SAVED PROMO CARD CONTENT ===', {
        currentRouteKey,
        phaseKey,
        cardIndex,
        from: savedForPhase ? 'phase' : 'route',
        savedContent,
        textValue: savedContent.text,
        imageValue: savedContent.image
      });
      return {
        text: savedContent.text || "Add experience",
        image: savedContent.image || '',
        backgroundImage: savedContent.backgroundImage || '',
        bgColor: getLightCardBackgroundColor(themeColor)
      };
    }
    
    // Only generate festival content if:
    // 1. Theme is saved for this route
    // 2. Current theme is actually festive (not non-festive like Lufthansa)
    // 3. Required data is available
    if (colorPromptSaved && isCurrentThemeFestive && isCurrentThemeFestive() && selectedFlightPhase && origin && destination) {
      console.log('=== GETTING FESTIVAL CONTENT FOR PROMO CARD ===', {
        colorPromptSaved,
        isFestive: isCurrentThemeFestive(),
        selectedThemeChip: getRouteSelectedThemeChip(),
        selectedFlightPhase,
        origin,
        destination,
        cardIndex,
        selectedDates
      });
      
      // Handle both string and object formats for origin/destination
      const originCity = typeof origin === 'string' ? origin : origin?.airport?.city || origin;
      const destCity = typeof destination === 'string' ? destination : destination?.airport?.city || destination;
      
      const segment = { 
        origin: { airport: { city: originCity } }, 
        destination: { airport: { city: destCity } } 
      };
      
      // Use default dates if none are selected
      const datesToUse = selectedDates && selectedDates.length > 0 ? selectedDates : ['2024-09-15'];
      
      const festivalContent = getPromoCardContent(segment, datesToUse, selectedFlightPhase, cardIndex, themeColor);
      console.log('=== FESTIVAL CONTENT RESULT ===', {
        festivalContent,
        hasText: !!festivalContent?.text,
        hasImage: !!festivalContent?.image
      });
      
      if (festivalContent && festivalContent.text) {
        return { 
          text: festivalContent.text, 
          image: festivalContent.image || '', 
          bgColor: getLightCardBackgroundColor(themeColor) 
        };
      }
    } else {
      console.log('=== SKIPPING FESTIVAL CONTENT GENERATION FOR PROMO CARD ===', {
        colorPromptSaved,
        isFestive: isCurrentThemeFestive ? isCurrentThemeFestive() : 'function not provided',
        selectedThemeChip: getRouteSelectedThemeChip ? getRouteSelectedThemeChip() : 'function not provided',
        reason: !colorPromptSaved ? 'theme not saved' : 
                !isCurrentThemeFestive ? 'validation function not provided' :
                !isCurrentThemeFestive() ? 'theme not festive' : 
                'missing required data'
      });
    }
    
    // For non-festive themes or when theme is saved but not festive, use non-festive content
    if (colorPromptSaved && selectedFlightPhase) {
      console.log('=== GETTING NON-FESTIVE CONTENT FOR PROMO CARD ===', {
        selectedFlightPhase,
        cardIndex,
        colorPromptSaved
      });
      
      const nonFestiveContent = getNonFestiveCardContent(selectedFlightPhase, 'promo', cardIndex);
      console.log('=== NON-FESTIVE CONTENT RESULT ===', {
        nonFestiveContent,
        hasText: !!nonFestiveContent?.text,
        hasImage: !!nonFestiveContent?.image
      });
      
      if (nonFestiveContent && nonFestiveContent.text) {
        return { 
          text: nonFestiveContent.text, 
          image: nonFestiveContent.image || '', 
          bgColor: getLightCardBackgroundColor(themeColor) 
        };
      }
    }
    
    // Final fallback for unsaved themes
    return { text: "Add experience", bgColor: getLightCardBackgroundColor(themeColor) };
  };






  // Helper function to render a single card with original styling
  const renderCard = (originalCardIndex, displayPosition) => {
    // Simple card content - always show "Add experience"
    const cardContent = getDefaultCardContent(originalCardIndex);
    
    // Use edited title if available, otherwise use original card content
    const displayTitle = editableTitles[originalCardIndex] || cardContent.text;
    
    console.log('=== RENDER CARD DEBUG ===', {
      originalCardIndex,
      displayPosition,
      cardContent,
      textValue: cardContent.text,
      imageValue: cardContent.image,
      textType: typeof cardContent.text,
      imageType: typeof cardContent.image
    });
    
    // Get card type mapping
    const cardTypeMap = {
      0: { type: 'shopping', name: 'add experience', id: 'node-82_35814' },
      1: { type: 'meal', name: 'add experience', id: 'node-82_35815' },
      2: { type: 'movie', name: 'add experience', id: 'node-82_35816' }
    };
    
    const cardInfo = cardTypeMap[originalCardIndex];
    
    const cardStyle = {
      width: '416px',
      background: cardContent.bgColor
    };

    return (
      <div
        key={`card-${originalCardIndex}-${displayPosition}`}
        className="h-[200px] overflow-clip relative shrink-0 flex items-center justify-center rounded-lg"
        style={cardStyle}
        data-name={cardInfo.name}
        data-card-index={originalCardIndex}
        id={cardInfo.id}
        onMouseEnter={(e) => {
          if (isPromptMode && colorPromptSaved && onPromoCardHover) {
            // Use actual mouse cursor position like FlightJourneyBar does
            const position = { x: e.clientX, y: e.clientY };
            onPromoCardHover(
              true,
              'promo-card',
              { cardIndex: originalCardIndex, cardType: cardInfo.type, currentContent: cardContent },
              position
            );
          }
        }}
        onMouseMove={(e) => {
          if (isPromptMode && colorPromptSaved && onPromoCardHover) {
            // Continuously update position as mouse moves within the card
            const position = { x: e.clientX, y: e.clientY };
            onPromoCardHover(
              true,
              'promo-card',
              { cardIndex: originalCardIndex, cardType: cardInfo.type, currentContent: cardContent },
              position
            );
          }
        }}
        onMouseLeave={(e) => {
          if (isPromptMode && colorPromptSaved && onPromoCardHover) {
            onPromoCardHover(false, 'promo-card', { cardIndex: originalCardIndex, cardType: cardInfo.type }, { x: 0, y: 0 });
          }
        }}
      >
          <div className="relative h-full w-full">
            
            {/* Image area - show image if available OR if we have a remixed image */}
            {(cardContent.image || remixedImages[originalCardIndex]) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full relative">
                  {/* Loading spinner */}
                  {isImageLoading(originalCardIndex) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="flex flex-col items-center space-y-2">
                        <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-600" />
                        <span className="text-xs text-gray-600">Loading image...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Image */}
                  {(() => {
                    // Use remixed image if available, otherwise use original logic
                    const hasRemixedImage = !!remixedImages[originalCardIndex];
                    const baseDescription = cardContent.image || cardContent.text || 'in-flight experience';
                    const imageSrc = remixedImages[originalCardIndex] || 
                      ((cardContent && cardContent.backgroundImage)
                        ? cardContent.backgroundImage
                        : getPollinationsImage(baseDescription, themeColor));
                    
                    console.log('=== IMAGE RENDERING DEBUG ===', {
                      originalCardIndex,
                      hasRemixedImage,
                      remixedImages,
                      imageSrc,
                      cardContentImage: cardContent.image,
                      isLoading: isImageLoading(originalCardIndex)
                    });
                    
                    return (
                      <img 
                        src={imageSrc}
                        alt={baseDescription}
                        className="w-full h-full object-cover rounded-lg"
                        style={{ display: isImageLoading(originalCardIndex) ? 'none' : 'block' }}
                        onLoad={() => {
                          console.log('=== POLLINATIONS IMAGE LOADED ===', { 
                            cardIndex: originalCardIndex, 
                            alt: cardContent.image, 
                            src: imageSrc,
                            wasRemixed: hasRemixedImage
                          });
                          setImageLoading(originalCardIndex, false);
                        }}
                        onError={(e) => {
                          console.log('=== POLLINATIONS IMAGE LOAD ERROR ===', { 
                            src: e.target.src, 
                            alt: cardContent.image,
                            wasRemixed: hasRemixedImage
                          });
                          setImageLoading(originalCardIndex, false);
                          e.target.style.display = 'none';
                        }}
                        onLoadStart={() => {
                          console.log('=== POLLINATIONS IMAGE LOAD START ===', { 
                            cardIndex: originalCardIndex, 
                            alt: cardContent.image, 
                            src: imageSrc,
                            wasRemixed: hasRemixedImage
                          });
                          setImageLoading(originalCardIndex, true);
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            )}
            

            {/* Bottom rectangle with text field */}
            <div 
              className="absolute bottom-0 left-0 right-0 z-10 p-2 rounded-b-lg"
              style={{ 
                backgroundColor: getReadableOnColor(themeColor),
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <p className="block font-semibold text-center uppercase" 
                 style={{ 
                   fontSize: '12px', 
                   lineHeight: '16px', 
                   margin: 0,
                   ...(themeColor.includes('gradient') 
                     ? { background: themeColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                     : { color: themeColor }
                   )
                 }}>
                {displayTitle}
              </p>
            </div>
          </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="flex flex-col items-center justify-center mx-auto gap-4"
        style={{ width: '1302px' }}
        data-name="3-cards"
        id="node-82_36633"
      >
        <div className="flex flex-row gap-8 items-center justify-center">
          {showAllSkeletons ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {/* Render cards in fixed order */}
              {[0, 1, 2].map((originalCardIndex, displayPosition) => 
                renderCard(originalCardIndex, displayPosition)
              )}
            </>
          )}
        </div>
        
        {/* Remix controls - only show for left card (index 0) after theme is saved */}
        {colorPromptSaved && (
          <div 
            className="px-4 py-3 rounded-lg flex flex-col items-center space-y-2"
            style={{
              backgroundColor: '#1C1C1C',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: '416px'
            }}
          >
            {/* Continuous inline paragraph using contenteditable spans (inline flow, natural wrapping) */}
            <div className="w-full">
              <p className="whitespace-pre-wrap break-words text-sm leading-5 text-white m-0">
                <span
                  className="text-gray-300 select-none"
                  onMouseDown={(e) => { e.preventDefault(); setActiveEditable('title'); if (titleEditableRef.current) { titleEditableRef.current.focus(); placeCaretAtEnd(titleEditableRef.current); } }}
                >
                  Change title to 
                </span>
                <span
                  ref={titleEditableRef}
                  role="textbox"
                  aria-label="title"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    const el = e.currentTarget;
                    const caretBefore = getCaretOffset(el);
                    const raw = el.innerText || '';
                    const clamped = raw.length > 50 ? raw.slice(0, 50) : raw;
                    const changed = clamped !== raw;
                    if (changed) {
                      el.innerText = clamped;
                    }
                    if (clamped !== (editableTitles[0] || '')) setEditableTitles(0, clamped);
                    if (changed) {
                      const newOffset = Math.min(caretBefore ?? clamped.length, clamped.length);
                      requestAnimationFrame(() => setCaretOffset(el, newOffset));
                    }
                  }}
                  onFocus={(e) => { setActiveEditable('title'); }}
                  
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); return; } }}
                  className="outline-none"
                  spellCheck={false}
                  style={{ textDecoration: 'underline dotted', textDecorationColor: 'rgba(156,163,175,0.8)', textUnderlineOffset: 6, caretColor: activeEditable === 'title' ? 'auto' : 'transparent' }}
                >
                </span>
                <span
                  className="text-gray-300 select-none"
                  onMouseDown={(e) => { e.preventDefault(); setActiveEditable('desc'); if (descEditableRef.current) { descEditableRef.current.focus(); placeCaretAtEnd(descEditableRef.current); } }}
                >
                  describe image of 
                </span>
                <span
                  ref={descEditableRef}
                  role="textbox"
                  aria-label="image description"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    const el = e.currentTarget;
                    const caretBefore = getCaretOffset(el);
                    const raw = el.innerText || '';
                    const clamped = raw.length > 100 ? raw.slice(0, 100) : raw;
                    const changed = clamped !== raw;
                    if (changed) {
                      el.innerText = clamped;
                    }
                    if (clamped !== (editableDescriptions[0] || '')) setEditableDescriptions(0, clamped);
                    if (changed) {
                      const newOffset = Math.min(caretBefore ?? clamped.length, clamped.length);
                      requestAnimationFrame(() => setCaretOffset(el, newOffset));
                    }
                  }}
                  onFocus={(e) => { setActiveEditable('desc'); }}
                  
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); return; } }}
                  className="outline-none"
                  spellCheck={false}
                  style={{ textDecoration: 'underline dotted', textDecorationColor: 'rgba(156,163,175,0.8)', textUnderlineOffset: 6, caretColor: activeEditable === 'desc' ? 'auto' : 'transparent' }}
                >
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg font-semibold text-xs uppercase transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                disabled={(() => {
                  const currentDescription = editableDescriptions[0] || (() => {
                    const cardContent = getDefaultCardContent(0);
                    return cardContent.image || cardContent.text || 'in-flight experience';
                  })();
                  const currentTitle = editableTitles[0] || (() => {
                    const cardContent = getDefaultCardContent(0);
                    return cardContent.text || 'Add experience';
                  })();
                  const savedDescription = savedDescriptions[0];
                  const savedTitle = savedDescriptions[0]; // We'll track both in the same state for now
                  return currentDescription === savedDescription && currentTitle === savedTitle;
                })()}
                onClick={() => {
                  console.log('=== SAVE BUTTON CLICKED ===', {
                    editedDescription: editableDescriptions[0],
                    editedTitle: editableTitles[0],
                    cardIndex: 0
                  });
                  
                  // Generate new image based on the edited description
                  const editedDescription = editableDescriptions[0];
                  const editedTitle = editableTitles[0];
                  
                  if (editedDescription) {
                    console.log('=== GENERATING SAVED IMAGE ===', {
                      editedDescription,
                      editedTitle,
                      themeColor
                    });
                    
                    // Generate new image URL with the edited description
                    const newImageUrl = getPollinationsImage(editedDescription, themeColor, { randomize: true });
                    
                    // Update the remixed images state to show the new image
                    // Use isolated state management
                    setRemixedImage(0, newImageUrl);
                    setImageLoading(0, true);
                    setEditableDescription(0, editedDescription);
                    
                    console.log('=== SAVE COMPLETE ===', {
                      newImageUrl,
                      editedDescription,
                      editedTitle,
                      savedDescription: editedDescription
                    });
                  }
                }}
              >
                🎲 Remix Style
              </button>
              <button
                className="px-4 py-2 rounded-lg font-semibold text-xs uppercase transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
                disabled={false}
                onClick={async () => {
                  console.log('=== REMIX BUTTON CLICKED ===');
                  setRemixLoading(true);
                  
                  try {
                    // Get current card content to extract image description
                    const currentCardContent = getDefaultCardContent(0);
                    console.log('=== CURRENT CARD CONTENT ===', {
                      currentCardContent,
                      hasImage: !!currentCardContent.image,
                      imageDescription: currentCardContent.image,
                      text: currentCardContent.text
                    });
                    // Prefer live DOM text to avoid lag between DOM and state
                    const domDesc = (descEditableRef?.current?.innerText || '').trim();
                    const imageDescription = domDesc || editableDescriptions[0] || currentCardContent.image || currentCardContent.text || 'in-flight experience';
                    // Keep state in sync with DOM if user just typed
                    if (domDesc && domDesc !== editableDescriptions[0]) {
                      setEditableDescriptions(0, domDesc.slice(0, 100));
                    }
                    
                    if (imageDescription) {
                      console.log('=== GENERATING NEW IMAGE ===', {
                        imageDescription,
                        themeColor,
                        currentRouteKey,
                        selectedFlightPhase,
                        colorPromptSaved
                      });
                      
                      // Generate new image URL with current theme color and randomized seed for true remix
                      const newImageUrl = getPollinationsImage(imageDescription, themeColor, { randomize: true });
                      
                      // Force reload the image by updating the src with a cache-busting parameter
                      const timestamp = Date.now();
                      const separator = newImageUrl.includes('?') ? '&' : '?';
                      const newImageUrlWithCacheBust = `${newImageUrl}${separator}t=${timestamp}`;
                      
                      console.log('=== UPDATING STATE WITH NEW IMAGE ===', {
                        newImageUrl,
                        newImageUrlWithCacheBust,
                        currentRemixedImages: remixedImages
                      });
                      
                      // Update state to trigger re-render with new image
                      setRemixedImage(0, newImageUrlWithCacheBust);
                      console.log('=== NEW REMIXED IMAGE SET ===', {
                        cardIndex: 0,
                        newImageUrl: newImageUrlWithCacheBust
                      });
                      
                      
                      // Set loading state for the card
                      setImageLoading(0, true);
                      
                      console.log('=== REMIX COMPLETE ===', {
                        newImageUrl: newImageUrlWithCacheBust,
                        loadingState: true
                      });
                    } else {
                      console.log('=== NO IMAGE DESCRIPTION FOUND ===', {
                        currentCardContent,
                        reason: 'No image property in card content'
                      });
                    }
                  } catch (error) {
                    console.error('=== ERROR GENERATING REMIX IMAGE ===', error);
                  } finally {
                    setRemixLoading(false);
                  }
                }}
              >
                {remixLoading ? (
                  <div className="flex items-center space-x-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Remixing...</span>
                  </div>
                ) : (
                  '💾 Save'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}