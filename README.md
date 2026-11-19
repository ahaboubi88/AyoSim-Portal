# AyoSim — Simulate. Learn. Build.

> The AYOT simulation portal for Arduino, ESP32, and Raspberry Pi.

🌐 **Live:** [ayosim.vercel.app](https://ayosim.vercel.app/)

## Simulators

| Simulator | URL |
|-----------|-----|
| AyoSim Arduino | [ayosim-arduino.vercel.app](https://ayosim-arduino.vercel.app/) |
| AyoSim ESP32 | [ayosim-esp32.vercel.app](https://ayosim-esp32.vercel.app/) |
| AyoSim Raspberry Pi | [ayosim-rpi.vercel.app](https://ayosim-rpi.vercel.app/) |

## Features

- 🎛️ **3 Interactive Simulators** — Arduino, ESP32, Raspberry Pi
- 📚 **Tutorials** — Step-by-step guides from beginner to advanced
- 🎓 **Academic Articles** — Research papers and technical references
- 🔧 **Project Showcase** — Real-world projects to build in the simulators
- 🌍 **Trilingual** — English, French, Arabic (with RTL support)
- 🌙 **Dark/Light Theme** — Toggle with persistence
- 📱 **Fully Responsive** — Mobile-first, works on all screen sizes
- ♿ **Accessible** — WCAG 2.1 AA, keyboard navigation, reduced motion support

## Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Custom properties, Flexbox/Grid, animations
- **Vanilla JS** — No framework dependencies
- **Vercel** — Static hosting with CDN

## Project Structure

```
├── index.html          # Main portal page
├── 404.html            # Custom error page
├── vercel.json         # Vercel deployment config
├── manifest.json       # PWA web manifest
├── robots.txt          # Search engine directives
├── sitemap.xml         # XML sitemap
├── css/
│   ├── variables.css   # Design system (colors, fonts, spacing)
│   ├── reset.css       # CSS reset
│   ├── layout.css      # Page structure
│   ├── components.css  # Cards, buttons, tabs
│   ├── responsive.css  # Breakpoints + RTL
│   └── accessibility.css # Focus styles, skip link, reduced motion
├── js/
│   └── main.js         # Theme, i18n, animations, filters
├── i18n/
│   ├── en.json         # English (110 keys)
│   ├── fr.json         # French (110 keys)
│   └── ar.json         # Arabic (110 keys)
└── assets/
    ├── logo.png        # AYOT logo
    ├── favicon.svg     # SVG favicon
    └── icons/
        ├── arduino.svg # Arduino board icon
        ├── esp32.svg   # ESP32 board icon
        └── rpi.svg     # Raspberry Pi board icon
```

## Development

No build tools needed. Open `index.html` or run a local server:

```bash
npx serve -l 8080
```

## License

© 2026 AYOT. All rights reserved.
