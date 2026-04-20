# Deeper Dive Feasibility Report — TD-RAWLS-007

PROMPT-ID: REPORT-TD-RAWLS-007-DEEPER-DIVE-CONTENT-SHAPE-001

Date: 2025-12-23

## Summary

This read-only diagnostic maps the current state of "deeper dive" (challenge) content infrastructure to determine whether TD-RAWLS-007 (author 5–10 pilot items) can proceed as content-only work or requires code/pipeline changes.

**Verdict: Code changes required** — deeper-dive items exist in source JSON but are not transformed by the export pipeline, not validated in the runtime artifact, and not displayed by the UI.

---

## 1) "Deeper Dive" Name + Location

### What is it called in code/content?

- **Source JSON:** `deeperDives` (property on question objects)
- **Pipeline/runtime:** Not transformed — deeper dives are NOT present in generated artifact
- **UI terminology:** "Deeper Dives" (breadcrumb label in question.component.ts line 238)
- **Session state:** "challenges" (phase name in session.store.ts)
- **Admin UI:** "challenges" (ChallengeNode interface, admin-content-explorer.component.ts)

### Exact SOURCE JSON path

    categories[].questions[].deeperDives[] (optional array)
    File: content/categories/{categoryId}.json
    Property chain: question.deeperDives[].{id, title, body, order}

### Exact GENERATED JSON path

    NONE — deeperDives are NOT exported by content-export-app.js
    Generated artifact (src/assets/content/rawls-values.generated.json) contains ONLY:
        categories[].followUps[] (positions only)
    No challenge/deeper-dive transformation exists in content-export-app.js lines 44–50

---

## 2) Required Fields + ID Patterns

### SOURCE JSON schema (from content-lint.js lines 94–107)

- **id:** string (required, must not be empty)
- **title:** string (required, must not be empty/whitespace-only)
- **body:** string (required, must not be empty/whitespace-only)
- **order:** number (required, must be >= 0, contiguous starting from 0 per question)

### ID pattern enforcement

- content-lint.js line 95 calls `checkId(dive.id, 'DeeperDive', question.id)`
- No explicit regex found, but ID convention follows position pattern
- **Expected:** `{positionId}-fu{number}` (e.g., liberty-q0-fu0, liberty-q0-fu1)
- **Reference:** admin-content-explorer.component.spec.ts line 21 documents this pattern

### Validator checks

**scripts/content-lint.js lines 80–111**

- deeperDives must be array (if present)
- order values must be contiguous starting from 0
- id/title/body cannot be empty
- order must be number >= 0

**No validator in content-integrity-validator.ts** — that only validates runtime artifact shape. Generated artifact validator does NOT check deeperDives (they don't exist in output).

---

## 3) Runtime Surface Map

### Components that reference deeper-dive/challenge concepts

**src/app/core/session/session.store.ts**

- **Purpose:** Session state management with resume pointer
- **Usage:** `ResumePointer.phase` can be `'positions' | 'challenges'`
- **Trigger:** User navigates to `/q/:id/followups/:tlqId` route
- **Lines:** 19, 28, 191, 197, 216, 262

**src/app/features/question.component.ts**

- **Purpose:** Question flow UI
- **Usage:** Displays breadcrumb "Deeper Dives" when `phase === 'followUps'`
- **Trigger:** After user answers a position and clicks Continue
- **Lines:** 28 (template), 238 (breadcrumb computed), 217 (phase signal)
- **Note:** UI shows "followUps" phase but data structure expects challenges nested under positions

**src/app/features/admin/admin-content-explorer.component.ts**

- **Purpose:** Admin content editor
- **Usage:** ChallengeNode interface defined, challenges array exists on PositionNode
- **Current state:** Line 608 hardcodes `challenges: []` with comment "No nested challenges in current production schema"
- **Lines:** 26 (challenges property), 35 (ChallengeNode interface), 608 (empty array)

**src/app/features/review.component.spec.ts**

- **Purpose:** Review screen tests
- **Usage:** Test labels reference "Positions 3/3, Challenges 3/3"
- **Current reality:** Positions = Challenges in current model (no distinct deeper dives)
- **Lines:** 84, 86, 90

### What user action/condition triggers it (if implemented)?

**Current UI flow (question.component.ts):**

1. User answers a top-level position (TLQ)
2. User clicks "Continue"
3. Component WOULD navigate to `/q/:id/followups/:tlqId` route
4. Phase changes to `'followUps'` and breadcrumb shows "Deeper Dives"

**HOWEVER:** No actual challenge/deeper-dive data exists in production

- Generated artifact has zero challenges (admin spec line 66 proves this)
- Admin editor hardcodes `challenges: []` empty array
- content-export-app.js does NOT transform deeperDives from source

---

## 4) Feasibility Verdict for TD-RAWLS-007

**Can we author 5–10 deeper-dive items as CONTENT-ONLY? NO**

### Smallest code/pipeline changes required

**1. Extend content-export-app.js transformation** (scripts/content-export-app.js lines 44–50)

- Map `question.deeperDives[]` to nested challenge structure
- Decide output shape: flat followUps with parent ID? or nested array?
- Must align with content-adapter.ts expectations (src/app/core/content/content-adapter.ts)

**2. Update content-integrity-validator.ts** (src/app/core/content/content-integrity-validator.ts)

- Add validation for challenge items in runtime artifact
- Define expected shape (id/statement/dimension fields)
- Enforce ID pattern `{positionId}-fu{number}`

**3. Fix admin-content-explorer.component.ts buildPositionNodes** (line 608)

- Currently hardcodes `challenges: []` empty array
- Must map actual challenge data from rawCategories if present
- Update ChallengeNode interface if needed (already defined line 35)

**4. Verify question.component.ts currentFollowUps computed** (lines 283–290)

- Currently filters `category.followUps` by selectedOption ID match
- May need adjustment if challenges become nested vs flat structure

**5. Update session state/resume logic if challenge data structure differs**

- session.store.ts already has `phase: 'challenges'` support
- Verify followupIndex points to correct challenge array location

### Why these changes are required

- Source JSON has `deeperDives` property but export pipeline ignores it completely
- Generated artifact has ONLY flat `followUps` (positions), no challenges
- Admin UI and question flow have placeholder code but no data to display
- Cannot add content-only items because pipeline does not transform them

---

## 5) Exact Minimal Pilot Example

### Minimal JSON snippet to add ONE deeper-dive item to ONE position

**File:** content/categories/liberty.json  
**Location:** Inside first question object (liberty-q0), add deeperDives array

    {
      "id": "liberty-q0",
      "title": "How important is individual freedom to you?",
      "body": "How important is individual freedom to you?",
      "order": 0,
      "tlq": false,
      "deeperDives": [
        {
          "id": "liberty-q0-fu0",
          "title": "Should hate speech be protected as free expression?",
          "body": "Should hate speech be protected as free expression?",
          "order": 0
        }
      ]
    }

### This would

- **Pass** content-lint.js validation (id/title/body non-empty, order contiguous)
- **Increment** dive count reported by `npm run content:lint`
- **NOT appear** in generated artifact (content-export-app.js ignores it)
- **NOT be visible** in admin UI (buildPositionNodes returns empty challenges array)
- **NOT be playable** in question flow (no data loaded)

**To make it functional,** complete pipeline changes (item 4 above) would be required first.

---

## 6) Commands Run

    git status --porcelain
    Get-ChildItem -Recurse -File src | Select-String -Pattern "interface .*FollowUp|interface .*Challenge|challenges|followUps|Positions|schema|validator|content-integrity" | Select-Object -First 200
    Get-Content "content\categories\liberty.json" -TotalCount 120
    Get-Content "src\assets\content\rawls-values.generated.json" -TotalCount 150
    Get-Content "content\categories\equality.json" -TotalCount 50
    Get-ChildItem -Recurse -File src\app | Select-String -Pattern "challenges|deep dive|deeper|drill|more detail" | Select-Object -First 100
    git status --porcelain

---

## 7) Final git status

    (empty — working tree clean)

---

## Recommended Next Steps

1. **Decide transformation strategy:** Flat vs nested challenge structure in generated JSON
2. **Create story prompt for pipeline enablement:** Extend content-export-app.js + validator
3. **Only then:** Author pilot deeper-dive content (TD-RAWLS-007)

---

*Report generated: 2025-12-23*  
*Prompt: REPORT-TD-RAWLS-007-DEEPER-DIVE-CONTENT-SHAPE-001*
