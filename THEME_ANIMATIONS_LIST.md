# Theme Animations for City and Festive Themes

This document defines animations for city and festive themes associated with dates in the Themer application.

## Animation Types

The application supports four main animation types:
- **sparkles**: Subtle twinkling star-like elements
- **confetti**: Celebratory falling colorful pieces
- **lights**: Flickering light bulb effects
- **glow**: Pulsing glow effects around elements

## Festive Theme Animations

### 1. Festival Theme
- **Animation Type**: confetti
- **Parameters**: 40 pieces, multi-color, 3.2s duration, high intensity
- **Examples**: Rome Carnival, Carnevale Ambrosiano, Oktoberfest, Tollwood Festival, Frühlingsfest
- **Description**: Celebratory confetti animation for major festival events

### 2. Cultural Theme
- **Animation Type**: glow
- **Parameters**: Green color (#10B981), 2s duration, medium intensity, pulsing
- **Examples**: Christmas in Rome, Bastille Day, King's Day, Pride Amsterdam, Festa di Sant'Ambrogio
- **Description**: Elegant glow animation for cultural celebrations

### 3. Art Theme
- **Animation Type**: lights
- **Parameters**: 16 bulbs, multi-color, 1.8s duration, medium intensity, flickering
- **Examples**: Amsterdam Light Festival
- **Description**: Dynamic lights animation for art festivals

### 4. Fashion Theme
- **Animation Type**: sparkles
- **Parameters**: 15 sparkles, pink color (#EC4899), 1.6s duration, medium intensity, elegant
- **Examples**: Milan Fashion Week, Paris Fashion Week
- **Description**: Sophisticated sparkles with fashion colors

### 5. Music Theme
- **Animation Type**: glow
- **Parameters**: Red color (#EF4444), 1.2s duration, high intensity, rhythmic
- **Examples**: Amsterdam Dance Event
- **Description**: Rhythmic glow animation for music events

### 6. Film Theme
- **Animation Type**: lights
- **Parameters**: 12 bulbs, cinematic colors, 2.4s duration, medium intensity
- **Examples**: Rome Film Festival
- **Description**: Cinematic lights animation for film festivals

### 7. Market Theme
- **Animation Type**: glow
- **Parameters**: Pink color (#F43F5E), 2.8s duration, low intensity, warm
- **Examples**: Christmas Market
- **Description**: Warm glow animation for market events

### 8. Night Event Theme
- **Animation Type**: glow
- **Parameters**: Purple color (#581C87), 3.6s duration, low intensity, mysterious
- **Examples**: Nuit Blanche
- **Description**: Mysterious glow animation for night events

## City Theme Animations

### 1. Berlin City Theme
- **Animation Type**: sparkles
- **Parameters**: 10 sparkles, dark color (#1E1E1E), 1.8s duration, medium intensity, urban
- **Description**: Modern, urban sparkles animation

### 2. Paris City Theme
- **Animation Type**: lights
- **Parameters**: 14 bulbs, romantic colors, 2.2s duration, medium intensity
- **Description**: Romantic lights animation

### 3. Rome City Theme
- **Animation Type**: glow
- **Parameters**: Amber color (#F59E0B), 2.6s duration, medium intensity, classical
- **Description**: Classical glow animation

### 4. Milan City Theme
- **Animation Type**: sparkles
- **Parameters**: 12 sparkles, red color (#EF4444), 1.9s duration, medium intensity, elegant
- **Description**: Elegant sparkles animation

### 5. Amsterdam City Theme
- **Animation Type**: lights
- **Parameters**: 16 bulbs, creative colors, 2.0s duration, medium intensity
- **Description**: Creative lights animation

### 6. Munich City Theme
- **Animation Type**: glow
- **Parameters**: Purple color (#7C3AED), 2.4s duration, medium intensity, traditional
- **Description**: Traditional glow animation

## Seasonal Theme Animations

### 1. Winter Theme
- **Animation Type**: sparkles
- **Parameters**: 8 sparkles, cyan color (#06B6D4), 2.0s duration, low intensity
- **Description**: Cool sparkles animation

### 2. Spring Theme
- **Animation Type**: glow
- **Parameters**: Green color (#10B981), 2.2s duration, medium intensity
- **Description**: Fresh glow animation

### 3. Summer Theme
- **Animation Type**: lights
- **Parameters**: 18 bulbs, bright colors, 1.8s duration, high intensity
- **Description**: Bright lights animation

### 4. Autumn Theme
- **Animation Type**: glow
- **Parameters**: Yellow color (#FCD34D), 2.6s duration, medium intensity
- **Description**: Warm glow animation

## Default Theme
- **Animation Type**: sparkles
- **Parameters**: 8 sparkles, white color (#ffffff), 1.4s duration, subtle intensity
- **Description**: Standard theme with subtle sparkles animation

## Animation Parameters

Each animation can be customized with the following parameters:

### Sparkles
- `count`: Number of sparkle elements (8-15)
- `color`: Primary color for sparkles
- `duration`: Animation cycle duration (1.4s-2.0s)
- `intensity`: Visual intensity level (subtle/medium/high)
- `elegant`: Boolean for sophisticated styling

### Confetti
- `count`: Number of confetti pieces (40)
- `colors`: Array of colors for variety
- `duration`: Fall animation duration (3.2s)
- `intensity`: Visual intensity level (high)

### Lights
- `count`: Number of light bulbs (12-18)
- `colors`: Array of colors for bulbs
- `duration`: Flicker cycle duration (1.8s-2.4s)
- `intensity`: Visual intensity level (medium/high)
- `flicker`: Boolean for flickering effect
- `cinematic`: Boolean for film-like effects
- `romantic`: Boolean for romantic styling
- `creative`: Boolean for artistic effects

### Glow
- `color`: Primary glow color
- `duration`: Pulse cycle duration (1.2s-3.6s)
- `intensity`: Visual intensity level (low/medium/high)
- `pulse`: Boolean for pulsing effect
- `rhythm`: Boolean for rhythmic patterns
- `warm`: Boolean for warm color tones
- `mysterious`: Boolean for mysterious effects
- `classical`: Boolean for classical styling
- `traditional`: Boolean for traditional effects
- `spring`: Boolean for spring-like effects
- `autumn`: Boolean for autumn-like effects

## Implementation Notes

- All animations are implemented in `LogoAnimationOverlay.js`
- Animations are triggered based on theme selection in `Dashboard.js`
- Theme colors are coordinated with festival data from `festivals.json`
- Animations are lightweight and dependency-free for optimal performance
- Each animation type has specific CSS keyframes for smooth transitions
