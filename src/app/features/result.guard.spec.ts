/**
 * V2 resultGuard tests
 * @proves Guard allows /result when hasSavedProgress, redirects to /setup otherwise
 */
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { resultGuard } from './result.guard';
import { SessionStore } from '../core/session/session.store';

describe('resultGuard (V2)', () => {
  let router: { parseUrl: jasmine.Spy<(url: string) => UrlTree> };

  const makeStore = (hasProgress: boolean) => ({
    hasSavedProgress: () => hasProgress,
    answers: () => hasProgress ? { 'continuity-q1': 'A' as const } : {}
  });

  beforeEach(() => {
    router = {
      parseUrl: jasmine.createSpy('parseUrl').and.callFake((url: string) => ({ url } as unknown as UrlTree))
    };
  });

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      resultGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  it('allows navigation when user has saved progress', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
        { provide: SessionStore, useValue: makeStore(true) }
      ]
    });

    const outcome = runGuard();

    expect(router.parseUrl).not.toHaveBeenCalled();
    expect(outcome).toBeTrue();
  });

  it('redirects to /setup when user has no saved progress', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
        { provide: SessionStore, useValue: makeStore(false) }
      ]
    });

    const outcome = runGuard();

    expect(router.parseUrl).toHaveBeenCalledWith('/setup');
    expect((outcome as unknown as { url: string }).url).toBe('/setup');
  });
});
