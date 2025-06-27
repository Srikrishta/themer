import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DatePicker = ({ 
  currentDate,
  onNavigateMonth,
  selectedDates,
  onDateClick,
  onCreateTheme,
  onEditDates,
  inputValue,
  onInputChange,
  setCurrentDate,
  berlinToday,
  showAirportSearch
}) => {
  const [inputError, setInputError] = useState('');

  // Use Berlin timezone for date calculations
  const today = berlinToday || new Date();
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() + 5);

  const isDateInRange = (date) => {
    // Create a normalized date for comparison (start of day)
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const normalizedMaxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    
    return normalizedDate >= normalizedToday && normalizedDate <= normalizedMaxDate;
  };

  const formatDateInput = (value) => {
    // Remove any non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2);
    } else {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
    }
  };

  const findNearestDate = (input) => {
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length === 0) return null;
    
    const day = parseInt(numbers.slice(0, 2), 10) || 1;
    let month, year;
    
    if (numbers.length <= 2) {
      // Only day provided, find nearest month from current date
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      
      // Try current month first
      let testDate = new Date(currentYear, currentMonth - 1, day);
      if (testDate >= today && testDate <= maxDate) {
        return testDate;
      }
      
      // Try next month
      testDate = new Date(currentYear, currentMonth, day);
      if (testDate >= today && testDate <= maxDate) {
        return testDate;
      }
      
      // Keep looking forward for valid month
      for (let i = 1; i <= 12; i++) {
        testDate = new Date(currentYear, currentMonth - 1 + i, day);
        if (testDate >= today && testDate <= maxDate) {
          return testDate;
        }
      }
      
      return null;
    } else if (numbers.length <= 4) {
      // Day and month provided
      month = parseInt(numbers.slice(2, 4), 10);
      if (month < 1 || month > 12) return null;
      
      // Find nearest year
      const currentYear = today.getFullYear();
      for (let yearOffset = 0; yearOffset <= 5; yearOffset++) {
        const testYear = currentYear + yearOffset;
        const testDate = new Date(testYear, month - 1, day);
        if (testDate >= today && testDate <= maxDate) {
          return testDate;
        }
      }
      
      return null;
    } else {
      // Full date provided
      month = parseInt(numbers.slice(2, 4), 10);
      year = parseInt(numbers.slice(4, 8), 10);
      
      if (month < 1 || month > 12) return null;
      if (year < today.getFullYear() || year > maxDate.getFullYear()) return null;
      
      const testDate = new Date(year, month - 1, day);
      if (testDate.getDate() !== day || testDate.getMonth() !== month - 1 || testDate.getFullYear() !== year) {
        return null; // Invalid date
      }
      
      return isDateInRange(testDate) ? testDate : null;
    }
  };

  // Handle input changes from the main input field
  React.useEffect(() => {
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      // Complete deletion - reset to today's date
      if (setCurrentDate) {
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
      }
      return;
    }

    if (inputValue) {
      const formatted = formatDateInput(inputValue);
      const nearestDate = findNearestDate(inputValue);
      
      if (nearestDate && setCurrentDate) {
        // Navigate to the month of the nearest date
        setCurrentDate(new Date(nearestDate.getFullYear(), nearestDate.getMonth(), 1));
      } else {
        // If no valid date found, try to find the best month to show based on partial input
        const numbers = inputValue.replace(/\D/g, '');
        
        if (numbers.length >= 2) {
          const day = parseInt(numbers.slice(0, 2), 10) || 1;
          
          if (numbers.length >= 4) {
            // Day and month provided (e.g., "28/06" after erasing year)
            const month = parseInt(numbers.slice(2, 4), 10);
            if (month >= 1 && month <= 12) {
              // Find the nearest valid year for this day/month combination
              const currentYear = today.getFullYear();
              
              // Try current year first
              let testDate = new Date(currentYear, month - 1, day);
              if (testDate >= today && testDate <= maxDate) {
                setCurrentDate(new Date(currentYear, month - 1, 1));
                return;
              }
              
              // If current year doesn't work, try next years
              for (let yearOffset = 1; yearOffset <= 5; yearOffset++) {
                const testYear = currentYear + yearOffset;
                testDate = new Date(testYear, month - 1, day);
                if (testDate >= today && testDate <= maxDate) {
                  setCurrentDate(new Date(testYear, month - 1, 1));
                  return;
                }
              }
            }
          } else {
            // Only day provided (e.g., "28" after erasing month/year)
            // Find nearest month with this day
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            // Try current month first
            let testDate = new Date(currentYear, currentMonth, day);
            if (testDate >= today && testDate <= maxDate) {
              setCurrentDate(new Date(currentYear, currentMonth, 1));
              return;
            }
            
            // Try subsequent months
            for (let monthOffset = 1; monthOffset <= 12; monthOffset++) {
              testDate = new Date(currentYear, currentMonth + monthOffset, day);
              if (testDate >= today && testDate <= maxDate) {
                setCurrentDate(new Date(testDate.getFullYear(), testDate.getMonth(), 1));
                return;
              }
            }
          }
        }
        
        // Fallback to today if nothing else works
        if (setCurrentDate) {
          setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
        }
      }
      
      // Auto-select the date if it's complete and valid
      if (nearestDate && formatted.length === 10) {
        const dateString = nearestDate.toISOString().split('T')[0];
        if (!selectedDates.includes(dateString)) {
          // Pass true to indicate this is from typing
          onDateClick(nearestDate, true);
        }
      }
    }
  }, [inputValue, setCurrentDate, onDateClick, selectedDates, today, maxDate]);

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter') {
      const nearestDate = findNearestDate(inputValue);
      if (nearestDate) {
        onDateClick(nearestDate, true); // Pass true to indicate this is from typing
        onInputChange(''); // Clear input after selection
      } else if (inputValue.trim()) {
        setInputError('Invalid date or date out of range');
      }
    }
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    if (i < startingDayIndex) {
      calendarDays.push({
        day: prevMonthDays - startingDayIndex + i + 1,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - startingDayIndex + i + 1)
      });
    } else if (i < startingDayIndex + daysInMonth) {
      calendarDays.push({
        day: i - startingDayIndex + 1,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i - startingDayIndex + 1)
      });
    } else {
      calendarDays.push({
        day: i - (startingDayIndex + daysInMonth) + 1,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i - (startingDayIndex + daysInMonth) + 1)
      });
    }
  }

  // Highlight the date being typed
  const typedDate = findNearestDate(inputValue);
  const highlightDateString = typedDate ? typedDate.toISOString().split('T')[0] : null;

  return (
    <div className="p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => onNavigateMonth(-1)}
          disabled={
            // Disable if going to previous month would be before the minimum allowed month
            currentDate.getFullYear() < today.getFullYear() || 
            (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() - 1 < today.getMonth())
          }
          className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 p-1 rounded"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <span className="text-sm font-bold">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button 
          onClick={() => onNavigateMonth(1)}
          disabled={
            // Disable if going to next month would be after the maximum allowed month
            currentDate.getFullYear() > maxDate.getFullYear() || 
            (currentDate.getFullYear() === maxDate.getFullYear() && currentDate.getMonth() + 1 > maxDate.getMonth())
          }
          className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 p-1 rounded"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-0">
        {DAYS.map((day, i) => (
          <div key={i} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {calendarDays.map((day, i) => {
          const dateString = day.date.toISOString().split('T')[0];
          const isSelected = selectedDates.includes(dateString);
          const isInRange = isDateInRange(day.date);
          const isHighlighted = highlightDateString === dateString;
          
          // Check if this date is between start and end date for range highlighting
          const isInSelectedRange = selectedDates.length === 2 && isInRange && (() => {
            const startDate = new Date(selectedDates[0] + 'T12:00:00');
            const endDate = new Date(selectedDates[1] + 'T12:00:00');
            const currentDate = new Date(dateString + 'T12:00:00');
            return currentDate >= startDate && currentDate <= endDate;
          })();

          // Determine position in range for styling
          let rangePosition = null;
          if (selectedDates.length === 2 && isInSelectedRange) {
            const isStartDate = dateString === selectedDates[0];
            const isEndDate = dateString === selectedDates[1];
            const colIndex = i % 7;
            
            // Check if previous and next dates are in the selected range
            const prevDateInRange = i > 0 && calendarDays[i - 1] && (() => {
              const prevDateString = calendarDays[i - 1].date.toISOString().split('T')[0];
              const prevDateObj = new Date(prevDateString + 'T12:00:00');
              const startDateObj = new Date(selectedDates[0] + 'T12:00:00');
              const endDateObj = new Date(selectedDates[1] + 'T12:00:00');
              return prevDateObj >= startDateObj && prevDateObj <= endDateObj;
            })();
            
            const nextDateInRange = i < calendarDays.length - 1 && calendarDays[i + 1] && (() => {
              const nextDateString = calendarDays[i + 1].date.toISOString().split('T')[0];
              const nextDateObj = new Date(nextDateString + 'T12:00:00');
              const startDateObj = new Date(selectedDates[0] + 'T12:00:00');
              const endDateObj = new Date(selectedDates[1] + 'T12:00:00');
              return nextDateObj >= startDateObj && nextDateObj <= endDateObj;
            })();
            
            // Determine if we need left or right rounding
            const needsLeftRounding = isStartDate || colIndex === 0 || !prevDateInRange;
            const needsRightRounding = isEndDate || colIndex === 6 || !nextDateInRange;
            
            if (isStartDate && isEndDate) {
              rangePosition = 'single'; // Same start and end date
            } else if (needsLeftRounding && needsRightRounding) {
              rangePosition = 'both'; // Isolated date in range (shouldn't happen but just in case)
            } else if (needsLeftRounding) {
              rangePosition = 'start';
            } else if (needsRightRounding) {
              rangePosition = 'end';
            } else {
              rangePosition = 'middle';
            }
          }

          // Calculate border radius based on position
          let borderRadiusClass = '';
          if (isSelected && selectedDates.length === 1) {
            // Single date selection - 16px radius
            borderRadiusClass = 'rounded-2xl'; // 16px
          } else if (rangePosition) {
            // Range selection - 24px radius on appropriate sides
            switch (rangePosition) {
              case 'single':
                borderRadiusClass = 'rounded-3xl'; // 24px all around
                break;
              case 'both':
                borderRadiusClass = 'rounded-3xl'; // 24px all around for isolated dates
                break;
              case 'start':
                borderRadiusClass = 'rounded-l-3xl'; // 24px on left side
                break;
              case 'end':
                borderRadiusClass = 'rounded-r-3xl'; // 24px on right side
                break;
              case 'middle':
                borderRadiusClass = ''; // No border radius for middle dates
                break;
            }
          }

          return (
            <button
              key={i}
              onClick={() => {
                if (isInRange) {
                  // Allow clicking on any date that's in range, regardless of current month
                  onDateClick(day.date, false); // Pass false to indicate this is from calendar click
                  
                  // If clicking on a date from previous/next month, navigate to that month
                  if (!day.isCurrentMonth) {
                    setCurrentDate(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
                  }
                }
              }}
              disabled={!isInRange}
              className={`
                w-full h-10 text-sm flex items-center justify-center relative
                ${day.isCurrentMonth ? (isInRange ? 'text-gray-900' : 'text-gray-300') : (isInRange ? 'text-gray-600' : 'text-gray-400')}
                ${isSelected && selectedDates.length === 1 ? `bg-indigo-600/50 text-gray-900 ${borderRadiusClass}` : 
                  isInSelectedRange ? `bg-indigo-600/50 text-gray-900 ${borderRadiusClass}` :
                  isHighlighted ? 'bg-yellow-200 ring-2 ring-yellow-400 rounded-2xl' :
                  (isInRange ? 'hover:bg-gray-100 rounded-2xl' : '')}
                ${!isInRange ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {day.day}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-center">
        {/* Create theme button removed - date selection is handled by input interaction */}
      </div>
    </div>
  );
};

export default DatePicker; 