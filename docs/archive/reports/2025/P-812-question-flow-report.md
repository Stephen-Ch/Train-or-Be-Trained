# P-812 QUESTION-FLOW-REPORT-01

**Date:** November 27, 2025  
**Type:** Analysis Report (no code changes)

## User Story

As a player, when I pick 2+ categories and hit Start, I want to see them in the intended order and be able to advance with Continue after finishing each one, instead of jumping to the wrong category or getting "stuck" when I click Continue.

## Observed Behaviour

| Step | Expected | Actual |
|------|----------|--------|
| Start → category selection | OK | OK |
| Pick 2 categories, submit | First selected category shows | Second selected category shows |
| Complete category, click Continue | Next category shows | No action; stuck |
| Manually navigate to first category, complete, click Continue | Next category shows | No action |

---

## Files Inspected

1. `src/app/features/select.component.ts` — Category selection UI
2. `src/app/features/select.component.spec.ts` — Selection tests
3. `src/app/core/session/session.store.ts` — Session state management
4. `src/app/features/question.component.ts` — Question flow logic

---

## How Selected Category IDs Are Stored

1. **SelectComponent.onCategoryChange()**: Adds/removes IDs to an array, calls `sessionStore.selectCategories(ids)`
2. **SessionStore.selectCategories()**: Stores the raw array in `_selectedIds` signal
3. **SessionStore.sequence**: A **computed** that returns `[...this._selectedIds()].sort()` — **alphabetically sorted**

**Selection order is NOT preserved.** Regardless of click order, sequence is always alphabetical.

---

## How Current Category Is Chosen

1. **SelectComponent.onContinue()**: Navigates to `/q/${sequence[0]}` — the **first alphabetically sorted** category
2. **QuestionComponent**: Reads `this.currentId` from route params

---

## What Continue Click Handler Does

### Phase: chooseOption (top-level question cards)

```
onContinue()
  → if all TLQs answered:
      → router.navigate(['/q', currentId, 'followups', first])
      → Goes to followups for SAME category
```

### Phase: followUps (deeper dives)

```
onContinue()
  → advanceFollowUps()
      → if more followUps for this option: increment index
      → else if more options (TLQs): navigate to next option's followups
      → else:
          → router.navigate(['/q', this.currentId])  ← BACK TO SAME CATEGORY!
```

---

## Root Causes

### (a) Starting on the "Second" Category

**Not actually a bug** — by design, `sequence` is alphabetically sorted (line 21 in `session.store.ts`):

```typescript
private _sequence = computed(() => [...this._selectedIds()].sort());
```

If user picks "Security" then "Liberty", the sequence becomes `['liberty', 'security']`, and the app navigates to `liberty` first.

The test in `select.component.spec.ts` explicitly verifies this:
```typescript
sessionStore.selectCategories(['B', 'A', 'C']); // Should sequence to A, B, C
expect(router.navigate).toHaveBeenCalledWith(['/q', 'A']);
```

If user expectation is "first picked = first shown", this is a **design mismatch**, not a code bug.

### (b) Continue Doing Nothing After Finishing a Category

**BUG CONFIRMED.** In `advanceFollowUps()` (lines 450-453):

```typescript
} else if (this.returnTo === 'review') {
  this.router.navigate(['/review']);
} else {
  this.router.navigate(['/q', this.currentId]);  // ← Same category!
}
```

After finishing all followUps for a category, it navigates **back to the same category's top-level view** instead of advancing to the next category.

The `navigateNext()` method exists and correctly advances:

```typescript
private navigateNext(): void {
  const sequence = this.sessionStore.sequence();
  const currentIndex = sequence.indexOf(this.currentId);
  const nextIndex = currentIndex + 1;
  
  if (nextIndex < sequence.length) {
    this.router.navigate(['/q', sequence[nextIndex]]);
  } else {
    this.router.navigate(['/review']);
  }
}
```

But it's **never called** when finishing a category — only called from `navigateAfterAction()`, which is only triggered by `onSkip()`.

---

## Suggested Fixes

### Fix 1: "Stuck on Continue" (Critical)

In `advanceFollowUps()`, replace:
```typescript
this.router.navigate(['/q', this.currentId]);
```
with:
```typescript
this.navigateNext();
```

### Fix 2: "Wrong First Category" (Optional — Design Decision)

If user-selection-order is desired instead of alphabetical, remove `.sort()` from `SessionStore._sequence`:

```typescript
// Before:
private _sequence = computed(() => [...this._selectedIds()].sort());

// After:
private _sequence = computed(() => [...this._selectedIds()]);
```

**Note:** This would require updating test expectations in `select.component.spec.ts`.

---

## Recommendation

Implement Fix 1 immediately — it's a clear bug preventing game progression.

Fix 2 should be discussed as a product decision: alphabetical order provides predictability, but selection order may feel more natural to users.
