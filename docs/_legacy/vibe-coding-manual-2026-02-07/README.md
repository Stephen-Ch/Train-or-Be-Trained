# Portable Vibe-Coding Kit

The files in this directory are the **source of truth** for Rawls workflow rules, completion report requirements, and shared terminology. They are written to be portable (copy/paste ready for sister repos) and therefore avoid project-specific references beyond what is needed for examples.

## How to use this kit
1. Read [protocol/protocol-v7.md](protocol/protocol-v7.md) before acting on any prompt. It defines the gates, sequencing, and stop conditions.
2. Follow [protocol/copilot-instructions-v7.md](protocol/copilot-instructions-v7.md) while composing every completion report (coverage proof, proof-of-experience, entry-point maps, etc.).
3. Self-check against [protocol/stay-on-track.md](protocol/stay-on-track.md) whenever working on cross-cutting UX or coverage-sensitive tasks.
4. Reference [protocol/working-agreement-v1.md](protocol/working-agreement-v1.md) for operator vs AI responsibilities and commit standards.

Legacy duplicates under `docs/protocol` now contain redirect banners and exist only for backward compatibility with older prompts. Edit the vibe-coding copies instead.

## Directory map
- `protocol/` — Living workflow docs (protocol-v7, copilot instructions, stay-on-track, working agreement).
- `templates/` — Required completion-report blocks (test-touch, closeout artifact verification) shared across prompts.
- `terminology/` — Project-wide dictionary plus a template for adding new product → storage mappings.

## Contribution rules
- Keep language portable; replace Rawls-specific jargon with templates or clearly marked examples when possible.
- Note any Rawls-only adjustments (such as specific route coverage lists) inline so other repos can override them.
- When the kit evolves, update [docs/Start-Here-For-AI.md](../Start-Here-For-AI.md) and [docs/INDEX.md](../INDEX.md) so new sessions land here first.

Questions about historical behavior or superseded docs? Check `docs/archive` for prior reports, templates, and experiments.
