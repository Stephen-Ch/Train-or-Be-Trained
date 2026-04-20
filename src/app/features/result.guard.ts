import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../core/session/session.store';

/**
 * V2 result guard — allow access to /result only if the user has
 * answered at least one question. Full completion is not strictly
 * required (scoring handles missing answers gracefully), but we
 * redirect to /setup if they've answered nothing at all.
 */
export const resultGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(SessionStore);

  return store.hasSavedProgress()
    ? true
    : router.parseUrl('/setup');
};
