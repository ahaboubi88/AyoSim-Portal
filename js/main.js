/* ============================================
   MAIN.JS — Core Interactions
   ============================================
   Phase 1: Theme toggle, mobile menu, scroll animations
   Phase 2: Animated counters, back-to-top, per-section stagger
   Phase 3 will add: i18n, language switching
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initScrollAnimations();
  initLangSelector();
  initTabFilters();
  initSmoothScroll();
  initAnimatedCounters();
  initBackToTop();
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

  // Assign stagger delays per-section so each section animates independently
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
  const duration = 1500; // ms
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
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

/* ── Language Selector ── */
function initLangSelector() {
  const btn = document.querySelector('.lang-selector__btn');
  const dropdown = document.querySelector('.lang-selector__dropdown');
  const options = document.querySelectorAll('.lang-selector__option');
  if (!btn || !dropdown) return;

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

  options.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.getAttribute('data-lang');
      const label = lang.toUpperCase();
      btn.querySelector('[data-i18n="lang.current"]').textContent = label;
      localStorage.setItem('ayosim-lang', lang);
      dropdown.classList.remove('open');

      // Set direction for RTL
      if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', lang);
      }

      // Phase 3: loadTranslations(lang) will be called here
    });
  });

  // Load saved language
  const savedLang = localStorage.getItem('ayosim-lang') || 'en';
  if (savedLang !== 'en') {
    const langOption = document.querySelector(`[data-lang="${savedLang}"]`);
    if (langOption) langOption.click();
  }
}

/* ── Tab Filters ── */
function initTabFilters() {
  document.querySelectorAll('.tab-bar').forEach(bar => {
    const section = bar.closest('.section');
    if (!section) return;

    bar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
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
