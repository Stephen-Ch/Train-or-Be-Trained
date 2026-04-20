# Project-Specific Leak Inventory

> **PROMPT-ID:** KIT-LEAK-INVENTORY-PROJECT-SPECIFIC-TOKENS-001
> **Date:** 2026-03-04
> **Kit Version:** v7.2.33
> **Scope:** Consumer-shipped markdown only (no .ps1, no docs/status/)

---

## A) Summary

| Metric | Count |
|--------|-------|
| Distinct leak tokens | 25 |
| Files containing at least one leak | 14 |
| Total hit lines | ~95 |

**Definition:** A "leak token" is a project-specific string (route, component name,
file path, database object, domain term) that belongs in a consumer overlay or example
file, not in vendor kit rules. Template/example files are flagged separately since
they are expected to contain illustrative examples.

---

## B) Token Table

### Category 1 — Routes (project-specific URL patterns)

| Token | Files | Evidence |
|-------|-------|----------|
| `/select` | 3 | protocol-v7.md:1061, stay-on-track.md:45, protocol-v7.md:1083 |
| `/q/:id` | 3 | protocol-v7.md:1062, stay-on-track.md:46, protocol-v7.md:1083 |
| `/review` | 3 | protocol-v7.md:1063, stay-on-track.md:47, protocol-v7.md:1083 |
| `/result` | 3 | protocol-v7.md:1064, stay-on-track.md:48, protocol-v7.md:1083 |
| `/store` | 3 | protocol-v7.md:1065, stay-on-track.md:49, protocol-v7.md:1083 |
| `q1/:id` | 2 | protocol-v7.md:1044, stay-on-track.md:46 |
| `q2/:id` | 2 | protocol-v7.md:1044, stay-on-track.md:46 |

### Category 2 — Component Names (Angular/React class names)

| Token | Files | Evidence |
|-------|-------|----------|
| `IntroComponent` | 1 | stay-on-track.md:44 |
| `SelectComponent` | 2 | stay-on-track.md:45, terminology-dictionary.md:59 |
| `QuestionV2Component` | 1 | stay-on-track.md:46 |
| `ReviewComponent` | 1 | stay-on-track.md:47 |
| `ResultComponent` | 1 | stay-on-track.md:48 |
| `StoreComponent` | 1 | stay-on-track.md:49 |

### Category 3 — Project File Paths

| Token | Files | Evidence |
|-------|-------|----------|
| `src/app/app.routes.ts` | 3 | protocol-v7.md:1044,1056; stay-on-track.md:43; MIGRATION-INSTRUCTIONS.md:70,313 |
| `src/app/features/review.component.ts` | 1 | terminology-dictionary.md:57 |
| `src/app/features/admin/admin-content-explorer.component.ts` | 1 | terminology-dictionary.md:58 |
| `src/app/features/components.ts` | 1 | terminology-dictionary.md:59 |
| `src/app/shared/terminology.ts` | 1 | terminology-dictionary.md:54 |
| `question.component.ts` | 1 | protocol-v7.md:992 |
| `session.store.ts` | 2 | protocol-v7.md:992; verification-mode.md:12 |
| `content.service.ts` | 1 | protocol-v7.md:992 |
| `scripts/content-build.js` | 1 | protocol-v7.md:992 |
| `qv2-tutor-copy.json` | 1 | prompt-lifecycle.md:94 |

### Category 4 — Project-Specific Names / Domain Terms

| Token | Files | Evidence |
|-------|-------|----------|
| `ExampleProject` | 7 | protocol-v7.md:193,196,233,237; protocol-lite.md:71,75; required-artifacts.md:159,176; MIGRATION-INSTRUCTIONS.md:69,71,121,128,314,317; stack-profile-standard.md:102,115; subtree-playbook.md:64,281,288,292; terminology-template.md:41 |
| `GameRepository` | 2 | alignment-mode.md:20; github-agent-return-packets-prompt-template.md:12 |
| `Main.js` | 2 | alignment-mode.md:20; github-agent-return-packets-prompt-template.md:12 |
| `SignalR` | 4 | alignment-mode.md:20; protocol-v7.md:941,994; github-agent-return-packets-prompt-template.md:12,24,37 |
| `MongoDB` | 3 | return-packet-gate.md:99; github-agent-return-packets-prompt-template.md:24,38,203 |
| `TeachModel` | 2 | protocol-v7.md:587; EVIDENCE-PACK-TEMPLATE.md:132 |
| `TopLevelSqlConn` | 3 | protocol-v7.md:588; EVIDENCE-PACK-TEMPLATE.md:132; subtree-playbook.md:232 |
| `parseTaggerNET3.0` | 1 | VIBE-CODING.VERSION.md:135 |
| `introByScenario` | 1 | protocol-v7.md:712 |
| `scenarioId` | 2 | protocol-v7.md:712,714,739 |
| `tenantId` | 1 | protocol-v7.md:714,739 |
| `react-hooks/exhaustive-deps` | 1 | protocol-v7.md:941 |
| `coach` / `tutor` (domain UX roles) | 2 | protocol-v7.md:786,789,792; prompt-lifecycle.md:91,94 |

### Category 5 — Postmortem / History References

| Token | Files | Evidence |
|-------|-------|----------|
| `docs/postmortems/2026-01-08-postmortem-lint-cleanup-regression.md` | 1 | protocol-v7.md:941 |

---

## C) Consumer Scan Input List

Copy these tokens into a scanner (Select-String pattern or grep) to find
consumer repos that still embed project-specific references outside the
kit subtree:

    /select
    /review
    /result
    /store
    /q/:id
    q1/:id
    q2/:id
    IntroComponent
    SelectComponent
    QuestionV2Component
    ReviewComponent
    ResultComponent
    StoreComponent
    src/app/app.routes.ts
    src/app/features/review.component.ts
    src/app/features/admin/admin-content-explorer.component.ts
    src/app/features/components.ts
    src/app/shared/terminology.ts
    question.component.ts
    session.store.ts
    content.service.ts
    scripts/content-build.js
    qv2-tutor-copy.json
    ExampleProject
    GameRepository
    Main.js
    SignalR
    MongoDB
    TeachModel
    TopLevelSqlConn
    parseTaggerNET3.0
    introByScenario
    scenarioId
    tenantId
    coach/tutor
    docs/postmortems/2026-01-08-postmortem-lint-cleanup-regression.md

---

## D) File Heat Map (leak density)

| File | Leak Lines | Severity |
|------|-----------|----------|
| protocol-v7.md | ~20 | HIGH — authoritative rules file; leaks baked into rule text |
| stay-on-track.md | ~10 | HIGH — entire route coverage section is project-specific |
| terminology-dictionary.md | ~6 | HIGH — all source paths are project-specific |
| github-agent-return-packets-prompt-template.md | ~10 | MEDIUM — template examples (expected, but uses real project names) |
| MIGRATION-INSTRUCTIONS.md | ~8 | LOW — migration guide; ExampleProject used as "replace me" example (intentional) |
| subtree-playbook.md | ~4 | LOW — playbook examples (partially intentional) |
| required-artifacts.md | ~3 | MEDIUM — VISION example text is project-specific |
| protocol-lite.md | ~2 | MEDIUM — ExampleProject in gate example |
| alignment-mode.md | ~2 | MEDIUM — hot-file trigger list is project-specific |
| verification-mode.md | ~2 | MEDIUM — examples use project paths |
| prompt-lifecycle.md | ~2 | LOW — illustrative example |
| EVIDENCE-PACK-TEMPLATE.md | ~2 | MEDIUM — template example uses real connection names |
| return-packet-gate.md | ~1 | LOW — example sentence |
| VIBE-CODING.VERSION.md | ~1 | LOW — changelog history (not actionable) |
| stack-profile-standard.md | ~4 | LOW — example section (intentional) |

---

## E) Recommendations

1. **Highest priority:** Scrub `stay-on-track.md` lines 43-57, `protocol-v7.md` lines 992-994 and 1044-1065, and `terminology-dictionary.md` lines 54-59. These embed real project routes, components, and source paths directly in vendor rule text. Replace with `<consumer-routes>` / `<your-routes-file>` placeholders or move to overlay examples.

2. **Medium priority:** Replace `ExampleProject` references in `protocol-v7.md` (Green Gate section), `protocol-lite.md`, and `required-artifacts.md` with `<ProjectName>` or `<your-project>.csproj` generic placeholders.

3. **Template files (LOW priority):** Files in `templates/` and `standards/` using project-specific examples (e.g., `github-agent-return-packets-prompt-template.md`, `stack-profile-standard.md`) are acceptable as illustrative examples BUT should use clearly fictional names (e.g., `Contoso`, `AcmeApp`) instead of real project names to avoid consumer confusion.

4. **Consumer action:** Run the scan input list (Section C) against consumer repos *outside* the kit subtree prefix to identify which repos have copied project-specific tokens into their own docs. Those repos need overlays.

---

## F) Search Commands Used

    Select-String -Path "*.md","protocol\*.md",... -Pattern "<pattern>"

Patterns searched:
- `/select|/review|/result|/store|/q/:id` (routes)
- `Component\b` (component names)
- `\.csproj|ExampleProject|\.sln\b` (project files)
- `question\.component|session\.store|app\.routes|content\.service|content-build|admin-content-explorer` (hot files)
- `IntroComponent|SelectComponent|QuestionV2Component|ReviewComponent|ResultComponent|StoreComponent|SignalR|Multiplayer` (specific components and tech)
- `GameRepository|Main\.js|MongoDB|parseTaggerNET|scenarioId|tenantId` (domain terms)
- `src/app/|coach|tutor` (source paths and domain roles)
- `qv2-tutor|TeachModel|TopLevelSqlConn` (DB references)
- `react-hooks/exhaustive-deps|postmortem|introByScenario` (framework/history references)

Search method used: Select-String
Recovery applied: none
