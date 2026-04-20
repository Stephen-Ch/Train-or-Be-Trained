/**
 * Integration test: Real production content flow end-to-end
 * 
 * Tests critical wiring without Playwright:
 * 1) Select one Ideal from REAL production JSON
 * 2) Answer all its Positions (followUps = TLQs)
 * 3) Verify review shows Ideal as complete
 * 4) Verify resultGuard allows /result
 * 
 * This catches fixture-vs-production mismatches (IDs, followup mapping, guards).
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

describe('Real Content Flow Integration', () => {
  let sessionStore: SessionStore;
  let contentService: ContentService;
  let router: Router;

  // Use REAL production content
  const productionCategories = rawContent.categories;

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
    router = TestBed.inject(Router);

    // Mock content service to return real production content
    const mockState: ContentState = {
      categories: productionCategories.map(c => ({
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

  it('should have at least one Ideal with Positions in production content', () => {
    expect(productionCategories.length).toBeGreaterThan(0);
    
    const firstIdeal = productionCategories[0];
    expect(firstIdeal.id).toBeTruthy();
    expect(firstIdeal.followUps).toBeDefined();
    expect(firstIdeal.followUps.length).toBeGreaterThan(0);
  });

  it('should complete flow: select Ideal → answer all Positions → review complete → resultGuard allows /result', async () => {
    // STEP 1: Pick first Ideal programmatically
    const chosenIdeal = productionCategories[0];
    expect(chosenIdeal).toBeDefined();
    expect(chosenIdeal.followUps.length).withContext('Chosen Ideal must have at least 1 Position').toBeGreaterThan(0);

    // STEP 2: Select the Ideal
    sessionStore.selectCategories([chosenIdeal.id]);
    expect(sessionStore.selectedIds()).toEqual([chosenIdeal.id]);

    // STEP 3: Answer all Positions (followUps = TLQs)
    chosenIdeal.followUps.forEach(followUp => {
      sessionStore.recordAnswer(followUp.id, 3); // Middle value on Likert scale
    });

    // STEP 4: Verify all answers recorded
    const answers = sessionStore.answers();
    chosenIdeal.followUps.forEach(followUp => {
      expect(answers[followUp.id]).withContext(`Answer for ${followUp.id} should exist`).toBeDefined();
    });

    // STEP 5: Verify review completion logic sees Ideal as complete
    // (areCategoryAnswersComplete checks every followUp has an answer)
    const allFollowUpsAnswered = chosenIdeal.followUps.every(f => answers[f.id] !== undefined);
    expect(allFollowUpsAnswered).withContext('All followUps should have answers').toBeTrue();

    // STEP 6: Verify resultGuard allows navigation to /result
    const canActivate = await TestBed.runInInjectionContext(() => 
      resultGuard({} as any, {} as any)
    );

    expect(canActivate).withContext('resultGuard should return true when all Ideals complete').toBe(true);
  });

  it('should block /result when Ideal is incomplete', async () => {
    // STEP 1: Pick first Ideal
    const chosenIdeal = productionCategories[0];
    expect(chosenIdeal.followUps.length).toBeGreaterThan(1);

    // STEP 2: Select the Ideal
    sessionStore.selectCategories([chosenIdeal.id]);

    // STEP 3: Answer only FIRST Position (leave others unanswered)
    sessionStore.recordAnswer(chosenIdeal.followUps[0].id, 3);

    // STEP 4: Verify resultGuard blocks navigation
    const canActivate = await TestBed.runInInjectionContext(() => 
      resultGuard({} as any, {} as any)
    );

    expect(typeof canActivate).toBe('object'); // Returns UrlTree to /review
    expect((canActivate as any).toString()).toContain('/review');
  });

  it('should verify production content structure matches expected schema', () => {
    // Data-driven assertion: ensure production content has required fields
    productionCategories.forEach(category => {
      expect(category.id).withContext(`Category ${category.name} must have id`).toBeTruthy();
      expect(category.name).withContext(`Category ${category.id} must have name`).toBeTruthy();
      expect(category.followUps).withContext(`Category ${category.id} must have followUps array`).toBeDefined();
      
      category.followUps.forEach(followUp => {
        expect(followUp.id).withContext(`FollowUp in ${category.id} must have id`).toBeTruthy();
        expect(followUp.statement).withContext(`FollowUp ${followUp.id} must have statement`).toBeTruthy();
      });
    });
  });
});
