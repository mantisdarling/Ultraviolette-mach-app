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
const HAS_FINE_POINTER = window.matchMedia ? window.matchMedia('(pointer: fine)').matches : true;
const REDUCED_MOTION   = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

/* ─────────────────────────────────────────────
   MAGNETIC CURSOR
───────────────────────────────────────────── */
(function initCursor() {
  if (!HAS_FINE_POINTER) return;

  const cur  = document.getElementById('cur');
  const curR = document.getElementById('cur-r');
  if (!cur || !curR) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; 
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    curR.style.left = rx + 'px';
    curR.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
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
  if (!HAS_FINE_POINTER) return;
  document.querySelectorAll('.btn-p, .btn-o, .btn-g, .sub-btn, .nav-cta')
    .forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const cx = e.clientX - r.left  - r.width  / 2;
        const cy = e.clientY - r.top   - r.height / 2;
        btn.style.transform = `translate(${cx * 0.18}px, ${cy * 0.18}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
})();

/* ─────────────────────────────────────────────
   UNIFIED PASSIVE SCROLL & RESIZE MANAGER
───────────────────────────────────────────── */
(function initScrollSystems() {
  const prog   = document.getElementById('prog');
  const nb     = document.getElementById('navbar');
  const hWrap  = document.getElementById('h-scroll-section');
  const hTrack = document.getElementById('h-track');
  const paraImg  = document.getElementById('para-img');
  const paraWrap = paraImg && typeof paraImg.closest === 'function' ? paraImg.closest('.life-img-wrap') : null;

  let rafPending = false;

  function runAllScrollUpdates() {
    const sy = window.scrollY;
    const bh = document.body.scrollHeight - window.innerHeight;

    /* 1 — Scroll progress bar */
    if (prog) prog.style.width = (bh > 0 ? (sy / bh * 100) : 0) + '%';

    /* 2 — Navbar glass effect */
    if (nb) nb.classList.toggle('scrolled', sy > 60);

    /* 3 — Horizontal scroll (narrative) */
    const currentHasHScroll = hWrap && hTrack && window.innerWidth > 1024;
    if (currentHasHScroll) {
      const rect       = hWrap.getBoundingClientRect();
      const scrollable = hWrap.offsetHeight - window.innerHeight;
      const progress   = scrollable > 0 ? Math.max(0, Math.min(1, -rect.top / scrollable)) : 0;
      const maxX       = -(hTrack.scrollWidth - window.innerWidth + 160);
      hTrack.style.transform = `translateX(${maxX * progress}px)`;
    } else if (hTrack) {
      hTrack.style.transform = '';
    }

    /* 4 — Parallax lifestyle image */
    if (paraImg && paraWrap && !REDUCED_MOTION) {
      const rect   = paraWrap.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      paraImg.style.transform = `translateY(${center * 0.12}px)`;
    }

    rafPending = false;
  }

  window.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(runAllScrollUpdates);
  }, { passive: true });

  runAllScrollUpdates();

  window.addEventListener('resize', () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(runAllScrollUpdates);
  }, { passive: true });
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
  if (el._done) return;
  el._done = 1;
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
      if (!REDUCED_MOTION) s.style.animationDelay = (i * 0.13) + 's';
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

    bikeImg.style.opacity   = '0';
    bikeImg.style.transform = 'scale(.92)';

    // Trigger electrostatic scanner line swipe animation
    const wrapper = bikeImg.closest('.bike-wrap') || document.querySelector('.bike-wrap');
    if (wrapper) {
      wrapper.classList.remove('scanning');
      void wrapper.offsetWidth; // trigger reflow
      wrapper.classList.add('scanning');
      setTimeout(() => wrapper.classList.remove('scanning'), 650);
    }

    setTimeout(() => {
      if (sw.dataset.img) bikeImg.src = sw.dataset.img;
      bikeImg.style.transition = 'opacity .5s, transform .5s';
      bikeImg.style.opacity    = '1';
      bikeImg.style.transform  = 'scale(1)';
    }, 260);
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
  modes.forEach(c => {
    const activate = () => {
      modes.forEach(x => {
        x.classList.remove('on');
        x.setAttribute('aria-pressed', 'false');
      });
      c.classList.add('on');
      c.setAttribute('aria-pressed', 'true');
    };
    c.addEventListener('click',   activate);
    c.addEventListener('keydown', e => { 
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        activate(); 
      } 
    });
  });
})();

/* ─────────────────────────────────────────────
   SECURE FORM HANDLER
───────────────────────────────────────────── */
(function initForm() {
  const form    = document.getElementById('racing-form');
  const formOk  = document.getElementById('form-ok');
  const formBtn = document.getElementById('form-btn');
  if (!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

    if (!name || name.length < 2)         { showError('ENTER YOUR NAME');        return; }
    if (!email || !EMAIL_RE.test(email))  { showError('INVALID EMAIL ADDRESS');  return; }

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
    if (sec) sec.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
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
