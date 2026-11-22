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
  initSimulatorLauncher(); // Phase 5: Interstitial provisioning modal
  initAuthUI(); // Phase 7: Supabase Authentication UI
});

/* ── Theme Toggle ── */
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  // Load saved theme (defaults to dark mode)
  const savedTheme = localStorage.getItem('ayosim-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
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
      // only replace non-empty text nodes
      if (el.children.length > 0 && key !== 'lang.current') {
        const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0);
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

/* ============================================
   SIMULATOR LAUNCH ORCHESTRATOR (Phase 5)
   ============================================
   Intercepts simulator clicks, displays a high-tech
   cinematic provisioning modal with blurred backdrop,
   streams technically realistic kernel build actions
   for 2.0s, and redirects to the target simulator.
   ============================================ */

let activeLaunchTimeouts = [];
let isRedirecting = false;

function cancelLaunch() {
  activeLaunchTimeouts.forEach(t => clearTimeout(t));
  activeLaunchTimeouts = [];
  isRedirecting = false;
  const modal = document.getElementById('sim-modal');
  if (modal) {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('sim-modal-active');
}

function initSimulatorLauncher() {
  const cards = document.querySelectorAll('.sim-card[data-sim]');
  const modal = document.getElementById('sim-modal');
  const closeBtn = document.getElementById('sim-modal-close');
  const backdrop = document.getElementById('sim-modal-backdrop');

  if (!cards.length || !modal) return;

  // Ensure modal is cleanly closed on initial setup or page re-evaluation
  cancelLaunch();

  const BOARD_SEQUENCES = {
    arduino: {
      titleKey: 'simulators.arduino.title',
      defaultTitle: 'AyoSim Arduino',
      steps: [
        { tag: 'CORE', tagClass: 'sim-log-tag--core', key: 'sim_loader.arduino.step1', fallback: '[CORE] Initializing ATmega328P 8-bit AVR virtual core @ 16 MHz...', delay: 0, progress: 20 },
        { tag: 'IO', tagClass: 'sim-log-tag--io', key: 'sim_loader.arduino.step2', fallback: '[IO] Mapping 14 digital I/O pins, 6 PWM channels & 6 ADC inputs...', delay: 420, progress: 48 },
        { tag: 'MEM', tagClass: 'sim-log-tag--mem', key: 'sim_loader.arduino.step3', fallback: '[MEM] Allocating 32KB flash memory & 2KB SRAM buffer...', delay: 900, progress: 74 },
        { tag: 'BUS', tagClass: 'sim-log-tag--bus', key: 'sim_loader.arduino.step4', fallback: '[BUS] Binding UART serial monitor bridge at 115200 baud...', delay: 1380, progress: 92 },
        { tag: 'READY', tagClass: 'sim-log-tag--ready', key: 'sim_loader.arduino.step5', fallback: '[READY] Environment compiled. Launching AyoSim Arduino...', delay: 1800, progress: 100 }
      ]
    },
    esp32: {
      titleKey: 'simulators.esp32.title',
      defaultTitle: 'AyoSim ESP32',
      steps: [
        { tag: 'CORE', tagClass: 'sim-log-tag--core', key: 'sim_loader.esp32.step1', fallback: '[CORE] Initializing dual-core Tensilica Xtensa LX6 @ 240 MHz...', delay: 0, progress: 20 },
        { tag: 'RTOS', tagClass: 'sim-log-tag--rtos', key: 'sim_loader.esp32.step2', fallback: '[RTOS] Spawning FreeRTOS kernel scheduler & IPC queues...', delay: 420, progress: 48 },
        { tag: 'PHY', tagClass: 'sim-log-tag--phy', key: 'sim_loader.esp32.step3', fallback: '[PHY] Allocating 802.11 b/g/n virtual Wi-Fi & BLE 4.2 stack...', delay: 900, progress: 74 },
        { tag: 'MEM', tagClass: 'sim-log-tag--mem', key: 'sim_loader.esp32.step4', fallback: '[MEM] Mounting 4MB SPI Flash & 520KB internal SRAM heap...', delay: 1380, progress: 92 },
        { tag: 'READY', tagClass: 'sim-log-tag--ready', key: 'sim_loader.esp32.step5', fallback: '[READY] Environment compiled. Launching AyoSim ESP32...', delay: 1800, progress: 100 }
      ]
    },
    rpi: {
      titleKey: 'simulators.rpi.title',
      defaultTitle: 'AyoSim Raspberry Pi',
      steps: [
        { tag: 'SOC', tagClass: 'sim-log-tag--soc', key: 'sim_loader.rpi.step1', fallback: '[SOC] Initializing Broadcom BCM2711 quad-core Cortex-A72 @ 1.5 GHz...', delay: 0, progress: 20 },
        { tag: 'KERNEL', tagClass: 'sim-log-tag--kernel', key: 'sim_loader.rpi.step2', fallback: '[KERNEL] Booting embedded Linux kernel v6.1 & systemd rootfs...', delay: 420, progress: 48 },
        { tag: 'GPIO', tagClass: 'sim-log-tag--gpio', key: 'sim_loader.rpi.step3', fallback: '[GPIO] Configuring 40-pin header & memory-mapped peripherals...', delay: 900, progress: 74 },
        { tag: 'VFS', tagClass: 'sim-log-tag--vfs', key: 'sim_loader.rpi.step4', fallback: '[VFS] Mounting virtual disk image & Python 3.11 runtime...', delay: 1380, progress: 92 },
        { tag: 'READY', tagClass: 'sim-log-tag--ready', key: 'sim_loader.rpi.step5', fallback: '[READY] Environment compiled. Launching AyoSim Raspberry Pi...', delay: 1800, progress: 100 }
      ]
    }
  };

  function startSimulatorLaunch(boardId, targetUrl) {
    cancelLaunch();

    const modalTitle = document.getElementById('sim-modal-title');
    const stream = document.getElementById('sim-modal-stream');
    const stepName = document.getElementById('sim-modal-step-name');
    const percentage = document.getElementById('sim-modal-percentage');
    const progressFill = document.getElementById('sim-modal-progress-fill');

    const boardConfig = BOARD_SEQUENCES[boardId] || BOARD_SEQUENCES.arduino;
    const boardTitle = (translations[currentLang] && translations[currentLang][boardConfig.titleKey]) || boardConfig.defaultTitle;
    if (modalTitle) modalTitle.textContent = boardTitle;

    // Reset interface elements
    if (stream) stream.innerHTML = '';
    if (progressFill) progressFill.style.width = '0%';
    if (percentage) percentage.textContent = '0%';
    if (stepName) stepName.textContent = 'Initializing virtual kernel...';

    // Show modal & blurred page backdrop
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sim-modal-active');

    // Run timed sequence (2.0s duration)
    boardConfig.steps.forEach((step) => {
      const timer = setTimeout(() => {
        const fullText = (translations[currentLang] && translations[currentLang][step.key]) || step.fallback;
        
        let cleanText = fullText;
        let tagText = step.tag;
        const tagMatch = fullText.match(/^\[([A-Z0-9_-]+)\]\s*(.*)$/);
        if (tagMatch) {
          tagText = tagMatch[1];
          cleanText = tagMatch[2];
        }

        if (stream) {
          const oldCursor = stream.querySelector('.sim-log-cursor');
          if (oldCursor) oldCursor.remove();

          const row = document.createElement('div');
          row.className = 'sim-log-line';
          row.innerHTML = `
            <span class="sim-log-tag ${step.tagClass}">[${tagText}]</span>
            <span class="sim-log-text">${cleanText}<span class="sim-log-cursor"></span></span>
          `;
          stream.appendChild(row);
          stream.scrollTop = stream.scrollHeight;
        }

        if (progressFill) progressFill.style.width = `${step.progress}%`;
        if (percentage) percentage.textContent = `${step.progress}%`;
        if (stepName) stepName.textContent = cleanText;
      }, step.delay);

      activeLaunchTimeouts.push(timer);
    });

    // At 2050ms redirect to target simulator
    const redirectTimer = setTimeout(() => {
      if (progressFill) progressFill.style.width = '100%';
      if (percentage) percentage.textContent = '100%';
      isRedirecting = true;
      window.location.href = targetUrl;

      // Close modal shortly after navigating as a safeguard so that if the page
      // is preserved in memory or snapshot cache, it is stored in the closed state
      const cleanupTimer = setTimeout(() => {
        cancelLaunch();
      }, 350);
      activeLaunchTimeouts.push(cleanupTimer);
    }, 2050);

    activeLaunchTimeouts.push(redirectTimer);
  }

  // Expose for testing and external trigger
  window.startSimulatorLaunch = startSimulatorLaunch;
  window.cancelLaunch = cancelLaunch;

  // Intercept click on simulator cards
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Allow user to Ctrl+click / Cmd+click or middle click to open tab naturally if desired
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();

      const boardId = card.getAttribute('data-sim');
      const targetUrl = card.getAttribute('data-sim-url') || card.getAttribute('href');
      startSimulatorLaunch(boardId, targetUrl);
    });
  });

  // Close button & backdrop click
  if (closeBtn) closeBtn.addEventListener('click', cancelLaunch);
  if (backdrop) backdrop.addEventListener('click', cancelLaunch);

  // Keyboard Esc key to abort
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      cancelLaunch();
    }
  });

  // Clear modal whenever page is shown (initial load, bfcache, and back navigation)
  // CRITICAL for mobile: do NOT guard with event.persisted because mobile cross-origin
  // back navigation sets event.persisted=false even though DOM state was preserved from cache!
  window.addEventListener('pageshow', () => {
    cancelLaunch();
  });

  // Clear modal when page is hidden/unloaded so the browser's history snapshot is clean
  window.addEventListener('pagehide', () => {
    cancelLaunch();
  });

  // If user returns to tab/app after redirect was triggered, ensure modal is closed
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isRedirecting) {
      cancelLaunch();
    }
  });

  // Clear modal on popstate (browser back/forward)
  window.addEventListener('popstate', () => {
    cancelLaunch();
  });
}

/* ============================================
   Phase 7: Supabase Authentication UI
   ============================================ */

function initAuthUI() {
  if (typeof window.AyoSimAuth === 'undefined') return;

  // Header Elements
  const authSignInBtn = document.getElementById('auth-sign-in-btn');
  const userMenu = document.getElementById('user-menu');
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userMenuDropdown = document.getElementById('user-menu-dropdown');
  const userMenuAvatar = document.getElementById('user-menu-avatar');
  const userMenuName = document.getElementById('user-menu-name');
  const userMenuEmail = document.getElementById('user-menu-email');
  const authSignOutBtn = document.getElementById('auth-sign-out-btn');

  // Modal Elements
  const authModal = document.getElementById('auth-modal');
  const authModalBackdrop = document.getElementById('auth-modal-backdrop');
  const authModalClose = document.getElementById('auth-modal-close');
  const authTabSignin = document.getElementById('auth-tab-signin');
  const authTabSignup = document.getElementById('auth-tab-signup');
  const authFieldName = document.getElementById('auth-field-name');
  const authInputName = document.getElementById('auth-input-name');
  const authInputEmail = document.getElementById('auth-input-email');
  const authInputPassword = document.getElementById('auth-input-password');
  const authForm = document.getElementById('auth-form');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authSubmitText = document.getElementById('auth-submit-text');
  const authSubmitSpinner = document.getElementById('auth-submit-spinner');
  const authAlert = document.getElementById('auth-alert');
  const authDemoBadge = document.getElementById('auth-demo-badge');
  const authForgotPasswordLink = document.getElementById('auth-forgot-password-link');
  const authResetForm = document.getElementById('auth-reset-form');
  const authResetEmail = document.getElementById('auth-reset-email');
  const authResetSubmitBtn = document.getElementById('auth-reset-submit-btn');
  const authBackToLogin = document.getElementById('auth-back-to-login');
  const authGoogleBtn = document.getElementById('auth-google-btn');
  const authGithubBtn = document.getElementById('auth-github-btn');

  if (!authModal || !authSignInBtn) return;

  let currentAuthTab = 'signin'; // 'signin' | 'signup'

  function getI18nText(key, fallback) {
    if (translations[currentLang] && translations[currentLang][key]) {
      return translations[currentLang][key];
    }
    return fallback;
  }

  function showAlert(message, type) {
    if (!authAlert) return;
    authAlert.textContent = message;
    authAlert.className = 'auth-modal__alert auth-modal__alert--' + (type || 'info');
    authAlert.style.display = 'block';
  }

  function clearAlert() {
    if (!authAlert) return;
    authAlert.textContent = '';
    authAlert.style.display = 'none';
  }

  function setSubmitting(isSubmitting) {
    if (!authSubmitBtn) return;
    authSubmitBtn.disabled = isSubmitting;
    if (authSubmitSpinner) {
      authSubmitSpinner.style.display = isSubmitting ? 'inline-block' : 'none';
    }
  }

  function switchTab(tab) {
    currentAuthTab = tab;
    clearAlert();

    // Toggle active tab classes & ARIA
    if (tab === 'signup') {
      authTabSignup?.classList.add('auth-modal__tab--active');
      authTabSignup?.setAttribute('aria-selected', 'true');
      authTabSignin?.classList.remove('auth-modal__tab--active');
      authTabSignin?.setAttribute('aria-selected', 'false');

      if (authFieldName) authFieldName.style.display = 'block';
      if (authSubmitText) authSubmitText.textContent = getI18nText('auth.signUp', 'Sign Up');
      authInputName?.focus();
    } else {
      authTabSignin?.classList.add('auth-modal__tab--active');
      authTabSignin?.setAttribute('aria-selected', 'true');
      authTabSignup?.classList.remove('auth-modal__tab--active');
      authTabSignup?.setAttribute('aria-selected', 'false');

      if (authFieldName) authFieldName.style.display = 'none';
      if (authSubmitText) authSubmitText.textContent = getI18nText('auth.signIn', 'Sign In');
      authInputEmail?.focus();
    }

    // Ensure primary form is visible and reset form is hidden
    if (authForm) authForm.style.display = 'block';
    if (authResetForm) authResetForm.style.display = 'none';
  }

  function openModal(tab) {
    switchTab(tab || 'signin');
    authModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Update demo badge visibility
    if (authDemoBadge) {
      authDemoBadge.style.display = window.AyoSimAuth.isDemoMode() ? 'inline-flex' : 'none';
    }
  }

  function closeModal() {
    authModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    clearAlert();
    setSubmitting(false);
  }

  // Header Trigger: Open Modal
  authSignInBtn.addEventListener('click', () => {
    openModal('signin');
  });

  // Modal Close Triggers
  authModalClose?.addEventListener('click', closeModal);
  authModalBackdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  // Tab Switching
  authTabSignin?.addEventListener('click', () => switchTab('signin'));
  authTabSignup?.addEventListener('click', () => switchTab('signup'));

  // Forgot Password Toggle
  authForgotPasswordLink?.addEventListener('click', (e) => {
    e.preventDefault();
    clearAlert();
    if (authForm) authForm.style.display = 'none';
    if (authResetForm) authResetForm.style.display = 'block';
    authResetEmail?.focus();
  });

  authBackToLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    clearAlert();
    if (authForm) authForm.style.display = 'block';
    if (authResetForm) authResetForm.style.display = 'none';
    authInputEmail?.focus();
  });

  // Primary Form Submit (Sign In or Sign Up)
  authForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const email = authInputEmail?.value.trim() || '';
    const password = authInputPassword?.value || '';
    const fullName = authInputName?.value.trim() || '';

    if (!email || !password) {
      showAlert(getI18nText('auth.invalidFields', 'Please enter your email and password.'), 'error');
      return;
    }

    setSubmitting(true);

    if (currentAuthTab === 'signup') {
      await window.AyoSimAuth.signUp(email, password, fullName);
    } else {
      await window.AyoSimAuth.signInWithPassword(email, password);
    }

    setSubmitting(false);
  });

  // Forgot Password Form Submit
  authResetForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const email = authResetEmail?.value.trim() || '';
    if (!email) {
      showAlert(getI18nText('auth.invalidEmail', 'Please enter your email address.'), 'error');
      return;
    }

    if (authResetSubmitBtn) authResetSubmitBtn.disabled = true;
    await window.AyoSimAuth.resetPassword(email);
    if (authResetSubmitBtn) authResetSubmitBtn.disabled = false;
  });

  // Social OAuth Triggers
  authGoogleBtn?.addEventListener('click', () => {
    clearAlert();
    window.AyoSimAuth.signInWithOAuth('google');
  });

  authGithubBtn?.addEventListener('click', () => {
    clearAlert();
    window.AyoSimAuth.signInWithOAuth('github');
  });

  // User Profile Menu Dropdown
  userMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = userMenuDropdown?.classList.toggle('active');
    userMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', () => {
    userMenuDropdown?.classList.remove('active');
    userMenuBtn?.setAttribute('aria-expanded', 'false');
  });

  // Sign Out Trigger
  authSignOutBtn?.addEventListener('click', () => {
    window.AyoSimAuth.signOut();
  });

  // Auth State Reactive Synchronization
  window.addEventListener('ayosim:auth:change', (e) => {
    const detail = e.detail || {};
    const user = detail.user;

    if (user) {
      // Authenticated state
      authSignInBtn.style.display = 'none';
      if (userMenu) userMenu.style.display = 'inline-flex';

      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const initial = displayName.charAt(0).toUpperCase();

      if (userMenuAvatar) userMenuAvatar.textContent = initial;
      if (userMenuName) userMenuName.textContent = displayName;
      if (userMenuEmail) userMenuEmail.textContent = user.email || '';

      closeModal();
    } else {
      // Unauthenticated state
      authSignInBtn.style.display = 'inline-flex';
      if (userMenu) userMenu.style.display = 'none';
      userMenuDropdown?.classList.remove('active');
    }
  });

  window.addEventListener('ayosim:auth:error', (e) => {
    showAlert(e.detail?.message || 'Authentication error', 'error');
    setSubmitting(false);
  });

  window.addEventListener('ayosim:auth:message', (e) => {
    showAlert(e.detail?.message || 'Notice', e.detail?.type || 'info');
    setSubmitting(false);
  });

  // Initialize engine
  window.AyoSimAuth.init();
}
