# Stack Profile — Consumer Overlay Template

> **File Version:** 2026-02-26

## Purpose

Declares the consumer repo's technology stack, standard commands, and environment constraints. Gates and templates read this overlay instead of hardcoding stack-specific commands.

## Overlay Review Gate

Before accepting this overlay into the consumer repo:

- Best next step? YES
- Confidence: 95

## Instructions

Copy into consumer repo at `<DOCS_ROOT>/overlays/stack-profile.md` and edit there.  
Do NOT edit this template inside the kit head — it will be overwritten on subtree pull.

---

## Standard Commands

| Action | Command | Notes |
|--------|---------|-------|
| Install dependencies | `npm install` | package-lock.json present |
| Build | `npm run build` | runs `ng build` (prebuild: content-build.js) |
| Test | `npm run test` | runs `ng test --watch=false --browsers=ChromeHeadless` |
| Start (dev) | `npm start` | runs `ng serve` (default port 4200) |
| Lint | N/A | No lint script defined in package.json |
| Content lint | `npm run content:lint` | runs `node scripts/content-lint.js` |
| E2E | `npm run e2e` | runs `playwright test` |

## Environment Constraints

| Constraint | Value |
|------------|-------|
| OS | Windows (primary dev environment) |
| Shell minimum | PowerShell 5.1 |
| Runtime | Node.js (version per .nvmrc or engine field if present) |
| Secrets path | None (client-side SPA, no server secrets) |

## Tech Stack Summary

- **Framework:** Angular ^20.3.0
- **Language:** TypeScript ~5.9.2
- **CSS:** Tailwind CSS ^3.4.0 + SCSS
- **Testing:** Karma + Jasmine (unit), Playwright (E2E)
- **Database:** None (client-side SPA)
- **Real-time:** None
- **CI:** None configured (local test-commit-push)
