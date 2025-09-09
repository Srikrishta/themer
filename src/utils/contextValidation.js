import { useRef, useEffect } from 'react';

/**
 * Context validation utilities to prevent state leakage
 * This ensures components are properly isolated and state doesn't leak between contexts
 */

/**
 * Generate a unique context key for state isolation
 * This key changes whenever route, flight phase, or theme changes
 * 
 * @param {string} routeKey - Current route key
 * @param {string} flightPhase - Current flight phase
 * @param {string} themeColor - Current theme color
 * @param {Array} selectedDates - Selected dates array
 * @returns {string} Unique context key
 */
export const generateContextKey = (routeKey, flightPhase, themeColor, selectedDates = []) => {
  const datesKey = selectedDates.length > 0 ? selectedDates.join('-') : 'no-dates';
  const contextKey = `${routeKey || 'no-route'}-${flightPhase || 'no-phase'}-${themeColor || 'no-theme'}-${datesKey}`;
  
  console.log('🔑 GENERATED CONTEXT KEY', {
    routeKey,
    flightPhase,
    themeColor,
    selectedDates,
    contextKey
  });
  
  return contextKey;
};

/**
 * Validate that a component is using the correct context
 * This prevents components from using stale state from previous contexts
 * 
 * @param {string} currentContextKey - Current context key
 * @param {string} expectedContextKey - Expected context key
 * @param {string} componentName - Name of the component for debugging
 * @returns {boolean} True if context is valid
 */
export const validateContext = (currentContextKey, expectedContextKey, componentName = 'Unknown') => {
  const isValid = currentContextKey === expectedContextKey;
  
  if (!isValid) {
    console.error('❌ CONTEXT VALIDATION FAILED', {
      componentName,
      currentContextKey,
      expectedContextKey,
      reason: 'Context mismatch detected - potential state leakage'
    });
  } else {
    console.log('✅ CONTEXT VALIDATION PASSED', {
      componentName,
      contextKey: currentContextKey
    });
  }
  
  return isValid;
};

/**
 * Create a context validator hook for components
 * This automatically validates context on every render
 * 
 * @param {string} contextKey - Current context key
 * @param {string} componentName - Name of the component
 * @returns {Object} Validation utilities
 */
export const useContextValidator = (contextKey, componentName) => {
  const previousContextKey = useRef(null);
  
  useEffect(() => {
    if (previousContextKey.current !== null) {
      const isValid = validateContext(contextKey, previousContextKey.current, componentName);
      
      if (!isValid) {
        console.warn('⚠️ CONTEXT CHANGE DETECTED', {
          componentName,
          previousContext: previousContextKey.current,
          newContext: contextKey,
          action: 'Component should clear its state'
        });
      }
    }
    
    previousContextKey.current = contextKey;
  }, [contextKey, componentName]);
  
  return {
    validateContext: (expectedKey) => validateContext(contextKey, expectedKey, componentName),
    contextKey
  };
};

/**
 * State cleanup utility
 * This ensures all component state is properly cleared
 * 
 * @param {Object} stateSetters - Object containing state setter functions
 * @param {Object} initialState - Initial state values
 */
export const clearAllState = (stateSetters, initialState) => {
  console.log('🧹 CLEARING ALL COMPONENT STATE', {
    stateSetters: Object.keys(stateSetters),
    initialState: Object.keys(initialState)
  });
  
  Object.keys(stateSetters).forEach(key => {
    const setter = stateSetters[key];
    const initialValue = initialState[key];
    
    if (typeof setter === 'function') {
      if (Array.isArray(initialValue)) {
        setter([]);
      } else if (typeof initialValue === 'object' && initialValue !== null) {
        setter({});
      } else {
        setter(initialValue);
      }
    }
  });
};

/**
 * Debug utility to log state changes
 * This helps identify when and why state changes occur
 * 
 * @param {string} componentName - Name of the component
 * @param {string} stateName - Name of the state being changed
 * @param {any} oldValue - Previous value
 * @param {any} newValue - New value
 * @param {string} reason - Reason for the change
 */
export const logStateChange = (componentName, stateName, oldValue, newValue, reason = 'Unknown') => {
  console.log('🔄 STATE CHANGE DETECTED', {
    componentName,
    stateName,
    oldValue,
    newValue,
    reason,
    timestamp: new Date().toISOString()
  });
};
