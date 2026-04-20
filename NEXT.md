# Working With Me — Current State
*Last updated: April 2026 — post validation pivot*

---

## North Star: Prove the document changes real outcomes.

If users don't notice improvement in AI behavior with the document vs. without it, everything else is decoration.
The only work that matters right now is running the 5-stage validation plan.

**Killed (do not build):**
- Course
- Phase 2 (teachers), Phase 3 (parents/kids)
- ProductHunt launch prep
- Enterprise / Capgemini angle
- Consistency flagging
- First/second-person toggle
- Guardrail wording debates
- Open-source credibility positioning

**Frozen until evidence exists:**
- Branding refinements beyond basic sanity check
- Stack debates (Angular stays)
- Email capture / ConvertKit

---

## Status

| Component | Status |
|---|---|
| Intro screen — marketing landing page | ✅ |
| Lens selection (Practical / Creative / Life) | ✅ |
| Depth selection (Quick / Full) | ✅ |
| Question flow — Likert scale, back/forward, progress bar | ✅ |
| Scoring engine — maps answers → low/moderate/high per dimension | ✅ |
| Document generator — lens-aware prose blocks for all 7 dimensions | ✅ |
| Universal guardrails section in every document | ✅ |
| Result screen — copy to clipboard, download .md | ✅ |
| Session persistence — sessionStorage | ✅ |
| Netlify deploy + trainorbetrained.com | ⬜ |
| Plausible Analytics (event tracking) | ⬜ |
| Age gate (13+ checkbox) | ⬜ |

---

## Immediate Next Steps (in order)

### 1. Deploy to Netlify

```
Build command:     npm run build
Publish directory: dist/working-with-me/browser
```

1. Push to GitHub repo (Stephen-Ch/Train-or-Be-Trained)
2. netlify.com → Add new site → Import from Git → GitHub → select repo
3. Set build settings above → Deploy
4. Domain settings → Add trainorbetrained.com

### 2. Add Plausible Analytics

Sign up at plausible.io (free tier). Add your domain. They give you one script tag:

```html
<script defer data-domain="trainorbetrained.com"
  src="https://plausible.io/js/script.js"></script>
```

Add to `src/index.html` in the `<head>`. That gives you page-level tracking immediately.

Then add custom events in the components for the four things that matter:

| Event | Where | Why |
|---|---|---|
| `assessment_started` | Lens screen on continue | Did they begin? |
| `assessment_completed` | Result screen on load | Did they finish? |
| `document_copied` | Copy button click | Did they take the output? |
| `document_downloaded` | Download button click | Did they save it? |

Plausible custom event syntax:
```javascript
window.plausible('assessment_completed');
```

### 3. Add age gate (13+)

One checkbox on the intro screen before the CTA button activates:
`[ ] I confirm I am 13 or older`

CTA disabled until checked. Five lines of code. COPPA compliance.

### 4. Recruit 8–12 validation users

Knowledge workers only. Not teachers, not parents. People who already use AI regularly for real work.

Personal message. Do not blast. Ask them to:
- Come with 3 real tasks they do with AI
- Run each task without the document first
- Paste the document into custom instructions
- Run the same task again
- Tell you honestly: better, same, or worse?

Success bar: 70% say "with document" is clearly better on at least 2 of 3 tasks.

---

## Validation Stage Tracker

| Stage | Goal | Status |
|---|---|---|
| 1 | Document produces noticeably better AI behavior | ⬜ |
| 2 | Output feels personal, not generic | ⬜ |
| 3 | Completion + copy + paste rates are acceptable | ⬜ |
| 4 | Some paid interest exists (waitlist, not course) | ⬜ |
| 5 | Stephen can run this without drowning | ⬜ |

Do not proceed to Stage 4 without passing Stage 1 and 2.

---

## Stage 2 — Open Questions to Ask Users

In addition to the 4 trust/accuracy questions, ask:

- Did the questions feel natural to answer?
- Was there anything about the phrasing that made it harder to be honest?

**Context:** Current questions use "I..." statements with "...like me" scale labels, which creates a mild grammatical loop. "Some people..." framing (used in Big Five and other validated instruments) may feel more natural and reduce defensiveness. Do not rewrite before hearing from users — this is a phrasing question, not an accuracy question. If multiple users flag it unprompted, rewrite. If not, current framing is fine enough.

---

## Decision Rules (after validation)

**Continue** if: users clearly prefer AI outputs with the document, output feels personal, completion is decent, some paid interest shows up.

**Revise** if: output helps somewhat but feels generic, users need heavy editing, form friction causes drop-off.

**Kill** if: users don't notice improvement, most don't paste or keep the document, paid interest near zero.

---

## Known Loose Ends (non-blocking)

- Old Rawls files: `review.component.ts`, `store.component.ts`, `admin/`, `persona/`, `result.guard.ts` — safe to ignore, clean up later
- Rawls-era tests will fail — future pass
- `content-adapter.ts` and unused Rawls scripts — ignore for now

---

## Architecture Reminder

```
Intro (/) → Lens (/lens) → Depth (/select) → Questions (/q/:dimensionId) → Result (/result)
```

State: `SessionStore` — lens, depth, answers (Record<questionId, 0–4>)
Scoring: `core/engine/scoring.engine.ts` → low / moderate / high per dimension
Document: `core/engine/document.generator.ts` → 63 prose block combinations + guardrails
Content: `src/assets/content/working-with-me.json` → 7 dimensions, 5 questions each

---

## Marketing / Planning Docs

`C:\Users\schur\OneDrive\Documents\_Projects\WorkWithMe\START-HERE.md`
