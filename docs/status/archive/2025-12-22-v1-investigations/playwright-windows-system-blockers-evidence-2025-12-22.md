# Playwright Windows System Blockers Evidence — 2025-12-22

## 1) Baseline identity

node -v
v20.19.5

node -p "process.execPath"
C:\Program Files\nodejs\node.exe

npm ls playwright @playwright/test
rawls-game@0.0.0 C:\Users\schur\workspaces\Rawls\JustSprites
└─┬ @playwright/test@1.57.0
  └── playwright@1.57.0

systeminfo | Select-String "OS Name|OS Version"
OS Name:                       Microsoft Windows 11 Home
OS Version:                    10.0.26100 N/A Build 26100
BIOS Version:                  Dell Inc. 1.27.0, 10/27/2025

## 2) Windows mitigations (system)

Get-ProcessMitigation -System | Format-List

Dep             : Microsoft.Samples.PowerShell.Commands.DEPPolicy
Aslr            : Microsoft.Samples.PowerShell.Commands.ASLRPolicy
StrictHandle    : Microsoft.Samples.PowerShell.Commands.StrictHandlePolicy
SystemCall      : Microsoft.Samples.PowerShell.Commands.SystemCallPolicy
ExtensionPoint  : Microsoft.Samples.PowerShell.Commands.ExtensionPointPolicy
DynamicCode     : Microsoft.Samples.PowerShell.Commands.DynamicCodePolicy
Cfg             : Microsoft.Samples.PowerShell.Commands.CFGPolicy
BinarySignature : Microsoft.Samples.PowerShell.Commands.BinarySignaturePolicy
FontDisable     : Microsoft.Samples.PowerShell.Commands.FontDisablePolicy
ImageLoad       : Microsoft.Samples.PowerShell.Commands.ImageLoadPolicy
Payload         : Microsoft.Samples.PowerShell.Commands.PayloadPolicy
ChildProcess    : Microsoft.Samples.PowerShell.Commands.ChildProcessPolicy
UserShadowStack : Microsoft.Samples.PowerShell.Commands.UserShadowStackPolicy
Sehop           : Microsoft.Samples.PowerShell.Commands.SEHOPPolicy
Heap            : Microsoft.Samples.PowerShell.Commands.HeapPolicy
ProcessName     : System
Source          : System Defaults
Id              : 0

Get-ProcessMitigation -Name "C:\Program Files\nodejs\node.exe" | Format-List
(no output — node.exe has no per-process overrides)

## 3) Security hardening flags (registry)

Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity"

Enabled       : 1
EnabledBootId : 0
WasEnabledBy  : 1

Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard"

CachedDrtmAuthIndex                     : 0
RequireMicrosoftSignedBootChain         : 1
WasEnabledBy                            : 1
EnableVirtualizationBasedSecurity       : 1
HyperVVirtualizationBasedSecurityOptout : 0

Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy"

EmodePolicyRequired             : 0
SkuPolicyRequired               : 0
VerifiedAndReputablePolicyState : 0

## 4) Filter drivers (fltmc)

whoami (Admin PowerShell)
xps-15\schur

fltmc (Admin PowerShell)

Filter Name                     Num Instances    Altitude    Frame
------------------------------  -------------  ------------  -----
bindflt                                 1       409800         0
UCPD                                    9       385250.5       0
WdFilter                                9       328010         0
storqosflt                              0       244000         0
wcifs                                   0       189900         0
CldFlt                                  3       180451         0
bfs                                    11       150000         0
FileCrypt                               0       141100         0
luafv                                   1       135000         0
UnionFS                                 0       130850         0
npsvctrig                               1        46000         0
Wof                                     7        40700         0
FileInfo                                9        40500         0

## 5) Key takeaways (facts only)

- Memory Integrity (HVCI) Enabled = 1 (active)
- Virtualization Based Security EnableVirtualizationBasedSecurity = 1 (active)
- RequireMicrosoftSignedBootChain = 1 (Secure Boot chain enforced)
- Smart App Control VerifiedAndReputablePolicyState = 0 (not enforcing)
- Node.exe has no per-process mitigation overrides
- fltmc captured successfully: YES
- Filter drivers present (all appear to be Microsoft/Windows built-in):
  - bindflt (Windows container bind filter)
  - UCPD (User-mode Copy Protection Driver)
  - WdFilter (Windows Defender)
  - storqosflt (Storage QoS)
  - wcifs (Windows Container Isolation)
  - CldFlt (Cloud Files filter)
  - bfs (Boot File System)
  - FileCrypt (File encryption)
  - luafv (LUA File Virtualization)
  - UnionFS (Union file system)
  - npsvctrig (Named Pipe Service Trigger)
  - Wof (Windows Overlay Filter)
  - FileInfo (File information)
- No obvious third-party filter drivers detected

- Memory Integrity (HVCI) Enabled = 1 (active)
- Virtualization Based Security EnableVirtualizationBasedSecurity = 1 (active)
- RequireMicrosoftSignedBootChain = 1 (Secure Boot chain enforced)
- Smart App Control VerifiedAndReputablePolicyState = 0 (not enforcing / evaluation mode off)
- Node.exe has no per-process mitigation overrides
- fltmc requires Admin elevation — filter driver list not yet captured
