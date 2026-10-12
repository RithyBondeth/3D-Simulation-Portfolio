# Coastal city verification

Verified locally on 11 October 2026 on branch `feat/modern-city-map`, using the production preview at http://localhost:4173/.

## Implementation

- Nine central blocks with varied glass, stone, and bronze buildings, rooftop equipment, storefronts, textured asphalt, marked intersections, sidewalks, trees, and street furniture.
- A central park with paths, seating, a reflecting pool, pergola, and sculpture.
- A connected coastal promenade with a cycle lane, palms, cafe shelter, sandy beach, umbrellas, lifeguard station, and pier.
- Shared building footprints and shoreline data for the rendered city, vehicle collisions, and minimap. Sand slows the car and the shoreline boundary stops it before the sea.
- Existing BMW model, portfolio content, five destinations, and Simple view retained.
- Fixed overview camera distance limits that previously clipped buildings and the ground. Overview pauses driving and hides duplicate driving HUD panels.

## Automated checks

- `npm test`: **14 passed, 0 failed**. Covers acceleration, braking, reverse, steering, coasting, frame suspension, road speeds, city bounds, continuous avenues, every building footprint, beach access, shore collision, and AI classification.
- `npm run build`: **passed**, including TypeScript checks and Vite production bundling.
- `git diff --check`: **passed**.

## Native browser checks

- Inspected desktop and phone layouts, including a 390 × 844 CSS pixel phone viewport. The phone document width matched its viewport width with no horizontal overflow.
- Keyboard acceleration reached 63 km/h. Steering changed the car heading and moved it off the asphalt; Space stopped it with the scene focused.
- Holding the phone accelerator for 1.6 seconds reached 50 km/h; the brake returned it to 0 km/h.
- Reset restored the vehicle, camera, speed, and distance. The starting camera now looks down the coastal boulevard.
- The overview displayed all five destinations, the central park, and the beachfront without the clipping seen during development. Day/night switching worked.
- E opened Selected work; a minimap destination opened the About panel. Escape/close returned to the city.
- Simple view displayed the portfolio and removed the WebGL canvas; switching back restored the city.
- No browser console errors during these checks. The Three.js dependency emits its existing `THREE.Clock` deprecation warning.
- Temporary viewport overrides were reset after testing.

## Screenshots

- [City overview](city-map.jpg)
- [Boulevard driving view](city-drive.jpg)
- [Phone driving view](city-mobile.jpg)
- [Night overview](city-night.jpg)

## Performance and scope

The scene uses instancing for repeated geometry, locally hosted textures and lighting, and demand rendering. The Three.js scene is lazy loaded. Vite still reports a size advisory for the approximately 1.09 MB minified scene chunk (299 KB gzip); the existing BMW model is approximately 3.9 MB. Lighthouse was not rerun for this redesign, and these browser checks do not measure performance on physical phones.

This is a procedural arcade city. Trees, parked cars, beach furniture, and the pier are decorative. Building footprints, the park pool/pergola, cafe, and lifeguard station have collision boundaries. The ocean has a static rippled material; traffic and pedestrians are not simulated.
