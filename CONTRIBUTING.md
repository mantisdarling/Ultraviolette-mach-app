# Contributing to the Ultraviolette F77 Mach 2 Clone

Thank you for participating in this project. This repository serves as a reference for vanilla web animations, interactive WebGL shaders, and programmatic audio systems. To maintain the structural integrity and performance baseline of the project, all contributions must adhere to the guidelines detailed below.

---

## Technical and Architectural Philosophy

This repository is built strictly using vanilla web technologies. Contributions introducing structural libraries, CSS utility toolsets, or runtime frameworks (such as React, Vue, Tailwind CSS, or Bootstrap) will not be accepted. The application stack is defined as follows:

* **Zero Framework Overhead:** All rendering and UI components are managed via standard HTML5 APIs and native DOM scripting.
* **Component Styling:** Style rules are authored in standard CSS3. Global variables, custom typography models, flexbox, and grid modules are declared natively. Above-the-fold layouts are prioritized in critical inline CSS blocks to minimize Largest Contentful Paint (LCP) delays.
* **Scroll and Animation Synchronization:** Smooth scrolling is driven by the Lenis virtual scrolling engine. Viewport-relative entry states and coordinate-based translations must sync with the active Lenis animation loop to prevent frames from stuttering.

---

## Development Guidelines

### HTML Markup Standards
* Maintain strict semantic structure using HTML5 elements such as `<section>`, `<article>`, `<nav>`, and `<picture>`.
* Ensure that all interactive elements are keyboard-accessible and possess unique, descriptive identifiers to facilitate automated browser test verification.
* Configure explicit `width` and `height` properties on all media tags (images, videos, canvases) to eliminate layout shifting (Cumulative Layout Shift) during loading cycles.

### CSS Architecture
* Declare styling overrides in `css/main.css`. The `css/critical.css` stylesheet should remain restricted to above-the-fold elements and preloader logic.
* Utilize the custom CSS property system (`--black`, `--uv`, `--glow`, `--ease`) to maintain visual alignment across themes.
* Enable `will-change: transform` and `backface-visibility: hidden` properties on translating layers to isolate rendering onto separate GPU compositor threads.

### JavaScript and Web Audio API
* JavaScript files must compile cleanly under standard ES6 modules. Ensure zero runtime compilation issues.
* When updating the programmatic powertrain sound generator, manage oscillators, filters, and dynamic gains inside separate Web Audio nodes, routing signals cleanly to the master volume node.
* Avoid blocking main execution threads with intensive scripts. Offload calculations or run animation sequences within `requestAnimationFrame` hooks.

### Progressive Web App and Caching
* If modifications alter static layouts or local assets, you must increment the cache name (`CACHE_NAME`) in `sw.js` (e.g., from `mach-ev-cache-v8` to `mach-ev-cache-v9`).
* Ensure newly introduced media assets are added to the pre-cache arrays in `sw.js` to support offline operation.

---

## Code Submission Process

1. **Fork the Repository:** Create a local clone of the main branch.
2. **Implement Changes:** Develop changes in a dedicated branch using standard prefixes (`feature/`, `fix/`, `docs/`).
3. **Verify Code Quality:**
   * Run the syntax checker via Node.js:
     ```bash
     node -e "new Function(require('fs').readFileSync('js/main.js', 'utf8'))"
     ```
   * Verify that the Chrome/Edge DevTools console is clean and displays zero runtime exceptions during navigation.
4. **Submit a Pull Request:** Describe the modification, details of visual testing, and the performance impact of your patch.
