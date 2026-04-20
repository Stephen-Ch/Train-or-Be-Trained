import { calculateProfile, calculateProfileWithReverse } from './profile';

describe('Profile Engine', () => {
  it('should calculate profile from answer vectors', () => {
    // Test deterministic mapping
    const answers = { A: 5, B: 5, C: 5 }; // All strongly agree
    const result = calculateProfile(answers);
    
    expect(result).toBeDefined();
    expect(result.code).toBeTruthy();
    expect(result.title).toBeTruthy();
    expect(result.summary).toBeTruthy();
    expect(result.bullets.length).toBe(3);
  });

  it('should handle low scores', () => {
    const answers = { A: 1, B: 1, C: 1 }; // All strongly disagree
    const result = calculateProfile(answers);
    
    expect(result.code).toBe('skeptic');
    expect(result.title).toContain('Skeptic');
  });

  it('should handle mixed scores', () => {
    const answers = { A: 3, B: 3, C: 3 }; // All neutral
    const result = calculateProfile(answers);
    
    expect(result.code).toBe('moderate');
    expect(result.title).toContain('Moderate');
  });

  it('should be deterministic', () => {
    const answers = { A: 4, B: 3, C: 5 };
    const result1 = calculateProfile(answers);
    const result2 = calculateProfile(answers);
    
    expect(result1).toEqual(result2);
  });

  it('should apply reverse scoring using followUp metadata', () => {
    // Test case: mixed reverse flags yield expected normalized scores
    const followUps = [
      { id: 'A1', reverse: false },
      { id: 'B1', reverse: true },
      { id: 'C1', reverse: false }
    ];
    const answers = { A1: 5, B1: 5, C1: 1 }; // 5, reverse(5)=1, 1
    
    const result = calculateProfileWithReverse(answers, followUps);
    
    // Expected: (5 + 1 + 1) / 3 = 2.33, normalized = ((2.33-1)/4)*100 = 33.25%
    expect(result.code).toBe('skeptic'); // Should be in skeptic range
    expect(result.facets['skepticism']).toBeGreaterThan(60); // Should show high skepticism
  });
});