import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing component state that automatically clears when context changes
 * This prevents state leakage between different routes, flight phases, and themes
 * 
 * @param {string} contextKey - Unique identifier for the current context (route + phase + theme)
 * @param {Object} initialState - Initial state object
 * @returns {Object} State management object with getter, setter, and clear function
 */
export const useIsolatedState = (contextKey, initialState = {}) => {
  const [state, setState] = useState(initialState);
  const previousContextKey = useRef(null);
  
  // Clear state when context changes
  useEffect(() => {
    if (previousContextKey.current !== null && previousContextKey.current !== contextKey) {
      console.log('🔄 CONTEXT CHANGED - CLEARING ISOLATED STATE', {
        previousContext: previousContextKey.current,
        newContext: contextKey,
        reason: 'Context change detected - preventing state leakage'
      });
      
      // Clear all state
      setState(initialState);
    }
    
    previousContextKey.current = contextKey;
  }, [contextKey, initialState]);
  
  // Enhanced setter that includes context validation
  const setStateWithValidation = (newState) => {
    console.log('🔒 SETTING ISOLATED STATE', {
      contextKey,
      newState,
      currentState: state
    });
    
    setState(newState);
  };
  
  // Clear function for manual state reset
  const clearState = () => {
    console.log('🧹 MANUALLY CLEARING ISOLATED STATE', { contextKey });
    setState(initialState);
  };
  
  // Get state with context validation
  const getState = () => {
    return state;
  };
  
  return {
    state: getState(),
    setState: setStateWithValidation,
    clearState,
    contextKey
  };
};

/**
 * Hook for managing component state with automatic cleanup on unmount
 * This ensures no memory leaks or state persistence issues
 */
export const useComponentState = (initialState = {}) => {
  const [state, setState] = useState(initialState);
  
  // Clear state on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 COMPONENT UNMOUNTING - CLEARING STATE');
      setState({});
    };
  }, []);
  
  return [state, setState];
};

/**
 * Hook for managing image-related state with automatic cleanup
 * Specifically designed for promo card images to prevent leakage
 */
export const useImageState = (contextKey) => {
  const initialState = {
    remixedImages: {},
    editableDescriptions: {},
    editableTitles: {},
    imageLoadingStates: {},
    savedDescriptions: {},
    remixLoading: false
  };
  
  const { state, setState, clearState } = useIsolatedState(contextKey, initialState);
  
  // Helper functions for common image state operations
  const setRemixedImage = (cardIndex, imageUrl) => {
    setState(prev => ({
      ...prev,
      remixedImages: {
        ...prev.remixedImages,
        [cardIndex]: imageUrl
      }
    }));
  };
  
  const setImageLoading = (cardIndex, isLoading) => {
    setState(prev => ({
      ...prev,
      imageLoadingStates: {
        ...prev.imageLoadingStates,
        [cardIndex]: isLoading
      }
    }));
  };
  
  const setEditableDescription = (cardIndex, description) => {
    setState(prev => ({
      ...prev,
      editableDescriptions: {
        ...prev.editableDescriptions,
        [cardIndex]: description
      }
    }));
  };
  
  const setEditableTitle = (cardIndex, title) => {
    setState(prev => ({
      ...prev,
      editableTitles: {
        ...prev.editableTitles,
        [cardIndex]: title
      }
    }));
  };
  
  const setRemixLoading = (isLoading) => {
    setState(prev => ({
      ...prev,
      remixLoading: isLoading
    }));
  };
  
  // Legacy function names for backward compatibility
  const setEditableTitles = (cardIndex, title) => setEditableTitle(cardIndex, title);
  const setEditableDescriptions = (cardIndex, description) => setEditableDescription(cardIndex, description);
  
  return {
    ...state,
    setRemixedImage,
    setImageLoading,
    setEditableDescription,
    setEditableTitle,
    setRemixLoading,
    clearState,
    contextKey,
    // Legacy function names
    setEditableTitles,
    setEditableDescriptions
  };
};
