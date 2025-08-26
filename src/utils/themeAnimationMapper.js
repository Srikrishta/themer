import themeAnimationsData from '../data/themeAnimations.json';

/**
 * Maps theme chip labels to animation types
 * @param {string} chipLabel - The label of the selected theme chip
 * @param {string} chipColor - The color of the selected theme chip
 * @returns {string|null} - The animation type to apply, or null for no animation
 */
export function mapThemeChipToAnimation(chipLabel, chipColor) {
  if (!chipLabel) return null;
  
  const label = chipLabel.toLowerCase();
  
  // Map based on theme chip labels
  if (label.includes('default')) {
    return 'sparkles';
  }
  
  // City-specific themes
  if (label.includes('milan theme')) {
    return 'sparkles'; // Milan uses elegant sparkles
  }
  
  if (label.includes('paris theme')) {
    return 'lights'; // Paris uses romantic lights
  }
  
  if (label.includes('rome theme')) {
    return 'glow'; // Rome uses classical glow
  }
  
  if (label.includes('amsterdam theme')) {
    return 'lights'; // Amsterdam uses creative lights
  }
  
  if (label.includes('munich theme')) {
    return 'glow'; // Munich uses traditional glow
  }
  
  if (label.includes('berlin theme')) {
    return 'sparkles'; // Berlin uses urban sparkles
  }
  
  // Time-based themes
  if (label.includes('time of the day')) {
    return 'glow'; // Time of day uses warm glow
  }
  
  // Festival-specific themes (these come from festival data)
  if (label.includes('carnival') || label.includes('carnevale')) {
    return 'confetti';
  }
  
  if (label.includes('oktoberfest')) {
    return 'confetti';
  }
  
  if (label.includes('fashion week')) {
    return 'sparkles';
  }
  
  if (label.includes('light festival')) {
    return 'lights';
  }
  
  if (label.includes('dance event')) {
    return 'glow';
  }
  
  if (label.includes('film festival')) {
    return 'lights';
  }
  
  if (label.includes('christmas')) {
    return 'glow';
  }
  
  if (label.includes('market')) {
    return 'glow';
  }
  
  if (label.includes('pride')) {
    return 'glow';
  }
  
  if (label.includes('bastille')) {
    return 'glow';
  }
  
  if (label.includes('king\'s day')) {
    return 'glow';
  }
  
  if (label.includes('nuit blanche')) {
    return 'glow';
  }
  
  if (label.includes('tollwood')) {
    return 'confetti';
  }
  
  if (label.includes('frühlingsfest')) {
    return 'confetti';
  }
  
  // Color-based fallback mapping
  if (chipColor) {
    const color = chipColor.toLowerCase();
    if (color.includes('#f59e0b') || color.includes('#fcd34d')) {
      return 'glow'; // Warm colors -> glow
    }
    if (color.includes('#ef4444') || color.includes('#f43f5e')) {
      return 'sparkles'; // Red/pink colors -> sparkles
    }
    if (color.includes('#3b82f6') || color.includes('#06b6d4')) {
      return 'lights'; // Blue colors -> lights
    }
    if (color.includes('#10b981') || color.includes('#059669')) {
      return 'glow'; // Green colors -> glow
    }
    if (color.includes('#8b5cf6') || color.includes('#7c3aed')) {
      return 'glow'; // Purple colors -> glow
    }
  }
  
  // Default fallback
  return 'sparkles';
}

/**
 * Gets animation parameters for a specific theme chip
 * @param {string} chipLabel - The label of the selected theme chip
 * @param {string} chipColor - The color of the selected theme chip
 * @returns {object} - Animation parameters
 */
export function getAnimationParameters(chipLabel, chipColor) {
  const animationType = mapThemeChipToAnimation(chipLabel, chipColor);
  
  if (!animationType) {
    return { type: 'sparkles', parameters: { count: 8, color: '#ffffff', duration: '1.4s' } };
  }
  
  // Get parameters from themeAnimations.json
  const themeAnimations = themeAnimationsData.themeAnimations;
  
  // Try to find matching theme
  for (const [themeKey, themeData] of Object.entries(themeAnimations)) {
    if (themeData.animation.type === animationType) {
      // Check if this theme matches the chip label
      const label = chipLabel.toLowerCase();
      if (themeData.examples && themeData.examples.some(example => 
        label.includes(example.toLowerCase().replace(/\s+/g, ' '))
      )) {
        return themeData.animation;
      }
    }
  }
  
  // Return default parameters for the animation type
  switch (animationType) {
    case 'confetti':
      return {
        type: 'confetti',
        parameters: {
          count: 40,
          colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'],
          duration: '3.2s',
          intensity: 'high'
        }
      };
    case 'lights':
      return {
        type: 'lights',
        parameters: {
          count: 16,
          colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
          duration: '1.8s',
          intensity: 'medium'
        }
      };
    case 'glow':
      return {
        type: 'glow',
        parameters: {
          color: chipColor || '#10B981',
          duration: '2s',
          intensity: 'medium'
        }
      };
    case 'sparkles':
    default:
      return {
        type: 'sparkles',
        parameters: {
          count: 12,
          color: chipColor || '#ffffff',
          duration: '1.6s',
          intensity: 'medium'
        }
      };
  }
}
