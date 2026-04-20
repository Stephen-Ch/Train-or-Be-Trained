import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { SessionStore } from '../core/session/session.store';
import { ContentService } from '../core/content/content.service';

// BUG-RAWLS-009: Removed extractTopLevelIds — followUp IDs ARE the TLQ IDs (e.g., 'liberty-q0').
// The old logic split 'liberty-q0' to 'liberty' and checked answers['liberty'], which never existed.

const areCategoryAnswersComplete = (
  categoryId: string,
  answers: Record<string, number>,
  contentService: ContentService
): boolean => {
  const category = contentService.state().categories.find(c => c.id === categoryId);
  if (!category || !category.followUps.length) {
    return false;
  }

  // Check that every followUp (which IS a TLQ) has an answer using its full ID
  return category.followUps.every(f => answers[f.id] !== undefined);
};

export const resultGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const store = inject(SessionStore);
  const contentService = inject(ContentService);

  const selectedIds = store.selectedIds();
  if (!selectedIds.length) {
    return router.parseUrl('/review');
  }

  const answers = store.answers();
  const allComplete = selectedIds.every(id => areCategoryAnswersComplete(id, answers, contentService));

  return allComplete ? true : router.parseUrl('/review');
};
