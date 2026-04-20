# RAWLS-REPORT-006: Question Flow V2 Refactor Plan

**PROMPT-ID**: REPORT-QUESTION-FLOW-V2-REFACTOR-PLAN-001  
**Date**: 2024-12-24  
**Type**: Architecture Research & Planning  
**Status**: READ-ONLY Analysis Complete

## Executive Summary

This report documents a low-risk, incremental refactor plan to implement the ideal-based question flow (4 positions → challenges per ideal) using the existing ideal-sequencer infrastructure without breaking the current 790-line question.component.ts hot file.

**Recommendation**: Create question-v2.component.ts as a parallel implementation with feature flag routing, allowing incremental development and isolated testing before cutover.

## Proof-of-Read

Protocol compliance verified:
- docs/protocol/protocol-v7.md: Proof-of-Read mandatory, Prompt Review Gate, GREEN GATE for code prompts
- docs/protocol/copilot-instructions-v7.md: Hot Files Analysis-First Rule for question.component.ts
- docs/protocol/stay-on-track.md: Scope Boundaries - READ-ONLY prompts do NOT touch app code

## 1) Current State Machine Inventory

### State Variables Driving Progression

- **phase**: signal<'chooseOption' | 'followUps'> (line 218)
  - Controls whether showing all positions (TLQs) or individual challenges
  
- **selectedOption**: signal<string | null> (line 219)
  - Tracks which TLQ (position) is currently active
  - null when in chooseOption phase
  
- **currentFollowUpIndex**: signal<number> (line 220)
  - Tracks position within challenges for selected TLQ
  - Increments as user answers each challenge
  
- **currentId**: string (line 217)
  - Category ID from route params (/q/:id)

### TLQ vs Follow-up Decision Logic

Route-based phase determination:
- Route `/q/:id` → phase = 'chooseOption', show all positions for category (lines 426-435)
- Route `/q/:id/followups/:tlqId` → phase = 'followUps', show single challenge at currentFollowUpIndex (lines 407-417)

Guard enforcement:
- `followupsGuard.ts` checks all TLQ positions answered before allowing `/followups/:tlqId` route (lines 48-73)
- Uses `hasAnsweredAllTopLevel()` to verify completion

### Answer Read/Write Locations

**Position (TLQ) Answers:**
- Write: `sessionStore.recordAnswer(questionId, value)` with questionId = position.id (line 550)
- Read: `getAnswer(followUpId)` reads from `sessionStore.answers()` (line 500)
- Storage key: Direct position ID (e.g., "liberty-q0")

**Challenge Answers:**
- Write: `sessionStore.recordAnswer(key, normalizedValue)` with namespaced key (line 566)
- Key format: `fu:{categoryId}:{tlqId}:{followupIndex}` (line 507)
- Read: `getFollowUpAnswer()` uses namespaced key from `sessionStore.answers()` (lines 518-521)
- Note: Despite namespace, still stored in answers() map (legacy design)

### Progress Computation

**Ideal Progress ("Ideal X of Y"):**
- `idealProgress()`: computed (lines 251-254)
- Uses `currentIndex() + 1` and `totalQuestions()`
- `currentIndex()`: `sessionStore.sequence().indexOf(currentId)` (lines 335-337)
- `totalQuestions()`: `sessionStore.sequence().length` (line 339)

**Position Progress:**
- `positionProgress()`: computed showing answered/total (lines 256-259)
- `answeredFollowUps()`: counts options with answers (lines 227-230)
- `totalFollowUpsForSelected()`: total options available (computed)

**Follow-up Progress (Challenge Progress):**
- `followUpProgress()`: computed, only shown when phase = 'followUps' (lines 242-248)
- Shows current challenge index within selected TLQ's challenges

## 2) Lowest-Risk Architecture Option

### Recommended: Parallel Component Implementation

**Create `question-v2.component.ts` as new component with feature flag routing**

#### Why This Is Least Risky

1. **Avoids Hot File Modification**: No changes to 790-line question.component.ts until final cutover
2. **Incremental Development**: Build and test v2 in isolation without affecting production flow
3. **Safe Rollback**: Existing question.component.ts remains working fallback
4. **Controlled Testing**: Can test via dev-only query param or admin route before production
5. **Clean Architecture**: Start fresh using sequencer directly instead of retrofitting two-phase logic

#### File Paths for Implementation

**Routing Layer:**
- `src/app/app.routes.ts` (lines 11-17)
  - Add new route with canMatch guard checking feature flag
  - Example: `{ path: 'q/:id', component: QuestionV2Component, canMatch: [useV2Guard] }`

**New Component:**
- `src/app/features/question-v2.component.ts` (NEW FILE)
  - Fresh implementation using ideal-sequencer
  - Single route, no sub-routes for challenges
  - Estimated ~200 lines (vs 790 in v1)

**No Changes Needed:**
- `src/app/core/session/session.store.ts` (lines 1-332)
  - Already has `challengeAnswers` separate storage (commit 25e860f)
- `src/app/core/flow/ideal-sequencer.ts` (lines 1-137)
  - Already has `nextUnansweredItem()` pure function

### Alternative Rejected: Child Component Extraction

**Why NOT extract child component for single-item rendering:**

1. **Breaks Hot File Rule**: Requires editing question.component.ts to wire child (violates protocol)
2. **Complex State Sharing**: Must solve parent-child state sync for phase/selectedOption/currentFollowUpIndex
3. **Two-Phase Navigation Embedded**: Parent still owns route logic for /q/:id vs /q/:id/followups/:tlqId
4. **No Clear Benefit**: Cleaner to build v2 from scratch using sequencer directly
5. **Testing Complexity**: Must test parent-child interaction vs testing single v2 component

## 3) Minimal Integration Surface

### Where `nextUnansweredItem()` Will Be Called

**Location**: question-v2.component.ts constructor or as computed signal

**Pattern**: Reactive computed that auto-updates when answers change

    nextItem = computed(() => 
      nextUnansweredItem(
        this.contentService.state().categories,
        this.sessionStore.answers(),
        this.sessionStore.challengeAnswers()
      )
    );

**Behavior**: Recomputes automatically when user answers questions (Angular signals)

### Exact Inputs Required

1. **categories**: `Category[]`
   - Source: `contentService.state().categories`
   - Array of categories in content file order
   - Shape: `{ id: string, name: string, followUps: FollowUp[], ... }`

2. **positionAnswers**: `Record<string, number>`
   - Source: `sessionStore.answers()`
   - Maps position ID to 1-5 Likert value
   - Example: `{ "liberty-q0": 3, "equality-q1": 5 }`

3. **challengeAnswers**: `Record<string, number>`
   - Source: `sessionStore.challengeAnswers()`
   - Maps challenge ID to numeric placeholder (text responses stored elsewhere)
   - Example: `{ "liberty-q0-fu0": 1, "liberty-q0-fu1": 1 }`

4. **positionsPerIdeal**: `number = 4` (constant)
   - Default parameter in `nextUnansweredItem()`
   - Limits positions per ideal to first 4

### Exact Output Fields Required for UI

#### For `NextItemPosition` (kind = 'position')

Required for rendering:
- `categoryId`: string — for progress display, answer key construction
- `positionId`: string — for answer storage key
- `statement`: string — question text to display
- `positionIndex`: number — 0-based index within ideal's positions
- `positionTotal`: number — total positions in this ideal (max 4)
- `idealIndex`: number — 0-based index of current ideal
- `idealTotal`: number — total number of ideals in sequence

UI usage:
- Display: `statement` in question card
- Progress: "Position {positionIndex + 1} of {positionTotal}"
- Progress: "Ideal {idealIndex + 1} of {idealTotal}"
- Answer key: `positionId` for `recordAnswer(positionId, value)`

#### For `NextItemChallenge` (kind = 'challenge')

Required for rendering:
- `categoryId`: string — for progress display
- `positionId`: string — parent position ID (for context/breadcrumb)
- `challengeId`: string — for answer storage key
- `title`: string — challenge heading
- `body`: string — challenge prompt text
- `challengeIndex`: number — 0-based index within ideal's challenges
- `challengeTotal`: number — total challenges in this ideal
- `idealIndex`: number — 0-based index of current ideal
- `idealTotal`: number — total number of ideals in sequence

UI usage:
- Display: `title` as heading, `body` as prompt
- Progress: "Challenge {challengeIndex + 1} of {challengeTotal}"
- Progress: "Ideal {idealIndex + 1} of {idealTotal}"
- Answer key: `challengeId` for `recordChallengeAnswer(challengeId, value)`

#### For `null` Output

Meaning: All items answered, flow complete
Action: Navigate to `/review`

## 4) Incremental Implementation Plan

### Overview: 4-Prompt Sequence

Each step builds on previous, maintains green gates, avoids hot file edits until optional cutover.

---

### Step 1: Feature Flag + Dev Route

**PROMPT-ID**: Q2-STEP1-FEATURE-FLAG-001

**Goal**: Wire feature flag routing without touching question.component.ts

**Files Changed:**
1. `src/app/core/session/session.store.ts` (+1 line)
   - Add `useQuestionV2 = signal<boolean>(false);`
   - Public accessor for route guard

2. `src/app/app.routes.ts` (+5 lines)
   - Add canMatch guard checking flag
   - Route definition uses v2 component when flag true

**Test Gate:**
- `npm run test` (no new tests, compilation check only)
- `npm run build`

**Verification:**
- Flag defaults to false
- Existing flow unchanged
- Can toggle flag programmatically for dev testing

**Exit Criteria:**
- Build green
- Tests green (209 SUCCESS)
- git status clean after commit

---

### Step 2: Skeleton Component with Sequencer

**PROMPT-ID**: Q2-STEP2-SKELETON-001

**Goal**: New component showing next item from sequencer, no navigation yet

**Files Changed:**
1. `src/app/features/question-v2.component.ts` (NEW FILE, ~150 lines)
   - Component with nextItem computed
   - Template renders NextItemPosition only
   - Progress displays using idealIndex/positionIndex
   - Likert scale input (no answer recording yet)

2. `src/app/features/question-v2.component.spec.ts` (NEW FILE, ~50 lines)
   - Basic smoke test: "should create"
   - "renders first position when no answers exist"
   - "displays correct ideal progress"
   - "displays correct position progress"

**Test Gate:**
- `npm run test` (1 new spec file, 4 new tests)
- `npm run build`

**Verification:**
- Navigate to `/q/liberty` (with flag enabled)
- See first position with progress
- Likert scale renders but doesn't save yet

**Exit Criteria:**
- Build green
- Tests green (213 SUCCESS: 209 existing + 4 new)
- Manual smoke: can see first position

---

### Step 3: Answer Recording + Navigation

**PROMPT-ID**: Q2-STEP3-ANSWERS-NAV-001

**Goal**: Wire Continue button to record answer and advance sequencer

**Files Changed:**
1. `src/app/features/question-v2.component.ts` (+30 lines)
   - Add `selectedValue` signal
   - Add `onAnswerChange(value: number)` handler
   - Add `onContinue()` handler calling `recordAnswer()`
   - Add `canContinue` computed (value selected)
   - Continue button enabled logic

**Test Gate:**
- `npm run test` (update spec, +3 tests)
  - "records position answer when value selected"
  - "advances to next position after continue"
  - "disables continue when no value selected"
- `npm run build`

**Verification:**
- Can answer first position
- Click Continue
- See second position
- Answer persists (visible in session storage)

**Exit Criteria:**
- Build green
- Tests green (216 SUCCESS: 213 + 3 new)
- Manual flow: answer 4 positions sequentially

---

### Step 4: Challenge Rendering + Complete Flow

**PROMPT-ID**: Q2-STEP4-CHALLENGES-001

**Goal**: Handle NextItemChallenge rendering, recordChallengeAnswer() wiring, /review navigation

**Files Changed:**
1. `src/app/features/question-v2.component.ts` (+40 lines)
   - Add template branch for `nextItem().kind === 'challenge'`
   - Render challenge title + body
   - Wire `onChallengeAnswer()` → `recordChallengeAnswer()`
   - Add null check → `router.navigate(['/review'])`

2. `src/app/features/question-v2.component.spec.ts` (+20 lines)
   - "renders challenge when positions complete"
   - "records challenge answer separately from positions"
   - "navigates to review when all items complete"

**Test Gate:**
- `npm run test` (+3 tests)
- `npm run build`

**Verification:**
- Answer all 4 positions in ideal
- See first challenge
- Answer challenge
- Continue through all challenges
- Automatically navigate to /review

**Exit Criteria:**
- Build green
- Tests green (219 SUCCESS: 216 + 3 new)
- Manual flow: complete full ideal → /review
- sessionStorage shows separate challengeAnswers

---

### Optional Step 5: Cutover (Separate Prompt)

**PROMPT-ID**: Q2-STEP5-CUTOVER-001

**Goal**: Make v2 the default, keep v1 as fallback route

**Files Changed:**
1. `src/app/app.routes.ts` (2 line swap)
   - Change default route to QuestionV2Component
   - Add ?v1=1 query param guard for fallback to QuestionComponent

**Test Gate:**
- `npm run test` (all existing + new tests)
- `npm run build`
- Manual smoke test of full flow

**Verification:**
- `/q/:id` uses v2 by default
- `/q/:id?v1=1` uses old component as fallback
- All tests green

**Exit Criteria:**
- Build green
- Tests green (219 SUCCESS)
- Smoke test passes
- Ready for production deployment

## 5) Risks + Mitigation

### Risk 1: Progress Math Mismatch

**Description**: `currentIndex` computed from `sequence.indexOf()` may break with new flow

**Impact**: "Ideal X of Y" displays wrong numbers

**Mitigation**: 
- Use `idealIndex` from `NextItem` directly instead of sequence position
- Sequencer provides authoritative index

**Test to Add**:
- "displays correct ideal progress for second category"
- Mock 2 categories, answer first completely, verify idealIndex = 1

---

### Risk 2: Resume Pointers Incompatible

**Description**: session.store has `phase/tlqId/followupIndex` resume pointers designed for two-phase flow

**Impact**: Refreshing page mid-session jumps to wrong question or crashes

**Mitigation**: 
- Do NOT use resume pointers in v2
- Let `nextUnansweredItem()` be single source of truth on cold start
- Sequencer naturally resumes from first unanswered item

**Test to Add**:
- "resumes from correct position after page refresh"
- Mock sessionStorage with partial answers
- Reload component, verify nextItem returns correct unanswered item

---

### Risk 3: Route Guards Block V2 Navigation

**Description**: `followupsGuard` checks all TLQ answered before allowing `/followups/:tlqId`

**Impact**: Cannot navigate to challenges in v2 flow

**Mitigation**: 
- V2 uses single route `/q/:id`
- No `/followups/:tlqId` sub-route
- Guard never fires for v2 flow

**Test**: 
- Existing guard tests already pass
- No changes needed

---

### Risk 4: Answer Persistence Collision

**Description**: Challenge answers might overwrite position answers if both use `answers()` map

**Impact**: Data corruption, scoring breaks

**Mitigation**: 
- Use `sessionStore.recordChallengeAnswer(challengeId, value)` for challenges
- Already implemented in commit 25e860f
- Stores in separate `challengeAnswers()` signal

**Test**: 
- `session.store.spec.ts` already has test at line 209:
  - "stores challenge answers separately from position answers"
- Run `npm run test`, verify passes

---

### Risk 5: Scoring Engine Breaks

**Description**: `calculateProfile()` may accidentally read `challengeAnswers` and corrupt scores

**Impact**: Profile calculation incorrect or crashes

**Mitigation**: 
- `session.store.spec.ts` already proves isolation at line 273:
  - "scoring isolation: calculateProfile ignores challengeAnswers"
- Sequencer keeps challenges out of scoring by design

**Test**: 
- Run `npm run test`
- Verify `session.store.spec.ts` passes
- Already green per commit 25e860f

## 6) Commands Executed

### Research Operations (READ-ONLY)

File reads:

    read_file docs/protocol/protocol-v7.md lines 1-80
    read_file docs/protocol/copilot-instructions-v7.md lines 1-80
    read_file docs/protocol/stay-on-track.md lines 1-50
    read_file src/app/features/question.component.ts lines 1-790 (full file)
    read_file src/app/core/flow/ideal-sequencer.ts lines 1-137
    read_file src/app/core/session/session.store.ts lines 1-100
    read_file src/app/app.routes.ts lines 1-50
    read_file src/app/features/followups.guard.ts lines 1-50

Searches:

    file_search **/*guard.ts
    grep_search route.*path.*q in app.routes.ts

### Final Verification

    git status --porcelain

**Output**: (empty)

**Result**: Working tree clean, no files modified, READ-ONLY research completed successfully.

## Appendix: Existing Infrastructure

### Already Completed (Commit 25e860f)

**Challenge Storage Infrastructure:**
- `src/app/core/session/session.store.ts`: `challengeAnswers` signal added
- `recordChallengeAnswer(challengeId, value)` method
- Backward-compatible persistence/hydration
- 5 comprehensive tests proving separation and scoring isolation

**Ideal Sequencer:**
- `src/app/core/flow/ideal-sequencer.ts`: Pure functions
  - `buildIdealBlock(category, positionsPerIdeal)`: Extract positions + challenges
  - `nextUnansweredItem(categories, positionAnswers, challengeAnswers)`: Find next item
- 11 tests covering 4-position limit, challenge ordering, sequential progression

**Test Coverage:**
- `src/app/core/session/session.store.spec.ts`: 5 new tests (209 total SUCCESS)
- `src/app/core/flow/ideal-sequencer.spec.ts`: 11 tests
- `docs/testing/test-catalog.md`: Updated

**Green Gates**: 
- Build passing
- 209 tests passing (1 skipped)
- All committed and pushed to origin/main

### File Sizes Reference

- `question.component.ts`: 790 lines (hot file)
- `question-v2.component.ts`: Estimated ~200 lines (simpler, no two-phase logic)
- `ideal-sequencer.ts`: 137 lines (pure functions, complete)
- `session.store.ts`: 332 lines (no changes needed)

## Conclusion

The proposed 4-step incremental plan provides a low-risk path to implementing the ideal-based question flow without breaking the existing hot file. By building question-v2 as a parallel component, we can develop and test iteratively while maintaining a stable fallback. The existing sequencer infrastructure and separate challenge storage are already in place, reducing implementation risk.

**Next Action**: Execute Step 1 (PROMPT-ID: Q2-STEP1-FEATURE-FLAG-001) to add feature flag routing.

---

**Report Generated**: 2024-12-24  
**Git State**: Clean working tree, commit 25e860f  
**Test Status**: 209 SUCCESS (1 skipped)  
**Build Status**: Green
