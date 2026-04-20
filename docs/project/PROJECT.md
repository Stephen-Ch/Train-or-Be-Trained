---
version: v2025.12.28
project: Rawls Game
date: 2025-12-28
---

# Project Brief — Rawls Game

## Vision
Interactive “veil of ignorance” exercise. Players choose among seven Ideals (Liberty, Equality, Community, Prosperity, Security, Fairness, Sustainability), answer Likert-scale Positions plus optional Challenges, and receive a persona profile with guidance for next steps.

## Current Release Snapshot
- Stack: Angular 20 (standalone, zoneless) + Tailwind; Angular Service Worker for PWA shell.
- Content: Authored in `content/categories/*.json`, exported to `src/assets/content/rawls-values.generated.json`.
- Gameplay routes: `/` intro → `/select` category picker → `/q/:id` question flow (QuestionV2) → `/review` summary → `/result` persona guard → `/store` donation upsell.
- Admin tooling: `/admin/content` explorer + `npm run admin:apply-patch` pipeline enforce deterministic edits.

## MVP (Complete)
1. **Content breadth:** 7 categories × 4 positions each, pilot challenges on liberty/equality/community/prosperity.
2. **Gameplay:** Likert 1–5 radio inputs, optional deeper dives, review page summarizing answers, result persona with social hooks (copy present; sharing service stubbed).
3. **Offline-ready:** Angular PWA + manifest + caching (needs polish per TD-RAWLS-006).
4. **Tests:** 170/171 Karma specs pass; Playwright smoke spec scaffolded but blocked by OS sandbox (TD-RAWLS-001).

## Next Milestones
- **V1.3:** Adaptive challenge triggers (TD-RAWLS-011), admin category reorder UX (FW-ADMIN-002C), richer persona messaging (FW-RESULTS-001).
- **V1.4:** Social sharing integration (FW-RAWLS-003), PWA polish (FW-RAWLS-004), terminology cleanup (TD-RAWLS-008 follow-ups).
- **Experimental:** Persona variance detection + alternative content packs once adaptive framework lands.

## Constraints & Guardrails
- Prompt-only workflow: follow vibe-c protocol (Command Lock → Gate → Proof-of-Read).
- Root template remains `<router-outlet></router-outlet>`; no layout wrappers here.
- Zoneless app: never reintroduce Zone.js outside `src/test.ts`.
- Feature additions require docs + status updates (Start-Here, solution reports, tech-debt table).
- Max 2 files + ~50 LOC per prompt unless the operator explicitly expands scope.
- No new dependencies, polyfills, or external services without operator approval + documented rationale.

## Success Metrics
- Players complete the multi-category flow without navigation blockers (tracked via session store telemetry in future release).
- Persona output references all answered categories and invites sharing (share card service finishing planned in FW-RAWLS-003).
- Content edits go through Admin patch pipeline with shape-proof + contract tests staying green.

See `docs/status/tech-debt-and-future-work.md` for ranked backlog details.
