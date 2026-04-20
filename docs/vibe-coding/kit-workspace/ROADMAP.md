# Kit Roadmap

> **Last Updated:** 2026-03-03
> **Kit Version:** v7.2.23

## Prioritized Improvements

| # | Item | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 1 | **Redundancy reduction** — single-source each rule, cross-link don't duplicate | Very High | Medium (2–3 prompts) | In Progress (v7.2.29: Timeboxing+Pivot single-sourced in protocol-v7.md; v7.2.31: External Research Escalation single-sourced in working-agreement-v1.md; v7.2.32: STOP/PIVOT Rule single-sourced in protocol-v7.md, copilot-instructions now cross-links) |
| 2 | **Kit-version lag WARN** — session-start compares local vs remote kit version | High | Small (1 prompt) | Done (v7.2.25) |
| 3 | **Agent comprehension self-check** — 3-question gate after Proof-of-Read | High | Small (1 prompt) | Done (v7.2.26) |
| 4 | **QUICKSTART.md** — "add vibe-coding to your repo in 5 minutes" | High | Small (1 prompt) | Done (v7.2.27) |
| 5 | **Protocol-v7.md size reduction** — extract <2KB hard-rules-only file | Medium-High | Large (3–4 prompts) | In Progress (v7.2.33: Added protocol/hard-rules.md + wired links in lite/quickstart/v7/index) |
| 6 | **Structured research-request template** — standardize GPT↔Copilot handoff | Medium | Small (1 prompt) | Done (v7.2.28) |

## Recommended order

2 → 3 → 4 → 6 → 1 → 5

Quick wins first (items 2–4, 6 are 1 prompt each). Item 1 has highest systemic impact but needs careful work. Item 5 is highest risk and should wait.

## Completed (this session, 2026-03-02/03)

- v7.2.19: Confidence format canonicalized to `Confidence: <percentage>%`
- v7.2.20: Primary Priorities + Response Pattern added to working-agreement
- v7.2.21: Session-start chain wired into enforcer docs
- v7.2.22: Removed remaining HIGH/MED/LOW remnants + Start-Here-For-AI.md filename assumptions
- v7.2.23: External Research Escalation rule added

## Maintenance

- v7.2.30: Removed literal internal-planning-directory path strings from all shipped markdown to eliminate consumer doc-audit WARN noise (rule preserved; only literal substrings removed).
