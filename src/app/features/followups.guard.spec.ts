import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { followupsGuard } from './followups.guard';
import { SessionStore } from '../core/session/session.store';
import { ContentService } from '../core/content/content.service';

const makeSegments = () => [
  new UrlSegment('q', {}),
  new UrlSegment('A', {}),
  new UrlSegment('followups', {}),
  new UrlSegment('A-q0', {})
];

const categoryFixture = {
  id: 'A',
  name: 'Justice & Fairness',
  description: '',
  quote: '',
  followUps: [
    { id: 'A-q0', text: 'Follow up 0' },
    { id: 'A-q1', text: 'Follow up 1' },
    { id: 'A-q2', text: 'Follow up 2' }
  ]
};

describe('followupsGuard', () => {
  let store: { answers: () => Record<string, number> };
  let router: { parseUrl: jasmine.Spy<(url: string) => UrlTree> };

  beforeEach(() => {
    store = { answers: () => ({}) };
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

  it('redirects to top-level when any top-level question is unanswered', () => {
    store.answers = () => ({ 'A-q0': 4, 'A-q2': 5 });

    const result = TestBed.runInInjectionContext(() => followupsGuard({} as Route, makeSegments()));
  expect(router.parseUrl).toHaveBeenCalledWith('/q/A');
  expect((result as unknown as { url: string }).url).toBe('/q/A');
  });

  it('allows navigation when all top-level questions are answered', () => {
    store.answers = () => ({ 'A-q0': 4, 'A-q1': 3, 'A-q2': 5 });

    const result = TestBed.runInInjectionContext(() => followupsGuard({} as Route, makeSegments()));
    expect(router.parseUrl).not.toHaveBeenCalled();
    expect(result).toBeTrue();
  });
});
