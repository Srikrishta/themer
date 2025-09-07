// Utilities to pick readable text/icon color for a given background
// Uses Material's argb utilities for parsing, but computes contrast locally

import { argbFromHex } from '@material/material-color-utilities';

const WHITE_ARGB = 0xffffffff;
const BLACK_ARGB = 0xff000000;

function argbToRgb(argb) {
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return { r, g, b };
}

function relativeLuminance({ r, g, b }) {
  // sRGB to linear
  const toLinear = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatioFromArgb(a, b) {
  const la = relativeLuminance(argbToRgb(a));
  const lb = relativeLuminance(argbToRgb(b));
  const [L1, L2] = la > lb ? [la, lb] : [lb, la];
  return (L1 + 0.05) / (L2 + 0.05);
}

function extractFirstHexFromGradient(input) {
  if (typeof input !== 'string') return null;
  const hexMatch = input.match(/#([0-9a-fA-F]{6})/);
  return hexMatch ? `#${hexMatch[1]}` : null;
}

function extractAllHexFromGradient(input) {
  if (typeof input !== 'string') return [];
  const hexMatches = input.match(/#([0-9a-fA-F]{6})/g);
  return hexMatches ? hexMatches.map(match => match) : [];
}

function normalizeHex(input) {
  if (typeof input !== 'string') return null;
  // Expand 3-digit hex to 6-digit
  const short = input.match(/^#([0-9a-fA-F]{3})$/);
  if (short) {
    const s = short[1];
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`;
  }
  const long = input.match(/^#([0-9a-fA-F]{6})$/);
  return long ? `#${long[1]}` : null;
}

export function getReadableOnColor(background) {
  if (!background || typeof background !== 'string') return '#000000';

  // Handle gradients by analyzing all color stops
  if (background.includes('gradient')) {
    const hexColors = extractAllHexFromGradient(background);
    if (hexColors.length > 0) {
      // Calculate average luminance across all gradient stops
      let totalLuminance = 0;
      let validColors = 0;
      
      for (const hexColor of hexColors) {
        const normalizedHex = normalizeHex(hexColor);
        if (normalizedHex) {
          const { r, g, b } = argbToRgb(argbFromHex(normalizedHex));
          const luminance = relativeLuminance({ r, g, b });
          totalLuminance += luminance;
          validColors++;
        }
      }
      
      if (validColors > 0) {
        const avgLuminance = totalLuminance / validColors;
        // Use black text for light backgrounds (luminance > 0.5), white for dark backgrounds
        return avgLuminance > 0.5 ? '#000000' : '#FFFFFF';
      }
    }
    
    // Fallback to first color if analysis fails
    const bgCandidate = extractFirstHexFromGradient(background) || '#ffffff';
    const bgHex = normalizeHex(bgCandidate) || '#ffffff';
    const { r, g, b } = argbToRgb(argbFromHex(bgHex));
    const luminance = relativeLuminance({ r, g, b });
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
  
  // Handle solid colors
  const bgHex = normalizeHex(background) || '#ffffff';
  const bgArgb = argbFromHex(bgHex);
  const cWhite = contrastRatioFromArgb(bgArgb, WHITE_ARGB);
  const cBlack = contrastRatioFromArgb(bgArgb, BLACK_ARGB);

  // Prefer the color with higher contrast; enforce 4.5:1 target
  if (cBlack >= cWhite) {
    return cBlack >= 4.5 ? '#000000' : (cWhite > cBlack ? '#FFFFFF' : '#000000');
  }
  return cWhite >= 4.5 ? '#FFFFFF' : (cBlack > cWhite ? '#000000' : '#FFFFFF');
}

export function applyOnColorStyle(background) {
  const on = getReadableOnColor(background);
  return { color: on };
}

// Helper function to create light background color for cards (handles both solid and gradient)
export function getLightCardBackgroundColor(color, opacity = 0.1) {
  if (typeof color === 'string' && color.includes('gradient')) {
    // For gradients, use a light version of the first color in the gradient
    const hexMatch = color.match(/#([0-9a-fA-F]{6})/);
    if (hexMatch) {
      const hex = hexMatch[1];
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return `rgba(255,255,255,${opacity})`;
  } else if (color && color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return `rgba(255,255,255,${opacity})`;
}

// Function to detect dominant color from image and determine text color
export const getTextColorForImage = (imageUrl) => {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve('white'); // Default to white if no image
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas to analyze image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Sample pixels to get average color (sample every 10th pixel for performance)
        let totalR = 0, totalG = 0, totalB = 0;
        let sampleCount = 0;
        
        for (let i = 0; i < data.length; i += 40) { // RGBA = 4 bytes, sample every 10th pixel
          totalR += data[i];
          totalG += data[i + 1];
          totalB += data[i + 2];
          sampleCount++;
        }
        
        // Calculate average RGB values
        const avgR = totalR / sampleCount;
        const avgG = totalG / sampleCount;
        const avgB = totalB / sampleCount;
        
        // Calculate luminance using the same formula as getReadableOnColor
        const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
        
        // Determine text color based on luminance
        const textColor = luminance > 0.5 ? 'black' : 'white';
        
        console.log('=== IMAGE COLOR DETECTION ===', {
          imageUrl,
          avgR, avgG, avgB,
          luminance,
          textColor
        });
        
        resolve(textColor);
      } catch (error) {
        console.error('Error analyzing image color:', error);
        resolve('white'); // Default to white on error
      }
    };
    
    img.onerror = () => {
      console.error('Error loading image for color detection:', imageUrl);
      resolve('white'); // Default to white on error
    };
    
    img.src = imageUrl;
  });
};

// Function to get text color for multiple images
export const getTextColorsForImages = async (imageUrls) => {
  const colorPromises = Object.entries(imageUrls).map(async ([key, url]) => {
    const color = await getTextColorForImage(url);
    return [key, color];
  });
  
  const results = await Promise.all(colorPromises);
  return Object.fromEntries(results);
};


