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
