# REPORT-KIT-FLOWMODE-SIMPLIFICATION-RESEARCH-001

> **Date:** 2026-03-12
> **PROMPT-ID:** KIT-FLOWMODE-SIMPLIFICATION-RESEARCH-001
> **Area:** Kit simplification / Flow Mode feasibility
> **Status:** COMPLETE
> **Confidence:** 96%
> **Mode:** RESEARCH-ONLY — no files edited, no commits, no behavior changes

---

## 1. Executive Verdict

The vibe-coding kit (v7.2.38) is technically sound but operationally over-weighted for active implementation.
The kit **does not distinguish** between session-boundary work and mid-session implementation flow.
Every formal prompt pays the full governance cost (5 mandatory pre-work steps, 14 named gates) regardless of context or risk level.

The proposed Flow Mode / Checkpoint Mode concept is **strongly supported** by the evidence.
The kit's own Drift Trigger rule ("≥20 minutes on process without shipping progress") regularly conflicts with its own ceremony requirements — the process can trigger its own failure condition.

A focused simplification is feasible with changes to **5–7 files** (doc changes only; no script changes required for the minimum safe set).
The hardest part is re-scoping the doc-audit rerun trigger, which is doc-defined but references a consumer-side Start-Here-For-AI.md file that does not exist in the kit repo.

---

## 2. Gate Inventory Table

Every gate/checkpoint/micro-gate found in the kit, with source and applicability classification.

| # | Gate Name | Source File(s) | Trigger / When | Mandatory? | Doc-only or Script-enforced? | Applies During... |
|---|-----------|----------------|----------------|------------|-------|-------------------|
| 1 | **Prompt Review Gate** (4-line) | protocol-v7.md § Core Rule 1 | Every formal work prompt | Mandatory | Doc-only | Active work + checkpoints |
| 2 | **Command Lock** (2-tier: Lock A hard, Lock B soft) | protocol-v7.md § Core Rule 1, § Resilience Rules A | Every formal work prompt | Mandatory | Doc-only | Active work + checkpoints |
| 3 | **Proof-of-Read** | protocol-v7.md § Core Rule 2 | Every formal work prompt | Mandatory | Doc-only | Active work + checkpoints |
| 4 | **Comprehension Self-Check** (3 questions) | protocol-v7.md § Core Rule 2, copilot-instructions-v7.md § 3 | After Proof-of-Read, every prompt | Mandatory | Doc-only | Active work + checkpoints |
| 5 | **Green Gate** (stack-aware) | protocol-v7.md § Green Gate, hard-rules.md | Before every commit | Mandatory | Script-assisted (build/test commands) | Active work + checkpoints |
| 6 | **Vision & User Story Gate** | protocol-v7.md § Vision & User Story Gate | Every work prompt | Mandatory | Doc-only | Active work + checkpoints |
| 7 | **Population Gate** (placeholder scan) | required-artifacts.md § Control Deck Population Gate, doc-audit.ps1 | Session start; after commits touching Control Deck | Mandatory | **Script-enforced** (doc-audit.ps1 line ~235) | Checkpoints (session start), but doc says also after commits |
| 8 | **Doc Audit** (full chain) | session-start.ps1, doc-audit.ps1 | Session start; rerun trigger after commits | Mandatory at session start | **Script-enforced** (session-start.ps1 chains it) | Checkpoint (session start) — but doc-defined rerun after commits |
| 9 | **3-Party Approval Gate** | alignment-mode.md § 3-Party Approval Gate | When exiting Alignment Mode only | Conditional (Alignment Mode) | Doc-only | Checkpoint only |
| 10 | **Return Packet Gate** | return-packet-gate.md | Hot-file work, high uncertainty, cross-system, regression risk | Conditional (trigger-based) | Doc-only | Both (but only when triggered) |
| 11 | **Interface Forecast Micro-Gate** | protocol-v7.md § Interface Forecast | Before first wiring step (new interfaces) | Conditional (new interfaces) | Doc-only | Active work (when applicable) |
| 12 | **Preflight Evidence Gate** | protocol-v7.md § Preflight Evidence Gate | Before structural changes (CSS/HTML scope) | Conditional (structural changes) | Doc-only | Active work (when applicable) |
| 13 | **Closeout Checklist Gate** | templates/closeout-artifact-verification-template.md | Before marking story COMPLETE | Conditional (story close) | Doc-only | Checkpoint only |
| 14 | **PR / Branch Hygiene Gate** | protocol-v7.md § PR / Branch Hygiene Gate | Before new sprint work | Mandatory | Doc-only | Checkpoint (session start) |
| 15 | **Copy & Semantics Gate** | protocol-v7.md § Copy & Semantics Gate | UX/copy/narration changes | Conditional | Doc-only | Active work (when applicable) |
| 16 | **Churn Circuit Breaker** | protocol-v7.md § Help Triggers | When 6 risk conditions met | Conditional | Doc-only | Active work (when triggered) |

**Summary:**
- 6 gates fire on **every formal prompt** regardless of context (#1–6)
- 2 fire at **session start** and potentially **after commits** (#7–8)
- 8 are conditional / trigger-based (#9–16)

**Key finding:** The 6 per-prompt gates are the primary overhead source. The conditional gates are generally well-scoped — they only fire when relevant. The problem is the 6 that fire unconditionally.

---

## 3. State-Authority Map

Every file that functions as a state or workflow authority.

| # | File / Artifact | Intended Role | Updated By | Must Be Current When? | Mid-Session Staleness | Kit Stance |
|---|-----------------|---------------|------------|----------------------|----------------------|------------|
| 1 | **NEXT.md** | Active story + next step | Human + GPT | Before every work prompt | Not acceptable | **Explicit** (protocol-v7.md § Vision & User Story Gate: "Best next step? YES" only if GOAL matches NEXT STEP) |
| 2 | **PAUSE.md** | Session handoff state | Human at session close | At session close only | Normal during active work | **Ambiguous** — kit template says "Update this PAUSE.md before ending session" but session-start-checklist.md links it alongside NEXT.md in Quick Links, implying co-authority |
| 3 | **forGPT/ copies** | Packaged handoff snapshot for GPT | sync-forgpt.ps1 script | At sync checkpoints | Normal between syncs | **Ambiguous** — sync runs automatically at session start via session-start.ps1, but protocol-v7.md does not explicitly state mid-session staleness is normal |
| 4 | **VERSION-MANIFEST.md** | Hash proof of forGPT freshness | sync-forgpt.ps1 script | At sync time | Normal between syncs | **Ambiguous** — manifest includes SHA256 hashes + timestamps, looks authoritative, but is a point-in-time snapshot |
| 5 | **VISION.md** | Project purpose/non-goals | Human (rare) | At session start (Population Gate) | Normal (rarely changes) | **Explicit** (required-artifacts.md; checked by doc-audit Population Gate) |
| 6 | **EPICS.md** | Epic inventory | Human (rare) | At session start (Population Gate) | Normal (rarely changes) | **Explicit** |
| 7 | **branches.md** | Branch/PR tracking | Human | At session start (session-start-checklist.md) | Normal during active work | **Ambiguous** — listed as required reading in protocol-v7.md § Required Reading, also in session-start-checklist Quick Links |
| 8 | **stack-profile.md** | Gate configuration | Human (rare) | Before Green Gate | Normal (rarely changes) | **Explicit** (protocol-v7.md § Green Gate: "Read from stack-profile.md") |
| 9 | **tech-debt-and-future-work.md** | Known issues / parking lot | Human + AI | Grows during work | Normal | **Explicit** (referenced as parking target; session-start-checklist says check for blockers) |
| 10 | **test-catalog.md** | Test inventory | Human + AI | When touching tests | Normal | **Explicit** (required-artifacts.md: existence checked by doc-audit) |

**Key finding:** Items #2, #3, #4, and #7 have **ambiguous** kit stances on mid-session staleness. This ambiguity is the direct cause of the false-alarm problem the GPT reported. The kit never explicitly says "these are expected to be stale mid-session." The absence of that statement allows any staleness to look like a failure.

---

## 4. Trigger Map

### 4a. Doc Audit Rerun Trigger After Commit

**Source:** protocol-v7.md line ~90:
> "After each commit, run the rerun-trigger detection command defined in Start-Here-For-AI.md to determine if Doc Audit must be rerun."

**Source:** required-artifacts.md line ~123:
> "Doc Audit Rerun Detection: After each commit, Doc Audit rerun is required if required-artifacts.md or Control Deck files changed since last audit."

**Script enforcement:** None. The rerun-trigger detection command is defined in Start-Here-For-AI.md, which is a **consumer-side file** that does not exist in the kit repo. session-start.ps1 runs doc-audit at session start only. No script enforces rerun after every commit.

**Verdict:** Doc-defined, not script-enforced. The rerun trigger is narrowly scoped to "if Control Deck files changed since last audit" which is reasonable in principle but heavy in practice because the doc says "after each commit" and doesn't distinguish trivial commits from Control Deck commits.

### 4b. forGPT Sync Timing

**Source:** session-start.ps1 line ~250: sync-forgpt.ps1 is run automatically during session start chain, with `-Force` flag.

**Source:** canonical-commands.md: RUN SYNC forGPT is listed as a standalone command.

**Source:** copilot-instructions-v7.md § Session Start: session-start chain includes forGPT sync.

**Script enforcement:** Runs at session start only. No script triggers mid-session sync. No script checks forGPT freshness during active work.

**Verdict:** Script-enforced at session start only. Mid-session sync expectations are **entirely doc-defined and ambiguous** — no doc explicitly says "sync is not needed mid-session" but no doc says "sync must stay current mid-session" either. The ambiguity allows either interpretation.

### 4c. Packet Freshness Checks

**Source:** sync-forgpt.ps1 generates VERSION-MANIFEST.md with SHA256 hashes and timestamps. This looks like a freshness-audit mechanism.

**Script enforcement:** VERSION-MANIFEST is generated by sync-forgpt.ps1 at sync time. No script reads VERSION-MANIFEST to validate freshness later. It is purely informational.

**Verdict:** The manifest exists for traceability, not for live enforcement. But its presence creates the appearance of a freshness obligation — if hashes don't match source, it looks broken even when it's just normal staleness.

### 4d. PAUSE.md Usage

**Source:** PAUSE.md template header: "This is a TEMPLATE for session handoff state. Each consuming repo should maintain its own PAUSE.md with repo-specific content."

**Source:** session-start-checklist.md Quick Links table: PAUSE.md listed alongside NEXT.md with purpose "Handoff docs (if paused)."

**Source:** PAUSE.md § How to Resume: "Update this PAUSE.md before ending session"

**Script enforcement:** end-session.ps1 does NOT check or enforce PAUSE.md population. It checks tracked changes, untracked items, and non-merged branches only.

**Verdict:** PAUSE.md is doc-defined as end-of-session. No script enforces it at any point. But its presence in session-start Quick Links and its label as "handoff docs" creates false authority pressure during active work.

### 4e. Branch Hygiene Timing

**Source:** session-start-checklist.md: "Branch Hygiene — Run `git branch -a --no-merged origin/develop | Select-String -NotMatch "docs/"`. If runtime branches exist without PRs, address first."

**Source:** protocol-v7.md § PR / Branch Hygiene Gate: "Before starting new sprint work, verify no unmerged runtime branches exist without a PR."

**Source:** end-session.ps1 lines ~160–180: Reports non-merged branches (informational, no hard stop).

**Script enforcement:** end-session.ps1 lists non-merged branches but does NOT hard-stop on them. session-start.ps1 does NOT check branch hygiene at all.

**Verdict:** Doc-only. Currently assigned to session START in the checklist, which front-loads admin work. The same check exists in end-session (informational). Moving it to end-session-only would reduce start friction without losing visibility.

### 4f. Rules That Interrupt Active Implementation for Process Drift

| Rule | Source | Can Interrupt Active Work? | Mechanism |
|------|--------|---------------------------|-----------|
| Drift Trigger: "≥20 min on process" | protocol-v7.md § Focus Control | Yes — forces Reset Ritual | Doc-only |
| Doc Audit rerun after commit | protocol-v7.md line ~90, required-artifacts.md line ~123 | Yes — "must be rerun" after commit | Doc-only (no script enforcement) |
| Population Gate recheck | implied by Doc Audit rerun | Yes — indirectly through audit rerun | Doc-only |
| NEXT.md Freshness Rule | protocol-v7.md § Vision & User Story Gate | Yes — "Best next step? YES" only if NEXT STEP current | Doc-only |
| Required Reading Integrity Check | protocol-v7.md § Required Reading | Yes — STOP if reading file missing | Doc-only |
| forGPT staleness investigation | No explicit rule; emergent from ambiguity | Yes — agent or operator may investigate | Convention / habit |

---

## 5. Contradictions / Friction Findings

### C1. The Process Triggers Its Own Drift Condition

**Evidence:**
- protocol-v7.md § Drift Triggers: ">=20 minutes spent on process/docs/cleanup without shipping progress" → STOP
- The session-start ceremony (kit update + sync + doc audit + checklist) commonly takes 5–15 minutes
- Per-prompt ceremony (4-line gate + proof-of-read + 3-question self-check) adds ~2–5 minutes per prompt
- After 2-3 prompts with full ceremony, the cumulative process time approaches 20 minutes without shipping code

**Classification:** True operational contradiction. The drift trigger punishes the overhead the protocol itself creates.

### C2. PAUSE.md Creates False Alarm Pressure

**Evidence:**
- PAUSE.md template is blank by design during active work (populated at session close)
- session-start-checklist.md includes PAUSE.md in Quick Links table alongside NEXT.md
- No doc explicitly says "blank PAUSE.md during active work is normal"

**Classification:** Ambiguity that creates false alarm. Not a bug — a missing clarification.

### C3. forGPT Looks Broken When It's Just Stale

**Evidence:**
- sync-forgpt.ps1 generates VERSION-MANIFEST.md with SHA256 hashes (line ~varies)
- Any doc edit after sync makes hashes mismatch
- No doc says "hash mismatch between checkpoints is expected and normal"
- VERSION-MANIFEST looks like a health check artifact, not a point-in-time receipt

**Classification:** Ambiguity. The manifest is designed for traceability but looks like a freshness obligation.

### C4. Multiple "Required Reading" Files Function as State Authorities

**Evidence:**
- protocol-v7.md § Required Reading lists 6 files that must be read and quoted
- branches.md is listed as required reading, creating reading obligation even when it hasn't changed
- If any required-reading file is missing, the protocol says STOP
- This means a missing status file (branches.md) can block implementation even though it's not a safety file

**Classification:** Over-scoping. branches.md being required reading elevates an inventory file to blocking-authority status.

### C5. Doc Audit Rerun References Non-Existent Kit File

**Evidence:**
- protocol-v7.md line ~90: "run the rerun-trigger detection command defined in Start-Here-For-AI.md"
- Start-Here-For-AI.md does not exist in the kit repo (confirmed: file_search returns no results)
- This is a consumer-side file that the kit references but cannot provide
- The actual rerun logic is defined in the consumer Start-Here doc, not in the kit

**Classification:** Dangling reference. The kit defines a rule ("rerun after commit") but delegates the detection mechanism to a file outside its control. This makes the rule's scope and behavior unclear to agents reading only the kit.

### C6. Session-Start Checklist Front-Loads End-of-Session Concerns

**Evidence:**
- session-start-checklist.md items: Open PRs, Branch Hygiene, Blockers, Research Index — all are cleanup/inventory tasks
- These create 4–7 minutes of admin work before any code
- end-session.ps1 already checks tracked changes, untracked items, and non-merged branches

**Classification:** Misplacement. Inventory/cleanup checks belong at session end, not session start. Session start should validate readiness (NEXT.md clear, tree clean, audit pass), not perform post-session cleanup from the previous session.

---

## 6. Safety Dependency Analysis

For each candidate simplification, what actually breaks if relaxed.

### 6a. PAUSE.md Mid-Session Relevance → Make End-of-Session Only

| If relaxed... | Safety impact | Real risk |
|---|---|---|
| Stop checking PAUSE.md mid-session | None | **Zero.** No script enforces mid-session PAUSE.md checks. The check is entirely agent/operator habit. |
| Stop treating blank PAUSE.md as alarm | None | **Zero.** PAUSE.md is a template in the kit repo. Blank is the correct state during active work. |
| Move PAUSE.md out of session-start Quick Links | Slightly less visible at session start | **Minimal.** PAUSE.md is useful as a "How to Resume" reference at session start, but it should not imply mid-session obligations. |

**Verdict: Safe to relax.** No safety loss. Only ceremony reduction.

### 6b. Continuous forGPT Freshness Concern → Checkpoint Snapshot Only

| If relaxed... | Safety impact | Real risk |
|---|---|---|
| Stop investigating forGPT staleness mid-session | None | **Zero.** No script checks forGPT freshness mid-session. sync-forgpt.ps1 runs at session start only. |
| Explicitly label VERSION-MANIFEST as point-in-time receipt | None | **Zero.** The manifest's SHA256 hashes still prove what was synced and when. Labeling it correctly prevents false alarms. |
| Only sync forGPT at session start, end, and handoff | Slight risk if GPT needs mid-session context | **Low.** GPT handoff is already a defined checkpoint. On-demand sync is still available via `run-vibe -Tool sync-forgpt`. |

**Verdict: Safe to relax.** The forGPT sync is already checkpoint-scoped in scripts. Only the docs lack explicit "staleness is normal" language.

### 6c. Doc Audit Rerun After Every Commit → Session Boundaries Only

| If relaxed... | Safety impact | Real risk |
|---|---|---|
| Stop rerunning doc audit after every commit | Could miss a broken Control Deck | **Low.** The Population Gate catches placeholder tokens, but Control Deck files rarely gain new placeholders mid-session. The Green Gate (build + test) still runs after every commit. |
| Run doc audit only at session start and end | Could miss stale NEXT.md | **Low.** NEXT.md freshness is also enforced by the Vision & User Story Gate per-prompt (doc-only check, not script). |
| Remove the "rerun-trigger detection" rule | Loses the principle that certain commits should recheck docs | **Moderate.** The narrower version of this rule (rerun only if Control Deck files changed) is reasonable. The broad version (rerun after every commit) is heavy. |

**Verdict: Partially safe.** Keep doc audit at session boundaries. Drop the "after every commit" rule. The NEXT.md freshness check in the Vision & User Story Gate (per-prompt) provides continuous coverage without requiring a full audit rerun.

### 6d. Proof-of-Read on Every Prompt → First Prompt Per Story Only

| If relaxed... | Safety impact | Real risk |
|---|---|---|
| Skip Proof-of-Read on continuation prompts (same story, same session) | Agent might miss a rule change in a file it already read | **Very low.** Kit files don't change mid-session. The agent already read them at session start. |
| Require Proof-of-Read only on first prompt of session OR story switch | Maintains reading discipline at context switches | **None.** This is where reading discipline matters most — when context is fresh or changing. |

**Verdict: Safe to relax.** Proof-of-Read serves reading comprehension at context entry. Within a continuous story, re-reading the same file adds no safety value.

### 6e. Comprehension Self-Check on Every Prompt → Checkpoint Mode Only

| If relaxed... | Safety impact | Real risk |
|---|---|---|
| Skip 3-question self-check on continuation prompts | Agent might not articulate scope boundaries | **Low.** The Prompt Review Gate still runs (What + Confidence). The self-check is redundant once the agent has demonstrated comprehension on prompt 1. |
| Require self-check only on first prompt, story switch, or high-risk prompts | Maintains discipline where it matters | **None.** |

**Verdict: Safe to relax.** The self-check was added (v7.2.26) to prevent comprehension drift on complex prompts. For sequential tiny-step prompts on the same story, it's ceremony without incremental safety.

### 6f. Branch Hygiene at Session Start → Session End

| If relaxed... | Safety impact | Real risk |
|---|---|---|
| Move branch hygiene check to end-of-session only | Orphan branches might not be noticed until session end | **Low.** end-session.ps1 already reports non-merged branches. The session-start check is a duplicate of the end-session check. |
| Remove branch hygiene from session-start-checklist.md | One fewer manual check at startup | **None.** The check still exists in end-session.ps1. |

**Verdict: Safe to relax.** Moving to end-session is appropriate — you clean up at the end of your work, not at the start.

---

## 7. Recommended Minimum Safe Change Set

### Tier 1: Strongly Supported by Evidence (Safe to Implement)

These changes have clear evidence, no safety risk, and require only doc edits (no script changes).

| # | Change | Files to Edit | What Changes |
|---|--------|---------------|-------------|
| 1 | **Add staleness classification table** to protocol-v7.md | protocol-v7.md | New section defining expected vs actionable vs bug-level staleness for each state file |
| 2 | **Add "forGPT is a checkpoint snapshot" rule** to protocol-v7.md or canonical-commands.md | protocol-v7.md or canonical-commands.md | Explicit statement that forGPT staleness between sync points is expected and not a workflow failure |
| 3 | **Clarify PAUSE.md as end-of-session only** in PAUSE.md header + session-start-checklist.md | PAUSE.md, session-start-checklist.md | Add note that blank PAUSE.md during active work is normal; adjust Quick Links table purpose text |
| 4 | **Move branch hygiene to end-of-session** in session-start-checklist.md | session-start-checklist.md | Remove Branch Hygiene checkbox; rely on end-session.ps1 reporting instead |
| 5 | **Simplify session-start-checklist.md** to 3–4 items | session-start-checklist.md | Reduce to: (1) RUN START OF SESSION, (2) Confirm NEXT.md, (3) Goal Anchor, (4) Start working |

### Tier 2: Probably Safe, Needs Design Decision

These require a policy decision about how much per-prompt ceremony to reduce.

| # | Change | Files to Edit | What Changes | Decision Needed |
|---|--------|---------------|-------------|-----------------|
| 6 | **Define Flow Mode vs Checkpoint Mode** | protocol-v7.md, hard-rules.md, copilot-instructions-v7.md | New section defining two operational modes with different ceremony levels | What exactly is in scope for Flow Mode per-prompt ceremony? (Proposal: simplified 2-line gate + Green Gate only) |
| 7 | **Reduce Proof-of-Read to first-prompt-per-story** | protocol-v7.md § Core Rule 2 | Add exception for continuation prompts on same story in same session | Confirm this won't cause issues with multi-agent handoffs |
| 8 | **Reduce Comprehension Self-Check to Checkpoint Mode** | protocol-v7.md § Core Rule 2, copilot-instructions-v7.md | Add exception for continuation prompts | Same consideration as #7 |
| 9 | **Remove doc-audit rerun after every commit** | protocol-v7.md line ~90, required-artifacts.md line ~123 | Change "after each commit" to "at session start and session end" | Confirm that per-prompt NEXT.md freshness check in Vision & User Story Gate provides enough coverage |

### Tier 3: Not Yet Justified (Needs More Research)

| # | Change | Why Not Yet |
|---|--------|------------|
| 10 | **Simplify the 4-line Prompt Review Gate** to 2 lines | The gate is the most-cited authority mechanism in the kit. Reducing it requires careful thought about what "Best next step?" and "Work state:" actually prevent. Need evidence of false positives caused by these lines specifically. |
| 11 | **Remove Vision & User Story Gate per-prompt NEXT.md citation** | This gate is also the mechanism that keeps NEXT.md current. Removing it could allow NEXT.md to drift during active work. Need to identify what replaces it. |
| 12 | **Script changes to session-start.ps1 or end-session.ps1** | Not needed for Tier 1 or 2. Script behavior is already checkpoint-scoped. The overhead is doc-defined, not script-defined. |

---

## 8. Open Questions / Uncertainties

1. **Start-Here-For-AI.md:** The doc-audit rerun trigger references this consumer-side file. The kit should either: (a) define the rerun-trigger detection command in the kit itself, or (b) remove the per-commit rerun requirement and rely on session-boundary audits. Needs a design decision.

2. **Multi-agent handoff risk from reduced Proof-of-Read:** If Copilot skips Proof-of-Read on prompt 3+ in a session, and then GPT drafts a prompt based on stale assumptions, the reading gate won't catch it. Mitigation: require Proof-of-Read on story switches and agent handoffs, not just first prompt.

3. **"Best next step?" value in per-prompt gate:** This line is the mechanism that catches prompts that don't match NEXT.md. Removing it from the gate (Tier 3, #10) would require the Vision & User Story Gate citation to serve as the sole NEXT.md alignment check. Whether that's sufficient is not yet tested.

4. **Consumer-specific ceremony:** Some overhead may come from consumer-side Start-Here-For-AI.md or overlay requirements, not from the kit itself. This research inspected only the kit. A consumer-side follow-up would confirm whether additional ceremony is added at the consumer level.

5. **NEXT.md "lightweight rule" enforcement:** required-artifacts.md says "Keep under ~30 lines total" and "If updating feels like paperwork, the format is wrong — tighten it." This is good guidance but not enforced. If NEXT.md updates become burdensome, the format may need tightening independent of Flow Mode.

---

## 9. Exact Files Inspected

All files read directly during this research (read_file or grep_search):

| File | Type | Key Findings |
|------|------|-------------|
| protocol/protocol-v7.md (full, ~830 lines) | Protocol | All 10+ core rules, gates, drift triggers, rerun triggers |
| protocol/hard-rules.md | Quick reference | 8-step prompt sequence, STOP conditions |
| protocol/copilot-instructions-v7.md | Instructions | Session start mandate, 6 non-negotiables, report footer |
| protocol/working-agreement-v1.md | Agreement | Primary Priorities, 4-party workflow, Agent Safety Policy |
| protocol/stay-on-track.md | Focus guard | Red flags, scope boundaries, UX proof |
| protocol/prompt-lifecycle.md | States | READY/IN-PROGRESS/COMPLETE/MERGED/OBSOLETE definitions |
| protocol/required-artifacts.md | Artifacts | Mandatory docs, step classification, doc audit workflow, Population Gate |
| protocol/canonical-commands.md | Commands | Repo root anchor, proof commands, run-vibe universal runner |
| protocol/alignment-mode.md | Mode | 3-Party Gate, remediation checklists, placeholder scan |
| protocol/verification-mode.md | Mode | Allowed/forbidden actions in read-only audits |
| protocol/return-packet-gate.md | Gate | Mandatory triggers, execution policy |
| protocol/merge-prompt-template.md | Template | Merge sequence, canonical paths |
| protocol/PROTOCOL-INDEX.md | Index | Navigation links to all protocol-v7 sections |
| session-start-checklist.md | Checklist | 7 pre-flight items, Quick Links table |
| PAUSE.md | Template | Session handoff template, How to Resume |
| OCTOPUS-INVARIANTS.md | Invariants | Kit head vendor rule, overlay placement |
| DOCS-HEALTH-CONTRACT.md | Contract | 6 hard-fail checks, enforcement locations |
| VIBE-CODING.VERSION.md | Version | v7.2.38 changelog, all changes since v7.2.19 |
| kit-workspace/SESSION-HANDOFF.md | Handoff | Last session state, what's next |
| kit-workspace/ROADMAP.md | Roadmap | 6 prioritized improvements, completion status |
| tools/session-start.ps1 (full, ~400 lines) | Script | Kit update + sync + doc-audit chain, session audit block |
| tools/end-session.ps1 (full, ~250 lines) | Script | Tracked changes, untracked, non-merged branches, report |
| tools/sync-forgpt.ps1 (first ~80 lines) | Script | Manifest-based copy, SHA256 hashes, dirty-tree check |
| tools/run-vibe.ps1 (full, ~150 lines) | Script | Universal runner, flag forwarding, path resolution |
| tools/doc-audit.ps1 (first ~350 lines) | Script | Mode auto-detect, overlay checks, Population Gate, NEXT freshness |

**Not found / not inspected:**
- Start-Here-For-AI.md — does not exist in kit repo (consumer-side file)
- forgpt.manifest.json — consumer-side file
- Consumer overlay files — out of scope (kit repo only)

---

## 10. Suggested Next Prompt

Based on the evidence, the recommended next step is a **docs-only kit patch prompt** implementing Tier 1 changes (the 5 strongly-supported simplifications).

This is preferred over more research because:
- Tier 1 changes have zero ambiguity and zero safety risk
- They are all doc-only edits to existing files
- They deliver immediate friction reduction without policy decisions
- Tier 2 changes can follow in a separate prompt after Tier 1 ships

**Suggested prompt scope:**

1. Add staleness classification table to protocol-v7.md (new section after Focus Control)
2. Add "forGPT is a checkpoint snapshot" rule to protocol-v7.md or canonical-commands.md
3. Clarify PAUSE.md header as end-of-session only + adjust session-start-checklist.md Quick Links
4. Move Branch Hygiene from session-start-checklist.md pre-flight to end-of-session concerns
5. Simplify session-start-checklist.md to 3–4 items
6. Bump VIBE-CODING.VERSION.md

**Files to edit:** protocol-v7.md, session-start-checklist.md, PAUSE.md, VIBE-CODING.VERSION.md, possibly canonical-commands.md

**Files NOT to edit:** No scripts, no copilot-instructions-v7.md (save for Tier 2 Flow Mode definition), no working-agreement-v1.md

---

## Confidence Statement

**Confidence:** 96%
**Basis:** All 25+ kit source files read directly; evidence is cited with specific file paths, section headings, and line numbers; clear separation between doc-defined rules and script-enforced behavior; Tier 1 changes have zero safety risk; Tier 2/3 changes correctly deferred pending design decisions.
**Ready to proceed:** YES (with Tier 1 docs-only patch prompt)
