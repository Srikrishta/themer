/**
 * State Leakage Detection Utility
 * This utility helps detect and prevent state leakage between different contexts
 */

class StateLeakageDetector {
  constructor() {
    this.componentStates = new Map();
    this.contextHistory = new Map();
    this.leakageWarnings = [];
  }

  /**
   * Register a component's state for monitoring
   * @param {string} componentName - Name of the component
   * @param {string} contextKey - Current context key
   * @param {Object} state - Current state object
   */
  registerComponent(componentName, contextKey, state) {
    const componentKey = `${componentName}-${contextKey}`;
    
    // Store current state
    this.componentStates.set(componentKey, {
      componentName,
      contextKey,
      state: { ...state },
      timestamp: Date.now()
    });
    
    // Track context history
    if (!this.contextHistory.has(componentName)) {
      this.contextHistory.set(componentName, []);
    }
    
    const history = this.contextHistory.get(componentName);
    if (history[history.length - 1] !== contextKey) {
      history.push(contextKey);
      // Keep only last 10 context changes
      if (history.length > 10) {
        history.shift();
      }
    }
    
    console.log('🔍 STATE REGISTERED', {
      componentName,
      contextKey,
      stateKeys: Object.keys(state),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Check for potential state leakage
   * @param {string} componentName - Name of the component
   * @param {string} newContextKey - New context key
   * @param {Object} newState - New state object
   * @returns {Object} Detection result
   */
  checkForLeakage(componentName, newContextKey, newState) {
    const history = this.contextHistory.get(componentName) || [];
    const previousContextKey = history[history.length - 2]; // Previous context
    
    if (!previousContextKey) {
      return { hasLeakage: false, warnings: [] };
    }
    
    const warnings = [];
    
    // Check if state persisted across context changes
    const previousStateKey = `${componentName}-${previousContextKey}`;
    const previousState = this.componentStates.get(previousStateKey);
    
    if (previousState) {
      // Check for non-empty state in new context
      const hasNonEmptyState = Object.values(newState).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
        return value !== null && value !== undefined && value !== '';
      });
      
      if (hasNonEmptyState) {
        warnings.push({
          type: 'POTENTIAL_LEAKAGE',
          message: `Component ${componentName} has non-empty state in new context ${newContextKey}`,
          previousContext: previousContextKey,
          newContext: newContextKey,
          state: newState
        });
      }
      
      // Check for specific state patterns that might indicate leakage
      const suspiciousPatterns = this.detectSuspiciousPatterns(previousState.state, newState);
      warnings.push(...suspiciousPatterns);
    }
    
    // Check for rapid context changes (might indicate improper cleanup)
    if (history.length >= 3) {
      const recentChanges = history.slice(-3);
      const timeSpans = [];
      
      for (let i = 0; i < recentChanges.length - 1; i++) {
        const currentKey = recentChanges[i];
        const nextKey = recentChanges[i + 1];
        const currentState = this.componentStates.get(`${componentName}-${currentKey}`);
        const nextState = this.componentStates.get(`${componentName}-${nextKey}`);
        
        if (currentState && nextState) {
          const timeSpan = nextState.timestamp - currentState.timestamp;
          timeSpans.push(timeSpan);
        }
      }
      
      const avgTimeSpan = timeSpans.reduce((a, b) => a + b, 0) / timeSpans.length;
      if (avgTimeSpan < 100) { // Less than 100ms between changes
        warnings.push({
          type: 'RAPID_CONTEXT_CHANGES',
          message: `Component ${componentName} is changing contexts too rapidly`,
          avgTimeSpan,
          recentChanges
        });
      }
    }
    
    const hasLeakage = warnings.length > 0;
    
    if (hasLeakage) {
      console.warn('⚠️ POTENTIAL STATE LEAKAGE DETECTED', {
        componentName,
        newContextKey,
        warnings
      });
      
      this.leakageWarnings.push({
        componentName,
        contextKey: newContextKey,
        warnings,
        timestamp: Date.now()
      });
    }
    
    return { hasLeakage, warnings };
  }

  /**
   * Detect suspicious patterns in state that might indicate leakage
   * @param {Object} previousState - Previous state
   * @param {Object} currentState - Current state
   * @returns {Array} Array of warning objects
   */
  detectSuspiciousPatterns(previousState, currentState) {
    const warnings = [];
    
    // Check for identical state values
    for (const [key, value] of Object.entries(currentState)) {
      if (previousState[key] === value && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          warnings.push({
            type: 'IDENTICAL_ARRAY_STATE',
            message: `Array state '${key}' is identical across context changes`,
            key,
            value
          });
        } else if (typeof value === 'object' && Object.keys(value).length > 0) {
          warnings.push({
            type: 'IDENTICAL_OBJECT_STATE',
            message: `Object state '${key}' is identical across context changes`,
            key,
            value
          });
        }
      }
    }
    
    // Check for state that should be empty but isn't
    const shouldBeEmptyKeys = ['remixedImages', 'editableDescriptions', 'editableTitles'];
    for (const key of shouldBeEmptyKeys) {
      if (currentState[key] && Object.keys(currentState[key]).length > 0) {
        warnings.push({
          type: 'NON_EMPTY_STATE_IN_NEW_CONTEXT',
          message: `State '${key}' should be empty in new context but contains data`,
          key,
          value: currentState[key]
        });
      }
    }
    
    return warnings;
  }

  /**
   * Get all leakage warnings for a component
   * @param {string} componentName - Name of the component
   * @returns {Array} Array of warnings
   */
  getWarningsForComponent(componentName) {
    return this.leakageWarnings.filter(warning => warning.componentName === componentName);
  }

  /**
   * Get all leakage warnings
   * @returns {Array} Array of all warnings
   */
  getAllWarnings() {
    return this.leakageWarnings;
  }

  /**
   * Clear warnings for a component
   * @param {string} componentName - Name of the component
   */
  clearWarningsForComponent(componentName) {
    this.leakageWarnings = this.leakageWarnings.filter(
      warning => warning.componentName !== componentName
    );
  }

  /**
   * Clear all warnings
   */
  clearAllWarnings() {
    this.leakageWarnings = [];
  }

  /**
   * Get detection summary
   * @returns {Object} Summary of detection results
   */
  getSummary() {
    const totalWarnings = this.leakageWarnings.length;
    const componentsWithWarnings = new Set(this.leakageWarnings.map(w => w.componentName));
    
    return {
      totalWarnings,
      componentsWithWarnings: Array.from(componentsWithWarnings),
      warningTypes: this.leakageWarnings.reduce((acc, warning) => {
        warning.warnings.forEach(w => {
          acc[w.type] = (acc[w.type] || 0) + 1;
        });
        return acc;
      }, {}),
      lastWarning: this.leakageWarnings[this.leakageWarnings.length - 1]
    };
  }
}

// Create singleton instance
const stateLeakageDetector = new StateLeakageDetector();

/**
 * Hook for monitoring state leakage in components
 * @param {string} componentName - Name of the component
 * @param {string} contextKey - Current context key
 * @param {Object} state - Current state object
 * @returns {Object} Detection utilities
 */
export const useStateLeakageDetection = (componentName, contextKey, state) => {
  // Register component state
  stateLeakageDetector.registerComponent(componentName, contextKey, state);
  
  // Check for leakage
  const detectionResult = stateLeakageDetector.checkForLeakage(componentName, contextKey, state);
  
  return {
    hasLeakage: detectionResult.hasLeakage,
    warnings: detectionResult.warnings,
    getWarnings: () => stateLeakageDetector.getWarningsForComponent(componentName),
    clearWarnings: () => stateLeakageDetector.clearWarningsForComponent(componentName)
  };
};

/**
 * Get global detection summary
 * @returns {Object} Global detection summary
 */
export const getStateLeakageSummary = () => {
  return stateLeakageDetector.getSummary();
};

/**
 * Clear all detection data
 */
export const clearStateLeakageData = () => {
  stateLeakageDetector.clearAllWarnings();
  stateLeakageDetector.componentStates.clear();
  stateLeakageDetector.contextHistory.clear();
};

export default stateLeakageDetector;
