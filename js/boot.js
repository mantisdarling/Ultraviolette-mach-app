/*
 * MACH-EV boot coordinator.
 * Keeps executable boot logic in a reviewed same-origin bundle instead of inline handlers.
 */

const fontPreload = document.getElementById('font-preload');
if (fontPreload) {
  const promoteFont = () => {
    if (fontPreload.rel !== 'stylesheet') fontPreload.rel = 'stylesheet';
  };
  fontPreload.addEventListener('load', promoteFont, { once: true });
  // The preload may have completed before deferred boot.js attached its listener.
  promoteFont();
}

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => console.log('Service Worker registered successfully:', registration.scope))
      .catch((error) => console.error('Service Worker registration failed:', error));
  }, { once: true });
}

// Safety fallback: dismiss the loader if the main interaction bundle fails to execute.
setTimeout(() => {
  const loader = document.getElementById('loader');
  if (!loader || loader.classList.contains('gone')) return;
  console.warn('Mach-EV: Triggered fallback loader dismissal.');
  loader.classList.add('gone');
  document.querySelectorAll('.hero-content .sw').forEach((element) => element.classList.add('on'));
  document.querySelectorAll('#hero .ctr[data-t]').forEach((element) => {
    if (typeof window.runCounter === 'function') window.runCounter(element);
    else element.textContent = element.dataset.t || '';
  });
}, 4500);

const loadScript = (src, attributes = {}) => {
  const script = document.createElement('script');
  Object.assign(script, attributes, { src });
  document.body.appendChild(script);
  return script;
};

window.addEventListener('load', () => {
  const profile = window.__uvPerformance;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !profile?.allowNebula) return;

  const loadNebula = () => loadScript('js/webgl-nebula.js?v=15', { defer: true });
  if ('requestIdleCallback' in window) requestIdleCallback(loadNebula, { timeout: 1800 });
  else setTimeout(loadNebula, 1200);
}, { once: true });

// The product showcase is intentionally image-led. No Three.js module is loaded
// on the landing page, keeping the first view sharp and lightweight on mobile.
