# Promo Cards Image Generation Test

## Issue Description
When the user clicks save on color changing prompt bubble, and opens the color changing prompt bubble again and saves a new color, the promo cards for takeoff are not having images. Just the takeoff phase promo cards.

## Root Cause
The promo card contents were being updated with new text and image prompts when the color was saved, but the actual background images were not being generated automatically.

## Fix Applied
1. Modified `generateAIImageSync` function in Dashboard.js to handle promo card image prompts (drink, home, device categories)
2. Updated `getUnsplashFallback` function to include fallback images for promo card categories
3. Added async image generation logic in Dashboard.js when color is saved
4. Images are generated one by one with a small delay to avoid rate limiting
5. Each card is updated individually as images are generated

## Test Steps
1. Open the application
2. Click on the flight journey bar to open color prompt bubble
3. Select a color and click save
4. Verify that promo cards show images:
   - Card 1: "Enjoy your welcome drink" should show a drink image
   - Card 2: "Feel at home" should show a home/comfort image  
   - Card 3: "Connect your device" should show a device/technology image
5. Open color prompt bubble again and save a different color
6. Verify that promo cards still show images with the new color

## Expected Behavior
- Promo cards should display relevant images immediately after color is saved
- Images should be appropriate for the content (drink, home, device)
- If AI image generation fails, fallback Unsplash images should be used
- Images should persist when color is changed again

## Console Logs to Check
- "🎯 Generated image for promo card:" - should appear for each card
- "🎯 Completed generating images for promo cards:" - should appear when all done
- "=== AI IMAGE LOADED SUCCESSFULLY ===" - should appear for successful AI images
- "=== AI IMAGE FAILED, TRYING FALLBACK ===" - should appear if AI images fail
