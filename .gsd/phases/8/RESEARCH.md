---
phase: 8
researched_at: 2026-11-22
discovery_level: 2
---

# Phase 8 Research: Unified Simulator Ecosystem Federation

## Objective
Establish the technical architecture to combine AyoSim's three hardware simulators (AyoSim-Arduino, AyoSim-ESP32, AyoSim-Raspberry) and the AyoSim Portal under one cohesive domain and user experience (`ayosim.vercel.app`), enabling instant board switching, shared navigation, unified Supabase authentication, and centralized cloud project saves—while maintaining 100% process isolation and zero memory/WebGL crash risk.

## Discovery Level
**Level 2** — Standard Research (Multi-App Routing, Federation, & Shared Auth Architecture)

---

## Architectural Analysis: Why Process Isolation is Mandatory

| Vector | Monolithic Single-Bundle (Bad) | Ecosystem Federation via Sub-Paths (Recommended) |
|---|---|---|
| **Memory Footprint** | 600MB–1.2GB (WASM heaps + 3D meshes) | 80MB–150MB per board (isolated heap) |
| **WebGL Contexts** | Frequent context loss on rapid board swaps | Fresh WebGL context per board session |
| **Compiler Runtimes** | Clang WASM + Pyodide collision in 1 JS scope | Clang in `/arduino/`, Pyodide in `/esp32/` & `/rpi/` |
| **COOP/COEP Headers** | Strict isolation risks breaking Portal OAuth | Isolated to simulator sub-paths (`/arduino/*`, etc.) |
| **Deployment Risk** | Single bug breaks entire platform | Independent deploy & zero cross-app regression |

---

## Key Decisions

### Decision 1: Sub-Path Routing via Vercel Reverse Proxy Rewrites
- **Options Considered**:
  1. *Subdomain segregation (`arduino.ayosim.com`)*: Keeps apps separate, but feels like different websites, and complicates cross-origin cookies.
  2. *iFrames inside Portal*: Causes double scrollbars, poor mobile responsiveness, and iframe security sandbox restrictions for Web Workers / SharedArrayBuffer.
  3. *Vercel Reverse Proxy Rewrites*: The Portal's `vercel.json` proxies `/arduino/:path*`, `/esp32/:path*`, and `/rpi/:path*` directly to the deployed simulator endpoints (`https://ayosim-arduino.vercel.app/:path*`, etc.).
- **Decision**: Vercel Reverse Proxy Rewrites with sub-path base URLs.
- **Rationale**:
  - The browser URL bar stays on `ayosim.vercel.app/arduino/`, `ayosim.vercel.app/esp32/`, and `ayosim.vercel.app/rpi/`.
  - To the user and browser, it is strictly **one origin** (`https://ayosim.vercel.app`), making cookie sharing, localStorage access, and browser history seamless.
- **Confidence**: High

### Decision 2: Vite Asset Path Scoping (`base: '/<board>/'`)
- **Question**: AyoSim Portal has `/assets/`, `/css/`, `/js/`. How do we prevent simulator asset name collisions?
- **Decision**: Configure each simulator's `vite.config.ts` with its respective base:
  - Arduino: `base: '/arduino/'`
  - ESP32: `base: '/esp32/'`
  - RPi: `base: '/rpi/'`
- **Rationale**: All bundle chunks, 3D models, and worker scripts load from `/arduino/assets/...`, completely isolating simulator assets from portal root assets.
- **Confidence**: High

### Decision 3: Unified Global App Shell & Board Switcher Header
- **Question**: How do we make navigation between simulators feel like switching tabs inside a single native app?
- **Decision**: Standardize a lightweight `<AyoSimGlobalNav>` component in the React simulators:
  - Left: AyoSim gradient logo linking back to `/` (Portal).
  - Center: Segmented Board Switcher:
    - `[ 🟢 Arduino Uno ]` ⟷ `[ 🔵 ESP32 IoT ]` ⟷ `[ 🔴 Raspberry Pi 4 ]`
  - Right: Unified Theme Toggle + Supabase User Avatar / Sign-In shortcut.
- **Rationale**: When switching from Arduino to ESP32, the persistent header creates visual continuity, transforming three independent projects into a unified suite.
- **Confidence**: High

### Decision 4: Cross-App Supabase Auth & Cloud Project Sync
- **Question**: How does a user's login session on `ayosim.vercel.app` propagate into the simulators?
- **Decision**:
  - Because all simulators are served on `ayosim.vercel.app/*` via Vercel rewrites, they share the **same first-party `localStorage` and cookies**.
  - All simulators initialize Supabase with the same `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
  - A unified `user_projects` database table stores circuit JSON with a `board_type` column (`'arduino' | 'esp32' | 'rpi'`).
- **Confidence**: High

---

## Plan Breakdown

- **Plan 8.1: Vercel Sub-Path Routing & Reverse Proxy Configuration**
  - Configure `vercel.json` rewrites for `/arduino`, `/esp32`, `/rpi`.
  - Configure simulator base paths and COOP/COEP path-scoped headers.
  - Update Portal cards to link to first-party sub-paths (`/arduino/`, `/esp32/`, `/rpi/`).

- **Plan 8.2: Unified Global Header & Board Switcher Component**
  - Design standard `AyoSimGlobalNav` specification and styles.
  - Create seamless board switcher with active indicators and instant transitions.
  - Integrate "Back to Hub" portal links.

- **Plan 8.3: Cross-Simulator Supabase Auth Sharing & Unified Project Data Model**
  - Configure shared Supabase auth client across simulator repos.
  - Define unified `user_projects` Supabase SQL schema (`id`, `user_id`, `board_type`, `title`, `circuit_data`, `code`, `updated_at`).
  - Add user project listing hook in Portal profile menu.
