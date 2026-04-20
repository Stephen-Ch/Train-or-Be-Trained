# TD-RAWLS-007A1 — Challenges Empty-Array Contract Fix

**Date:** 2025-12-23  
**Commit:** 3c3ced3  
**Status:** ✅ Complete  
**Type:** Contract Enforcement / Data Layer  

## Goal

Resolve inconsistency risk in challenges export/validation contract by measuring actual artifact behavior and enforcing consistent contract across exporter, validator, and tests.

## Problem Identified

The exporter code was set to always create `challenges: []` for every followUp (via `(question.deeperDives ?? []).map(...)`), but the generated artifact hadn't been regenerated yet. This would create 28 followUps with empty `challenges: []` arrays, which the validator would accept but violates semantic clarity and bloats artifact size.

## Production Measurement

Command:

    node -e "const fs=require('fs'); const p='src/assets/content/rawls-values.generated.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); let withProp=0, empty=0, nonEmpty=0, totalFU=0; for (const c of (j.categories||[])){ for (const fu of (c.followUps||[])){ totalFU++; if (Object.prototype.hasOwnProperty.call(fu,'challenges')){ withProp++; const arr=fu.challenges; if (Array.isArray(arr) && arr.length===0) empty++; else if (Array.isArray(arr) && arr.length>0) nonEmpty++; } } } console.log(JSON.stringify({ totalCategories:(j.categories||[]).length, totalFU, withProp, empty, nonEmpty }));"

Result:

    {"totalCategories":7,"totalFU":28,"withProp":0,"empty":0,"nonEmpty":0}

**Reality Check:**
- Total FollowUps: 28
- FollowUps with challenges property: 0
- Empty arrays: 0
- Non-empty arrays: 0

Current artifact OMITS the property entirely (Case B).

## Contract Decision

**Enforced Contract:** Case B - Omit Property When Empty

**Rationale:**
1. Smaller artifact size (no redundant `challenges: []` across 28 followUps)
2. Semantic clarity (property presence indicates actual challenge content exists)
3. Strict validation (if challenges exist, they must be valid and non-empty)
4. Backward compatible (property absence is valid)

## Changes Made

### 1. Export Transformation (scripts/content-export-app.js)

Modified adaptCategories to conditionally include challenges property:

    followUps: (category.questions ?? []).map(question => {
      const followUp = {
        id: question.id,
        statement: question.body ?? question.title ?? '',
        reverse: Boolean(question.reverse),
        dimension: question.dimension ?? question.id
      };
      
      // Only include challenges property if deeperDives exist and are non-empty
      if (question.deeperDives && question.deeperDives.length > 0) {
        followUp.challenges = question.deeperDives.map(dive => ({
          id: dive.id,
          title: dive.title ?? '',
          body: dive.body ?? '',
          order: dive.order ?? 0
        }));
      }
      
      return followUp;
    })

**Behavior:**
- Property added ONLY when deeperDives exist and length > 0
- Property omitted entirely otherwise (not empty array)

### 2. Validator (src/app/core/content/content-integrity-validator.ts)

Added empty array rejection:

    if (followUp.challenges !== undefined) {
      if (!Array.isArray(followUp.challenges)) {
        errors.push({
          field: `${followUp.id}.challenges`,
          message: `challenges for ${followUp.id} must be array`
        });
      } else if (followUp.challenges.length === 0) {
        errors.push({
          field: `${followUp.id}.challenges`,
          message: `challenges property should be omitted when empty, not set to []`
        });
      } else {
        // Validate non-empty array...
      }
    }

**Contract Enforcement:**
- Property absence: VALID (backward compatible)
- Property present with empty array: INVALID (rejects with clear message)
- Property present with non-empty array: Validates structure/contiguity/etc.

### 3. Karma Tests (src/app/core/content/content.integrity.spec.ts)

Split previous test into two distinct tests:

    it('rejects empty challenges array (contract: omit property when empty)', () => {
      const contentWithEmptyChallenges = {
        categories: [
          {
            id: 'test',
            followUps: [
              {
                id: 'test-q0',
                challenges: []  // Should be omitted, not empty array
              }
            ]
          },
          // ...6 more categories for 7 total
        ]
      };
      
      const validation = validateContentIntegrity(contentWithEmptyChallenges);
      expect(validation.valid).toBeFalse();
      expect(validation.errors.some(e => e.message.includes('omitted when empty'))).toBeTrue();
    });

    it('accepts absent challenges property (backward compatible)', () => {
      const contentWithNoChallenges = {
        categories: [
          {
            id: 'test',
            followUps: [
              {
                id: 'test-q0',
                // No challenges property - this is valid
              }
            ]
          },
          // ...6 more categories
        ]
      };
      
      const validation = validateContentIntegrity(contentWithNoChallenges);
      expect(validation.valid).toBeTrue();
    });

Added @human header:

    /**
     * @human content integrity validation tests: generated artifact contract enforcement
     * @proves Validator enforces challenges contract (property omitted when empty, non-empty when present)
     * @lastTouched 2025-12-23
     */

### 4. Node Tests (scripts/content-export-app.spec.mjs)

Updated Test 3 to verify property omission:

    // Test 3: Position without deeperDives should OMIT challenges property
    const noDivesPipeline = {
      categories: [{
        id: 'test',
        title: 'Test',
        questions: [{ id: 'test-q0', title: 'Question', body: 'Body', order: 0 }]
      }]
    };
    const noDivesAdapted = adaptCategories(noDivesPipeline);
    const positionNoDives = noDivesAdapted[0].followUps[0];
    assert.strictEqual(positionNoDives.challenges, undefined, 'Should omit challenges property when no deeperDives (not empty array)');
    assert.strictEqual(Object.hasOwn(positionNoDives, 'challenges'), false, 'challenges property should not exist at all');

### 5. Test Catalog (docs/testing/test-catalog.md)

Updated row description:

    | content.integrity.spec.ts | ... | validates challenges contract (property omitted when empty, non-empty when present; rejects malformed title/body, enforces contiguous order) | 2025-12-23 |

Changed from "empty allowed" to "property omitted when empty, non-empty when present".

## Test Results

### Node Test

Command: node scripts/content-export-app.spec.mjs

Output:

    [content-export-app-test] Testing deeperDives transformation...
    [content-export-app-test] All assertions passed.

### Karma/Jasmine Suite

Command: npm run test

Result: TOTAL: 192 SUCCESS (1 skipped)

All tests pass including:
- Generated artifact integrity validation
- Empty array rejection test
- Absent property acceptance test
- Malformed challenge rejection
- Non-contiguous order rejection

### Build

Command: npm run build

Result:

    Application bundle generation complete. [2.698 seconds]

Build successful with expected warnings (bundle size, CommonJS dependencies).

## Git Operations

Commit:

    git add -A
    git commit -m "fix: challenges export/validator empty-array contract"

Output:

    [main 3c3ced3] fix: challenges export/validator empty-array contract
    6 files changed, 508 insertions(+), 43 deletions(-)
    create mode 100644 docs/status/td-rawls-007a-challenges-pipeline-enablement.md

Push:

    git push
    Updated origin/main (3c3ced3)

Working Tree: Clean (git status --porcelain returned empty)

## Files Modified

1. scripts/content-export-app.js - Conditional challenges property inclusion
2. src/app/core/content/content-integrity-validator.ts - Empty array rejection
3. src/app/core/content/content.integrity.spec.ts - Split tests, added @human header
4. scripts/content-export-app.spec.mjs - Property omission verification
5. docs/testing/test-catalog.md - Updated contract description
6. docs/status/td-rawls-007a-challenges-pipeline-enablement.md - Created (from previous work)

## Contract Summary

**Locked Contract:**
- Property OMITTED when no deeperDives in source
- Property PRESENT with non-empty array when deeperDives exist
- Validator REJECTS `challenges: []` as invalid
- Validator ACCEPTS property absence as valid (backward compatible)
- Exporter conditionally adds property only when data exists

**Benefits:**
- Artifact size reduction (28 followUps × no empty arrays)
- Semantic clarity (presence = content exists)
- Strict validation ensures data quality
- Backward compatible with existing content

## Impact

**User-Facing:** None (data layer only)

**Developer-Facing:**
- Exporter now requires explicit check before adding challenges
- Validator enforces strict contract (no empty arrays)
- Tests lock contract behavior for future changes
- Future challenge content authoring must use deeperDives in source JSON

## Next Steps

TD-RAWLS-007 Pilot: Author actual challenge content
- Add deeperDives[] to selected questions in content/categories/*.json
- Run content:export-app to generate challenges in artifact
- Verify validator accepts well-formed challenge data
- Admin UI will display challenge nodes automatically

---
**Report Generated:** 2025-12-23  
**Scope:** TD-RAWLS-007A1 Contract Enforcement  
**Status:** ✅ Complete, Tests Green, Contract Locked, Pushed to main
