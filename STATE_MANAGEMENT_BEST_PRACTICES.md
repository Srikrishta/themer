# State Management Best Practices

## 🚨 CRITICAL: Preventing State Leakage

This document outlines the architectural patterns and best practices to prevent state leakage between different contexts (routes, flight phases, themes) in the theme generator application.

## 🏗️ Architecture Overview

### Context Isolation Pattern
Every component that manages state must be properly isolated to prevent leakage between different contexts.

### Key Principles
1. **Context-Based State**: State is tied to a unique context key
2. **Automatic Cleanup**: State is automatically cleared when context changes
3. **Validation**: Context changes are validated and logged
4. **Isolation**: Each context operates independently

## 🔧 Implementation Patterns

### 1. Use Isolated State Hooks

**❌ WRONG - Component-level state that leaks:**
```javascript
const [remixedImages, setRemixedImages] = useState({});
const [editableDescriptions, setEditableDescriptions] = useState({});
```

**✅ CORRECT - Isolated state with context:**
```javascript
const contextKey = generateContextKey(routeKey, flightPhase, themeColor, selectedDates);
const { remixedImages, setRemixedImage, clearState } = useImageState(contextKey);
```

### 2. Context Key Generation

Always generate a unique context key that changes when any relevant parameter changes:

```javascript
const contextKey = generateContextKey(
  currentRouteKey,      // Route identifier
  selectedFlightPhase,  // Flight phase
  themeColor,          // Theme color
  selectedDates        // Selected dates array
);
```

### 3. State Management Functions

Use the provided helper functions instead of direct state setters:

```javascript
// ❌ WRONG - Direct state manipulation
setRemixedImages(prev => ({ ...prev, [index]: newImage }));

// ✅ CORRECT - Using isolated state functions
setRemixedImage(index, newImage);
```

## 🛡️ Safety Mechanisms

### 1. Automatic State Clearing
The `useIsolatedState` hook automatically clears state when the context changes:

```javascript
useEffect(() => {
  if (previousContextKey.current !== contextKey) {
    setState(initialState); // Clear all state
  }
}, [contextKey]);
```

### 2. Context Validation
Components validate their context to ensure they're using the correct state:

```javascript
const { validateContext } = useContextValidator(contextKey, 'ComponentName');
```

### 3. Debug Logging
All state changes are logged for debugging:

```javascript
console.log('🔄 CONTEXT CHANGED - CLEARING ISOLATED STATE', {
  previousContext: oldKey,
  newContext: newKey,
  reason: 'Context change detected'
});
```

## 📋 Component Checklist

When creating or updating components that manage state:

- [ ] **Context Key**: Generate unique context key using `generateContextKey()`
- [ ] **Isolated State**: Use `useImageState()` or `useIsolatedState()` hooks
- [ ] **Helper Functions**: Use provided helper functions instead of direct state setters
- [ ] **Context Validation**: Add context validation for debugging
- [ ] **Cleanup**: Ensure state is cleared when component unmounts
- [ ] **Logging**: Add debug logging for state changes

## 🚫 Common Pitfalls

### 1. Component-Level State
**Problem**: Using `useState` directly without context isolation
**Solution**: Use `useIsolatedState` or `useImageState` hooks

### 2. Manual State Clearing
**Problem**: Manually clearing state in useEffect
**Solution**: Let the isolated state hooks handle automatic cleanup

### 3. Direct State Manipulation
**Problem**: Using `setState(prev => ({ ...prev, key: value }))`
**Solution**: Use helper functions like `setRemixedImage(index, value)`

### 4. Missing Context Validation
**Problem**: Not validating context changes
**Solution**: Use `useContextValidator` hook

## 🔍 Debugging State Leakage

### 1. Check Console Logs
Look for these log messages:
- `🔄 CONTEXT CHANGED - CLEARING ISOLATED STATE`
- `✅ CONTEXT VALIDATION PASSED`
- `❌ CONTEXT VALIDATION FAILED`

### 2. Verify Context Keys
Ensure context keys are unique and change when expected:
```javascript
console.log('Context Key:', contextKey);
```

### 3. State Inspection
Use the provided debugging utilities:
```javascript
logStateChange('ComponentName', 'stateName', oldValue, newValue, 'reason');
```

## 🧪 Testing State Isolation

### 1. Context Change Test
1. Set up a component with state
2. Change route/flight phase/theme
3. Verify state is cleared
4. Check console logs for cleanup messages

### 2. State Persistence Test
1. Set state in one context
2. Switch to different context
3. Verify state doesn't leak
4. Switch back to original context
5. Verify state is cleared (not restored)

## 📚 Available Hooks and Utilities

### Hooks
- `useIsolatedState(contextKey, initialState)` - General purpose isolated state
- `useImageState(contextKey)` - Image-specific state management
- `useComponentState(initialState)` - Component state with cleanup on unmount

### Utilities
- `generateContextKey(routeKey, flightPhase, themeColor, selectedDates)` - Generate unique context key
- `useContextValidator(contextKey, componentName)` - Context validation
- `clearAllState(stateSetters, initialState)` - Manual state clearing
- `logStateChange(componentName, stateName, oldValue, newValue, reason)` - Debug logging

## 🎯 Migration Guide

### From Old Pattern to New Pattern

**Before:**
```javascript
const [remixedImages, setRemixedImages] = useState({});
const [editableDescriptions, setEditableDescriptions] = useState({});

useEffect(() => {
  // Manual cleanup
  setRemixedImages({});
  setEditableDescriptions({});
}, [routeKey, flightPhase, themeColor]);
```

**After:**
```javascript
const contextKey = generateContextKey(routeKey, flightPhase, themeColor, selectedDates);
const { remixedImages, editableDescriptions, setRemixedImage, setEditableDescription } = useImageState(contextKey);
// Automatic cleanup - no manual useEffect needed
```

## 🚀 Future Considerations

As the application grows in complexity:

1. **State Persistence**: Consider adding state persistence for user preferences
2. **State Sharing**: Implement controlled state sharing between components
3. **Performance**: Add state memoization for expensive operations
4. **Testing**: Create automated tests for state isolation
5. **Monitoring**: Add runtime monitoring for state leakage detection

---

**Remember**: State leakage is a critical bug that can cause confusing user experiences. Always use the provided patterns and utilities to ensure proper state isolation.
