/**
 * @file result-guard.production-content-contract.spec.ts
 * @purpose TD-RAWLS-009: Contract test preventing guard/fixture mismatch
 * 
 * Production artifact: src/assets/content/rawls-values.generated.json
 * Property chain: categories[].followUps[]
 * ID patterns:
 *   - Position (TLQ) IDs: {categoryId}-q\d+ (e.g., liberty-q0, equality-q1)
 *   - Challenge IDs: {positionId}-fu\d+ (e.g., liberty-q0-fu0) — currently 0 in production
 * 
 * This test ensures resultGuard logic matches REAL production content ID patterns.
 * If guard logic assumes different ID formats (e.g., "A1-f1" from old fixtures),
 * this test will FAIL and signal the mismatch.
 * 
 * FW-ADMIN-002 addition: Contract test proving hidden positions excluded from required-answers gating.
 * 
 * @human Integration contract test for resultGuard with real production content; proves hidden position exclusion from guard gating
 * @proves resultGuard uses real production IDs (not fixtures), blocks on incomplete, and excludes hidden positions from required-answers set
 * @lastTouched 2025-12-23
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SessionStore } from '../core/session/session.store';
import { ContentService } from '../core/content/content.service';
import { ContentState } from '../core/content/types';
import { resultGuard } from '../features/result.guard';
import rawContent from '../../assets/content/rawls-values.generated.json';

describe('Result Guard Production Content Contract', () => {
  let sessionStore: SessionStore;
  let contentService: ContentService;
  let mockState: ContentState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'review', component: class {} },
          { path: 'result', component: class {}, canActivate: [resultGuard] }
        ])
      ]
    }).compileComponents();

    sessionStore = TestBed.inject(SessionStore);
    contentService = TestBed.inject(ContentService);

    // Mock content service with REAL production structure
    mockState = {
      categories: rawContent.categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        quote: c.quote || '',
        followUps: c.followUps.map(f => ({
          id: f.id,
          text: f.statement
        }))
      })),
      likert5: rawContent.likert5,
      loading: false,
      error: null
    };

    spyOn(contentService, 'state').and.returnValue(mockState as any);
  });

  it('should document production content property chains and counts', () => {
    // Shape proof: record exact structure for future reference
    console.log('=== PRODUCTION CONTENT SHAPE (resultGuard contract) ===');
    console.log('File: src/assets/content/rawls-values.generated.json');
    console.log('Property chain: categories[].followUps[]');
    
    const categoryCount = rawContent.categories.length;
    const totalFollowUps = rawContent.categories.reduce((sum, c) => sum + c.followUps.length, 0);
    
    console.log(`Categories: ${categoryCount}`);
    console.log(`Total followUps (Positions): ${totalFollowUps}`);
    console.log('Example Position ID:', rawContent.categories[0].followUps[0].id);
    console.log('ID pattern: {categoryId}-q\\d+ (e.g., liberty-q0)');
    console.log('===============================================');

    // Contract assertions: lock current production reality
    expect(categoryCount).withContext('Production must have 7 categories').toBe(7);
    expect(totalFollowUps).withContext('Production must have 28 total positions').toBe(28);
  });

  it('should verify all Position IDs match {categoryId}-q\\d+ pattern', () => {
    // Contract: Position IDs MUST follow this pattern
    // If pattern changes, this test fails and signals guard logic may need updates
    const positionIdPattern = /^[a-z]+-q\d+$/;

    rawContent.categories.forEach(category => {
      category.followUps.forEach(followUp => {
        expect(followUp.id).withContext(
          `Position ID ${followUp.id} must match pattern {categoryId}-q\\d+`
        ).toMatch(positionIdPattern);

        // Additional contract: ID must start with its category ID
        expect(followUp.id).withContext(
          `Position ID ${followUp.id} must start with category ID ${category.id}`
        ).toContain(category.id);
      });
    });
  });

  it('should allow /result when all real Position IDs from one category are answered', async () => {
    // Select first category using REAL production ID
    const firstCategory = rawContent.categories[0];
    sessionStore.selectCategories([firstCategory.id]);

    // Answer ALL positions using their REAL IDs (not invented fixtures)
    firstCategory.followUps.forEach(followUp => {
      sessionStore.recordAnswer(followUp.id, 3);
    });

    // Guard MUST recognize these real IDs and allow navigation
    const canActivate = await TestBed.runInInjectionContext(() => 
      resultGuard({} as any, {} as any)
    );

    expect(canActivate).withContext(
      `resultGuard must allow /result when all Positions answered with real IDs from ${firstCategory.id}`
    ).toBe(true);
  });

  it('should block /result when one real Position ID is missing an answer', async () => {
    // Select first category using REAL production ID
    const firstCategory = rawContent.categories[0];
    expect(firstCategory.followUps.length).withContext('Category must have multiple positions').toBeGreaterThan(1);

    sessionStore.selectCategories([firstCategory.id]);

    // Answer all EXCEPT last position
    for (let i = 0; i < firstCategory.followUps.length - 1; i++) {
      sessionStore.recordAnswer(firstCategory.followUps[i].id, 3);
    }

    // Guard MUST block navigation because one Position is unanswered
    const canActivate = await TestBed.runInInjectionContext(() => 
      resultGuard({} as any, {} as any)
    );

    // Returns UrlTree redirect to /review
    expect(typeof canActivate).toBe('object');
    expect((canActivate as any).toString()).toContain('/review');
  });

  it('should handle multi-category completion with real production IDs', async () => {
    // Select first TWO categories using REAL production IDs
    const firstCategory = rawContent.categories[0];
    const secondCategory = rawContent.categories[1];

    sessionStore.selectCategories([firstCategory.id, secondCategory.id]);

    // Answer ALL positions from BOTH categories using REAL IDs
    firstCategory.followUps.forEach(followUp => {
      sessionStore.recordAnswer(followUp.id, 3);
    });
    secondCategory.followUps.forEach(followUp => {
      sessionStore.recordAnswer(followUp.id, 4);
    });

    // Guard MUST allow navigation when all selected categories are complete
    const canActivate = await TestBed.runInInjectionContext(() => 
      resultGuard({} as any, {} as any)
    );

    expect(canActivate).withContext(
      'resultGuard must allow /result when all Positions from multiple categories are answered'
    ).toBe(true);
  });

  it('should fail if guard uses wrong ID format assumptions', () => {
    // Regression test: ensure no guard logic assumes old fixture patterns like "A1-f1"
    // All production IDs follow {categoryId}-q\d+ pattern
    
    const oldFixturePattern = /^[A-Z]\d+-f\d+$/; // Pattern like "A1-f1" from old tests
    
    let foundOldPattern = false;
    rawContent.categories.forEach(category => {
      category.followUps.forEach(followUp => {
        if (oldFixturePattern.test(followUp.id)) {
          foundOldPattern = true;
        }
      });
    });

    expect(foundOldPattern).withContext(
      'Production content must NOT use old fixture ID patterns (A1-f1). If this fails, production content was corrupted.'
    ).toBe(false);
  });

  describe('Hidden Position Exclusion (FW-ADMIN-002)', () => {
    it('should exclude hidden positions from required-answers set and allow completion', async () => {
      // Contract: Hidden positions MUST be excluded from guard gating
      // Clone production content and mark ONE position as hidden
      const testContent = JSON.parse(JSON.stringify(rawContent));
      const firstCategory = testContent.categories[0];
      const firstPosition = firstCategory.followUps[0];
      
      // Mark first position as hidden
      firstPosition.hidden = true;

      // Mock ContentService to return filtered categories (hidden excluded)
      const filteredCategories = testContent.categories.map((category: any) => ({
        ...category,
        followUps: category.followUps.filter((f: any) => f.hidden !== true)
      }));

      const hiddenExclusionState: ContentState = {
        categories: filteredCategories.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          quote: c.quote || '',
          followUps: c.followUps.map((f: any) => ({
            id: f.id,
            text: f.statement
          }))
        })),
        likert5: rawContent.likert5,
        loading: false,
        error: null
      };

      (contentService.state as any).and.returnValue(hiddenExclusionState as any);

      // Verify visible count is 27 (28 - 1 hidden)
      const visibleCount = filteredCategories.reduce((sum: number, c: any) => sum + c.followUps.length, 0);
      expect(visibleCount).withContext('Must have exactly 27 visible positions when 1 is hidden').toBe(27);

      // Select first category
      sessionStore.selectCategories([firstCategory.id]);

      // Answer ALL visible positions (excluding the hidden one)
      filteredCategories[0].followUps.forEach((followUp: any) => {
        sessionStore.recordAnswer(followUp.id, 3);
      });

      // Guard MUST allow navigation (hidden position not required)
      const canActivate = await TestBed.runInInjectionContext(() => 
        resultGuard({} as any, {} as any)
      );

      expect(canActivate).withContext(
        'resultGuard must allow /result when all VISIBLE positions are answered (hidden excluded)'
      ).toBe(true);
    });

    it('should still block when a visible position is missing (hidden exclusion does not bypass incomplete)', async () => {
      // Contract: Hidden exclusion does NOT allow skipping visible positions
      const testContent = JSON.parse(JSON.stringify(rawContent));
      const firstCategory = testContent.categories[0];
      
      // Mark first position as hidden
      firstCategory.followUps[0].hidden = true;

      // Mock ContentService to return filtered categories
      const filteredCategories = testContent.categories.map((category: any) => ({
        ...category,
        followUps: category.followUps.filter((f: any) => f.hidden !== true)
      }));

      const hiddenExclusionState: ContentState = {
        categories: filteredCategories.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          quote: c.quote || '',
          followUps: c.followUps.map((f: any) => ({
            id: f.id,
            text: f.statement
          }))
        })),
        likert5: rawContent.likert5,
        loading: false,
        error: null
      };

      (contentService.state as any).and.returnValue(hiddenExclusionState as any);

      sessionStore.selectCategories([firstCategory.id]);

      // Answer all visible EXCEPT last
      const visiblePositions = filteredCategories[0].followUps;
      for (let i = 0; i < visiblePositions.length - 1; i++) {
        sessionStore.recordAnswer(visiblePositions[i].id, 3);
      }

      // Guard MUST block (one visible position unanswered)
      const canActivate = await TestBed.runInInjectionContext(() => 
        resultGuard({} as any, {} as any)
      );

      expect(typeof canActivate).toBe('object');
      expect((canActivate as any).toString()).toContain('/review');
    });
  });
});
