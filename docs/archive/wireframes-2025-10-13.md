# Rawls Game Wireframes (Draft)

## Flow Summary
1. Intro ➜ Category Selection ➜ Question (Primary + Follow-ups) ➜ Review ➜ Result Share
2. Each top-level question includes its followUpQuestions[] array; after the primary response we step through every follow-up sequentially.
3. All steps assume mobile-first layout (360px) scaled responsively.

## 1. Intro / Landing
```
┌──────────────────────────────────────┐
│ LOGO                                 │
│ "Step behind the veil of ignorance" │
│ [Start Justice Survey] (primary)     │
│ [Resume Saved Session] (secondary)   │
│ • Progress dots (6) under CTA        │
└──────────────────────────────────────┘
```
Notes: Primary CTA creates session; secondary CTA visible if storage key exists.

## 2. Category Selection
```
┌──────────────────────────────────────┐
│ Header: "Choose 3 focus areas"       │
│ Pill filters (selected vs disabled)  │
│ ▢ Rights & Freedoms   (legend)       │
│ ▢ Economic Justice    (legend)       │
│ ...                                   │
│ [Continue] disabled until 3 chosen   │
└──────────────────────────────────────┘
```
Notes: Each category card shows quote snippet + checkbox; label seeded from content.

## 3. Question – Primary Statement
```
┌──────────────────────────────────────┐
│ Title: "Rights & Freedoms"           │
│ Quote strip                          │
│ Primary statement card               │
│ Likert row (1–5 buttons)             │
│ Helper text: "Answer honestly; follow-up questions appear right after." │
│ [Skip Category]   [Continue]         │
└──────────────────────────────────────┘
```
Notes: Continue is enabled after any selection. Selecting Continue immediately advances into that question’s follow-up sequence (no conditional logic).

## 4. Follow-up Cluster
```
┌──────────────────────────────────────┐
│ Title: "Rights & Freedoms • Follow-ups" │
│ Chip: "Follow-up 1 of N"             │
│ Follow-up statement card             │
│ Likert row (1–5 buttons)             │
│ Inline helper: "Why we asked" link   │
│ [Skip Follow-ups] [Continue]         │
└──────────────────────────────────────┘
```
Notes: Every follow-up defined in followUpQuestions[] is presented in sequence. Continue advances the index; Skip dismisses the remaining follow-ups and resumes the standard category order.

## 5. Review Summary
```
┌──────────────────────────────────────┐
│ Header: "Review your choices"        │
│ Accordion per category               │
│  ├ Option label + answered count     │
│  └ Follow-up responses (chips)       │
│ [Edit Responses] [Continue]          │
└──────────────────────────────────────┘
```
Notes: Edit routes back with ?returnTo=review, preserving progress signals.

## 6. Result & Share
```
┌──────────────────────────────────────┐
│ Title: "Your Rawls Profile"          │
│ Radar chart (justice dimensions)     │
│ Profile summary blocks               │
│ [Download PNG] [Share Link] CTA      │
│ Secondary: "Retake survey"          │
└──────────────────────────────────────┘
```
Notes: CTA triggers ShareCardService; include accessibility alt copy for chart.
