# Closeout Artifact Verification Template

Every S2C (merge/closeout) completion report MUST include this table:

## Artifact Verification

| Artifact | Expected Location | Verified On Main | Key String/Check |
|----------|-------------------|------------------|------------------|
| (file 1) | path/to/file.ts   | ✅ / ❌          | "key string"     |
| (file 2) | path/to/file.md   | ✅ / ❌          | "key string"     |

## Verification Steps

1. After merge, run: `git ls-files | Select-String "<filename>"`
2. Open file and confirm key content exists
3. Run Green Gate: `npm run test` + `npm run build`

## If Verification Fails

- Do NOT mark S2C complete
- Report missing artifacts
- Propose recovery steps

---
