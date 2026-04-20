# ChatGPT Handoff — Rawls Game — 2025-12-21

Owner: Stephen  
Repo/workspace (per snapshot): `C:/Users/schur/workspaces/Rawls/JustSprites`  
Timezone: America/New_York

## Why this doc exists
We were making strong progress, then hit a **blocking “manual flow broken” bug** plus a **debugging friction** problem (dev-server / caching confusion, then query params being stripped). Stephen stopped due to frustration and wants a clean restart later.

This doc captures: what’s fixed, what’s still broken, what commits happened, and the smallest next steps to resume debugging without process thrash.

---

## Non‑negotiable working protocol (Working Agreement v1)
- **ONE prompt at a time.** Wait for Copilot’s response before writing the next prompt.
- **Do not write prompts unless Stephen requests it.**
- Prompts must be **single fenced code blocks** ending with `# END PROMPT`.
- Copilot reports must include: **Proof-of-Read**, **Prompt Review Gate**, **Stay in Scope**, **Stop on error**, **Green Gate** (for code changes).
- Keep prompts **small and focused** (one task).
- If confidence < HIGH → STOP.

(See: `docs/protocol/working-agreement-v1.md`, `docs/protocol/protocol-v7.md`, `docs/protocol/copilot-instructions-v7.md`, `docs/protocol/stay-on-track.md`.)

---

## What was fixed and committed
### 1) Category order mismatch (fixed)
**Bug:** User selected categories in order “liberty then equality”, but app navigated to “equality” first.  
**Fix:** Use content-file order / correct sequence logic.  
**Commit (per Stephen/Copilot):** `fba942d` — “fix: use content-file order for category sequence”.

### 2) “Stale code / wrong server” hardening (done)
We identified the most likely cause of earlier “browser not reflecting changes” as:
- PWA service worker caching (production build artifacts), and/or
- confusion between dev server (4200) vs static dist server (8080).

Stephen/Copilot added:
- Docs clarity: DEV (4200) vs PROD/Dist (8080) + SW warning.
- `package.json` scripts: `start:4201` (safe dev on new port) and `serve:dist`.
- A practical runbook: `docs/status/stale-browser-code-runbook.md`.
- Gates were green: tests pass + build succeeds (Stephen reported 93 tests pass at that moment).

Note: an older debug snapshot file may not include these script lines; treat Stephen’s change summary as source of truth.

### 3) Sticky debug flag for overlay (committed)
Problem: `/q/liberty?debugQuestion=1` was being rewritten to `/q/liberty`, killing “debug on/off” if it relied only on the query param.

**Change:** Persist debug mode into `sessionStorage` whenever `debugQuestion=1` is seen.
- `app.ts`: adds `ngOnInit` subscribing to Router events; on `NavigationStart` with `debugQuestion=1`, sets `sessionStorage['debugQuestion']='1'`.
- `question.component.ts`: reads debug flag from query param OR `sessionStorage`; overlay shows `debugSource` (query/session/off).
- Docs: appended “section 12” to debug snapshot.
**Commit:** `8352a36` — pushed to `origin/main`.

---

## What is still broken (current blocker)
### Symptom A (manual test)
On `http://localhost:4201/q/liberty`:
- The order improved (liberty displays first), but **Continue does nothing** (button remains active; answers remain selected).
- No service workers visible in DevTools (tested in Edge to avoid cached Chrome).

### Symptom B (debug instrumentation behavior)
- When debug overlay was working, Stephen saw overlay values indicating the app thought:
  - `phase: chooseOption`
  - `selectedOption: null`
  - `canContinue: false`
  - Yet it also displayed `totalFollowUpsForSelected: 4` (even with `selectedOption: null`) — suspicious and may be a clue.

### Symptom C (server not reachable)
After the sticky-debug commit, Stephen got:
- `ERR_CONNECTION_REFUSED` on `http://localhost:4201`  
Meaning: **dev server not running on 4201** (or it crashed, or it’s on a different port).

---

## What we know about the “fu:” namespaced followup fix
Copilot ran a verification prompt and reported the followup namespacing fix is fully present on `main`:
- `followUpAnswerKey` (fu:) present
- Template uses `getFollowUpAnswer()`
- Getter uses namespaced key
- `canContinue()` uses namespaced key
- onAnswerChange writes namespaced key
- tests verify `fu:` prefix

So: the blocker is **not** “missing the namespacing implementation”.

---

## Minimum reproducible flows
### Flow 1 — category ordering (previously failing; should now pass)
1. Go to `/select`
2. Select categories: liberty then equality
3. Continue
Expected: first category shown is liberty.

### Flow 2 — TLQ → followups transition (currently failing / unclear)
1. Go to `/q/liberty` (after selecting categories)
2. Answer TLQ(s)
3. Click Continue
Expected: enter followups phase and/or move forward.  
Observed: Continue appears to do nothing; UI state looks “stuck”.

---

## What to do first next time (do these before any new code edits)
1) **Start the server and confirm the port**
- Run `npm run start:4201` and keep the terminal open.
- Confirm the terminal output shows it is listening on `http://localhost:4201`.
- If it instead binds to 4200, use `npx ng serve --port 4201` and investigate why the script isn’t being used.

2) **Confirm you are testing the right origin**
- Open `http://localhost:4201/select` and proceed into `/q/liberty`.

3) **Turn on debug overlay (sticky)**
- Visit `http://localhost:4201/q/liberty?debugQuestion=1` once.
- Even if the URL is rewritten, overlay should still show with `debugSource: session`.
- If the overlay is not present, debug mode is not being read or the component is not mounting.

4) **Capture one “state snapshot” after a single click**
With overlay visible:
- Click one option (e.g., liberty-q0).
- Record only these overlay fields:
  - phase
  - selectedOption
  - canContinue
  - currentFollowUpIndex
  - totalFollowUpsForSelected
  - answeredFollowUps
If `selectedOption` stays null after clicking, the issue is likely the option click handler/binding.

---

## Likely root-cause branches (decision tree)
### Branch 1 — Option click isn’t updating state
**Signature:**
- After clicking an option, overlay still shows `selectedOption: null`.
**Likely causes:**
- Change/click handler not firing
- Incorrect binding (radio group / value)
- Disabled/overlay element intercepting clicks
**Next action (later, via ONE prompt):**
- Add overlay-only “lastAction” and log from the option change handler to prove it runs (no console required).

### Branch 2 — State updates but canContinue stays false
**Signature:**
- `selectedOption` changes, but `canContinue` stays false.
**Likely causes:**
- canContinue logic wrong for chooseOption phase
- requirement mismatch (e.g., expects followups answered before enabling Continue)
**Next action:**
- Inspect canContinue conditions for the current phase.

### Branch 3 — canContinue true but Continue click doesn’t advance
**Signature:**
- `canContinue: true` but clicking Continue does not change phase/route.
**Likely causes:**
- Continue handler not invoked
- Router navigation failing silently
- Guard bouncing back
**Next action:**
- Overlay-only navigation result logging (no console required).

### Branch 4 — You’re not running the app you think you’re running
**Signature:**
- port confusion, connection refused, or unexpected redirects.
**Next action:**
- re-establish “one server, one port, terminal running” and keep the scope to that.

---

## Key files involved
- `src/app/features/question.component.ts` — question flow, phase, selection, followups, Continue behavior, debug overlay.
- `src/app/core/.../session.store.ts` — category sequencing / session state (mentioned in postmortem).
- `src/app/app.ts` (or root component equivalent) — now captures debug flag into sessionStorage.
- `docs/status/postmortem-2025-12-21.md` — describes the manual failures and suspected roots.
- `docs/status/debug-snapshot-2025-12-21.md` — environment snapshot (ports, scripts at the time).
- `docs/status/stale-browser-code-runbook.md` — SW caching escape hatch and sanity checks.

---

## Last known state at stop
- `origin/main` contains commit `8352a36` (sticky debug flag).
- Stephen attempted to open `http://localhost:4201` and got **ERR_CONNECTION_REFUSED**.
- Stephen stopped due to frustration and asked for a handoff so the team can resume later.

---

## How a future GPT should behave
- Do NOT “helpfully” generate multiple prompts.
- Ask Stephen what he wants next. If he wants a prompt, produce **one** prompt only.
- Keep it tiny. Prefer read-only investigation prompts first.
- Prefer overlay-only debugging over console logs if Stephen dislikes console noise.
- Always include Proof-of-Read + Prompt Review Gate + Green Gate in Copilot prompts.

END.
