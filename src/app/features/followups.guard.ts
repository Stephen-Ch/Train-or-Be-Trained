import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { SessionStore } from '../core/session/session.store';
import { ContentService } from '../core/content/content.service';

const resolveCategoryId = (segments: UrlSegment[]): string | undefined => segments[1]?.path;
const resolveTopLevelId = (segments: UrlSegment[]): string | undefined => segments[3]?.path;

/**
 * Extract unique TLQ IDs from a category's followUps.
 * Exported for contract testing against production content.
 */
export function extractTlqIds(followUps: Array<{ id: string }>): string[] {
  const optionIds = new Set<string>();
  followUps.forEach(followUp => {
    optionIds.add(followUp.id);
  });
  return Array.from(optionIds);
}

/**
 * Check if a TLQ ID exists in a category's followUps.
 * Exported for contract testing against production content.
 */
export function isTlqIdValid(followUps: Array<{ id: string }>, tlqId: string): boolean {
  return followUps.some(f => f.id === tlqId);
}

const hasAnsweredAllTopLevel = (
  categoryId: string,
  contentService: ContentService,
  store: SessionStore
): boolean => {
  const category = contentService.state().categories.find(c => c.id === categoryId);
  if (!category) {
    return false;
  }

  const answers = store.answers();
  const optionIds = extractTlqIds(category.followUps);

  if (!optionIds.length) {
    return false;
  }

  return optionIds.every(id => answers[id] !== undefined);
};

export const followupsGuard: CanMatchFn = (_route: Route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const store = inject(SessionStore);
  const contentService = inject(ContentService);

  const categoryId = resolveCategoryId(segments);
  const tlqId = resolveTopLevelId(segments);

  if (!categoryId || !tlqId) {
    return router.parseUrl('/select');
  }

  if (!hasAnsweredAllTopLevel(categoryId, contentService, store)) {
    return router.parseUrl(`/q/${categoryId}`);
  }

  // Ensure requested TLQ exists in this category's followUps
  const category = contentService.state().categories.find(c => c.id === categoryId);
  if (!category || !isTlqIdValid(category.followUps, tlqId)) {
    return router.parseUrl(`/q/${categoryId}`);
  }

  return true;
};
