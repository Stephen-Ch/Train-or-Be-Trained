# Kit Improvement Briefs

> **Date:** 2026-04-16 (Improvements 1–3), 2026-04-19 (Improvement 4)
> **Kit Version Assessed:** v7.3.2 (Improvements 1–3), v7.4.0 (Improvement 4)
> **Purpose:** Give GPT enough detail to compose precise, executable Copilot prompts for targeted improvements identified during assessment.
> **Scope:** DOCS and TOOLING. Improvements 1–3 are docs-only. Improvement 4 spans docs (4A) and tooling (4B).
> **Audience:** GPT (Planner/Prompt Writer) → generates FORMAL WORK PROMPTs → Copilot executes.

---

## HOW TO USE THESE BRIEFS

Each brief contains:
- **The problem** — exact file path, line reference, quoted current content
- **Proposed fix** — draft wording ready to refine into a FORMAL WORK PROMPT
- **Files to edit** — precise paths; no other files
- **Cross-references** — other locations that reference the same rule
- **Success criteria** — how Copilot verifies the change is correct
- **Scope guard** — what is explicitly out of scope

Each improvement is a **separate FORMAL WORK PROMPT**. Do not combine.

---

---

## IMPROVEMENT 1: Doc Audit Sequencing — Session-Level vs Prompt-Level Distinction

### The Problem

`protocol/protocol-v7.md` line 90 contains this paragraph:

> "Doc Audit is a session-level prerequisite that occurs AFTER Proof-of-Read, never before the Prompt Review Gate. Work prompts in a fresh session must run Doc Audit first as per the ordered sequence: Prompt Review Gate → Proof-of-Read → Doc Audit → (if PASS) proceed to work."

This is self-contradictory in one paragraph:
- Sentence 1: "occurs AFTER Proof-of-Read" → implies per-prompt, late in the sequence
- Sentence 2: "Work prompts in a fresh session must run Doc Audit first" → implies session-level, early

The confusion: **Doc Audit is a session-level gate** (runs once at session start via `session-start.ps1`), but the paragraph drops this distinction mid-sentence and reverts to describing per-prompt sequencing. A new agent reading this cannot tell whether Doc Audit fires once per session or once per prompt.

`session-start-checklist.md` line 11 is clear:
> "RUN START OF SESSION DOCS AUDIT — This single command chains: kit update (subtree pull) → kit version print → Consumer-Kit Drift Gate → forGPT sync → Consumer doc-audit (hard fail) → Staleness Expiry Gate → Decision-Queue Gate → Tool/Auth Fragility Gate → audit print."

The checklist treats Doc Audit as session-level correctly. The protocol paragraph does not.

---

### Proposed Fix

**In `protocol/protocol-v7.md`, replace the existing `Doc Audit Sequencing` paragraph (line 90) with a version that makes the session-level vs prompt-level distinction explicit:**

```markdown
**Doc Audit Sequencing:** Doc Audit is a **session-level gate**, not a per-prompt gate.

- **Session level (once per session):** Doc Audit runs at session start via `RUN START OF SESSION DOCS AUDIT` (which invokes `tools/session-start.ps1`). The wrapper chains: kit update → forGPT sync → Consumer-Kit Drift Gate → Staleness Expiry Gate → Decision-Queue Gate → Tool/Auth Fragility Gate → doc-audit Population Gate. Doc Audit MUST have returned PASS in this session before any coding work begins.
- **Per-prompt level:** Doc Audit does NOT re-run before each prompt. The Prompt Review Gate references the session-level Doc Audit result. If Doc Audit was not run this session or returned FAIL, STOP and run/remediate it first (see [Start-Here-For-AI.md](../../Start-Here-For-AI.md)).
- **Post-commit rerun trigger:** After each commit, run the rerun-trigger detection to determine if Doc Audit must be rerun (see [required-artifacts.md](../required-artifacts.md) "Doc Audit Rerun Detection" for the git command and path rule).

Ordered sequence within a session:
1. `RUN START OF SESSION DOCS AUDIT` (session-level, once)
2. First prompt: Prompt Review Gate → Proof-of-Read → work
3. After each commit: check rerun trigger → rerun if triggered
```

---

### Files to Edit

| File | Action |
|------|--------|
| `protocol/protocol-v7.md` | Replace the `Doc Audit Sequencing (Session Prerequisite)` paragraph at line 90 with the clearer version above |

### Cross-References to Update

None required — `session-start-checklist.md` already describes this correctly. No other files restate the sequencing rule.

### Success Criteria

- The replacement paragraph explicitly uses the words "session-level gate" and "not a per-prompt gate"
- The ordered sequence is written as a numbered list (1. session-start → 2. first prompt → 3. post-commit)
- The contradiction between "AFTER Proof-of-Read" and "run Doc Audit first" is resolved
- No existing behavior is changed — only the explanation is clarified
- `tools/doc-audit.ps1` passes (Population Gate: no TBD/TODO/PLACEHOLDER tokens introduced)

### Scope Guard

- Do NOT change how Doc Audit actually runs — only how the sequencing is described
- Do NOT touch `session-start-checklist.md` — it is already correct
- Do NOT touch `session-start.ps1` — tool behavior is correct

---

---

## IMPROVEMENT 2: STOP Conditions — Unified Reference Block

### The Problem

STOP conditions appear in at least five separate sections of `protocol/protocol-v7.md` with no unified index:

| Location | STOP Condition |
|----------|---------------|
| Line 23–26 (Prompt Review Gate) | `Best next step? NO` OR confidence below threshold OR Work state ≠ READY |
| Line 475 (Tiered Confidence Gate) | Below threshold → enter RESEARCH-ONLY mode |
| Line 146–151 (Focus Control / Drift Triggers) | Two prompts without Proof item, ≥20 min without progress, scope expands, user confusion |
| Line 189 (Mid-Session Reset) | `RUN MID-SESSION RESET` → STOP EDITS immediately |
| Help Ladder section | Unfamiliar file / line-precise edits needed without map → STOP and follow Help Ladder |

An operator who hits a STOP mid-session must know: *which STOP rule governs this situation?* Currently, they must already know which section of a 1,898-line document to consult. There is no cross-reference.

`protocol/hard-rules.md` could logically host this index — it is the `<2KB quick reference of non-negotiable rules` — but currently lists gates without grouping them under a unified STOP model.

---

### Proposed Fix

**Add a `## STOP Conditions — Quick Reference` section to `protocol/hard-rules.md`** immediately after the existing gate list:

```markdown
## STOP Conditions — Quick Reference

When a STOP is triggered, identify which condition applies and navigate to the canonical rule:

| Trigger | Condition | Canonical Rule |
|---------|-----------|---------------|
| Prompt Review Gate | `Best next step? NO` OR confidence below threshold OR Work state ≠ READY | [protocol-v7.md § Prompt Review Gate](protocol-v7.md#prompt-review-gate--command-lock-mandatory-first-output) |
| Confidence too low | Confidence <95% (docs) or <99% (runtime) | [protocol-v7.md § Tiered Confidence Gate](protocol-v7.md#no-guessing--tiered-confidence-gate-mandatory) |
| Drift detected | Two prompts without Proof item; ≥20 min without progress; scope expands; user confusion expressed | [protocol-v7.md § Focus Control](protocol-v7.md#focus-control) |
| Operator confusion mid-session | `RUN MID-SESSION RESET` trigger phrase | [protocol-v7.md § Mid-Session Reset](protocol-v7.md#mid-session-reset-operator-confusion-recovery) |
| Unfamiliar file / missing map | Line-precise edits needed without a call-site map | [protocol-v7.md § Help Ladder](protocol-v7.md#help-ladder) |
| Gate verdict: BLOCKED | Any session gate returns BLOCKED | See gate-specific Operator Actions table in that gate's section |

**Priority:** All STOP conditions are equal-priority hard stops. There is no override. If multiple conditions trigger simultaneously, address the earliest in the sequence above first.
```

**Also add a one-line cross-reference in `protocol-lite.md`** in the "Key Pointers" table (currently at the bottom):

```markdown
| [protocol/hard-rules.md § STOP Conditions](protocol/hard-rules.md#stop-conditions--quick-reference) | Quick reference for all STOP triggers |
```

---

### Files to Edit

| File | Action |
|------|--------|
| `protocol/hard-rules.md` | Add `## STOP Conditions — Quick Reference` section after the existing gate list |
| `protocol-lite.md` | Add one row to the "Key Pointers" table linking to the new STOP section |

### Cross-References to Update

No existing content needs to be changed — this is additive. The canonical rule locations (Prompt Review Gate, Tiered Confidence, Focus Control, Mid-Session Reset) are not modified.

### Success Criteria

- `protocol/hard-rules.md` contains a `## STOP Conditions — Quick Reference` table with at least 5 rows covering the conditions listed above
- The table includes anchor links to the canonical sections in `protocol-v7.md`
- `protocol-lite.md` Key Pointers table includes a row pointing to the new section
- All anchor links resolve (verify with `tools/verify-protocol-index.ps1` if it covers hard-rules.md)
- `doc-audit.ps1` passes

### Scope Guard

- Do NOT change or move the canonical STOP rules — they stay in their current sections of `protocol-v7.md`
- Do NOT add new STOP conditions — only index the existing ones
- Do NOT modify any gate definitions or thresholds

---

---

## IMPROVEMENT 3: Staleness Expiry Gate — Add NEXT.md as a Covered Artifact

### The Problem

`session-start-checklist.md` line 18 (added in v7.3.2) requires:

> "NEXT.md Freshness — Review `NEXT.md` 'Immediate Next Steps' against current local and remote repo state before proceeding. Update or remove any items that are already completed, merged, resolved, blocked by changed circumstances, or otherwise obsolete."

This is a **manual checklist item** — the operator must remember to do it. But it is not enforced by the **Staleness Expiry Gate** (`protocol/protocol-v7.md` lines 1097–1195).

The Staleness Expiry Gate's `Covered Artifact Classes` table (lines 1119–1128) lists:
- PAUSE.md handoff state
- Individual PARKED items
- Git stash entries
- Local branches (no upstream, no PR)

**NEXT.md is absent.** This means:
- A NEXT.md last updated 45 days ago produces a Staleness Expiry Gate verdict of **PASS**
- The operator's manual freshness check (checklist line 18) has no gate backing it
- Sessions can start with a stale NEXT.md and all automated gates still green

The fix is to add NEXT.md to the Staleness Expiry Gate as a covered artifact with appropriate thresholds — making the v7.3.2 freshness intent automated rather than honour-system.

---

### Proposed Fix

**Step 1 — Add NEXT.md to the Covered Artifact Classes table in `protocol/protocol-v7.md`**

In the `Covered Artifact Classes` table (around line 1121), add a new row:

```markdown
| **NEXT.md active step** | `git log -1 --format="%ci" -- <DOCS_ROOT>/project/NEXT.md` (last commit date of NEXT.md) | NEXT.md is updated at task completion; a stale NEXT.md means completed work was not closed out, or the active step no longer reflects reality |
```

**Step 2 — Add NEXT.md thresholds to the Threshold Table** (around line 1144):

```markdown
| **NEXT.md active step** | ≤ 7 days since last commit | 8–21 days | > 21 days |
```

Rationale for thresholds:
- ≤7 days PASS: Active work session just completed; NEXT.md was updated recently
- 8–21 days WARN: Work may have shifted; review Immediate Next Steps before trusting them
- >21 days BLOCKED: Three weeks without a NEXT.md update almost certainly means the active step is stale; re-verify before any coding work

**Step 3 — Add evidence command** to the `Required Evidence` block (around line 1132):

```
6. NEXT.md last commit date → git log -1 --format="%ci" -- <DOCS_ROOT>/project/NEXT.md
7. Age in days              → (today − last commit date)
8. Classification           → CURRENT / STALE / EXPIRED
```

**Step 4 — Add NEXT.md to the `Not covered` note** — remove NEXT.md from any implication that it isn't covered (currently it is simply absent, which is the problem).

**Step 5 — Update `session-start-checklist.md` line 18** to note that this check is now also gate-enforced:

Change:
```markdown
- [ ] **NEXT.md Freshness** — Review `NEXT.md` "Immediate Next Steps" against current local and remote repo state before proceeding. Update or remove any items that are already completed, merged, resolved, blocked by changed circumstances, or otherwise obsolete.
```

To:
```markdown
- [ ] **NEXT.md Freshness** — Surfaced automatically by Staleness Expiry Gate. Review `NEXT.md` "Immediate Next Steps" against current local and remote repo state before proceeding. Update or remove any items that are already completed, merged, resolved, blocked by changed circumstances, or otherwise obsolete. Status: PASS | WARN | BLOCKED — see [protocol-v7.md § Staleness Expiry Gate](protocol/protocol-v7.md#staleness-expiry-gate-mandatory-at-session-boundaries).
```

---

### Files to Edit

| File | Action |
|------|--------|
| `protocol/protocol-v7.md` | Add NEXT.md row to Covered Artifact Classes table; add thresholds to Threshold Table; add evidence command to Required Evidence block |
| `session-start-checklist.md` | Update line 18 NEXT.md Freshness item to note gate enforcement |

### Cross-References to Update

- `tools/session-start.ps1` — **flag for a follow-up prompt**: the tool will need to be updated to parse NEXT.md last commit date and include it in the audit block. This is a **tool change** and must be a separate, explicitly-scoped prompt (not docs-only). Do not include it in this prompt.

### Success Criteria (Docs-Only Prompt)

- Staleness Expiry Gate `Covered Artifact Classes` table includes a NEXT.md row with the git log evidence command
- Threshold Table includes a NEXT.md row with ≤7 / 8–21 / >21 day thresholds
- Required Evidence block includes NEXT.md last commit date as item 6–8
- `session-start-checklist.md` NEXT.md Freshness item references the gate and shows `PASS | WARN | BLOCKED` status format (matching the pattern of the other gate items on lines 12–15)
- `doc-audit.ps1` passes
- **Note in Completion Report:** Tool enforcement (`session-start.ps1` update) is deferred — flag as TECH DEBT with Story: MAINTENANCE/PROTOCOL

### Scope Guard

- Do NOT modify `tools/session-start.ps1` in this prompt — tool changes require a separate explicitly-scoped prompt
- Do NOT change the existing threshold values for other artifact classes
- Do NOT remove the manual review instruction from the checklist — keep it; just add the gate reference alongside it

---

---

## PROMPT ASSEMBLY NOTES FOR GPT

When composing the FORMAL WORK PROMPT for each improvement:

**PROMPT-IDs to use:**
- Improvement 1: `KIT-IMPROVE-DOC-AUDIT-SEQ-001`
- Improvement 2: `KIT-IMPROVE-STOP-INDEX-001`
- Improvement 3: `KIT-IMPROVE-STALENESS-NEXTMD-001`
- Improvement 4A: `KIT-IMPROVE-TEMPLATE-DRIFT-DOCS-001`
- Improvement 4B: `KIT-IMPROVE-TEMPLATE-DRIFT-TOOL-001`

**Story ID for all:**
`Story: MAINTENANCE/PROTOCOL — Kit improvements per kit-workspace/KIT-IMPROVEMENT-BRIEFS.md`

**Preflight block (include in every prompt):**
```
Preflight:
- Search tool: Select-String (PS) or grep_search
- Clean tree expected: YES (docs-only; no staged runtime changes)
- Sequencing: repo sanity allowed after Gate (Lock B)
- Batching: allowed (no strict ordering required)
- Required output: edited .md file(s) per brief
```

**Green Gate for all:** Population Gate: `.\tools\doc-audit.ps1` must return PASS (no placeholder tokens, no overlay-inside-head violations). For Sub-Prompt 4B (tooling), also run the script in Consumer mode against a test fixture to verify template-drift detection.

**Completion Report must include:**
- Files changed (list)
- Lines added / lines removed
- Anchor links verified (copy-paste test or `.\tools\verify-protocol-index.ps1`)
- `doc-audit.ps1` verdict: PASS / FAIL
- For Improvement 3 only: "TECH DEBT flagged: session-start.ps1 tool update deferred — Story: MAINTENANCE/PROTOCOL"

**Sequencing:** Run as separate prompts in order (1 → 2 → 3 → 4). Each requires its own Completion Report and doc-audit PASS before the next begins. Improvement 4 requires two sub-prompts (4A docs, 4B tooling).

---

---

## IMPROVEMENT 4: Template-Drift Detection — Overlay Provenance and Reconciliation Gate

> **Priority:** CRITICAL — without this, kit template changes (new overlay rows, updated guidance, new contracts like x-branch) are invisible to consumers after initial overlay setup. Every future kit improvement that touches a template file has the same propagation gap.
>
> **Date Added:** 2026-04-19
> **Discovered During:** KIT-XBRANCH-CONTRACT-V1-IMPLEMENT-001 — the `repo-policy-overlay.example.md` gained an x-branch row, but no mechanism exists to tell consumers their local `repo-policy.md` is now stale.

### The Problem

The kit provides templates in `templates/*.example.md` as starting points. Consumers copy them to `<DOCS_ROOT>/overlays/` during onboarding and customize them. After initial copy, **no mechanism detects when the upstream template changes**.

**Current state of overlay tracking:**

| Layer | What Exists | What's Missing |
|-------|-------------|----------------|
| `OVERLAY-INDEX.md` | Manifest table: overlay name, consumer path, purpose | No "derived from template version" column; no hash or date tracking |
| `doc-audit.ps1` | Checks overlay index exists; checks overlays are outside kit head | No template-to-overlay comparison; no drift detection |
| `DOCS-HEALTH-CONTRACT.md` | Defines overlay index existence check (#3) and placement check (#4) | No template-drift check defined |
| `session-start.ps1` | Consumer-Kit Drift Gate compares 3 sentinel files | Overlay files are not sentinel-tracked; drift gate ignores them |

**Concrete failure scenario (just happened):**
1. Kit v7.4.0 adds an x-branch row to `templates/repo-policy-overlay.example.md`
2. Consumer runs `session-start.ps1` → subtree pull brings kit v7.4.0 into `<DOCS_ROOT>/vibe-coding/`
3. All gates return PASS
4. Consumer's `<DOCS_ROOT>/overlays/repo-policy.md` still has the old content — **no warning emitted**
5. Agent sessions in the consumer repo have no awareness of x-branch rules unless the human manually checks the template diff

This gap affects **every template**, not just repo-policy. Stack-profile, hot-files, merge-commands, visibility-contract — all have the same propagation blindspot.

### Proposed Fix — Two Sub-Prompts

This improvement requires both docs changes and tooling changes, so it is split into two sub-prompts.

---

#### Sub-Prompt 4A: Docs — Define the Contract and Update the Overlay-Index Template (DOCS ONLY)

**Step 1 — Add a "Template-Drift Detection" check to `DOCS-HEALTH-CONTRACT.md`**

Add as Check #7 (after the existing six):

```markdown
## 7. Template-Drift Detection (WARN)

**Rule:** Each consumer overlay listed in `OVERLAY-INDEX.md` SHOULD record the kit template file version it was last reconciled against. When the kit template's `File Version` is newer than the recorded reconciliation version, the audit emits a WARNING naming the stale overlay.

**Severity:** WARN (not FAIL). Overlays are intentionally customized; drift is expected. The gate only ensures the consumer is *aware* of upstream changes.

**Evidence:**
- Parse the `Kit Template Version` column in `OVERLAY-INDEX.md`
- Compare each value against the `File Version` header in the corresponding `templates/*.example.md` file in the kit subtree
- If the kit template version is newer → WARN: `Overlay <name> last reconciled against template version <old>; current template version is <new>. Review <DOCS_ROOT>/vibe-coding/templates/<template>.example.md for changes.`

**Operator Action on WARN:**
1. Diff the kit template against the consumer overlay (`diff <DOCS_ROOT>/overlays/<name>.md <DOCS_ROOT>/vibe-coding/templates/<name>.example.md`)
2. Adopt relevant changes into the consumer overlay
3. Update the `Kit Template Version` column in `OVERLAY-INDEX.md` to the current template version
4. Re-run doc-audit to clear the warning

**Not Covered:** Consumer overlays with no corresponding kit template (project-specific overlays) are ignored by this check.
```

**Step 2 — Update `templates/overlay-index.example.md` to add provenance column**

Add a `Kit Template Version` column to the manifest table:

| Overlay | Consumer Location | Kit Template | Kit Template Version | Purpose |
|---------|-------------------|--------------|----------------------|---------|
| `stack-profile.md` | `<DOCS_ROOT>/overlays/stack-profile.md` | `templates/stack-profile-overlay.example.md` | `2026-02-26` | Stack and tooling profile |
| `merge-commands.md` | `<DOCS_ROOT>/overlays/merge-commands.md` | `templates/merge-commands-overlay.example.md` | `2026-02-26` | PR merge command reference |
| `hot-files.md` | `<DOCS_ROOT>/overlays/hot-files.md` | `templates/hot-files-overlay.example.md` | `2026-02-26` | Frequently-edited files |
| `repo-policy.md` | `<DOCS_ROOT>/overlays/repo-policy.md` | `templates/repo-policy-overlay.example.md` | `2026-04-19` | Branch and PR policy |
| `visibility-contract.md` | `<DOCS_ROOT>/overlays/visibility-contract.md` | `templates/visibility-contract-overlay.example.md` | `2026-02-26` | Monitoring and observability links |

The `Kit Template Version` column value must match the `File Version:` header line in the corresponding kit template file. The consumer updates this column when they reconcile.

**Step 3 — Add cross-reference to `session-start-checklist.md`**

After the existing "Consumer-Kit Drift" item, add:

```markdown
- [ ] **Template-Drift Check** — Surfaced automatically by doc-audit. If any overlay's `Kit Template Version` in OVERLAY-INDEX.md is older than the kit template's `File Version`, a WARN is emitted. Review and reconcile stale overlays. Status: CLEAN | WARN — see [DOCS-HEALTH-CONTRACT.md § Template-Drift Detection](DOCS-HEALTH-CONTRACT.md#7-template-drift-detection-warn).
```

**Step 4 — Ensure all kit template files in `templates/` have a `File Version:` header**

Verify that every `templates/*.example.md` file contains a `File Version: YYYY-MM-DD` line in its header block. If any are missing, add one using the file's last git commit date (`git log -1 --format="%as" -- <file>`).

---

**Files to Edit (Sub-Prompt 4A):**

| File | Action |
|------|--------|
| `DOCS-HEALTH-CONTRACT.md` | Add Check #7: Template-Drift Detection |
| `templates/overlay-index.example.md` | Add `Kit Template` and `Kit Template Version` columns to table |
| `session-start-checklist.md` | Add Template-Drift Check item |
| `templates/*.example.md` (all) | Verify/add `File Version:` header if missing |

**Success Criteria (Sub-Prompt 4A):**
- DOCS-HEALTH-CONTRACT.md contains Check #7 with WARN severity, evidence method, and operator action
- overlay-index.example.md table has a `Kit Template Version` column with date values
- session-start-checklist.md has a Template-Drift Check item
- All `templates/*.example.md` files have a `File Version:` header
- `doc-audit.ps1` passes (no regressions)
- Note in Completion Report: Tool enforcement deferred to Sub-Prompt 4B

**Scope Guard (Sub-Prompt 4A):**
- Do NOT modify `tools/doc-audit.ps1` — that is Sub-Prompt 4B
- Do NOT modify any consumer repos
- Do NOT change any existing overlay content — only the index template format

---

#### Sub-Prompt 4B: Tooling — Implement Template-Drift Check in doc-audit.ps1

**Step 1 — Add template-drift detection logic to `tools/doc-audit.ps1`**

In Consumer mode, after the existing PRE-B check (Overlay index existence), add a new check:

```
Check PRE-D: Template-Drift Detection
```

Logic:
1. Parse `<DOCS_ROOT>/overlays/OVERLAY-INDEX.md` for rows containing a `Kit Template Version` column
2. For each row, resolve the kit template path: `<DOCS_ROOT>/vibe-coding/<Kit Template>` value
3. Read the template file's `File Version:` header line
4. Compare the overlay's recorded version against the template's current version (string date comparison, `YYYY-MM-DD` format)
5. If template version > recorded version → emit WARNING with overlay name, recorded version, current template version, and diff guidance
6. If overlay index has no `Kit Template Version` column → skip check with INFO message: "OVERLAY-INDEX.md does not include Kit Template Version column — template-drift detection skipped. See overlay-index.example.md for the updated format."

**Step 2 — Update the audit summary block**

Add a `Template Drift` row to the summary output:
- `CLEAN` if all overlays are current or no provenance column exists
- `WARN (N stale)` if N overlays have older versions than their templates

---

**Files to Edit (Sub-Prompt 4B):**

| File | Action |
|------|--------|
| `tools/doc-audit.ps1` | Add PRE-D template-drift check in Consumer mode |

**Success Criteria (Sub-Prompt 4B):**
- doc-audit.ps1 Consumer mode includes template-drift detection
- WARNs emitted for stale overlays; no false positives for overlays without kit template mappings
- Graceful skip if overlay index lacks the `Kit Template Version` column (backward-compatible with existing consumers who haven't updated their index yet)
- `doc-audit.ps1 -Mode Kit` still passes on the kit repo
- Manual test: create a test overlay index with an old version date, confirm WARN is emitted

**Scope Guard (Sub-Prompt 4B):**
- Do NOT modify `session-start.ps1` — doc-audit is called by session-start; the warning will surface automatically
- Do NOT change the severity from WARN to FAIL — overlays are intentionally customized; divergence is normal
- Do NOT auto-modify consumer overlays — only detect and report
