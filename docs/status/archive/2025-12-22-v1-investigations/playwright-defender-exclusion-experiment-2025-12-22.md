# Playwright Defender Exclusion Experiment — 2025-12-22

## 1) Baseline environment

node -v
v20.19.5

node -p "process.execPath"
C:\Program Files\nodejs\node.exe

where node
C:\Program Files\nodejs\node.exe

npm -v
10.8.2

npm ls playwright @playwright/test
rawls-game@0.0.0 C:\Users\schur\workspaces\Rawls\JustSprites
└─┬ @playwright/test@1.57.0
  └── playwright@1.57.0

## 2) Baseline canary test (before exclusions)

Command:
node -e "const { chromium } = require('playwright'); const run=async()=>{ const b=await chromium.launch({headless:true}); const p=await b.newPage(); await Promise.race([p.setContent('<html><body>ok</body></html>'), new Promise((_,rej)=>setTimeout(()=>rej(new Error('SETCONTENT_TIMEOUT_10s')),10000))]); await b.close(); console.log('OK'); }; run().catch(e=>{ console.error(e&&e.stack||String(e)); process.exitCode=1; });"

Result: **HANG** — Ran for 5+ minutes before manual cancellation. Did NOT print OK.

## 3) Defender state snapshot (before exclusions)

Get-MpComputerStatus:
AMServiceEnabled          : True
AntispywareEnabled        : True
AntivirusEnabled          : True
BehaviorMonitorEnabled    : True
RealTimeProtectionEnabled : True
IsTamperProtected         : True
IoavProtectionEnabled     : True
OnAccessProtectionEnabled : True

Get-MpPreference (partial):
EnableControlledFolderAccess : 0
PUAProtection                : 2

ExclusionPath: N/A: Must be an administrator to view exclusions
ExclusionProcess: N/A: Must be an administrator to view exclusions

## 4) Human steps to add exclusions (do not execute — for Stephen)

A) Open Windows Security → Virus & threat protection → Manage settings → Exclusions → Add or remove exclusions.

B) Add Folder exclusion:
   %LOCALAPPDATA%\ms-playwright\

C) Add Process exclusion (use exact path from section 1):
   C:\Program Files\nodejs\node.exe

D) (Optional) Add Folder exclusion for temp minimal-project folder:
   %TEMP%\pw-min-sanity-2025-12-22

E) Re-run the same canary command from section 2.

## 5) What to run after exclusions (next prompt will capture)

After adding the exclusions above, run this command and record whether it prints OK or times out:

node -e "const { chromium } = require('playwright'); const run=async()=>{ const b=await chromium.launch({headless:true}); const p=await b.newPage(); await Promise.race([p.setContent('<html><body>ok</body></html>'), new Promise((_,rej)=>setTimeout(()=>rej(new Error('SETCONTENT_TIMEOUT_10s')),10000))]); await b.close(); console.log('OK'); }; run().catch(e=>{ console.error(e&&e.stack||String(e)); process.exitCode=1; });"

Expected outcomes:
- If OK prints: Defender exclusions fixed it → update TD-RAWLS-001 with workaround
- If still hangs: Defender is not the cause → continue investigating

## 6) Defender exclusions (after)

Get-MpPreference | Select-Object -ExpandProperty ExclusionPath
N/A: Must be an administrator to view exclusions (terminal not elevated)

Get-MpPreference | Select-Object -ExpandProperty ExclusionProcess
N/A: Must be an administrator to view exclusions (terminal not elevated)

Note: Stephen confirmed exclusions were added via Windows Security UI before this test.

## 7) Canary test (after exclusions)

Command: same as section 2

Result: **HANG** — Ran for 5+ minutes before manual cancellation. Did NOT print OK.

## 8) Delta (before vs after)

- Baseline canary: HANG (5+ min)
- After exclusions canary: **HANG (5+ min)** — NO CHANGE
- Exclusions visible: NO (requires admin elevation to view)
- Exclusions added: YES (confirmed by Stephen via Windows Security UI)

## 9) Conclusion

**Defender exclusions did NOT fix the Playwright page API hang.**

This rules out Windows Defender real-time protection as the root cause.

Remaining hypotheses:
1. System-level pipe/socket configuration issue
2. Intel Arc GPU driver interference with browser IPC
3. Windows 11 specific kernel/networking issue
4. Playwright bug specific to this Windows build
