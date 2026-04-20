# Closeout: BUG-RAWLS-006 — Review completion gate shows "TLQs 0/1"

**Date:** 2025-12-22  
**Type:** Bug fix  
**Status:** ✅ Complete

## Problem Statement

After completing categories + followups, `/review` showed "TLQs 0/1" and disabled "See Results" even when all TLQs were answered.

## Root Cause

`review.component.ts` line 82 extracted TLQ IDs by splitting followUp IDs on `-`:

```typescript
const tlqIds = Array.from(new Set(category.followUps.map(f => f.id.split('-')[0])));
```

This converted `'liberty-q0'` → `'liberty'`, collapsing 4 unique TLQs into 1 unique ID.

Line 84 then looked up answers using the wrong key:
```typescript
const tlqAnswered = tlqIds.filter(t => answers[t] !== undefined).length;
```

This looked for `answers["liberty"]` but TLQ answers are stored with full IDs like `answers["liberty-q0"]`.

## Solution

Fixed `review.component.ts` to use full followUp IDs directly (each followUp IS a TLQ):

```typescript
// Each followUp IS a TLQ - use full followUp IDs directly (e.g., 'liberty-q0')
const tlqIds = category.followUps.map(f => f.id);
const tlqTotal = tlqIds.length;
const tlqAnswered = tlqIds.filter(t => answers[t] !== undefined).length;
```

Also simplified `nextTlq` logic since it no longer needs the complex split-based lookup.

## Files Changed

1. **src/app/features/review.component.ts** — Fixed TLQ ID extraction
2. **src/app/features/review.component.spec.ts** — Updated mock data to match production content structure
3. **src/app/features/review-completion-gate.production-content-contract.spec.ts** — New contract test using production content IDs

## Test Coverage

New contract test validates against production content IDs (`liberty-q0`, etc.):
- `should recognize TLQs as answered when stored with full TLQ ID`
- `should enable See Results when all TLQs are answered`
- `should show correct TLQ count (not just 1)`

## Green Gate

```
✅ npm run test   — 106 SUCCESS
✅ npm run build  — Application bundle generation complete
```

## Evidence

Before fix, contract test showed:
- `Expected 1 to be 4` (TLQ count collapsed to 1)
- `Expected 0 to be 1` (0 TLQs recognized as answered)

After fix, all assertions pass.
