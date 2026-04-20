# Handoff — 2026-01-05: Protocol v7 Consistency Pass Complete

## Session Summary

Completed OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS: Protocol v7 is now fully objective, non-contradictory, and migration-ready. All 12 assessment gaps resolved + 5 reassessment friction points addressed. Final protocol state includes Prompt Classes (FORMAL vs CONVERSATIONAL) enabling frictionless read-only discussions while maintaining execution rigor.

## Current Repository State

**Branch:** main  
**Status:** clean, synced with origin/main  
**Latest commit:** c8e6894 "Docs: define prompt classes + clarify remaining protocol gotchas"  
**Tests:** 263 SUCCESS (1 skipped)  
**Build:** 578.92 kB GREEN  
**Warnings:** BOTH PRE-EXISTING (bundle budget +78.92 kB, html2canvas ESM)

## Work Completed This Session

### Phase 1-4: Initial Consistency Work (S1E-S1H)

**S1E: Date Validation** (e5ce2f3)
- Added YYYY-MM-DD regex validation to required-artifacts.md
- 3-tier validation: format regex + basic ranges + optional strict parse

**S1F: Placeholder Detection** (d628ae6)
- Hardened grep patterns with 10 canonical markers
- Safe escaping for `<fill>` in grep -iE command

**S1G: 3-Party Gate Canonicalization** (315255b)
- Designated alignment-mode.md as canonical source
- Arrow notation (→ 3-Party Approval Gate (Canonical)) in all references

**S1H: NEXT Freshness Rule** (a663962)
- Added staleness detection: `git diff --name-only HEAD~1..HEAD`
- Prevents working on stale stories after completion

### Phase 5: Comprehensive Protocol Assessment

Analyzed 7 protocol files (~1150 lines total) identifying 12 gaps:
- 2 HIGH priority (gate format contradiction, Command Lock ambiguity)
- 3 MEDIUM priority (cross-cutting vagueness, hot file drift, PROMPT-ID blocks conversational)
- 7 LOW priority (quote length, rerun edge case, etc.)

Created protocol-assessment-2026-01-05.md documenting all gaps.

### Phase 6: S1G Consistency Sweep (9e754e1)

Fixed 8 of 12 assessment gaps via multi_replace_string_in_file:
1. Gate line count: 3→4 lines
2. Command Lock: removed "YES/NO" from gate output, clarified as enforcement rule
3. Cross-cutting: added objective definition (2+ routes OR 3+ components OR global CSS)
4. Hot file parity: copilot-instructions "Analysis-First" → "Two-Path Rule"
5. Proof-of-Read: added quote length spec (1-2 sentences, 10-50 words)
6. Rerun trigger: added edge case for initial commit (HEAD~1 missing)
7. Protocol maintenance: tightened scope to docs/vibe-coding/** + docs/protocol/**
8. Bundle warning: defined "pre-release" as vX.X.X-rc1+

Updated NEXT.md DoD item 1 checked, created solution-report + code-review entries.

### Phase 7: Post-Sweep Reassessment

Conducted comprehensive re-analysis (7 files ~1400 lines) verifying:
- All 8 sweep fixes successfully applied ✅
- Identified 5 remaining friction points:
  - 1 MEDIUM: PROMPT-ID rigidity blocks conversational workflow
  - 4 LOW: Command Lock vs reads ambiguity, protocol maintenance legacy trap, hot file detection portability, cross-cutting route counting precision

Created protocol-reassessment-post-sweep-2026-01-05.md documenting overall health assessment: **STRONG**.

### Phase 8: Prompt Classes + Gotcha Clarity (c8e6894, THIS SESSION)

Executed OC-PROTOCOL-V7-S1G-PROMPT-CLASSES-AND-GOTCHAS-CLARITY-001 addressing all 5 reassessment friction points:

**Task A: Prompt Classes**
- Added "## Prompt Classes (Request Types)" to protocol-v7.md + copilot-instructions-v7.md
- **FORMAL WORK PROMPT:** Requires PROMPT-ID, fenced block, END PROMPT marker. Allows terminal execution. Enforces all gates.
- **CONVERSATIONAL REQUEST:** No PROMPT-ID. Natural language. Read-only tools only (read_file, grep_search, semantic_search, file_search, list_dir). Must draft formal prompt if execution requested.
- Changed copilot-instructions PROMPT-ID requirement from "EVERY response" to "when executing FORMAL WORK PROMPT"
- **Impact:** Enables frictionless discussion ("reanalyze protocols", "write report") without weakening execution safety

**Task B: Command Lock Sequencing**
- Added clarification: "Command Lock forbids terminal execution/edits/searches before the 4-line Gate output. File reading (read_file tool) happens AFTER printing the Gate and BEFORE printing Proof-of-Read."
- Resolves ambiguity about read_file positioning

**Task C: Protocol Maintenance Scope**
- Tightened prompt-lifecycle.md definition to "docs/vibe-coding/protocol/** (canonical)"
- Legacy docs/protocol/** ONLY for deprecation notices/cross-reference updates
- Prevents legacy doc trap

**Task D: Hot File Detection**
- Added portable command: `git log --oneline --follow -3 -- <file>`
- Enables session-portable "last 3 prompts" detection

**Task E: Cross-Cutting Route Counting**
- Clarified: "count distinct route definitions in app.routes.ts; parameterized variants like q1/:id, q2/:id count separately if separate route configs"
- Eliminates route counting ambiguity

**Task F: 3-Party Gate Canonical**
- Verified already complete from S1G-3PARTY-GATE-CANONICALIZE-001
- No further changes needed

**Task G: Status + Plan Hygiene**
- Updated solution-report.md (Tasks A-F entry)
- Updated code-review.md (decision row documenting friction reduction strategy)
- Checked NEXT.md DoD items 2-3 (Doc Audit sequencing, rerun-trigger)
- **All 8 DoD items now checked** ✅

### Phase 9: Migration Instructions (THIS SESSION)

Created docs/vibe-coding/MIGRATION-INSTRUCTIONS.md documenting:
- 6-phase migration checklist (copy bundle → assess → customize → Control Deck → enforcer → Doc Audit)
- **Project Assessment Diagnostic Prompt** (VIBE-CODING-V7-PROJECT-ASSESSMENT-001) to identify customization needs before migration
- Assessment report template with line-specific customization checklist
- Key Invariants (never change: gates, sequencing, thresholds) vs Tunables (customize: hot files, routes, tech stack)
- Common migration pitfalls

## Protocol v7.1.0 Final State

### Core Bundle (Project-Agnostic)

```
docs/vibe-coding/protocol/
├── protocol-v7.md                    # Core rules (9 core rules + gates)
├── copilot-instructions-v7.md        # Copilot-specific protocol
├── required-artifacts.md             # Doc Audit rules
├── alignment-mode.md                 # Alignment Mode workflow (3-Party Gate canonical)
├── verification-mode.md              # Verification Mode (read-only audits)
├── prompt-lifecycle.md               # State definitions (READY/IN-PROGRESS/COMPLETE/MERGED/OBSOLETE)
├── stay-on-track.md                  # Cross-cutting coverage rules
├── working-agreement-v1.md           # 3-party sequencing rules
├── merge-prompt-template.md          # Merge/rollback template
└── templates/                        # Control Deck templates
    ├── VISION.template.md
    ├── EPICS.template.md
    └── NEXT.template.md

docs/Start-Here-For-AI.md             # Session bootstrap
docs/vibe-coding/VIBE-CODING.VERSION.md   # Version tracking (v7.1.0)
docs/vibe-coding/MIGRATION-INSTRUCTIONS.md # Migration guide + assessment prompt
.github/copilot-instructions.md       # Enforcer
```

### Core Rules (9 Non-Negotiable)

1. **Prompt Review Gate + Command Lock** (4 lines: What / Best next step / Confidence / Work state)
2. **Proof-of-Read** (file + quote 1-2 sentences 10-50 words + "Applying: rule")
3. **Single-Block Prompts** (fenced markdown, PROMPT-ID → GOAL → SCOPE → TASKS → END PROMPT)
4. **Green Gate** (tests + build before commit)
5. **Stop on Error** (non-zero exit → STOP)
6. **Measure Production First** (verify ground truth before changes)
7. **Terminology Lock** (product language vs implementation, no renaming debates)
8. **Guard Rejection Visibility** (preserve user language on reject)
9. **Verification Mode** (read-only audits, separate from fixes)

### Gates

- **Prompt Review Gate** (4 lines mandatory first output)
- **Vision & User Story Gate** (Story ID + NEXT STEP citation, exception: protocol maintenance)
- **Proof-of-Read** (required files + quotes)
- **Population Gate** (word-count thresholds, placeholder scan, verified in Doc Audit)
- **3-Party Approval Gate** (canonical in alignment-mode.md: Stephen + ChatGPT + Copilot)
- **Copy & Semantics Gate** (section map + hierarchy + copy source for UX changes)

### Prompt Classes (NEW)

**FORMAL WORK PROMPT** (execution class):
- Required for: terminal commands, file edits, tests, builds, commits, merges
- Format: fenced block with `PROMPT-ID: [ID]`, `GOAL:`, `SCOPE:`, `TASKS:`, `# END PROMPT`
- Enforcement: MUST include Story ID + NEXT STEP citation (exception: protocol maintenance scoped to docs/vibe-coding/protocol/** may omit if GOAL labeled "protocol maintenance")
- All gates apply

**CONVERSATIONAL REQUEST** (discussion class):
- Allowed for: analysis, planning, critique, recommendations, verification, discussion
- Format: natural language (no PROMPT-ID required)
- Tools allowed: read_file, grep_search, semantic_search, file_search, list_dir (read-only)
- Restrictions: MUST NOT run terminal commands, edit files, or claim Green Gate results
- If execution requested during conversation → draft FORMAL WORK PROMPT with all required gates

**Impact:** Enables friction-free conversational workflow ("what gaps remain?", "write assessment report") while maintaining rigorous enforcement for execution tasks.

### State Definitions (prompt-lifecycle.md)

- **READY:** Not started, prompt block complete, all dependencies met, Story ID verified
- **IN-PROGRESS:** Work started, tests/edits made, must complete before new prompt
- **COMPLETE:** Green Gate PASS, commit pushed, work done but closeout pending
- **MERGED:** Merged to main via ff-only (or main branch completed), story closed
- **OBSOLETE:** Superseded/abandoned, STOP immediately

## Key Protocol Files (Required Reading)

### Start-of-Session (MANDATORY)

1. **docs/Start-Here-For-AI.md** — Session bootstrap, sequencing, Doc Audit triggers
2. **docs/vibe-coding/protocol/protocol-v7.md** — Core rules, gates, enforcement
3. **docs/vibe-coding/protocol/copilot-instructions-v7.md** — Copilot-specific context (hot files, routes, tech stack)

### Work Modes

4. **docs/vibe-coding/protocol/alignment-mode.md** — When to enter (NEXT unclear, placeholders, 3-Party Gate)
5. **docs/vibe-coding/protocol/verification-mode.md** — Read-only audits (no fixes in same prompt)

### Workflow

6. **docs/vibe-coding/protocol/prompt-lifecycle.md** — State definitions, STOP rules
7. **docs/vibe-coding/protocol/required-artifacts.md** — Control Deck requirements (VISION/EPICS/NEXT)
8. **docs/vibe-coding/protocol/merge-prompt-template.md** — Canonical merge workflow

### Cross-Cutting

9. **docs/vibe-coding/protocol/stay-on-track.md** — Route coverage rules

## Open Tech Debt

### Protocol / Workflow

**TD-PROTOCOL-V7-003** (Low, 2026-01-03, OPEN):
- Coverage Checklist rule for inherited shared-constant changes
- When shared constants change (e.g., qv2-tutor-copy.json), routes consuming them should report "UPDATED (inherited: <constant>)"
- Clarifies transitive updates in route coverage verification

**All 12 Protocol Assessment Gaps** (2026-01-05, RESOLVED):
- S1A-S1H: Date validation, placeholder grep, 3-party gate canonical, NEXT freshness (4 commits)
- S1G sweep: Gate format, Command Lock, cross-cutting, hot file, quote length, rerun edge, protocol maintenance, bundle warning (1 commit)
- Prompt classes + gotchas: FORMAL vs CONVERSATIONAL, Command Lock sequencing, protocol maintenance scope, hot file detection, route counting (1 commit)

### Tests / Infrastructure

**FW-RAWLS-001** (High, 2025-12-21, OPEN):
- Complete Playwright e2e setup

### Performance

**PERF-001** (Low, 2025-12-23, OPEN):
- Bundle budget overage (578.92 kB exceeds 500 kB budget by 78.92 kB)
- html2canvas CommonJS warning
- Consider lazy-loading or lighter alternatives

## Production State (Ground Truth)

### Content Structure (PROVEN via shape proof test)

**28 Positions, 0 Flat Challenges, 13 Nested Challenges** (v2 structure):
- Categories: 7 (community, equality, fairness, liberty, prosperity, security, sustainability)
- Positions (followUps[]): 28 total across categories
- Position ID pattern: `{categoryId}-q{N}` (e.g., liberty-q0)
- Challenges: 13 nested under followUps[].challenges[] (v2 schema)
- Challenge ID pattern: `{positionId}-challenge-{N}` (e.g., liberty-q0-challenge-0)
- Source: content/categories/*.json → scripts/content-build.js → src/assets/content/rawls-values.generated.json

**Admin Content Explorer State:**
- Ideal editing: ✅ Enabled
- Position editing: ✅ Enabled
- Challenge editing: ❌ REMOVED (no flat challenges in production)

### Terminology Mapping

| Product Language | Storage Implementation | Notes |
|------------------|------------------------|-------|
| Ideal | `categories[].idealId` | Top-level values (liberty, equality, etc.) |
| Position | `categories[].followUps[]` | Questions presented after selecting ideal |
| Challenge (Deeper Dive) | `followUps[].challenges[]` | Follow-up dilemmas nested under positions (v2 schema) |

## DO / DON'T Quick Reference

### DO ✅

- **DO** start every session reading Start-Here-For-AI.md → protocol-v7.md → copilot-instructions-v7.md
- **DO** run Start-of-Session Doc Audit after Prompt Review Gate + Proof-of-Read (first prompt only)
- **DO** print 4-line Prompt Review Gate BEFORE any commands/reads/searches (Command Lock)
- **DO** use CONVERSATIONAL REQUEST for read-only analysis/discussion (no PROMPT-ID needed)
- **DO** draft FORMAL WORK PROMPT (with PROMPT-ID + gates) before terminal execution/edits
- **DO** verify ground truth via Measure Production First before any content/schema changes
- **DO** run Green Gate (tests + build) before every commit
- **DO** check NEXT.md freshness after completing NEXT STEP (must update in same session/commit or run closeout)
- **DO** enter Alignment Mode if VISION/EPICS/NEXT unclear or contain placeholders
- **DO** use Verification Mode for read-only audits (separate fix prompt if discrepancy found)

### DON'T ❌

- **DON'T** run terminal commands, edits, or searches before printing Prompt Review Gate (violates Command Lock)
- **DON'T** require PROMPT-ID for conversational requests (analysis/planning/discussion)
- **DON'T** execute terminal commands or edit files in CONVERSATIONAL REQUEST (read-only tools only)
- **DON'T** skip Story ID + NEXT STEP citation in FORMAL WORK PROMPT (exception: protocol maintenance)
- **DON'T** assume production state — measure first using shape proof test or git grep
- **DON'T** rename terminology (Ideal/Position/Challenge mapping is locked)
- **DON'T** work on stale NEXT STEP (check `git diff --name-only HEAD~1..HEAD` for NEXT.md after completion)
- **DON'T** mix verification + fixes in same prompt (Verification Mode is read-only)
- **DON'T** commit without Green Gate PASS (tests + build)
- **DON'T** edit protocol files outside docs/vibe-coding/protocol/** for substantial changes (legacy docs/protocol/** deprecated except for cross-references)

## Migration Readiness

Protocol v7.1.0 is **migration-ready** for other projects:

**Run Assessment Prompt First:**
```markdown
PROMPT-ID: VIBE-CODING-V7-PROJECT-ASSESSMENT-001
GOAL: Diagnose project-specific context needed for vibe-coding v7 migration
...
# END PROMPT
```

See [MIGRATION-INSTRUCTIONS.md](../vibe-coding/MIGRATION-INSTRUCTIONS.md) for:
- 6-phase migration checklist
- Assessment prompt (identifies hot files, routes, tech stack, Control Deck status)
- Customization guide (which lines to update in which files)
- Key Invariants vs Tunables

**Key Invariants (Never Change):**
- Gate formats (Prompt Review 4 lines, Vision & Story, Proof-of-Read)
- Population thresholds (25/10/6 word counts)
- Sequencing rules (Command Lock, Doc Audit order)
- Prompt Classes (FORMAL vs CONVERSATIONAL)
- State definitions (READY/IN-PROGRESS/COMPLETE/MERGED/OBSOLETE)

**Project-Specific Tunables:**
- Hot files list (copilot-instructions-v7.md)
- Route coverage table structure (protocol-v7.md, copilot-instructions-v7.md)
- Tech stack context (copilot-instructions-v7.md)
- Control Deck content (VISION/EPICS/NEXT)

## Next Session Starting Points

### If Continuing Protocol Work

**OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS story:** ✅ COMPLETE (all 8 DoD items checked)
- Mark story COMPLETE in NEXT.md
- Advance to next story per NEXT STEP
- Potential next story: TD-PROTOCOL-V7-003 (inherited shared-constant coverage rule)

### If Continuing Feature Work

**Current ACTIVE STORY:** Check docs/project/NEXT.md for latest
- Verify NEXT.md freshness: `git diff --name-only HEAD~1..HEAD` (should include NEXT.md if last story completed)
- If NEXT.md stale → run closeout prompt before new work
- If NEXT.md current → proceed with ACTIVE NEXT STEP

### If Migrating to New Project

1. Run VIBE-CODING-V7-PROJECT-ASSESSMENT-001 diagnostic prompt
2. Review assessment report
3. Copy vibe-coding bundle per MIGRATION-INSTRUCTIONS.md
4. Customize per assessment checklist
5. Create/verify Control Deck (VISION/EPICS/NEXT)
6. Run initial Doc Audit

## Session Sequencing Reminder

Every session starts with:
1. **Prompt Review Gate** (4 lines) — printed BEFORE any commands/reads
2. **Proof-of-Read** (required files + quotes) — printed AFTER Prompt Review Gate
3. **Start-of-Session Doc Audit** (if first prompt) — run AFTER Proof-of-Read, BEFORE work

Every work prompt requires:
- **FORMAL WORK PROMPT** format (if execution needed): PROMPT-ID + GOAL + SCOPE + TASKS + END PROMPT
- **Vision & Story Gate** verification (Story ID + NEXT STEP citation)
- **Green Gate** before commit (tests + build PASS)

Conversational requests (analysis/discussion):
- **CONVERSATIONAL REQUEST** format: natural language, no PROMPT-ID
- **Read-only tools** only (read_file, grep_search, semantic_search, file_search, list_dir)
- **Draft FORMAL WORK PROMPT** if execution requested

## Critical Files to Never Touch Without Protocol Prompt

- docs/vibe-coding/protocol/** (requires protocol maintenance GOAL label)
- docs/Start-Here-For-AI.md (requires protocol maintenance GOAL label)
- .github/copilot-instructions.md (enforcer, only update on protocol changes)

## Recent Commits (Last 6)

1. **c8e6894** (2026-01-05, HEAD): "Docs: define prompt classes + clarify remaining protocol gotchas" — Tasks A-F
2. **9e754e1** (2026-01-05): "Docs: fix remaining protocol contradictions (S1G consistency sweep)" — 8 gaps
3. **a663962** (2026-01-05): "Docs: add NEXT freshness rule (S1H)" — staleness detection
4. **315255b** (2026-01-05): "Docs: canonicalize 3-party gate references (S1G)" — arrow notation
5. **d628ae6** (2026-01-05): "Docs: harden placeholder detection + grep examples (S1F)" — 10 markers
6. **e5ce2f3** (2026-01-05): "Docs: add date format validation rule (S1E)" — YYYY-MM-DD regex

---

**Last Updated:** 2026-01-05  
**Protocol Version:** v7.1.0  
**Status:** Protocol consistency pass COMPLETE, migration-ready, all DoD items checked  
**Next Steps:** Mark OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS COMPLETE, advance NEXT.md to next story
