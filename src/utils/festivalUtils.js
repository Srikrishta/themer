import festivalsData from '../data/festivals.json';
import { getFestivalContent, getFestivalCardContent, defaultContent } from '../data/festivalContent.js';

// Function to get festivals for a specific city and date range
export const getFestivalsForCityAndDates = (city, selectedDates) => {
  console.log('=== GET FESTIVALS FOR CITY AND DATES ===', {
    city,
    selectedDates,
    hasCity: !!city,
    hasDates: !!selectedDates && selectedDates.length > 0
  });
  
  if (!city || !selectedDates || selectedDates.length === 0) {
    console.log('=== NO CITY OR DATES ===', { city, selectedDates });
    return [];
  }

  const festivals = [];
  const cityLower = city.toLowerCase();
  
  console.log('=== PROCESSING DATES ===', { cityLower, selectedDates });

  // Check each selected date for festivals
  selectedDates.forEach(dateString => {
    const [year, month, day] = dateString.split('-');
    const monthName = new Date(year, month - 1, day).toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const dayOfMonth = parseInt(day, 10);
    
    console.log('=== PROCESSING DATE ===', {
      dateString,
      year,
      month,
      day,
      monthName,
      dayOfMonth
    });
    
    const monthFestivals = festivalsData[monthName];
    console.log('=== MONTH FESTIVALS ===', {
      monthName,
      monthFestivals,
      hasFestivals: !!monthFestivals,
      allFestivalsData: Object.keys(festivalsData),
      septemberFestivals: festivalsData.september
    });
    
    if (monthFestivals) {
      monthFestivals.forEach(festival => {
        console.log('=== CHECKING FESTIVAL ===', {
          festival,
          location: festival.location,
          cityLower,
          locationIncludesCity: festival.location.toLowerCase().includes(cityLower),
          dayOfMonth,
          startDay: festival.startDay,
          endDay: festival.endDay,
          inRange: dayOfMonth >= festival.startDay && dayOfMonth <= festival.endDay
        });
        
        // Check if festival location matches the city
        if (festival.location.toLowerCase().includes(cityLower)) {
          // Check if the day falls within the festival date range
          if (dayOfMonth >= festival.startDay && dayOfMonth <= festival.endDay) {
            console.log('=== FESTIVAL MATCH FOUND ===', { festival });
            festivals.push(festival);
          }
        }
      });
    }
  });

  // Remove duplicates based on festival name
  const uniqueFestivals = festivals.filter((festival, index, self) => 
    index === self.findIndex(f => f.name === festival.name)
  );
  
  console.log('=== FINAL CITY FESTIVALS ===', {
    festivals,
    uniqueFestivals,
    count: uniqueFestivals.length
  });

  return uniqueFestivals;
};

// Function to get festivals for a flight segment (origin and destination)
export const getFestivalsForFlightSegment = (segment, selectedDates) => {
  console.log('=== GET FESTIVALS FOR FLIGHT SEGMENT ===', {
    segment,
    selectedDates,
    hasSegment: !!segment,
    hasDates: !!selectedDates && selectedDates.length > 0
  });
  
  if (!segment || !selectedDates || selectedDates.length === 0) {
    console.log('=== NO SEGMENT OR DATES ===', { segment, selectedDates });
    return [];
  }

  const originCity = segment.origin?.airport?.city;
  const destCity = segment.destination?.airport?.city;
  
  console.log('=== CITIES ===', { originCity, destCity });

  const originFestivals = originCity ? getFestivalsForCityAndDates(originCity, selectedDates) : [];
  const destFestivals = destCity ? getFestivalsForCityAndDates(destCity, selectedDates) : [];
  
  console.log('=== FESTIVALS BY CITY ===', {
    originFestivals,
    destFestivals,
    originCity,
    destCity
  });

  // Combine and remove duplicates
  const allFestivals = [...originFestivals, ...destFestivals];
  const uniqueFestivals = allFestivals.filter((festival, index, self) => 
    index === self.findIndex(f => f.name === festival.name)
  );
  
  console.log('=== FINAL FESTIVALS ===', {
    allFestivals,
    uniqueFestivals,
    count: uniqueFestivals.length
  });

  return uniqueFestivals;
};

// Function to format festival chip data for the prompt bubble
export const formatFestivalChips = (festivals) => {
  return festivals.map(festival => ({
    id: festival.name.toLowerCase().replace(/\s+/g, '-'),
    label: festival.name,
    color: festival.color,
    type: festival.type,
    location: festival.location,
    isFestival: true
  }));
};

// Function to get the primary festival for a flight segment (for content selection)
export const getPrimaryFestival = (segment, selectedDates, themeColor = null, selectedFestivalName = null) => {
  console.log('=== GET PRIMARY FESTIVAL ===', {
    segment,
    selectedDates,
    themeColor,
    hasSegment: !!segment,
    hasDates: !!selectedDates && selectedDates.length > 0
  });
  
  const festivals = getFestivalsForFlightSegment(segment, selectedDates);
  
  console.log('=== FESTIVALS FOR SEGMENT ===', {
    festivals,
    count: festivals.length,
    firstFestival: festivals.length > 0 ? festivals[0] : null
  });
  
  // If a specific festival was selected, pin to it regardless of color tweaks
  if (selectedFestivalName && festivals.length > 0) {
    const pinned = festivals.find(f => f.name === selectedFestivalName);
    if (pinned) {
      console.log('=== USING PINNED FESTIVAL ===', { selectedFestivalName, pinned });
      return pinned;
    }
  }

  // If a theme color is provided, try to find the matching festival
  if (themeColor && festivals.length > 0) {
    const matchingFestival = festivals.find(festival => festival.color === themeColor);
    if (matchingFestival) {
      console.log('=== FOUND MATCHING FESTIVAL BY COLOR ===', {
        themeColor,
        matchingFestival: matchingFestival.name,
        location: matchingFestival.location
      });
      return matchingFestival;
    }
  }
  
  // Return the first festival found, or null if none
  return festivals.length > 0 ? festivals[0] : null;
};

// Function to get promo card content based on festival and flight phase
export const getPromoCardContent = (segment, selectedDates, flightPhase, cardIndex = 0, themeColor = null, selectedFestivalName = null) => {
  const primaryFestival = getPrimaryFestival(segment, selectedDates, themeColor, selectedFestivalName);
  
  console.log('=== GET PROMO CARD CONTENT ===', {
    primaryFestival,
    primaryFestivalName: primaryFestival?.name,
    primaryFestivalLocation: primaryFestival?.location,
    flightPhase,
    cardIndex
  });
  
  if (primaryFestival) {
    const content = getFestivalCardContent(primaryFestival.name, flightPhase, 'promo', cardIndex);
    console.log('=== FESTIVAL CARD CONTENT RESULT ===', {
      festivalName: primaryFestival.name,
      flightPhase,
      cardIndex,
      content,
      hasContent: !!content
    });
    if (content) {
      return content;
    }
  }
  
  // Fallback to default content
  return defaultContent[flightPhase]?.promo[cardIndex] || null;
};

// Function to get content card content based on festival and flight phase
export const getContentCardContent = (segment, selectedDates, flightPhase, cardIndex = 0, themeColor = null, selectedFestivalName = null) => {
  const primaryFestival = getPrimaryFestival(segment, selectedDates, themeColor, selectedFestivalName);
  
  if (primaryFestival) {
    const content = getFestivalCardContent(primaryFestival.name, flightPhase, 'content', cardIndex);
    if (content) {
      return content;
    }
  }
  
  // Fallback to default content
  return defaultContent[flightPhase]?.content[cardIndex] || null;
};

// Function to get all promo card content for a flight phase
export const getAllPromoCardContent = (segment, selectedDates, flightPhase, themeColor = null, selectedFestivalName = null) => {
  const primaryFestival = getPrimaryFestival(segment, selectedDates, themeColor, selectedFestivalName);
  
  if (primaryFestival) {
    const content = getFestivalContent(primaryFestival.name, flightPhase, 'promo');
    if (content && content.length > 0) {
      return content;
    }
  }
  
  // Fallback to default content
  return defaultContent[flightPhase]?.promo || [];
};

// Function to get all content card content for a flight phase
export const getAllContentCardContent = (segment, selectedDates, flightPhase, themeColor = null, selectedFestivalName = null) => {
  const primaryFestival = getPrimaryFestival(segment, selectedDates, themeColor, selectedFestivalName);
  
  if (primaryFestival) {
    const content = getFestivalContent(primaryFestival.name, flightPhase, 'content');
    if (content && content.length > 0) {
      return content;
    }
  }
  
  // Fallback to default content
  return defaultContent[flightPhase]?.content || [];
};

// Function to check if festival content should be used
export const shouldUseFestivalContent = (segment, selectedDates, themeColor = null, selectedFestivalName = null) => {
  console.log('=== SHOULD USE FESTIVAL CONTENT ===', {
    segment,
    selectedDates,
    themeColor,
    hasSegment: !!segment,
    hasDates: !!selectedDates && selectedDates.length > 0
  });
  
  const primaryFestival = getPrimaryFestival(segment, selectedDates, themeColor, selectedFestivalName);
  
  console.log('=== PRIMARY FESTIVAL RESULT ===', {
    primaryFestival,
    primaryFestivalName: primaryFestival?.name,
    primaryFestivalLocation: primaryFestival?.location,
    shouldUse: primaryFestival !== null
  });
  
  return primaryFestival !== null;
};
