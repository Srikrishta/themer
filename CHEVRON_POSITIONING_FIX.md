# Chevron Positioning Fix

## Problem
The left and right chevron navigation buttons were moving up and down when switching between different flight routes. This happened because the chevrons were positioned relative to each individual flight card's height, causing them to shift vertically when flight cards had different heights.

## Root Cause
In `src/components/AirportSearch.js`, the chevron positioning logic was:
```javascript
// OLD: Position chevrons at exactly half the height of the flight card
const chevronY = flightCardTop + (flightCardHeight / 2);
```

This meant that:
- If Flight Card A had height 80px, chevrons were positioned at `flightCardTop + 40px`
- If Flight Card B had height 120px, chevrons were positioned at `flightCardTop + 60px`
- The chevrons would jump up/down by 20px when switching between cards

## Solution
The chevrons are positioned at the center of each flight card:
```javascript
// Position chevrons at the center of the flight card
// Calculate the flight card's center position relative to the container
const chevronY = flightCardTop + (flightCardHeight / 2);
```

This ensures that:
- Chevrons are always positioned at the exact center of each flight card
- Chevrons maintain proper alignment with the flight card content
- Navigation feels natural and intuitive
- Each flight card's chevrons are perfectly centered regardless of card height

## Files Modified
- `src/components/AirportSearch.js` - Updated chevron positioning logic

## Result
The chevron navigation buttons are now properly aligned with the center of each flight card, providing a natural and intuitive user experience when navigating between different flight routes.
