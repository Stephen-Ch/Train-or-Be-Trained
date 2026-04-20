/**
 * @human ContentService tests: JSON loading, runtime/raw category splits, and error handling
 * @proves ContentService loads generated JSON, surfaces runtime vs raw categories, enforces contract counts, and reports load failures
 * @lastTouched 2025-12-23
 */
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ContentService } from './content.service';
import { ContentState } from './types';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ContentService
      ]
    });
    service = TestBed.inject(ContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state with loading true', () => {
    const initialState: ContentState = {
      categories: [],
      rawCategories: [],
      likert5: [],
      loading: true,
      error: null
    };
    expect(service.state()).toEqual(initialState);
  });

  it('should load categories from JSON successfully', async () => {
    await service.loadContent();
    const state = service.state();
    const rawCategories = state.rawCategories ?? [];
    
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.categories.length).toBeGreaterThan(0);
    expect(rawCategories.length).toBe(state.categories.length);
    expect(state.likert5.length).toBe(5);
  });

  it('should handle bad JSON gracefully', async () => {
    // This test will be implemented when we have the service
    spyOn(service as any, 'fetchContent').and.returnValue(
      Promise.resolve('invalid json')
    );
    
    await service.loadContent();
    const state = service.state();
    
    expect(state.loading).toBe(false);
    expect(state.error).toBeTruthy();
    expect(state.categories).toEqual([]);
    expect(state.likert5).toEqual([]);
  });

  it('should handle network errors gracefully', async () => {
    spyOn(service as any, 'fetchContent').and.returnValue(
      Promise.reject(new Error('Network error'))
    );
    
    await service.loadContent();
    const state = service.state();
    
    expect(state.loading).toBe(false);
    expect(state.error).toBeTruthy();
    expect(state.categories).toEqual([]);
    expect(state.likert5).toEqual([]);
  });

  it('should keep the content contract at seven structured categories', async () => {
    await service.loadContent();
    const state = service.state();
    const rawCategories = state.rawCategories ?? [];

    expect(state.categories.length).toBe(7);
    expect(rawCategories.length).toBe(7);

    const structuredCategory = state.categories.find(category =>
      category.followUps.some(followUp =>
        typeof followUp.statement === 'string' &&
        typeof followUp.dimension === 'string' &&
        typeof followUp.reverse === 'boolean'
      )
    );

    expect(structuredCategory).toBeDefined();

    const structuredFollowUp = structuredCategory?.followUps.find(followUp =>
      typeof followUp.statement === 'string' &&
      typeof followUp.dimension === 'string' &&
      typeof followUp.reverse === 'boolean'
    );

    expect(structuredFollowUp).toBeDefined();
  });

  it('should exclude hidden followUps from runtime categories while retaining raw data', async () => {
    const sampleContent = {
      likert5: ['one', 'two', 'three', 'four', 'five'],
      categories: [
        {
          id: 'liberty',
          name: 'Liberty',
          description: 'Desc',
          quote: '',
          followUps: [
            { id: 'liberty-q0', statement: 'Visible prompt', reverse: false, dimension: 'liberty-q0' },
            { id: 'liberty-q1', statement: 'Hidden prompt', reverse: false, dimension: 'liberty-q1', hidden: true }
          ]
        }
      ]
    };

    spyOn<any>(service, 'fetchContent').and.returnValue(Promise.resolve(JSON.stringify(sampleContent)));

    await service.loadContent();
    const state = service.state();
    const rawCategories = state.rawCategories ?? [];

    expect(state.categories[0].followUps.length).toBe(1);
    expect(state.categories[0].followUps[0].id).toBe('liberty-q0');
    expect(rawCategories[0].followUps.length).toBe(2);
    const hiddenFollowUp = rawCategories[0].followUps.find(followUp => followUp.id === 'liberty-q1');
    expect(hiddenFollowUp?.hidden).toBeTrue();
  });
});