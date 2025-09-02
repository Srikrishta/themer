import festivalsData from '../data/festivals.json';

// Function to get festivals for a specific city and date range
export const getFestivalsForCityAndDates = (city, selectedDates) => {
  if (!city || !selectedDates || selectedDates.length === 0) {
    return [];
  }

  const festivals = [];
  const cityLower = city.toLowerCase();

  // Check each selected date for festivals
  selectedDates.forEach(dateString => {
    const [year, month, day] = dateString.split('-');
    const monthName = new Date(year, month - 1, day).toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const dayOfMonth = parseInt(day, 10);
    
    const monthFestivals = festivalsData[monthName];
    if (monthFestivals) {
      monthFestivals.forEach(festival => {
        // Check if festival location matches the city
        if (festival.location.toLowerCase().includes(cityLower)) {
          // Check if the day falls within the festival date range
          if (dayOfMonth >= festival.startDay && dayOfMonth <= festival.endDay) {
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

  return uniqueFestivals;
};

// Function to get festivals for a flight segment (origin and destination)
export const getFestivalsForFlightSegment = (segment, selectedDates) => {
  if (!segment || !selectedDates || selectedDates.length === 0) {
    return [];
  }

  const originCity = segment.origin?.airport?.city;
  const destCity = segment.destination?.airport?.city;

  const originFestivals = originCity ? getFestivalsForCityAndDates(originCity, selectedDates) : [];
  const destFestivals = destCity ? getFestivalsForCityAndDates(destCity, selectedDates) : [];

  // Combine and remove duplicates
  const allFestivals = [...originFestivals, ...destFestivals];
  const uniqueFestivals = allFestivals.filter((festival, index, self) => 
    index === self.findIndex(f => f.name === festival.name)
  );

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
