# Merge Commands — Consumer Overlay Template

> **File Version:** 2026-02-26

## Purpose

Defines the exact Build Gate and Test Gate commands for this repo's merge workflow. The merge prompt template reads these commands instead of hardcoding stack-specific invocations.

## Overlay Review Gate

Before accepting this overlay into the consumer repo:

- Best next step? YES
- Confidence: 95

## Instructions

Copy into consumer repo at `<DOCS_ROOT>/overlays/merge-commands.md` and edit there.  
Do NOT edit this template inside the kit head — it will be overwritten on subtree pull.

---

## Test Gate

Run before merge and again after merge on main:

```
npm run test
```

Runs `ng test --watch=false --browsers=ChromeHeadless`. Must be GREEN (all tests pass). If any test fails, STOP.

## Build Gate

Run before merge and again after merge on main:

```
npm run build
```

Runs `ng build` (prebuild triggers `content-build.js`). Must be GREEN. Classify warnings as NEW or PRE-EXISTING. NEW warnings = STOP.

## Additional Gates (optional)

Content lint (run when content JSON changes):

```
npm run content:lint
```
