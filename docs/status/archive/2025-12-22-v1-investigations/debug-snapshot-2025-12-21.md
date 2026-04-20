# Debug Snapshot — 2025-12-21

## 1) Git

### git rev-parse --show-toplevel
```
C:/Users/schur/workspaces/Rawls/JustSprites
```

### git branch --show-current
```
main
```

### git rev-parse HEAD
```
fba942d94a23b62bd1e20e798b0a7c073af9e8f5
```

### git log -1 --oneline --decorate
```
fba942d (HEAD -> main, origin/main) fix: use content-file order for category sequence (Bug #1)
```

### git status --porcelain
```
(empty - clean working tree)
```

### git remote -v
```
origin  https://github.com/Stephen-Ch/rawls.git (fetch)
origin  https://github.com/Stephen-Ch/rawls.git (push)
```

---

## 2) Toolchain

### node -v
```
v22.19.0
```

### npm -v
```
10.9.3
```

### npx ng version
```
     _                      _                 ____ _     ___
    / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
   / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
  / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
 /_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
                |___/



Angular CLI: 20.3.9
Node: 22.19.0
Package Manager: npm 10.9.3
OS: win32 x64


Angular: 20.3.10
... common, compiler, compiler-cli, core, forms
... platform-browser, router, service-worker

Package                      Version
------------------------------------
@angular-devkit/architect    0.2003.9
@angular-devkit/core         20.3.9
@angular-devkit/schematics   20.3.9
@angular/build               20.3.9
@angular/cli                 20.3.9
@schematics/angular          20.3.9
rxjs                         7.8.2
typescript                   5.9.3
```

---

## 3) How to run (from repo docs)

### README.md
```markdown
## 🚀 Quick Start

### Prerequisites
- Python 3.x (for local development server)
- Node.js (for testing and build validation)

### Running the Application

**Option 1: Using npm scripts**
```bash
npm run build    # Validate all files are ready
npm start        # Start local server on http://localhost:8080
```

**Option 2: Using batch file (Windows)**
```bash
start.bat        # Comprehensive startup with info
```

**Option 3: Direct Python server**
```bash
python -m http.server 8080
```

### Testing
```bash
npm test         # Run all 236 tests
```
```

### docs/project/QUICKSTART.md
```markdown
# Quickstart - Rawls Game

1) Clone repo (outside OneDrive/Dropbox)
2) Install + test:
npm ci
npm run test
npm run build

3) Start dev server:
npm start

4) Open http://localhost:4200
5) Follow Boot Prompt in copilot-instructions-rawls.md
```

### docs/Start-Here-For-AI.md
```markdown
## Green Gate (Rawls Game)
Required gates for code prompts:
- npm run test
- npm run build

If content pipeline inputs were touched (content/*, scripts/content-*, src/assets/content/rawls-values.generated.json):
- npm run content:lint
- npm run content:export-app
- then npm run test + npm run build
```

---

## 4) package.json scripts

```json
"scripts": {
  "ng": "ng",
  "start": "ng serve",
  "content:build": "node scripts/content-build.js",
  "content:lint": "node scripts/content-lint.js",
  "content:export-app": "node ./scripts/content-export-app.js",
  "prebuild": "node scripts/content-build.js",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test --watch=false --browsers=ChromeHeadless",
  "e2e": "playwright test"
}
```

---

## 5) What's listening right now (ports/processes)

### Get-NetTCPConnection (ports 4200, 4201, 4300, 5173, 3000, 8080)
```
(no output - nothing listening on these ports)
```

### Get-Process node
```
(no output - no node processes running)
```

---

## Summary

| Item | Value |
|------|-------|
| Repo root | `C:/Users/schur/workspaces/Rawls/JustSprites` |
| Branch | `main` |
| HEAD | `fba942d` |
| Working tree | Clean |
| Node | v22.19.0 |
| npm | 10.9.3 |
| Angular CLI | 20.3.9 |
| Angular | 20.3.10 |
| Dev server command | `npm start` (ng serve) |
| Dev server port | 4200 |
| Prod build | `npm run build` → `dist/rawls-game/browser/` |
| Listening ports | None |
| Node processes | None |

---

## 6) PWA / Service Worker audit

### A) Angular "serviceWorker" build setting

**File: angular.json (lines 36-54)**
```json
"configurations": {
  "production": {
    "budgets": [
      {
        "type": "initial",
        "maximumWarning": "500kB",
        "maximumError": "1MB"
      },
      {
        "type": "anyComponentStyle",
        "maximumWarning": "4kB",
        "maximumError": "8kB"
      }
    ],
    "outputHashing": "all",
    "serviceWorker": "ngsw-config.json"   // <-- SW ENABLED IN PRODUCTION
  },
  "development": {
    "optimization": false,
    "extractLicenses": false,
    "sourceMap": true
    // <-- NO serviceWorker in development
  }
},
"defaultConfiguration": "production"
```

**Key finding:** Service Worker is enabled for `production` builds but NOT for `development` builds.

---

### B) Service Worker provider/module registration

**File: src/app/app.config.ts (lines 5, 11-14)**
```typescript
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),                          // <-- DISABLED in dev mode
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
```

**File: src/app/core/update/update.service.ts (lines 16-31)**
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    this._updateAvailable.set(true);
  });

  navigator.serviceWorker.ready.then(registration => {
    if (registration.waiting) {
      this._updateAvailable.set(true);
    }
  });
}
```

**Key finding:** SW registration uses `enabled: !isDevMode()` — disabled in dev, enabled in prod.

---

### C) PWA manifest + ngsw config presence

| File | Exists | Location |
|------|--------|----------|
| manifest.webmanifest | ✅ Yes | `public/manifest.webmanifest` |
| manifest.json | ✅ Yes | `public/manifest.json` |
| ngsw-config.json | ✅ Yes | `ngsw-config.json` (repo root) |
| icons/ | ✅ Yes | `public/icons/` |

**ngsw-config.json (full file):**
```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.csr.html",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/**/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
        ]
      }
    }
  ]
}
```

**manifest.webmanifest (first 20 lines):**
```json
{
  "name": "rawls-game",
  "short_name": "rawls-game",
  "display": "standalone",
  "scope": "./",
  "start_url": "./",
  "icons": [
    { "src": "icons/icon-72x72.png", "sizes": "72x72", "type": "image/png", "purpose": "maskable any" },
    { "src": "icons/icon-96x96.png", "sizes": "96x96", "type": "image/png", "purpose": "maskable any" },
    ...
  ]
}
```

---

### D) Build output hints (dist/ exists)

**Contents of dist/rawls-game/browser/:**
```
assets/
favicon.ico
icons/
index.html
main-GZJQUGRK.js
manifest.json
manifest.webmanifest
ngsw-worker.js          <-- SERVICE WORKER PRESENT
ngsw.json               <-- SW CONFIG PRESENT
safety-worker.js
styles-ZEBNKTNM.css
worker-basic.min.js
```

**Key finding:** Production build includes `ngsw-worker.js` and `ngsw.json` — SW is compiled into dist.

---

### E) Human-required browser check (Stephen must do this)

**Checklist for manual verification:**

- [ ] Open Chrome DevTools → Application tab → Service Workers
  - Is a service worker registered? (scope: `http://localhost:xxxx/`)
  - What is its status? (activated, waiting, redundant?)
  - What script is it running? (`ngsw-worker.js`?)

- [ ] Application → Storage section
  - Click "Clear site data" (checks all boxes)
  - Click "Unregister" next to any service workers

- [ ] After clearing:
  - Hard refresh (Ctrl+Shift+R)
  - Check if SW re-registers (it should NOT in dev mode via `ng serve`)
  - It WILL register if serving production build

**Important:** If you previously ran a production build (`npm run build`) and served it, the SW may still be cached even when running `ng serve` afterward. The SW scope captures all requests to that origin/port.

---

### PWA/SW Audit Summary

| Question | Answer |
|----------|--------|
| Is SW configured? | ✅ Yes, in angular.json + app.config.ts |
| Is SW enabled in dev mode? | ❌ No (`enabled: !isDevMode()`) |
| Is SW enabled in prod build? | ✅ Yes |
| Does dist/ contain SW files? | ✅ Yes (`ngsw-worker.js`, `ngsw.json`) |
| Could a stale SW cause caching issues? | ⚠️ **YES** — if prod was served, SW persists |

---

*PWA audit appended: 2025-12-21*

---

## 7) Serve config + likely collision points

### A) angular.json serve options

**File: angular.json (lines 63-75)**
```json
"serve": {
  "builder": "@angular/build:dev-server",
  "configurations": {
    "production": {
      "buildTarget": "rawls-game:build:production"
    },
    "development": {
      "buildTarget": "rawls-game:build:development"
    }
  },
  "defaultConfiguration": "development"
}
```

**Observations:**
- No explicit `port` option → defaults to **4200**
- No explicit `host` option → defaults to **localhost**
- No `ssl` option → defaults to **http** (not https)
- No `proxyConfig` option → **no API proxy**
- `defaultConfiguration: "development"` → `npm start` runs dev build

---

### B) Proxy config

**Search result:** No `proxyConfig` referenced in angular.json.

No proxy configuration file exists.

---

### C) Base href / deploy assumptions

**File: src/index.html (line 7)**
```html
<base href="/">
```

**Search results for baseHref/deployUrl/APP_BASE_HREF:**
- Only match: `src/index.html:7` — `<base href="/">`
- No `baseHref` in angular.json build options
- No `deployUrl` configured
- No `APP_BASE_HREF` provider

**Key finding:** Base href is `/` — app expects to be served from root.

---

### D) Custom server or static hosting in repo

**package.json scripts:**
```json
"start": "ng serve"
```

**Search for http-server/express/lite-server:**
- `express` appears only in `package-lock.json` (transitive dependency of Angular dev server)
- No custom Express server in repo
- No `http-server` in dependencies
- No `lite-server` in dependencies

**Documentation references (not dependencies):**
- `docs/status/postmortem-2025-12-21.md`: `npx http-server dist/rawls-game/browser -p 8080 -c-1`
- `docs/handoffs/handoff-2025-12-21.md`: same command

**Key finding:** No custom server. Only `ng serve` (port 4200) or ad-hoc `npx http-server` (port 8080).

---

### Interpretation

| Scenario | Collision Risk |
|----------|----------------|
| `ng serve` uses port 4200 | If a previous `ng serve` is still running, new instance will fail with "port in use" |
| Production build served on 4200 | SW registered at `http://localhost:4200/` will intercept ALL requests, even from `ng serve` |
| `npx http-server` on 8080 | Different port, but if user visited 4200 first with SW, SW may redirect or serve stale assets |
| Base href is `/` | App expects root; if served from subpath, routing will break |
| No proxy config | All API calls go to same origin; no backend collision issues |

**Most likely collision source:**
⚠️ **A Service Worker registered at `http://localhost:4200/` from a previous production build will cache and serve stale JS even when `ng serve` rebuilds.**

**Resolution requires:**
1. Unregister SW in browser DevTools
2. Clear site data
3. Or serve dev on a different port: `ng serve --port 4201`

---

*Serve config audit appended: 2025-12-21*

---

## 8) Followup namespacing verification

### Git log (recent commits)
```
215abb0 (HEAD -> main, origin/main) chore: clarify dev/prod ports + add stale cache runbook
fba942d fix: use content-file order for category sequence (Bug #1)
2cfc440 fix: namespace followup answers to avoid TLQ collision (green)  ← THE FIX
10803cb test: add TLQ/followup collision RED-LOCK contract (TD-RAWLS-003)
```

### Is `followUpAnswerKey` (fu:) present?

**YES** — `src/app/features/question.component.ts` lines 415-421:

```typescript
/**
 * Generate a distinct answer key for followups to avoid collision with TLQ ids.
 * Format: fu:{categoryId}:{tlqId}:{followupIndex}
 */
private followUpAnswerKey(categoryId: string, tlqId: string, followupIndex: number): string {
  return `fu:${categoryId}:${tlqId}:${followupIndex}`;
}
```

### Does followup template read answers via namespaced key?

**YES** — `src/app/features/question.component.ts` line 109:

```html
[checked]="getFollowUpAnswer() === likertIndex + 1"
```

And `getFollowUpAnswer()` at lines 427-431 uses the namespaced key:

```typescript
getFollowUpAnswer(): number | undefined {
  const tlqId = this.selectedOption();
  if (!tlqId) return undefined;
  const key = this.followUpAnswerKey(this.currentId, tlqId, this.currentFollowUpIndex());
  return this.sessionStore.answers()[key];
}
```

### Continue click handler

**File:** `src/app/features/question.component.ts`  
**Method:** `onContinue()` at line 489

In `chooseOption` phase (TLQ → followups transition), lines 490-504:
```typescript
if (this.phase() === 'chooseOption') {
  const first = this.options()[0];
  if (!first) {
    this.navigateAfterAction();
    return;
  }
  // TEST A: entering followups sets resume pointer to challenges
  this.sessionStore.setResumePointer({
    categoryId: this.currentId,
    phase: 'challenges',
    tlqId: first,
    followupIndex: 0
  });
  this.router.navigate(['/q', this.currentId, 'followups', first]);
  return;
}
```

### `canContinue()` uses namespaced key?

**YES** — `src/app/features/question.component.ts` lines 279-291:

```typescript
canContinue = computed(() => {
  if (this.phase() === 'chooseOption') {
    const total = this.totalFollowUpsForSelected();
    return total > 0 && this.answeredFollowUps() === total;
  }
  
  // In followUps phase, check if current followup is answered using namespaced key
  const tlqId = this.selectedOption();
  if (!tlqId) return false;
  
  const key = this.followUpAnswerKey(this.currentId, tlqId, this.currentFollowUpIndex());
  const answers = this.sessionStore.answers();
  return answers[key] !== undefined;
});
```

### `onAnswerChange()` writes namespaced key?

**YES** — `src/app/features/question.component.ts` lines 468-473:

```typescript
// Use namespaced key to avoid collision with TLQ id
const tlqId = this.selectedOption();
if (!tlqId) return;
const key = this.followUpAnswerKey(this.currentId, tlqId, this.currentFollowUpIndex());
this.sessionStore.recordAnswer(key, normalizedValue);
```

### Tests confirm namespacing?

**YES** — `src/app/features/question.component.spec.ts` lines 280, 288:

```typescript
expect(sessionStore.recordAnswer).toHaveBeenCalledWith('fu:A:AF1:0', 5);
expect(sessionStore.recordAnswer).toHaveBeenCalledWith('fu:A:AF2:0', 1);
```

### Any suspicious TODO/tech-debt notes?

**NONE FOUND** in the followup namespacing area.

---

### Summary

| Check | Status | Evidence |
|-------|--------|----------|
| `followUpAnswerKey` present? | ✅ YES | line 419 |
| Template uses `getFollowUpAnswer()`? | ✅ YES | line 109 |
| `getFollowUpAnswer()` uses namespaced key? | ✅ YES | line 430 |
| `canContinue()` uses namespaced key? | ✅ YES | line 289 |
| `onAnswerChange()` writes namespaced key? | ✅ YES | line 472 |
| Tests verify `fu:` prefix? | ✅ YES | spec lines 280, 288 |

**Conclusion:** The namespaced followup answer fix (TD-RAWLS-003) is fully present on main. If the bug still manifests in the browser, it's due to **stale cached code** (Service Worker), not missing implementation.

---

*Followup namespacing verification appended: 2025-12-21*

---

## 9) Debug Overlay (TD-RAWLS-004)

### Purpose

Added `?debugQuestion=1` query parameter to display a diagnostic overlay and trace Continue button behavior.

### Changes Made (commit `a892943`)

**question.component.ts:**

1. **New signal:** `debugQuestionEnabled = signal(false)` — activated by `?debugQuestion=1`
2. **Router made public:** `public router = inject(Router)` for template access
3. **Debug overlay in template:**
   ```html
   @if (debugQuestionEnabled()) {
     <pre data-testid="debug-question">
       phase: {{ isFollowUps() ? 'followups' : 'tlq' }}
       categoryId: {{ currentId }}
       ...
     </pre>
   }
   ```
4. **Phase wrappers:** Added `data-testid="phase-tlq"` and `data-testid="phase-followups"` for test automation
5. **Continue tracing:** Instrumented `onContinue()` with console.log for:
   - `CONTINUE_CLICK` — state snapshot at click time
   - `CONTINUE_BRANCH` — which code path was taken
   - `NAVIGATE_TO` / `NAVIGATE_RESULT` / `NAVIGATE_ERROR` — navigation outcomes

### Usage

```
http://localhost:4200/q/A?debugQuestion=1
```

Open DevTools Console to see:
- `CONTINUE_CLICK { phase, categoryId, currentCategory, isLastQ, selectedOption, hasFollowups }`
- `CONTINUE_BRANCH: tlq -> navigateToFollowUps` (or other branch)
- `NAVIGATE_TO ['/q', 'A', 'followups', 'AF1']`
- `NAVIGATE_RESULT [...] result=true`

### Test Fix

Initial implementation caused 3 test failures:
```
TypeError: Cannot read properties of undefined (reading 'then')
```

**Root cause:** `this.router.navigate(...)` returns `undefined` in tests (mock router).

**Fix:** Changed `.then(` to `?.then(` (optional chaining).

---

*Debug overlay section appended: 2025-12-21*

---

## 12) Sticky debugQuestion flag (session)

- Root component (`app.ts`) captures `debugQuestion=1` on NavigationStart and stores to `sessionStorage`
- Question component reads from both query param OR `sessionStorage.getItem('debugQuestion')`
- Overlay now shows `debugSource: query | session | off` to confirm sticky behavior

---

*Sticky debugQuestion section appended: 2025-12-21*
