# Asset provenance

## Portfolio content

Project previews, Rithy Bondeth's portrait, and the resume were copied from the user's existing portfolio source. Previews were resized to at most 1100 × 740 pixels and encoded as WebP. The original source files were left unchanged.

## Brand identity and typography

The identity follows [bondeth.dev's source](https://github.com/RithyBondeth/Bondeth-Professional-Portfolio) at commit `83e7b7b3acaab7de319a47ae68dc90b3118ebd6a`. Byte's head uses the original 34 × 26 pixel geometry from `components/mascot/robot-geometry.ts`, with the Ubuntu wordmark and four-pixel trail from `components/utils/icons/logo.tsx`. The favicon is adapted from `app/icon.svg`. The robot and pixel trail use the 3D portfolio’s forest green accent, with a pale green accent in dark mode; the artwork geometry and typography stay consistent with the main portfolio. The interface, footer, workshop artwork, and social preview reuse this identity.

Ubuntu is the shared heading, body, navigation, and label face; JetBrains Mono is reserved for code, matching the source portfolio's `--font-ui` and `--font-code` roles. Fonts are hosted locally through Fontsource. `npm run assets:social` outlines the local Ubuntu glyphs and uses the shared Byte geometry to produce self-contained SVG and PNG previews.

## BMW M4 Competition M Package

- Author: [SRT Performance](https://sketchfab.com/TheRealSRT).
- Original model: [BMW M4 Competition M Package](https://sketchfab.com/3d-models/bmw-m4-competition-m-package-5c0a2dafb1ad408d9fc9eeef9aee531b).
- License: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
- Downloaded web derivative: [lukaizj/car-mod-saas](https://github.com/lukaizj/car-mod-saas/blob/main/public/models/ATTRIBUTION.md), file `public/models/bmw-m4.web.glb`.
- Local file: `public/models/bmw-m4.glb`, 3,886,832 bytes.
- SHA-256: `1a072ff0aee180b1c13d60c0ae47c93e7c151240c532b60101449a651531b3e1`.
- The derivative uses Meshopt and WebP compression, removes hidden cabin/engine meshes, and limits textures to 512 pixels. Embedded author/source/license metadata is retained.
- This website normalizes the model scale/orientation, changes paint to satin ice blue, removes the racing livery texture at runtime, refines window/tyre/rim materials, and splits wheel geometry into quadrants for rolling and steering. The downloaded GLB is unchanged.
- Front and rear plates are procedural meshes with a locally rendered long Cambodian-style plate reading **DETH X RANA**, based on the user's reference. The editable artwork is `public/textures/cambodia-plate.svg`; `cambodia-plate.png` preserves the Khmer lettering across devices without requiring a Khmer font at runtime.
- Visible credits are available from **Controls & credits** in the website footer and the help button. The upstream attribution is retained in `public/models/ATTRIBUTION.md`.

## Bondeth World

The floating island, layered foundations, rounded gallery architecture, sculpted towers, rooftop gardens, trees, palms, street furniture, hovering companion, sky tram, contact beacon, satellite islands, ringed planet, stars, and luminous road details are procedural geometry authored locally. The sky, animated AI portal, and flowing waterfall use locally authored shaders. Typography signs use local CanvasTextures; the project screens use the user's existing portfolio previews. No external map service or new 3D asset is used.

The world reuses the compact road and architectural footprints from the preceding pavilion, including its tested collision bounds. Camera routes and animation are authored locally. The original portfolio content and model attribution remain accessible from the interface.

Two assets from [Poly Haven](https://polyhaven.com/license), licensed under CC0, remain hosted locally:

- [Kloppenheim 06 (Pure Sky)](https://polyhaven.com/a/kloppenheim_06_puresky), by Greg Zaal with sky edits by Jarod Guest: the unchanged 1K HDR at `public/environment/city-sky.hdr` provides reflections. The visible world sky is procedural.
- [Asphalt 02](https://polyhaven.com/a/asphalt_02), by Rob Tuytel: maps were resized from 1K to 512 pixels and encoded as WebP in `public/textures/asphalt-*.webp`. These are retained from the earlier city; the current world road uses a smooth material and does not load them.

Earlier studio, city, pavilion, and pastel miniature scene components and screenshots remain in the repository as design history. Their photographs and textures are not used by the current world unless listed above.

## Earlier studio artwork

`public/images/studio-art.webp` is retained from the earlier indoor design and is not rendered by the outdoor experience. It was generated with the built-in image generation tool as a square Angkor Wat print in coral, forest green, and ivory.
