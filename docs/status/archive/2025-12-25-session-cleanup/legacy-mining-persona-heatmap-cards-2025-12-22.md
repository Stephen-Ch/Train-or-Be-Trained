# Legacy Mining: Persona/Heatmap/Cards Recovery — 2025-12-22

## A) Executive Summary

- Legacy prototype (commit 808593a, 2025-09-25) had rich persona system with 14 profiles, idealVector matching, and persona images
- Persona selection engine exists on unmerged branch (a688d8c, origin/copilot/add-persona-selection-engine, 2025-11-27)
- V1 Angular replaced rich persona system with simplified 3-profile calculateProfile stub (idealist/moderate/skeptic)
- Radar chart placeholder SVG exists in legacy but was never wired to live data
- Profile images existed as JPG files in legacy (images/The Principled Entrepreneur.jpg, etc.) but not migrated to Angular

---

## B) Evidence Table

| Item | Path/Commit | Status | Notes |
|------|-------------|--------|-------|
| Legacy persona data | 808593a:assets/data/profiles.json | EXISTS | 14 profiles with idealVector, labels, summaries, insights, iconSets, image paths |
| Persona images | 808593a:profiles/{slug}/images/*.jpg | EXISTS | One image per profile (e.g., "The Principled Entrepreneur.jpg") |
| Persona selection engine | a688d8c:src/app/core/persona/persona-engine.ts | EXISTS (unmerged) | selectTopPersona function, PersonaMatch interface, dimension scoring |
| Persona engine tests | a688d8c:src/app/core/persona/persona-engine.spec.ts | EXISTS (unmerged) | 126 lines of tests for persona selection |
| V1 profile calculator | src/app/core/engine/profile.ts | CURRENT | Simplified 3-profile stub (idealist/moderate/skeptic) |
| Radar chart SVG | 808593a:assets/img/radar-chart-sample.svg | EXISTS | Static placeholder, never wired to dynamic data |
| Share card export | src/app/shared/share/share-card.service.ts | CURRENT | html2canvas implementation working, captures #profile-card div |
| Profile card PNG | V1 smoke test evidence | WORKING | 1200×630 PNG export verified in V1-RC-003A |
| Profile matching logic | 808593a:assets/js/scoring.js | LEGACY | Euclidean distance matching with idealVector (7-element arrays) |
| Legacy profile pages | 808593a:profiles/{slug}/index.html | EXISTS | 14 individual profile HTML pages with full descriptions |
| Content pipeline profiles | No evidence found | MISSING | profiles.json not migrated to Angular content pipeline |
| Heatmap/multidimensional viz | No evidence found | NEVER BUILT | Radar chart was placeholder only; no implementation |

---

## C) Reusable Now

**1. Persona Selection Engine (a688d8c)**
- Ready-to-merge TypeScript with 126 tests passing
- Takes dimension scores + persona definitions → returns best match
- No dependencies on legacy code; clean Angular implementation
- RECOMMENDATION: Merge and wire to results page

**2. Legacy Persona Data (808593a:assets/data/profiles.json)**
- 14 well-defined personas with:
  - idealVector (7-element arrays, values 1 or 5)
  - Label, summary, insight, iconSet
  - Image paths (needs asset migration)
- RECOMMENDATION: Migrate to content pipeline JSON format

**3. Radar Chart Placeholder SVG (808593a:assets/img/radar-chart-sample.svg)**
- Static 7-axis radar chart visualization template
- Clean SVG, easy to make dynamic with data binding
- RECOMMENDATION: Port to Angular component with data-driven rendering

**4. Share Card Infrastructure (ALREADY WORKING)**
- html2canvas PNG export verified working in V1
- 1200×630 dimensions correct
- Profile-slug filename convention already implemented
- RECOMMENDATION: Enhance card template with persona images and richer content

---

## D) Needs Rebuild

**1. Profile Images**
- Legacy: JPG files in profiles/{slug}/images/ directory
- Current: No persona images in Angular assets
- Gap: Need to migrate images OR generate new placeholders
- RECOMMENDATION: Extract JPGs from 808593a, optimize, place in src/assets/personas/

**2. Euclidean Distance Matching**
- Legacy: assets/js/scoring.js used idealVector matching
- Current: Angular calculateProfile is simple threshold-based stub
- Gap: Rich matching algorithm not ported
- RECOMMENDATION: Replace calculateProfile with idealVector matching + persona-engine.ts

**3. Dynamic Radar Chart**
- Legacy: Static SVG placeholder only
- Current: Nothing
- Gap: No multidimensional visualization exists
- RECOMMENDATION: Build Angular component with D3.js or raw SVG data binding

**4. Profile Detail Pages**
- Legacy: 14 individual HTML pages per profile
- Current: Single /result page with calculated profile
- Gap: No deep-dive profile exploration
- RECOMMENDATION: Add /profile/{slug} route with full persona description (V1.2+)

---

## E) Recommendation: Where It Fits

**V1.1 (Immediate)**
1. Merge persona-engine.ts from a688d8c (low risk, well-tested)
2. Migrate profiles.json to content pipeline format
3. Replace calculateProfile stub with idealVector matching

**V1.2 (Next Sprint)**
1. Extract and migrate persona images from 808593a
2. Enhance share card template with persona images
3. Add radar chart visualization component (optional)

**V2.0 (Future)**
1. Build /profile/{slug} detail pages for deep dives
2. Add "Compare Personas" feature
3. Support custom persona creation (advanced)

---

## F) Next Prompt Recommendation

**Title**: Merge Persona Engine + Migrate Legacy Profile Data

**PROMPT-ID**: V1-1-PERSONA-RESTORE-001-ENGINE-MERGE-DATA-MIGRATION-001

**3-Step Plan**:
1. Merge persona-engine.ts from a688d8c → verify tests pass
2. Extract profiles.json from 808593a → convert to content pipeline schema → validate
3. Update calculateProfile to use persona-engine.ts + migrated profile data → verify V1 smoke checklist still passes

---

*Report generated: 2025-12-22*
*Forensics scope: commits 808593a (legacy), a688d8c (persona engine), current main*
