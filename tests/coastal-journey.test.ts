import { test } from "node:test";
import assert from "node:assert/strict";
import { PerspectiveCamera, Vector3 } from "three";
import {
  journeyCarX,
  journeyFov,
  journeyChapter,
  journeyShot,
  journeyStops,
} from "../src/lib/coastal-journey.ts";
import { onPavilionRoad, pavilionBlocked } from "../src/lib/pavilion-layout.ts";

test("the cinematic M4 route travels left to right on clear asphalt", () => {
  let last = -Infinity;
  for (let i = 0; i <= 200; i++) {
    const x = journeyCarX(i / 200);
    assert.ok(x >= last);
    assert.equal(onPavilionRoad(x, 30.5), true);
    assert.equal(pavilionBlocked(x, 30.5), false);
    last = x;
  }
  assert.equal(journeyCarX(-1), journeyCarX(0));
  assert.equal(journeyCarX(2), journeyCarX(1));
});

test("camera interpolation is continuous at all four chapter stops", () => {
  for (const [i, stop] of journeyStops.entries()) {
    assert.equal(journeyChapter(stop), i);
    const before = journeyShot(stop - 1e-5),
      after = journeyShot(stop + 1e-5);
    for (const key of ["camera", "target"] as const) {
      assert.ok(before[key].every(Number.isFinite));
      before[key].forEach((value, axis) =>
        assert.ok(Math.abs(value - after[key][axis]) < 0.001),
      );
    }
  }
  assert.deepEqual(journeyShot(-1), journeyShot(0));
  assert.deepEqual(journeyShot(2), journeyShot(1));
});

test("the complete M4 stays in frame above the project dock throughout the journey", () => {
  for (const aspect of [1, 1.8, 2.4]) {
    const camera = new PerspectiveCamera(journeyFov, aspect, 0.1, 800);
    for (let step = 0; step <= 100; step++) {
      const progress = step / 100,
        shot = journeyShot(progress);
      camera.position.set(...(shot.camera as [number, number, number]));
      camera.lookAt(new Vector3(...(shot.target as [number, number, number])));
      camera.updateMatrixWorld();
      for (const dx of [-2.6, 2.6])
        for (const y of [0.2, 1.8])
          for (const dz of [-1.1, 1.1]) {
            const corner = new Vector3(
              journeyCarX(progress) + dx,
              y,
              30.5 + dz,
            ).project(camera);
            assert.ok(
              Math.abs(corner.x) < 0.65,
              `car clipped at ${progress}, aspect ${aspect}`,
            );
            assert.ok(
              corner.y > -0.6 && corner.y < 0.9,
              `car under dock at ${progress}`,
            );
            assert.ok(corner.z > -1 && corner.z < 1);
          }
    }
  }
});
