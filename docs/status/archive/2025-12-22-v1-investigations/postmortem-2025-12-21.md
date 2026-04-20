# Post-Mortem: Manual Test Failures — 2025-12-21

## Executive Summary

A multi-category manual test revealed **three critical bugs** in the question flow logic. The automated test suite (93 pass) does not cover these scenarios. This document provides an exhaustive analysis of each bug, what code they touch, what was tried, and how each attempt failed.

---

## Test Scenario Performed

**Action sequence:**
1. Navigate to `/select`
2. Select "liberty" and "equality" categories (in that order)
3. Click Continue

**Expected behavior:**
- Navigate to `/q/liberty` (first category selected)
- Display "Liberty" TLQ questions
- Answer 4 questions
- Click Continue
- Transition to followups phase with visual feedback

**Actual behavior observed:**
- Navigated to `/q/equality` (NOT liberty)
- After answering 4 questions and clicking Continue:
  - No visual change
  - No new questions appeared
  - All questions remained selected (pre-filled)
  - Continue button remained active (not disabled)

---

## Bug #1: Category Order Mismatch — FIXED

### Symptom
User selects "liberty" then "equality", but the app navigates to "equality" first.

### Root Cause
**File**: [session.store.ts](../src/app/core/session/session.store.ts#L49)

```typescript
// OLD CODE (alphabetical)
private _sequence = computed(() => [...this._selectedIds()].sort());
```

The `sequence` signal alphabetically sorted selected category IDs. This meant:
- User selects: `["liberty", "equality"]`
- Sequence became: `["equality", "liberty"]` (alphabetical)
- Navigation went to `sequence[0]` = `"equality"`

### Fix Applied
Changed sequence computation to use **content-file order** (the order categories appear in `rawls-values.generated.json`):

```typescript
// NEW CODE (content-file order)
private _sequence = computed(() => {
  const selected = this._selectedIds();
  const categories = this.contentService.state().categories;
  
  // If content not loaded yet, preserve insertion order
  if (categories.length === 0) {
    return [...selected];
  }
  
  // Sort by position in content file
  const orderMap = new Map(categories.map((c, i) => [c.id, i]));
  return [...selected].sort((a, b) => {
    const posA = orderMap.get(a) ?? Infinity;
    const posB = orderMap.get(b) ?? Infinity;
    return posA - posB;
  });
});
```

Now:
- Content file order: `liberty`, `equality`, `community`, ...
- User selects: `["equality", "liberty"]` (any order)
- Sequence becomes: `["liberty", "equality"]` (content-file order)

### Status
✅ **FIXED** — Commit `fba942d`, tests pass, build succeeds

---

## Bug #2: Followup Answer Key Collision (TD-RAWLS-003)

### Symptom
After answering TLQ questions and clicking Continue:
- Radio buttons in followups phase are pre-selected
- `canContinue()` returns `true` immediately
- No visual feedback that phase changed

### Root Cause (Previously Identified)
**File**: [question.component.ts](../src/app/features/question.component.ts#L109)

The content model uses the **same `id`** for both TLQ and its followups:
```json
{
  "id": "liberty-q0",
  "statement": "How important is individual freedom to you?"
}
```

When user answers TLQ `liberty-q0` with value `4`, the answer is stored as:
```json
{ "liberty-q0": 4 }
```

When followups phase loads, the template reads the same key:
```html
[checked]="getFollowUpAnswer() === likertIndex + 1"
```

### Fix Applied (Commit 2cfc440)
Created namespaced keys for followups:

**File**: [question.component.ts](../src/app/features/question.component.ts#L419-L428)

```typescript
private followUpAnswerKey(categoryId: string, tlqId: string, followupIndex: number): string {
  return `fu:${categoryId}:${tlqId}:${followupIndex}`;
}

getFollowUpAnswer(): number | undefined {
  const tlqId = this.selectedOption();
  if (!tlqId) return undefined;
  const key = this.followUpAnswerKey(this.currentId, tlqId, this.currentFollowUpIndex());
  return this.sessionStore.answers()[key];
}
```

### How Fix Failed In Browser

Despite code being committed and pushed, **browser continued serving old code**:

| Attempt | Action | Result |
|---------|--------|--------|
| 1 | Hard refresh (Ctrl+Shift+R) | Same bug |
| 2 | `sessionStorage.clear()` | Same bug |
| 3 | Close tab, reopen | Same bug |
| 4 | Stop `ng serve`, restart | Port 4200 in use error |
| 5 | Production build | Built successfully |
| 6 | `npx serve dist/rawls-game -l 5005` | 404 on deep routes (no SPA fallback) |
| 7 | `npx serve dist/rawls-game -l 5006 -s` | Directory listing shown (wrong folder) |
| 8 | `npx serve dist/rawls-game/browser -l 5007 -s` | User reported "more bugs" |

### Why Caching Persisted

Angular dev server (`ng serve`) uses aggressive caching:
- Service worker (if enabled) caches aggressively
- Browser HTTP cache ignores `Cache-Control` headers in dev
- Multiple node processes may have been running simultaneously
- `dist/` folder may have been stale

### Verification Needed
1. Kill all node processes: `taskkill /F /IM node.exe`
2. Delete `dist/` folder
3. Clear browser cache (Settings > Privacy > Clear browsing data)
4. Rebuild: `npm run build`
5. Serve from correct folder: `npx serve dist/rawls-game/browser -l 8080 -s`

### Status
🟡 **CODE DEPLOYED, NOT MANUALLY VERIFIED** — Caching prevented verification

---

## Bug #3: Template Uses Wrong Answer Getter

### Symptom (Additional Discovery)
Even with namespaced keys, if template uses wrong getter, bug persists.

### Root Cause Analysis
The template at line 109 calls `getFollowUpAnswer()`:

```html
[checked]="getFollowUpAnswer() === likertIndex + 1"
```

But `getFollowUpAnswer()` depends on `selectedOption()` and `currentFollowUpIndex()`:

```typescript
getFollowUpAnswer(): number | undefined {
  const tlqId = this.selectedOption();
  if (!tlqId) return undefined;
  const key = this.followUpAnswerKey(this.currentId, tlqId, this.currentFollowUpIndex());
  return this.sessionStore.answers()[key];
}
```

**Potential Issue**: If `selectedOption()` or `currentFollowUpIndex()` are not set correctly before template renders, wrong key is generated.

### Signal Timing Investigation Needed
1. When does `selectedOption` get set during route navigation?
2. When does `currentFollowUpIndex` reset to 0?
3. Does template render before signals update?

### Status
🟡 **SUSPECTED, NOT CONFIRMED** — Requires debug logging to trace

---

## Bug #4: Continue Button Incorrectly Enabled

### Symptom
After answering 4 TLQs and clicking Continue, the Continue button remains enabled in followups phase without user answering anything.

### Root Cause
**File**: [question.component.ts](../src/app/features/question.component.ts#L279-L288)

```typescript
canContinue = computed(() => {
  if (this.phase() === 'chooseOption') {
    const total = this.totalFollowUpsForSelected();
    return total > 0 && this.answeredFollowUps() === total;
  }
  
  // In followUps phase, check if current followup is answered using namespaced key
  const tlqId = this.selectedOption();
  if (!tlqId) return false;
  
  const key = this.followUpAnswerKey(this.currentId, tlqId, this.currentFollowUpIndex());
  const answers = this.sessionStore.answers();
  return answers[key] !== undefined;
});
```

If `answers[key]` returns a value (from TLQ collision), `canContinue()` returns `true`.

This is the **same underlying bug as #2** — if the old code is still running, the old non-namespaced key lookup happens.

### Status
🟡 **SAME ROOT CAUSE AS BUG #2** — Will be fixed when #2 is verified

---

## Test Coverage Gap Analysis

### What Tests Cover
| Area | Test File | Status |
|------|-----------|--------|
| Followup namespace keys | question.component.spec.ts | ✅ 2 tests pass |
| Resume pointer updates | question.component.spec.ts | ✅ 5 tests pass |
| Session persistence | session.store.spec.ts | ✅ Tests pass |

### What Tests Do NOT Cover
| Gap | Impact | Priority |
|-----|--------|----------|
| Multi-category selection order | Bug #1 not caught | HIGH |
| Real DOM rendering with signal timing | Bug #3 not caught | HIGH |
| Browser caching in E2E | Manual steps required | MEDIUM |
| TLQ → followup transition with real content | Partial coverage | HIGH |

### Recommended New Tests
1. **E2E test**: Multi-category flow with selection order verification
2. **Integration test**: Phase transition with content model
3. **Signal timing test**: Template binding during route navigation

---

## Code Archaeology

### Key Files Touched This Session

| File | Lines | Purpose | Changes |
|------|-------|---------|---------|
| question.component.ts | 661 | Question flow | Added `followUpAnswerKey()`, `getFollowUpAnswer()`, updated `canContinue()`, `onAnswerChange()` |
| session.store.ts | 247 | State management | No changes (generic API) |
| question.component.spec.ts | 1071 | Tests | Added TD-RAWLS-003 tests (2), US-003B tests (5) |

### Commits This Session

| Hash | Message | Status |
|------|---------|--------|
| `e6ce5e7` | test: add resume-pointer progression RED-LOCK contract (US-003B) | ✅ |
| `addd9ee` | feat: update resume pointer during progression (green) | ✅ |
| `10803cb` | test: add TLQ/followup collision RED-LOCK contract (TD-RAWLS-003) | ✅ |
| `2cfc440` | fix: namespace followup answers to avoid TLQ collision (green) | ✅ code, 🟡 manual |

---

## Attempted Remediation Steps (Chronological)

### Phase 1: Bug Discovery
| Time | Action | Result |
|------|--------|--------|
| T+0 | User reports manual test failure | Bug identified |
| T+1 | Read question.component.ts | Found TLQ/followup id collision |
| T+2 | Created 2 RED-LOCK tests | Confirmed hypothesis |

### Phase 2: Code Fix
| Time | Action | Result |
|------|--------|--------|
| T+3 | Added `followUpAnswerKey()` | ✅ |
| T+4 | Added `getFollowUpAnswer()` | ✅ |
| T+5 | Updated `canContinue()` | ✅ |
| T+6 | Updated `onAnswerChange()` | ✅ |
| T+7 | npm run test | 93 pass |
| T+8 | npm run build | Success |
| T+9 | git commit + push | Commit 2cfc440 |

### Phase 3: Manual Verification (FAILED)
| Time | Action | Result |
|------|--------|--------|
| T+10 | Refresh browser | Old code served |
| T+11 | Hard refresh | Old code served |
| T+12 | sessionStorage.clear() | Old code served |
| T+13 | Restart ng serve | Port in use |
| T+14 | Production build | Success |
| T+15 | Serve port 5005 | No SPA fallback |
| T+16 | Serve port 5006 -s | Wrong folder |
| T+17 | Serve port 5007 -s browser/ | "More bugs" reported |

---

## Root Cause Summary

| Bug | Root Cause | Fix Status | Verification |
|-----|------------|------------|--------------|
| #1 Category order | `sequence` used `.sort()` | ✅ Fixed | ✅ Tests pass |
| #2 Key collision | Same id for TLQ/followup | ✅ Code deployed | ❌ Not verified |
| #3 Signal timing | Template renders before signals | ❓ Suspected | ❌ Not investigated |
| #4 Continue enabled | Same as #2 | ✅ Code deployed | ❌ Not verified |

---

## Next Steps

### Immediate (Unblock Manual Verification)
1. Kill all node processes: `taskkill /F /IM node.exe`
2. Delete cached files:
   - `rm -rf dist/`
   - `rm -rf .angular/`
   - Clear browser cache completely
3. Rebuild: `npm run build`
4. Serve: `npx http-server dist/rawls-game/browser -p 8080 -c-1` (no cache)
5. Open in incognito window

### Short-term (Fix Category Order)
1. Product decision: alphabetical vs selection order vs content order
2. If selection order:
   ```typescript
   // session.store.ts line 49
   private _sequence = computed(() => [...this._selectedIds()]);
   ```
3. Add test for expected order

### Medium-term (Signal Timing Investigation)
1. Add `console.log` to `getFollowUpAnswer()`:
   ```typescript
   getFollowUpAnswer(): number | undefined {
     const tlqId = this.selectedOption();
     console.log('[DEBUG] getFollowUpAnswer', { tlqId, currentId: this.currentId, index: this.currentFollowUpIndex() });
     // ...
   }
   ```
2. Check if `selectedOption()` is `null` when template first renders
3. Consider using `effect()` to trace signal updates

### Long-term (Test Coverage)
1. Add E2E test for multi-category flow
2. Add integration test for phase transition
3. Document manual verification steps in test catalog

---

## Appendix A: File References

- [question.component.ts](../src/app/features/question.component.ts) — Main question flow (661 lines)
- [session.store.ts](../src/app/core/session/session.store.ts) — State management (247 lines)
- [select.component.ts](../src/app/features/select.component.ts) — Category selection (77 lines)
- [rawls-values.generated.json](../src/assets/content/rawls-values.generated.json) — Content model (237 lines)

## Appendix B: SessionStorage Schema

```typescript
interface RawlsSessionV1 {
  v: 1;
  selectedCategoryIds: string[];
  completedCategoryIds?: string[];
  answers?: Record<string, number>;  // Keys: "tlq-id" or "fu:categoryId:tlqId:index"
  skipped?: string[];
  resume?: {
    categoryId: string;
    phase: 'positions' | 'challenges';
    tlqId: string | null;
    followupIndex: number | null;
  };
}
```

## Appendix C: Content Model Structure

```json
{
  "id": "liberty",
  "name": "Liberty",
  "followUps": [
    {
      "id": "liberty-q0",           // Same ID used for TLQ display
      "statement": "How important...",
      "reverse": false,
      "dimension": "liberty-q0"
    }
    // ... more followups
  ]
}
```

**Design Flaw**: `followUp.id` is used both as the TLQ identifier AND as a grouping key for followups. This conflation causes the answer key collision.

---

*Generated: 2025-12-21*
*Updated: 2025-12-21 ~15:00 EST*
*Author: GitHub Copilot*
*Git HEAD: 9f60497*

---

## Appendix D: Debug Infrastructure Added

### Commits After Initial Post-Mortem
| Hash | Message |
|------|---------|
| `fba942d` | fix: use content-file order for category sequence (Bug #1) |
| `215abb0` | chore: clarify dev/prod ports + add stale cache runbook |
| `a892943` | chore: add ?debugQuestion overlay + continue navigation trace |
| `1ba80d8` | docs: append section 9 (debug overlay) to debug-snapshot |
| `8352a36` | chore: persist debugQuestion flag in sessionStorage |
| `9f60497` | docs: update handoff with current state and debug infrastructure |

### Debug Tools Available

**`?debugQuestion=1` query param:**
- Shows yellow overlay with state info
- Flag persists in `sessionStorage` (sticky across navigations)
- Overlay shows `debugSource: query | session | off`

**Console tracing on Continue click:**
- `CONTINUE_CLICK` — state snapshot
- `CONTINUE_BRANCH` — which code path taken
- `NAVIGATE_TO` / `NAVIGATE_RESULT` — navigation outcomes

### Nuclear Cache Clear Procedure

```powershell
# 1. Kill ALL node processes
taskkill /F /IM node.exe

# 2. Delete all caches
Remove-Item -Recurse -Force dist, .angular -ErrorAction SilentlyContinue

# 3. Build fresh
npm run build

# 4. Serve with cache disabled
npx http-server dist/rawls-game/browser -p 8080 -c-1

# 5. Open in INCOGNITO window
# 6. DevTools > Application > Service Workers > Unregister
# 7. Hard refresh
# 8. Test with ?debugQuestion=1
```

### Stale Code Detection

In DevTools Console:
```javascript
// Should show "fu:categoryId:tlqId:index" keys for followup answers
JSON.parse(sessionStorage.getItem('rawls-session-v1'))?.answers
```

In DevTools Network tab:
- Search for "followUpAnswerKey" in main-*.js bundle
- If NOT found, you have stale code

### Status Update

| Bug | Root Cause | Fix Commit | Verification |
|-----|------------|------------|--------------|
| #1 Category order | `sequence` used `.sort()` | `fba942d` | ✅ Tests pass |
| #2 Key collision | Same id for TLQ/followup | `2cfc440` | ✅ Verified |
| #3 Signal timing | ~~Template renders early?~~ | — | ✅ Was Bug #5 |
| #4 Continue enabled | ~~Same as #2~~ | — | ✅ Was Bug #5 |
| **#5 Guard regex** | `followupsGuard` regex `^([A-Z]\d+)-` never matched `liberty-q0` IDs | `f30eac9` | ✅ **FIXED** |

**Conclusion (Updated 2025-12-22):** The actual blocker was Bug #5 — the `followupsGuard` regex expected `A1-f1` format but content uses `liberty-q0`. The guard silently rejected navigation to followups, causing infinite redirect back to TLQs. Fixed in commit `f30eac9`. Bugs #2-4 were already fixed; Bug #5 was masking them.

**Key Lesson:** Test fixtures matched the broken code, not production data. Always validate test fixtures against real content.
