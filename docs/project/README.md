---
version: v2025.12.28
project: Rawls Game
date: 2025-12-28
---

# Project Docs Index

This folder complements the vibe-coding protocol by describing Rawls-specific goals, onboarding steps, and content rules.

## Key Files
- **QUICKSTART.md** — New-machine checklist (clone, install, primary commands, required reading list).
- **PROJECT.md** — Living project brief (vision, constraints, roadmap milestones).
- **CONTRIBUTING.md** — Quick rules for coding inside the prompt-only workflow (Green Gate, content pipeline guardrails).
- **CONTENT-RULES.md** — Source JSON schema, generated artifact structure, validation workflow.
- **AI-SNAPSHOT.md** — Lightweight reference for external AI assistants (hot files, recent commits, active issues).
- For workflow enforcement, follow `docs/vibe-coding/protocol/*` (source of truth shared across repos).

Legacy assets (session-start, code-review guide, older templates) now live under `docs/archive/`. For workflow enforcement refer to `docs/vibe-coding/protocol/*` instead.

## Workflow Loop (reminder)
1. Session Boot → load Start-Here + vibe-c protocol
2. Command Lock → Prompt Review Gate → Proof-of-Read
3. Implement change (≤2 files / ≤~50 LOC unless operator expands scope)
4. Required commands (content lint/export, test, build)
5. Update docs/status when behavior or process shifts
6. Commit on green using requested message format

Stoplight shorthand: Green = commit, Yellow = minimal fix + rerun gates, Red = revert + regroup.
