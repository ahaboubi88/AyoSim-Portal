---
phase: 8
plan: 2
wave: 2
depends_on: ["8.1"]
gap_closure: false
---

# Plan 8.2: Unified Global Header & Board Switcher Specification

## Objective
Establish the design specification, component contract, and integration guide for a shared `<AyoSimGlobalNav>` header across all three simulators (Arduino, ESP32, Raspberry Pi) to give users a seamless "one-app" feeling when switching between boards.

## Context
Load these files for context:
- .gsd/phases/8/RESEARCH.md
- .gsd/phases/8/01-PLAN.md
- css/styles.css
- index.html

## Tasks

<task type="auto">
  <name>Create Global Navigation Component Specification & Asset Suite</name>
  <files>
    docs/GLOBAL_NAV_SPEC.md
    assets/icons/board-switcher.svg
  </files>
  <action>
    1. Create `docs/GLOBAL_NAV_SPEC.md` documenting the unified navigation bar specifications:
       - Header layout: Height (54px), sticky top, glassmorphism (`backdrop-filter: blur(12px)`), dark background matching AyoSim theme.
       - Brand section (Left): AyoSim gradient logo linking to `/` with "Hub" back-pill.
       - Board Switcher (Center): Segmented control with 3 tabs:
         - `[ 🟢 Arduino Uno ]` (href="/arduino/")
         - `[ 🔵 ESP32 IoT ]` (href="/esp32/")
         - `[ 🔴 Raspberry Pi 4 ]` (href="/rpi/")
         - Active tab highlighted with subtle board-specific accent color (Arduino teal, ESP32 royal blue, RPi raspberry red).
       - User Section (Right): User profile avatar / Sign In button hooked into Supabase session, theme toggle, and project quick-save button.
    2. Provide ready-to-use React + CSS implementation snippet for inclusion in `Arduino Sim`, `Esp Sim`, and `Rpi Sim`.
  </action>
  <verify>
    powershell -Command "Test-Path docs/GLOBAL_NAV_SPEC.md"
  </verify>
  <done>
    `docs/GLOBAL_NAV_SPEC.md` exists with complete CSS/React specifications and board-switcher contract.
  </done>
</task>

<task type="auto">
  <name>Add Visual Ecosystem Indicator & Quick-Switch Previews in Portal</name>
  <files>
    index.html
    css/styles.css
  </files>
  <action>
    1. Enhance the simulator cards section in `index.html` with an "Ecosystem Status" badge confirming all three run in a unified sandbox under `ayosim.vercel.app`.
    2. Add subtle active status pills and seamless transitions on simulator card buttons.
    3. Bump CSS version tag in `index.html` (`styles.css?v=2.3`).
  </action>
  <verify>
    powershell -Command "Select-String -Path 'index.html' -Pattern 'styles.css\?v=2.3'"
  </verify>
  <done>
    Portal UI reflects the unified sub-path architecture with updated badges and versioned assets.
  </done>
</task>
