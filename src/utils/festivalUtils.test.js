import { getFestivalsForCityAndDates, getFestivalsForFlightSegment, formatFestivalChips } from './festivalUtils';

describe('Festival Utils', () => {
  describe('getFestivalsForCityAndDates', () => {
    it('should return empty array for null city', () => {
      const result = getFestivalsForCityAndDates(null, ['2024-10-15']);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty dates', () => {
      const result = getFestivalsForCityAndDates('Paris', []);
      expect(result).toEqual([]);
    });

    it('should return festivals for Paris on Bastille Day', () => {
      const result = getFestivalsForCityAndDates('Paris', ['2024-07-14']);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Bastille Day');
      expect(result[0].location).toContain('Paris');
    });

    it('should return festivals for Amsterdam on King\'s Day', () => {
      const result = getFestivalsForCityAndDates('Amsterdam', ['2024-04-27']);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('King\'s Day');
      expect(result[0].location).toContain('Amsterdam');
    });
  });

  describe('getFestivalsForFlightSegment', () => {
    it('should return empty array for null segment', () => {
      const result = getFestivalsForFlightSegment(null, ['2024-10-15']);
      expect(result).toEqual([]);
    });

    it('should return festivals for flight segment with festivals', () => {
      const segment = {
        origin: { airport: { city: 'Paris' } },
        destination: { airport: { city: 'Amsterdam' } }
      };
      const result = getFestivalsForFlightSegment(segment, ['2024-07-14', '2024-04-27']);
      expect(result.length).toBeGreaterThan(0);
      // Should include both Bastille Day and King's Day
      const festivalNames = result.map(f => f.name);
      expect(festivalNames).toContain('Bastille Day');
      expect(festivalNames).toContain('King\'s Day');
    });
  });

  describe('formatFestivalChips', () => {
    it('should format festivals into chip objects', () => {
      const festivals = [
        {
          name: 'Bastille Day',
          location: 'Paris 🇫🇷',
          color: '#06B6D4',
          type: 'cultural'
        }
      ];
      const result = formatFestivalChips(festivals);
      expect(result).toEqual([
        {
          id: 'bastille-day',
          label: 'Bastille Day',
          color: '#06B6D4',
          type: 'cultural',
          location: 'Paris 🇫🇷',
          isFestival: true
        }
      ]);
    });
  });
});
