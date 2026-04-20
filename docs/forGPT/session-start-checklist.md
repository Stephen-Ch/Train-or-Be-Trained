# Session Start Checklist

> **Purpose:** Single-page checklist to reduce "too many places to check" friction.  
> **Usage:** Run through this before starting any work session.  
> **Quick Reference:** See [protocol-lite.md](protocol-lite.md) for core rules summary.

---

## Pre-Flight Checks (< 2 minutes)

- [ ] **RUN START OF SESSION DOCS AUDIT** — This single command chains: kit update (subtree pull) → kit version print → forGPT sync → Consumer doc-audit (hard fail) → audit print. Run it first; everything below is verified automatically (including overlay structure and required files).
- [ ] **Goal Anchor** — Write North Star, Current Slice, and Proof before any work.
- [ ] **NEXT.md Status** — Open [NEXT.md](../project/NEXT.md). Confirm Status = ACTIVE or PAUSED with clear Next Step.
- [ ] **Open PRs** — Run `gh pr list --state open` or check GitHub. Note any blocking dependencies.
- [ ] **Branch Hygiene** — Run `git branch -a --no-merged origin/develop | Select-String -NotMatch "docs/"`. If runtime branches exist without PRs, address first.
- [ ] **Blockers** — Check [tech-debt-and-future-work.md](../project/tech-debt-and-future-work.md) for known blockers.
- [ ] **Research Index** — Confirm any prior session research is indexed in [ResearchIndex.md](../research/ResearchIndex.md).

---

## If Any Check Fails

| Check | Action |
|-------|--------|
| NEXT.md unclear | Update NEXT.md before proceeding |
| PRs blocking | Note in prompt; consider docs-only work |
| Orphan branches | Open PR or document why parked |
| Unindexed research | Add to ResearchIndex.md |

---

## End of Session

- [ ] **RUN END OF SESSION** -- Run `run-vibe -Tool end-session` to check repo hygiene (path-independent; no hardcoded DOCS_ROOT needed).
- [ ] If tracked changes reported: commit or stash before closing.
- [ ] If non-merged branches listed: open PRs or clean up per repo policy.
- [ ] Optionally: add `-WriteReport` to save a status snapshot under `<DOCS_ROOT>/status/`.

---

## Quick Links

| Doc | Purpose |
|-----|---------|
| [protocol-lite.md](protocol-lite.md) | Quick reference (start here) |
| [NEXT.md](../project/NEXT.md) | Active story + next step |
| [PAUSE.md](PAUSE.md) | Handoff docs (if paused) |
| [ResearchIndex.md](../research/ResearchIndex.md) | Research catalog |
| [protocol-v7.md](protocol/protocol-v7.md) | Full protocol rules |
| [PROTOCOL-INDEX.md](protocol/PROTOCOL-INDEX.md) | Navigate protocol-v7 by task |
| [branches.md](../status/branches.md) | Branch/PR tracking |
| [tech-debt-and-future-work.md](../project/tech-debt-and-future-work.md) | Known issues |
