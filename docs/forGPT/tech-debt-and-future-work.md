# Tech Debt & Future Work — Working With Me

## Purpose
Track known issues, incomplete features, and planned improvements.

---

## Now (Top 5 Next Items)

1. **FW-ADMIN-002C**: Admin reordering for categories (drag-drop or move-up/move-down)
2. **FW-RESULTS-001**: Restore rich persona system (14 profiles, radar chart)
3. **FW-RAWLS-004**: PWA polish (icons, offline caching)
4. **TD-RAWLS-012**: Adaptive challenges uncertainty detection (neutral answer pattern)
5. **TD-RAWLS-008**: Terminology rename (Ideals/Positions/Challenges)

---

## Parked Work

### Share Functionality (FW-RAWLS-003)

**Status**: PAUSED after FW-RAWLS-003-S1B unit test coverage (2026-01-02)

**What's locked**: Share Results button click correctly calls ShareCardService.shareOrDownloadCard('persona-panel', slug) where slug = personaMatch()?.persona.id or 'unknown'; unit test added in result.component.spec.ts (lines 172-195) proving correct wiring; prevents accidental breakage during future refactors.

**What's deferred** (revisit during polish sprint when e2e infrastructure mature):
1. **E2E/integration test for actual html2canvas DOM capture**: Current unit test uses spy, doesn't validate that html2canvas actually renders persona-panel at 1200×630 dimensions as PNG blob; e2e test would exercise full capture flow end-to-end
2. **User-facing error messaging when share/download fails**: Currently errors logged to console only (result.component.ts line 150: `console.error('Share failed:', e)`); users see no feedback if share/download fails; need graceful error UI (toast/banner) with actionable guidance
3. **HTML2canvas ESM warning resolution (TD-RAWLS-016)**: Build warning "Module 'html2canvas' used by 'src/app/shared/share/share-card.service.ts' is not ESM" suggests optimization bailout; investigate ESM-compatible alternatives or fork with tree-shaking support

**Rationale for PARK**: Share functionality already works (users can share/download persona match result); unit test locks wiring behavior preventing regressions; deeper work (e2e capture validation, error UX, library optimization) has diminishing returns for current scope - belongs in dedicated polish sprint after core flows stabilize.

---

## Tech Debt

### Content / Pipeline

| ID | Description | Severity | Date Added |
|----|-------------|----------|------------|
| TD-RAWLS-009 | Test fixtures must match production content format — Guard test used `A1-f1` fixtures while real content uses `liberty-q0`. Add integration test with real content. | Medium | 2025-12-22 |
| TD-RAWLS-015 | Support open-response prompts (teacher writing mode) (v3/v4) — Current app supports Likert 1-5 scale only. Open-ended challenges (e.g., "Explain why...", "Describe...") were rewritten as declarative Likert statements. Future feature: add text input mode for teacher-focused writing assignments and reflective prompts. | Low | 2025-12-24 |

### Admin

| ID | Description | Severity | Date Added |
|----|-------------|----------|------------|
| TD-RAWLS-010 | AdminContentExplorerComponent test flakiness — Test "should render followUps as editable positions from real production content" intermittently fails. Likely timing/async issue with production content loading. | Low | 2025-12-23 |
| TD-RAWLS-014 | Admin: persist Challenge edits (nested challenges) through patch + apply pipeline — **RESOLVED** by FW-ADMIN-002D (2025-12-30): Admin UI now supports editing nested challenge triggerRule metadata (parentAnswerMin/Max/tags); edits persist to draft storage, export as challenge patches, and apply to source content via `apply-admin-patch-helper.js`. Helper extended with challengeById map, deep cloning for deeperDives arrays, and challenge handler. Tests: 6 helper tests pass (4 category reorder + 2 challenge triggerRule apply), admin spec has triggerRule editing + export coverage. Admin now supports nested challenge triggerRule editing end-to-end. Title/body field editing for challenges remains unimplemented (low priority; content authors edit source JSON directly). | Low | 2025-12-24 |

### Runtime UX

| ID | Description | Severity | Date Added |
|----|-------------|----------|------------|
| TD-RAWLS-004 | Review component shows all answers — May need filtering/grouping by category. | Low | 2025-12-21 |
| TD-RAWLS-005 | Share card service stubbed — `share-card.service.ts` exists but social sharing not wired. | Medium | 2025-12-21 |
| TD-RAWLS-006 | PWA manifest incomplete — Icons and offline caching need polish. | Low | 2025-12-21 |
| TD-RAWLS-016 | Replace document.write usage in share/export path (share-card.service.ts warning) | Low | 2025-12-25 |

### Tests / Infrastructure

| ID | Description | Severity | Date Added |
|----|-------------|----------|------------|
| FW-RAWLS-001 | Complete Playwright e2e setup | High | 2025-12-21 |

### Protocol / Workflow

| ID | Description | Severity | Date Added |
|----|-------------|----------|------------|
| TD-PROTOCOL-V7-003 | Coverage Checklist rule: inherited shared-constant changes count as UPDATED — Cross-cutting change prompts (palette CSS, voice/tone, layout grids, CTA buttons, UI copy dictionaries) require route coverage proof. When shared constants change (e.g., qv2-tutor-copy.json), all consumers implicitly receive the update even if route component files aren't directly touched. Current protocol requires reporting UPDATED or NO CHANGE REQUIRED per route, but doesn't clarify inherited changes. Proposed rule: routes consuming modified shared constants must be reported as "UPDATED (inherited: <shared constant>)" to ensure coverage verification captures transitive updates. | Low | 2026-01-03 |
| TD-PROTOCOL-V7-004 | ~~Verification-mode doc: define read-only audit prompts + boundaries~~ **RESOLVED** (2026-01-03, verification-mode.md) — Postmortem 2026-01-03 identified missing verification-mode protocol for doc-verification-only prompts. Need explicit doc defining: (1) allowed commands (read_file, grep_search, git log), (2) forbidden actions (no edits, no npm, no new files), (3) exit criteria (report accuracy + line numbers only), (4) STOP boundaries (if discrepancies found, propose correction prompt separately). Prevents verification prompts from drifting into "fix while verifying" scope creep. Implemented via docs/vibe-coding/protocol/verification-mode.md + protocol-v7.md Core Rule #9. | Low | 2026-01-03 |
| TD-PROTOCOL-V7-005 | Story: OC-PROTOCOL-V7 — Standardize per-project Control Deck docs in docs/project/ (VISION/EPICS/NEXT) and enforce Start-of-Session Vision Check — Vision & User Story Gate (protocol-v7.md) requires docs/project/NEXT.md as canonical active plan, but not all vibe-coding projects have VISION/EPICS/NEXT structure yet. Need to: (1) standardize Control Deck docs across all projects using templates (VISION.template.md, EPICS.template.md, NEXT.template.md), (2) enforce Start-of-Session Vision Check in all projects (read VISION/EPICS/NEXT, output Active Story ID/Next Step/DoD), (3) document migration guide for existing projects without Control Deck, (4) add verification prompt to audit Control Deck compliance per project. Prevents story drift by ensuring every project has explicit VISION/EPICS/NEXT before coding work. | Low | 2026-01-04 |
| TD-PROTOCOL-V7-006 | Story: OC-PROTOCOL-V7 — Define TECH-DEBT story requirement and documentation convention ('Story: <ID> — …') + examples — Vision & User Story Gate now requires all TECH-DEBT rows include Story ID, but existing tech-debt rows lack Story IDs and convention isn't documented with examples. Need to: (1) update all existing TECH-DEBT rows to include "Story: <ID> — …" prefix (backfill Story IDs based on context or use "Story: MAINTENANCE — …" for orphaned items), (2) add tech-debt-conventions.md explaining Story ID requirement + formats (feature stories "Story: EPIC-001-S02 — …" vs maintenance "Story: MAINTENANCE — …" vs protocol "Story: OC-PROTOCOL-V7 — …"), (3) provide 5 examples showing correct Story ID usage in tech-debt descriptions. Prevents orphaned tech-debt by tying every tech-debt item to originating story or maintenance category. | Low | 2026-01-04 |

### Performance

| ID | Description | Severity | Date Added |
|----|-------------|----------|------------|
| PERF-001 | Bundle budget overage + html2canvas CommonJS warning — main bundle exceeds recommended limit (431KB); html2canvas dependency triggers CommonJS warning. Consider lazy-loading or lighter alternatives. | Low | 2025-12-23 |

---

## Future Work by Sprint

### V1.3

- **FW-ADMIN-002C**: Category reordering in admin UI
- **TD-RAWLS-011**: Adaptive challenges MVP (rule-based)
- **FW-RESULTS-001**: Rich persona system restoration

### V1.4

- **FW-RAWLS-003**: Social sharing integration
- **FW-RAWLS-004**: PWA polish (icons, offline)
- **TD-RAWLS-008**: Terminology rename (Ideals/Positions/Challenges)

### V1.5

- **FW-EXPLORE-001**: Advanced adaptive follow-ups (score/vector-based)
- **FW-EXPLORE-002**: Alternative content sets support
- **FW-DOCS-001**: Shared docs versioning system

---

## Blocked / Deferred

### TD-RAWLS-001: Playwright e2e hangs (DEFERRED POST-V1)

**Status**: V1 shipped without e2e; unit tests (192 pass) + manual smoke provide coverage.

**Evidence** (2025-12-22):
- Repro in fresh minimal npm project outside repo: `page.setContent`/`evaluate`/`goto` all hang after `newPage()` (all engines)
- Defender exclusions did not change outcome
- Version regression (1.56.1 vs 1.57.0) no change
- Filter drivers appear stock Windows; no third-party filters
- System blockers: HVCI=1 and VBS=1 active (potential culprit)
- Attempted WSL2 Ubuntu path but abandoned due to terminal input/paste friction

**Next decisive experiment** (post-V1):
- Toggle Memory Integrity (HVCI) OFF → reboot → rerun 10-second `setContent` canary
- If canary flips to OK only when HVCI is OFF, treat HVCI/VBS as causal

**Severity**: Medium  
**Date Added**: 2025-12-21

---

## Adaptive Challenges (concept + MVP path)

### Definition

**Adaptive challenges** = dynamically selecting which deeper-dive questions to present based on user's prior answers, instead of showing all challenges in fixed order. Goal: surface the most relevant follow-up questions for each user's unique answer pattern.

### Three Modes

1. **Fixed order (current)**: All challenges shown in order 0,1,2,3,4 regardless of answers
2. **Rule-based adaptivity**: Show/skip challenges based on answer thresholds (e.g., if answer >= 4 on parent position, show challenge A; if answer <= 2, show challenge B)
3. **Model/score-based adaptivity**: Select challenges based on persona vector inconsistency or uncertainty signals (e.g., high variance across dimensions, conflicting scores)

### MVP Recommendation (Rule-Based)

**Metadata needed on Challenge:**
- `triggerRule` (optional): JSON object with conditions
  - `parentAnswerMin`: number (1-5) — only show if parent position answer >= this value
  - `parentAnswerMax`: number (1-5) — only show if parent position answer <= this value
  - `tags`: string[] — semantic tags like "extreme", "moderate", "uncertain"

**Source JSON location:**
- Add `triggerRule` property to each deeperDives item in content/categories/*.json
- Example:

    {
      "id": "liberty-q0-fu1",
      "title": "Should deliberate lies be protected?",
      "body": "Explain why or why not...",
      "order": 1,
      "triggerRule": {
        "parentAnswerMin": 4,
        "tags": ["pro-liberty"]
      }
    }

**Minimal runtime change:**
- In challenge display logic (future component), filter challenges array:
  - Check if challenge has `triggerRule`
  - If yes, evaluate parent answer against `parentAnswerMin`/`parentAnswerMax`
  - If rule fails, skip challenge
  - If no rule, always show (backward compatible)

**Contract test:**
- Add test in content.integrity.spec.ts validating triggerRule schema when present
- Ensure parentAnswerMin/Max are 1-5, tags are string array

### Backlog Items

**TD-RAWLS-011: Adaptive challenges rule-based MVP**
- User story: As a player, I see follow-up challenges that match my answer intensity (strong vs weak positions) so I engage with relevant deeper questions
- Scope: Add triggerRule metadata, extend validator, implement filter logic in challenge display component
- Acceptance: Challenges with parentAnswerMin=4 only show when parent answer is 4-5; challenges without rules always show

**TD-RAWLS-012: Adaptive challenges uncertainty detection**
- User story: As a player, when I answer "Neutral" frequently, I see challenges exploring ambivalence so I can clarify my reasoning
- Scope: Add "uncertainty" tag, detect neutral answer pattern (answer==2), surface uncertainty-tagged challenges
- Acceptance: After 3+ neutral answers, uncertainty challenges appear alongside standard challenges

**TD-RAWLS-013: Adaptive challenges persona-based selection**
- User story: As a player completing review, I see challenges addressing my persona inconsistencies so I can refine my profile
- Scope: Calculate vector variance by dimension, select challenges tagged for high-variance dimensions
- Acceptance: Player with high liberty + low equality variance sees challenges tagged "liberty-equality-tension"

---

## Completed (recent)

✅ **TD-RAWLS-011** (2025-12-29): Adaptive challenges MVP (rule-based triggerRule schema) — Shipped triggerRule metadata support end-to-end: schema validation (content-integrity-validator), runtime filtering (ideal-sequencer buildIdealBlock with shouldIncludeChallenge helper), QuestionV2 test alignment (triggerRule-aware required-set computation), Review filtered challenge counts (evaluates parentAnswerMin/Max against positionAnswers). Commits: 6ef96ff (sequencer), 804ffa9 (validator), dc23885 (review), 96a67a3 (pilot content), 53fa943 (Likert range 1-5 alignment), a477a33 (QuestionV2 spec fix). Next: add production challenge content to trigger adaptive behavior.

✅ **TD-RAWLS-008** (2025-12-23): Rename user-facing language to "Ideals → Positions → Challenges" — Terminology updated in UI copy and documentation.

✅ **TD-RAWLS-003** (2025-12-23): `?debugIds=1` implementation — Added ID overlays for categories, questions, and follow-ups for debugging.

✅ **FW-ADMIN-002B** (2025-12-23): Admin hide/unhide positions — Added toggle UI controls, draft persistence, export patch support. Users can now hide specific positions from gameplay.

✅ **TD-RAWLS-009B** (2025-12-23): Contract test for hidden position exclusion — Added deterministic test proving hidden positions filtered from runtime categories.

✅ **TD-RAWLS-007C** (2025-12-23): Pilot challenges expanded to 5 items — liberty-q0 now has 5 challenges (hate speech, lies, political lies, misinformation, personal boundary). Measurement verified.

✅ **TD-RAWLS-007B** (2025-12-23): First challenge pilot content — Added liberty-q0-fu0 "Should hate speech be protected as free expression?" Artifact generated with challenges property.

✅ **TD-RAWLS-007A1** (2025-12-23): Challenges contract fix — Enforced "omit property when empty, present when non-empty" contract. Updated exporter, validator, tests.

✅ **TD-RAWLS-007A** (2025-12-23): Challenges pipeline enablement — Extended export transformation, added Challenge interface, implemented validation logic, integrated admin UI mapping.

✅ **FW-ADMIN-002A** (2025-12-23): Admin position reorder feature — Implemented UI controls, draft persistence, export patches, CLI apply logic for reorder operations.

✅ **FW-DOCS-001** (2025-12-23): Protocol v7 + copilot instructions v7 — Established proof-of-read, prompt review gate, green gate requirements.

✅ **TD-RAWLS-002** (2025-12-22): Multi-category flow fixed — Root cause: followupsGuard regex expected A1-f1 format but content uses liberty-q0. Fixed in commit f30eac9.

✅ **FW-RAWLS-002** (2025-12-22): Multi-category flow hardening — TD-RAWLS-002 resolution provided fix.

---

*Last updated: 2025-12-23 — Refreshed structure, moved completed items, added adaptive challenges concept*
