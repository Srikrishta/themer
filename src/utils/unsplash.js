// Helper function to get Pollinations AI generated images for content cards and promo cards
export const getPollinationsImage = (description, themeColor = null) => {
  console.log('=== GETTING POLLINATIONS AI IMAGE ===', { description, themeColor });
  
  // Clean and optimize the description for AI image generation
  const cleanDescription = description
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  // Create a more detailed prompt for better image generation
  let enhancedPrompt = `high quality, professional, ${cleanDescription}, modern, clean, 4k resolution`;
  
  // Add theme color background for smartphone device images
  if (themeColor && cleanDescription.includes('smartphone device')) {
    // Convert hex color to a more descriptive color name for AI
    const colorName = getColorName(themeColor);
    enhancedPrompt = `high quality, professional, ${cleanDescription}, ${colorName} background, modern, clean, 4k resolution`;
  }
  
  // Pollinations AI API endpoint
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=416&height=200&nologo=true&seed=${Math.abs(description.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}`;
  
  console.log('=== POLLINATIONS AI URL GENERATED ===', { 
    originalDescription: description,
    cleanDescription,
    enhancedPrompt,
    themeColor,
    pollinationsUrl 
  });
  
  return pollinationsUrl;
};

// Helper function to convert hex color to descriptive color name
const getColorName = (hexColor) => {
  const colorMap = {
    '#1E1E1E': 'dark gray',
    '#0A1D3D': 'dark blue',
    '#CB0300': 'red',
    '#1E72AE': 'blue',
    '#2563eb': 'blue',
    '#EF4444': 'red',
    '#10B981': 'green',
    '#F59E0B': 'orange',
    '#8B5CF6': 'purple',
    '#EC4899': 'pink',
    '#06B6D4': 'cyan',
    '#84CC16': 'lime',
    '#F97316': 'orange',
    '#EF4444': 'red',
    '#6366F1': 'indigo',
    '#14B8A6': 'teal',
    '#F59E0B': 'amber',
    '#DC2626': 'red',
    '#059669': 'emerald',
    '#7C3AED': 'violet'
  };
  
  return colorMap[hexColor] || 'colored';
};

// Legacy function name for backward compatibility - now uses Pollinations AI
export const getUnsplashFallback = (description) => {
  return getPollinationsImage(description);
};