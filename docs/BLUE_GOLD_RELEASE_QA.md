# NeuroSuite — Blue & Gold release checklist (16 October 2026)

## Implemented
- Additive, isolated blue-gold visual stylesheet for Italian and English landing pages.
- Restored deep navy / gold identity and layered star field behind the existing animated constellation canvas.
- Updated hero typography, section surfaces, contrast and small-screen navigation.
- Preserved existing copy, privacy wording, LinkedIn links, contact paths, soundtrack and app.js.
- Light-mode compatibility and reduced-motion fallback.

## Static checks performed
- Both index.html and it.html reference styles.css then blue-gold.css.
- Both pages retain hero-canvas, mode-toggle, app.js and complete HTML structure.
- app.js still contains original soundtrack control.
- Only landing HTML and additive theme were modified; no workflows, secrets, API or privacy files changed.

## Browser acceptance tests still required before publishing
- Open IT and EN on real 360px, 390px and 430px Android devices and 768px / 1440px desktop.
- Verify no right-edge clipping, sticky navigation collisions or horizontal overflow.
- Verify constellation renders, sound is opt-in, light/dark toggles and LinkedIn works.
- Verify screen-reader labels, keyboard focus and reduced-motion behavior.
- Capture visual screenshots and approve aesthetics.

## Deployment
This PR deliberately does not deploy or merge. Merge only after explicit approval and browser acceptance checks.
