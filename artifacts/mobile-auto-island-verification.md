# Automatic mobile island and scrolling

Date: 2026-10-13

- Removed the phone/data-saver entry gate and its preview UI. The 3D view now loads the live world automatically at every viewport size. Existing Simple view preference still works.
- Auto graphics continue to use Battery saver on phones and devices with data-saving or limited hardware hints. Explicit graphics preferences still win.
- Fixed the orbit-control canvas wrapper: its inline `touch-action: none` blocked native swipes despite the canvas having `pan-y`. The named wrapper now gets the same `pan-y !important` override as the canvas outside manual driving. Manual mode retains orbit controls.
- Production browser checked at actual 390×844 and 320×780: canvas loads without clicking, no Enter button, no horizontal overflow, wrapper and canvas both allow vertical scrolling. Native browser scrolling over the scene advances the Skills, Journey, and Work chapters; reverse scrolling returns to Skills. No errors captured for the production URL.
- `npm test`: 33 passed. Removed the obsolete defer-on-mobile test along with the deferral function; graphics quality, camera route, and responsive framing checks remain.
- `npm run build` and `git diff --check`: passed. Existing Three.js chunk size advisory remains.

Proof: `mobile-auto-island-scroll.jpg` shows the Work chapter reached by scrolling over the automatically loaded world. Browser viewport checks do not measure frame rates on physical phones; real-device performance still depends on the GPU and browser.
