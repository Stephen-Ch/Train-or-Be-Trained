import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { resultGuard } from './result.guard';
import { SessionStore } from '../core/session/session.store';
import { ContentService } from '../core/content/content.service';

const categoryFixture = {
  id: 'A',
  name: 'Justice',
  description: '',
  quote: '',
  followUps: [
    { id: 'A1-f1' },
    { id: 'A1-f2' },
    { id: 'A2-f1' }
  ]
};

describe('resultGuard', () => {
  let store: {
    selectedIds: () => string[];
    answers: () => Record<string, number>;
  };
  let router: { parseUrl: jasmine.Spy<(url: string) => UrlTree> };

  beforeEach(() => {
    store = {
      selectedIds: () => ['A'],
      answers: () => ({})
    };
    router = {
      parseUrl: jasmine.createSpy('parseUrl').and.callFake((url: string) => ({ url } as unknown as UrlTree))
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
        {
          provide: ContentService,
          useValue: {
            state: () => ({ categories: [categoryFixture], likert5: [], loading: false, error: null })
          }
        },
        { provide: SessionStore, useValue: store }
      ]
    });
  });

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      resultGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  it('redirects to review when any followUp is unanswered', () => {
    // Only 1 of 3 followUps answered
    store.answers = () => ({ 'A1-f1': 5 });

    const outcome = runGuard();

    expect(router.parseUrl).toHaveBeenCalledWith('/review');
    expect((outcome as unknown as { url: string }).url).toBe('/review');
  });

  it('allows navigation when every followUp is answered', () => {
    // All 3 followUps answered (using full followUp IDs only)
    store.answers = () => ({ 'A1-f1': 4, 'A1-f2': 2, 'A2-f1': 5 });

    const outcome = runGuard();

    expect(router.parseUrl).not.toHaveBeenCalled();
    expect(outcome).toBeTrue();
  });

  // BUG-RAWLS-009: Guard must allow when answers use full followUp IDs (no separate topLevel)
  it('allows navigation when answers use full followUp IDs like category-qN', () => {
    // Override fixture to match real content pattern: followUps with IDs like 'liberty-q0'
    TestBed.overrideProvider(ContentService, {
      useValue: {
        state: () => ({
          categories: [{
            id: 'liberty',
            name: 'Liberty',
            description: '',
            quote: '',
            followUps: [
              { id: 'liberty-q0' },
              { id: 'liberty-q1' },
              { id: 'liberty-q2' },
              { id: 'liberty-q3' }
            ]
          }],
          likert5: [],
          loading: false,
          error: null
        })
      }
    });
    store.selectedIds = () => ['liberty'];
    store.answers = () => ({
      'liberty-q0': 5,
      'liberty-q1': 4,
      'liberty-q2': 3,
      'liberty-q3': 2
    });

    const outcome = runGuard();

    expect(router.parseUrl).not.toHaveBeenCalled();
    expect(outcome).toBeTrue();
  });

  // BUG-RAWLS-011: Guard must allow /result with query params (e.g., ?persona=1)
  it('allows navigation regardless of query params in state.url when answers complete', () => {
    // Setup complete answers
    TestBed.overrideProvider(ContentService, {
      useValue: {
        state: () => ({
          categories: [{
            id: 'liberty',
            name: 'Liberty',
            description: '',
            quote: '',
            followUps: [
              { id: 'liberty-q0' },
              { id: 'liberty-q1' }
            ]
          }],
          likert5: [],
          loading: false,
          error: null
        })
      }
    });
    store.selectedIds = () => ['liberty'];
    store.answers = () => ({
      'liberty-q0': 4,
      'liberty-q1': 3
    });

    // Guard should allow both /result and /result?persona=1
    const outcomeWithoutQuery = TestBed.runInInjectionContext(() =>
      resultGuard({} as ActivatedRouteSnapshot, { url: '/result' } as RouterStateSnapshot)
    );
    const outcomeWithQuery = TestBed.runInInjectionContext(() =>
      resultGuard({} as ActivatedRouteSnapshot, { url: '/result?persona=1' } as RouterStateSnapshot)
    );

    expect(router.parseUrl).not.toHaveBeenCalled();
    expect(outcomeWithoutQuery).toBeTrue();
    expect(outcomeWithQuery).toBeTrue();
  });
});
