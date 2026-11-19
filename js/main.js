/* ============================================
   MAIN.JS — Core Interactions
   ============================================
   Phase 1: Theme toggle, mobile menu, scroll animations
   Phase 2: Animated counters, back-to-top, per-section stagger
   Phase 3: i18n engine, language switching, RTL support
   ============================================ */

// Translation cache
let translations = {};
let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initScrollAnimations();
  initTabFilters();
  initSmoothScroll();
  initAnimatedCounters();
  initBackToTop();
  initI18n(); // Must come last — loads translations and triggers lang selector
});

/* ── Theme Toggle ── */
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  // Load saved theme
  const savedTheme = localStorage.getItem('ayosim-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ayosim-theme', next);
  });
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  const menuToggle = document.querySelector('.header__menu-toggle');
  const nav = document.querySelector('.header__nav');
  if (!menuToggle || !nav) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('mobile-open');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when clicking a link
  nav.querySelectorAll('.header__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Scroll Animations (Intersection Observer) ── */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  // Assign stagger delays per-section
  document.querySelectorAll('.section, .hero, .stats').forEach(section => {
    const sectionElements = section.querySelectorAll('.fade-in');
    sectionElements.forEach((el, index) => {
      el.style.transitionDelay = `${index * 100}ms`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  elements.forEach((el) => {
    observer.observe(el);
  });
}

/* ── Animated Counters ── */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 1500;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ── Back to Top ── */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================
   i18n — Internationalization Engine
   ============================================ */

async function initI18n() {
  const btn = document.querySelector('.lang-selector__btn');
  const dropdown = document.querySelector('.lang-selector__dropdown');
  const options = document.querySelectorAll('.lang-selector__option');
  if (!btn || !dropdown) return;

  // Toggle dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Close on outside click
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  // Language option click
  options.forEach(option => {
    option.addEventListener('click', async () => {
      const lang = option.getAttribute('data-lang');
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      await setLanguage(lang);
    });
  });

  // Load saved language or default
  const savedLang = localStorage.getItem('ayosim-lang') || 'en';
  await setLanguage(savedLang);
}

async function setLanguage(lang) {
  // Load translation file if not cached
  if (!translations[lang]) {
    try {
      const response = await fetch(`i18n/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      translations[lang] = await response.json();
    } catch (err) {
      console.warn(`i18n: Could not load ${lang}.json, falling back to en`, err);
      if (lang !== 'en') {
        await setLanguage('en');
        return;
      }
      return;
    }
  }

  currentLang = lang;
  localStorage.setItem('ayosim-lang', lang);

  // Apply translations to all elements with data-i18n
  applyTranslations(translations[lang]);

  // Set HTML lang attribute
  document.documentElement.setAttribute('lang', lang);

  // Handle RTL for Arabic
  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }

  // Update the language selector button text
  const langLabel = document.querySelector('[data-i18n="lang.current"]');
  if (langLabel) {
    langLabel.textContent = translations[lang]['lang.current'] || lang.toUpperCase();
  }
}

function applyTranslations(dict) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      // For elements that contain child elements (like section titles with dot-accent span),
      // only replace text nodes
      if (el.children.length > 0 && key !== 'lang.current') {
        // Find first text node and update it
        const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
        if (textNodes.length > 0) {
          textNodes[0].textContent = dict[key];
        }
      } else {
        el.textContent = dict[key];
      }
    }
  });
}

/* ── Tab Filters ── */
function initTabFilters() {
  document.querySelectorAll('.tab-bar').forEach(bar => {
    const section = bar.closest('.section');
    if (!section) return;

    bar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        const cards = section.querySelectorAll('.content-card');

        cards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-board') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  });
}

/* ── Smooth Scroll for anchor links ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerHeight = document.querySelector('.header').offsetHeight;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
