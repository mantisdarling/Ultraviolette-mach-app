# Ultraviolette F77 Mach 2 Clone — Security Review

**Review date:** 19 August 2026

**Repository:** [mantisdarling/Ultraviolette-mach-app](https://github.com/mantisdarling/Ultraviolette-mach-app)

**Deployment:** [ultraviolette-automobile-clone.vercel.app](https://ultraviolette-automobile-clone.vercel.app/)

**Security commit:** `167c9ba9b195a448e6769d7e84123851d6d69542`

## Executive summary

A full security and resilience pass was completed across the static HTML, CSS, JavaScript, service worker, metadata, CDN loading, and deployment configuration. The hardened build was committed by **mantisdarling**, pushed to `main`, and verified on the production Vercel origin. The application now has a strict response-header policy, no inline event-handler attributes, no reviewed application HTML injection sinks, guarded image fallback behavior, SRI-protected Lenis loading, and a constrained service-worker fetch policy.

The production browser probe also confirmed that the page renders, the service worker controls the page, the non-blocking font preload becomes a stylesheet, and the Three.js viewer is not requested before the showcase is entered. After entering the showcase, the viewer bundle and Three.js loaded successfully and the viewer reached its ready state without observed runtime errors.

## Changes implemented

| Area | Remediation | Verification outcome |
| --- | --- | --- |
| Deployment headers | Added `vercel.json` with CSP, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`, and `Cross-Origin-Opener-Policy`. | Production response returned all expected headers with HTTP 200. |
| CSP | Removed script `unsafe-inline`; retained only reviewed SHA-256 hashes for JSON-LD and the import map. Added `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, and `form-action 'self'`. | Header is present on the live deployment. |
| Inline handlers | Externalized boot behavior into `js/boot.js`; removed inline `onclick`, `onload`, and `onerror` attributes. | Local and production browser probes reported `0`. |
| DOM safety | Replaced application `innerHTML` clearing/templates with `replaceChildren()`, `DocumentFragment`, DOM node construction, and `textContent`. | Application sink scan reported `0` matches. |
| Image fallbacks | Replaced inline image error handlers with `data-fallback` attributes and a same-origin `/assets/images/` allowlist. | Five fallback attributes present; no inline fallback handlers remain. |
| Modal actions | Replaced inline modal calls with `data-modal-open` and `data-modal-close` bindings. | Three open attributes and reviewed listeners are present. |
| CDN dependency | Added SRI, anonymous CORS, and no-referrer loading to the dynamic Lenis dependency. | Syntax and production loading checks passed. |
| Service worker | Restricted interception to GET requests, same-origin or approved Google font origins, and known static extensions. Advanced cache to `mach-ev-cache-v24`. | Service worker controlled the local and production browser pages. |
| Metadata | Corrected stale repository/deployment URLs in `robots.txt`, `sitemap.xml`, and `README.md`; updated sitemap modification date. | Files are included in commit `167c9ba`. |
| Contributor guidance | Replaced the `new Function()` syntax-check example with `node --check`. | Repository-wide sink scan is clean. |

## CSP details

The deployed policy is strict for executable content. `script-src` permits only same-origin scripts, the reviewed jsDelivr dependency origin, and the two exact hashes required for the non-executable JSON-LD and import-map blocks. `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `form-action 'self'`, and `upgrade-insecure-requests` reduce injection, embedding, and navigation exposure. Styles continue to allow inline declarations because this legacy static page uses inline style attributes; executable inline script is not permitted.

The reviewed script hashes are:

| Block | SHA-256 hash |
| --- | --- |
| JSON-LD block | `sha256-lLHk3enwCJO/a4ka14eDlgmF6gELlusvo4KuWCsJKpo=` |
| Import-map block | `sha256-IFR7pC7xV/3wJN0hVN/QVYZPobHRjFDxP5dLngSqMWc=` |

## Verification record

The following checks were run after the final boot v3 and service-worker cache v24 changes:

| Check | Result |
| --- | --- |
| `node --check` for boot, main, viewer, nebula, and service-worker JavaScript | Passed |
| `python3 -m json.tool vercel.json` | Passed |
| `git diff --check` | Passed |
| Inline event-attribute scan | `0` matches |
| Application HTML/code injection-sink scan | `0` matches |
| Local browser boot | Loader dismissed; no observed runtime errors |
| Local font promotion | `rel="stylesheet"`, stylesheet loaded |
| Local lazy viewer behavior | Viewer absent before showcase; ready after showcase entry |
| Production browser boot | Loader dismissed; service worker controlled page; no observed runtime errors |
| Production font promotion | `rel="stylesheet"` |
| Production lazy viewer behavior | No viewer or Three.js request before showcase; viewer ready after entry |
| Reusable skill validation | `Skill is valid!` |

## Final Lighthouse mobile audit

A final Lighthouse 12.8.2 performance run was completed against the deployed Vercel URL using simulated mobile throttling. It is a point-in-time audit rather than a before/after comparison, so it should not be interpreted as a quantified regression delta.

| Metric | Result |
| --- | ---: |
| Performance score | 41/100 |
| First Contentful Paint | 3.5 s |
| Largest Contentful Paint | 4.7 s |
| Speed Index | 7.0 s |
| Total Blocking Time | 2,800 ms |
| Cumulative Layout Shift | 0.0004 |
| Time to Interactive | 7.3 s |
| Total requests / transfer | 15 / 212.3 KiB |
| Font transfer | 103.8 KiB across 4 requests |
| Script transfer | 19.5 KiB across 2 requests |
| Image transfer | 35.9 KiB across 2 requests |

The mobile audit confirms the intended low-end strategy keeps the initial script payload small and avoids loading the Three.js viewer on the first view. The remaining score constraint is primarily simulated mobile main-thread work and font transfer; the security pass did not add a new application framework or a blocking viewer load.

## Delivery

The changes are available at [GitHub commit `167c9ba`](https://github.com/mantisdarling/Ultraviolette-mach-app/commit/167c9ba9b195a448e6769d7e84123851d6d69542), and the production deployment is available at [ultraviolette-automobile-clone.vercel.app](https://ultraviolette-automobile-clone.vercel.app/).

## References

[1]: https://github.com/mantisdarling/Ultraviolette-mach-app "Ultraviolette F77 Mach 2 Clone repository"
[2]: https://github.com/mantisdarling/Ultraviolette-mach-app/blob/main/vercel.json "Deployment security headers"
[3]: https://github.com/mantisdarling/Ultraviolette-mach-app/blob/main/js/boot.js "External boot coordinator"
[4]: https://github.com/mantisdarling/Ultraviolette-mach-app/blob/main/sw.js "Hardened service worker"
[5]: https://ultraviolette-automobile-clone.vercel.app/ "Production deployment"
[6]: https://github.com/mantisdarling/Ultraviolette-mach-app/blob/main/SECURITY-REVIEW.md "Security review record"
