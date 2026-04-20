# TD-RAWLS-007C — Pilot Expanded to 5 Challenges

**Date:** 2025-12-23  
**Commit:** 239e5b1  
**Status:** ✅ Complete  
**Type:** Content / Pilot Expansion  

## Goal

Complete the minimum TD-RAWLS-007 pilot by expanding from 1 to 5 total challenges in liberty-q0, proving the full pipeline handles multiple challenges per position with proper order validation and contract enforcement.

## Changes Made

### Source Content Expansion

File: content/categories/liberty.json

Expanded deeperDives array in liberty-q0 from 1 to 5 items (order 0-4):

**Existing Challenge (fu0):**
- ID: liberty-q0-fu0
- Title: "Should hate speech be protected as free expression?"
- Body: "Explain your reasoning. Where do you draw the line between protecting speech and preventing harm?"
- Order: 0

**Added Challenges (fu1-fu4):**

fu1:
- ID: liberty-q0-fu1
- Title: "Should deliberate lies for personal gain be protected as speech?"
- Body: "Explain why or why not. What harms (if any) justify limits, and who decides?"
- Order: 1

fu2:
- ID: liberty-q0-fu2
- Title: "Should political lies receive special protection during elections?"
- Body: "Explain your reasoning. Should rules differ for politicians, campaigns, and ordinary citizens?"
- Order: 2

fu3:
- ID: liberty-q0-fu3
- Title: "How should we handle misinformation that spreads rapidly online?"
- Body: "Pick an approach (platform rules, government regulation, media literacy, or none) and explain tradeoffs."
- Order: 3

fu4:
- ID: liberty-q0-fu4
- Title: "Where is your line between protecting speech and preventing harm?"
- Body: "Describe a concrete example that crosses your line, and why it should be restricted (or not)."
- Order: 4

**Thematic Progression:**
1. Hate speech (extreme case)
2. Personal lies (individual harm)
3. Political lies (institutional context)
4. Online misinformation (systemic/platform scale)
5. Personal boundary synthesis

### Generated Artifact

File: src/assets/content/rawls-values.generated.json (regenerated via pipeline)

The liberty-q0 followUp now includes:

    {
      "id": "liberty-q0",
      "statement": "How important is individual freedom to you?",
      "reverse": false,
      "dimension": "liberty-q0",
      "challenges": [
        {
          "id": "liberty-q0-fu0",
          "title": "Should hate speech be protected as free expression?",
          "body": "Explain your reasoning. Where do you draw the line between protecting speech and preventing harm?",
          "order": 0
        },
        {
          "id": "liberty-q0-fu1",
          "title": "Should deliberate lies for personal gain be protected as speech?",
          "body": "Explain why or why not. What harms (if any) justify limits, and who decides?",
          "order": 1
        },
        {
          "id": "liberty-q0-fu2",
          "title": "Should political lies receive special protection during elections?",
          "body": "Explain your reasoning. Should rules differ for politicians, campaigns, and ordinary citizens?",
          "order": 2
        },
        {
          "id": "liberty-q0-fu3",
          "title": "How should we handle misinformation that spreads rapidly online?",
          "body": "Pick an approach (platform rules, government regulation, media literacy, or none) and explain tradeoffs.",
          "order": 3
        },
        {
          "id": "liberty-q0-fu4",
          "title": "Where is your line between protecting speech and preventing harm?",
          "body": "Describe a concrete example that crosses your line, and why it should be restricted (or not).",
          "order": 4
        }
      ]
    }

Contract compliance: challenges property present (not omitted) because array contains 5 items.

### Documentation

File: docs/status/solution-report.md

Added TD-RAWLS-007C entry at top documenting expansion with full measurement results.

## Content Pipeline Execution

### Lint

Command: npm run content:lint

Output:

    ✅ Content OK (7 categories, 28 questions, 5 deeper dives)
    📄 Diff report: C:\Users\schur\workspaces\Rawls\JustSprites\artifacts\content-diff.md

### Build

Command: npm run content:build

Output:

    ✅ Content validated and built successfully
    7 categories, 28 questions, 5 deeper dives
    Output: C:\Users\schur\workspaces\Rawls\JustSprites\dist\content.json

### Export

Command: npm run content:export-app

Output:

    [content-export-app] Exported pipeline content to C:\Users\schur\workspaces\Rawls\JustSprites\src\assets\content\rawls-values.generated.json

## Artifact Measurement

Command:

    node -e "const fs=require('fs'); const p='src/assets/content/rawls-values.generated.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); const liberty=j.categories.find(c=>c.id==='liberty'); const fu=(liberty?.followUps||[]).find(x=>x.id==='liberty-q0'); const totalChallenges=(j.categories||[]).flatMap(c=>c.followUps||[]).reduce((n,fu)=>n+((fu.challenges||[]).length),0); const ids=(fu?.challenges||[]).map(x=>x.id); console.log(JSON.stringify({ categories:(j.categories||[]).length, positions:(j.categories||[]).reduce((n,c)=>n+((c.followUps||[]).length),0), totalChallenges, liberty_q0_hasChallenges: Object.prototype.hasOwnProperty.call(fu||{},'challenges'), liberty_q0_challengesLen: (fu?.challenges||[]).length, liberty_q0_challengeIds: ids }, null, 2));"

Result:

    {
      "categories": 7,
      "positions": 28,
      "totalChallenges": 5,
      "liberty_q0_hasChallenges": true,
      "liberty_q0_challengesLen": 5,
      "liberty_q0_challengeIds": [
        "liberty-q0-fu0",
        "liberty-q0-fu1",
        "liberty-q0-fu2",
        "liberty-q0-fu3",
        "liberty-q0-fu4"
      ]
    }

**Verification:**
- ✅ categories === 7
- ✅ positions === 28
- ✅ totalChallenges === 5 (up from 1)
- ✅ liberty_q0_hasChallenges === true
- ✅ liberty_q0_challengesLen === 5 (was 1)
- ✅ liberty_q0_challengeIds === ["liberty-q0-fu0", "liberty-q0-fu1", "liberty-q0-fu2", "liberty-q0-fu3", "liberty-q0-fu4"]

## Contract Compliance

**TD-RAWLS-007A1 Contract:** Property omitted when empty, present when non-empty

**Order Contiguity (TD-RAWLS-007A):** Challenge order values must be contiguous starting from 0

**Compliance Check:**
- liberty-q0 has 5 deeperDives → challenges property PRESENT ✅
- Other 27 positions have 0 deeperDives → challenges property OMITTED ✅
- Array is non-empty (length 5) → passes validator empty-check ✅
- Order values are 0,1,2,3,4 → contiguous starting from 0 ✅
- All challenges have valid id/title/body → passes field validation ✅

## Test Results

### Karma/Jasmine Suite

Command: npm run test

Result: TOTAL: 192 SUCCESS

All tests pass including:
- Generated artifact integrity validation
- Challenge contract enforcement (empty array rejection, absent property acceptance)
- Challenge structure validation (malformed title/body, non-contiguous order)
- Content service loading with 5 challenges

### Build

Command: npm run build

Result:

    Application bundle generation complete. [2.662 seconds]

Build successful with expected warnings.

## Git Operations

Staged files:

    git add content/categories/liberty.json src/assets/content/rawls-values.generated.json docs/status/solution-report.md

Commit:

    git commit -m "feat: TD-RAWLS-007 expand pilot challenges to 5 items"
    [main 239e5b1] feat: TD-RAWLS-007 expand pilot challenges to 5 items
    3 files changed, 72 insertions(+)

Push:

    git push origin main
    Updated origin/main (34c4983..239e5b1)

Working Tree: Clean (git status --porcelain returned empty)

## Files Modified

1. content/categories/liberty.json
   - Expanded deeperDives array from 1 to 5 items
   - Added fu1, fu2, fu3, fu4 with contiguous order

2. src/assets/content/rawls-values.generated.json
   - Regenerated via content pipeline
   - liberty-q0 followUp now has 5 challenges

3. docs/status/solution-report.md
   - Added TD-RAWLS-007C entry with measurement results
   - Moved TD-RAWLS-007B entry below

## Admin UI Impact

The challenge tree now displays 5 nodes under liberty-q0:

    Liberty (category)
      └── How important is individual freedom to you? (position: liberty-q0)
            ├── Should hate speech be protected as free expression? (challenge: liberty-q0-fu0)
            ├── Should deliberate lies for personal gain be protected as speech? (challenge: liberty-q0-fu1)
            ├── Should political lies receive special protection during elections? (challenge: liberty-q0-fu2)
            ├── How should we handle misinformation that spreads rapidly online? (challenge: liberty-q0-fu3)
            └── Where is your line between protecting speech and preventing harm? (challenge: liberty-q0-fu4)

All challenge nodes display with icon 'pi pi-question-circle' and are mapped from real data.

## Pilot Completion

**TD-RAWLS-007 Minimum Pilot Goals:**
- ✅ Add 5-10 challenge items to pilot content (achieved: 5)
- ✅ Export pipeline transforms deeperDives → challenges
- ✅ Validator enforces contract and structure
- ✅ Admin UI displays challenge nodes
- ✅ Tests remain green (no breakage)

**Scope Boundaries Respected:**
- ❌ No gameplay UI (users cannot see/interact with challenges yet)
- ❌ No session recording of challenge responses
- ❌ No profile calculation integration
- ❌ No additional categories beyond liberty

The pilot proves the infrastructure works. Future work can expand to other categories or build user-facing gameplay.

## Content Strategy Notes

The 5 challenges form a coherent progression exploring liberty boundaries:

1. **Hate speech** - Establishes the extreme case where speech causes direct harm
2. **Personal lies** - Narrows to individual-scale deception and harm
3. **Political lies** - Raises institutional/systemic context during elections
4. **Online misinformation** - Addresses platform-scale and rapid spread dynamics
5. **Personal synthesis** - Asks user to articulate their own boundary line

This progression could serve as a template for other category follow-ups.

## Related Work

- TD-RAWLS-007A: Export pipeline enablement (commit 2a07e8f)
- TD-RAWLS-007A1: Contract enforcement fix (commit 3c3ced3)
- TD-RAWLS-007B: First challenge content (commit 1dda428)
- This work: Expand to 5 challenges (commit 239e5b1)

---
**Report Generated:** 2025-12-23  
**Scope:** TD-RAWLS-007C Pilot Expansion - 5 Challenges  
**Status:** ✅ Complete, Pipeline Verified, Contract Compliant, Tests Green, Pushed to main
