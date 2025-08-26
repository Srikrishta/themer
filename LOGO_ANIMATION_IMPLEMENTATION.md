# Logo Animation Implementation for Theme Chips

This document explains how logo animations are automatically applied when users select theme chips in the dashboard.

## Overview

When a user selects any theme chip from the color-changing prompt bubble in the dashboard, the corresponding animation is automatically applied to the logo based on the selected theme.

## Implementation Details

### 1. Theme Animation Mapping

The system uses a mapping function (`mapThemeChipToAnimation`) in `src/utils/themeAnimationMapper.js` that maps theme chip labels to specific animation types:

- **Default Theme** → `sparkles`
- **Milan Theme** → `sparkles` (elegant)
- **Paris Theme** → `lights` (romantic)
- **Rome Theme** → `glow` (classical)
- **Amsterdam Theme** → `lights` (creative)
- **Munich Theme** → `glow` (traditional)
- **Berlin Theme** → `sparkles` (urban)
- **Time of the Day** → `glow` (warm)

### 2. Festival-Specific Animations

Festival themes are mapped based on their names:

- **Carnival/Carnevale** → `confetti`
- **Oktoberfest** → `confetti`
- **Fashion Week** → `sparkles`
- **Light Festival** → `lights`
- **Dance Event** → `glow`
- **Film Festival** → `lights`
- **Christmas** → `glow`
- **Market** → `glow`
- **Pride** → `glow`
- **Bastille Day** → `glow`
- **King's Day** → `glow`
- **Nuit Blanche** → `glow`
- **Tollwood Festival** → `confetti`
- **Frühlingsfest** → `confetti`

### 3. Color-Based Fallback

If no specific theme mapping is found, the system falls back to color-based mapping:

- **Warm colors** (#F59E0B, #FCD34D) → `glow`
- **Red/Pink colors** (#EF4444, #F43F5E) → `sparkles`
- **Blue colors** (#3B82F6, #06B6D4) → `lights`
- **Green colors** (#10B981, #059669) → `glow`
- **Purple colors** (#8B5CF6, #7C3AED) → `glow`

### 4. Data Flow

1. **User clicks theme chip** in PromptBubble
2. **handleColorChange** is called with color and chip data
3. **onThemeColorChange** callback is triggered in Dashboard
4. **mapThemeChipToAnimation** determines the animation type
5. **setSelectedLogo** updates the logo with the new animation type
6. **LogoAnimationOverlay** renders the appropriate animation

### 5. Code Changes Made

#### Dashboard.js
- Added import for `mapThemeChipToAnimation`
- Added `selectedThemeChip` state
- Modified `onThemeColorChange` handler to apply logo animations
- Added debug function for testing

#### PromptBubble.js
- Modified `handleColorChange` to accept chip data
- Updated theme chip click handlers to pass chip data
- Updated color picker to pass custom color data

#### New Files Created
- `src/utils/themeAnimationMapper.js` - Animation mapping logic
- `src/data/themeAnimations.json` - Animation definitions
- `src/utils/themeAnimationMapper.test.js` - Test functions

### 6. Animation Types

The system supports four animation types:

1. **sparkles** - Subtle twinkling star-like elements
2. **confetti** - Celebratory falling colorful pieces
3. **lights** - Flickering light bulb effects
4. **glow** - Pulsing glow effects around elements

### 7. Testing

To test the implementation:

1. Open the browser console
2. Run `window.testAnimationMapping()` to test the mapping function
3. Run `window.debugAnimationMapping()` to see current state
4. Select different theme chips and observe logo animations

### 8. Usage

1. Navigate to the dashboard
2. Enter prompt mode
3. Click on the flight journey bar to open the prompt bubble
4. Select any theme chip from the color options
5. The logo will automatically display the corresponding animation

### 9. Customization

To add new theme mappings:

1. Update the `mapThemeChipToAnimation` function in `themeAnimationMapper.js`
2. Add new animation definitions to `themeAnimations.json`
3. Update the test cases in `themeAnimationMapper.test.js`

### 10. Fallback Behavior

- If no mapping is found, defaults to `sparkles` animation
- If theme color changes from ThemeCreator (not chip selection), logo animation is cleared
- Custom colors from the color picker get a generic "Custom Color" label with sparkles animation

