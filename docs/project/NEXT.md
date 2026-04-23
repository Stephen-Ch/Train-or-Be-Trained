# NEXT — Active Story

**ACTIVE STORY ID:** TBTT-VALIDATION-MIXED-PROFILES-001

**NEXT STEP:** Implement a local Node script that defines the 6 exact mixed profiles and generates docs/project/MIXED-PROFILE-OUTPUTS.md plus docs/project/mixed-profile-manifest.json from existing Working With Me content.

**DoD:** scripts/generate-mixed-profile-outputs.js exists, docs/project/mixed-profile-manifest.json records the exact 6 profile settings, docs/project/MIXED-PROFILE-OUTPUTS.md contains all 6 generated Working With Me outputs plus the 4 standard prompts and blank review rubric, and required gates pass.

**Scope Guardrails**
- In scope: one new script under scripts/, one new manifest under docs/project/, one new generated output file under docs/project/, and NEXT.md freshness repair.
- Exclusions: no edits to src/, no scoring-engine changes, no content wording changes, and no dependency updates; only scripts/generate-mixed-profile-outputs.js plus docs/project output artifacts are touched.

**Done When**
- scripts/generate-mixed-profile-outputs.js exists and runs with no errors.
- docs/project/mixed-profile-manifest.json contains all six profiles with exact control settings.
- docs/project/MIXED-PROFILE-OUTPUTS.md contains all 6 labeled Working With Me outputs, the 4 standard prompts, and the blank rubric table.
- All unit tests pass (Green Gate).
- Commit is made with all three new files.

**Last Updated:** 2026-04-20
