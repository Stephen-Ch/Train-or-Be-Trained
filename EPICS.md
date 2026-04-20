# Working With Me — Epics

## MVP (Prototype — current)

**Goal:** Working prototype demonstrating the full flow: lens → depth → questions → document.

- [x] Angular PWA scaffolded from Rawls
- [x] Seven-dimension question JSON (Quick + Full paths)
- [x] Lens selection screen (Practical / Creative / Life)
- [x] Depth selection screen (Quick / Full)
- [x] Question flow with Likert scale, back/forward navigation
- [x] Scoring engine (dimension-level: low / moderate / high)
- [x] Document generation engine (lens-aware prose blocks per dimension)
- [x] Result screen with document preview
- [x] Copy to clipboard
- [x] Download as .md

## Epic 1: Polish & Content Refinement

- [ ] Refine prose blocks based on real user testing (do the outputs feel accurate?)
- [ ] Add session resume (return to in-progress assessment)
- [ ] Add progress indicator across dimensions (e.g. "Memory ✓, Focus ✓, …")
- [ ] Mobile-responsive layout review
- [ ] Intro copy refinement

## Epic 2: Personalization Pass

- [ ] After generation: let user edit each section before downloading
- [ ] "Tune-up" mode: 5-question recalibration after a period of use
- [ ] First/second person toggle in output (current: second person)

## Epic 3: Sharing & Persistence

- [ ] Shareable URL with seeded state (same as Rawls pattern)
- [ ] Optional: save/load via local file (no backend required)

## Epic 4: Safety & Guardrails (partially done)

- [x] Universal guardrails in every generated document (uncertainty, AI premise surfacing, professional referral)
- [x] Life lens guardrails (spiral, confirmation bias, stakes, depth-scaling)
- [ ] Age gate (13+) on intro screen
- [ ] Consistency flagging — surface conflicting answers before generating document
- [ ] "For My Child" path — parent takes assessment on behalf of child, generates child-safe document

## Epic 5: Children's Version

**See: C:\Users\schur\OneDrive\Documents\_Projects\WorkWithMe\08_Kids_Version.md for full analysis.**

- [ ] "Who is this for?" entry screen: Me / My Child
- [ ] Parent assessment — different questions (child's age, academic integrity stance, topic sensitivity)
- [ ] Child-safe document generator — age-appropriate guardrails, privacy protection, distress handling
- [ ] Browser extension (Chrome/Edge) — auto-inject document into AI sites on child's device
- [ ] Course: "Train or Be Trained: For Parents"

## Epic 6: Integration

- [ ] Consider as intake flow for Daily Inventory or other Stephen products
- [ ] Consider as standalone micro-product (landing page, SEO, distribution)

## Open Questions

- Should there be a shorter "tune-up" assessment after a period of use?
- Where does this live as a product? Standalone, or integrated?
- Does the lens selection need more options, or are three sufficient?
