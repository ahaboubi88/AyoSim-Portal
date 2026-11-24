# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision

AyoSim Portal is the central hub for the AYOT simulation ecosystem — a trilingual (EN/FR/AR) web portal that serves as the gateway to three hardware simulation applications (AyoSim-Arduino, AyoSim-ESP32, AyoSim-Raspberry). It targets students and hobbyists, providing quick access to each simulator alongside curated tutorials, academic articles, and project showcases for each board. The visual identity is rooted in the AYOT brand (bold blue, clean typography, the signature dot accent).

## Goals

1. **Central gateway** — Single entry point linking to all three AyoSim simulators
2. **Educational resource hub** — Tutorials, academic articles, and project links organized per board
3. **Trilingual accessibility** — Full English, French, and Arabic support with proper RTL layout
4. **Brand cohesion** — Visual identity derived from the AYOT logo (blue palette, modern, clean)
5. **Dark/light theme** — User-toggleable theme with persistence
6. **User authentication & accounts** — Secure user identity, sessions, and profile UI to support saving circuits/projects (Phase 7)

## Non-Goals (Out of Scope)

- Embedding simulators directly (they are separate apps)
- Blog or CMS backend
- Real-time collaboration features
- Mobile apps

## Users

- **University students** — Using simulators in labs, seeking tutorials and academic references
- **Hobbyists & makers** — Exploring hardware simulation, looking for project ideas
- **Educators** — Finding resources and linking students to the platform

## Product URLs

| Product | URL |
|---------|-----|
| **AyoSim Portal** (this project) | https://ayosim.app/ |
| **AyoSim-Arduino** | https://arduino.ayosim.app/ |
| **AyoSim-ESP32** | https://esp32.ayosim.app/ |
| **AyoSim-Raspberry** | https://rpi.ayosim.app/ |

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Static HTML/CSS/JS | Simplest, fastest, no build step needed, easy Vercel deploy |
| Styling | CSS custom properties + vanilla CSS | No dependencies, theme toggle via CSS vars |
| i18n | JSON language files + JS switcher | Lightweight, no framework needed |
| RTL | CSS `dir="rtl"` + logical properties | Native browser support for Arabic |
| Animations | CSS transitions + Intersection Observer | Subtle fade-ins, hover effects, no library needed |
| Deployment | Vercel | Already set up at ayosim.vercel.app |

## Design System (from AYOT logo)

- **Primary Blue**: `#4A5EAB` (extracted from logo)
- **Typography**: Bold, rounded, modern sans-serif (Inter or similar)
- **Logo**: AYOT wordmark in header only, minimal placement
- **Accent**: The dot above the O — used as a design motif (decorative dots, bullet points)
- **Theme**: Light default + dark toggle, blue accent consistent in both

## Site Structure

```
┌─────────────────────────────────────────┐
│  Header: AYOT logo | Nav | Lang | Theme │
├─────────────────────────────────────────┤
│  Hero: "AyoSim — Simulate. Learn. Build."│
│  Tagline + CTA buttons                   │
├─────────────────────────────────────────┤
│  Simulators Section (3 cards)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Arduino  │ │  ESP32   │ │   RPi    │ │
│  │ [Launch] │ │ [Launch] │ │ [Launch] │ │
│  └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────┤
│  Tutorials Section (per board tabs)      │
├─────────────────────────────────────────┤
│  Academic Articles Section               │
├─────────────────────────────────────────┤
│  Projects Showcase                       │
├─────────────────────────────────────────┤
│  Footer: Links, socials, AYOT branding   │
└─────────────────────────────────────────┘
```

## Constraints

- **No build tools required** — Must work as plain static files
- **Trilingual** — EN, FR, AR with RTL for Arabic
- **Performance** — Fast load, no heavy dependencies
- **Responsive** — Mobile-first, works on all screen sizes
- **Accessible** — WCAG 2.1 AA compliance targets

## Success Criteria

- [ ] Portal loads at ayosim.vercel.app with all sections visible
- [ ] All three simulator links work and open in new tabs
- [ ] Language switcher toggles between EN, FR, AR correctly
- [ ] Arabic layout renders in RTL without visual breaks
- [ ] Dark/light theme toggle works with preference persistence
- [ ] Subtle animations on scroll and card hover
- [ ] Fully responsive from mobile (320px) to desktop (1920px)
- [ ] Placeholder content in all tutorial, article, and project sections
