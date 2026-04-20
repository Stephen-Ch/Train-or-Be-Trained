# RAWLS-REPORT-003 — Routing + Hydration Order Map

**Generated**: 2025-12-21  
**Prompt**: RAWLS-REPORTS-001-S0A-GENERATE-SESSION-ROUTING-TEST-MAPS-001

---

## Search Commands Run

```powershell
git grep -n "provideRouter|Routes|app\.routes|canActivate|resolve|ActivatedRoute|paramMap|router\.navigate|navigateByUrl" src/app
```

---

## Route Configuration

**File**: `src/app/app.routes.ts`

| Path | Component | Guard | Notes |
|------|-----------|-------|-------|
| `/` | `IntroComponent` | — | Landing page |
| `/select` | `SelectComponent` | — | Category selection |
| `/q/:id` | `QuestionComponent` | — | TLQ phase for category |
| `/q/:id/followups/:tlqId` | `QuestionComponent` | `followupsGuard` (canMatch) | Dynamic route added in `ngOnInit` |
| `/review` | `ReviewComponent` | — | Answer review |
| `/result` | `ResultComponent` | `resultGuard` | Requires all categories complete |
| `/store` | `StoreComponent` | — | Premium features |

---

## On Cold Load Sequence (e.g., direct navigation to `/q/liberty`)

1. **Angular bootstraps** → `app.config.ts` calls `provideRouter(routes)`
2. **Router activates** `/q/:id` route → `QuestionComponent` matched
3. **QuestionComponent.ngOnInit()** runs:
   - Calls `contentService.loadContent()` (async fetch)
   - Dynamically adds `/q/:id/followups/:tlqId` route if missing
   - Subscribes to `route.params` → sets `currentId = 'liberty'`
   - Calls `autoSelectCategoryIfNeeded()` (now handled by effect)
4. **contentLoadedEffect** (Angular effect) fires when:
   - `categories.length > 0` AND
   - `currentId` is set AND
   - `selectedIds.length === 0` AND
   - `!categoryAutoSelected`
5. **Auto-select occurs**: `sessionStore.selectCategories([currentId])`
   - This single-selects the route's category
6. **currentCategory computed updates** → UI renders TLQ cards
7. **User answers TLQs** → `recordAnswer()` called
8. **Continue navigates** → `/q/:id/followups/:firstTlqId`

---

## Where Route Param `:id` is Read

| Location | How | Action |
|----------|-----|--------|
| `question.component.ts` L305 | `this.route.params.subscribe(params => this.currentId = params['id'])` | Sets component's `currentId` |
| `followups.guard.ts` L41 | `resolveCategoryId(segments)` → `segments[1]?.path` | Used for guard logic |

---

## Where Auto-Select Occurs

**File**: `question.component.ts` lines 338-352

```typescript
private contentLoadedEffect = effect(() => {
  const categories = this.contentService.state().categories;
  const currentId = this.currentId;
  const selectedIds = this.sessionStore.selectedIds();

  if (categories.length === 0 || !currentId || this.categoryAutoSelected) {
    return;
  }

  const category = categories.find(c => c.id === currentId);
  if (category && selectedIds.length === 0) {
    this.categoryAutoSelected = true;
    this.sessionStore.selectCategories([currentId]);
  }
});
```

**Trigger**: Content loads + route has `:id` + no categories selected → auto-selects single category.

---

## Risk List (State/Route Mismatch)

1. **Auto-select overwrites multi-category intent**: If user refreshes mid-flow, only the current category is re-selected, losing others
2. **Sequence mismatch on hydration**: `sequence` is alphabetically sorted; if persisted order differs, resumeIndex may be wrong
3. **getResumeIndex checks wrong key**: Uses `answers[categoryId]` but answers are keyed by `questionId` (e.g., `liberty-q0`)
4. **No guard on `/q/:id`**: User can navigate to category not in `selectedIds`; auto-select kicks in but may not match intent
5. **Dynamic route addition timing**: `/q/:id/followups/:tlqId` added in `ngOnInit`; race possible if deep link used before component init
6. **TLQ option sessionStorage orphan**: `rawls-option-{categoryId}` may reference deleted TLQ after content update

---

*End of report*
