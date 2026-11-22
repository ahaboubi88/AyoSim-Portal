# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)

- [ ] Central portal with hero, simulator cards, tutorials, articles, projects sections
- [ ] Links to all 3 simulators (Arduino, ESP32, RPi)
- [ ] Trilingual support (EN / FR / AR) with RTL
- [ ] Dark / light theme toggle
- [ ] Responsive design (mobile → desktop)
- [ ] AYOT brand identity (blue palette, clean typography)

## Phases

### Phase 1: Foundation & Layout
**Status**: ⬜ Not Started
**Objective**: Project scaffolding, HTML structure, CSS design system, responsive layout
**Deliverables**:
- HTML page with semantic structure (header, hero, sections, footer)
- CSS design system (custom properties, AYOT colors, typography, spacing)
- Responsive grid/flexbox layout
- AYOT logo in header
- Basic navigation

### Phase 2: Content Sections & Interactivity
**Status**: ⬜ Not Started
**Objective**: Build out all content sections with placeholder data, add interactive elements
**Deliverables**:
- Simulator cards (3) with icons, descriptions, launch links
- Tutorials section with per-board tabs/filters
- Academic articles section with placeholder entries
- Projects showcase section
- Scroll animations (fade-in via Intersection Observer)
- Card hover effects

### Phase 3: Internationalization & Theming
**Status**: ⬜ Not Started
**Objective**: Trilingual support (EN/FR/AR), RTL layout, dark/light theme toggle
**Deliverables**:
- Language JSON files (en.json, fr.json, ar.json)
- JS language switcher with localStorage persistence
- RTL CSS rules for Arabic
- Dark/light theme with CSS custom properties
- Theme toggle with localStorage persistence

### Phase 4: Polish & Deploy
**Status**: ✅ Complete
**Objective**: Final responsive tweaks, accessibility pass, performance optimization, Vercel deploy
**Deliverables**:
- Accessibility audit (ARIA labels, keyboard nav, contrast)
- Meta tags (SEO, Open Graph)
- Favicon from AYOT branding
- Final responsive testing
- Vercel deployment configuration

### Phase 5: Simulator Launch Loading Sequence (Cinematic Provisioning Modal)
**Status**: ✅ Complete
**Objective**: Build an engaging, high-tech loading interface with backdrop blur, cybernetic hardware synthesis graphics, realistic board-specific terminal messages, and an exact 2-second provisioning delay before redirecting to the chosen simulator.
**Deliverables**:
- Provisioning modal markup (`sim-modal`) with accessibility attributes (`role="dialog"`, `aria-modal="true"`)
- Blurred webpage backdrop (`backdrop-filter: blur(16px)` + dimmed overlay)
- High-tech hardware loading graphics (pulsing microchip, animated concentric cyber rings, linear progress bar, % indicator)
- Technically realistic terminal logs tailored to each board (ATmega328P, ESP32 Xtensa LX6, Raspberry Pi BCM2711)
- 2000ms timed sequence with smooth step updates and automatic redirection to simulator URL
- Close/Cancel button and `Escape` key handling to abort sequence
- Full trilingual support (EN, FR, AR) and RTL layout adaptation
- Empirical validation with headless browser visual and functional tests

### Phase 6: Search Engine Optimization (SEO) & Generative Engine Optimization (GEO)
**Status**: ✅ Complete
**Objective**: Maximize organic visibility across traditional search engines (Google, Bing) and AI search answer engines (Perplexity, ChatGPT Search, Google AI Overviews, Claude, Gemini).
**Deliverables**:
- GEO architecture: `llms.txt` and `llms-full.txt` implementation for AI ingestion
- AI crawler rules in `robots.txt` (GPTBot, PerplexityBot, ClaudeBot, Google-Extended)
- JSON-LD structured data (SoftwareApplication, Organization, FAQPage with competitor comparisons)
- Multilingual SEO (`hreflang` tags across EN, FR, AR in HTML and XML sitemap)
- High-intent keyword optimization for Arduino, ESP32 WiFi/BLE, and Raspberry Pi Linux simulation
- Google Search Console and Bing Webmaster Tools verification hooks

---

### Phase 7: User Authentication & Account System (Supabase)
**Status**: ⬜ Not Started
**Objective**: Implement client-side authentication using Supabase Auth (`@supabase/supabase-js`), supporting Email/Password and Social OAuth (Google & GitHub), responsive auth modal, header profile avatar and session dropdown, session persistence, and trilingual (EN/FR/AR) localization.
**Depends on**: Phase 4 & Phase 6

**Scope & Specifications**:
- **Provider**: Supabase Auth (Client-side JS SDK via CDN, zero custom server requirement)
- **Auth Methods**: Email/Password + OAuth (Google & GitHub)
- **UI Components**:
  - Auth modal dialog (Sign In, Sign Up, Forgot Password view, OAuth buttons)
  - Navigation header state: "Sign In" button (unauthenticated) vs User Avatar + dropdown menu (Profile, Sign Out)
- **Localization**: Full trilingual support across English, French, and Arabic with RTL layout
- **Future Integration**: Ready for cloud saving of user simulation circuits and projects

**Tasks**:
- [ ] TBD (run /plan 7 to create execution plans)

**Verification**:
- TBD


