# NEXT — Active Story

**ACTIVE STORY ID:** TBTT-VALIDATION-MIXED-PROFILES-001

**NEXT STEP:** Define 6 mixed profiles, 4 test prompts, and one pass/fail rubric for coherent vs stitched together.

**DoD:** docs/project/MIXED-PROFILE-TEST-PLAN.md exists with six profile definitions, four test prompts, and a completed coherence evaluation for each profile, ending in an explicit beta gate decision.

**Scope Guardrails**
- In scope: mixed-profile validation setup and docs-only beta gate criteria in control-deck files.
- Out of scope: app behavior changes, scoring logic redesign, question-set expansion, and non-validation roadmap work.

**Done When**
- Six mixed profiles are defined to stress realistic A/B/C collisions.
- The same four prompts are fixed and reused across all six profiles.
- Each output is judged only as coherent or stitched together using one rubric.
- If outputs are coherent, beta is marked GO immediately.
- If contradictions appear, phrasing is adjusted and one additional pass is completed.

**Last Updated:** 2026-04-20
