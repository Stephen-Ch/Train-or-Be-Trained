# FW-ADMIN-002D Discovery Report: Nested Challenge Edit Capability

**Date:** 2025-12-30  
**Prompt ID:** FW-ADMIN-002D-S1A-DISCOVERY-NESTED-CHALLENGE-EDIT-001  
**Type:** Discovery (read-only investigation)

## Executive Summary

Investigated how admin content explorer currently handles nested challenges (deeperDives), identified missing patch export capability, and proposed next tiny TDD step. Admin UI already renders nested challenges with read/edit controls BUT saveChallenge only updates local state without persisting to draft storage or exporting patches. Patch pipeline lacks challenge operation support in both frontend (PatchOperation types) and backend (apply-admin-patch-helper.js).

## 1. Branch Context

- Branch: main
- Sync: synced with origin/main (no ahead/behind)
- Working tree: clean (empty porcelain output)

## 2. Shape Proof Counts

Command executed:

    npm run test -- --include src/app/features/admin/admin-content-explorer.component.spec.ts --watch=false --browsers ChromeHeadless

Results logged by PRODUCTION SHAPE PROOF test:

    positionCount: 28
    flatChallengeCount: 0
    nestedChallengeCount: 13
    firstNestedChallengeTitle: Hate speech should be protected as free expression

Evidence location: admin-content-explorer.component.spec.ts lines 29-54 shows counting logic. flatChallengeCount searches categories[].followUps[] array for items matching pattern /-fu\d+$/ (legacy schema where challenges were peers). nestedChallengeCount sums fu.challenges.length for all positions (current schema where challenges nested in followUps[].challenges[] arrays).

## 3. Where Nested Challenges Live

Generated artifact: src/assets/content/rawls-values.generated.json

Property chain: categories[].followUps[].challenges[]

Example nested challenge with triggerRule (lines 61-90):

    "challenges": [
      {
        "id": "liberty-q1-fu0",
        "title": "Personal choice should be absolute regardless of potential harm to self",
        "body": "Consider whether individuals should be free to make choices that may harm themselves.",
        "order": 0,
        "triggerRule": {
          "parentAnswerMin": 3,
          "tags": ["pro-liberty", "personal-autonomy"]
        }
      }
    ]

ID pattern: {positionId}-fu{index} (e.g., liberty-q1-fu0 where parent position is liberty-q1)

Challenge schema fields (per src/app/core/content/types.ts lines 8-14):
- id: string
- title: string
- body: string
- order: number
- triggerRule?: { parentAnswerMin?: number; parentAnswerMax?: number; tags?: string[] }

## 4. Admin Ingestion Findings

Evidence location: admin-content-explorer.component.ts lines 603-615

Data source: Component fetches via ContentService.state() at line 576. getBaseCategories() (lines 603-606) returns rawCategories if available, else runtime categories. Both come from generated artifact rawls-values.generated.json.

In-memory transformation (lines 615-691): buildIdealsTree creates IdealNode[] from Category[]. buildPositionNodes (lines 660-691) maps category.followUps to PositionNode[]. Lines 674-682 explicitly map nested challenges to ChallengeNode[]:

    const challenges: ChallengeNode[] = (fu.challenges ?? []).map(ch => ({
      id: ch.id,
      title: ch.title || '',
      body: ch.body || '',
      visible: true,
      editing: false,
      editTitle: ch.title || '',
      editBody: ch.body || ''
    }));

Nested challenges ARE preserved in admin UI data model:
- PositionNode interface (lines 23-33) includes challenges: ChallengeNode[]
- ChallengeNode interface (lines 35-43) captures id, title, body, editing state, editTitle, editBody
- triggerRule metadata NOT captured in ChallengeNode (field missing from interface)

## 5. Admin UI Findings

Evidence location: admin-content-explorer.component.ts template lines 390-450

Rendering hierarchy: Ideals → Positions → Challenges (when position.expanded === true)

Challenge UI structure (BOTH read + edit modes present):

READ mode (lines 399-412):
- Renders challenge.title (h4) and challenge.body (p)
- Edit button present when isDevMode() === true
- Click handler: startEditChallenge(challenge)
- data-testid: challenge-{id}, edit-challenge-{id}

EDIT mode (lines 415-450):
- Input field for challenge.editTitle (data-testid: edit-challenge-title-{id})
- Textarea for challenge.editBody (data-testid: edit-challenge-body-{id})
- Save button calls saveChallenge(ideal, challenge)
- Cancel button calls cancelEditChallenge(challenge)
- data-testid: save-challenge-{id}, cancel-edit-challenge-{id}

Edit handlers exist (lines 1005-1038):
- startEditChallenge: sets challenge.editing = true, copies current values to edit fields
- cancelEditChallenge: reverts edit fields to original values
- hasChallengeChanges: compares editTitle/editBody vs current title/body
- saveChallenge: LINE 1027 HAS TODO COMMENT: "Fix challenge save logic - challenges are nested under followUps[], not top-level"
- Current saveChallenge only updates local ChallengeNode state, does NOT persist to draft storage or export patch

Missing from UI:
- No triggerRule editing (parentAnswerMin/Max/tags not exposed)
- No challenge reorder controls (no move-up/down buttons like positions have)
- No challenge hidden/unhidden toggle (positions have this via setHidden patch op)

## 6. Patch/Apply Pipeline Capability Findings

Evidence location: admin-content-explorer.component.ts lines 55-85

Current PatchOperation type union supports:
- FieldPatchOperation: kind 'category' | 'position', field 'name' | 'description' | 'statement'
- ReorderPatchOperation: kind 'position' | 'category', orderedIds array
- SetHiddenPatchOperation: kind 'position', id, hidden boolean

Nested challenge edits NOT supported:
- FieldPatchOperation.kind only accepts 'category' | 'position' (no 'challenge' kind)
- No op type for challenge text edit, triggerRule edit, or challenge reorder

DraftEntry interface (lines 45-49) lacks challenge fields:

    interface DraftEntry {
      name?: string;
      description?: string;
      text?: string;
    }

buildPatchPayload logic (lines 1071-1140) only iterates over ideals and positions; no challenge iteration.

Apply pipeline script (scripts/admin/apply-admin-patch-helper.js lines 1-39) documents supported ops:
- category text edits (name, description)
- position text edits (statement)
- position reorder
- category reorder
- position setHidden

No mention of challenge operations in pipeline script comments or implementation.

Conclusion: To support nested challenge editing via patch pipeline, BOTH frontend and backend need new patch op types:
- Frontend: extend PatchOperation union, DraftEntry interface, buildPatchPayload logic
- Backend: extend apply-admin-patch-helper.js to handle challenge edit/reorder/setHidden ops
- Source JSON schema uses deeperDives[] property (per CONTENT-RULES.md lines 35-46), so pipeline must map challenge patches to deeperDives[] edits

## 7. Recommended Next Tiny TDD Step

PROMPT-ID suggestion: FW-ADMIN-002D-S1B-CHALLENGE-TITLE-EDIT-PATCH-001

Smallest user-visible capability: Admin can edit nested challenge title/body AND export patch includes challenge edits

Exact spec file: src/app/features/admin/admin-content-explorer.component.spec.ts

Exact RED assertion (add new test):

    it('should include challenge title edit in exported patch', () => {
      fixture.detectChanges();
      const ideals = component.ideals();
      
      // Find first position with challenges
      let targetIdeal: IdealNode | undefined;
      let targetPosition: PositionNode | undefined;
      let targetChallenge: ChallengeNode | undefined;
      
      for (const ideal of ideals) {
        for (const position of ideal.positions) {
          if (position.challenges && position.challenges.length > 0) {
            targetIdeal = ideal;
            targetPosition = position;
            targetChallenge = position.challenges[0];
            break;
          }
        }
        if (targetChallenge) break;
      }
      
      expect(targetChallenge).toBeTruthy();
      
      // Edit challenge title
      component.startEditChallenge(targetChallenge!);
      targetChallenge!.editTitle = 'Updated challenge title';
      component.saveChallenge(targetIdeal!, targetChallenge!);
      
      // Export patch
      const patches = component['buildPatchPayload']();
      
      // Assert patch includes challenge edit
      const challengePatch = patches.find(p => 
        p.id === targetChallenge!.id && 
        p.kind === 'challenge' && 
        p.field === 'title'
      );
      
      expect(challengePatch).toBeTruthy();
      expect(challengePatch.value).toBe('Updated challenge title');
    });

Minimal GREEN change targets:

File 1: admin-content-explorer.component.ts
- Lines 45-49: Extend DraftEntry to include challengeTitle/challengeBody fields
- Lines 58-63: Extend FieldPatchOperation type to accept kind: 'challenge' and field: 'title' | 'body'
- Lines 498-503: Update draftChanges storage to track challenge edits (keyed by challenge.id)
- Lines 1026-1038: Update saveChallenge to persist to draftChanges[challenge.id]
- Lines 1071-1140: Update buildPatchPayload to iterate over position.challenges[] and emit challenge patches when draftChanges[challenge.id] exists

File 2: No backend script changes in S1B step (accept RED backend until separate prompt)

Scope constraint: ONLY challenge title/body text editing in S1B. Defer triggerRule editing, challenge reorder, and challenge setHidden to future prompts. Defer apply-admin-patch-helper.js changes to separate backend prompt after frontend patch export proven working.

## Gap Analysis

Current state:
- ✅ Admin UI renders nested challenges (13 items in production)
- ✅ Read mode displays challenge title + body
- ✅ Edit mode provides input fields + save/cancel buttons
- ✅ Edit handlers update local ChallengeNode state
- ❌ saveChallenge does NOT persist to draft storage
- ❌ buildPatchPayload does NOT emit challenge patches
- ❌ PatchOperation type union does NOT include 'challenge' kind
- ❌ DraftEntry interface does NOT track challenge edits
- ❌ apply-admin-patch-helper.js does NOT handle challenge operations
- ❌ triggerRule metadata NOT preserved in ChallengeNode interface

Immediate blockers for challenge editing:
1. Frontend patch export (buildPatchPayload ignores challenges)
2. Backend patch apply (script only handles category/position ops)
3. Draft persistence (saveChallenge only updates local state, never writes to localStorage)

Recommended implementation sequence:
1. S1B: Frontend patch export (extend PatchOperation types, buildPatchPayload logic, draft persistence)
2. S1C: Backend patch apply (extend apply-admin-patch-helper.js to handle challenge text edits)
3. S2A: Challenge reorder UI + patch export (move-up/down buttons, reorder patch op)
4. S2B: Challenge setHidden UI + patch export (hide/unhide toggle, setHidden patch op)
5. S3A: triggerRule editing UI (parentAnswerMin/Max fields, patch export)
6. S3B: triggerRule patch apply (backend script support for triggerRule updates)

## Files Touched (Discovery Only)

No files modified. Discovery involved read-only inspection of:
- src/assets/content/rawls-values.generated.json (production artifact)
- src/app/features/admin/admin-content-explorer.component.ts (UI + logic)
- src/app/features/admin/admin-content-explorer.component.spec.ts (shape proof test)
- src/app/core/content/types.ts (Challenge interface definition)
- scripts/admin/apply-admin-patch-helper.js (backend patch apply script)
- docs/project/CONTENT-RULES.md (schema documentation)
- docs/handoffs/handoff-2025-12-23-challenge-settled.md (historical context)
