# TD-RAWLS-007A — Challenges Pipeline Enablement

**Date:** 2025-12-23  
**Commit:** 2a07e8f  
**Status:** ✅ Complete  
**Type:** Infrastructure / Data Layer  

## Goal

Enable end-to-end challenges data pipeline without changing user gameplay flow:
- Export transformation from deeperDives[] to challenges[]
- TypeScript types and validation logic
- Admin UI integration for challenge node display

## Context

Following REPORT-TD-RAWLS-007 feasibility diagnostic, which identified that:
- Source JSON contains deeperDives[] property in question objects
- Current export pipeline ignored deeperDives entirely
- No TypeScript types, validation, or UI display existed for challenges

This work establishes the foundational infrastructure to support future TD-RAWLS-007 pilot challenge content authoring.

## Production Measurement (Pre-Change)

Command:

    node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('src/assets/content/rawls-values.generated.json','utf8')); console.log('Categories:', data.categories.length); console.log('Positions:', data.categories.reduce((s,c)=>s+c.followUps.length,0)); console.log('Challenges:', data.categories.reduce((s,c)=>s+c.followUps.reduce((ss,f)=>ss+(f.challenges?f.challenges.length:0),0),0));"

Result:

    Categories: 7
    Positions: 28
    Challenges: 0

## Changes Made

### 1. Export Transformation (scripts/content-export-app.js)

Extended adaptCategories function to map deeperDives → challenges:

    function adaptCategories(categories) {
      return categories.map((cat) => {
        const followUps = cat.questions.map((question) => {
          const { deeperDives, ...rest } = question;
          return {
            ...rest,
            challenges: (deeperDives ?? []).map((dive) => ({
              id: dive.id,
              title: dive.title,
              body: dive.body,
              order: dive.order,
            })),
          };
        });
        // ...rest of category mapping
      });
    }

Behavior:
- Maps deeperDives[] to challenges[] with id/title/body/order properties
- Returns empty array when deeperDives absent or empty
- Preserves backward compatibility

### 2. TypeScript Types (src/app/core/content/types.ts)

Added Challenge interface and extended FollowUp:

    export interface Challenge {
      id: string;
      title: string;
      body: string;
      order: number;
    }

    export interface FollowUp {
      id: string;
      title: string;
      body: string;
      order: number;
      challenges?: Challenge[]; // NEW: optional challenges array
    }

### 3. Validation Logic (src/app/core/content/content-integrity-validator.ts)

Extended validator to check challenges when present:

    // Challenge validation (if present)
    if (followUp.challenges !== undefined) {
      if (followUp.challenges.length === 0) {
        throw new Error(
          `Category "${category.id}", FollowUp "${followUp.id}": challenges array is present but empty`
        );
      }

      const challengeIds = new Set<string>();
      const challengeOrders: number[] = [];

      for (const challenge of followUp.challenges) {
        if (!challenge.id || challenge.id.trim() === '') {
          throw new Error(
            `Category "${category.id}", FollowUp "${followUp.id}": challenge has empty id`
          );
        }
        if (!challenge.title || challenge.title.trim() === '') {
          throw new Error(
            `Category "${category.id}", FollowUp "${followUp.id}", Challenge "${challenge.id}": empty title`
          );
        }
        if (!challenge.body || challenge.body.trim() === '') {
          throw new Error(
            `Category "${category.id}", FollowUp "${followUp.id}", Challenge "${challenge.id}": empty body`
          );
        }
        if (challenge.order < 0) {
          throw new Error(
            `Category "${category.id}", FollowUp "${followUp.id}", Challenge "${challenge.id}": order must be >= 0`
          );
        }
        if (challengeIds.has(challenge.id)) {
          throw new Error(
            `Category "${category.id}", FollowUp "${followUp.id}": duplicate challenge id "${challenge.id}"`
          );
        }
        challengeIds.add(challenge.id);
        challengeOrders.push(challenge.order);
      }

      // Validate order contiguity
      challengeOrders.sort((a, b) => a - b);
      for (let i = 0; i < challengeOrders.length; i++) {
        if (challengeOrders[i] !== i) {
          throw new Error(
            `Category "${category.id}", FollowUp "${followUp.id}": challenge orders must be contiguous starting from 0, found gap at ${i}`
          );
        }
      }
    }

Validation Rules:
- If challenges[] present, must be non-empty
- Each challenge must have non-empty id, title, body
- order must be >= 0
- Challenge IDs must be unique within followUp
- Order values must be contiguous (0, 1, 2, ...)

### 4. Admin UI Integration (src/app/features/admin/admin-content-explorer.component.ts)

Updated buildPositionNodes to map real challenge data:

    private buildPositionNodes(
      cat: Category,
      fu: FollowUp,
      parentKey: string
    ): PositionNode {
      const positionKey = `${parentKey}.followUps[${fu.order}]`;
      return {
        key: positionKey,
        label: fu.title,
        data: fu,
        type: 'position',
        expandedIcon: 'pi pi-folder-open',
        collapsedIcon: 'pi pi-folder',
        children: (fu.challenges ?? []).map((ch, idx) => ({  // CHANGED: from hardcoded []
          key: `${positionKey}.challenges[${idx}]`,
          label: ch.title,
          data: ch,
          type: 'challenge',
          icon: 'pi pi-question-circle',
        })),
      };
    }

Behavior:
- Maps from fu.challenges array when present
- Falls back to empty array when absent
- Creates ChallengeNode objects with key/label/data/type/icon

### 5. Node Test (scripts/content-export-app.spec.mjs)

NEW deterministic test file for export transformation:

    #!/usr/bin/env node
    
    import { readFileSync } from 'fs';
    import { adaptCategories } from './content-export-app.js';
    
    console.log('[content-export-app-test] Starting tests...');
    
    // Load real category as template
    const rawLiberty = JSON.parse(
      readFileSync('./content/categories/liberty.json', 'utf8')
    );
    
    const mockCategory = {
      ...rawLiberty,
      questions: [
        {
          id: 'q1',
          title: 'Q1 Title',
          body: 'Q1 Body',
          order: 0,
          deeperDives: [
            { id: 'd1', title: 'Dive 1', body: 'Body 1', order: 0 },
            { id: 'd2', title: 'Dive 2', body: 'Body 2', order: 1 },
          ],
        },
        {
          id: 'q2',
          title: 'Q2 Title',
          body: 'Q2 Body',
          order: 1,
          // No deeperDives property
        },
      ],
    };
    
    const adapted = adaptCategories([mockCategory]);
    const cat = adapted[0];
    
    // Test 1: challenges array exists for q1
    if (!cat.followUps[0].challenges) {
      throw new Error('Test 1 FAILED: challenges array missing for q1');
    }
    
    // Test 2: challenges array has correct length
    if (cat.followUps[0].challenges.length !== 2) {
      throw new Error(
        `Test 2 FAILED: expected 2 challenges, got ${cat.followUps[0].challenges.length}`
      );
    }
    
    // Test 3: challenges mapped correctly
    const ch1 = cat.followUps[0].challenges[0];
    if (ch1.id !== 'd1' || ch1.title !== 'Dive 1') {
      throw new Error('Test 3 FAILED: challenge 1 properties incorrect');
    }
    
    // Test 4: empty array when deeperDives absent
    if (cat.followUps[1].challenges.length !== 0) {
      throw new Error('Test 4 FAILED: expected empty array when deeperDives absent');
    }
    
    console.log('[content-export-app-test] All assertions passed.');

Run via: node scripts/content-export-app.spec.mjs

### 6. Karma/Jasmine Tests (src/app/core/content/content.integrity.spec.ts)

Extended existing test suite with 3 challenge validation tests:

    it('should accept challenges array when absent (backward compatibility)', () => {
      const categories: Category[] = [
        // ...7 test categories
      ];
      expect(() => validateContentIntegrity(categories)).not.toThrow();
    });

    it('should reject malformed challenge title or body', () => {
      const categories: Category[] = [
        {
          id: 'test1',
          title: 'Test Category',
          description: 'Test Description',
          order: 0,
          followUps: [
            {
              id: 'fu1',
              title: 'FollowUp 1',
              body: 'Body 1',
              order: 0,
              challenges: [
                { id: 'ch1', title: '', body: 'Body', order: 0 }, // Empty title
              ],
            },
          ],
        },
        // ...remaining 6 categories
      ];
      expect(() => validateContentIntegrity(categories)).toThrowError(
        /empty title/
      );
    });

    it('should reject non-contiguous challenge order', () => {
      const categories: Category[] = [
        {
          id: 'test1',
          title: 'Test Category',
          description: 'Test Description',
          order: 0,
          followUps: [
            {
              id: 'fu1',
              title: 'FollowUp 1',
              body: 'Body 1',
              order: 0,
              challenges: [
                { id: 'ch1', title: 'Ch 1', body: 'Body 1', order: 0 },
                { id: 'ch2', title: 'Ch 2', body: 'Body 2', order: 2 }, // Gap: 0,2
              ],
            },
          ],
        },
        // ...remaining 6 categories
      ];
      expect(() => validateContentIntegrity(categories)).toThrowError(
        /contiguous starting from 0/
      );
    });

### 7. Test Catalog Update (docs/testing/test-catalog.md)

Updated two rows:

    | scripts/content-export-app.spec.mjs | Node | Deterministic | content-export-app.js | Integration | Validates deeperDives→challenges mapping | green | 2025-12-23 | TD-RAWLS-007A |
    | src/app/core/content/content.integrity.spec.ts | Karma/Jasmine | Deterministic | content-integrity-validator.ts | Contract | Validates generated content structure; added 3 challenge validation tests | green | 2025-12-23 | TD-RAWLS-007A |

## Test Results

### Node Test

Command: node scripts/content-export-app.spec.mjs

Output:

    [content-export-app-test] Starting tests...
    [content-export-app-test] All assertions passed.

### Karma/Jasmine Test Suite

Command: npm run test

Result: TOTAL: 191 SUCCESS

Initial Failures:
- Test fixtures expected 7 categories, had 6
- Fixed by adding test7 category to challenge validation tests

Final Run: All tests green

### Build

Command: npm run build

Result:

    Initial chunk files | Names         |  Raw size | Estimated transfer size
    main-ZMFNK5KC.js    | main          | 431.37 kB |               107.79 kB
    
    Application bundle generation complete. [2.765 seconds]

Warnings (expected):
- Bundle size exceeds recommended limit
- CommonJS or AMD dependencies detected

## Git Operations

Commit:

    git add -A
    git commit -m "feat: export + validate challenges (deeperDives)"

Changes:

    8 files changed, 558 insertions(+), 4 deletions(-)
    create mode 100644 scripts/content-export-app.spec.mjs

Push:

    git push
    Updated origin/main (2a07e8f)

Working Tree: Clean (git status --porcelain returned empty)

## Files Modified

1. scripts/content-export-app.js - Export transformation
2. src/app/core/content/types.ts - Challenge interface + FollowUp extension
3. src/app/core/content/content-integrity-validator.ts - Challenge validation logic
4. src/app/features/admin/admin-content-explorer.component.ts - Real challenge mapping
5. scripts/content-export-app.spec.mjs - NEW Node test
6. src/app/core/content/content.integrity.spec.ts - 3 new challenge tests
7. docs/testing/test-catalog.md - Updated 2 rows
8. docs/status/deeper-dive-feasibility-report.md - Referenced as predecessor

## Impact

### User-Facing

NONE. No gameplay flow changes, no UI changes visible to players.

### Developer-Facing

- challenges[] property now appears in generated artifact (currently empty)
- Admin UI displays challenge nodes when present in data
- Validator enforces challenge data integrity rules
- Test coverage for challenge pipeline established

## Next Steps

TD-RAWLS-007 Pilot: Author 5-10 actual challenge items in source JSON
- Add deeperDives[] arrays to selected questions in content/categories/*.json
- Export pipeline will transform them → challenges[]
- Validator will enforce integrity
- Admin UI will display them in content tree

Infrastructure is now ready for challenge content authoring.

## Lessons Learned

1. Validators must handle both presence and absence of optional fields (if !== undefined check)
2. Test fixtures must match production constraints (7 categories requirement)
3. Deterministic Node tests useful for isolated pipeline transformation verification
4. Backward compatibility preserved by optional property + empty array fallback

## Related Documents

- [docs/status/deeper-dive-feasibility-report.md](deeper-dive-feasibility-report.md) - REPORT-TD-RAWLS-007 diagnostic
- [docs/testing/test-catalog.md](../testing/test-catalog.md) - Test registry
- [docs/protocol/protocol-v7.md](../protocol/protocol-v7.md) - Process requirements

---
**Report Generated:** 2025-12-23  
**Scope:** TD-RAWLS-007A Infrastructure Enablement  
**Status:** ✅ Complete, Tests Green, Build Successful, Pushed to main
