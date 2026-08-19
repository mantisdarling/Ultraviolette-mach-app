# Official Ultraviolette Homepage Reference Notes

**Source:** https://www.ultraviolette.com/

**Observed:** 19 August 2026

The current official homepage uses a restrained, editorial, mostly black visual system with a compact top navigation. The primary navigation reads **Vehicles**, **Smart Tech**, **UV Racing**, **About**, **Discover**, **Register Your Interest**, and a red **Configure** CTA. The homepage hero is dominated by a large full-bleed product image/video area with very sparse copy, four centered performance metrics, and simple outlined actions such as **Explore** and **Register Interest**.

The page follows a clear product-story sequence: a hero for the flagship street motorcycle, a “Choose Your Ballistic Machine” portfolio section with model cards, an editorial brand statement about high-performance electric motorcycles, proof points for range and warranty, battery safety, Violette AI, connected app experience, global expansion, and a final “Choose Your Ride” discovery/footer area. Product categories are expressed as editorial labels such as **Street**, **Sport**, **Scooter**, and **Funduro**.

The reference presentation is materially different from the current clone: it uses more whitespace and black space, less neon HUD decoration, fewer persistent overlays, thin white rules, restrained serif/sans editorial typography, red action accents, large product photography, and a simpler navigation hierarchy. The redesign should preserve the F77’s interactive viewer but place it inside this calmer product-story framework.

The official site also exposes the following product/discovery paths useful for the clone’s information architecture: `/f77?model=Mach%202`, `/f77?model=Superstreet`, `/tesseract`, `/shockwave`, `/smarttech`, `/f99`, `/about`, `/location`, and `/enquiry_international`.

## F77 product-page notes

**Source:** https://www.ultraviolette.com/f77


The official F77 detail page is even more minimal than the current clone. Its key product message is **Super Sonic Performance**, followed by compact performance pillars for power, torque, range, and top speed. The page uses large black negative space, a single strong product visual, sparse uppercase editorial headings, thin controls, and conversion actions such as **Test Ride F77** and **Download Full Specifications**.

The product story then moves through a power section (“Go Ballistic”), media reviews, and a Smart Tech section focused on Violette A.I. The clone should therefore avoid a permanently visible neon control dashboard above the fold. Instead, the F77 viewer and configurator should appear as a premium interactive chapter after a restrained performance hero, with explicit controls available on demand.

## Local redesign verification notes

The local redesign now renders a black, image-led hero with a red primary action, restrained six-item desktop navigation, a red/white Ultraviolette wordmark, an editorial “Super Sonic Performance” headline, and compact performance metrics. The clone-only chassis dashboard, riding-modes dashboard, and giant marquee are hidden from the default homepage flow; the F77 configurator/viewer, portfolio cards, Smart Tech, registration form, and technical sections remain available. CSS query versions were bumped to avoid stale service-worker styles, and the new red accent is active in the browser (`--uv3: #ef5546`).

## Production redesign verification notes

The pushed redesign is live on Vercel with the new six-item navigation, red accent variable (`#ef5546`), `css/main.css?v=5`, and the preserved `js/main.js?v=19`. Production browser checks confirmed the `replica-mode` body class, hidden clone-only dashboard chapters, active service-worker control, zero inline event attributes, no initial F77 viewer request, and no observed runtime errors.

## Image replacement audit

The strongest local assets are `ss04-desktop.webp` (1920×752, sharp full-width white F77 in a cinematic garage) and `laser-turbo-red.webp` (1200×1200, close product view with the Mach 2 mark). The current 3D viewer is visually over-styled with purple HUD chrome and creates a large dark canvas. The replacement should use `ss04` as the responsive showcase background and `laser-turbo-red` as a compact product detail panel, retaining color/trim controls as lightweight HTML rather than rendering a canvas.

## Image-first local verification

The local showcase now displays the sharp `ss04-desktop.webp` asset at its native 1920×752 dimensions within a compact 16:9 frame. The old viewer canvas and module request are gone; only the hidden shader canvas remains in the DOM and no `#f77-canvas` exists. The prior blank dashboard sections remain `display:none`. A live swatch test successfully changed the image to `laser-afterburner-yellow.webp` without runtime errors, confirming the static color switching still works.

## Production image-first verification

The live Vercel build serves `ss04-desktop.webp` at 1920×752 inside a 641×360 image frame, with no `#f77-canvas`, no `f77-viewer.js` request, and no Three.js module request. The blank spacer sections remain hidden, service-worker control is active, inline event attributes remain at zero, and no runtime errors were observed.

## Blank-gap diagnosis and local fix

The screenshots’ blank page came from `.h-scroll-wrap { height: 350vh; }`, which was intended for a pinned scroll animation but remained after the image-first redesign. The new replica override changes the wrapper to a compact auto-height rail, makes the sticky container static, and enables a normal horizontal overflow track. Local measurements now show the story wrapper at about 634px tall instead of 350 viewport heights, with the F77 showcase starting immediately after it.

The local visual boundary check confirms the next F77 showcase begins directly after the compact story rail; the former full-black viewport is no longer present.

## Production blank-gap verification

The live deployment serves `css/main.css?v=6`. Production measurements confirm the story rail is approximately 634px tall with a static sticky wrapper, and the F77 showcase begins immediately at the next section boundary. The old 350vh spacer is no longer active, and the intentionally hidden dashboard sections remain `display:none`.

## Branding and mobile refinement audit

The current official homepage uses a compact black header with a small Ultraviolette wordmark/logo, product-family navigation, a red Configure CTA, and a photographic SuperStreet hero with visible performance metrics. Its product discovery language is category-based: Street, Sport, Scooter, and Funduro, with a “Choose Your Ride” module. The clone still uses the generic text wordmark and a large neon gradient hero headline, so the refinement should reduce the gradient/purple treatment, use a red-and-white identity, and make the header and hero more editorial.

The clone’s live page has the expected mobile navigation controls in the DOM, but the desktop-width browser view does not yet expose a true narrow-screen touch audit. The next pass will use CSS touch-target rules and browser viewport emulation checks for compact widths.

## Branding and touch verification

The local build now reports an Ultraviolette title and wordmark, the hero accent is red (`#f05a4d`) rather than purple, and the main stylesheet is served as `css/main.css?v=7`. The mobile menu simulation successfully opened with `aria-hidden=false` and body scroll lock, then closed through the new outside-tap listener with `aria-hidden=true` and scroll restored. Hidden spacer sections remain removed and inline event attributes remain at zero.

## Production branding and mobile verification

The live deployment now serves `css/main.css?v=7` and `js/main.js?v=22`. The page title and visible logo are Ultraviolette, the hero accent computes to red (`#f05a4d`), 35 interactive controls expose a minimum visible touch dimension of 40px in the desktop browser context, and the menu open/outside-tap simulation passes. Service-worker control remains active, inline event attributes remain at zero, and no runtime errors were observed.

The simulated 412×915 mobile Lighthouse audit reported a 68/100 performance score, 3.4s FCP, 3.6s LCP, 450ms TBT, 0.001 CLS, 4.1s TTI, and a passing viewport audit.
