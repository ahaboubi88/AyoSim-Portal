# DECISIONS.md — Architecture Decision Records

## ADR-001: Static HTML/CSS/JS over Framework
**Date**: 2026-11-19
**Status**: Accepted
**Context**: Portal is primarily informational with no complex state management
**Decision**: Use plain HTML/CSS/JS without a framework
**Rationale**: Fastest load times, zero build step, simple Vercel deploy, easy to maintain
**Consequences**: Adding dynamic features later may require migration to a framework

## ADR-002: CSS Custom Properties for Theming
**Date**: 2026-11-19
**Status**: Accepted
**Context**: Need dark/light theme toggle and consistent AYOT branding
**Decision**: Use CSS custom properties (variables) for all theme-able values
**Rationale**: Native browser support, no JS needed for styling, easy to toggle via class

## ADR-003: JSON-based Internationalization
**Date**: 2026-11-19
**Status**: Accepted
**Context**: Need trilingual support (EN/FR/AR) without a backend
**Decision**: Store translations in JSON files, switch via JS with localStorage
**Rationale**: Simple, no dependencies, works with static hosting

## ADR-004: Ecosystem Federation & Sub-Path Routing over Monolithic Bundle
**Date**: 2026-11-22
**Status**: Accepted
**Context**: Need to make all three simulators (Arduino, ESP32, RPi) feel like one integrated platform under AyoSim. Merging all codebases into a single monolithic bundle risks severe WASM memory collisions (Clang + Pyodide), WebGL context exhaustion, and COOP/COEP OAuth conflicts.
**Decision**: Keep independent build targets and runtime sandboxes, but unify user experience via sub-path routing (`/arduino`, `/esp32`, `/rpi`), shared global navigation/board switcher, and unified Supabase auth/storage.
**Rationale**: Guarantees zero runtime crashes and process isolation while delivering a seamless "single app" feel to the end user.

## ADR-005: Portal-Gated Simulator Access & Ephemeral Project Sharing
**Date**: 2026-11-22
**Status**: Accepted
**Context**: Simulators must be restricted from direct standalone browser entry (preventing bypass of the portal) while simultaneously supporting viral "share by link" functionality without exhausting the Supabase Free Tier storage (500 MB).
**Decision**: 
1. Use a client-side stateless token handshake (HMAC/timestamp) from the Portal to grant simulator entry (`sessionStorage` clearance on boot; redirect to portal if absent/invalid).
2. Route shared links through the Portal (`ayosim.vercel.app/project/:id`), which verifies access, records branding/analytics, and provisions the simulator.
3. Support TTL expiration (e.g. 48 hours) on shared projects with automated physical deletion via PostgreSQL `pg_cron` (`DELETE FROM shared_projects WHERE expires_at < now()`), ensuring storage remains near zero on the free plan.
**Rationale**: 100% blocks direct unauthenticated visits, avoids reverse proxy WASM/Worker asset issues, creates a user acquisition funnel on the portal, and guarantees zero database bloat.

