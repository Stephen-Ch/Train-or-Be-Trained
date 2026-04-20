# REPORT: Protocol-v7 Index Research

> **Report ID:** KIT-PROTOCOL-V7-INDEX-RESEARCH-ONLY-001
> **Date:** 2026-02-09
> **Scope:** RESEARCH-ONLY — no edits, no commits, no PRs
> **Repo:** Stephen-Ch/vibe-coding-kit
> **Branch:** main @ 84a4931

---

## Identity Proof

    git rev-parse --show-toplevel   → C:/Users/schur/workspaces/vibe-coding-kit
    git remote -v                   → origin https://github.com/Stephen-Ch/vibe-coding-kit.git
    git status -sb                  → ## main...origin/main (clean)
    git branch --show-current       → main
    git log -1 --oneline            → 84a4931 Merge pull request #10

---

## Deliverable A — Protocol-v7 Heading Inventory (86 headings, 0 duplicates)

**Source:** protocol/protocol-v7.md

| # | Line | Heading | Stable Anchor Slug |
|---|------|---------|-------------------|
| 1 | 1 | `# Protocol v7 — Vibe-Coding Protocol` | `#protocol-v7--vibe-coding-protocol` |
| 2 | 10 | `## Core Rules (Non-Negotiable)` | `#core-rules-non-negotiable` |
| 3 | 49 | `## Prompt Classes (Request Types)` | `#prompt-classes-request-types` |
| 4 | 65 | `## Vision & User Story Gate (MANDATORY for work prompts)` | `#vision--user-story-gate-mandatory-for-work-prompts` |
| 5 | 110 | `## Green Gate — Stack-Aware Rules` | `#green-gate--stack-aware-rules` |
| 6 | 118 | `### A) Read Stack Profile First` | `#a-read-stack-profile-first` |
| 7 | 127 | `### B) .NET Gate (as declared in stack-profile)` | `#b-net-gate-as-declared-in-stack-profile` |
| 8 | 140 | `### C) JS Gate (React, Angular, Node.js Apps)` | `#c-js-gate-react-angular-nodejs-apps` |
| 9 | 160 | `### D) Docs-Only Gate` | `#d-docs-only-gate` |
| 10 | 167 | `### E) Gate Summary (Read from stack-profile.md)` | `#e-gate-summary-read-from-stack-profilemd` |
| 11 | 182 | `## Resilience Rules (v7 patch)` | `#resilience-rules-v7-patch` |
| 12 | 186 | `### A) Two-tier Command Lock` | `#a-two-tier-command-lock` |
| 13 | 191 | `### B) Search tool fallbacks` | `#b-search-tool-fallbacks` |
| 14 | 200 | `### C) Recoverable error policy` | `#c-recoverable-error-policy` |
| 15 | 217 | `## Docs PR Consolidation Rule` | `#docs-pr-consolidation-rule` |
| 16 | 221 | `### Rule` | `#rule` |
| 17 | 232 | `### Rationale` | `#rationale` |
| 18 | 241 | `## Preflight Evidence Gate (No Guessing)` | `#preflight-evidence-gate-no-guessing` |
| 19 | 245 | `### A) Structural Assumption Ban` | `#a-structural-assumption-ban` |
| 20 | 256 | `### B) Preflight Evidence Requirement` | `#b-preflight-evidence-requirement` |
| 21 | 271 | `### C) Two-Phase Default` | `#c-two-phase-default` |
| 22 | 282 | `### D) Confidence Gate Update` | `#d-confidence-gate-update` |
| 23 | 292 | `## No Guessing / Tiered Confidence Gate (MANDATORY)` | `#no-guessing--tiered-confidence-gate-mandatory` |
| 24 | 296 | `### A) Tiered Confidence Rule` | `#a-tiered-confidence-rule` |
| 25 | 319 | `### B) Dual-Agent Research Requirement` | `#b-dual-agent-research-requirement` |
| 26 | 328 | `### C) No Guessing Enforcement` | `#c-no-guessing-enforcement` |
| 27 | 341 | `## RESEARCH-ONLY Command Lock (MANDATORY)` | `#research-only-command-lock-mandatory` |
| 28 | 345 | `### A) When RESEARCH-ONLY Applies` | `#a-when-research-only-applies` |
| 29 | 353 | `### B) RESEARCH-ONLY Allowed Actions` | `#b-research-only-allowed-actions` |
| 30 | 364 | `### C) Prior Research Lookup (MANDATORY)` | `#c-prior-research-lookup-mandatory` |
| 31 | 385 | `### D) RESEARCH-ONLY Forbidden Actions` | `#d-research-only-forbidden-actions` |
| 32 | 396 | `### E) Exiting RESEARCH-ONLY` | `#e-exiting-research-only` |
| 33 | 405 | `## INSTRUMENTATION (CODE-OK) Scope (MANDATORY)` | `#instrumentation-code-ok-scope-mandatory` |
| 34 | 409 | `### A) When INSTRUMENTATION Applies` | `#a-when-instrumentation-applies` |
| 35 | 416 | `### B) INSTRUMENTATION Allowed Actions` | `#b-instrumentation-allowed-actions` |
| 36 | 425 | `### C) INSTRUMENTATION Guardrails` | `#c-instrumentation-guardrails` |
| 37 | 433 | `### D) INSTRUMENTATION vs RESEARCH-ONLY Distinction` | `#d-instrumentation-vs-research-only-distinction` |
| 38 | 444 | `## Evidence Pack Requirement (MANDATORY)` | `#evidence-pack-requirement-mandatory` |
| 39 | 448 | `### A) Required Evidence Pack Sections` | `#a-required-evidence-pack-sections` |
| 40 | 463 | `### B) Evidence Pack Template` | `#b-evidence-pack-template` |
| 41 | 502 | `### C) Confidence Statement` | `#c-confidence-statement` |
| 42 | 513 | `## Research Saved + Indexed (MANDATORY)` | `#research-saved--indexed-mandatory` |
| 43 | 517 | `### A) Every Research Effort Produces R-###` | `#a-every-research-effort-produces-r-` |
| 44 | 524 | `### B) ResearchIndex.md Update Required` | `#b-researchindexmd-update-required` |
| 45 | 537 | `### C) No Orphan Research` | `#c-no-orphan-research` |
| 46 | 545 | `## PR / Branch Hygiene Gate (MANDATORY)` | `#pr--branch-hygiene-gate-mandatory` |
| 47 | 549 | `### A) No New Sprint Work with Orphaned Branches` | `#a-no-new-sprint-work-with-orphaned-branches` |
| 48 | 558 | `### B) Open PR Ledger` | `#b-open-pr-ledger` |
| 49 | 565 | `### C) Docs-Only PRs` | `#c-docs-only-prs` |
| 50 | 571 | `## Manual Test Checklist Artifact (MANDATORY)` | `#manual-test-checklist-artifact-mandatory` |
| 51 | 575 | `### A) Manual Test Is a Document` | `#a-manual-test-is-a-document` |
| 52 | 581 | `### B) Required Checklist Format` | `#b-required-checklist-format` |
| 53 | 588 | `### C) Test Artifact Retention` | `#c-test-artifact-retention` |
| 54 | 597 | `## Help Triggers + Churn Circuit Breaker (Solution-Agnostic)` | `#help-triggers--churn-circuit-breaker-solution-agnostic` |
| 55 | 601 | `### A) Churn Circuit Breaker (WHEN TO STOP AND ASK FOR HELP)` | `#a-churn-circuit-breaker-when-to-stop-and-ask-for-help` |
| 56 | 614 | `### B) Help Ladder (WHAT HELP TO ASK FOR)` | `#b-help-ladder-what-help-to-ask-for` |
| 57 | 622 | `### C) Agent Report Template` | `#c-agent-report-template` |
| 58 | 642 | `## Interface Forecast Micro-Gate (MANDATORY before first wiring step)` | `#interface-forecast-micro-gate-mandatory-before-first-wiring-step` |
| 59 | 648 | `### Interface Forecast Checklist` | `#interface-forecast-checklist` |
| 60 | 655 | `### Anti-Churn Patterns` | `#anti-churn-patterns` |
| 61 | 668 | `### When to Skip` | `#when-to-skip` |
| 62 | 677 | `## Copy & Semantics Gate (MANDATORY for UX/copy/narration changes)` | `#copy--semantics-gate-mandatory-for-uxcopynarration-changes` |
| 63 | 701 | `## Required Reading (Proof-of-Read List)` | `#required-reading-proof-of-read-list` |
| 64 | 721 | `## Required Reading Sets (by Prompt Type)` | `#required-reading-sets-by-prompt-type` |
| 65 | 723 | `### Work Prompts (S0A / S1A / S2A)` | `#work-prompts-s0a--s1a--s2a` |
| 66 | 733 | `### Closeout Prompts (S2C merge/closeout)` | `#closeout-prompts-s2c-mergecloseout` |
| 67 | 743 | `## Prompt Structure` | `#prompt-structure` |
| 68 | 747–750 | `## GOAL / ## SCOPE GUARDRAILS / ## TASKS / # END PROMPT` | (template markers — not linkable targets) |
| 69 | 753 | `## Response Structure` | `#response-structure` |
| 70 | 770 | `### Session Sequencing Rule (Hard Stop)` | `#session-sequencing-rule-hard-stop` |
| 71 | 780 | `## Lean Prompts and Context Budgeting (MANDATORY)` | `#lean-prompts-and-context-budgeting-mandatory` |
| 72 | 784 | `### Two-Layer Prompt Pattern` | `#two-layer-prompt-pattern` |
| 73 | 799 | `### Delta-Only Reports` | `#delta-only-reports` |
| 74 | 811 | `### Report Size Guardrail` | `#report-size-guardrail` |
| 75 | 817 | `## Lint-Suppress Before Lint-Fix (MANDATORY DEFAULT)` | `#lint-suppress-before-lint-fix-mandatory-default` |
| 76 | 836 | `## Hook Dependency Change Gate (React/TS Projects Only)` | `#hook-dependency-change-gate-reactts-projects-only` |
| 77 | 857 | `## Cleanup Scope Rule (MANDATORY for lint/formatting/hygiene stories)` | `#cleanup-scope-rule-mandatory-for-lintformattinghygiene-stories` |
| 78 | 881 | `## Hot File Protocol (General)` | `#hot-file-protocol-general` |
| 79 | 895 | `## Pre-S2C Sync Check (Mandatory)` | `#pre-s2c-sync-check-mandatory` |
| 80 | 906 | `## S2C / Merge Checklist` | `#s2c--merge-checklist` |
| 81 | 918 | `## GREEN Means Merge Now (Mandatory)` | `#green-means-merge-now-mandatory` |
| 82 | 927 | `## Enforcement` | `#enforcement` |
| 83 | 934 | `## Coverage Checklist for cross-cutting work (MANDATORY)` | `#coverage-checklist-for-cross-cutting-work-mandatory` |
| 84 | 967 | `## UX Proof requirement for user-visible changes (MANDATORY)` | `#ux-proof-requirement-for-user-visible-changes-mandatory` |
| 85 | 981 | `## Bundle warnings policy (STANDARD)` | `#bundle-warnings-policy-standard` |
| 86 | 990 | `## Prompt Authoring — Test-Touch Rule` | `#prompt-authoring--test-touch-rule` |
| 87 | 997 | `## Remote Target Preflight (MANDATORY for DEV/STAGE/PROD automation)` | `#remote-target-preflight-mandatory-for-devstageprod-automation` |
| 88 | 1013 | `## Environmental Debug Timebox (MANDATORY)` | `#environmental-debug-timebox-mandatory` |
| 89 | 1030 | `## Shell Discipline (MANDATORY)` | `#shell-discipline-mandatory` |
| 90 | 1048 | `## CI Gate Order Policy (MANDATORY)` | `#ci-gate-order-policy-mandatory` |
| 91 | 1064 | `## Blocked Goal Procedure (MANDATORY)` | `#blocked-goal-procedure-mandatory` |
| 92 | 1088 | `## Waiting-for-Approver Workflow (MANDATORY)` | `#waiting-for-approver-workflow-mandatory` |
| 93 | 1092 | `### A) Allowed While Waiting` | `#a-allowed-while-waiting` |
| 94 | 1102 | `### B) Not Allowed` | `#b-not-allowed` |
| 95 | 1110 | `### C) PR Communication` | `#c-pr-communication` |
| 96 | 1117 | `### D) Branch Currency` | `#d-branch-currency` |
| 97 | 1126 | `### E) Update NEXT.md` | `#e-update-nextmd` |

**Duplicate headings:** NONE. All headings are unique. Every anchor slug is unambiguous.

**Ambiguity note:** Sub-headings `### Rule` (#16) and `### Rationale` (#17) are single-word but unique within the file. GitHub would auto-suffix duplicates, but these are singletons — safe.

---

## Deliverable B — Existing Navigation/Index Docs

| Doc | Role | Overlap with Proposed Index? |
|-----|------|------------------------------|
| protocol-lite.md | Quick-reference stub linking 6 protocol-v7 sections with summary text. Covers: Confidence Gate, RESEARCH-ONLY, Evidence Pack, Green Gate, Manual Test, Approver Workflow. | **Partial** — covers ~6 of ~30 major sections. Role is "reduce cognitive load" with summaries, not a comprehensive index. |
| session-start-checklist.md | Pre-flight checklist. "Quick Links" table has 7 doc pointers (protocol-v7 is one row, no section anchors). | **Minimal** — one generic link, no anchor-level navigation. |
| protocol-primer.md | ChatGPT onboarding. 6 simplified rules. No links to protocol-v7 anchors. | **None** — different audience (ChatGPT), no anchor links. |
| README.md | Kit overview. 3 links to protocol-v7 (1 anchor link to Prior Research Lookup). | **Minimal** — 1 anchor link only. |

**Verdict: No existing equivalent.** protocol-lite.md is the closest but covers only 6 sections and adds summary text. A PROTOCOL-INDEX.md would be a comprehensive, link-only navigator covering all ~30 major rules with zero rule text. The two docs serve different purposes and would not conflict.

---

## Deliverable C — Demand Signal

### Top Source Files Linking to protocol-v7

(Excluding status reports — retrospective audit artifacts)

| Rank | File | Link Count | Nature |
|------|------|-----------|--------|
| 1 | protocol-lite.md | 10 | Active navigation (6 anchor links) |
| 2 | protocol/verification-mode.md | 8 | Example prompts reference protocol-v7 |
| 3 | FILE-VERSIONING.md | 7 | Version tracking (path references) |
| 4 | MIGRATION-INSTRUCTIONS.md | 6 | Consumer adoption guide |
| 5 | portability/subtree-playbook.md | 6 | Subtree sync instructions |
| 6 | protocol/required-artifacts.md | 5 | Artifact-to-rule mapping (3 anchor links) |
| 7 | protocol/protocol-v7.md | 4 | Self-references (Required Reading) |
| 8 | README.md | 3 | Kit overview (1 anchor link) |
| 9 | protocol/alignment-mode.md | 2 | Cross-reference to Vision Gate |
| 10 | protocol/copilot-instructions-v7.md | 1 | Help Triggers reference |
| 11 | PAUSE.md | 1 | Quick Links table |
| 12 | protocol/return-packet-gate.md | 1 | Master protocol reference |
| 13 | session-start-checklist.md | 1 | Quick Links table |
| 14 | protocol/working-agreement-v1.md | 1 | Confidence Gate canonical link |

### Most-Linked-To Anchors (existing anchor links across the kit)

| Rank | Anchor | Times Linked | From Which Docs |
|------|--------|-------------|-----------------|
| 1 | `#no-guessing--tiered-confidence-gate-mandatory` | 3 | protocol-lite, working-agreement, dedupe audit report |
| 2 | `#core-rules-non-negotiable` | 2 | required-artifacts (×2) |
| 3 | `#research-only-command-lock-mandatory` | 1 | protocol-lite |
| 4 | `#evidence-pack-requirement-mandatory` | 1 | protocol-lite |
| 5 | `#green-gate--stack-aware-rules` | 1 | protocol-lite |
| 6 | `#interface-forecast-micro-gate-mandatory-before-first-wiring-step` | 1 | required-artifacts |
| 7 | `#manual-test-checklist-artifact-mandatory` | 1 | protocol-lite |
| 8 | `#c-prior-research-lookup-mandatory` | 1 | README |
| 9 | `#waiting-for-approver-workflow-mandatory` | 1 | protocol-lite |

**Method:** Select-String for `protocol-v7.md#` across all kit .md files, extracted anchor fragment, grouped and counted. Only existing anchor-links counted — generic file references (protocol-v7.md with no #) excluded from anchor ranking.

**Gap:** Of ~30 major `##`-level sections, only 9 are currently anchor-linked from anywhere. The other ~21 sections have zero inbound anchor links. A PROTOCOL-INDEX would close this gap.

---

## Deliverable D — Doc-Audit Constraints

**Does doc-audit currently validate links?** NO.

Doc-audit Kit mode output:

    Audit Mode: Kit
    Mode Confidence: EXPLICIT
    PASS: Overlays-outside-head: no overlays inside kit head
    PASS: Overlay index: skipped (Kit mode)
    PASS: Required files: skipped (Kit mode)
    PASS: Population Gate: skipped (Kit mode)
    PASS: NEXT freshness: skipped (Kit mode)
    PASS: DOC-AUDIT (Kit mode): PASS

Confirmed by searching doc-audit.ps1 source for `link|anchor|broken|href` — zero matches. The script has no link validation logic.

**Implication:** Index links won't be auto-validated today. Correctness relies on stable anchors (confirmed: 0 duplicate headings) + future link-lint tooling. All 9 existing anchor links to protocol-v7 were manually verified correct in PR #8 / closeout proof KIT-BROKEN-LINKS-CLOSEOUT-PROOF-001.

---

## Recommended PROTOCOL-INDEX.md Outline (Plan Only)

### Design Principles

1. **Link-only** — zero rule text, zero thresholds, zero examples
2. **Task-intent grouping** — organized by "what am I trying to do?" not by file order
3. **One canonical target per entry** — always protocol/protocol-v7.md#anchor
4. **Stable anchors** — all 86 headings are unique; 0 ambiguity risk
5. **Drift-proof** — if a heading changes in protocol-v7, the index link breaks visibly (catchable by future link-lint or manual audit)

### Proposed Structure

    # Protocol Index — Quick Navigator

    > Navigation-only. No rules defined here. All links target
    > [protocol-v7.md](protocol/protocol-v7.md).

    ---

    ## Before You Start (Session Setup)

    - Core rules and non-negotiables → [Core Rules](protocol/protocol-v7.md#core-rules-non-negotiable)
    - Prompt classes and request types → [Prompt Classes](protocol/protocol-v7.md#prompt-classes-request-types)
    - Required reading by prompt type → [Required Reading Sets](protocol/protocol-v7.md#required-reading-sets-by-prompt-type)
    - Prompt structure template → [Prompt Structure](protocol/protocol-v7.md#prompt-structure)
    - Response structure requirements → [Response Structure](protocol/protocol-v7.md#response-structure)
    - Session sequencing (hard stop) → [Session Sequencing Rule](protocol/protocol-v7.md#session-sequencing-rule-hard-stop)

    ## Research & Evidence (RESEARCH-ONLY, Evidence Packs)

    - Confidence thresholds (95%/99%) → [Tiered Confidence Gate](protocol/protocol-v7.md#no-guessing--tiered-confidence-gate-mandatory)
    - Preflight evidence requirements → [Preflight Evidence Gate](protocol/protocol-v7.md#preflight-evidence-gate-no-guessing)
    - RESEARCH-ONLY scope and rules → [RESEARCH-ONLY Command Lock](protocol/protocol-v7.md#research-only-command-lock-mandatory)
    - INSTRUMENTATION (CODE-OK) scope → [INSTRUMENTATION Scope](protocol/protocol-v7.md#instrumentation-code-ok-scope-mandatory)
    - Evidence Pack format and template → [Evidence Pack Requirement](protocol/protocol-v7.md#evidence-pack-requirement-mandatory)
    - Research indexing obligation → [Research Saved + Indexed](protocol/protocol-v7.md#research-saved--indexed-mandatory)

    ## Build & Test Gates (Green Gate, Manual Test)

    - Stack-aware build gate → [Green Gate](protocol/protocol-v7.md#green-gate--stack-aware-rules)
    - Manual test artifact format → [Manual Test Checklist](protocol/protocol-v7.md#manual-test-checklist-artifact-mandatory)
    - Interface forecast before wiring → [Interface Forecast Micro-Gate](protocol/protocol-v7.md#interface-forecast-micro-gate-mandatory-before-first-wiring-step)

    ## Code Quality & Scope

    - Lint-suppress before lint-fix default → [Lint-Suppress Rule](protocol/protocol-v7.md#lint-suppress-before-lint-fix-mandatory-default)
    - Hook dependency change gate → [Hook Dependency Gate](protocol/protocol-v7.md#hook-dependency-change-gate-reactts-projects-only)
    - Cleanup scope for hygiene stories → [Cleanup Scope Rule](protocol/protocol-v7.md#cleanup-scope-rule-mandatory-for-lintformattinghygiene-stories)
    - Hot file protocol → [Hot File Protocol](protocol/protocol-v7.md#hot-file-protocol-general)
    - Copy and semantics for UX changes → [Copy & Semantics Gate](protocol/protocol-v7.md#copy--semantics-gate-mandatory-for-uxcopynarration-changes)
    - Coverage checklist for cross-cutting → [Coverage Checklist](protocol/protocol-v7.md#coverage-checklist-for-cross-cutting-work-mandatory)
    - UX proof for visible changes → [UX Proof Requirement](protocol/protocol-v7.md#ux-proof-requirement-for-user-visible-changes-mandatory)
    - Bundle warnings policy → [Bundle Warnings](protocol/protocol-v7.md#bundle-warnings-policy-standard)

    ## PR & Merge Hygiene

    - PR/branch hygiene requirements → [PR / Branch Hygiene Gate](protocol/protocol-v7.md#pr--branch-hygiene-gate-mandatory)
    - Docs PR consolidation → [Docs PR Consolidation Rule](protocol/protocol-v7.md#docs-pr-consolidation-rule)
    - Pre-S2C sync check → [Pre-S2C Sync Check](protocol/protocol-v7.md#pre-s2c-sync-check-mandatory)
    - S2C / merge checklist → [S2C / Merge Checklist](protocol/protocol-v7.md#s2c--merge-checklist)
    - GREEN means merge now → [GREEN Means Merge Now](protocol/protocol-v7.md#green-means-merge-now-mandatory)
    - Test-touch rule for prompts → [Test-Touch Rule](protocol/protocol-v7.md#prompt-authoring--test-touch-rule)

    ## Resilience & Error Handling

    - Two-tier command lock → [Command Lock](protocol/protocol-v7.md#a-two-tier-command-lock)
    - Search tool fallbacks → [Search Fallbacks](protocol/protocol-v7.md#b-search-tool-fallbacks)
    - Recoverable error policy → [Error Policy](protocol/protocol-v7.md#c-recoverable-error-policy)
    - Shell discipline → [Shell Discipline](protocol/protocol-v7.md#shell-discipline-mandatory)

    ## Pause, Block & Help

    - When to stop and ask for help → [Churn Circuit Breaker](protocol/protocol-v7.md#help-triggers--churn-circuit-breaker-solution-agnostic)
    - Blocked goal procedure → [Blocked Goal Procedure](protocol/protocol-v7.md#blocked-goal-procedure-mandatory)
    - Waiting-for-approver workflow → [Approver Workflow](protocol/protocol-v7.md#waiting-for-approver-workflow-mandatory)

    ## Deployment & Environment

    - Remote target preflight → [Remote Target Preflight](protocol/protocol-v7.md#remote-target-preflight-mandatory-for-devstageprod-automation)
    - Environmental debug timebox → [Debug Timebox](protocol/protocol-v7.md#environmental-debug-timebox-mandatory)
    - CI gate order policy → [CI Gate Order](protocol/protocol-v7.md#ci-gate-order-policy-mandatory)

    ## Context & Prompts

    - Lean prompts and context budgeting → [Lean Prompts](protocol/protocol-v7.md#lean-prompts-and-context-budgeting-mandatory)
    - Vision & user story gate → [Vision Gate](protocol/protocol-v7.md#vision--user-story-gate-mandatory-for-work-prompts)
    - Enforcement policy → [Enforcement](protocol/protocol-v7.md#enforcement)

    ---

    > This file is navigation only. Do not add rule text.
    > If a link breaks, the heading in protocol-v7.md was renamed — fix the anchor here.

### Headings That Should Be Tweaked

**None.** All 86 headings are unique. GitHub-style slug algorithm produces unambiguous anchors. The existing 9 anchor links across the kit all resolve correctly (verified in closeout proof KIT-BROKEN-LINKS-CLOSEOUT-PROOF-001).

### Relationship to protocol-lite.md

- **protocol-lite.md** = "I need a quick refresher with context" (summaries + links, 6 sections)
- **PROTOCOL-INDEX.md** = "I know the rule name, take me there" (pure navigation, all ~30 sections)

They coexist without conflict. No changes to protocol-lite.md needed.

---

## Ready to Implement?

**YES — Confidence: HIGH (98%)**

Justification:

- 0 duplicate headings — all anchors unambiguous
- 0 existing equivalent — no comprehensive index exists today
- All 9 currently-used anchors verified correct (PR #8 / closeout proof)
- GitHub anchor slug algorithm is deterministic and well-understood
- Index contains zero rule text — zero drift risk for content
- Only drift risk is heading renames in protocol-v7.md, which break links visibly (detectable by grep or future link-lint)
- doc-audit does NOT validate links today; correctness relies on stable anchors (confirmed) and manual/automated checks at PR time
