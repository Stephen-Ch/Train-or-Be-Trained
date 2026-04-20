# V1 Smoke Checklist

Manual verification before V1 release.

## Prerequisites
- [ ] Fresh browser session (clear site data or use incognito)
- [ ] Production build deployed (`npm run build`)

## Checklist

1. [ ] Navigate to `/` — Intro page renders
2. [ ] Click "Start" → `/select` — Ideal selection renders
3. [ ] Select one ideal → Navigate to `/q/{category}` — First question renders
4. [ ] Answer Position (1-5 scale) → Challenges appear
5. [ ] Answer all challenges for ideal → Auto-navigate to `/review`
6. [ ] `/review` shows ideal with "Positions 1/1" and status "Complete"
7. [ ] "See Results" button is enabled → Click it
8. [ ] `/result` renders full UI: headline, summary, bullets, Download/Start Over buttons
9. [ ] Click "Download PNG" → PNG file downloads (check: 1200×630 dimensions)
10. [ ] Hard refresh on `/result` → Results still render (hydration works)
11. [ ] Click "Review Answers" → `/review` renders correctly
12. [ ] From `/review`, click "Resume" on an incomplete ideal (if any) → Returns to questions

## Pass Criteria
All 12 steps complete without errors or blank screens.
