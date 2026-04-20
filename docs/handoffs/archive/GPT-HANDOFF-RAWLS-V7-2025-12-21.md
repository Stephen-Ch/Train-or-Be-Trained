# GPT Handoff — Rawls Game v7 Docs

**Date**: 2025-12-21

---

## What Changed Recently

Protocol v7 docs have been ported from the Blackjack repo pattern. Legacy Rawls docs (WORKFLOW-V2, copilot-instructions-rawls, session-start-rawls, code-review-guide-rawls, status-2025-11-11, CHANGELOG) are now archived under `docs/archive/deprecated/`. Project docs (PROJECT, QUICKSTART, CONTRIBUTING, README, CONTENT-RULES, AI-SNAPSHOT) have been moved to `docs/project/`.

---

## Where to Start

- `docs/Start-Here-For-AI.md` — Entry point for all AI sessions
- `docs/protocol/protocol-v7.md` — Core rules (Proof-of-Read, Prompt Review Gate, Green Gate)
- `docs/protocol/copilot-instructions-v7.md` — AI-specific constraints and hot file rules

---

## Repo Map

- `docs/project/` — Project docs (PROJECT, README, AI-SNAPSHOT, CONTENT-RULES, QUICKSTART, CONTRIBUTING)
- `docs/protocol/` — Workflow rules (protocol-v7, copilot-instructions-v7, stay-on-track, working-agreement, code-style)
- `docs/status/` — Active tracking (branches, solution-report, code-review, tech-debt)
- `docs/testing/` — Test catalog
- `docs/archive/` — Deprecated docs and historical wireframes

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run test` | Karma/Jasmine headless tests |
| `npm run build` | Production build |
| `npm run content:lint` | Validate content JSON |
| `npm run content:export-app` | Rebuild `rawls-values.generated.json` |

**Content Pipeline Gate**: If you touch `content/*`, `scripts/content-*`, or `src/assets/content/rawls-values.generated.json`, run `npm run content:lint` + `npm run content:export-app` before `npm run test` + `npm run build`.

---

## Known Issues / Tech Debt

| ID | Summary |
|----|---------|
| TD-RAWLS-001 | Playwright e2e hangs (blank browser) |
| TD-RAWLS-002 | Multi-category flow still unreliable |
| TD-RAWLS-003 | `?debugIds=1` not implemented |
| TD-RAWLS-004 | Review component shows all answers |
| TD-RAWLS-005 | Share card service stubbed |
| TD-RAWLS-006 | PWA manifest incomplete |
| TD-RAWLS-007 | Deeper dives count is 0 |

---

## Next Suggested Work Mode

- **Prompt-only workflow**: Single fenced code block prompts ending with `# END PROMPT`
- **Tiny steps**: ≤ ~50 LOC, ≤ 2 files per step
- **S1A RED-lock**: Test-only prompts must produce failing tests (if tests pass, STOP)
- **S2C artifact verification**: Every merge prompt must include verification table

---

*Last updated: 2025-12-21*
