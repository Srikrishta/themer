# Festival Chips Implementation

## Overview

The festival chips feature displays relevant festivals in the color-changing prompt bubble based on the selected route and dates. When users select a flight route and dates, the system automatically identifies festivals happening in the origin and destination cities during those dates and presents them as clickable color chips.

## How It Works

### 1. Data Flow

1. **Date Selection**: Users select dates in the ThemeCreator component
2. **Route Selection**: Users create flight routes with origin and destination cities
3. **Festival Detection**: The system matches selected dates with festivals in the `festivals.json` data
4. **Chip Display**: Festival chips appear in the flight-journey-bar prompt bubble

### 2. Key Components

#### `src/utils/festivalUtils.js`
- `getFestivalsForCityAndDates(city, selectedDates)`: Finds festivals for a specific city and date range
- `getFestivalsForFlightSegment(segment, selectedDates)`: Finds festivals for both origin and destination cities
- `formatFestivalChips(festivals)`: Converts festival data into chip format for UI display

#### `src/components/PromptBubble.js`
- Festival chips are integrated into the main theme chips section
- Festival chips appear mixed with other theme chips (brand, cities, gradients)
- Each chip shows the festival name, color, and location in tooltip
- Clicking a festival chip applies that festival's color as the theme
- Festival chips use the same styling as other theme chips for consistency

#### `src/components/Dashboard.js`
- Added `selectedDates` state to track selected dates
- Added `onDatesChange` callback to receive date updates from ThemeCreator
- Passes `selectedDates` to PromptBubble component

#### `src/components/ThemeCreator.js`
- Added `onDatesChange` prop to expose dates to parent Dashboard component
- Uses `useEffect` to notify Dashboard when dates change

### 3. Festival Data Structure

Festivals are stored in `src/data/festivals.json` with the following structure:

```json
{
  "month": [
    {
      "name": "Festival Name",
      "location": "City 🇨🇳",
      "startDay": 1,
      "endDay": 7,
      "color": "#HEXCODE",
      "type": "festival|cultural|art|fashion|music|film|market|night_event"
    }
  ]
}
```

### 4. User Experience

1. **Route Creation**: User creates a flight route (e.g., Paris → Amsterdam)
2. **Date Selection**: User selects travel dates (e.g., July 14th)
3. **Theme Selection**: User clicks on flight journey bar to change theme
4. **Festival Chips**: System shows relevant festivals mixed with other theme options
5. **Color Application**: User clicks festival chip to apply festival-themed colors

### 5. Supported Cities

The system currently supports festivals in:
- **Paris 🇫🇷**: Bastille Day, Fashion Week, Nuit Blanche, Christmas Market
- **Amsterdam 🇳🇱**: King's Day, Amsterdam Light Festival, Pride Amsterdam, Amsterdam Dance Event
- **Rome 🇮🇹**: Carnival, Christmas, Natale di Roma, Rome Film Festival
- **Milan 🇮🇹**: Fashion Week, Carnevale Ambrosiano, Milan Furniture Fair
- **Munich 🇩🇪**: Oktoberfest, Frühlingsfest, Tollwood Festival, Christmas Market

### 6. Testing

The implementation includes comprehensive tests in `src/utils/festivalUtils.test.js` that verify:
- Festival detection for specific cities and dates
- Flight segment festival matching
- Chip formatting functionality
- Edge cases (null inputs, empty arrays)

## Future Enhancements

1. **More Cities**: Add festivals for additional European cities
2. **Seasonal Themes**: Group festivals by season for better organization
3. **Festival Details**: Show more information about each festival on hover
4. **Custom Festivals**: Allow users to add custom festival events
5. **Festival Recommendations**: Suggest festivals based on travel preferences
