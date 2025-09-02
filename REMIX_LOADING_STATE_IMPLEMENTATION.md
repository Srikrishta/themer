# Remix Loading State Implementation

## Overview
Implemented a loading state for the remix button in promo card prompt bubbles. When the user clicks the remix button, it shows a loading spinner until the image is loaded, then changes back to the remix icon. When the user clicks send, the remixed image is saved for that promo card.

## Features
1. **Loading State**: Remix button shows spinning icon while image is loading
2. **Image Monitoring**: Automatically detects when the remixed image is loaded
3. **Image Saving**: Saves the remixed image when user clicks send button
4. **State Management**: Properly manages loading states and image URLs

## Implementation Details

### 1. Loading State Management
- Added `isRemixLoading` state to track remix loading status
- Added `remixedImageUrl` state to capture the generated image URL
- Loading state is set when remix button is clicked
- Loading state is cleared when image is loaded or on error

### 2. Remix Button UI
```javascript
{isRemixLoading ? (
  <div className="w-3 h-3 animate-spin">
    <ArrowPathIcon className="w-3 h-3" />
  </div>
) : (
  <ArrowPathIcon className="w-3 h-3" />
)}
```

### 3. Image Loading Detection
- Uses DOM monitoring to detect when the remixed image is loaded
- Monitors the promo card image element using `data-card-index` attribute
- Listens for `load` and `error` events on the image
- Automatically captures the image URL when loaded

### 4. Image Saving Flow
1. User clicks remix button → Loading state activated
2. Image generation triggered → Image URL captured
3. User clicks send button → Remixed image URL saved to promo card content
4. Loading state cleared and states reset

## Files Modified

### `src/components/PromptBubble.js`
- Added `isRemixLoading` and `remixedImageUrl` state
- Updated remix button to show loading spinner
- Added image loading monitoring effect
- Modified onSubmit to include remixed image URL
- Updated form submission to clear remixed image state
- **Fixed cursor positioning**: Added `lineHeight: '1.4'` to input fields and cursor elements to ensure proper vertical alignment
- **Dynamic height adjustment**: Added `contentHeight` state and `calculateRequiredHeight` function to make prompt bubble grow vertically when text content exceeds width
- **Input width constraints**: Limited input field widths to prevent horizontal overflow beyond bubble boundaries

### `src/components/Component3Cards.js`
- Added `data-card-index` attribute to promo card elements for image monitoring

### `src/components/Dashboard.js`
- Updated onSubmit handler to handle remixed image URLs
- Added support for saving remixed images to promo card content
- **Fixed text content preservation**: For remix operations, existing text content is preserved instead of being overwritten with empty content

## User Experience Flow
1. **Click Remix**: Remix button shows spinning icon
2. **Image Loading**: Loading state persists until image loads
3. **Image Loaded**: Remix button returns to normal state
4. **Click Send**: Remixed image is saved to the promo card
5. **State Reset**: All states cleared for next interaction
6. **Text Preservation**: Promo card title/text remains visible throughout the remix process
7. **Dynamic Sizing**: Prompt bubble automatically grows vertically when user enters long text, preventing horizontal overflow

## Technical Notes
- Uses DOM event listeners for image loading detection
- Maintains backward compatibility with existing remix functionality
- Properly handles error cases (image load failures)
- Cleans up event listeners to prevent memory leaks
- Integrates with existing promo card content management system
- **Text Content Logic**: For remix operations (`options.isRemix`), existing text content is preserved using `existingContent.text` instead of parsed `textContent`
- **Height Calculation**: Uses `calculateRequiredHeight` function to compute optimal bubble height based on text content length and available width
- **Width Constraints**: Input fields are constrained to `bubbleWidth - 60` pixels to prevent overflow

## Error Handling
- Image load errors clear the loading state
- Fallback to existing image if remix fails
- Graceful degradation if DOM elements not found
- Proper cleanup of event listeners
- **Text Content Preservation**: Existing text content is preserved during remix operations to prevent title disappearance
- **Cursor Alignment**: Fixed cursor positioning to align properly with input text by ensuring consistent line heights
- **Text Overflow Prevention**: Dynamic height calculation prevents text from extending beyond bubble boundaries by growing vertically instead of horizontally

## Future Enhancements
- Add timeout for image loading
- Show progress indicators for long loading times
- Add retry functionality for failed image loads
- Implement image caching for better performance
