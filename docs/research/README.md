# Research — Rawls Game

## What is "research"?

Research documents are completed investigations, postmortems, audits, feasibility studies, sanity checks, and analysis reports. They capture evidence-based findings and decisions.

Research is **distinct from status** — status docs track ongoing operational state (solution reports, tech debt, code reviews), while research docs are point-in-time investigations that reach conclusions.

## Naming convention

All research files follow the pattern:

    R-###-RAWLS-<Title>.md

Where `###` is a sequential number starting at 001. The RAWLS prefix identifies the repo.

## Header standard

Every research document should include the standard research header per [docs/vibe-coding/standards/research-standard.md](../vibe-coding/standards/research-standard.md).

## Index

The canonical index is [ResearchIndex.md](ResearchIndex.md) in this directory. Every research doc must be listed there.

## Archived bundles (indexed-in-place)

Some research bundles remain archived at their original locations but are indexed in ResearchIndex.md under the "Indexed-in-place" section:

- `docs/status/archive/2025-12-22-v1-investigations/` — 28 files from v1 investigation sprint
- `docs/status/archive/2025-12-25-session-cleanup/` — 4 files from session cleanup
- `docs/archive/reports/2025/` — 4 early project reports and postmortems

## Evidence files

Inventory evidence snapshots from docs audits are stored here as `REPORT-*.txt` files.
