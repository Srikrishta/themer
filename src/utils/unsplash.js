// Helper function to get Pollinations AI generated images for content cards and promo cards
export const getPollinationsImage = (description) => {
  console.log('=== GETTING POLLINATIONS AI IMAGE ===', { description });
  
  // Clean and optimize the description for AI image generation
  const cleanDescription = description
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  // Create a more detailed prompt for better image generation
  const enhancedPrompt = `high quality, professional, ${cleanDescription}, festival theme, travel, airline, in-flight entertainment, modern, clean, vibrant colors, 4k resolution`;
  
  // Pollinations AI API endpoint
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=416&height=200&nologo=true&seed=${Math.abs(description.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}`;
  
  console.log('=== POLLINATIONS AI URL GENERATED ===', { 
    originalDescription: description,
    cleanDescription,
    enhancedPrompt,
    pollinationsUrl 
  });
  
  return pollinationsUrl;
};

// Legacy function name for backward compatibility - now uses Pollinations AI
export const getUnsplashFallback = (description) => {
  return getPollinationsImage(description);
};