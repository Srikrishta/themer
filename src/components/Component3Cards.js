import { getReadableOnColor } from '../utils/color';
import { useState, useEffect } from 'react';

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
  onCardReorder 
}) {
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
    promoCardContents
  });

  // State for takeoff phase loading
  const [takeoffLoading, setTakeoffLoading] = useState(false);
  const [loadedCards, setLoadedCards] = useState(new Set());
  
  // Drag and drop state
  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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

  // Function to generate AI image URLs with enhanced prompts
  const generateAIImage = (description) => {
    console.log('=== GENERATING AI IMAGE ===', { description });
    
    // Detect different categories and enhance accordingly
    const isFood = /\b(food|eat|cook|dish|meal|cuisine|recipe|ingredient|snack|drink|beverage|restaurant|menu|kitchen|chef|delicious|tasty|fresh|organic)\b/i.test(description);
    const isNature = /\b(nature|landscape|forest|mountain|ocean|beach|sunset|sunrise|sky|clouds|trees|flowers|garden|park)\b/i.test(description);
    const isTravel = /\b(travel|vacation|trip|destination|city|architecture|building|landmark|hotel|airport|street|culture)\b/i.test(description);
    const isSports = /\b(sport|sports|fitness|gym|exercise|running|swimming|cycling|football|basketball|tennis|yoga|workout)\b/i.test(description);
    const isTechnology = /\b(technology|tech|computer|software|digital|app|website|AI|robot|innovation|device|gadget)\b/i.test(description);
    const isArt = /\b(art|artist|painting|drawing|sculpture|gallery|museum|creative|design|illustration|artwork)\b/i.test(description);
    
    let enhancedPrompt;
    
    if (isFood) {
      enhancedPrompt = `high quality professional food photography of ${description}, appetizing, beautiful presentation, restaurant style, soft lighting, 4k, photorealistic`;
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
    
    // Use Pollinations AI API with consistent seed for same description
    const seed = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=416&height=200&seed=${seed}&model=flux&enhance=true&nologo=true`;
    
    console.log('=== GENERATING AI IMAGE (NO WATERMARK) ===', {
      originalDescription: description,
      category: isFood ? 'food' : isNature ? 'nature' : isTravel ? 'travel' : isSports ? 'sports' : isTechnology ? 'technology' : isArt ? 'art' : 'generic',
      enhancedPrompt,
      aiImageUrl,
      seed,
      noWatermark: true
    });
    
    return aiImageUrl;
  };

  // Determine card content based on animation progress, cruise label state, and user content
  const getCardContent = (cardIndex) => {
    console.log('=== GENERATING CARD CONTENT ===', { 
      cardIndex, 
      promoCardContents, 
      hasContent: !!promoCardContents[cardIndex],
      isUpdated: promoCardContents[cardIndex]?.updated,
      middleCardPromptClosed,
      cruiseLabelShown,
      animationProgress,
      selectedFlightPhase
    });

    // Priority 1: If a flight phase is selected, show flight phase content
    if (selectedFlightPhase && !promoCardContents[cardIndex]?.updated) {
      const phaseText = `add experiences for ${selectedFlightPhase.charAt(0).toUpperCase() + selectedFlightPhase.slice(1)}`;
      console.log('=== USING FLIGHT PHASE CONTENT ===', { cardIndex, selectedFlightPhase, phaseText });
      return { text: phaseText, bgColor: getLightThemeColor() };
    }

    // Priority 2: Check if this card has user-submitted content and it's marked as updated
    if (promoCardContents[cardIndex] && promoCardContents[cardIndex].updated) {
      const content = promoCardContents[cardIndex];
      console.log('=== USING CUSTOM CONTENT ===', { cardIndex, content });
      
      // Generate AI image if we have an image description
      let backgroundImage = null;
      if (content.image && content.image.trim()) {
        backgroundImage = generateAIImage(content.image);
      }
      
      return {
        text: content.text || getDefaultCardContent(cardIndex).text,
        backgroundImage: backgroundImage,
        bgColor: backgroundImage ? 'transparent' : getLightThemeColor()
      };
    }

    // Handle takeoff phase content - only show takeoff content for loaded cards
    if (selectedFlightPhase === 'takeoff' && loadedCards.has(cardIndex)) {
      const takeoffContent = [
        { 
          text: "Settle in", 
          backgroundImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=416&h=200&fit=crop&crop=center&auto=format", // Aircraft cabin
          bgColor: getLightThemeColor()
        },
        { 
          text: "Safe travels", 
          backgroundImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format", // Takeoff view
          bgColor: getLightThemeColor()
        },
        { 
          text: "Enjoy the flight", 
          backgroundImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=416&h=200&fit=crop&crop=center&auto=format", // Sky view
          bgColor: getLightThemeColor()
        }
      ];
      return takeoffContent[cardIndex] || takeoffContent[0];
    }

    // Original state logic from the previous implementation
    if (middleCardPromptClosed) {
      // When middle card prompt is closed, update both middle and left cards
      console.log('=== UPDATING CARD CONTENT ===', { cardIndex, middleCardPromptClosed });
      if (cardIndex === 0) {
        // Left card - French cuisine
        return {
          text: "Enjoy French cuisine",
          backgroundImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor()
        };
      } else if (cardIndex === 1) {
        // Middle card - Croissants
        return {
          text: "Croissants at 3€",
          backgroundImage: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor()
        };
      } else {
        // Right card - keep original content
        return {
          text: "Connect your device",
          backgroundImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor()
        };
      }
    } else if (cruiseLabelShown && !middleCardPromptClosed) {
      // When Cruise label has appeared - show "add text" (but only if middle card prompt hasn't closed)
      const cruiseContent = [
        { text: "add text", bgColor: getLightThemeColor() },
        { text: "add text", bgColor: getLightThemeColor() },
        { text: "add text", bgColor: getLightThemeColor() }
      ];
      return cruiseContent[cardIndex];
    } else if (animationProgress >= 0.20) {
      // At 20% progress - themed state
      const themedContent = [
        { text: "Welcome drink", bgColor: getLightThemeColor() },
        { text: "Settle in", bgColor: getLightThemeColor() },
        { text: "Connect your device", bgColor: getLightThemeColor() }
      ];
      return themedContent[cardIndex];
    } else if (animationProgress >= 0.05) {
      // At 5% progress - specific content with images
      const contentWithImages = [
        { 
          text: "Welcome drink", 
          backgroundImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor()
        },
        { 
          text: "Settle in", 
          backgroundImage: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor()
        },
        { 
          text: "Connect your device", 
          backgroundImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format",
          bgColor: getLightThemeColor()
        }
      ];
      return contentWithImages[cardIndex];
    } else {
      // Default state
      return { text: "Add title", bgColor: getLightThemeColor() };
    }
  };

  // Helper function for default card content
  const getDefaultCardContent = (cardIndex) => {
    // If a flight phase is selected, show "add experiences for [phase]"
    if (selectedFlightPhase) {
      const phaseText = `add experiences for ${selectedFlightPhase.charAt(0).toUpperCase() + selectedFlightPhase.slice(1)}`;
      return { text: phaseText, bgColor: getLightThemeColor() };
    }
    
    // Default content when no flight phase is selected
    const defaultContent = [
      { text: "croissants at 4€", bgColor: getLightThemeColor() },
      { text: "autumn meal", bgColor: getLightThemeColor() },
      { text: "add an autumn movie", bgColor: getLightThemeColor() }
    ];
    
    return defaultContent[cardIndex] || defaultContent[0];
  };

  // Helper function to render a single card with original styling
  const renderCard = (originalCardIndex, displayPosition) => {
    const cardContent = getCardContent(originalCardIndex);
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
      border: isDragOver ? '3px dashed #3b82f6' : 'none',
      opacity: isDragging ? 0.8 : 1,
      cursor: 'grab',
      transition: 'transform 0.2s ease, opacity 0.2s ease'
    };

    // Handle AI image loading with fallback
    if (cardContent.backgroundImage && cardContent.backgroundImage.includes('pollinations.ai')) {
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
          console.log('=== CARD CLICK ===', { originalCardIndex, displayPosition, cardInfo });
          if (isPromptMode && onPromptClick) {
            e.stopPropagation();
            onPromptClick('promo-card', { cardIndex: originalCardIndex, cardType: cardInfo.type }, { x: e.clientX, y: e.clientY });
          }
        }}
      >
        {getAnimatedBorderOverlay(originalCardIndex)}
        
        {/* Special handling for special prompt states */}
        {promptStates[`promo-card-${originalCardIndex}`] && !middleCardPromptClosed ? (
          <div className="relative h-full w-full">
            {cardContent.backgroundImage && (
              <img 
                src={cardContent.backgroundImage}
                alt="Background" 
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
              <p className="block text-center font-semibold" style={{ 
                fontSize: '24px', 
                lineHeight: '32px', 
                margin: 0,
                opacity: 0.7,
                color: cardContent.backgroundImage ? 'white' : getReadableOnColor(cardContent.bgColor)
              }}>
                {cardContent.text}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full flex items-center justify-center">
            {cardContent.backgroundImage && (
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
            )}
            <p className="block text-center font-semibold relative z-10" 
               style={{ 
                 fontSize: '24px', 
                 lineHeight: '32px', 
                 margin: 0,
                 opacity: 0.7,
                 color: cardContent.backgroundImage ? 'white' : getReadableOnColor(cardContent.bgColor)
               }}>
              {cardContent.text}
            </p>
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