// Helper function to get Unsplash fallback for content cards and promo cards
export const getUnsplashFallback = (description) => {
  console.log('=== GETTING UNSPLASH FALLBACK ===', { description });
  
  // Keyword-based mappings for content cards and promo cards
  const keywordMappings = {
    // Movies
    'movie': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    'crocodile': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    'dundee': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    // Travel guides
    'guide': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    'travel': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    // Games
    'game': 'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format',
    'gaming': 'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format',
    // Podcasts
    'podcast': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'audio': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    // Promo card categories
    'drink': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=416&h=200&fit=crop&crop=center&auto=format',
    'welcome': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=416&h=200&fit=crop&crop=center&auto=format',
    'settle': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=416&h=200&fit=crop&crop=center&auto=format',
    'home': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=416&h=200&fit=crop&crop=center&auto=format',
    'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'device': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'aircraft': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format',
    // Festival-related keywords
    'festival': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=416&h=200&fit=crop&crop=center&auto=format',
    'carnival': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=416&h=200&fit=crop&crop=center&auto=format',
    'celebration': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=416&h=200&fit=crop&crop=center&auto=format',
    'christmas': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=416&h=200&fit=crop&crop=center&auto=format',
    'fashion': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=416&h=200&fit=crop&crop=center&auto=format',
    'light': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=416&h=200&fit=crop&crop=center&auto=format',
    'art': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=416&h=200&fit=crop&crop=center&auto=format',
    'music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=416&h=200&fit=crop&crop=center&auto=format',
    'dance': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=416&h=200&fit=crop&crop=center&auto=format',
    'film': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    'cinema': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    'beer': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=416&h=200&fit=crop&crop=center&auto=format',
    'food': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=416&h=200&fit=crop&crop=center&auto=format',
    'market': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=416&h=200&fit=crop&crop=center&auto=format',
    'traditional': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=416&h=200&fit=crop&crop=center&auto=format',
    'culture': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=416&h=200&fit=crop&crop=center&auto=format',
    'design': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=416&h=200&fit=crop&crop=center&auto=format',
    'furniture': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=416&h=200&fit=crop&crop=center&auto=format',
    'birthday': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=416&h=200&fit=crop&crop=center&auto=format',
    'king': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=416&h=200&fit=crop&crop=center&auto=format',
    'spring': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=416&h=200&fit=crop&crop=center&auto=format',
    'winter': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=416&h=200&fit=crop&crop=center&auto=format',
    'autumn': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    'night': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=416&h=200&fit=crop&crop=center&auto=format',
    'electronic': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=416&h=200&fit=crop&crop=center&auto=format',
    'party': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=416&h=200&fit=crop&crop=center&auto=format',
    'entertainment': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'gift': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=416&h=200&fit=crop&crop=center&auto=format',
    'gifts': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=416&h=200&fit=crop&crop=center&auto=format',
    'offer': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=416&h=200&fit=crop&crop=center&auto=format',
    'offers': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=416&h=200&fit=crop&crop=center&auto=format',
    'discount': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=416&h=200&fit=crop&crop=center&auto=format',
    'save': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=416&h=200&fit=crop&crop=center&auto=format',
    'flight': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format',
    'ticket': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format',
    'popcorn': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=416&h=200&fit=crop&crop=center&auto=format',
    'meal': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=416&h=200&fit=crop&crop=center&auto=format',
    'croissants': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=416&h=200&fit=crop&crop=center&auto=format',
    'economy': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format',
    'class': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format',
    'relax': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=416&h=200&fit=crop&crop=center&auto=format',
    'entertainment': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'latest': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'movie': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    'movies': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format',
    'landing': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format',
    'welcome': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=416&h=200&fit=crop&crop=center&auto=format',
    'local': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    'destination': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    'stories': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format',
    'in-flight': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format',
    'flight': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format',
    'games': 'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format',
    'guides': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format',
    'podcasts': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format'
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
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=416&h=200&fit=crop&crop=center&auto=format', // movie
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=416&h=200&fit=crop&crop=center&auto=format', // guide
    'https://images.unsplash.com/photo-1518709414923-e5cf8b0ac4fe?w=416&h=200&fit=crop&crop=center&auto=format', // game
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=416&h=200&fit=crop&crop=center&auto=format', // podcast
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=416&h=200&fit=crop&crop=center&auto=format', // drink
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=416&h=200&fit=crop&crop=center&auto=format', // home
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=416&h=200&fit=crop&crop=center&auto=format', // aircraft
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=416&h=200&fit=crop&crop=center&auto=format', // festival
    'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=416&h=200&fit=crop&crop=center&auto=format', // christmas
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=416&h=200&fit=crop&crop=center&auto=format', // fashion
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=416&h=200&fit=crop&crop=center&auto=format', // art
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=416&h=200&fit=crop&crop=center&auto=format', // music
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=416&h=200&fit=crop&crop=center&auto=format', // food
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=416&h=200&fit=crop&crop=center&auto=format', // market
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=416&h=200&fit=crop&crop=center&auto=format', // gift
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=416&h=200&fit=crop&crop=center&auto=format', // offer
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=416&h=200&fit=crop&crop=center&auto=format'  // spring
  ];
  
  // Use hash of description to consistently select the same image for the same description
  let hash = 0;
  for (let i = 0; i < description.length; i++) {
    const char = description.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const imageIndex = Math.abs(hash) % fallbackImages.length;
  const selectedImage = fallbackImages[imageIndex];
  
  console.log('=== SELECTED UNSPLASH IMAGE ===', { 
    description, 
    hash, 
    imageIndex, 
    selectedImage 
  });
  
  return selectedImage;
};
