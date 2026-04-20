# Working With Me — AI Orientation

## What this project is

A self-assessment Angular PWA that generates a personalized markdown document the user can give to any AI assistant as custom instructions.

Flow: **Lens selection → Depth selection → Questions (Likert scale) → Document output**

## Architecture

- **Framework:** Angular 20, zoneless, signals-based state
- **Styling:** Tailwind CSS
- **Content model:** JSON (`/src/assets/content/working-with-me.json`)
- **State:** `SessionStore` in `/src/app/core/session/session.store.ts`
- **Scoring:** `/src/app/core/engine/scoring.engine.ts`
- **Document generation:** `/src/app/core/engine/document.generator.ts`
- **No backend. No accounts. Client-side only.**

## Key files

| File | Purpose |
|---|---|
| `src/assets/content/working-with-me.json` | Questions (seven dimensions, Quick/Full flags) |
| `src/app/core/session/session.store.ts` | Session state: lens, depth, answers |
| `src/app/core/engine/scoring.engine.ts` | Maps answers → dimension scores (low/moderate/high) |
| `src/app/core/engine/document.generator.ts` | Generates final markdown document from scores + lens |
| `src/app/features/lens.component.ts` | Lens selection (Practical / Creative / Life) |
| `src/app/features/select.component.ts` | Depth selection (Quick / Full) |
| `src/app/features/question-v2.component.ts` | Question flow with Likert scale |
| `src/app/features/result.component.ts` | Output screen + copy/download |
| `src/app/app.routes.ts` | Routes: / → /lens → /select → /q/:id → /result |

## Seven dimensions

memory, focus, overwhelm, communication, decisions, completion, calibration

Each has five questions (2 quick, 5 full). Quick path = questions where `quick: true`.

## The output document

Plain markdown, ~300–600 words, second-person (addressed to the AI). Seven sections, populated based on dimension level and lens. Low-signal dimensions are omitted in Quick mode.

## Running locally

```bash
npm install
npm start
# → http://localhost:4200
```

## Before making changes

1. Check NEXT.md for current state and what's in progress
2. Check EPICS.md for the priority queue
3. Read the relevant source files before modifying them

## What NOT to do

- Don't add a backend or authentication
- Don't add platform-specific integrations (the output is intentionally portable)
- Don't add personality labels or diagnostic language to the output
- Don't modify the question JSON without considering both Quick and Full paths
