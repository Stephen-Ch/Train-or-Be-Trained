# Rawls Documentation Index

> **CANONICAL INDEX MOVED:** The canonical research index is now [docs/research/ResearchIndex.md](research/ResearchIndex.md). This file is preserved for backward compatibility but is no longer the primary index.

## Purpose
Use this index as the single entry point into Rawls documentation. It highlights the active source-of-truth set (the portable vibe-coding kit) and points you to historical material that now lives under `docs/archive`.

> Workflow source of truth lives in [docs/vibe-coding](docs/vibe-coding). Edit those copies first; anything under `docs/protocol` is legacy only.

## Quick start (read in order)
1. [docs/project/RAWLS-START-HERE.md](project/RAWLS-START-HERE.md) — Mandatory onboarding (gates, sequencing, upload list).
2. [docs/project/AI-WORKFLOW.md](docs/project/AI-WORKFLOW.md) — Defines the Stephen ↔ ChatGPT ↔ Copilot prompt-only collaboration loop.
3. [docs/vibe-coding/protocol/PROTOCOL-INDEX.md](docs/vibe-coding/protocol/PROTOCOL-INDEX.md) — Protocol navigational index (gates, sequencing, enforcement).
3. [docs/vibe-coding/protocol/copilot-instructions-v7.md](docs/vibe-coding/protocol/copilot-instructions-v7.md) — AI enforcement (report fields, test-touch rules, coverage requirements).
4. [docs/vibe-coding/protocol/stay-on-track.md](docs/vibe-coding/protocol/stay-on-track.md) — Self-checklist for staying inside scope and proving coverage.
5. [docs/status/solution-report.md](docs/status/solution-report.md) — Rolling log of shipped work with measurements, touched files, and command proofs.
6. [docs/status/tech-debt-and-future-work.md](docs/status/tech-debt-and-future-work.md) — Ranked backlog plus upcoming scope.

## Workflow + Protocol source of truth
- [docs/vibe-coding/protocol/PROTOCOL-INDEX.md](docs/vibe-coding/protocol/PROTOCOL-INDEX.md) — Protocol navigational index (master rulebook entry point).
- [docs/vibe-coding/protocol/copilot-instructions-v7.md](docs/vibe-coding/protocol/copilot-instructions-v7.md) — Completion report format, entry-point map requirements, and sequencing locks.
- [docs/vibe-coding/protocol/stay-on-track.md](docs/vibe-coding/protocol/stay-on-track.md) — Coverage checklist, old-pattern search expectations, and dev-server hygiene.
- [docs/vibe-coding/protocol/working-agreement-v1.md](docs/vibe-coding/protocol/working-agreement-v1.md) — Operator vs AI responsibilities and commit standards.
- [docs/project/CONTENT-RULES.md](docs/project/CONTENT-RULES.md) — Live schema + challenge status reference tied to production evidence.
- [docs/protocol/code-style.md](docs/protocol/code-style.md) — Angular + Tailwind conventions, module boundaries, and naming guardrails.
- [docs/_shared/CURRENT.md](docs/_shared/CURRENT.md) — Points to the latest frozen snapshot (v9) used for cross-repo syncs.

> Legacy copies still exist in `docs/protocol/…` for backward compatibility. They now contain redirect notices and should not be edited.

## Product status + decision logs
- [docs/status/solution-report.md](docs/status/solution-report.md) — Chronological journal of delivered work (files touched, measurements, command outputs).
- [docs/status/tech-debt-and-future-work.md](docs/status/tech-debt-and-future-work.md) — Ranked backlog with upcoming prompts and parking-lot ideas.
- [docs/gpt-reports/](docs/gpt-reports) — Deep-dive analyses (RAWLS-REPORT series) with reproduction steps and recommended guardrails.
- [docs/handoffs/](docs/handoffs) — Session-to-session context packages (upload when spinning new AI instances).

## Content, admin, and project references
- [docs/admin/admin-patch-pipeline.md](docs/admin/admin-patch-pipeline.md) — End-to-end flow for applying Admin UI export patches (dry-run vs write, regen commands).
- [docs/project/CONTENT-RULES.md](docs/project/CONTENT-RULES.md) — Canonical schema for category → position → challenge plus validation constraints.
- [docs/project/AI-SNAPSHOT.md](docs/project/AI-SNAPSHOT.md) — Architectural map (pipelines, hot files, debugging entry points).
- [docs/project/PROJECT.md](docs/project/PROJECT.md) & [docs/project/README.md](docs/project/README.md) — Product framing, goals, and stakeholder notes.
- [docs/rawls-values.en.json](docs/rawls-values.en.json) — Editable localization seed for copy reviews (generated asset lives under `src/assets`).

## Testing + closeout references
- [docs/testing/test-catalog.md](docs/testing/test-catalog.md) — Source of truth for every spec’s `@human` summary; update whenever touching specs.
- [docs/vibe-coding/templates/test-touch-block-template.md](docs/vibe-coding/templates/test-touch-block-template.md) — Required block to document catalog updates, deterministic rules, and contract tests.
- [docs/vibe-coding/templates/closeout-artifact-verification-template.md](docs/vibe-coding/templates/closeout-artifact-verification-template.md) — Checklist used for every S2C prompt (artifact verification table + gate reminders).

## Terminology + dictionary
- [docs/vibe-coding/terminology/terminology-dictionary.md](docs/vibe-coding/terminology/terminology-dictionary.md) — Living glossary that locks shared language across teams.
- [docs/vibe-coding/terminology/terminology-template.md](docs/vibe-coding/terminology/terminology-template.md) — Fill-in template for new product terms (product → storage → ID patterns).

## Archived material
- Historical reports, postmortems, and unused templates live under [docs/archive/](docs/archive). Recent moves:
	- [docs/archive/reports/2025/ai-snapshot-rawls.md](docs/archive/reports/2025/ai-snapshot-rawls.md)
	- [docs/archive/reports/2025/P-812-question-flow-report.md](docs/archive/reports/2025/P-812-question-flow-report.md)
	- [docs/archive/reports/2025/postmortem-2025-11-27.md](docs/archive/reports/2025/postmortem-2025-11-27.md)
	- [docs/archive/reports/2025/postmortem-2025-12-23-challenge-flip-flop.md](docs/archive/reports/2025/postmortem-2025-12-23-challenge-flip-flop.md)
	- [docs/archive/templates/mvp-debrief-template.md](docs/archive/templates/mvp-debrief-template.md)

Archived files should never be edited unless a prompt explicitly requests historical updates. Copy from the archive if you need examples, but keep active guidance under `docs/vibe-coding` or the directories listed above.
