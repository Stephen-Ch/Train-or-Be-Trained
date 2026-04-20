# Stale Browser Code / Service Worker Caching Runbook

When you see old JavaScript running despite code changes, this runbook will help.

---

## 1) Fast Escape Hatch

**Quickest fix — use a different port + incognito:**

```bash
npm run start:4201
```

Then open **Incognito/Private window** → `http://localhost:4201`

This bypasses any cached SW on port 4200.

---

## 2) Verify Which Origin You're On

Check the browser address bar:

| URL | What it is |
|-----|------------|
| `http://localhost:4200` | Angular dev server (`npm start`) |
| `http://localhost:4201` | Angular dev server (alternate port) |
| `http://localhost:8080` | Static dist (`npm run serve:dist`) |

If you're on 4200 but expected fresh code, a stale Service Worker may be serving cached assets.

---

## 3) DevTools: Unregister Service Worker

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Find any registered SW (scope: `http://localhost:4200/`)
5. Click **Unregister**

---

## 4) DevTools: Clear Site Data

1. Open Chrome DevTools → **Application** tab
2. Click **Storage** in left sidebar
3. Check all boxes (especially "Cache storage", "Service workers")
4. Click **Clear site data**

---

## 5) Network Tab: Disable Cache

1. Open Chrome DevTools → **Network** tab
2. Check **Disable cache** (only works while DevTools is open)
3. Hard reload: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## 6) Known-Good Workflow

### Development Work
```bash
npm start              # → http://localhost:4200
# or if 4200 is "stuck":
npm run start:4201     # → http://localhost:4201
```

### Check Production Build
```bash
npm run build          # Build to dist/rawls-game/browser
npm run serve:dist     # → http://localhost:8080 (no cache)
```

### Rules
- **Never serve `dist/` on port 4200** — the SW will take over
- **Don't mix ports** — pick one and stick with it for that session
- **Use incognito** for quick sanity checks

---

## 7) Nuclear Option

If all else fails:

```powershell
# Kill all node processes
taskkill /F /IM node.exe

# Delete build artifacts
Remove-Item -Recurse -Force dist/, .angular/

# Clear browser: Settings → Privacy → Clear browsing data → All time

# Rebuild and start fresh
npm run build
npm start
```

---

## Why This Happens

Angular's PWA Service Worker (`ngsw-worker.js`) is enabled in production builds:

```typescript
// app.config.ts
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),  // ← disabled in dev, enabled in prod
  registrationStrategy: 'registerWhenStable:30000'
})
```

If you:
1. Run `npm run build` (creates production build with SW)
2. Serve it on port 4200 (e.g., via `npx serve dist/...`)
3. Visit `http://localhost:4200` in browser

The SW registers at scope `http://localhost:4200/` and caches all assets.

Later, when you run `ng serve` (dev mode) on the same port, the **already-registered SW** intercepts requests and serves cached assets — ignoring your dev server entirely.

---

*Created: 2025-12-21*
