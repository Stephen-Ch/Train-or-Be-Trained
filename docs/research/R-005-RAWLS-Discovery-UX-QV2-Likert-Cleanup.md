# Discovery Report: UX-QV2 Mindset & Likert Cleanup

**Date:** 2025-12-30  
**Prompt ID:** UX-QV2-MINDSET-LIKERT-CLEANUP-DISCOVERY-001  
**Branch:** feature/FW-ADMIN-002D-challenge-likert-map-label  
**Status:** Clean (no uncommitted changes)

## Summary

Investigation of two UX issues on /q/:id screen (QuestionV2Component):
1. **Mindset UI redundancy**: "What mindset?" button appears non-functional before first acknowledgment
2. **Likert label duplication**: Labels appear twice (full label row + axis endpoint row)

## Issue A: Mindset UI — "What mindset?" Does Nothing

### Elements Identified

From [question-v2.component.ts](src/app/features/question-v2.component.ts):

| Element | Lines | Purpose | Text |
|---------|-------|---------|------|
| VEIL_MICRO row | 15 | Always-visible reminder | "Veil-of-ignorance: answer as if you could be anyone." |
| VEIL_TOGGLE button | 16-22 | Toggle explainer box | "What mindset?" |
| VEIL_BOX | 25-37 | Explainer box | "Imagine you could be anyone in this society. Answer for the fairest outcome, not just yourself." |
| VEIL_ACK button | 29-36 | Dismiss/acknowledge | "Got it" |

### Root Cause: Conditional Toggle Logic

**File:** [question-v2.component.ts](src/app/features/question-v2.component.ts#L363-L369)

```typescript
protected onToggleVeilBox(): void {
  if (!this.sessionStore.veilAcknowledged()) {
    this.veilBoxOpen.set(true);  // ← BUG: box already open!
    return;
  }
  this.veilBoxOpen.update(open => !open);  // ← Only works AFTER ack
}
```

**File:** [question-v2.component.ts](src/app/features/question-v2.component.ts#L220-L223)

```typescript
protected shouldShowVeilBox = computed(() => {
  const acknowledged = this.sessionStore.veilAcknowledged();
  return !acknowledged || this.veilBoxOpen();
  // ↑ When NOT acknowledged: returns true (box always shown)
  // ↑ When acknowledged: returns veilBoxOpen() (toggle controls it)
});
```

### Behavior Analysis

**Before first acknowledgment:**
1. User sees: VEIL_MICRO row + "What mindset?" button + VEIL_BOX (all 3 elements visible)
2. User clicks "What mindset?" → handler checks `!veilAcknowledged()` → true
3. Handler sets `veilBoxOpen.set(true)` → no-op (already true)
4. shouldShowVeilBox() returns `true` (via `!acknowledged`) → box stays visible
5. **Result: Button does NOTHING**

**After clicking "Got it" once:**
1. sessionStore.acknowledgeVeil() called → persists to localStorage
2. Box hidden (shouldShowVeilBox returns false)
3. Now clicking "What mindset?" works: toggles veilBoxOpen state
4. **Result: Button NOW works**

### Why This Is Confusing

User sees TWO controls (row text + button) AND the box, but only "Got it" dismisses it. The "What mindset?" button appears broken. Toggle behavior only activates after first dismissal, creating inconsistent UX.

## Issue B: Likert Label Duplication

### Template Structure

From [question-v2.component.ts](src/app/features/question-v2.component.ts#L65-L73):

**Row 1 (lines 66-69): Full labels (5 spans)**
```typescript
<div class="flex justify-between text-[0.75rem]" data-testid="likert-labels">
  @for (label of getLikertLabels(item.statement); track label) {
    <span data-testid="likert-label">{{ label }}</span>
  }
</div>
```

**Row 2 (lines 70-73): Axis endpoints (2 spans)**
```typescript
<div class="flex justify-between text-[0.75rem] text-gray-400" data-testid="likert-axis">
  <span data-testid="likert-axis-left">{{ getLikertAxisLeft(item.statement) }}</span>
  <span data-testid="likert-axis-right">{{ getLikertAxisRight(item.statement) }}</span>
</div>
```

Same pattern repeated for challenge cards (lines 138-146).

### Source Constants

From [terminology.ts](src/app/shared/terminology.ts):

**Importance scale (for "How important is..." questions):**
- Lines 40-46: IMPORTANCE_SCALE_LABELS array (5 items)
  - `['Not at all important', 'Slightly important', 'Moderately important', 'Very important', 'Extremely important']`
- Line 50: IMPORTANCE_AXIS_LEFT: `'Not important'`
- Line 51: IMPORTANCE_AXIS_RIGHT: `'Extremely important'`

**Agreement scale (for challenge questions):**
- Lines 27-33: SCALE_LABELS array (5 items)
  - `['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']`
- Line 36: SCALE_AXIS_LEFT: `'Disagree'`
- Line 37: SCALE_AXIS_RIGHT: `'Agree'`

### Specific Duplicates

**Importance questions:**
1. "Extremely important" — appears in BOTH IMPORTANCE_SCALE_LABELS[4] AND IMPORTANCE_AXIS_RIGHT
2. "Not important" (axis) vs "Not at all important" (label[0]) — similar/redundant

**Agreement questions:**
1. "Disagree" — appears in BOTH SCALE_LABELS[1] AND SCALE_AXIS_LEFT
2. "Agree" — appears in BOTH SCALE_LABELS[3] AND SCALE_AXIS_RIGHT

### Visual Result

User sees labels rendered in TWO rows:
- Row 1: All 5 labels spread across width
- Row 2: Left and right endpoints (duplicating content from row 1)

Example for importance:
```
Row 1: Not at all important | Slightly important | Moderately important | Very important | Extremely important
Row 2: Not important ←────────────────────────────────────────────────────────────────────→ Extremely important
```

## Blast Radius Analysis

### Components Affected

**Veil reminder:**
- [question-v2.component.ts](src/app/features/question-v2.component.ts) — Primary V2 flow
- [review.component.ts](src/app/features/review.component.ts) — Lines 77-98, same veil pattern
- [question.component.ts](src/app/features/question.component.ts) — Legacy V1 (uses same TERMINOLOGY)

**Likert labels:**
- [question-v2.component.ts](src/app/features/question-v2.component.ts) — V2 flow
- [question.component.ts](src/app/features/question.component.ts) — V1 flow (line 275-276)
- Both use same TERMINOLOGY constants

### Tests That Would Fail

**Veil toggle changes:**
- [question-v2.component.spec.ts](src/app/features/question-v2.component.spec.ts#L203-L212): "shows veil reminder box when not acknowledged"
  - Expects box visible initially
- [question-v2.component.spec.ts](src/app/features/question-v2.component.spec.ts#L214-L237): "hides veil box after acknowledging and persists across reloads"
  - Expects box hidden after ack, stays hidden on reload
- [review.component.spec.ts](src/app/features/review.component.spec.ts#L179-L195): "shows veil micro nudge and re-opens mindset text in review"
  - Expects toggle to re-open box AFTER acknowledging

**Likert label changes:**
- [question-v2.component.spec.ts](src/app/features/question-v2.component.spec.ts#L338-L370): "renders Likert labels in V2"
  - Line 343: Asserts exact match for all 5 IMPORTANCE_SCALE_LABELS
  - Lines 346-347: Asserts IMPORTANCE_AXIS_LEFT and IMPORTANCE_AXIS_RIGHT exist
  - Line 363: Asserts exact match for all 5 SCALE_LABELS
  - Lines 366-367: Asserts SCALE_AXIS_LEFT and SCALE_AXIS_RIGHT exist
  - **If we remove axis row or change label text, this test WILL FAIL**

## Fix Options

### Option 1: Minimum Change (Fix Toggle Only)

**Scope:** Fix "What mindset?" non-functional behavior only

**Changes:**
- [question-v2.component.ts](src/app/features/question-v2.component.ts#L363-L369): Modify onToggleVeilBox()
- [review.component.ts](src/app/features/review.component.ts#L326-L331): Same change

**Logic change:**
```typescript
// Before:
protected onToggleVeilBox(): void {
  if (!this.sessionStore.veilAcknowledged()) {
    this.veilBoxOpen.set(true);
    return;
  }
  this.veilBoxOpen.update(open => !open);
}

// After:
protected onToggleVeilBox(): void {
  this.veilBoxOpen.update(open => !open);
}
```

**Impact:**
- Files changed: 2
- Tests changed: 0 (existing tests should still pass)
- Risk: LOW

**Pros:**
- Smallest possible change
- Makes "What mindset?" immediately functional
- No terminology changes
- No test updates required

**Cons:**
- Doesn't address redundancy (still 3 veil elements visible at once)
- Doesn't fix Likert duplication
- UX still cluttered

### Option 2: Full UX Simplification (Stephen's Proposal)

**Scope:** Single-row Likert + consolidated veil UI

**Part A: Likert simplification**

Changes to [terminology.ts](src/app/shared/terminology.ts):
- Lines 40-46: Shorten IMPORTANCE_SCALE_LABELS
  - Before: `['Not at all important', 'Slightly important', 'Moderately important', 'Very important', 'Extremely important']`
  - After: `['Not', 'Slightly', 'Moderately', 'Very', 'Extremely']`
- Lines 27-33: Similar for SCALE_LABELS (optional)
- Lines 36-37, 50-51: Remove axis constants OR keep for accessibility

Changes to templates:
- [question-v2.component.ts](src/app/features/question-v2.component.ts#L70-L73): REMOVE likert-axis row
- [question.component.ts](src/app/features/question.component.ts): Same template change

**Part B: Veil consolidation (choose one)**
- Option 2a: Remove VEIL_MICRO row, keep only toggle + box
- Option 2b: Remove toggle, keep VEIL_MICRO + always-visible box until ack

**Impact:**
- Files changed: 4-5 (terminology.ts, question-v2.component.ts, question.component.ts, possibly review.component.ts, 2+ spec files)
- Tests changed: 2 minimum (question-v2.component.spec.ts, possibly question.component.spec.ts)
- Risk: MEDIUM-HIGH

**Pros:**
- Cleaner UX (no duplicate labels)
- Simpler mental model
- Removes redundancy completely

**Cons:**
- Larger scope (5+ files)
- Higher risk (changes core terminology)
- May affect accessibility (shorter labels less explicit)
- Breaking change for documentation

## Recommended Next Step

**PROMPT-ID:** UX-QV2-FIX-VEIL-TOGGLE-NOOP-001

**Goal:** Fix "What mindset?" toggle to work BEFORE first acknowledgment, not just after

**Scope:** question-v2.component.ts and review.component.ts only; NO terminology changes, NO Likert changes

**Rationale:** Highest-confidence bug is veil toggle non-functional behavior. User sees a button that does nothing. Smallest fix with zero risk to labels/terminology.

**RED Assertion:**
Add test to question-v2.component.spec.ts: "allows toggling veil box before acknowledgment"
- Arrange: Fresh sessionStore (veil NOT acknowledged), render component
- Assert: veil box visible initially
- Act: Click veil-toggle button
- Assert: veil box now HIDDEN (toggle worked)
- Act: Click veil-toggle again
- Assert: veil box VISIBLE again (toggle works both ways)

**GREEN Change:**
Modify onToggleVeilBox() in question-v2.component.ts (lines 363-369):
- Remove conditional `if (!this.sessionStore.veilAcknowledged())`
- Replace entire method body with: `this.veilBoxOpen.update(open => !open);`
- Repeat same change in review.component.ts (lines 326-331)

**Verification:**
- Focused test: `npm run test -- --include='**/question-v2.component.spec.ts'`
- Full suite: `npm run test` (expect 248 SUCCESS after adding 1 new test)
- Build: `npm run build`

**Files changed:** 2 (question-v2.component.ts, review.component.ts)  
**Tests added:** 1 (question-v2.component.spec.ts)

**Defer to future prompt:** Likert label duplication fix (separate concern, requires terminology changes + multiple test updates)

## Evidence Index

### Veil UI Implementation
- Terminology constants: [terminology.ts](src/app/shared/terminology.ts#L69-L72)
- QuestionV2 template: [question-v2.component.ts](src/app/features/question-v2.component.ts#L14-L37)
- Toggle handler: [question-v2.component.ts](src/app/features/question-v2.component.ts#L363-L369)
- Visibility computed: [question-v2.component.ts](src/app/features/question-v2.component.ts#L220-L223)
- Acknowledge handler: [question-v2.component.ts](src/app/features/question-v2.component.ts#L372-L375)

### Likert UI Implementation
- Scale constants: [terminology.ts](src/app/shared/terminology.ts#L27-L51)
- Position template (2 rows): [question-v2.component.ts](src/app/features/question-v2.component.ts#L65-L73)
- Challenge template (2 rows): [question-v2.component.ts](src/app/features/question-v2.component.ts#L138-L146)
- Label selection logic: [question-v2.component.ts](src/app/features/question-v2.component.ts#L314-L332)

### Test Coverage
- Veil box visibility: [question-v2.component.spec.ts](src/app/features/question-v2.component.spec.ts#L203-L237)
- Veil toggle (review): [review.component.spec.ts](src/app/features/review.component.spec.ts#L179-L195)
- Likert labels rendering: [question-v2.component.spec.ts](src/app/features/question-v2.component.spec.ts#L338-L370)

## Related Documentation
- Solution report entry: [solution-report.md](docs/status/solution-report.md#L209-L211) — 2025-12-25 veil reminder implementation
- AI handoff note: [ai-handoff.md](docs/status/ai-handoff.md#L22) — Veil-of-ignorance terminology lock
- Test catalog: [test-catalog.md](docs/testing/test-catalog.md#L55) — QuestionV2 veil box/micro toggle behavior
