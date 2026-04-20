# PAUSE — Session Handoff (Template)

<!-- 
  This is a TEMPLATE for session handoff state.
  Each consuming repo should maintain its own PAUSE.md with repo-specific content.
  Do NOT commit repo-specific data (epics, PRs, branches, sprint info) to the shared kit.
-->

> **Authority scope:** PAUSE.md is an **end-of-session / stop-work** artifact only.
> A blank or template-state PAUSE.md during active work is **normal and expected** —
> it does not indicate a process failure. Populate this file only when truly
> stopping work (session close, extended break, handoff to another agent).
> During active implementation, **NEXT.md** is the live work-state authority.

> **Date:** YYYY-MM-DD _(update on every pause and review — Staleness Expiry freshness timestamp)_  
> **Status:** PAUSED — (reason)  
> **Next session:** Resume from this doc

---

## Current State

| Item | Value |
|------|-------|
| **Active Epic** | _(your epic)_ |
| **Active Sprint** | _(your sprint)_ |
| **Branch** | _(your branch)_ |
| **Blocking Issue** | _(if any)_ |
| **Remote Reality** | PASS / WARN / BLOCKED — _(evidence date and summary)_ |
| **Workspace Reality** | PASS / WARN / BLOCKED — _(worktrees, stashes, unmerged branches, untracked clusters)_ |

---

## Open PRs Awaiting Approval

| PR | Title | Status |
|----|-------|--------|
| #_ | _(title)_ | _(status)_ |

## Active Branch Classification

| Branch | Status | PR # | Notes |
|--------|--------|------|-------|
| _(branch)_ | ACTIVE / PR OPEN / PARKED / MERGED / OBSOLETE | _(#nn or none)_ | _(last commit date, next action)_ |

## Decision Queue

> **Mandatory for any item classified DECISION NEEDED above.**
> Each entry must have all required fields. See [protocol-v7.md § Decision-Queue Gate](protocol/protocol-v7.md#decision-queue-gate-mandatory-at-session-boundaries).

| Item | Decision Owner | Why Needed | Date Added | Recorded In |
|------|---------------|------------|------------|-------------|
| _(item label)_ | _(Stephen / Agent / name)_ | _(one-sentence decision statement)_ | _(YYYY-MM-DD)_ | _(link or "this file")_ |

---

## Next Actions

1. _(action)_
2. _(action)_

---

## How to Resume (5-minute checklist)

1. [ ] Open this doc
2. [ ] **Check PAUSE.md freshness** — If the Date above is older than 7 days, review and confirm all state before relying on it. See [protocol-v7.md § Staleness Expiry Gate](protocol/protocol-v7.md#staleness-expiry-gate-mandatory-at-session-boundaries).
3. [ ] **Remote Reality Check** — `git fetch origin`, then `gh pr list --state open --json number,title,headRefName,baseRefName,url`. Verify NEXT.md and active branches match remote state. Record PASS | WARN | BLOCKED in Current State above; repair mismatches or document as debt.
4. [ ] Open [session-start-checklist.md](session-start-checklist.md) — run pre-flight
5. [ ] Confirm your active story / next step
6. [ ] Update this PAUSE.md before ending session
6. [ ] Commit any changes before closing VS Code

---

## Quick Links

| Doc | Purpose |
|-----|---------|
| [session-start-checklist.md](session-start-checklist.md) | Session pre-flight |
| [protocol-v7.md](protocol/protocol-v7.md) | Full protocol rules |
| [EVIDENCE-PACK-TEMPLATE.md](templates/EVIDENCE-PACK-TEMPLATE.md) | For <95% confidence |
| [Remote Reality Gate](protocol/protocol-v7.md#remote-reality-gate-mandatory-at-session-boundaries) | Gate definition, PASS/WARN/BLOCKED model, active branch classification |
