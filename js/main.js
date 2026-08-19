/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN JS — User Interactions, Modals, Forms & Animations
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// Enable JS-driven animations now that scripts have successfully loaded
document.documentElement.classList.add('js');

/* ─────────────────────────────────────────────
   LOADER — Boot sequence progress bar with telemetry logs
───────────────────────────────────────────── */
(function initLoader() {
  const ldf = document.getElementById('ldf');
  const ldp = document.getElementById('ldp');
  const ld  = document.getElementById('loader');
  const lbl = document.querySelector('.ld-label');

  const logs = [
    "ESTABLISHING SECURE PROTOCOLS...",
    "INITIALIZING POWERTRAIN INTERFACE...",
    "CALIBRATING SRB-10 BATTERY CELLS...",
    "CHECKING BMS TEMPERATURE LOGS...",
    "LAUNCHING ACTIVE VIOLETTE AI CORE...",
    "UNLEASHING BALLISTIC FIRMWARE...",
    "IGNITION PROTOCOL: READY"
  ];

  function triggerHero() {
    document.querySelectorAll('.hero-content .sw').forEach(el => el.classList.add('on'));
    document.querySelectorAll('#hero .ctr[data-t]').forEach(el => {
      if (typeof runCounter === 'function') {
        runCounter(el);
      }
    });
  }

  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    if (!ld) {
      triggerHero();
      return;
    }
    ld.classList.add('gone');
    setTimeout(triggerHero, 300);
  }
  const hardTimeout = setTimeout(dismiss, 3500);

  if (!ldf || !ldp || !ld) {
    setTimeout(triggerHero, 100);
    return;
  }

  let p = 0;
  const iv = setInterval(function() {
    p += Math.random() * 11 + 4;
    if (p >= 100) {
      p = 100;
      clearInterval(iv);
      clearTimeout(hardTimeout);
      if (lbl) lbl.textContent = logs[6];
      setTimeout(dismiss, 450);
    } else {
      if (lbl) {
        const logIdx = Math.min(Math.floor(p / 16.6), 5);
        lbl.textContent = logs[logIdx];
      }
    }
    try {
      ldf.style.transform = 'scaleX(' + (p / 100) + ')';
      ldp.textContent = Math.floor(p) + '%';
    } catch(e) {}
  }, 80);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(dismiss, 800);
    });
  }
})();

/* ─────────────────────────────────────────────
   POINTER ACCESSIBILITY AND DEVICE DETECTOR
───────────────────────────────────────────── */
const hasFinePointer = window.matchMedia ? window.matchMedia('(pointer: fine)').matches : true;
const reducedMotion  = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

/* ─────────────────────────────────────────────
   AUDIO SYSTEM & SCROLL SPEED GLOBAL VARIABLES
   
   These variables manage our native Web Audio synth engine and track
   scroll velocity to dynamically adjust the synthesizer's pitch.
   ───────────────────────────────────────────── */
let audioCtx = null;      // Global AudioContext (instantiated on user gesture)
let masterGain = null;    // Global master volume gain node
let isMuted = false;      // Master audio mute state
let engineOsc1 = null;    // Main sawtooth oscillator (engine buzz)
let engineOsc2 = null;    // Sub triangle oscillator (bass rumble)
let engineFilter = null;  // Lowpass filter for tone shaping
let engineGain = null;    // Overall volume gain node
let engineActive = false; // Flag to check if engine is running
let pitchRaf = null;      // Audio pitch loop runs only while the engine is active

// Scroll speed tracking variables
let lastScrollY = null;
let lastScrollTime = Date.now();
let targetPitchMultiplier = 1.0;
let currentPitchMultiplier = 1.0;

// Callback triggered on every scroll event to calculate velocity.
// We map the speed (pixels per millisecond) to modulate the synth engine's frequency.
function onScrollSpeedUpdate(sy) {
  if (!engineActive || !engineOsc1 || !engineOsc2 || !engineFilter) return;

  const now = Date.now();
  const dt = Math.max(1, now - lastScrollTime); // Avoid division by zero
  if (lastScrollY === null) {
    lastScrollY = sy;
    lastScrollTime = now;
    return;
  }
  const dy = Math.abs(sy - lastScrollY);

  lastScrollY = sy;
  lastScrollTime = now;

  const speed = dy / dt; // Pixels per millisecond
  // Cap the pitch multiplier so the engine doesn't sound too high-pitched
  targetPitchMultiplier = 1.0 + Math.min(1.2, speed * 0.25);
}

/* ─────────────────────────────────────────────
   MAGNETIC CURSOR
───────────────────────────────────────────── */
(function initCursor() {
  if (!hasFinePointer) return;

  const cur  = document.getElementById('cur');
  const curR = document.getElementById('cur-r');
  if (!cur || !curR) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; 
    my = e.clientY;
  }, { passive: true });

  (function animCursor() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
    
    curR.style.left = rx + 'px';
    curR.style.top  = ry + 'px';
    
    requestAnimationFrame(animCursor);
  })();

  /* Grow cursor on hoverable elements */
  document.querySelectorAll('a, button, .sw-dot, .mode-c, .gal-c, .soc-btn, .sdot, .hstat')
    .forEach(el => {
      el.addEventListener('mouseenter', () => {
        cur.style.width   = '20px'; 
        cur.style.height   = '20px';
        curR.style.width  = '60px'; 
        curR.style.height  = '60px';
        curR.style.borderColor = 'rgba(123,44,191,.75)';
      });
      el.addEventListener('mouseleave', () => {
        cur.style.width   = '10px'; 
        cur.style.height   = '10px';
        curR.style.width  = '36px'; 
        curR.style.height  = '36px';
        curR.style.borderColor = 'rgba(123,44,191,.45)';
      });
    });
})();

/* ─────────────────────────────────────────────
   MAGNETIC BUTTONS
───────────────────────────────────────────── */
(function initMagneticButtons() {
  if (!hasFinePointer) return;
  document.querySelectorAll('.btn-p, .btn-o, .btn-g, .sub-btn, .nav-cta')
    .forEach(btn => {
      let r = null;
      btn.addEventListener('mouseenter', () => {
        r = btn.getBoundingClientRect();
      });
      btn.addEventListener('mousemove', e => {
        if (!r) r = btn.getBoundingClientRect();
        const cx = e.clientX - r.left  - r.width  / 2;
        const cy = e.clientY - r.top   - r.height / 2;
        btn.style.transform = `translate(${cx * 0.18}px, ${cy * 0.18}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        r = null;
      });
    });
})();

/* ─────────────────────────────────────────────
   UNIFIED PASSIVE SCROLL & RESIZE MANAGER

   Batch all scroll-driven reads and writes into one animation frame. This
   prevents the parallax and progress systems from scheduling separate frame
   callbacks and keeps layout reads away from style writes.
───────────────────────────────────────────── */
const scrollFrameSubscribers = new Set();
let scrollFrameId = null;
let pendingScrollY = window.scrollY;

function scheduleScrollFrame(scrollY = window.scrollY) {
  pendingScrollY = scrollY;
  if (scrollFrameId !== null) return;
  scrollFrameId = requestAnimationFrame(() => {
    scrollFrameId = null;
    const currentScrollY = pendingScrollY;
    scrollFrameSubscribers.forEach(subscriber => subscriber(currentScrollY));
  });
}

function subscribeToScrollFrame(subscriber) {
  scrollFrameSubscribers.add(subscriber);
  return () => scrollFrameSubscribers.delete(subscriber);
}

window.addEventListener('scroll', () => scheduleScrollFrame(), { passive: true });
window.addEventListener('resize', () => scheduleScrollFrame(), { passive: true });

(function initScrollSystems() {
  const prog   = document.getElementById('prog');
  const nb     = document.getElementById('navbar');
  const hWrap  = document.getElementById('h-scroll-section');
  const hTrack = document.getElementById('h-track');
  const paraImg  = document.getElementById('para-img');
  const paraWrap = hasFinePointer && !reducedMotion && paraImg && typeof paraImg.closest === 'function'
    ? paraImg.closest('.life-img-wrap')
    : null;

  // Cached layout metrics
  let maxScrollY = 0;
  let wrapTop = 0;
  let scrollable = 0;
  let maxX = 0;
  let paraWrapTop = 0;
  let paraWrapHeight = 0;
  let navScrolled = false;
  let hScrollEnabled = false;

  function cacheDimensions() {
    maxScrollY = document.body.scrollHeight - window.innerHeight;
    hScrollEnabled = Boolean(hWrap && hTrack && hasFinePointer && !reducedMotion && window.innerWidth > 1024);
    if (hWrap) {
      wrapTop = hWrap.getBoundingClientRect().top + window.scrollY;
      scrollable = hWrap.offsetHeight - window.innerHeight;
    }
    if (hTrack) {
      maxX = -(hTrack.scrollWidth - window.innerWidth + 160);
    }
    if (paraWrap) {
      paraWrapTop = paraWrap.getBoundingClientRect().top + window.scrollY;
      paraWrapHeight = paraWrap.offsetHeight;
    }
  }

  function runAllScrollUpdates(sy) {
    /* 1 — Scroll progress bar */
    if (prog) {
      const progress = maxScrollY > 0 ? sy / maxScrollY : 0;
      prog.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    }

    /* 2 — Navbar glass effect */
    if (nb) {
      const nextNavScrolled = sy > 60;
      if (nextNavScrolled !== navScrolled) {
        navScrolled = nextNavScrolled;
        nb.classList.toggle('scrolled', navScrolled);
      }
    }

    /* 3 — Horizontal scroll (narrative) */
    if (hScrollEnabled) {
      const relativeScroll = sy - wrapTop;
      const progress   = scrollable > 0 ? Math.max(0, Math.min(1, relativeScroll / scrollable)) : 0;
      hTrack.style.transform = `translateX(${maxX * progress}px)`;
    } else if (hTrack && hTrack.style.transform) {
      hTrack.style.transform = '';
    }

    /* 4 — Parallax lifestyle image */
    if (paraImg && paraWrap && hasFinePointer && !reducedMotion) {
      const center = (paraWrapTop + paraWrapHeight / 2) - (sy + window.innerHeight / 2);
      paraImg.style.transform = `translateY(${center * 0.12}px)`;
    }

    // Call dynamic sound engine modulation hook
    if (typeof onScrollSpeedUpdate === 'function') {
      onScrollSpeedUpdate(sy);
    }
  }

  subscribeToScrollFrame(runAllScrollUpdates);

  window.addEventListener('resize', () => {
    cacheDimensions();
    scheduleScrollFrame(window.scrollY);
  }, { passive: true });

  // Initial caching and updates
  cacheDimensions();
  runAllScrollUpdates(window.scrollY);

  // Recache on load because lazy images and webfonts can shift heights.
  window.addEventListener('load', () => {
    cacheDimensions();
    scheduleScrollFrame(window.scrollY);
  });
})();

/* ─────────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────────── */
(function initMobileMenu() {
  const mob       = document.getElementById('mob-menu');
  const hamburger = document.getElementById('hamburger');
  const mobClose  = document.getElementById('mob-close');
  if (!mob || !hamburger) return;

  hamburger.addEventListener('click', () => {
    mob.classList.add('open');
    mob.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (mobClose) mobClose.focus();
  });

  function closeMenu() {
    mob.classList.remove('open');
    mob.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  if (mobClose) mobClose.addEventListener('click', closeMenu);
  document.querySelectorAll('.mob-lnk').forEach(l => l.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mob.classList.contains('open')) closeMenu();
  });
})();

/* ─────────────────────────────────────────────
   INTERSECTION OBSERVER — Scroll Reveals
───────────────────────────────────────────── */
const scrollRevealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      e.target.querySelectorAll('.ctr[data-t]').forEach(runCounter);
      scrollRevealIO.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger, .sw, .clip-r'
).forEach(el => scrollRevealIO.observe(el));

/* ─────────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────────── */
function runCounter(el) {
  if (el.isDone) return;
  el.isDone = true;
  const target = parseInt(el.dataset.t, 10);
  if (isNaN(target)) return;
  const dur   = 2200;
  const start = performance.now();
  (function tick(now) {
    const p    = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  })(performance.now());
}

document.querySelectorAll('.ctr[data-t]').forEach(el => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      runCounter(el);
      obs.unobserve(el);
    }
  }, { threshold: 0.5 });
  obs.observe(el);
});

/* ─────────────────────────────────────────────
   WAVE TEXT GENERATOR
───────────────────────────────────────────── */
(function initWaveText() {
  function buildWave(el) {
    const txt  = el.textContent || '';
    const frag = document.createDocumentFragment();
    const chars = txt.split('');
    chars.forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'wc';
      if (!reducedMotion) s.style.animationDelay = (i * 0.13) + 's';
      s.textContent = ch === ' ' ? '\u00a0' : ch;
      frag.appendChild(s);
    });
    el.innerHTML = '';
    el.appendChild(frag);
  }
  document.querySelectorAll('[data-wave]').forEach(buildWave);
})();

/* ─────────────────────────────────────────────
   COLOUR SWATCHES PICKER
───────────────────────────────────────────── */
(function initColourPicker() {
  const bikeImg   = document.getElementById('bike-img');
  const colourLbl = document.getElementById('clbl');
  if (!bikeImg) return;

  function selectSwatch(sw) {
    document.querySelectorAll('.sw-dot').forEach(s => {
      s.classList.remove('on');
      s.setAttribute('aria-pressed', 'false');
    });
    sw.classList.add('on');
    sw.setAttribute('aria-pressed', 'true');
    if (colourLbl) colourLbl.textContent = sw.dataset.clr || '';
    window.dispatchEvent(new CustomEvent('f77:paint', {
      detail: { name: sw.dataset.clr || '', color: sw.style.backgroundColor || '' }
    }));

    const showcase = document.getElementById('showcase');
    if (showcase) {
      showcase.classList.remove('theme-red', 'theme-yellow', 'theme-grey', 'theme-blue');
      const clrName = (sw.dataset.clr || '').toUpperCase();
      if (clrName.includes('RED')) {
        showcase.classList.add('theme-red');
      } else if (clrName.includes('YELLOW')) {
        showcase.classList.add('theme-yellow');
      } else if (clrName.includes('BLUE')) {
        showcase.classList.add('theme-blue');
      } else {
        showcase.classList.add('theme-grey');
      }
    }

    bikeImg.style.transition = 'opacity 0.25s ease-in, transform 0.25s ease-in';
    bikeImg.style.opacity   = '0';
    bikeImg.style.transform = 'scale(.92)';

    // Trigger electrostatic scanner line swipe animation
    const wrapper = bikeImg.closest('.bike-wrap') || document.querySelector('.bike-wrap');
    if (wrapper) {
      wrapper.classList.remove('scanning');
      requestAnimationFrame(() => wrapper.classList.add('scanning'));
      setTimeout(() => wrapper.classList.remove('scanning'), 650);
    }

    setTimeout(() => {
      if (sw.dataset.img) bikeImg.src = sw.dataset.img;
      bikeImg.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
      bikeImg.style.opacity    = '1';
      bikeImg.style.transform  = 'scale(1)';
    }, 250);

    // Play synthesized click feedback
    if (typeof playClickSound === 'function') playClickSound();
  }

  document.querySelectorAll('.sw-dot').forEach(sw => {
    sw.addEventListener('click',   ()  => selectSwatch(sw));
    sw.addEventListener('keydown', e   => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSwatch(sw); }
    });
  });
})();

/* ─────────────────────────────────────────────
   RIDING MODES TAB SELECT
───────────────────────────────────────────── */
(function initRidingModes() {
  const modes = document.querySelectorAll('.mode-c');
  const tftScreen = document.getElementById('tft-screen');
  const tftSpeed = document.getElementById('tft-speed');
  const tftModeBanner = document.getElementById('tft-mode-banner');
  const tftRange = document.getElementById('tft-range');
  const tftLoad = document.getElementById('tft-load');
  const tftTemp = document.getElementById('tft-temp');
  const tftBms = document.getElementById('tft-bms');
  const tftAlert = document.getElementById('tft-alert');
  const tftProgressFill = document.getElementById('tft-progress-fill');
  const tftRingFill = document.getElementById('tft-ring-fill');
  const tftTime = document.getElementById('tft-time');

  if (!modes.length) return;

  const tftData = {
    glide: {
      speed: 80,
      banner: "GLIDE MODE // ECO",
      range: "323 KM",
      load: "25%",
      temp: "38°C",
      bms: "OPTIMAL",
      alert: "TELEMETRY SECURE // GPS LOCK",
      dashOffset: 198,
      theme: "theme-glide"
    },
    combat: {
      speed: 120,
      banner: "COMBAT MODE // SPORT",
      range: "250 KM",
      load: "65%",
      temp: "42°C",
      bms: "OPTIMAL",
      alert: "PERFORMANCE MAP // ENGAGED",
      dashOffset: 92,
      theme: "theme-combat"
    },
    ballistic: {
      speed: 155,
      banner: "BALLISTIC MODE // ARMED",
      range: "180 KM",
      load: "100%",
      temp: "46°C",
      bms: "WARM // AIR COOLING",
      alert: "BALLISTIC THRUST // ARMED",
      dashOffset: 0,
      theme: "theme-ballistic"
    },
    'ballistic-plus': {
      speed: 162,
      banner: "BALLISTIC+ // UNRESTRICTED",
      range: "150 KM",
      load: "120%",
      temp: "51°C",
      bms: "ALERT // SYS OVERRIDE",
      alert: "WARNING // POWERTRAIN UNLIMITED",
      dashOffset: 0,
      theme: "theme-ballistic-plus"
    }
  };

  let activeAnimationId = null;

  function updateTFT(mode) {
    const data = tftData[mode];
    if (!data || !tftScreen) return;

    tftScreen.className = "tft-screen " + data.theme;

    if (tftModeBanner) tftModeBanner.textContent = data.banner;
    if (tftRange) tftRange.textContent = data.range;
    if (tftLoad) tftLoad.textContent = data.load;
    if (tftTemp) tftTemp.textContent = data.temp;
    if (tftBms) {
      tftBms.textContent = data.bms;
      tftBms.style.color = mode === 'ballistic-plus' ? '#E74C3C' : (mode === 'ballistic' ? '#F1C40F' : '#2ECC71');
    }
    if (tftAlert) {
      tftAlert.textContent = data.alert;
      tftAlert.style.color = mode === 'ballistic-plus' ? '#E74C3C' : '';
    }

    // Diagnostics telemetry sweep animation for speed and gauge meters
    if (activeAnimationId) cancelAnimationFrame(activeAnimationId);

    const sweepMax = 188;
    const phase1Duration = 250; // ms (fast sweep up)
    const phase2Duration = 600; // ms (settle down to target mode telemetry)
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      if (elapsed < phase1Duration) {
        const p = elapsed / phase1Duration;
        const speedVal = Math.round(p * sweepMax);
        if (tftSpeed) tftSpeed.textContent = speedVal;
        
        if (tftProgressFill) tftProgressFill.style.width = `${Math.round(p * 100)}%`;
        if (tftRingFill) tftRingFill.style.strokeDashoffset = `${Math.round((1 - p) * 264)}`;
        
        activeAnimationId = requestAnimationFrame(tick);
      } else {
        const p = Math.min((elapsed - phase1Duration) / phase2Duration, 1);
        const ease = p * (2 - p); // easeOutQuad
        const speedVal = Math.round(sweepMax + ease * (data.speed - sweepMax));
        if (tftSpeed) tftSpeed.textContent = speedVal;

        const targetLoadPct = parseInt(data.load, 10) || 50;
        const currentLoad = Math.round(100 + ease * (targetLoadPct - 100));
        const currentDashOffset = Math.round(0 + ease * (data.dashOffset - 0));

        if (tftProgressFill) tftProgressFill.style.width = `${currentLoad}%`;
        if (tftRingFill) tftRingFill.style.strokeDashoffset = currentDashOffset;

        if (p < 1) {
          activeAnimationId = requestAnimationFrame(tick);
        } else {
          if (tftSpeed) tftSpeed.textContent = data.speed;
          if (tftProgressFill) tftProgressFill.style.width = data.load;
          if (tftRingFill) tftRingFill.style.strokeDashoffset = data.dashOffset;
          activeAnimationId = null;
        }
      }
    }
    activeAnimationId = requestAnimationFrame(tick);

    window.dispatchEvent(new CustomEvent('f77:mode', { detail: { mode, data } }));
  }

  const activate = (c) => {
    modes.forEach(x => {
      x.classList.remove('on');
      x.setAttribute('aria-pressed', 'false');
    });
    c.classList.add('on');
    c.setAttribute('aria-pressed', 'true');
    updateTFT(c.dataset.mode);
  };

  modes.forEach(c => {
    c.addEventListener('click', () => activate(c));
    c.addEventListener('keydown', e => { 
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        activate(c); 
      } 
    });
  });

  function updateTFTClock() {
    if (!tftTime) return;
    const now = new Date();
    let hrs = now.getHours();
    let mins = now.getMinutes();
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    mins = mins < 10 ? '0' + mins : mins;
    hrs = hrs < 10 ? '0' + hrs : hrs;
    tftTime.textContent = `${hrs}:${mins} ${ampm}`;
  }
  setInterval(updateTFTClock, 1000);
  updateTFTClock();
})();

/* ─────────────────────────────────────────────
   SECURE FORM HANDLER
───────────────────────────────────────────── */
(function initForm() {
  const form    = document.getElementById('racing-form');
  const formOk  = document.getElementById('form-ok');
  const formBtn = document.getElementById('form-btn');
  if (!form) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showError(msg) {
    formBtn.textContent      = msg;
    formBtn.style.background = '#C0392B';
    setTimeout(() => { 
      formBtn.textContent = 'REQUEST ACCESS'; 
      formBtn.style.background = ''; 
    }, 2200);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name  = (document.getElementById('fn')  || {}).value?.trim() || '';
    const email = (document.getElementById('fe')  || {}).value?.trim() || '';

    if (!name || name.length < 2)            { showError('ENTER YOUR NAME');        return; }
    if (!email || !emailRegex.test(email))  { showError('INVALID EMAIL ADDRESS');  return; }

    formBtn.textContent = 'TRANSMITTING\u2026';
    formBtn.disabled    = true;
    formBtn.setAttribute('aria-busy', 'true');

    setTimeout(() => {
      if (formOk) {
        formOk.textContent = 'INTEREST REGISTERED — WE WILL BE IN TOUCH.';
        formOk.style.display = 'block';
        formOk.focus();
      }
      formBtn.textContent = 'INTEREST NOTED \u2713';
      formBtn.style.background = 'rgba(123,44,191,.45)';
      formBtn.setAttribute('aria-busy', 'false');

      setTimeout(() => {
        form.reset();
        formBtn.disabled = false;
        formBtn.textContent = 'REQUEST ACCESS';
        formBtn.style.background = '';
        if (formOk) {
          formOk.style.display = 'none';
          formOk.textContent = '';
        }
      }, 4000);
    }, 1400);
  });
})();

/* ─────────────────────────────────────────────
   MODAL DIALOG DIALECT & FOCUS TRAP
───────────────────────────────────────────── */
(function initModals() {
  const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
  let lastTrigger = null;

  window.mO = function(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastTrigger = document.activeElement;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = modal.querySelector(FOCUSABLE);
    if (first) first.focus();
  };

  window.mC = function(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  };

  /* Backdrop click closes modal */
  document.querySelectorAll('.movl').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) window.mC(m.id); });

    /* TAB TRAP inside open modal */
    m.addEventListener('keydown', e => {
      if (!m.classList.contains('show') || e.key !== 'Tab') return;
      const focusable = [...m.querySelectorAll(FOCUSABLE)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });
  });

  /* Escape closes modal */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.movl.show').forEach(m => window.mC(m.id));
    }
  });
})();

/* ─────────────────────────────────────────────
   SIDE DOT NAVIGATION ACTIVE STATE HIGHLIGHTS
───────────────────────────────────────────── */
(function initSideNav() {
  const sdots  = document.querySelectorAll('.sdot');
  const secEls = document.querySelectorAll('section[id]');
  if (!sdots.length) return;

  sdots.forEach(d => d.addEventListener('click', () => {
    const sec = document.getElementById(d.dataset.sec);
    if (sec) sec.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }));

  secEls.forEach(s => {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting)
        sdots.forEach(d => d.classList.toggle('on', d.dataset.sec === s.id));
    }, { threshold: 0.35 }).observe(s);
  });

  secEls.forEach(s => {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting)
        document.querySelectorAll('.nav-links a').forEach(l =>
          l.classList.toggle('on', l.getAttribute('href') === '#' + s.id)
        );
    }, { threshold: 0.4 }).observe(s);
  });
})();

/* ─────────────────────────────────────────────
   WEB AUDIO API SYNTHESIZER & SOUND SYSTEM
   
   A pure programmatic synthesizer simulating a high-end electric motorcycle motor.
   No sound files are loaded; all frequencies, vibrations, and pitches are 
   generated in real-time using native browser oscillator nodes.
   ───────────────────────────────────────────── */
function initAudio() {
  if (audioCtx) return audioCtx;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : 1, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  } catch (error) {
    audioCtx = null;
    masterGain = null;
    console.info('[Audio] Web Audio is unavailable; continuing silently.', error);
  }
  return audioCtx;
}

// Short synthesized chime for UI feedback (buttons & swatches)
function playClickSound() {
  initAudio();
  if (!audioCtx || audioCtx.state !== 'running' || isMuted) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain || audioCtx.destination);

    osc.type = 'triangle'; // Smooth, friendly tone
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08); // Fast decay pitch drop

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {}
}

const modeAudioProfiles = {
  glide: { copy: 'GLIDE AUDIO // EFFICIENCY MAP', type: 'triangle', from: 520, to: 220, duration: 0.16, color: '#2ecc71' },
  combat: { copy: 'COMBAT AUDIO // TORQUE MAP', type: 'square', from: 320, to: 640, duration: 0.18, color: '#f1c40f' },
  ballistic: { copy: 'BALLISTIC AUDIO // THRUST ARMED', type: 'sawtooth', from: 180, to: 920, duration: 0.34, color: '#ff9866' },
  'ballistic-plus': { copy: 'BALLISTIC+ AUDIO // OVERRIDE WARNING', type: 'sawtooth', from: 880, to: 440, duration: 0.24, color: '#ef4b4b' }
};

let telemetryAudioTimer = null;

function updateTelemetryAudio(mode = 'glide') {
  const profile = modeAudioProfiles[mode] || modeAudioProfiles.glide;
  const overlay = document.getElementById('telemetry-audio-status');
  const copy = document.getElementById('telemetry-audio-copy');
  if (!overlay) return;
  overlay.dataset.audioMode = mode;
  overlay.style.color = profile.color;
  if (copy) copy.textContent = profile.copy;
  overlay.classList.remove('is-pulsing');
  if (telemetryAudioTimer) clearTimeout(telemetryAudioTimer);
  if (!reducedMotion) {
    requestAnimationFrame(() => overlay.classList.add('is-pulsing'));
    telemetryAudioTimer = setTimeout(() => overlay.classList.remove('is-pulsing'), 850);
  }
}

function playModeCue(mode = 'glide') {
  const profile = modeAudioProfiles[mode] || modeAudioProfiles.glide;
  const ctx = initAudio();
  if (!ctx || isMuted) return;
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => playModeCue(mode)).catch(() => {});
    return;
  }
  if (ctx.state !== 'running' || !masterGain) return;

  const now = ctx.currentTime;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = profile.type;
    osc.frequency.setValueAtTime(profile.from, now);
    osc.frequency.exponentialRampToValueAtTime(profile.to, now + profile.duration);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(mode === 'ballistic-plus' ? 1200 : 2200, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(mode === 'ballistic-plus' ? 0.055 : 0.04, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);
    osc.connect(filter).connect(gain).connect(masterGain);
    osc.start(now);
    osc.stop(now + profile.duration + 0.025);

    if (mode === 'ballistic-plus') {
      const warning = ctx.createOscillator();
      const warningGain = ctx.createGain();
      warning.type = 'sine';
      warning.frequency.setValueAtTime(220, now);
      warning.frequency.exponentialRampToValueAtTime(110, now + profile.duration);
      warningGain.gain.setValueAtTime(0.0001, now);
      warningGain.gain.linearRampToValueAtTime(0.035, now + 0.02);
      warningGain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);
      warning.connect(warningGain).connect(masterGain);
      warning.start(now);
      warning.stop(now + profile.duration + 0.025);
    }
  } catch (error) {}
}

window.addEventListener('f77:mode', event => {
  const mode = event.detail?.mode || 'glide';
  updateTelemetryAudio(mode);
  playModeCue(mode);
});

// Starts the electric motorcycle engine sweep and idle drone
function startEngine() {
  const ctx = initAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  if (engineActive) return;
  engineActive = true;
  if (!pitchRaf) updateSoundPitch();

  const now = audioCtx.currentTime;

  // Update sound HUD UI state
  const shud = document.getElementById('sound-hud');
  if (shud) shud.classList.add('active');

  // 1. Startup turbine sweep sound: mimics charging capacitors / diagnostics scan
  const sweepOsc = audioCtx.createOscillator();
  const sweepGain = audioCtx.createGain();
  sweepOsc.type = 'sine';
  sweepOsc.frequency.setValueAtTime(60, now);
  sweepOsc.frequency.exponentialRampToValueAtTime(800, now + 1.2); // Sweep pitch up
  
  sweepGain.gain.setValueAtTime(0.001, now);
  sweepGain.gain.linearRampToValueAtTime(0.1, now + 0.6); // Fade in
  sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // Fade out

  sweepOsc.connect(sweepGain);
  sweepGain.connect(masterGain || audioCtx.destination);
  sweepOsc.start(now);
  sweepOsc.stop(now + 1.2);

  // 2. Continuous Idle Engine Drone
  engineOsc1 = audioCtx.createOscillator();
  engineOsc2 = audioCtx.createOscillator();
  engineGain = audioCtx.createGain();
  engineFilter = audioCtx.createBiquadFilter();

  // Sawtooth oscillator provides the rough buzz / electric rasp
  engineOsc1.type = 'sawtooth';
  engineOsc1.frequency.setValueAtTime(65, now + 0.8);

  // Triangle oscillator provides the deep low-frequency sub bass
  engineOsc2.type = 'triangle';
  engineOsc2.frequency.setValueAtTime(130, now + 0.8);

  // Lowpass filter filters out high-frequency noise for a warm mechanical hum
  engineFilter.type = 'lowpass';
  engineFilter.frequency.setValueAtTime(200, now + 0.8);
  engineFilter.Q.setValueAtTime(4, now + 0.8); // Resonance spike at filter cutoff

  engineGain.gain.setValueAtTime(0.001, now);
  engineGain.gain.linearRampToValueAtTime(0.04, now + 1.2); // Smoothly fade in engine sound

  engineOsc1.connect(engineFilter);
  engineOsc2.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(masterGain || audioCtx.destination);

  engineOsc1.start(now + 0.8);
  engineOsc2.start(now + 0.8);

  // 3. Engine Rumble: Low-Frequency Oscillator (LFO) oscillates the filter frequency
  // to create a rhythmic, mechanical vibration effect.
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(3, now + 0.8); // 3 Hz rumble rate
  lfoGain.gain.setValueAtTime(30, now + 0.8); // Amount of frequency modulation

  lfo.connect(lfoGain);
  lfoGain.connect(engineFilter.frequency);
  lfo.start(now + 0.8);

  engineOsc1.lfoNode = lfo;
}

function stopEngine() {
  if (!engineActive) return;
  engineActive = false;
  const now = audioCtx.currentTime;

  const shud = document.getElementById('sound-hud');
  if (shud) shud.classList.remove('active');

  if (engineGain) {
    engineGain.gain.cancelScheduledValues(now);
    engineGain.gain.setValueAtTime(engineGain.gain.value, now);
    engineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  }

  setTimeout(() => {
    try {
      if (engineOsc1) {
        engineOsc1.stop();
        if (engineOsc1.lfoNode) engineOsc1.lfoNode.stop();
      }
      if (engineOsc2) engineOsc2.stop();
    } catch(e){}
    engineOsc1 = null;
    engineOsc2 = null;
    engineFilter = null;
    engineGain = null;
  }, 700);
}

// Bind engine startup triggers
(function initEngineStartup() {
  const btn = document.getElementById('btn-ignite');
  const sweep = document.getElementById('ignition-sweep');
  const txt = document.querySelector('.btn-ignite-txt');
  const icon = document.querySelector('.btn-ignite-icon');
  if (!btn) return;

  let booting = false;

  btn.addEventListener('click', () => {
    initAudio();
    if (booting) return;

    const consoleEl = document.getElementById('boot-console');

    if (!engineActive) {
      booting = true;
      if (txt) txt.textContent = "BOOTING DIAGNOSTICS...";
      if (icon) icon.textContent = "hourglass_empty";
      btn.style.pointerEvents = 'none';

      if (consoleEl) {
        consoleEl.style.display = 'block';
        consoleEl.innerHTML = '';
      }

      const logLines = [
        { text: "⚡ CONNECTING TO VIOLETTE AI SYNAPSE... [OK]", type: "normal" },
        { text: "🛰️ SYNCING GNSS TELEMETRY SATELLITES... [STABLE]", type: "normal" },
        { text: "🛡️ ABS REGULATOR DIAGNOSTICS... [PHASE-2 OK]", type: "normal" },
        { text: "🔋 BATTERY SRB10 CORE ENERGY CELL... [100% SECURE]", type: "success" },
        { text: "🏍️ IGNITING 30KW PMSM POWERTRAIN MOTOR... [ACTIVE]", type: "success" }
      ];

      let lineIdx = 0;

      function printNextLine() {
        if (lineIdx < logLines.length) {
          const lineData = logLines[lineIdx];
          const lineDiv = document.createElement('p');
          lineDiv.className = 'log-line active ' + lineData.type;
          lineDiv.textContent = lineData.text;
          if (consoleEl) {
            consoleEl.appendChild(lineDiv);
            consoleEl.scrollTop = consoleEl.scrollHeight;
          }
          lineIdx++;
          setTimeout(printNextLine, 220);
        } else {
          booting = false;
          btn.style.pointerEvents = 'auto';

          startEngine();
          btn.classList.add('active');
          document.body.classList.add('engine-active');
          if (txt) txt.textContent = "ENGINE ACTIVE // SYS 01";
          if (icon) icon.textContent = "check_circle";

          if (sweep) {
            sweep.classList.remove('active');
            requestAnimationFrame(() => sweep.classList.add('active'));
          }
        }
      }

      printNextLine();
    } else {
      stopEngine();
      btn.classList.remove('active');
      document.body.classList.remove('engine-active');
      if (txt) txt.textContent = "START ENGINE";
      if (icon) icon.textContent = "power_settings_new";

      if (consoleEl) {
        consoleEl.style.display = 'none';
        consoleEl.innerHTML = '';
      }
    }
  });

  // Attach hover sounds to interactive elements
  document.querySelectorAll('a, button, .sw-dot, .mode-c, .sdot, .trim-btn, .hotspot').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (audioCtx && audioCtx.state === 'running') {
        playClickSound();
      }
    });
  });

  // Automatically suspend audio context when switching tabs to improve background UX,
  // and resume if the engine drone was active when the user returns.
  document.addEventListener('visibilitychange', () => {
    if (audioCtx) {
      if (document.hidden) {
        if (audioCtx.state === 'running') {
          audioCtx.suspend();
        }
      } else {
        if (engineActive && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
      }
    }
  });
})();

function updateSoundPitch() {
  if (!engineActive) {
    pitchRaf = null;
    return;
  }

  if (engineOsc1 && engineOsc2 && engineFilter && audioCtx) {
    currentPitchMultiplier += (targetPitchMultiplier - currentPitchMultiplier) * 0.1;
    targetPitchMultiplier += (1.0 - targetPitchMultiplier) * 0.05;

    const baseFreq1 = 65;
    const baseFreq2 = 130;
    const filterBase = 200;

    try {
      engineOsc1.frequency.setValueAtTime(baseFreq1 * currentPitchMultiplier, audioCtx.currentTime);
      engineOsc2.frequency.setValueAtTime(baseFreq2 * currentPitchMultiplier, audioCtx.currentTime);
      engineFilter.frequency.setValueAtTime(filterBase + (currentPitchMultiplier - 1.0) * 400, audioCtx.currentTime);
    } catch(e){}
  }
  pitchRaf = requestAnimationFrame(updateSoundPitch);
}

/* ─────────────────────────────────────────────
   CONFIGURATOR TRIM LEVEL SWITCHER
   ───────────────────────────────────────────── */
(function initTrimSwitcher() {
  const btns = document.querySelectorAll('.trim-btn');
  const power = document.getElementById('spec-power');
  const torque = document.getElementById('spec-torque');
  const range = document.getElementById('spec-range');
  
  if (!btns.length) return;

  function setTrim(trim) {
    btns.forEach(btn => {
      const active = btn.dataset.trim === trim;
      btn.classList.toggle('on', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });

    if (trim === 'recon') {
      if (power) { power.isDone = false; power.dataset.t = '30'; runCounter(power); }
      if (torque) { torque.isDone = false; torque.dataset.t = '100'; runCounter(torque); }
      if (range) { range.isDone = false; range.dataset.t = '323'; runCounter(range); }
    } else {
      if (power) { power.isDone = false; power.dataset.t = '27'; runCounter(power); }
      if (torque) { torque.isDone = false; torque.dataset.t = '90'; runCounter(torque); }
      if (range) { range.isDone = false; range.dataset.t = '211'; runCounter(range); }
    }

    window.dispatchEvent(new CustomEvent('f77:trim', { detail: { trim } }));
    
    // Play sound click
    if (typeof playClickSound === 'function') playClickSound();
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => setTrim(btn.dataset.trim));
  });
})();

/* ─────────────────────────────────────────────
   CHASSIS & TECH HOTSPOT BLUEPRINT EXPLORER
   ───────────────────────────────────────────── */
(function initHotspotExplorer() {
  const hotspots = document.querySelectorAll('.hotspot');
  const cardTitle = document.getElementById('hud-title');
  const cardDesc = document.getElementById('hud-desc');
  const cardSpecs = document.getElementById('hud-specs');
  const cardTag = document.querySelector('.hud-tag');
  
  if (!hotspots.length) return;

  const data = [
    {
      title: "SRB10 ENERGY CELL",
      tag: "COMPONENT // 01",
      desc: "10.3 kWh aviation-grade lithium-ion battery pack. Structured with five layers of safety, active BMS temperature checks, and IP67 waterproofing.",
      specs: [
        { label: "CAPACITY", val: "10.3 KWH" },
        { label: "CHEMISTRY", val: "NMC HIGH-ENERGY" },
        { label: "TESTED DISTANCE", val: "6,000,000+ KM" }
      ]
    },
    {
      title: "PMSM ELECTRIC MOTOR",
      tag: "COMPONENT // 02",
      desc: "Permanent Magnet Synchronous Motor delivering instant ballistic torque and smooth linear acceleration up to a verified 155 km/h.",
      specs: [
        { label: "PEAK OUTPUT", val: "30 KW (40.2 HP)" },
        { label: "MAX TORQUE", val: "100 NM INSTANT" },
        { label: "ACCELERATION", val: "0-60 KM/H IN 2.8S" }
      ]
    },
    {
      title: "AERO TRELLIS FRAME",
      tag: "COMPONENT // 03",
      desc: "Lightweight steel trellis chassis engineered with structural stiffness ratios inspired by race bikes. Optimised for ballistic cornering and stability.",
      specs: [
        { label: "TYPE", val: "AEROSPACE STEEL TRELLIS" },
        { label: "WEIGHT RATIO", val: "OPTIMISED 50:50" },
        { label: "STIFFNESS", val: "BALLISTIC STABILITY" }
      ]
    },
    {
      title: "VIOLETTE AI TELEMETRY",
      tag: "COMPONENT // 04",
      desc: "Active onboard computer running proprietary Violette OS. Connected 24/7 with Bluetooth, Wi-Fi, and LTE to manage vehicle updates and diagnostics.",
      specs: [
        { label: "DISPLAY", val: "5-INCH TFT HUD" },
        { label: "CONNECTIVITY", val: "LTE / GPS / BLE" },
        { label: "OTA UPDATES", val: "AUTOMATIC" }
      ]
    },
    {
      title: "REGEN & DUAL ABS",
      tag: "COMPONENT // 05",
      desc: "Dynamic braking system utilizing 10-level regenerative deceleration combined with high-grade switchable dual-channel ABS for total safety.",
      specs: [
        { label: "REGEN LEVELS", val: "10 ADJUSTABLE LEVELS" },
        { label: "ABS", val: "SWITCHABLE DUAL-CHANNEL" },
        { label: "DISC DIAMETER", val: "320MM FRONT / 230MM REAR" }
      ]
    }
  ];

  function activateHotspot(hs) {
    hotspots.forEach(h => h.classList.remove('on'));
    hs.classList.add('on');
    
    const idx = parseInt(hs.dataset.idx, 10);
    const info = data[idx];
    if (!info) return;

    const card = document.getElementById('hud-card');
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
    }

    setTimeout(() => {
      if (cardTitle) cardTitle.textContent = info.title;
      if (cardTag) cardTag.textContent = info.tag;
      if (cardDesc) cardDesc.textContent = info.desc;
      
      if (cardSpecs) {
        cardSpecs.innerHTML = info.specs.map(s => 
          `<div class="hud-spec-row"><span class="h-lbl">${s.label}</span><span class="h-val">${s.val}</span></div>`
        ).join('');
      }

      if (card) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }
    }, 200);

    if (typeof playClickSound === 'function') playClickSound();
    drawHUDLine(hs);
  }

  // Dynamic SVG line drawing math:
  // Draws a path from the active hotspot, projects it horizontally outward, 
  // bends it at a strict 45-degree angle, and runs it straight into the details card.
  function drawHUDLine(hs) {
    const wrap = hs.closest('.schematic-wrap');
    const path = document.getElementById('hud-line');
    if (!wrap || !path) return;

    const wrapRect = wrap.getBoundingClientRect();
    const hsRect   = hs.getBoundingClientRect();
    
    // Calculate hotspot center coordinate relative to the wrapper canvas
    const startX = hsRect.left - wrapRect.left + hsRect.width / 2;
    const startY = hsRect.top - wrapRect.top + hsRect.height / 2;
    const endX   = wrapRect.width - 24; // Target right edge near HUD details card

    // Bending logic:
    const targetY = wrapRect.height / 2;
    const dx = 40;
    const dy = targetY - startY;
    const diagonalX = startX + dx + Math.abs(dy); // 45-degree coordinate offset
    
    let d;
    if (diagonalX < endX - 20) {
      // Standard path: Lead-out -> 45-degree bend -> run straight to card
      d = `M ${startX} ${startY} L ${startX + dx} ${startY} L ${diagonalX} ${targetY} L ${endX} ${targetY}`;
    } else {
      // Fallback for tight spaces: simple horizontal line
      d = `M ${startX} ${startY} L ${endX - 30} ${startY} L ${endX} ${startY}`;
    }
    
    // Set the path coordinates
    path.setAttribute('d', d);

    try {
      // Trigger smooth draw-in sweep transition
      const length = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      
      // Force layout reflow
      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        path.style.strokeDashoffset = '0';
      });
    } catch(e) {}
  }

  hotspots.forEach(hs => {
    hs.addEventListener('click', () => activateHotspot(hs));
  });

  window.addEventListener('resize', () => {
    const active = document.querySelector('.hotspot.on');
    if (active) drawHUDLine(active);
  }, { passive: true });

  setTimeout(() => {
    const active = document.querySelector('.hotspot.on');
    if (active) drawHUDLine(active);
  }, 1000);
})();

/* ─────────────────────────────────────────────
   CONFIGURATOR DYNAMIC RANGE & CHARGE SIMULATOR
   ───────────────────────────────────────────── */
(function initRangeSimulator() {
  const slider = document.getElementById('charge-slider');
  const pctText = document.getElementById('charge-pct');
  const rangeText = document.getElementById('sim-est-range');
  const chargeText = document.getElementById('sim-est-charge');
  const modeBtns = document.querySelectorAll('.sim-mode-btn');
  const trimBtns = document.querySelectorAll('.trim-btn');

  if (!slider || !rangeText || !chargeText) return;

  let activeMode = 'glide';
  let activeTrim = 'recon';

  const baseRanges = {
    glide: 211,
    combat: 160,
    ballistic: 110
  };

  const reconRanges = {
    glide: 323,
    combat: 250,
    ballistic: 180
  };

  function updateSimulation() {
    const charge = parseInt(slider.value, 10);
    if (pctText) pctText.textContent = charge + '%';

    const ranges = activeTrim === 'recon' ? reconRanges : baseRanges;
    const estRange = Math.round(ranges[activeMode] * (charge / 100));
    rangeText.textContent = estRange;

    if (charge >= 80) {
      chargeText.textContent = charge === 100 ? "FULL" : "READY";
      const unit = chargeText.nextElementSibling;
      if (unit) unit.textContent = "";
    } else {
      const remainingPercent = 80 - charge;
      const rate = activeTrim === 'recon' ? 1.0 : 0.75;
      const chargeTime = Math.round(remainingPercent * rate);
      chargeText.textContent = chargeTime;
      const unit = chargeText.nextElementSibling;
      if (unit) unit.textContent = "MIN";
    }
  }

  slider.addEventListener('input', updateSimulation);

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activeMode = btn.dataset.mode;
      updateSimulation();
      if (typeof playClickSound === 'function') playClickSound();
    });
  });

  trimBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTrim = btn.dataset.trim;
      updateSimulation();
    });
  });

  updateSimulation();
})();

/* ─────────────────────────────────────────────
   TECHNICAL SPECS TABLE ACTIVE COLUMN SELECTOR
   ───────────────────────────────────────────── */
(function initSpecsTableToggle() {
  const table = document.querySelector('.specs-table');
  const btns = document.querySelectorAll('.spec-toggle-btn');
  if (!table || !btns.length) return;

  // Set default active column to 2 (F77 MACH 2 RECON)
  table.classList.add('show-col-2');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const col = btn.dataset.col;
      table.classList.remove('show-col-1', 'show-col-2', 'show-col-3');
      table.classList.add('show-col-' + col);

      if (typeof playClickSound === 'function') playClickSound();
    });
  });
})();

/* ─────────────────────────────────────────────
   FLOATING AUDIO EQUALIZER HUD CONTROL
   ───────────────────────────────────────────── */
(function initAudioHUD() {
  const shud = document.getElementById('sound-hud');
  if (!shud) return;

  // Toggle audio engine mute state
  shud.addEventListener('click', () => {
    initAudio();
    isMuted = !isMuted;
    
    // Toggle visual classes
    shud.classList.toggle('muted', isMuted);
    
    const txtNode = shud.querySelector('.sound-hud-txt');
    if (txtNode) {
      txtNode.textContent = isMuted ? 'SOUND OFF' : 'SOUND ON';
    }

    // Set gain on master volume node
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1, audioCtx.currentTime);
    }

    if (typeof playClickSound === 'function' && !isMuted) {
      playClickSound();
    }
  });
})();

/* ─────────────────────────────────────────────
   CAROUSEL MOUSE DRAG-TO-SCROLL INTERACTION
   ───────────────────────────────────────────── */
(function initGalleryDrag() {
  const slider = document.querySelector('.gal-scroll');
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('dragging');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove('dragging');
  });

  slider.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove('dragging');
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag scroll velocity modifier
    slider.scrollLeft = scrollLeft - walk;
  });
})();

/* ─────────────────────────────────────────────
   SCROLL PARALLAX ENGINE
   ───────────────────────────────────────────── */
(function initScrollParallax() {
  if (!hasFinePointer || reducedMotion) return;
  const targets = document.querySelectorAll('.px-shift');
  if (!targets.length) return;

  const metrics = [];

  function cacheParallaxMetrics() {
    metrics.length = 0;
    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      metrics.push({
        el,
        top: window.scrollY + rect.top,
        height: rect.height,
        speedX: parseFloat(el.dataset.pxX) || 0,
        speedY: parseFloat(el.dataset.pxY) || 0
      });
    });
  }

  function updateParallax(viewTop = window.scrollY) {
    const viewHeight = window.innerHeight;
    const viewBottom = viewTop + viewHeight;

    metrics.forEach(({ el, top, height, speedX, speedY }) => {
      const bottom = top + height;
      if (bottom < viewTop || top > viewBottom) return;

      const progress = (viewBottom - top) / (viewHeight + height);
      const offset = progress - 0.5;
      const tx = offset * speedX * 100;
      const ty = offset * speedY * 100;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
  }

  cacheParallaxMetrics();
  subscribeToScrollFrame(updateParallax);

  window.addEventListener('resize', () => {
    cacheParallaxMetrics();
    scheduleScrollFrame(window.scrollY);
  }, { passive: true });

  window.addEventListener('load', () => {
    cacheParallaxMetrics();
    scheduleScrollFrame(window.scrollY);
  });

  // Initial trigger to position elements
  updateParallax(window.scrollY);
})();

/* ─────────────────────────────────────────────
   CINEMATIC SPLIT TEXT REVEAL ENGINE
   ───────────────────────────────────────────── */
(function initSplitReveal() {
  const elements = document.querySelectorAll('.split-reveal');
  elements.forEach(el => {
    // Preserve formatting and wrap each word
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.innerHTML = words.map((word, idx) => {
      return `<span class="word-mask" style="display:inline-block;overflow:hidden;vertical-align:top;margin-right:0.25em">
        <span class="word-inner" style="display:inline-block;transform:translateY(105%);transition:transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);transition-delay:${idx * 0.05}s">
          ${word}
        </span>
      </span>`;
    }).join('');
  });

  // Observe reveal triggers
  const splitRevealIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        const inners = entry.target.querySelectorAll('.word-inner');
        inners.forEach(inner => {
          inner.style.transform = 'translateY(0)';
        });
        splitRevealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => splitRevealIO.observe(el));
})();

/* ─────────────────────────────────────────────
   LENIS SMOOTH SCROLL ENGINE INITIALIZATION
   ───────────────────────────────────────────── */
(function initLenisSmoothScroll() {
  // Native scrolling is the cheapest and most reliable path on touch devices.
  if (!hasFinePointer || reducedMotion) return;

  const boot = () => {
    if (typeof Lenis !== 'function') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Luxurious deceleration profile
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Bind Lenis updates to requestAnimationFrame ticks only on desktop.
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Expose lenis instance globally for scroll synchronization if needed.
    window.lenis = lenis;
  };

  if (typeof Lenis === 'function') {
    boot();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.36/dist/lenis.min.js';
  script.async = true;
  script.onload = boot;
  document.head.appendChild(script);
})();
