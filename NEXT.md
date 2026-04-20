# Working With Me — Current State
*Last updated: April 2026*

---

## Status: Built. Not yet deployed.

TypeScript compiles clean. Full flow implemented. Needs `npm install` and a Netlify deploy.

---

## What Was Built (complete)

| Component | Status |
|---|---|
| Intro screen — full marketing landing page | ✅ |
| Lens selection (Practical / Creative / Life) | ✅ |
| Depth selection (Quick / Full) | ✅ |
| Question flow — Likert scale, back/forward, progress bar | ✅ |
| Scoring engine — maps answers → low/moderate/high per dimension | ✅ |
| Document generator — lens-aware prose blocks for all 7 dimensions | ✅ |
| Universal guardrails section in every generated document | ✅ |
| Life lens guardrails (spiral, confirmation bias, stakes, depth-scaling) | ✅ |
| Result screen — document preview, copy to clipboard, download .md | ✅ |
| Session persistence — survives page refresh via sessionStorage | ✅ |
| App shell — header with "Train or be trained." tagline | ✅ |
| Planning docs — VISION.md, EPICS.md, Start-Here-For-AI.md | ✅ |

---

## Immediate Next Steps

### 1. Run locally and verify

```bash
cd C:\Users\schur\workspaces\WorkingWithMe
npm install
npm start
# → http://localhost:4200
```

Walk the full flow:
- [ ] Intro → click "Build My AI Trainer"
- [ ] Lens screen → select one → Continue
- [ ] Depth screen → select Quick → Start Assessment
- [ ] Questions → answer all 14 → Next through to end
- [ ] Result screen → document looks right → Copy works → Download works
- [ ] Test on mobile (resize browser)

### 2. Add email capture to result screen

After the user sees their document, add one optional email field:
*"Want course updates and new features? Drop your email."*

Hooks into ConvertKit (free tier). Implementation: one `<input>` + fetch POST to ConvertKit's API.
ConvertKit API docs: https://developers.convertkit.com/

### 3. Deploy to Netlify

```
Build command:     npm run build
Publish directory: dist/working-with-me/browser
```

1. Push to GitHub repo (Stephen-Ch/Train-or-Be-Trained)
2. Connect repo to Netlify
3. Set build settings above
4. Deploy → get URL
5. Point trainorbetrained.com to Netlify (Domain management settings)

### 4. Beta (10–15 people)

Personal message only. One question: "Does the document feel accurate to you?"
See `C:\Users\schur\OneDrive\Documents\_Projects\WorkWithMe\05_Promotion_Plan.md` for who to ask.

---

## Still Pending (pre-beta)

| Item | Notes |
|---|---|
| Age gate (13+) on intro screen | One checkbox, legally meaningful |
| Email capture on result screen | ConvertKit, one field |
| Consistency flagging in scoring engine | Flag conflicting answers before generating document |

---

## After Beta — What to Fix

These are the areas most likely to need work based on what the prototype produces:

- **Prose blocks** — some will feel generic. Rewrite the ones that miss.
- **Session resume** — users will drop off mid-assessment. Add a "resume" flow to the intro screen for partially-answered sessions.
- **Mobile layout** — check lens, depth, and question screens at 375px width.

---

## Known Loose Ends (non-blocking)

- Old Rawls files still present: `review.component.ts`, `store.component.ts`, `admin/`, `persona/`, `result.guard.ts` — not wired to routes, safe to ignore for now, clean up later
- Rawls-era tests will fail — left for a future pass
- `content-adapter.ts` and scripts from Rawls are unused — ignore for now

---

## Architecture Reminder

```
Intro (/）→ Lens (/lens) → Depth (/select) → Questions (/q/:dimensionId) → Result (/result)
```

State lives in `SessionStore`: lens (string), depth ('quick'|'full'), answers (Record<questionId, 0–4>)

Scoring: `core/engine/scoring.engine.ts` → averages reversed/non-reversed scores per dimension → low/moderate/high

Document: `core/engine/document.generator.ts` → 21 prose block combinations (7 dimensions × 3 lenses), selected by score level

Content: `src/assets/content/working-with-me.json` → 7 dimensions, 5 questions each, `quick: true` on 2 per dimension

---

## Marketing / Planning Docs

Everything else lives in:
`C:\Users\schur\OneDrive\Documents\_Projects\WorkWithMe\START-HERE.md`

Read that file first when returning to the project from the marketing/planning side.
