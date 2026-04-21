# Working With Me — Epics
*Last updated: April 2026 — validation-first pivot*

---

## Current Phase: Validation

Prove the document changes real outcomes before building anything else.
See NEXT.md for the full 5-stage validation plan.

---

## MVP (Complete ✅)

- [x] Angular PWA scaffolded
- [x] Seven-dimension question JSON (Quick + Full paths)
- [x] Lens selection screen (Practical / Creative / Life)
- [x] Depth selection screen (Quick / Full)
- [x] Question flow with Likert scale, back/forward navigation
- [x] Scoring engine (dimension-level: low / moderate / high)
- [x] Document generation engine (lens-aware prose blocks per dimension)
- [x] Universal guardrails in every generated document
- [x] Life lens guardrails
- [x] Result screen with document preview, copy to clipboard, download .md
- [x] Smoke test passed at localhost:4200

---

## Validation Epic (Active — do these now)

- [x] Push to GitHub (Stephen-Ch/Train-or-Be-Trained)
- [x] Deploy to Vercel + connect trainorbetrained.com
- [x] Add Plausible Analytics — script tag + 4 events (started, completed, copied, downloaded)
- [ ] Add age gate — 13+ checkbox on intro screen before CTA
- [ ] Recruit 8–12 knowledge workers for Stage 1 before/after test
- [ ] Run Stage 1: before/after document comparison on 3 real tasks
- [ ] Run Stage 2: 4-question trust/accuracy check
- [ ] Review Stage 3 analytics: completion, copy, paste rates
- [ ] Put up paid-interest waitlist (no course, just a page)

---

## Epic 1: Content Refinement (Pending — after Stage 2)

Do not touch until validation users tell you what's off.

- [ ] Revise prose blocks that feel generic based on Stage 2 feedback
- [ ] Review question dimensions for users who aren't ADHD-adjacent (organized, focused finishers)
- [ ] Mobile layout review at 375px
- [ ] Intro copy refinement if needed

---

## Epic 2: Retention & Friction (Pending — after Stage 3)

Do not build until analytics show where users drop.

- [ ] Session resume — return to in-progress assessment
- [ ] Progress indicator across dimensions
- [ ] Consider localStorage fallback if sessionStorage drop-off is high

---

## Epic 3: Monetization (Pending — after Stage 4)

Do not build until paid interest is demonstrated.

- [ ] Waitlist → email sequence
- [ ] Course structure (if Stage 4 shows demand)
- [ ] Paid offer page

---

## Frozen Epics (Do Not Build Yet)

These exist as documented ideas. Do not plan or build until consumer validation is complete.

### Personalization Pass
- [ ] After generation: let user edit each section before downloading
- [ ] First/second person toggle in output
- [ ] "Tune-up" mode: 5-question recalibration

### Sharing & Persistence
- [ ] Shareable URL with seeded state
- [ ] Save/load via local file

### Consistency Flagging
- [ ] Surface conflicting answers before generating document

### Children's Version (Phase 2 at earliest)
- [ ] "Who is this for?" entry screen: Me / My Child
- [ ] Parent assessment
- [ ] Child-safe document generator
- [ ] Browser extension
- [ ] Course: "Train or Be Trained: For Parents"

### Integration
- [ ] Intake flow for Daily Inventory or other Stephen products
- [ ] Teacher-specific course (Phase 2)

---

## Parking Lot

Good ideas, not now:
- Shareable URL with seeded state
- Cross-model verification (paste doc into two AIs, compare)
- "What kind of AI are you?" reverse quiz
- Card deck physical product
- Enterprise / team version ("Working With Us")
