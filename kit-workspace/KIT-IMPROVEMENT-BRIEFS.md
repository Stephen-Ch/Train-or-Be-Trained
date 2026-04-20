# Kit Improvement Briefs — v7.3.2 Assessment

> **Date:** 2026-04-16
> **Kit Version Assessed:** v7.3.2 (Effective 2026-04-14)
> **Purpose:** Give GPT enough detail to compose precise, executable Copilot prompts for three targeted improvements identified during external assessment.
> **Scope:** DOCS ONLY. All edits are `.md` files inside the kit root.
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

**Story ID for all three:**
`Story: MAINTENANCE/PROTOCOL — Kit improvements per kit-workspace/KIT-IMPROVEMENT-BRIEFS.md (2026-04-16 assessment)`

**Preflight block (include in every prompt):**
```
Preflight:
- Search tool: Select-String (PS) or grep_search
- Clean tree expected: YES (docs-only; no staged runtime changes)
- Sequencing: repo sanity allowed after Gate (Lock B)
- Batching: allowed (no strict ordering required)
- Required output: edited .md file(s) per brief
```

**Green Gate for all three:** Docs-only → Population Gate: `.\tools\doc-audit.ps1` must return PASS (no placeholder tokens, no overlay-inside-head violations).

**Completion Report must include:**
- Files changed (list)
- Lines added / lines removed
- Anchor links verified (copy-paste test or `.\tools\verify-protocol-index.ps1`)
- `doc-audit.ps1` verdict: PASS / FAIL
- For Improvement 3 only: "TECH DEBT flagged: session-start.ps1 tool update deferred — Story: MAINTENANCE/PROTOCOL"

**Sequencing:** Run as three separate prompts in order (1 → 2 → 3). Each requires its own Completion Report and doc-audit PASS before the next begins.
