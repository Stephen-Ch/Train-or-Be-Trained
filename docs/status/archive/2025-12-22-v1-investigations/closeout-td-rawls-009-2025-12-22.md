# Closeout Report: TD-RAWLS-009 — Production Content Contract Test

**Date:** 2025-12-22  
**Branch Merged:** `test/TD-RAWLS-009-prod-content-contract`  
**Merge Commit:** `ebe4d63`  
**Status:** ✅ Complete

---

## Summary

Added a production content contract test that loads the real `rawls-values.generated.json` and validates that `followupsGuard` helpers accept the actual TLQ ID format (`liberty-q0`, `equality-q1`, etc.). This prevents repeat of Bug #5, where the guard regex expected `A1-f1` format but production content used `liberty-q0`.

---

## Artifact Verification

| Artifact | Expected Location | Verified On Main | Key String/Check |
|----------|-------------------|------------------|------------------|
| Contract test | `src/app/features/followups-guard.production-content-contract.spec.ts` | ✅ | `"liberty-q0"` |
| Guard exports | `src/app/features/followups.guard.ts` | ✅ | `export function extractTlqIds` |
| tsconfig.spec.json | `tsconfig.spec.json` | ✅ | `"resolveJsonModule": true` |
| Test catalog | `docs/testing/test-catalog.md` | ✅ | `followups-guard.production-content-contract.spec.ts` |

---

## Green Gate Results

| Check | Result |
|-------|--------|
| `npm run test` | ✅ 99 SUCCESS (1 skipped) |
| `npm run build` | ✅ 261.73 kB bundle |
| `git push origin main` | ✅ `26edaf7..ebe4d63` |

---

## What the Contract Test Protects Against

1. **Format Drift:** If content IDs change format (e.g., back to `A1-f1`), the contract test fails immediately.
2. **Guard Regression:** If `extractTlqIds()` or `isTlqIdValid()` break, contract test catches it before production.
3. **Fixture/Production Mismatch:** Test uses real `rawls-values.generated.json`, not mock fixtures.

---

## Risk Notes

- **`resolveJsonModule` enabled in `tsconfig.spec.json`** — This allows importing JSON files directly in tests. If this causes downstream issues with build tools, it may need to be revisited. Currently works correctly.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/features/followups-guard.production-content-contract.spec.ts` | **NEW** — 6 tests |
| `src/app/features/followups.guard.ts` | Added `extractTlqIds()` and `isTlqIdValid()` exports |
| `tsconfig.spec.json` | Added `resolveJsonModule: true, esModuleInterop: true` |
| `docs/testing/test-catalog.md` | Added new spec entry |

---

## Branch Cleanup

Branch `test/TD-RAWLS-009-prod-content-contract` can be deleted after verification.

---

**Closeout Verified By:** Copilot  
**Template Used:** `docs/protocol/closeout-artifact-verification-template.md`
