/**
 * @human Contract test: followupsGuard ID parsing must accept REAL production content IDs
 * @proves Guard helpers (extractTlqIds, isTlqIdValid) work with actual content format (e.g., liberty-q0)
 * @lastTouched 2025-12-22
 * 
 * This test prevents a repeat of Bug #5 where unit test fixtures used a format (A1-f1)
 * that didn't match production content (liberty-q0). The guard's regex never matched,
 * causing silent navigation failures.
 */

import { extractTlqIds, isTlqIdValid } from './followups.guard';
import rawlsContent from '../../assets/content/rawls-values.generated.json';

describe('followupsGuard production content contract', () => {
  // Load real production content
  const categories = rawlsContent.categories;

  it('should have at least one category in production content', () => {
    expect(categories.length).toBeGreaterThan(0);
  });

  it('should extract TLQ IDs from liberty category', () => {
    const liberty = categories.find(c => c.id === 'liberty');
    expect(liberty).toBeDefined();
    
    const tlqIds = extractTlqIds(liberty!.followUps);
    
    // Liberty should have 4 TLQs
    expect(tlqIds.length).toBe(4);
    
    // Regression proof: liberty-q0 MUST be in the extracted IDs
    expect(tlqIds).toContain('liberty-q0');
    expect(tlqIds).toContain('liberty-q1');
    expect(tlqIds).toContain('liberty-q2');
    expect(tlqIds).toContain('liberty-q3');
  });

  it('should validate liberty-q0 as a valid TLQ ID (Bug #5 regression)', () => {
    const liberty = categories.find(c => c.id === 'liberty');
    expect(liberty).toBeDefined();
    
    // This is the exact format that broke in Bug #5
    // The old regex ^([A-Z]\d+)- never matched "liberty-q0"
    expect(isTlqIdValid(liberty!.followUps, 'liberty-q0')).toBeTrue();
  });

  it('should reject non-existent TLQ IDs', () => {
    const liberty = categories.find(c => c.id === 'liberty');
    expect(liberty).toBeDefined();
    
    // These formats should NOT be valid
    expect(isTlqIdValid(liberty!.followUps, 'A1')).toBeFalse();
    expect(isTlqIdValid(liberty!.followUps, 'A1-f1')).toBeFalse();
    expect(isTlqIdValid(liberty!.followUps, 'liberty-q99')).toBeFalse();
    expect(isTlqIdValid(liberty!.followUps, '')).toBeFalse();
  });

  it('should extract TLQ IDs from all categories', () => {
    // Sample across all 7 categories to ensure format consistency
    for (const category of categories) {
      const tlqIds = extractTlqIds(category.followUps);
      
      // Each category should have TLQs
      expect(tlqIds.length).toBeGreaterThan(0);
      
      // Each TLQ ID should match the {categoryId}-q{n} format
      for (const tlqId of tlqIds) {
        expect(tlqId).toMatch(new RegExp(`^${category.id}-q\\d+$`));
      }
    }
  });

  it('should validate TLQ IDs across multiple categories', () => {
    // Sample from different categories
    const testCases = [
      { categoryId: 'liberty', tlqId: 'liberty-q0' },
      { categoryId: 'equality', tlqId: 'equality-q0' },
      { categoryId: 'community', tlqId: 'community-q0' },
    ];

    for (const { categoryId, tlqId } of testCases) {
      const category = categories.find(c => c.id === categoryId);
      expect(category).toBeDefined();
      expect(isTlqIdValid(category!.followUps, tlqId)).toBeTrue();
    }
  });
});
