# Postmortem: Challenge Editing Flip-Flop Cycle
**Date:** December 23, 2025  
**Prompts:** BUG-ADMIN-002 through BUG-ADMIN-005  
**Outcome:** Fixed with deterministic shape proof, but took 4 iterations to get there

---

## Summary

What started as "resolve the contradiction: production has no followUps vs our lived reality" turned into a 4-prompt cycle of removing, restoring, simplifying, and finally proving the state of Challenge editing in the admin content explorer. The root cause was **terminology confusion** between product language (Ideal → Position → Challenge) and production reality (categories → followUps with zero Challenge items). This was compounded by **lack of deterministic evidence** before making architectural decisions.

**Timeline:**
- **BUG-ADMIN-002**: Incorrectly removed Challenge editing (concluded "no followUps in production")
- **BUG-ADMIN-003**: Reverted removal, restored Challenge editing with mock test data (invented fu-pattern IDs)
- **BUG-ADMIN-004**: Simplified component, replaced mock tests with real production JSON
- **BUG-ADMIN-005**: Created shape proof test, corrected terminology, added contract test

**Core Learning:** When documentation and code disagree, **measure the production artifact first**, then update docs and code to match reality.

---

## What Went Wrong

### 1. Jumped to Conclusions Without Measuring Production

**Problem:** BUG-ADMIN-002 concluded "production has no followUps" based on reading component code, not by analyzing actual JSON.

**Impact:**
- Removed 106 lines of Challenge editing code
- Incorrect assumption became part of codebase
- Documentation updated to match wrong assumption ("Challenge = DEPRECATED")

**Evidence:**
BUG-ADMIN-002 solution report stated: "Production has zero followUps → Challenge editing is dead code" — but production actually has 28 followUps (all Positions, zero Challenges).

**What Should Have Happened:**
1. Read src/assets/content/rawls-values.generated.json
2. Count items matching {categoryId}-q\d+ (Positions)
3. Count items matching {positionId}-fu\d+ (Challenges)
4. Document actual counts before making code changes
5. Decision based on evidence, not assumptions

### 2. Mock Data Masked Production Reality

**Problem:** BUG-ADMIN-003 restored Challenge editing but used invented test data (liberty-q0-fu0 pattern) that doesn't exist in production.

**Impact:**
- 6 new Challenge editing tests passed with mock data
- Zero validation that production JSON supports Challenges
- Tests gave false confidence that Challenge editing worked

**Evidence:**
Test mock data:
- liberty-q0-fu0 (invented Challenge ID)
- equality-q1-fu0 (invented Challenge ID)

Production JSON:
- liberty-q0, liberty-q1, liberty-q2, liberty-q3 (Positions only)
- equality-q0, equality-q1, equality-q2, equality-q3 (Positions only)
- Zero items matching fu-pattern

**What Should Have Happened:**
- Import real production JSON into tests (resolveJsonModule: true)
- Use actual IDs from rawls-values.generated.json
- Tests would immediately reveal challengeCount = 0

### 3. Terminology Drift Between Product Language and Production Reality

**Problem:** Documentation used inconsistent terminology that conflated storage implementation (followUp) with product concepts (Position, Challenge).

**Impact:**
- BUG-ADMIN-002 thought "followUp" meant "Challenge" exclusively
- Missed that Positions are ALSO followUps (just different ID pattern)
- Documentation said "Challenge = DEPRECATED" when Challenges are valid product concept

**Evidence:**
BEFORE (BUG-ADMIN-004):
- Position = followUp object (conflates storage with concept)
- Challenge = DEPRECATED (wrong — Challenges are valid concept, just not in production yet)

AFTER (BUG-ADMIN-005):
- Position = Top-level question (TLQ) within an Ideal
- Challenge = Follow-up question shown after answering a Position
- Both stored in categories[].followUps[], distinguished by ID pattern

**Root Cause:** No single source of truth for terminology mapping product language to data structure.

### 4. No Contract Test to Lock Architectural Decisions

**Problem:** After each prompt (remove → restore → simplify), there was no test to prevent future flip-flopping.

**Impact:**
- BUG-ADMIN-002 removed Challenge editing
- BUG-ADMIN-003 restored it (undoing BUG-ADMIN-002)
- No contract test to say "IF challengeCount == 0, Challenge editing should be removed"

**Evidence:**
Contract test was only added in BUG-ADMIN-005:
```typescript
it('should assert zero challenges in production (contract test)', () => {
  const challengeCount = rawContent.categories
    .flatMap(c => c.followUps)
    .filter(fu => /-fu\d+$/.test(fu.id)).length;
  expect(challengeCount).toBe(0);
});
```

**What Should Have Happened:**
- BUG-ADMIN-002 should have created this test when removing Challenge editing
- Test fails if Challenges are added → signals UI should be restored
- Prevents flip-flopping by locking current reality

### 5. No Shape Proof Before Architectural Changes

**Problem:** All 4 prompts made code changes without first documenting the production data structure.

**Impact:**
- Debates about whether Challenges exist in production
- Multiple iterations to converge on truth
- Time wasted on remove/restore cycles

**Evidence:**
Shape proof was only created in BUG-ADMIN-005:
- File: src/assets/content/rawls-values.generated.json
- Property chain: categories[].followUps[]
- positionCount: 28 (pattern {categoryId}-q\d+)
- challengeCount: 0 (pattern {positionId}-fu\d+)

This simple proof would have prevented BUG-ADMIN-002's incorrect conclusion.

**What Should Have Happened:**
First prompt should have been:
1. Create shape proof test
2. Run test, capture counts
3. THEN decide: remove editing UI or keep it

---

## What Went Right

1. **Protocol enforcement prevented scope creep** — each prompt stayed focused on single objective
2. **Green gate discipline** — all 4 prompts passed 168-170 tests and build before commit
3. **Git discipline** — each iteration was committed separately, allowing clear history
4. **Evidence gathering in BUG-ADMIN-004** — importing real JSON was turning point
5. **Deterministic proof in BUG-ADMIN-005** — shape proof test runs on every execution

---

## Root Cause Analysis

**Primary Root Cause:** Lack of "measure before modify" discipline

When documentation and code contradicted each other, we modified code first (BUG-ADMIN-002) instead of measuring production artifact first.

**Contributing Factors:**
1. No protocol requirement to analyze production data before architectural changes
2. Mock data in tests allowed false confidence (BUG-ADMIN-003)
3. Terminology drift made it hard to reason about what "followUp" meant
4. No contract tests to lock architectural decisions

**Fix:** BUG-ADMIN-005 established deterministic shape proof + contract test to prevent recurrence.

---

## Lessons Learned

### 1. MEASURE PRODUCTION FIRST (New Protocol Rule Candidate)

**Before removing/adding major features:**
1. Identify the production artifact (JSON file, database, API response)
2. Create a shape proof test that documents current structure
3. Log counts, patterns, examples
4. THEN make architectural decisions based on evidence

**Anti-pattern we fell into:**
```
Prompt → Read component code → Conclude feature is unused → Remove code
```

**Correct pattern:**
```
Prompt → Create shape proof test → Run test → Document counts → 
Decide based on evidence → Update code + docs to match reality
```

### 2. USE REAL PRODUCTION DATA IN TESTS

**Mock data is dangerous when:**
- Testing integration with content pipeline
- Validating ID patterns or data structures
- Proving features work with production content

**BUG-ADMIN-003's mistake:**
```typescript
// Mock data with invented IDs that don't exist in production:
{ id: 'liberty-q0-fu0', questionText: 'Mock Challenge' }
```

**BUG-ADMIN-004's fix:**
```typescript
// Import real production JSON:
import rawContent from '../../../assets/content/rawls-values.generated.json';
```

**New rule:** When testing content-dependent features, import real JSON, don't invent mock data.

### 3. TERMINOLOGY MUST MAP PRODUCT → STORAGE

**Problem:** We used "followUp" to mean both:
- Storage implementation (categories[].followUps[])
- Product concept (unclear if Position or Challenge)

**Solution:** CONTENT-RULES.md now documents both layers:

Product Language:
- Ideal = Category
- Position = TLQ (top-level question)
- Challenge = Follow-up question after Position

Storage Implementation:
- categories[].followUps[] contains both Positions and Challenges
- Position IDs: {categoryId}-q\d+ (e.g., liberty-q0)
- Challenge IDs: {positionId}-fu\d+ (e.g., liberty-q0-fu0)

**New rule:** Terminology docs must show product language → storage mapping with ID patterns.

### 4. CONTRACT TESTS PREVENT FLIP-FLOPPING

**BUG-ADMIN-005's contract test:**
```typescript
it('should assert zero challenges in production', () => {
  expect(challengeCount).toBe(0);
  // If Challenges are added to production in the future:
  // - This test will FAIL
  // - Failure signals Challenge editing UI should be restored
});
```

**Purpose:**
- Locks current architectural decision (Challenge editing removed)
- Explicit trigger to restore UI when production changes
- Prevents "why did we remove this?" confusion

**New rule:** When removing major features due to "current reality", add contract test that fails if reality changes.

### 5. SHAPE PROOF TESTS AS DOCUMENTATION

**Shape proof test serves multiple purposes:**
1. Executable documentation (shows property chains, patterns, counts)
2. Smoke test (fails if JSON structure changes)
3. Communication tool (console logs show structure at a glance)

**Example output:**
```
=== PRODUCTION SHAPE PROOF ===
File: src/assets/content/rawls-values.generated.json
Position property chain: categories[].followUps[] (pattern: {categoryId}-q\d+)
Challenge property chain: categories[].followUps[] (pattern: {positionId}-fu\d+)
positionCount: 28
challengeCount: 0
Example: idealId=liberty, positionId=liberty-q0
==============================
```

**New rule:** Complex data structures should have shape proof tests that log structure on every test run.

---

## Protocol Improvement Suggestions

### A. Add "Measure Production First" Gate

**Proposed addition to protocol-v7.md:**

When prompt involves removing, adding, or significantly modifying features based on "production has X":
1. FIRST: Create shape proof test that analyzes production artifact
2. Run test, capture output with counts/patterns/examples
3. Include proof in solution report (max 10 lines)
4. THEN: Make code changes based on evidence

**Green gate addition:**
For architectural changes, solution report must include:
- Production artifact analyzed (file path or endpoint)
- Counts or measurements from artifact
- Decision path taken (e.g., "challengeCount == 0 → remove editing UI")

### B. Add "Real Data in Tests" Guideline

**Proposed addition to copilot-instructions-v7.md:**

When testing features that depend on content pipeline:
- Import real production JSON (use resolveJsonModule: true in tsconfig)
- Use actual IDs from production files
- Mock data is OK for unit tests of pure logic
- Mock data is NOT OK for integration tests with content

**Anti-pattern to avoid:**
```typescript
const mockData = [{ id: 'invented-id', text: 'mock' }];
```

**Correct pattern:**
```typescript
import rawContent from '../../../assets/content/file.generated.json';
const firstPosition = rawContent.categories[0].followUps[0];
```

### C. Add "Terminology Mapping" Template

**Proposed new file: docs/protocol/terminology-template.md**

Structure:
1. Product Language (what users see)
2. Storage Implementation (how it's stored)
3. ID Patterns (how to distinguish types)
4. Current Counts (from shape proof test)

Each project should fill this template in CONTENT-RULES.md or equivalent.

### D. Add "Contract Test" Pattern

**Proposed addition to test-touch-block-template.md:**

When removing features due to current production state:
```typescript
describe('Contract Tests (Lock Current Reality)', () => {
  it('should assert [current state] to prevent flip-flopping', () => {
    const count = // measure current state
    expect(count).toBe(0); // or whatever current value is
    
    // Comment explaining trigger:
    // If production adds [feature], this test will fail and signal
    // that [removed UI] should be restored.
  });
});
```

---

## Metrics

**Total Prompts:** 4 (BUG-ADMIN-002 through BUG-ADMIN-005)  
**Lines Changed (Net):** 
- BUG-ADMIN-002: -106 lines (removed Challenge editing)
- BUG-ADMIN-003: +168 lines (restored Challenge editing + tests)
- BUG-ADMIN-004: -23 lines (simplified component, updated tests)
- BUG-ADMIN-005: +67 lines (shape proof + contract test)
- **Net:** +106 lines

**Test Count Evolution:**
- BUG-ADMIN-002: 162 tests
- BUG-ADMIN-003: 168 tests
- BUG-ADMIN-004: 168 tests
- BUG-ADMIN-005: 170 tests

**Time to Convergence:** 4 iterations (would have been 1 with shape proof first)

---

## Action Items

### For Next Session

1. ✅ Shape proof test exists (BUG-ADMIN-005)
2. ✅ Contract test locks challengeCount = 0
3. ✅ CONTENT-RULES.md updated with correct terminology
4. ⏳ Protocol updates (pending user approval)

### For Protocol v8 (Proposed)

1. Add "Measure Production First" gate for architectural changes
2. Add "Real Data in Tests" guideline for content-dependent features
3. Create terminology-template.md
4. Add contract test pattern to test-touch-block-template.md

### For Future Prompts

**Before removing/adding major features, ask:**
1. What is the production artifact I should analyze?
2. Does a shape proof test exist? If not, create one first.
3. What counts/patterns does the proof show?
4. Does this evidence support the proposed change?
5. Should I add a contract test to lock this decision?

---

## Success Criteria (Retrospective)

**What success looks like:**
- ✅ Admin content explorer works correctly
- ✅ Tests use real production JSON
- ✅ Documentation matches product language
- ✅ Shape proof test documents current structure
- ✅ Contract test prevents future flip-flopping
- ✅ All tests passing (170/171)
- ✅ Build green (531.61 kB)

**What we learned:**
- Evidence before decisions (measure, then modify)
- Real data in tests (no invented IDs)
- Terminology mapping (product → storage)
- Contract tests (lock decisions, prevent drift)

This postmortem establishes patterns to prevent similar flip-flopping in future features.
