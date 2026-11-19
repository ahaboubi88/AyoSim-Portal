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
