# Contributing to Ultraviolette Website Clone

Thank you for checking out this project! This is an educational, high-fidelity recreation of the Ultraviolette Automotive website clone (MACH-EV).

---

## ◼ Code Philosophy

To preserve the educational nature and high-fidelity tuning of the UI archeology series, this project adheres to a strict **vanilla stack** philosophy:

1.  **Zero Frameworks**: No React, Vue, Angular, or other web frameworks. Just pure vanilla HTML5.
2.  **No Utility Styles**: No TailwindCSS, Bootstrap, or utility frameworks. Styling is done via vanilla CSS3 using variables, flexbox/grid layouts, and custom keyframe animations.
3.  **No External JS Libraries**: Interactivity, range calculations, Web Audio synthesizer nodes, and smooth scrolling are written in pure native ES6 JavaScript.

---

## ◼ Local Development Setup

To run and debug the project locally:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/mantisdarling/ultraviolette-website-clone.git
    cd ultraviolette-website-clone
    ```

2.  **Run the Site**:
    *   **Option A**: Run using a simple local HTTP server like `Live Server` in VS Code (recommended so the Service Worker registers correctly).
    *   **Option B**: Double-click `index.html` to run locally (the service worker registration will bypass silently on the `file://` protocol).

---

## ◼ Guidelines

*   **HTML Structure**: Maintain semantic tags (`<section>`, `<article>`, `<picture>`). Ensure clean indentation.
*   **CSS Styles**: Put new components in `css/main.css` and use the defined CSS variables (`--black`, `--uv`, etc.) for consistency. Keep `css/critical.css` minimal for above-the-fold content.
*   **Interactivity**: Keep JS modules focused. Check for hoisting or Temporal Dead Zone (TDZ) issues when modifying scrolling triggers.
*   **Console Cleanliness**: Ensure changes do not print any runtime errors or exceptions in the DevTools console.
