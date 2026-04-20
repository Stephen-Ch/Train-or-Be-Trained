# Legacy Mining: Share Card + Scoring — 2025-12-22

## A) Legacy reference used

Commit: **808593a** (origin/master, 2025-09-25) — "Fix DailyInventory footer layout and enhance UX"

---

## B) Share card: what it did

- Fixed 1200×630px OG-image-sized card with white/gray gradient background
- Used html2canvas v1.4.1 (CDN) to capture DOM element (#profile-card) to canvas
- Converted canvas to PNG blob via toBlob(), triggered browser download
- Filename convention: ${profile.slug}-results-card.png
- Card structure: header (logo + brand), content (title + motto + profile image + summary), footer (tags + URL)
- Responsive preview: scaled down via CSS transform on smaller screens
- Social sharing via RawlsShare object (X/Twitter, Facebook, LinkedIn, clipboard copy)
- Instagram fallback: copy text + URL to clipboard with toast message
- UTM parameters added for tracking (utm_source, utm_medium, utm_campaign)

---

## C) Share card: reusable ideas

- **Exact size 1200×630** — Open Graph standard; keep this spec
- **html2canvas approach** — proven DOM-to-PNG; no server needed
- **Profile-slug filename** — good UX; carry forward
- **Toast notifications** — copy feedback pattern is polished
- **Social share URLs** — intent URLs for X/FB/LinkedIn still work
- **Card visual hierarchy**: brand header → title/motto → image/summary → tags/URL footer

---

## D) Share card: reasons to ignore

- **html2canvas CDN script** — Angular should bundle/import properly, not defer CDN
- **Inline CSS** — legacy had inline styles in template; Angular should use component styles
- **jQuery-style DOM** — legacy used getElementById; Angular should use ViewChild or DOM refs
- **Font Awesome icons** — Angular version uses Tailwind, not FontAwesome
- **Scale-down hack** — CSS transform for responsive preview is fragile; use proper sizing

---

## E) Scoring: what it did

- **Input**: responses object keyed by category title (Liberty, Equality, etc.) with arrays of Likert values (1–5)
- **Averaging**: each category's responses averaged to single value; default 1 if missing
- **User vector**: 7-element array in fixed category order
- **Profile matching**: Euclidean distance between user vector and each profile's idealVector (7-element, values 1 or 5)
- **Output**: best matching profile object with slug, label, summary, motto, insight, tags, image
- **Ranking**: calculateAllScores returns all profiles sorted by distance with similarity percentage

---

## F) Scoring: reusable ideas

- **Euclidean distance matching** — simple, interpretable; keep algorithm
- **Category order array** — ensures vector consistency; good practice
- **idealVector concept** — profiles defined by extreme values; portable
- **Similarity percentage** — useful for UI (Math.max(0, 100 - distance*10))

---

## G) Scoring: reasons to ignore

- **Separate profile-data.js** — Angular uses content pipeline JSON; data already migrated
- **ES module syntax** — legacy exports differ from Angular providedIn services
- **No reverse scoring** — legacy assumed all positive direction; Angular already has reverse flag
- **No followup granularity** — legacy averaged at category level; Angular scores per-followup with dimension tags

---

## H) Recommended next step for V1

**Implement Angular share-card using legacy behavior as spec**

Rationale:
- Current ShareCardService is a placeholder (draws static text to canvas)
- Legacy html2canvas approach is proven and OG-image compatible
- Scoring is already functional in Angular (computeDimensionScores + calculateProfile)
- Share card is the main remaining gap for end-to-end feature parity

---

*No commits made per scope guardrails*
