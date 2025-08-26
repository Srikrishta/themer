import { mapThemeChipToAnimation, getAnimationParameters } from './themeAnimationMapper';

// Simple test function to verify animation mapping
export function testAnimationMapping() {
  console.log('Testing Theme Animation Mapping...');
  
  const testCases = [
    { label: 'Default', color: '#1E1E1E', expected: 'sparkles' },
    { label: 'Milan Theme', color: '#EF4444', expected: 'sparkles' },
    { label: 'Paris Theme', color: '#06B6D4', expected: 'lights' },
    { label: 'Rome Theme', color: '#F59E0B', expected: 'glow' },
    { label: 'Amsterdam Theme', color: '#3B82F6', expected: 'lights' },
    { label: 'Munich Theme', color: '#7C3AED', expected: 'glow' },
    { label: 'Berlin Theme', color: '#1E1E1E', expected: 'sparkles' },
    { label: 'Time of the Day', color: '#F59E0B', expected: 'glow' },
    { label: 'Rome Carnival', color: '#F59E0B', expected: 'confetti' },
    { label: 'Oktoberfest', color: '#FCD34D', expected: 'confetti' },
    { label: 'Milan Fashion Week', color: '#EC4899', expected: 'sparkles' },
    { label: 'Amsterdam Light Festival', color: '#3B82F6', expected: 'lights' },
    { label: 'Christmas in Rome', color: '#10B981', expected: 'glow' },
    { label: 'Bastille Day', color: '#06B6D4', expected: 'glow' },
    { label: 'Pride Amsterdam', color: '#65A30D', expected: 'glow' },
    { label: 'Nuit Blanche', color: '#581C87', expected: 'glow' },
    { label: 'Tollwood Festival', color: '#7C3AED', expected: 'confetti' },
    { label: 'Frühlingsfest', color: '#059669', expected: 'confetti' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(({ label, color, expected }) => {
    const result = mapThemeChipToAnimation(label, color);
    const success = result === expected;
    
    if (success) {
      passed++;
      console.log(`✅ ${label} -> ${result}`);
    } else {
      failed++;
      console.log(`❌ ${label} -> ${result} (expected ${expected})`);
    }
  });
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  // Test animation parameters
  console.log('\nTesting Animation Parameters...');
  const testParams = getAnimationParameters('Rome Carnival', '#F59E0B');
  console.log('Rome Carnival parameters:', testParams);
  
  return { passed, failed, total: testCases.length };
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - expose test function
  window.testAnimationMapping = testAnimationMapping;
} else {
  // Node environment - run test
  testAnimationMapping();
}

