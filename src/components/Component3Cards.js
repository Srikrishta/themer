import { getReadableOnColor, getTextColorForImage } from '../utils/color';
import { useState, useEffect, useCallback } from 'react';
import { getPromoCardContent, shouldUseFestivalContent } from '../utils/festivalUtils';

// Helper function to map hash to Unsplash photo IDs for consistent fallbacks
const getUnsplashFallback = (description) => {
  console.log('=== GETTING UNSPLASH FALLBACK ===', { description });
  
  // Expanded keyword-based mappings for various categories
  const keywordMappings = {
    // Food
    'croissants': 'https://images.unsplash.com/photo-1555507036-ab794f0ec0a4?w=416&h=200&fit=crop&crop=center&auto=format',
    'pastries': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=416&h=200&fit=crop&crop=center&auto=format',
    'pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=416&h=200&fit=crop&crop=center&auto=format',
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=416&h=200&fit=crop&crop=center&auto=format',
    'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=416&h=200&fit=crop&crop=center&auto=format',
    'coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=416&h=200&fit=crop&crop=center&auto=format',
    // Nature
    'mountain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=416&h=200&fit=crop&crop=center&auto=format',
    'forest': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=416&h=200&fit=crop&crop=center&auto=format',
    'sunset': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    // Travel
    'city': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=416&h=200&fit=crop&crop=center&auto=format',
    'building': 'https://images.unsplash.com/photo-1486718448742-163d73305ec3?w=416&h=200&fit=crop&crop=center&auto=format',
    'street': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=416&h=200&fit=crop&crop=center&auto=format',
    // Technology
    'computer': 'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format',
    'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'tech': 'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format',
    // Sports
    'fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=416&h=200&fit=crop&crop=center&auto=format',
    'sport': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=416&h=200&fit=crop&crop=center&auto=format',
    'running': 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=416&h=200&fit=crop&crop=center&auto=format',
    // Art
    'art': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=416&h=200&fit=crop&crop=center&auto=format',
    'painting': 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=416&h=200&fit=crop&crop=center&auto=format',
    'design': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=416&h=200&fit=crop&crop=center&auto=format'
  };
  
  // Check for direct keyword matches first
  const lowerDesc = description.toLowerCase();
  for (const [keyword, url] of Object.entries(keywordMappings)) {
    if (lowerDesc.includes(keyword)) {
      console.log('=== USING KEYWORD-BASED UNSPLASH IMAGE ===', { keyword, url });
      return url;
    }
  }
  
  // If no keyword match, use hash-based selection for consistency
  console.log('=== USING HASH-BASED UNSPLASH FALLBACK ===', { description });
  
  const fallbackImages = [
    // Mixed category fallbacks for better variety
    'https://images.unsplash.com/photo-1555507036-ab794f0ec0a4?w=416&h=200&fit=crop&crop=center&auto=format', // croissants
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format', // mountain
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=416&h=200&fit=crop&crop=center&auto=format', // city
    'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format', // tech
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=416&h=200&fit=crop&crop=center&auto=format', // beach
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=416&h=200&fit=crop&crop=center&auto=format', // art
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=416&h=200&fit=crop&crop=center&auto=format', // fitness
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=416&h=200&fit=crop&crop=center&auto=format', // forest
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=416&h=200&fit=crop&crop=center&auto=format'  // pizza
  ];
  
  // Create hash from description for consistent selection
  let hash = 0;
  for (let i = 0; i < description.length; i++) {
    const char = description.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % fallbackImages.length;
  const selectedUrl = fallbackImages[index];
  
  console.log('=== HASH-BASED SELECTION ===', { 
    description, 
    hash, 
    index, 
    selectedUrl,
    totalImages: fallbackImages.length 
  });
  
  return selectedUrl;
};

const gradientAnimationCSS = `
  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

export default function Component3Cards({ 
  themeColor = '#1E1E1E', 
  origin = null,
  destination = null,
  routes = [], 
  isPromptMode = false, 
  onPromptHover, 
  onPromptClick, 
  promptStates = {}, 
  animationProgress = 0, 
  cruiseLabelShown = false, 
  middleCardPromptClosed = false, 
  isThemeBuildStarted = true, 
  selectedFlightPhase = null, 
  promoCardContents = {}, 
  cardOrder = [0, 1, 2], 
  onCardReorder,
  colorPromptClosedWithoutSave = false,
  colorPromptSaved = false,
  isModifyClicked = false,
  currentRouteKey = null,
  selectedDates = [],
  selectedFestivalName = null
}) {
  // Determine if festival content should be active for this segment/dates/color
  const isFestivalActive = shouldUseFestivalContent({ origin, destination }, selectedDates, themeColor, selectedFestivalName);

  console.log('=== COMPONENT3CARDS RENDER ===', {
    selectedDates,
    origin,
    destination,
    selectedFlightPhase,
    hasOrigin: !!origin,
    hasDestination: !!destination,
    hasDates: !!selectedDates && selectedDates.length > 0,
    themeColor,
    isFestivalTheme: isFestivalActive,
    routeStructure: {
      hasOrigin: !!origin,
      hasDestination: !!destination,
      originAirport: origin?.airport,
      destAirport: destination?.airport,
      originCity: origin?.airport?.city,
      destCity: destination?.airport?.city
    }
  });
  
  console.log('=== COMPONENT3CARDS RENDER ===', {
    isPromptMode, 
    cruiseLabelShown, 
    middleCardPromptClosed,
    hasOnPromptClick: !!onPromptClick,
    selectedFlightPhase,
    showAllSkeletons: (!isThemeBuildStarted && !isPromptMode) || (routes.length < 2 && !isPromptMode),
    routes: routes.length,
    isThemeBuildStarted,
    cardOrder,
    hasOnCardReorder: !!onCardReorder,
    animationProgress,
    promoCardContents,
    colorPromptClosedWithoutSave,
    isModifyClicked,
    currentRouteKey
  });

  // State for takeoff phase loading
  const [takeoffLoading, setTakeoffLoading] = useState(false);
  const [loadedCards, setLoadedCards] = useState(new Set());
  
  // Enhanced remix state management
  const [remixAttempts, setRemixAttempts] = useState({});
  const [remixErrors, setRemixErrors] = useState({});
  const [isRemixRateLimited, setIsRemixRateLimited] = useState(false);
  
  // Drag and drop state
  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  // State for storing text colors based on image analysis
  const [textColors, setTextColors] = useState({});

  // Robust remix management functions
  const MAX_REMIX_ATTEMPTS = 3;
  const RATE_LIMIT_DELAY = 2000; // 2 seconds between remixes
  
  const canRemix = useCallback((cardIndex) => {
    const attempts = remixAttempts[cardIndex] || 0;
    const errors = remixErrors[cardIndex] || 0;
    return attempts < MAX_REMIX_ATTEMPTS && errors < MAX_REMIX_ATTEMPTS && !isRemixRateLimited;
  }, [remixAttempts, remixErrors, isRemixRateLimited]);
  
  const recordRemixAttempt = useCallback((cardIndex) => {
    setRemixAttempts(prev => ({
      ...prev,
      [cardIndex]: (prev[cardIndex] || 0) + 1
    }));
  }, []);
  
  const recordRemixError = useCallback((cardIndex, error) => {
    setRemixErrors(prev => ({
      ...prev,
      [cardIndex]: (prev[cardIndex] || 0) + 1
    }));
    console.error('=== REMIX ERROR ===', { cardIndex, error });
  }, []);
  
  const resetRemixState = useCallback((cardIndex) => {
    setRemixAttempts(prev => {
      const newState = { ...prev };
      delete newState[cardIndex];
      return newState;
    });
    setRemixErrors(prev => {
      const newState = { ...prev };
      delete newState[cardIndex];
      return newState;
    });
  }, []);
  
  const applyRateLimit = useCallback(() => {
    setIsRemixRateLimited(true);
    setTimeout(() => {
      setIsRemixRateLimited(false);
    }, RATE_LIMIT_DELAY);
  }, []);

  // Handle takeoff phase selection
  useEffect(() => {
    if (selectedFlightPhase === 'takeoff') {
      setTakeoffLoading(true);
      // Simulate loading cards progressively
      setTimeout(() => {
        setLoadedCards(new Set([0, 1, 2])); // Right card changes after 3s
        setTakeoffLoading(false);
      }, 3000);
    } else {
      setTakeoffLoading(false);
      setLoadedCards(new Set());
    }
  }, [selectedFlightPhase]);



  // Drag and drop handlers
  const handleDragStart = (e, cardIndex) => {
    console.log('=== DRAG START ===', { cardIndex });
    setDraggedCardIndex(cardIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    console.log('=== DRAG END ===');
    e.target.style.opacity = '1';
    setDraggedCardIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, cardIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedCardIndex !== cardIndex) {
      setDragOverIndex(cardIndex);
    }
  };

  const handleDragEnter = (e, cardIndex) => {
    e.preventDefault();
    if (draggedCardIndex !== cardIndex) {
      setDragOverIndex(cardIndex);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear dragOverIndex if we're leaving the entire card area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, cardIndex) => {
    e.preventDefault();
    console.log('=== DROP ===', { draggedCardIndex, cardIndex });
    
    if (draggedCardIndex !== null && draggedCardIndex !== cardIndex && onCardReorder) {
      onCardReorder(draggedCardIndex, cardIndex);
    }
    
    setDraggedCardIndex(null);
    setDragOverIndex(null);
  };

  // Helper function to create lighter version of theme color (same as content cards)
  const getLightThemeColor = (opacity = 0.1) => {
    if (themeColor.startsWith('#')) {
      // Convert hex to rgba with opacity
      const hex = themeColor.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return 'rgba(255,255,255,0.1)';
  };

  // Helper function to detect text color for an image
  const detectTextColorForImage = useCallback(async (imageUrl, cardIndex) => {
    if (!imageUrl) return;
    
    try {
      const textColor = await getTextColorForImage(imageUrl);
      setTextColors(prev => ({
        ...prev,
        [cardIndex]: textColor
      }));
      console.log('=== DETECTED TEXT COLOR FOR CARD ===', { cardIndex, imageUrl, textColor });
    } catch (error) {
      console.error('Error detecting text color:', error);
      // Default to white on error
      setTextColors(prev => ({
        ...prev,
        [cardIndex]: 'white'
      }));
    }
  }, []);

  // Helper function to get animated border overlay for specific cards
  const getAnimatedBorderOverlay = (cardIndex) => {
    if (!(isPromptMode && isThemeBuildStarted && promptStates[cardIndex]?.showAnimation)) {
      return null;
    }
    
    return (
      <div
        style={{
          position: 'absolute',
          top: '-12px',
          left: '-12px',
          right: '-12px',
          bottom: '-12px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientAnimation 3s ease infinite',
          zIndex: -1,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          padding: '12px',
          opacity: 1
        }}
      />
    );
  };

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

  // Synchronous version for initial image generation (without retry logic)
  const generateAIImageSync = useCallback((description) => {
    console.log('=== GENERATING AI IMAGE SYNC ===', { description });
    
    // Detect different categories and enhance accordingly
    const isFood = /\b(food|eat|cook|dish|meal|cuisine|recipe|ingredient|snack|drink|beverage|welcome|restaurant|menu|kitchen|chef|delicious|tasty|fresh|organic)\b/i.test(description);
    const isNature = /\b(nature|landscape|forest|mountain|ocean|beach|sunset|sunrise|sky|clouds|trees|flowers|garden|park)\b/i.test(description);
    const isTravel = /\b(travel|vacation|trip|destination|city|architecture|building|landmark|hotel|airport|street|culture)\b/i.test(description);
    const isSports = /\b(sport|sports|fitness|gym|exercise|running|swimming|cycling|football|basketball|tennis|yoga|workout)\b/i.test(description);
    const isTechnology = /\b(technology|tech|computer|software|digital|app|website|AI|robot|innovation|device|gadget)\b/i.test(description);
    const isArt = /\b(art|artist|painting|drawing|sculpture|gallery|museum|creative|design|illustration|artwork)\b/i.test(description);
    
    let enhancedPrompt;
    
    if (isFood) {
      // Check if it's specifically a drink/beverage
      const isDrink = /\b(drink|beverage|welcome|cocktail|wine|beer|juice|coffee|tea|soda|water)\b/i.test(description);
      if (isDrink) {
        enhancedPrompt = `high quality professional beverage photography of ${description}, elegant glassware, beautiful presentation, restaurant style, soft lighting, 4k, photorealistic, appetizing drink`;
      } else {
      enhancedPrompt = `high quality professional food photography of ${description}, appetizing, beautiful presentation, restaurant style, soft lighting, 4k, photorealistic`;
      }
    } else if (isNature) {
      enhancedPrompt = `stunning landscape photography of ${description}, natural lighting, vibrant colors, high detail, scenic, breathtaking, 4k, professional photography`;
    } else if (isTravel) {
      enhancedPrompt = `beautiful travel photography of ${description}, scenic view, vibrant colors, tourist destination, professional photography, 4k, high quality`;
    } else if (isSports) {
      enhancedPrompt = `dynamic sports photography of ${description}, action shot, energetic, professional lighting, high speed capture, 4k, crisp details`;
    } else if (isTechnology) {
      enhancedPrompt = `modern technology photography of ${description}, sleek design, professional lighting, futuristic, clean background, 4k, high quality`;
    } else if (isArt) {
      enhancedPrompt = `artistic photography of ${description}, creative composition, beautiful lighting, aesthetic, inspiring, 4k, professional quality`;
    } else {
      // Generic enhancement for any other content
      enhancedPrompt = `high quality professional photography of ${description}, beautiful composition, excellent lighting, vibrant colors, 4k, photorealistic, detailed`;
    }
    
    // Use Pollinations AI API with deterministic seed for initial generation
    const seed = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=416&height=200&seed=${seed}&model=flux&enhance=true&nologo=true`;
    
    console.log('=== GENERATING AI IMAGE SYNC (NO WATERMARK) ===', {
      originalDescription: description,
      category: isFood ? 'food' : isNature ? 'nature' : isTravel ? 'travel' : isSports ? 'sports' : isTechnology ? 'technology' : isArt ? 'art' : 'generic',
      enhancedPrompt,
      aiImageUrl,
      seed,
      noWatermark: true
    });
    
    return aiImageUrl;
  }, []);
  // Helper function to test image loading with 5-second timeout
  const testImageLoad = useCallback((url) => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, 5000); // 5 second timeout for faster fallback
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = url;
    });
  }, []);



  // Simplified async image generation for remix operations (without complex retry logic)
  const generateAIImage = useCallback(async (description, cardIndex = null) => {
    console.log('=== GENERATING AI IMAGE ===', { description, cardIndex });
    
    // Rate limiting check
    if (isRemixRateLimited) {
      throw new Error('Rate limit active. Please wait before trying again.');
    }
    
    // Record attempt if cardIndex provided
    if (cardIndex !== null) {
      recordRemixAttempt(cardIndex);
    }
    
    // Detect different categories and enhance accordingly
    const isFood = /\b(food|eat|cook|dish|meal|cuisine|recipe|ingredient|snack|drink|beverage|welcome|restaurant|menu|kitchen|chef|delicious|tasty|fresh|organic)\b/i.test(description);
    const isNature = /\b(nature|landscape|forest|mountain|ocean|beach|sunset|sunrise|sky|clouds|trees|flowers|garden|park|waves|sea|river|lake)\b/i.test(description);
    const isTravel = /\b(travel|vacation|trip|destination|city|architecture|building|landmark|hotel|airport|street|culture)\b/i.test(description);
    const isSports = /\b(sport|sports|fitness|gym|exercise|running|swimming|cycling|football|basketball|tennis|yoga|workout)\b/i.test(description);
    const isTechnology = /\b(technology|tech|computer|software|digital|app|website|AI|robot|innovation|device|gadget)\b/i.test(description);
    const isArt = /\b(art|artist|painting|drawing|sculpture|gallery|museum|creative|design|illustration|artwork)\b/i.test(description);
    
    // Add specific category for home/comfort/lifestyle content
    const isHomeLifestyle = /\b(settle|home|comfort|relax|cozy|warm|comfortable|rest|peaceful|calm|tranquil|domestic|household|living|room|bedroom|lounge|sofa|couch|chair|bed|pillow|blanket|cushion|homey|homely|domestic|family|lifestyle)\b/i.test(description);
    
    let enhancedPrompt;
    
    if (isFood) {
      // Check if it's specifically a drink/beverage
      const isDrink = /\b(drink|beverage|welcome|cocktail|wine|beer|juice|coffee|tea|soda|water)\b/i.test(description);
      if (isDrink) {
        enhancedPrompt = `high quality professional beverage photography of ${description}, elegant glassware, beautiful presentation, restaurant style, soft lighting, 4k, photorealistic, appetizing drink`;
      } else {
        enhancedPrompt = `high quality professional food photography of ${description}, appetizing, beautiful presentation, restaurant style, soft lighting, 4k, photorealistic`;
      }
    } else if (isHomeLifestyle) {
      enhancedPrompt = `cozy home lifestyle photography of ${description}, warm lighting, comfortable atmosphere, domestic setting, inviting, peaceful, 4k, photorealistic, home comfort`;
    } else if (isNature) {
      enhancedPrompt = `stunning landscape photography of ${description}, natural lighting, vibrant colors, high detail, scenic, breathtaking, 4k, professional photography`;
    } else if (isTravel) {
      enhancedPrompt = `beautiful travel photography of ${description}, scenic view, vibrant colors, tourist destination, professional photography, 4k, high quality`;
    } else if (isSports) {
      enhancedPrompt = `dynamic sports photography of ${description}, action shot, energetic, professional lighting, high speed capture, 4k, crisp details`;
    } else if (isTechnology) {
      enhancedPrompt = `modern technology photography of ${description}, sleek design, professional lighting, futuristic, clean background, 4k, high quality`;
    } else if (isArt) {
      enhancedPrompt = `artistic photography of ${description}, creative composition, beautiful lighting, aesthetic, inspiring, 4k, professional quality`;
    } else {
      // Generic enhancement for any other content
      enhancedPrompt = `high quality professional photography of ${description}, beautiful composition, excellent lighting, vibrant colors, 4k, photorealistic, detailed`;
    }
    
    // Use Pollinations AI API with random seed for remix operations
    const seed = Math.floor(Math.random() * 1000000); // Always random for remix
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=416&height=200&seed=${seed}&model=flux&enhance=true&nologo=true`;
    
    // Alternative AI services for faster fallback
    const alternativeUrls = [
      `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=416&height=200&seed=${Math.floor(Math.random() * 1000000)}&model=flux&enhance=false&nologo=true`,
      `https://image.pollinations.ai/prompt/${encodeURIComponent(description)}?width=416&height=200&seed=${Math.floor(Math.random() * 1000000)}&model=flux&nologo=true`,
      `https://image.pollinations.ai/prompt/${encodeURIComponent(description)}?width=416&height=200&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`
    ];
    
    console.log('=== GENERATING AI IMAGE (NO WATERMARK) ===', {
      originalDescription: description,
      category: isFood ? 'food' : isHomeLifestyle ? 'home_lifestyle' : isNature ? 'nature' : isTravel ? 'travel' : isSports ? 'sports' : isTechnology ? 'technology' : isArt ? 'art' : 'generic',
      enhancedPrompt,
      aiImageUrl,
      seed,
      noWatermark: true
    });
    
    try {
      // Try primary AI image with 5-second timeout
      console.log('=== TRYING PRIMARY AI IMAGE ===', { aiImageUrl });
      const imageLoaded = await testImageLoad(aiImageUrl);
      if (imageLoaded) {
        console.log('=== PRIMARY AI IMAGE SUCCESS ===');
        if (cardIndex !== null) {
          resetRemixState(cardIndex);
        }
        return aiImageUrl;
      }
      
      // Try alternative AI URLs with faster timeouts
      for (let i = 0; i < alternativeUrls.length; i++) {
        const altUrl = alternativeUrls[i];
        console.log(`=== TRYING ALTERNATIVE AI IMAGE ${i + 1} ===`, { altUrl });
        
        try {
          const altImageLoaded = await testImageLoad(altUrl);
          if (altImageLoaded) {
            console.log(`=== ALTERNATIVE AI IMAGE ${i + 1} SUCCESS ===`);
            if (cardIndex !== null) {
              resetRemixState(cardIndex);
            }
            return altUrl;
          }
        } catch (altError) {
          console.warn(`=== ALTERNATIVE AI IMAGE ${i + 1} FAILED ===`, { altError });
          continue; // Try next alternative
        }
      }
      
      // All AI attempts failed, use Unsplash fallback
      throw new Error('All AI image generation attempts failed');
      
    } catch (error) {
      console.warn('=== ALL AI IMAGE GENERATION FAILED ===', { error });
      
      // Record error if cardIndex provided
      if (cardIndex !== null) {
        recordRemixError(cardIndex, error);
      }
      
      // Fast Unsplash fallback
      console.log('=== USING UNSPLASH FALLBACK ===');
      return getUnsplashFallback(description);
    }
  }, [isRemixRateLimited, recordRemixAttempt, recordRemixError, resetRemixState, testImageLoad]);

  // Helper function to get phase-specific content with festival support
  const getPhaseSpecificContent = (cardIndex) => {
    if (!selectedFlightPhase) return null;
    
    // Debug logging
    console.log('=== GET PHASE SPECIFIC CONTENT ===', {
      cardIndex,
      selectedFlightPhase,
      origin,
      destination,
      selectedDates,
      hasOrigin: !!origin,
      hasDestination: !!destination,
      themeColor,
      isFestivalTheme: isFestivalActive
    });
    
    // Always attempt to resolve festival content based on theme and segment
    const festivalContent = getPromoCardContent(
      { origin, destination },
      selectedDates,
      selectedFlightPhase,
      cardIndex,
      themeColor,
      selectedFestivalName
    );
    
    console.log('=== FESTIVAL CONTENT RESULT ===', {
      festivalContent,
      cardIndex,
      selectedFlightPhase,
      hasText: !!festivalContent?.text,
      hasImagePrompt: !!festivalContent?.image,
      text: festivalContent?.text,
      imagePrompt: festivalContent?.image
    });
    
    if (festivalContent && festivalContent.text) {
      // Generate or reuse background image for festival content
      let backgroundImage = null;
      if (festivalContent.image) {
        const routeKey = currentRouteKey || `${origin?.airport?.code || origin?.airport?.city || 'unknown'}-${destination?.airport?.code || destination?.airport?.city || 'unknown'}`;
        const pinned = selectedFestivalName || 'none';
        const cacheKey = `festival-${routeKey}-${pinned}-${selectedFlightPhase}-${cardIndex}-${festivalContent.text}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          backgroundImage = cached;
          console.log('=== USING CACHED FESTIVAL IMAGE ===', { cacheKey });
        } else {
          try {
            backgroundImage = generateAIImageSync(festivalContent.image);
            sessionStorage.setItem(cacheKey, backgroundImage);
            console.log('=== CACHED NEW FESTIVAL IMAGE ===', { cacheKey, backgroundImage });
          } catch (e) {
            console.warn('=== FESTIVAL IMAGE GENERATION FAILED, USING FALLBACK ===', e);
            backgroundImage = getUnsplashFallback(festivalContent.image);
            sessionStorage.setItem(cacheKey, backgroundImage);
          }
        }
      }
      
      if (backgroundImage) {
        detectTextColorForImage(backgroundImage, cardIndex);
      }
      
      return {
        text: festivalContent.text,
        backgroundImage,
        bgColor: getLightThemeColor()
      };
    }
    
    // Fallback to default phase content
    const phaseContent = {
      'takeoff': [
        { text: "Enjoy your welcome drink", bgColor: getLightThemeColor() },
        { text: "Relax at your seat", bgColor: getLightThemeColor() },
        { text: "Connect your device", bgColor: getLightThemeColor() }
      ],
      'climb': [
        { text: "Order food", bgColor: getLightThemeColor() },
        { text: "Offers onboard", bgColor: getLightThemeColor() },
        { text: "Latest entertainment", bgColor: getLightThemeColor() }
      ],
      'cruise': [
        { text: "Popcorn with movie", bgColor: getLightThemeColor() },
        { text: "Buy gifts", bgColor: getLightThemeColor() },
        { text: "Latest entertainment", bgColor: getLightThemeColor() }
      ],
      'descent': [
        { text: "Buy guides at discont", bgColor: getLightThemeColor() },
        { text: "Buy gifts", bgColor: getLightThemeColor() },
        { text: "Save on your next flight", bgColor: getLightThemeColor() }
      ],
      'landing': [
        { text: "Buy guides at discont", bgColor: getLightThemeColor() },
        { text: "Buy gifts", bgColor: getLightThemeColor() },
        { text: "Save on your next flight", bgColor: getLightThemeColor() }
      ]
    };
    
    const content = phaseContent[selectedFlightPhase];
    return content && content[cardIndex] ? content[cardIndex] : null;
  };

  // Helper function to get phase-specific image keywords for AI generation
  const getPhaseSpecificImageKeyword = (cardIndex) => {
    if (!selectedFlightPhase) return null;
    
    const phaseImageKeywords = {
      'takeoff': [
        "croissants", // croissants
        "meal", // meal
        "movie" // movie
      ],
      'climb': [
        "meal", // meal
        "offers", // offers
        "movie" // movie
      ],
      'cruise': [
        "popcorn", // popcorn
        "gifts", // gifts
        "movie" // movie
      ],
      'descent': [
        "get your guide", // get your guide
        "gifts", // gifts
        "flight ticket offer" // flight ticket offer
      ],
      'landing': [
        "get your guide", // get your guide
        "gifts", // gifts
        "flight ticket offer" // flight ticket offer
      ]
    };
    
    const keywords = phaseImageKeywords[selectedFlightPhase];
    return keywords && keywords[cardIndex] ? keywords[cardIndex] : null;
  };

  // Preload images for a specific flight phase to improve navigation performance
  const preloadPhaseImages = useCallback(async (flightPhase) => {
    console.log('=== PRELOADING PHASE IMAGES ===', { flightPhase });
    
    const imageKeywords = [
      getPhaseSpecificImageKeyword(0),
      getPhaseSpecificImageKeyword(1),
      getPhaseSpecificImageKeyword(2)
    ].filter(Boolean);
    
    for (let i = 0; i < imageKeywords.length; i++) {
      const imageKeyword = imageKeywords[i];
      const cacheKey = `${flightPhase}-${i}-${imageKeyword}`;
      
      // Only preload if not already cached
      if (!sessionStorage.getItem(cacheKey)) {
        try {
          const aiImageUrl = generateAIImageSync(imageKeyword);
          sessionStorage.setItem(cacheKey, aiImageUrl);
          console.log('=== PRELOADED IMAGE ===', { cacheKey, aiImageUrl });
        } catch (error) {
          console.error('=== PRELOAD FAILED ===', { error, imageKeyword });
          const fallbackUrl = getUnsplashFallback(imageKeyword);
          sessionStorage.setItem(cacheKey, fallbackUrl);
        }
      }
    }
  }, [generateAIImageSync, getPhaseSpecificImageKeyword, getUnsplashFallback]);

  // Preload images when flight phase changes
  useEffect(() => {
    if (selectedFlightPhase) {
      preloadPhaseImages(selectedFlightPhase);
    }
  }, [selectedFlightPhase, preloadPhaseImages]);

  // Helper function for default card content
  const getDefaultCardContent = (cardIndex) => {
    // If a flight phase is selected, show phase-specific content
    if (selectedFlightPhase) {
      const phaseContent = getPhaseSpecificContent(cardIndex);
      if (phaseContent) {
        return phaseContent;
      }
      // Fallback to generic phase text if no specific content
      const phaseText = `add experiences for ${selectedFlightPhase.charAt(0).toUpperCase() + selectedFlightPhase.slice(1)}`;
      return { text: phaseText, bgColor: getLightThemeColor() };
    }
    
    // Default content when no flight phase is selected
    const defaultContent = [
      { text: "Enjoy your welcome drink", bgColor: getLightThemeColor() },
      { text: "Relax at your seat", bgColor: getLightThemeColor() },
      { text: "Connect your device", bgColor: getLightThemeColor() }
    ];
    
    return defaultContent[cardIndex] || defaultContent[0];
  };



  // Handle remix image generation with 5-second guarantee
  useEffect(() => {
    // Check for cards that need remix image generation
    Object.entries(promoCardContents).forEach(([cardIndex, content]) => {
      if (content?.remixCount > 0 && content?.image && !content?.backgroundImage) {
        console.log('=== TRIGGERING REMIX IMAGE GENERATION ===', { cardIndex, content });
        
        // Set a 5-second timeout to clear loading state
        const loadingTimeout = setTimeout(() => {
          console.log('=== LOADING TIMEOUT REACHED ===', { cardIndex });
          // Force clear loading state after 5 seconds
          const element = document.getElementById(`node-82_3581${4 + parseInt(cardIndex)}`);
          if (element) {
            // Apply fallback image if no AI image loaded
            const fallbackUrl = getUnsplashFallback(content.image);
            element.style.backgroundImage = `url(${fallbackUrl})`;
          }
        }, 5000);
        
        // Generate AI image asynchronously
        generateAIImage(content.image, parseInt(cardIndex)).then(newImageUrl => {
          console.log('=== REMIX IMAGE GENERATED ===', { cardIndex, newImageUrl });
          clearTimeout(loadingTimeout); // Clear timeout if image loads successfully
          
          // Update the DOM element directly
          const element = document.getElementById(`node-82_3581${4 + parseInt(cardIndex)}`);
          if (element && newImageUrl) {
            element.style.backgroundImage = `url(${newImageUrl})`;
          }
        }).catch(error => {
          console.error('=== REMIX IMAGE GENERATION FAILED ===', { cardIndex, error });
          clearTimeout(loadingTimeout); // Clear timeout on error
        });
      }
    });
  }, [promoCardContents, generateAIImage]);



  // Helper function to render a single card with original styling
  const renderCard = (originalCardIndex, displayPosition) => {
    // Pre-calculate card content to avoid infinite loops
    const cardContent = (() => {
      console.log('=== GENERATING CARD CONTENT ===', { 
        cardIndex: originalCardIndex, 
        promoCardContents, 
        hasContent: !!promoCardContents[originalCardIndex],
        isUpdated: promoCardContents[originalCardIndex]?.updated,
        isRemix: promoCardContents[originalCardIndex]?.remixCount > 0,
        remixCount: promoCardContents[originalCardIndex]?.remixCount || 0,
        currentRouteKey,
        isModifyClicked,
        themeColor,
        isFestivalTheme: isFestivalActive
      });
      
      // Check for route-specific saved content first (highest priority)
      if (currentRouteKey && promoCardContents[currentRouteKey] && promoCardContents[currentRouteKey][originalCardIndex]) {
        const savedContent = promoCardContents[currentRouteKey][originalCardIndex];
        console.log('=== FOUND ROUTE-SPECIFIC SAVED CONTENT ===', savedContent);
        
        // For remix operations, return existing content and let useEffect handle image generation
        if (savedContent.remixCount > 0) {
          console.log('=== REMIX OPERATION DETECTED ===', { remixCount: savedContent.remixCount });
          
          return {
            text: savedContent.text,
            backgroundImage: savedContent.backgroundImage, // Keep existing image for now
            bgColor: getLightThemeColor()
          };
        }
        
        // For regular saved content, use existing image or generate new one
        let backgroundImage = savedContent.backgroundImage;
        if (!backgroundImage && savedContent.image) {
          // Check if we have a cached image for this user content
          const userCacheKey = `user-${currentRouteKey}-${originalCardIndex}-${savedContent.image}`;
          const cachedUserImage = sessionStorage.getItem(userCacheKey);
          
          if (cachedUserImage) {
            backgroundImage = cachedUserImage;
          } else {
            try {
              backgroundImage = generateAIImageSync(savedContent.image);
              sessionStorage.setItem(userCacheKey, backgroundImage);
            } catch (error) {
              backgroundImage = getUnsplashFallback(savedContent.image);
              sessionStorage.setItem(userCacheKey, backgroundImage);
            }
          }
        }
        
        if (backgroundImage) {
          detectTextColorForImage(backgroundImage, originalCardIndex);
        }
        
        return {
          text: savedContent.text,
          backgroundImage: backgroundImage,
          bgColor: getLightThemeColor()
        };
      }
      
      // If no saved content, check for festival content (second priority)
      // Gate on route modified flag so only the route where user saved shows festival content
      if (selectedFlightPhase && isFestivalActive && isModifyClicked) {
        console.log('=== FESTIVAL THEME ACTIVE, CHECKING FESTIVAL CONTENT ===', {
          cardIndex: originalCardIndex,
          themeColor,
          selectedFlightPhase,
          isFestivalTheme: isFestivalActive,
          currentRouteKey,
          isModifyClicked
        });
        
        const festivalContent = getPhaseSpecificContent(originalCardIndex);
        console.log('=== FESTIVAL CONTENT FROM GET PHASE SPECIFIC ===', {
          cardIndex: originalCardIndex,
          festivalContent,
          hasContent: !!festivalContent,
          hasText: !!festivalContent?.text,
          hasBackgroundImage: !!festivalContent?.backgroundImage,
          text: festivalContent?.text
        });
        
        if (festivalContent) {
          console.log('=== USING FESTIVAL CONTENT ===', {
            cardIndex: originalCardIndex,
            festivalContent,
            returningText: festivalContent.text,
            returningBackgroundImage: festivalContent.backgroundImage
          });
          return festivalContent;
        } else {
          console.log('=== NO FESTIVAL CONTENT FOUND ===', {
            cardIndex: originalCardIndex,
            themeColor,
            selectedFlightPhase
          });
        }
      }
      

      
      // Default state - no images for unmodified routes
      return { text: "Add experience", bgColor: getLightThemeColor() };
    })();
    const imageDescription = promoCardContents[originalCardIndex]?.image || 'default';
    
    // Get card type mapping
    const cardTypeMap = {
      0: { type: 'shopping', name: 'croissants at 4€', id: 'node-82_35814' },
      1: { type: 'meal', name: 'autumn meal', id: 'node-82_35815' },
      2: { type: 'movie', name: 'add an autumn movie', id: 'node-82_35816' }
    };
    
    const cardInfo = cardTypeMap[originalCardIndex];
    const isDragging = draggedCardIndex === displayPosition;
    const isDragOver = dragOverIndex === displayPosition;
    
    const cardStyle = {
      width: '416px', 
      background: cardContent.bgColor,
      backgroundImage: cardContent.backgroundImage ? `url(${cardContent.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      transform: isDragging ? 'rotate(5deg)' : 'none',
      border: 'none',
      opacity: isDragging ? 0.8 : 1,
      cursor: 'grab',
      transition: 'transform 0.2s ease, opacity 0.2s ease'
    };

    // Handle AI image loading with fallback
    if (cardContent.backgroundImage && typeof cardContent.backgroundImage === 'string' && cardContent.backgroundImage.includes('pollinations.ai')) {
      const testImg = new Image();
      testImg.onload = () => {
        console.log('=== AI IMAGE LOADED SUCCESSFULLY ===', cardContent.backgroundImage);
      };
      testImg.onerror = () => {
        console.warn('=== AI IMAGE FAILED, TRYING FALLBACK ===', cardContent.backgroundImage);
        
        // Automatically switch to Unsplash fallback
        const fallbackUrl = getUnsplashFallback(imageDescription);
        console.log('=== APPLYING FALLBACK IMAGE ===', fallbackUrl);
        
        // Update the element's background immediately
        const element = document.getElementById(cardInfo.id);
        if (element) {
          element.style.backgroundImage = `url(${fallbackUrl})`;
        }
      };
      testImg.src = cardContent.backgroundImage;
    }

    return (
      <div
        key={`card-${originalCardIndex}-${displayPosition}`}
        draggable
        className="bg-black h-[200px] overflow-clip relative rounded-lg shrink-0 flex items-center justify-center"
        style={cardStyle}
        data-name={cardInfo.name}
        data-card-index={originalCardIndex}
        id={cardInfo.id}
        onDragStart={(e) => handleDragStart(e, displayPosition)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, displayPosition)}
        onDragEnter={(e) => handleDragEnter(e, displayPosition)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, displayPosition)}
        onMouseEnter={(e) => {
          if (isPromptMode && onPromptHover) {
            onPromptHover(true, 'promo-card', { cardIndex: originalCardIndex, cardType: cardInfo.type }, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseLeave={(e) => {
          if (isPromptMode && onPromptHover) {
            onPromptHover(false, 'promo-card', { cardIndex: originalCardIndex, cardType: cardInfo.type }, { x: e.clientX, y: e.clientY });
          }
        }}
        onMouseMove={(e) => {
          if (isPromptMode && onPromptHover) {
            onPromptHover(true, 'promo-card', { cardIndex: originalCardIndex, cardType: cardInfo.type }, { x: e.clientX, y: e.clientY });
          }
        }}
        onClick={(e) => {
          console.log('=== CARD CLICK ===', { originalCardIndex, displayPosition, cardInfo, colorPromptClosedWithoutSave });
          if (isPromptMode && onPromptClick) {
            e.stopPropagation();
            onPromptClick('promo-card', { cardIndex: originalCardIndex, cardType: cardInfo.type }, { x: e.clientX, y: e.clientY });
          }
        }}
      >
        {getAnimatedBorderOverlay(originalCardIndex)}
        
          {/* Enhanced loading overlay for remix operations */}
          {promoCardContents[originalCardIndex]?.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10">
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                {remixAttempts[originalCardIndex] > 1 && (
                  <span className="text-xs opacity-75">Attempt {remixAttempts[originalCardIndex]}/3</span>
                )}
              </div>
            </div>
          )}
          
          {/* Error state overlay */}
          {remixErrors[originalCardIndex] >= 3 && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 rounded-lg z-10">
              <div className="flex flex-col items-center gap-2 text-white">
                <span className="text-sm font-medium">Generation failed</span>
                <span className="text-xs opacity-75">Using fallback image</span>
              </div>
            </div>
          )}
          
          {/* Rate limit overlay */}
          {isRemixRateLimited && promoCardContents[originalCardIndex]?.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-yellow-500 bg-opacity-50 rounded-lg z-10">
              <div className="flex flex-col items-center gap-2 text-white">
                <span className="text-sm font-medium">Rate limited</span>
                <span className="text-xs opacity-75">Please wait...</span>
              </div>
            </div>
          )}
        {promptStates[`promo-card-${originalCardIndex}`] && !middleCardPromptClosed ? (
          <div className="relative h-full w-full">
            {/* Drag handle */}
            <div className="absolute top-2 left-2 z-20 cursor-grab">
              <div className="w-6 h-6 bg-white bg-opacity-80 rounded flex items-center justify-center">
                <div className="flex flex-col gap-0.5">
                  <div className="w-3 h-0.5 bg-gray-600"></div>
                  <div className="w-3 h-0.5 bg-gray-600"></div>
                  <div className="w-3 h-0.5 bg-gray-600"></div>
                </div>
              </div>
            </div>
            
            {cardContent.backgroundImage && (
              <img 
                src={cardContent.backgroundImage}
                alt="Background" 
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
            
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
                {cardContent.text}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full">
            {/* Drag handle */}
            <div className="absolute top-2 left-2 z-20 cursor-grab">
              <div className="w-6 h-6 bg-white bg-opacity-80 rounded flex items-center justify-center">
                <div className="flex flex-col gap-0.5">
                  <div className="w-3 h-0.5 bg-gray-600"></div>
                  <div className="w-3 h-0.5 bg-gray-600"></div>
                  <div className="w-3 h-0.5 bg-gray-600"></div>
                </div>
              </div>
            </div>
            
            {cardContent.backgroundImage && (
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
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
                {cardContent.text}
              </p>
            </div>
            
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{gradientAnimationCSS}</style>
      <div
        className="flex flex-row gap-8 items-center justify-center mx-auto"
        style={{ width: '1302px' }}
        data-name="3-cards"
        id="node-82_36633"
      >
      {showAllSkeletons ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          {/* Render cards based on cardOrder for drag-drop functionality */}
          {cardOrder.map((originalCardIndex, displayPosition) => 
            renderCard(originalCardIndex, displayPosition)
          )}
        </>
      )}
      </div>
    </>
  );
}