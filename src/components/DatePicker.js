import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import festivalsData from '../data/festivals.json';

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
  berlinToday
}) => {
  const [inputError, setInputError] = useState('');
  const [tooltip, setTooltip] = useState({
    show: false,
    content: [],
    position: { x: 0, y: 0 },
    showBelow: false
  });

  // Function to get festivals for a specific date
  const getFestivalsForDate = (date) => {
    const month = date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const dayOfMonth = date.getDate();
    
    // Debug logging
    if (month === 'october') {
      console.log('Checking date:', dayOfMonth, 'of', month, date.getFullYear());
    }
    
    const monthData = festivalsData[month];
    if (!monthData) {
      return [];
    }
    
    const festivals = monthData.filter(festival => {
      const isInRange = dayOfMonth >= festival.startDay && dayOfMonth <= festival.endDay;
      
      if (month === 'october' && isInRange) {
        console.log('Found festival:', festival.name, 'for day:', dayOfMonth);
      }
      
      return isInRange;
    });
    
    return festivals;
  };

  // Tooltip handlers
  const handleMouseEnter = (event, festivals) => {
    if (festivals.length === 0) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    
    // Calculate tooltip dimensions (approximate)
    const tooltipWidth = 320; // max-width we set in CSS
    const tooltipHeight = 120; // approximate height
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate initial position (centered above the date)
    let x = rect.left + scrollX + rect.width / 2;
    let y = rect.top + scrollY - 10;
    
    // Adjust horizontal position if tooltip would overflow
    const tooltipLeft = x - tooltipWidth / 2;
    const tooltipRight = x + tooltipWidth / 2;
    
    if (tooltipLeft < 10) {
      // Too far left, align to left edge with padding
      x = tooltipWidth / 2 + 15;
    } else if (tooltipRight > viewportWidth - 10) {
      // Too far right, align to right edge with padding
      x = viewportWidth - tooltipWidth / 2 - 15;
    }
    
    // Adjust vertical position if tooltip would overflow top
    if (y - tooltipHeight < 10) {
      // Show below the date instead of above
      y = rect.bottom + scrollY + 10;
    }
    
    setTooltip({
      show: true,
      content: festivals,
      position: { x, y },
      showBelow: y > rect.bottom + scrollY // Track if showing below
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false, showBelow: false }));
  };

  // Helper function to convert Date to YYYY-MM-DD string without timezone issues
  const dateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
  useEffect(() => {
    // Only run this effect when there's actual input value
    if (!inputValue || inputValue === '' || inputValue === null || inputValue === undefined) {
      return; // Don't interfere with navigation when no input
    }
    
    // Don't process if the input contains formatted date range (with arrow)
    if (inputValue.includes('→')) {
      return; // Don't interfere with navigation when showing formatted dates
    }
      const formatted = formatDateInput(inputValue);
      const nearestDate = findNearestDate(inputValue);
      
      if (nearestDate && setCurrentDate) {
        // Navigate to the month of the nearest date
        const targetMonth = new Date(nearestDate.getFullYear(), nearestDate.getMonth(), 1);
        if (currentDate.getTime() !== targetMonth.getTime()) {
          setCurrentDate(targetMonth);
        }
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
                const targetMonth = new Date(currentYear, month - 1, 1);
                if (currentDate.getTime() !== targetMonth.getTime()) {
                  setCurrentDate(targetMonth);
                }
                return;
              }
              
              // If current year doesn't work, try next years
              for (let yearOffset = 1; yearOffset <= 5; yearOffset++) {
                const testYear = currentYear + yearOffset;
                testDate = new Date(testYear, month - 1, day);
                if (testDate >= today && testDate <= maxDate) {
                  const targetMonth = new Date(testYear, month - 1, 1);
                  if (currentDate.getTime() !== targetMonth.getTime()) {
                    setCurrentDate(targetMonth);
                  }
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
              const targetMonth = new Date(currentYear, currentMonth, 1);
              if (currentDate.getTime() !== targetMonth.getTime()) {
                setCurrentDate(targetMonth);
              }
              return;
            }
            
            // Try subsequent months
            for (let monthOffset = 1; monthOffset <= 12; monthOffset++) {
              testDate = new Date(currentYear, currentMonth + monthOffset, day);
              if (testDate >= today && testDate <= maxDate) {
                const targetMonth = new Date(testDate.getFullYear(), testDate.getMonth(), 1);
                if (currentDate.getTime() !== targetMonth.getTime()) {
                  setCurrentDate(targetMonth);
                }
                return;
              }
            }
          }
        }
        
        // Fallback to today if nothing else works
        const todayFirstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        if (setCurrentDate && currentDate.getTime() !== todayFirstOfMonth.getTime()) {
          setCurrentDate(todayFirstOfMonth);
        }
      }
      
      // Auto-select the date if it's complete and valid
      if (nearestDate && formatted.length === 10) {
        const dateString = dateToString(nearestDate);
        if (!selectedDates.includes(dateString)) {
          // Pass true to indicate this is from typing
          onDateClick(nearestDate, true);
      }
    }
  }, [inputValue, onDateClick, selectedDates, today, maxDate]);

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
  const highlightDateString = typedDate ? dateToString(typedDate) : null;

  return (
    <div className="p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => {
            console.log('Left click - before navigation, current month:', MONTHS[currentDate.getMonth()], currentDate.getFullYear());
            onNavigateMonth(-1);
          }}
          disabled={false}
          data-navigation="true"
          className="hover:bg-gray-100 p-2 rounded border border-gray-300 bg-white cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <span className="text-sm font-bold">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button 
          onClick={() => {
            console.log('Right click - before navigation, current month:', MONTHS[currentDate.getMonth()], currentDate.getFullYear());
            onNavigateMonth(1);
          }}
          disabled={false}
          data-navigation="true"
          className="hover:bg-gray-100 p-2 rounded border border-gray-300 bg-white cursor-pointer"
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
          const dateString = dateToString(day.date);
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
              const prevDateString = dateToString(calendarDays[i - 1].date);
              const prevDateObj = new Date(prevDateString + 'T12:00:00');
              const startDateObj = new Date(selectedDates[0] + 'T12:00:00');
              const endDateObj = new Date(selectedDates[1] + 'T12:00:00');
              return prevDateObj >= startDateObj && prevDateObj <= endDateObj;
            })();
            
            const nextDateInRange = i < calendarDays.length - 1 && calendarDays[i + 1] && (() => {
              const nextDateString = dateToString(calendarDays[i + 1].date);
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

          const dayFestivals = getFestivalsForDate(day.date);

          // Create comprehensive tooltip content for festivals
          const createTooltipContent = (festivals) => {
            if (festivals.length === 0) return '';
            
            return festivals.map(festival => 
              `• ${festival.name} - ${festival.location}`
            ).join('\n');
          };

          // Debug logging for tooltip
          if (dayFestivals.length > 0) {
            console.log('Date has festivals:', day.day, 'festivals:', dayFestivals.map(f => f.name));
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
              onMouseEnter={(e) => handleMouseEnter(e, dayFestivals)}
              onMouseLeave={handleMouseLeave}
              disabled={!isInRange}
              title={dayFestivals.length > 0 ? createTooltipContent(dayFestivals) : ''}
              className={`
                w-full h-10 text-sm flex flex-col items-center justify-center relative
                ${day.isCurrentMonth ? (isInRange ? 'text-gray-900' : 'text-gray-300') : (isInRange ? 'text-gray-600' : 'text-gray-400')}
                ${isSelected && selectedDates.length === 1 ? `bg-indigo-600/50 text-gray-900 ${borderRadiusClass}` : 
                  isInSelectedRange ? `bg-indigo-600/50 text-gray-900 ${borderRadiusClass}` :
                  isHighlighted ? 'bg-yellow-200 ring-2 ring-yellow-400 rounded-2xl' :
                  (isInRange ? 'hover:bg-gray-100 rounded-2xl' : '')}
                ${!isInRange ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className={dayFestivals.length > 0 ? 'mb-0.5' : ''}>{day.day}</span>
              {dayFestivals.length > 0 && (
                <div className="flex items-end justify-center h-2 -space-x-1">
                  {dayFestivals.slice(0, 3).map((festival, idx) => (
                    <div
                      key={`${festival.name}-${idx}`}
                      className="w-2 h-2 rounded-full border border-white"
                      style={{ 
                        backgroundColor: festival.color,
                        zIndex: dayFestivals.length - idx
                      }}
                    />
                  ))}
                  {dayFestivals.length > 3 && (
                    <div
                      className="w-2 h-2 rounded-full border border-white bg-gray-400"
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-center">
        {/* Create theme button removed - date selection is handled by input interaction */}
      </div>

      {/* Portal Tooltip - renders outside sidebar */}
      {tooltip.show && tooltip.content.length > 0 && createPortal(
        <div 
          className="fixed bg-white rounded-xl shadow-2xl border border-gray-100 min-w-max pointer-events-none transition-all duration-300 ease-out backdrop-blur-sm"
          style={{
            left: tooltip.position.x,
            top: tooltip.position.y,
            transform: tooltip.showBelow ? 'translateX(-50%)' : 'translateX(-50%) translateY(-100%)',
            zIndex: 999999,
            maxWidth: '320px'
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
              {tooltip.content.length === 1 ? 'Festival' : `${tooltip.content.length} Festivals`}
            </h3>
          </div>
          
          {/* Content */}
          <div className="px-4 py-3">
            <div className="space-y-3">
              {tooltip.content.map((festival, idx) => (
                <div key={`portal-tooltip-${festival.name}-${idx}`} className="flex items-start space-x-3 group">
                  <div className="flex-shrink-0 pt-0.5">
                    <div 
                      className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: festival.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {festival.name}
                      </h4>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {festival.type}
                      </span>
                    </div>
                                         <p className="text-xs text-gray-500 mt-0.5">
                       {festival.location.replace(/🇩🇪|🇫🇷|🇳🇱|🇮🇹/g, '').trim()}
                     </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Arrow */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{
              [tooltip.showBelow ? 'bottom' : 'top']: '100%',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              [tooltip.showBelow ? 'borderBottom' : 'borderTop']: '8px solid white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))'
            }}
          ></div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DatePicker; 