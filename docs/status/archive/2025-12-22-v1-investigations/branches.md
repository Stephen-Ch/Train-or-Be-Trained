# Branch Strategy — Rawls Game

## Active Branches

| Branch | Status | Purpose | Owner | Next Action |
|--------|--------|---------|-------|-------------|
| `main` | 🟢 STABLE | Production-ready code | — | — |

**Note**: v7 docs migration complete on main (2025-12-21).

## Merged Branches

| Branch | Merged Date | Purpose |
|--------|-------------|---------|
| `docs/rawls-proto-port-v7` | 2025-12-21 | Docs migration to v7 structure |

## Branch Naming Convention
- `docs/*` — Documentation-only changes
- `feat/*` — New features
- `fix/*` — Bug fixes
- `refactor/*` — Code restructuring (no behavior change)
- `chore/*` — Build, config, or tooling changes

## Merge Checklist
Before merging any branch to main:
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] All files in scope verified
- [ ] Completion report written

## Parked Branches
*(Branches that reached GREEN but were not merged immediately)*

| Branch | Parked Date | Reason | Resume Prompt ID |
|--------|-------------|--------|------------------|
| — | — | — | — |

---

*Last updated: 2025-12-21 (RAWLS-PROTO-PORT-001D)*
