---
phase: 8
plan: 1
wave: 1
depends_on: []
gap_closure: false
---

# Plan 8.1: Vercel Sub-Path Routing & Reverse Proxy Federation

## Objective
Configure sub-path routing and reverse-proxy rewrites in `vercel.json` so that all three simulators (`/arduino`, `/esp32`, `/rpi`) are served from the primary domain (`ayosim.vercel.app`), configure path-scoped COOP/COEP headers, and update Portal launcher links to target first-party routes.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- .gsd/DECISIONS.md
- .gsd/phases/8/RESEARCH.md
- vercel.json
- index.html
- js/main.js

## Tasks

<task type="auto">
  <name>Configure Sub-Path Rewrites & Scoped Headers in vercel.json</name>
  <files>
    vercel.json
  </files>
  <action>
    1. Update `vercel.json` to add reverse-proxy `rewrites`:
       - `/arduino/:path*` -> `https://ayosim-arduino.vercel.app/arduino/:path*`
       - `/esp32/:path*` -> `https://ayosim-esp32.vercel.app/esp32/:path*`
       - `/rpi/:path*` -> `https://ayosim-rpi.vercel.app/rpi/:path*`
    2. Add path-scoped security headers for simulator routes:
       - Ensure `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` are applied specifically to `/(arduino|esp32|rpi)/(.*)` to support Web Workers and SharedArrayBuffer without affecting the root portal.
    3. Retain existing portal caching and security headers for `/assets/`, `/css/`, `/js/`, and `/i18n/`.
  </action>
  <verify>
    powershell -Command "Get-Content vercel.json | ConvertFrom-Json | Select-Object -ExpandProperty rewrites"
  </verify>
  <done>
    `vercel.json` contains valid rewrites for `/arduino`, `/esp32`, and `/rpi` with appropriate path-scoped isolation headers.
  </done>
</task>

<task type="auto">
  <name>Update Portal Links & Provisioning Modal to First-Party Sub-Paths</name>
  <files>
    index.html
    js/main.js
  </files>
  <action>
    1. Update simulator card URLs in `index.html`:
       - Change Arduino link from external URL to `/arduino/`
       - Change ESP32 link from external URL to `/esp32/`
       - Change Raspberry Pi link from external URL to `/rpi/`
    2. Update target URL references in `js/main.js`:
       - In `launchSimulator(boardType)`, set `targetUrl` to `/arduino/`, `/esp32/`, or `/rpi/`.
       - Ensure provisioning sequence smoothly transitions to the local sub-path without full domain hops.
    3. Bump script version tag in `index.html` (`main.js?v=2.3`).
  </action>
  <verify>
    powershell -Command "Select-String -Path 'js/main.js' -Pattern '/arduino/|/esp32/|/rpi/'"
  </verify>
  <done>
    Simulator links in `index.html` and transition targets in `js/main.js` point to `/arduino/`, `/esp32/`, and `/rpi/`.
  </done>
</task>
