import { test } from "node:test";
import assert from "node:assert/strict";
import { PerspectiveCamera, Vector3 } from "three";
import {
  journeyCarPose,
  journeyFov,
  journeyChapter,
  journeyShot,
  journeyStops,
  journeyLength,
} from "../src/lib/coastal-journey.ts";
import { onPavilionRoad, pavilionBlocked } from "../src/lib/pavilion-layout.ts";

test("the scroll route completes a full circuit on clear asphalt", () => {
  const visited = { front: false, right: false, back: false, left: false };
  let last = journeyCarPose(0);
  for (let i = 0; i <= 2000; i++) {
    const pose = journeyCarPose(i / 2000);
    assert.equal(onPavilionRoad(pose.x, pose.z), true, `offroad at ${i}`);
    assert.equal(pavilionBlocked(pose.x, pose.z), false, `blocked at ${i}`);
    assert.ok(
      Math.hypot(pose.x - last.x, pose.z - last.z) <=
        journeyLength / 2000 + 1e-6,
    );
    const turn = Math.atan2(
      Math.sin(pose.yaw - last.yaw),
      Math.cos(pose.yaw - last.yaw),
    );
    assert.ok(Math.abs(turn) < 0.02, `abrupt turn at ${i}`);
    if (pose.z > 30) visited.front = true;
    if (pose.x > 44) visited.right = true;
    if (pose.z < -38) visited.back = true;
    if (pose.x < -44) visited.left = true;
    last = pose;
  }
  assert.ok(Object.values(visited).every(Boolean));
  assert.ok(
    Math.hypot(last.x - journeyCarPose(0).x, last.z - journeyCarPose(0).z) <
      1e-6,
  );
  assert.deepEqual(journeyCarPose(-1), journeyCarPose(0));
  assert.deepEqual(journeyCarPose(2), journeyCarPose(1));
});

test("the orbit camera stays continuous through every bend and chapter stop", () => {
  for (const [i, stop] of journeyStops.entries())
    assert.equal(journeyChapter(stop), i);
  for (let i = 1; i < 1000; i++) {
    const before = journeyShot(i / 1000 - 1e-6),
      after = journeyShot(i / 1000 + 1e-6);
    for (const key of ["camera", "target"] as const) {
      assert.ok(before[key].every(Number.isFinite));
      before[key].forEach((value, axis) =>
        assert.ok(Math.abs(value - after[key][axis]) < 0.01),
      );
    }
  }
  assert.deepEqual(journeyShot(-1), journeyShot(0));
  assert.deepEqual(journeyShot(2), journeyShot(1));
});

test("the complete M4 stays in frame around all four sides of the island", () => {
  for (const aspect of [1, 1.8, 2.4]) {
    const camera = new PerspectiveCamera(journeyFov, aspect, 0.1, 800);
    for (let step = 0; step <= 200; step++) {
      const progress = step / 200,
        shot = journeyShot(progress),
        car = journeyCarPose(progress);
      camera.position.set(...(shot.camera as [number, number, number]));
      camera.lookAt(new Vector3(...(shot.target as [number, number, number])));
      camera.updateMatrixWorld();
      for (const dx of [-3, 3])
        for (const y of [0.2, 2.2])
          for (const dz of [-3, 3]) {
            const corner = new Vector3(car.x + dx, y, car.z + dz).project(
              camera,
            );
            assert.ok(
              Math.abs(corner.x) < 0.85,
              `car clipped at ${progress}, aspect ${aspect}`,
            );
            assert.ok(
              corner.y > -0.85 && corner.y < 0.9,
              `car clipped vertically at ${progress}`,
            );
            assert.ok(corner.z > -1 && corner.z < 1);
          }
    }
  }
});
