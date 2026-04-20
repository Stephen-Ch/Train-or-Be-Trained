# Kit Roadmap

> **Last Updated:** 2026-04-16
> **Kit Version:** v7.3.2

## Prioritized Improvements

| # | Item | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 1 | **Redundancy reduction** — single-source each rule, cross-link don't duplicate | Very High | Medium (2–3 prompts) | In Progress (v7.2.29–v7.2.32: Timeboxing+Pivot, External Research Escalation, STOP/PIVOT Rule single-sourced; further dedupe candidates remain) |
| 2 | **Kit-version lag WARN** — session-start compares local vs remote kit version | High | Small (1 prompt) | Done (v7.2.25) |
| 3 | **Agent comprehension self-check** — 3-question gate after Proof-of-Read | High | Small (1 prompt) | Done (v7.2.26) |
| 4 | **QUICKSTART.md** — "add vibe-coding to your repo in 5 minutes" | High | Small (1 prompt) | Done (v7.2.27) |
| 5 | **Protocol-v7.md size reduction** — extract <2KB hard-rules-only file | Medium-High | Large (3–4 prompts) | In Progress (v7.2.33: hard-rules.md added + wired; STOP index expansion deferred pending brief rewrite) |
| 6 | **Structured research-request template** — standardize GPT↔Copilot handoff | Medium | Small (1 prompt) | Done (v7.2.28) |
| 7 | **5-gate session-boundary hardening** — Consumer-Kit Drift, Staleness Expiry, Decision-Queue, Tool/Auth Fragility, Workspace Reality | Very High | Large (v7.2.43 wave) | Done (v7.2.43) |
| 8 | **Remote Reality Gate** — fetch + PR state + branch classification at session boundaries | High | Medium (1–2 prompts) | Done (v7.2.41) |
| 9 | **Mid-Session Reset** — operator confusion recovery protocol | Medium-High | Small (1 prompt) | Done (v7.3.1) |
| 10 | **Visibility Contract** — portable standard for consumer-repo project-state links | Medium | Medium (1–2 prompts) | Done (v7.3.0) |
| 11 | **NEXT.md freshness discipline** — session-start + end-of-session + Staleness Expiry Gate coverage | High | Small (2–3 prompts) | Done (v7.3.2 docs + 2026-04-16 tool enforcement) |
| 12 | **Doc Audit sequencing clarification** — resolve session-level vs per-prompt contradiction | Medium | Small (1 prompt) | Done (2026-04-16) |

## Open / Deferred

| # | Item | Notes |
|---|------|-------|
| A | **STOP index expansion** (Improvement 2 from 2026-04-16 assessment) | Brief needs rewrite — must replace existing `## STOP Conditions` in hard-rules.md, not add a duplicate section. Deferred until brief corrected. |
| B | **Further redundancy reduction** (Item 1 continuation) | Additional dedupe candidates exist but no brief written. Low urgency — worst offenders already addressed. |
| C | **Protocol-v7.md continued size reduction** (Item 5 continuation) | hard-rules.md created; further extraction possible but diminishing returns. |

## Completed Log

### v7.3.x era (2026-03 → 2026-04)

- v7.3.2: NEXT.md freshness discipline — session-start checklist, end-of-session, mid-session trigger-based review
- v7.3.2 (2026-04-16): NEXT.md added to Staleness Expiry Gate (docs + session-start.ps1 enforcement); Doc Audit sequencing paragraph clarified
- v7.3.1: Mid-Session Reset protocol (operator confusion recovery)
- v7.3.0: Visibility Contract v1 + end-session hardening (stash/branch age audit)
- v7.2.43: 5-gate session-boundary hardening wave (Consumer-Kit Drift, Staleness Expiry, Decision-Queue, Tool/Auth Fragility, Workspace Reality)
- v7.2.42: session-start auto-stash for non-subtree dirty files
- v7.2.41: Remote Reality Gate MVP
- v7.2.40: critical-transition-checklist.md added
- v7.2.38: ResearchIndex-vs-NEXT.md drift warning; session audit terminology cleanup

### v7.2.x era (2026-03-02/03 initial roadmap session)

- v7.2.37: session-start-kit added (Kit-mode session start)
- v7.2.36: kit CI workflow added (kit-gates)
- v7.2.35: Scrubbed remaining secondary leak tokens from 9 files
- v7.2.34: Scrubbed repo-specific leaks from vendor head
- v7.2.33: hard-rules.md extracted from protocol-v7.md
- v7.2.32: STOP/PIVOT Rule single-sourced in protocol-v7.md
- v7.2.31: External Research Escalation single-sourced in working-agreement-v1.md
- v7.2.29: Timeboxing+Pivot single-sourced in protocol-v7.md
- v7.2.28: Structured research-request template
- v7.2.27: QUICKSTART.md
- v7.2.26: Agent comprehension self-check
- v7.2.25: Kit-version lag WARN
- v7.2.23: External Research Escalation rule added
- v7.2.22: Removed remaining HIGH/MED/LOW remnants + Start-Here-For-AI.md filename assumptions
- v7.2.21: Session-start chain wired into enforcer docs
- v7.2.20: Primary Priorities + Response Pattern added to working-agreement
- v7.2.19: Confidence format canonicalized to `Confidence: <percentage>%`
