# V1 RC-003A Manual Smoke Test Report

## Test Metadata

**Date/Time**: 12/22/25 3:30pm (fill in)

**Commit Hash**: `1a58a6900dfea9f0a4442d33864af84c310ec62a`

**Browser Used**: Chrome143)

**Tester**: @Stephen

---

## Automated Pre-Checks (Completed by Copilot)

- [x] `npm run test` — 109 SUCCESS (1 skipped)
- [x] `npm run build` — Application bundle generation complete

---

## Manual Smoke Checklist

Follow each step in order. Mark [x] for PASS, leave [ ] for FAIL.

### Prerequisites
- [ x] Fresh browser session (clear site data or use incognito)
- [ x] Production build deployed (`npm run build` completed above)

### Core Flow
1. [ x] Navigate to `/` — Intro page renders
2. [ x] Click "Start" → `/select` — Category selection renders
"liberty was pre-selected
3. [ x] Select one category → Navigate to `/q/{category}` — First question renders
4. [ x] Answer TLQ (1-5 scale) → Followups appear
5. [ x] Answer all followups for category → Auto-navigate to `/review`
6. [ ] `/review` shows category with "TLQs 1/1" and status "Complete" - shows:"TLQs 4/4, FUs 4/4"
7. [ x] "See Results" button is enabled → Click it
8. [x ] `/result` renders full UI: headline, summary, bullets, Download/Start Over buttons

### Share-Card Verification (Critical V1)
9. [ x] Click "Download PNG" → PNG file downloads

**Downloaded Filename**: idealist-results-card.png

**Dimensions Observed**: 1200 × 630 (MUST be 1200×630)

**Visual Check - Not Blank**: [ x] Yes [ ] No

**Notes**: Hard refresh on results returns to review but reselts remain after clicking "see results" again

### Hydration Verification (Critical V1)
10. [ x] Hard refresh on `/result` → Results still render (hydration works)

**Hydration Result**: [x ] PASS [ ] FAIL

**If FAIL**: Does sessionStorage contain 'rawls-session-v1'? [ ] Yes [ ] No

### Remaining Steps
11. [ x] Click "Review Answers" → `/review` renders correctly returns Liberty
Secure the Blessings of Liberty (U.S. Constitution, Preamble)
Complete
TLQs 4/4, FUs 4/4
12. [ ] From `/review`, click "Resume" on an incomplete category (if any) → Returns to questions

---

## Summary

**Overall Result**: [ x] ALL PASS [ ] FAILURES DETECTED

**First Failure Observed** (if any):

- Step #: _____
- URL: _____________________
- Behavior: _________________________________________________________________
- Expected: _________________________________________________________________

---

## Notes / Observations

answer scales do not always match question, info headers not informative or user friendly________________________________

_________________________________________________________________

_________________________________________________________________

---

## Next Steps

- [ ] If ALL PASS: Ready for V1 release
- [ ] If FAILURES: Document in separate issue and prioritize fix

