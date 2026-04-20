# Closeout Artifact Verification Template

## PROMPT REVIEW GATE + COMMAND LOCK (MANDATORY FIRST OUTPUT)
Every closeout report must begin with these four lines before any commands, edits, or verification steps:
What: <1-line plan>
Best next step? YES/NO
Confidence: HIGH/MEDIUM/LOW
Command Lock satisfied? YES/NO (STOP immediately if NO)
Do not run git/npm/verification commands until the four-line gate is printed and passes.

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
