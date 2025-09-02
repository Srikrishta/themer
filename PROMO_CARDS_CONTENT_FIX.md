# Promo Cards Content Fix

## Problem
The promo cards were showing default content immediately when the user clicked "Add" on the flight card, instead of only showing content after the user clicked "Save" on the color changing prompt bubble.

## Root Cause
The promo cards content logic in `Component3Cards.js` was checking multiple conditions to show content:
- `middleCardPromptClosed && cruiseLabelShown && isModifyClicked`
- `selectedFlightPhase`
- `isModifyClicked && currentRouteKey`

The issue was that these conditions were too broad and were showing content based on flight phases or route modification status, rather than checking if the current route has actually been saved with content in `promoCardContents[currentRouteKey]`.

## Solution
Modified the content display logic to only show promo card content after the user has saved their color selection for the current route:

```javascript
// Only show content after user has saved the color selection for the current route
if (currentRouteKey) {
  // Check if we have route-specific content from the save action
  const routeContents = promoCardContents[currentRouteKey];
  if (routeContents && routeContents[originalCardIndex]) {
    const savedContent = routeContents[originalCardIndex];
    return {
      text: savedContent.text,
      backgroundImage: savedContent.image ? getUnsplashFallback(savedContent.image) : null,
      bgColor: getLightThemeColor()
    };
  }
}
```

## Key Changes
1. **Primary Condition**: Changed to only check `currentRouteKey` (removed global state dependencies)
2. **Route-Specific Check**: Only show content if the current route has saved content in `promoCardContents[currentRouteKey]`
3. **Content Priority**: First check for saved content from the route-specific `promoCardContents`
4. **Removed All Fallbacks**: Eliminated phase-specific content and images that were showing before save
5. **No Premature Content**: Promo cards show empty state until theme is saved

## Result
Now the promo cards:
- Show no content initially when the user clicks "Add" on the flight card
- Only display content after the user clicks "Save" on the color changing prompt bubble for the current route
- Display the saved content from the route-specific storage
- Do not show content for other routes until they are individually saved
- Do not show any images or phase-specific content until the theme is saved
- Show empty/placeholder state for unsaved routes

## Files Modified
- `src/components/Component3Cards.js`: Updated the content display logic to only show content when route has saved content

## User Experience
The user flow is now:
1. Click "Add" on flight card → Promo cards show empty/placeholder state
2. Select color in prompt bubble → Promo cards remain empty
3. Click "Save" on prompt bubble → Promo cards populate with content and images for current route only
4. Navigate to different route → Promo cards show empty state until that route is saved
5. Content and images persist for each specific flight route independently
6. No premature content or images shown before theme is saved
