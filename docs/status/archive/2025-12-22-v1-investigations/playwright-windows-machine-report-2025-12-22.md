# Playwright Windows Machine Report — 2025-12-22

**Purpose:** Diagnose Playwright/Chromium hang on TD-RAWLS-001

---

## A) OS + Hardware

**systeminfo:**
OS Name:                       Microsoft Windows 11 Home
OS Version:                    10.0.26100 N/A Build 26100
System Model:                  XPS 15 9530
System Type:                   x64-based PC
Total Physical Memory:         32,439 MB

**Win32_ComputerSystem:**
Manufacturer: Dell Inc.
Model: XPS 15 9530
TotalPhysicalMemory: 34014814208

**Win32_Processor:**
Name: 13th Gen Intel(R) Core(TM) i7-13620H
NumberOfCores: 10
NumberOfLogicalProcessors: 16

---

## B) GPU + Driver

**Win32_VideoController:**

| Name | DriverVersion | AdapterRAM |
|------|---------------|------------|
| Intel(R) UHD Graphics | 32.0.101.7077 | 2147479552 |
| Intel(R) Arc(TM) A370M Graphics | 32.0.101.8132 | 2147479552 |

---

## C) Node/npm + Paths

node -v: v20.19.5
npm -v: 10.8.2

where node:
C:\Program Files\nodejs\node.exe
C:\nvm4w\nodejs\node.exe

where npm:
C:\Program Files\nodejs\npm
C:\Program Files\nodejs\npm.cmd
C:\nvm4w\nodejs\npm
C:\nvm4w\nodejs\npm.cmd

---

## D) Playwright Version + Browsers + Install Location

npx playwright --version: Version 1.57.0

npx playwright show-browsers: error: unknown command 'show-browsers' (Command exited with code 1)

PLAYWRIGHT_BROWSERS_PATH: (empty/not set)

dir $env:LOCALAPPDATA\ms-playwright:

| Folder | LastWriteTime |
|--------|---------------|
| chromium_headless_shell-1181 | 7/14/2025 11:19 AM |
| chromium_headless_shell-1187 | 9/14/2025 8:30 AM |
| chromium_headless_shell-1194 | 10/10/2025 11:15 AM |
| chromium_headless_shell-1200 | 11/26/2025 6:48 PM |
| chromium-1181 | 7/14/2025 11:19 AM |
| chromium-1187 | 9/14/2025 8:30 AM |
| chromium-1194 | 10/10/2025 11:15 AM |
| chromium-1200 | 11/26/2025 6:48 PM |
| firefox-1489 | 7/14/2025 11:19 AM |
| firefox-1490 | 9/14/2025 8:30 AM |
| firefox-1495 | 10/10/2025 11:15 AM |
| webkit-2191 | 7/14/2025 11:19 AM |
| webkit-2203 | 9/14/2025 8:30 AM |
| webkit-2215 | 10/10/2025 11:15 AM |

---

## E) Proxy Environment

netsh winhttp show proxy: Direct access (no proxy server).

HTTP_PROXY: (empty)
HTTPS_PROXY: (empty)
NO_PROXY: (empty)

---

## F) Security Software

**AntiVirusProduct:**

| displayName | productState |
|-------------|--------------|
| Windows Defender | 397568 |

---

## G) Repo-Local Context

git rev-parse --show-toplevel: C:/Users/schur/workspaces/Rawls/JustSprites
git branch --show-current: main
git rev-parse HEAD: 08d8e162e46470fae07b26186e13cead6748497d
git status --porcelain: (clean)

---

## Notes

| Question | Answer |
|----------|--------|
| Corporate/work-managed machine? | NO (personal) |
| VPN currently on? | NO |

---

## Observations for ChatGPT

1. Multiple Chromium versions installed in ms-playwright (1181, 1187, 1194, 1200) — possible version mismatch with Playwright 1.57.0
2. Two node.exe paths (Program Files + nvm4w) — potential path confusion
3. Intel Arc A370M discrete GPU — known to have Chromium compatibility quirks
4. Windows Defender active (productState 397568 = enabled + up-to-date)
5. No proxy configured
6. Playwright 1.57.0 does not recognize show-browsers command — may need different diagnostic command
