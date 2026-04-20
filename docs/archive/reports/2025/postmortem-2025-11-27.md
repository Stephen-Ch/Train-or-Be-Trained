# Postmortem: Question Flow Debugging Session
**Date:** November 27, 2025  
**Prompts:** P-804 through P-813  
**Outcome:** Fixed, but took longer than necessary

---

## Summary

A seemingly simple bug ("blank question screens") required 10 prompts to diagnose and fix. The root causes were identified as:
1. **P-808**: Content-load race condition
2. **P-811**: ID pattern mismatch (`A1-f1` vs `liberty-q0`)
3. **P-813**: Continue navigating to same category instead of next

All three were real bugs, but better practices could have caught them earlier and resolved them faster.

---

## What Went Wrong

### 1. Major Changes on Main Branch Without Isolation

**Problem:** All work happened directly on `main`. When P-807's async `ngOnInit` fix broke 18 tests, we had to manually revert.

**Impact:**
- No safe rollback point
- Risk of shipping broken code
- Harder to isolate which change caused which regression

**Evidence:**
```
P-807: Added async ngOnInit → 18 tests broke → manual revert
P-811: Changed ID patterns → broke existing tests asserting old behavior
```

### 2. Tests Asserted Implementation, Not Behavior

**Problem:** Tests like `should return to top-level after finishing final TLQ follow-ups` were testing the *buggy* behavior (navigate back to same category). When we fixed the bug, the test failed.

**Impact:**
- False confidence in "69 SUCCESS"
- Bug existed despite green tests
- Fixing the bug required changing test expectations

**Evidence:**
```typescript
// Test was asserting the BUG, not correct behavior:
expect(router.navigate).toHaveBeenCalledWith(['/q', 'A']); // Wrong!
// Should have been:
expect(router.navigate).toHaveBeenCalledWith(['/q', 'B']); // Correct
```

### 3. Mock Data Drifted from Pipeline Data

**Problem:** Test mocks used `A1-f1` pattern while pipeline JSON used `liberty-q0`. Tests passed but production failed.

**Impact:**
- P-811 bug was invisible to tests
- 69 tests passing, app completely broken in browser

**Evidence:**
```typescript
// Spec mock:
followUps: [{ id: 'A1-f1', ... }, { id: 'A2-f1', ... }]

// Actual pipeline JSON:
followUps: [{ id: 'liberty-q0', ... }, { id: 'liberty-q1', ... }]
```

### 4. Prompts Didn't Request Risk Assessment

**Problem:** Prompts jumped straight to implementation without asking Copilot to identify risks or suggest alternatives.

**Impact:**
- P-807's `async ngOnInit` was a risky change that broke tests
- Could have been flagged upfront with a "what could go wrong?" step

### 5. Sequential Debugging Instead of Parallel Investigation

**Problem:** Each prompt tackled one hypothesis. When P-806 was wrong (IDs actually matched), we lost a round-trip.

**Impact:**
- 10 prompts instead of ~5
- Longer wall-clock time

---

## What Went Right

1. **Baseline checks caught failures immediately** — every prompt ran `npm run test && npm run build` before and after changes
2. **Revert discipline** — P-807's breaking change was reverted cleanly
3. **Analysis-only prompts (P-810, P-812)** — stepping back to diagnose before coding was effective
4. **Small, focused fixes** — P-808, P-811, P-813 were each <50 LOC

---

## Recommendations

### A. Branch Strategy

| Before | After |
|--------|-------|
| All work on `main` | Create feature branch per fix |
| Revert by hand | `git checkout main` to abandon |
| No PR review | Self-review diff before merge |

**Proposed workflow:**
```bash
git checkout -b fix/question-flow
# ... work ...
npm run test && npm run build
git checkout main
git merge fix/question-flow
git push
```

### B. Broader Test Coverage

| Gap | Recommendation |
|-----|----------------|
| Mocks drift from production data | Add integration test that loads actual `rawls-values.generated.json` |
| Tests assert implementation | Write tests from user perspective: "when I complete category A, I should see category B" |
| No E2E tests | Consider Playwright or Cypress for critical flows |

**Proposed spec additions:**
```typescript
describe('Integration: Question Flow', () => {
  it('should load real pipeline content and render options', () => {
    // Use actual rawls-values.generated.json, not mocks
  });

  it('should advance through all categories to review', () => {
    // Full user journey test
  });
});
```

### C. Prompt Structure Improvements

**Add these steps to prompts:**

1. **Risk Assessment** — Before implementing, ask:
   > "What could go wrong with this approach? What existing behavior might break?"

2. **Alternative Approaches** — Ask:
   > "Are there simpler ways to achieve this? What trade-offs exist?"

3. **Test Gap Analysis** — Ask:
   > "What tests would have caught this bug earlier? Should we add them?"

4. **Feedback Loop** — End prompts with:
   > "After implementing, report: (a) confidence level, (b) remaining risks, (c) suggested follow-ups"

**Example improved prompt structure:**
```markdown
## Goal
[One-line description]

## Context
[What we know, what failed]

## Risk Assessment (Copilot to complete)
- What could break?
- What tests might fail?
- Any simpler alternatives?

## Implementation
[Steps]

## Validation
- Tests pass
- Build passes
- Manual verification

## Feedback (Copilot to complete)
- Confidence: High/Medium/Low
- Remaining risks:
- Suggested follow-ups:
```

---

## Metrics

| Metric | This Session | Target |
|--------|--------------|--------|
| Prompts to fix | 10 | 3-5 |
| Reverted changes | 1 (P-807) | 0 |
| Tests that asserted bugs | 1 | 0 |
| Mock/production drift bugs | 1 (P-811) | 0 |

---

## Action Items

- [ ] **Branching**: Start using feature branches for multi-step fixes
- [ ] **Integration test**: Add spec that loads real pipeline JSON
- [ ] **User journey test**: Add E2E or integration test for complete flow
- [ ] **Prompt template**: Create standard template with risk/feedback sections
- [ ] **Mock audit**: Review all spec mocks to ensure they match pipeline format

---

## Appendix: Session Timeline

| Prompt | Action | Outcome |
|--------|--------|---------|
| P-804 | Add debug logging | Helped diagnose |
| P-805 | (not in session) | — |
| P-806 | Hypothesize ID mismatch | Wrong diagnosis |
| P-807 | Async ngOnInit | Broke 18 tests, reverted |
| P-808 | Effect for content load | ✅ Fixed race condition |
| P-809 | Docs for P-808 | ✅ Documented |
| P-810 | Analysis-only | Found real ID mismatch |
| P-811 | Fix ID patterns | ✅ Fixed rendering |
| P-812 | Analysis-only | Found Continue bug |
| P-813 | Fix Continue navigation | ✅ Fixed progression |
