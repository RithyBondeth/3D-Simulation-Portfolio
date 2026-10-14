# Asset provenance

## Portfolio content

Project previews, Rithy Bondeth's portrait, and the resume were copied from the user's existing portfolio source. Previews were resized to at most 1100 × 740 pixels and encoded as WebP. The original source files were left unchanged.

## Brand identity and typography

The identity follows [bondeth.dev's source](https://github.com/RithyBondeth/Bondeth-Professional-Portfolio) at commit `83e7b7b3acaab7de319a47ae68dc90b3118ebd6a`. Byte's head uses the original 34 × 26 pixel geometry from `components/mascot/robot-geometry.ts`, with the Ubuntu wordmark and four-pixel trail from `components/utils/icons/logo.tsx`. The favicon is adapted from `app/icon.svg`. The robot and pixel trail use the 3D portfolio’s forest green accent, with a pale green accent in dark mode. Shared local geometry lives in `src/domain/brand/byte.ts`; the interface, footer, 3D companion and social preview reuse it.

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

Roads and architectural footprints share tested collision bounds in `src/domain/world`. Camera routes and animation are authored locally. Portfolio content and model attribution remain accessible from the interface.

The infrastructure expansion adds a curved cable-stayed bridge with separate cycling and pedestrian lanes, a driveable Innovation island road loop, station access roads and crossings, stepped offices and curved glass towers. These are locally authored procedural meshes. The elevated Island line has three green-roof stations, three-coach trains, scheduled stops and sliding doors. Road rendering and BMW collisions share the same sampled bridge geometry and elevation profile. The scroll journey crosses the bridge, circles Innovation island and returns to the mainland; its camera, road markings and minimap include the expansion. Transit supports and new buildings have collision footprints. Low graphics reduces rail segments and train count; trains and station status share the existing pause, visibility and reduced-motion clock. Shipping routes pass outside the expanded island.

The scene refinement adds a single instanced contact-shadow draw, chapter-focused camera framing, a browser-window sculpture for the Web district, and consistent green destination feedback. Byte's floating 3D head extrudes the shared logo pixel geometry; its face turns toward the camera and winks on hover or keyboard focus. Waterfront foam and ocean contact foam use local shaders. Boat wakes use tapered ribbons sampled from historical stern positions, so they follow the actual fleet routes at a fixed water height. Low graphics uses fewer wake segments and vessels; ambient effects share the existing pause, visibility, and reduced-motion clock.

The [Kloppenheim 06 (Pure Sky)](https://polyhaven.com/a/kloppenheim_06_puresky) HDR, by Greg Zaal with sky edits by Jarod Guest, is hosted at `public/environment/world-sky.hdr`. It provides reflections; the visible sky is procedural. The unchanged 1K asset is licensed under [CC0](https://polyhaven.com/license).

Unused asphalt textures, studio artwork and the obsolete island preview have been removed. Superseded scene implementations and verification exports are recoverable from Git history. Current screenshots remain in `artifacts/`.

The public-asset test verifies runtime references and explicitly retains the crawler endpoint, model attribution and editable plate SVG. Social previews are generated by `scripts/generate-social-preview.mjs`.
