# State Management Quick Reference

## 🚨 CRITICAL: Never Use Component-Level State Without Context Isolation

### ❌ NEVER DO THIS
```javascript
// This will cause state leakage between contexts
const [remixedImages, setRemixedImages] = useState({});
const [editableDescriptions, setEditableDescriptions] = useState({});
```

### ✅ ALWAYS DO THIS
```javascript
// This prevents state leakage with automatic cleanup
const contextKey = generateContextKey(routeKey, flightPhase, themeColor, selectedDates);
const { remixedImages, setRemixedImage, clearState } = useImageState(contextKey);
```

## 🔧 Quick Setup for New Components

### 1. Import Required Hooks
```javascript
import { useImageState } from '../hooks/useIsolatedState';
import { generateContextKey, useContextValidator } from '../utils/contextValidation';
import { useStateLeakageDetection } from '../utils/stateLeakageDetector';
```

### 2. Generate Context Key
```javascript
const contextKey = generateContextKey(currentRouteKey, selectedFlightPhase, themeColor, selectedDates);
```

### 3. Use Isolated State
```javascript
const {
  remixedImages,
  editableDescriptions,
  editableTitles,
  imageLoadingStates,
  savedDescriptions,
  remixLoading,
  setRemixedImage,
  setImageLoading,
  setEditableDescription,
  setEditableTitle,
  setRemixLoading,
  clearState
} = useImageState(contextKey);
```

### 4. Add Context Validation
```javascript
const { validateContext } = useContextValidator(contextKey, 'YourComponentName');
```

### 5. Add Leakage Detection
```javascript
const { hasLeakage, warnings } = useStateLeakageDetection('YourComponentName', contextKey, {
  remixedImages,
  editableDescriptions,
  editableTitles,
  imageLoadingStates,
  savedDescriptions,
  remixLoading
});
```

## 🛡️ Safety Checklist

- [ ] Context key includes all relevant parameters (route, phase, theme, dates)
- [ ] Using `useImageState()` or `useIsolatedState()` instead of `useState()`
- [ ] Using helper functions instead of direct state setters
- [ ] Added context validation
- [ ] Added leakage detection
- [ ] No manual state clearing in useEffect
- [ ] State is automatically cleared when context changes

## 🔍 Debug Commands

### Check for State Leakage
```javascript
import { getStateLeakageSummary } from '../utils/stateLeakageDetector';
console.log('State Leakage Summary:', getStateLeakageSummary());
```

### Clear All Detection Data
```javascript
import { clearStateLeakageData } from '../utils/stateLeakageDetector';
clearStateLeakageData();
```

## 🚫 Common Mistakes

1. **Using useState directly** → Use useImageState instead
2. **Manual state clearing** → Let hooks handle automatic cleanup
3. **Missing context key** → Always generate unique context key
4. **Direct state manipulation** → Use helper functions
5. **No validation** → Add context validation and leakage detection

## 📞 Emergency Fix

If you accidentally used component-level state:

1. **Immediate Fix**: Add context key and use isolated state hooks
2. **Cleanup**: Remove manual state clearing useEffect
3. **Validation**: Add context validation and leakage detection
4. **Test**: Verify state is cleared when context changes

## 🎯 Remember

**State leakage is a critical bug that can cause confusing user experiences. Always use the provided patterns and utilities to ensure proper state isolation.**
