# ITSDEV motion v1.0.0

Specification: https://app.notion.com/p/3f79cc8ccb4a81adac5cfca5888fabde
References: https://transitions.dev/ and https://github.com/Jakubantalik/transitions.dev.
The implementation is original and has no motion runtime dependency.

`src/assets/motion.css` is the identical vendored copy of DJC `frontend/src/motion/motion.css`. Update both and verify SHA-256 equality for the next version. The content-first adapter lives in `motion-portal.css`; code copying is progressively enhanced by `reading-motion.ts` only on article pages.

Cards lift 4px/220ms on fine-pointer hover or keyboard focus. Native TOC links retain hashes/history and work without JS. Smooth scrolling respects OS reduced motion and the off profile. Code copy uses a 140ms button, a polite live status and an explicit failure message; controls are only inserted when Clipboard API exists. Article content is never hidden for reveal. No page transition is added.

Default `PUBLIC_MOTION_MODE=subtle`; allowed build values are `off`, `subtle`, `standard`. GitHub Actions reads repository variable `PUBLIC_MOTION_MODE`. Set `off` and redeploy the same release to persist rollback; changing `document.documentElement.dataset.motion='off'` disables motion only in the current page. Reduced motion always overrides the profile. Existing theme preference, static content publishing and AdSense gates remain intact.

OKR connection: maintain access to published engineering records through keyboard, mobile and JS-disabled reading. No readership/conversion uplift is claimed.

Evaluation: 320/390/768/1440px Chromium, light/dark, native hashes, clipboard success, reduced motion, off, no-JS and 200% text. Targets: all applicable assertions pass, 0 new page exceptions, added JS gzip <=5KB. Content fixtures remain isolated and noindex; public build must exclude fixtures and preserve all 8 reference hashes.

Commands: `npm run check`, `npm run test:content`, `npm run test:a11y`, `npm run build`, `npm run verify`, `npm run test:e2e`, `npm run deploy:check`. Initial verification: 52 files with 0 diagnostics, 14 public pages, 266 internal links and 8 source hashes, 0 verification failures; content suite 16/16 including code copy and no-JS. Public build size after first implementation: CSS gzip 8635 bytes, shared JS gzip 564 bytes; article-only copy bundle measured separately in fixture output.

Field targets are LCP <=2.5s, INP <=200ms, CLS <=0.1 at real-user p75. Three local-network mobile Chromium samples before/after are a lab check, not evidence of real-user p75 or guaranteed 60fps. Baseline/after observations are recorded with the deployment evidence; field KPI verification remains outstanding until a sufficient real-user dataset exists.

## Entrance and scroll correction — 2026-10-12

The user's clarified scope includes first-screen stagger and one-time scroll reveals. `src/lib/reveal.js` is identical to DJC `src/motion/reveal.js`. Base enhances hero children, feature art/copy, section headings, category navigation, article cards, service cards and writing principles. Article bodies stay static. 450ms duration, 70ms stagger capped at 210ms, 12px travel in the default subtle profile (20px standard). Headlines remain opaque. Missing JS/observer support leaves all content visible; keyboard focus, reduced motion, runtime off and printing cancel active reveals.

OKR: convey hierarchy and newly reached sections without blocking reading; no engagement uplift claimed. KPI/pass criteria: 4 viewport entry/scroll cases pass, no replay on reverse scroll, reduced-motion content opacity 1, no-JS reading preserved. Before: no viewport-triggered animation; after: new cases 4/4, full public suite 16/16. `npm run check`: 0 diagnostics; `npm run build`: 14 pages; `npm run verify`: 266 links, 8 source hashes, no failures; `npm run test:e2e`: 16 passed; `npm run deploy:check`: passed. Public build JS gzip 1382 bytes. Field LCP/INP are not certified by these functional tests.
