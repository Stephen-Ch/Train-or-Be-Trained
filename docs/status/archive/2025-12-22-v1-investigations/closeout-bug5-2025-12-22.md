# Closeout Report — Bug #5 (followupsGuard Regex)

**Date**: 2025-12-22  
**Prompt ID**: DC-CLOSEOUT-BUG5-001  
**Branch**: main  
**Commits**: `f30eac9`, `a8fe27e`

---

## Summary

Fixed the `followupsGuard` which was blocking navigation to the followups phase. The guard used a regex expecting IDs like `A1-f1`, but actual content uses `liberty-q0` format. The regex never matched, causing silent redirects back to TLQs.

---

## Artifact Verification

| Artifact | Expected Location | Verified On Main | Key String/Check |
|----------|-------------------|------------------|------------------|
| Guard fix | `src/app/features/followups.guard.ts` | ✅ | `optionIds.add(followUp.id)` |
| Test fixture update | `src/app/features/followups.guard.spec.ts` | ✅ | `'A-q0'` format |
| Postmortem update | `docs/status/postmortem-2025-12-21.md` | ✅ | `#5 Guard regex` in status table |
| Tech debt update | `docs/status/tech-debt-and-future-work.md` | ✅ | `TD-RAWLS-002` marked FIXED |
| Solution report update | `docs/status/solution-report.md` | ✅ | `BUG-5-FOLLOWUPS-GUARD-REGEX-FIX` |

---

## What Changed

| File | Purpose |
|------|---------|
| `src/app/features/followups.guard.ts` | Use `followUp.id` directly as TLQ identifier instead of regex extraction |
| `src/app/features/followups.guard.spec.ts` | Update fixtures from `A1-f1` to `A-q0` format to match production content |
| `docs/status/postmortem-2025-12-21.md` | Updated status table, added Bug #5, updated conclusion |
| `docs/status/tech-debt-and-future-work.md` | Marked TD-RAWLS-002 as FIXED, added TD-RAWLS-009 lesson |
| `docs/status/solution-report.md` | Added Bug #5 entry with root cause and lessons |

---

## Tests Run

| Command | Result |
|---------|--------|
| `npm run test` | **93 SUCCESS** (1 skipped) |
| `npm run build` | **SUCCESS** — 261.62 kB bundle |

---

## Git State

| Check | Result |
|-------|--------|
| `git branch --show-current` | `main` |
| `git status --porcelain` | (empty — clean) |
| `git log -3 --oneline --decorate` | `a8fe27e (HEAD -> main, origin/main)` |
| `git push origin main` | `3cd256b..a8fe27e main -> main` ✅ |

---

## Manual Verification Checklist

To verify the fix in browser:

1. Start dev server: `npm start` (runs on http://localhost:4200)
2. Navigate to `/select`
3. Select **Liberty** (or any category)
4. Click **Continue** → land on TLQ phase
5. Answer all 4 TLQs (select any Likert value for each)
6. Click **Continue** → **Expected**: Navigate to followups phase with unselected radio buttons

**Success criteria**: Followups phase renders, radios are unselected, Continue is disabled until you answer.

---

## Root Cause

The `followupsGuard` used regex `^([A-Z]\d+)-` to extract TLQ IDs from followUp IDs:
- **Expected format**: `A1-f1` → extract `A1`
- **Actual content format**: `liberty-q0` → regex never matches

Since the regex never matched, `optionIds` was always empty, the guard returned `false`, and navigation was silently blocked.

---

## Risks / Notes

1. **Silent failure risk**: The guard returned `router.parseUrl()` with no logging, making the failure invisible
2. **Test fixture mismatch**: Unit tests passed because fixtures matched the broken code, not production data

---

## Key Lesson Learned

> **Test fixtures must match production data formats.**
> 
> The guard test used `A1-f1` style IDs which matched the broken regex. Tests passed while the code was fundamentally broken against real content. Always validate test fixtures against actual production data schemas.

---

## Next Recommended Follow-Up

**TD-RAWLS-009**: Add a production-content contract/integration test that:
- Loads actual `rawls-values.generated.json`
- Exercises the `followupsGuard` against real category and followUp IDs
- Fails if ID formats change unexpectedly

*Not implemented in this prompt — scope limited to closeout.*

---

*Generated: 2025-12-22*  
*Author: GitHub Copilot*
