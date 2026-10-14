import { test } from "node:test";
import assert from "node:assert/strict";
import { PerspectiveCamera, Vector3 } from "three";
import {
  journeyCarPose,
  journeyFov,
  journeyFrame,
  journeyChapter,
  journeyShot,
  journeyStops,
  journeyLength,
  journeyLandmarks,
} from "../src/domain/world/scroll-journey.ts";
import {
  isWorldRoad,
  isWorldBlocked,
} from "../src/domain/world/island-layout.ts";

test("the scroll route completes a full circuit on clear asphalt", () => {
  const visited = {
    front: false,
    right: false,
    back: false,
    left: false,
    bridge: false,
    annex: false,
  };
  // Sample the longer route densely enough to catch tight junction turns.
  const samples = 40000;
  let last = journeyCarPose(0);
  for (let i = 0; i <= samples; i++) {
    const pose = journeyCarPose(i / samples);
    assert.equal(isWorldRoad(pose.x, pose.z), true, `offroad at ${i}`);
    assert.equal(isWorldBlocked(pose.x, pose.z), false, `blocked at ${i}`);
    assert.ok(
      Math.hypot(pose.x - last.x, pose.z - last.z) <=
        journeyLength / samples + 1e-6,
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
    if (pose.x > 65 && pose.x < 85) visited.bridge = true;
    if (pose.x > 129) visited.annex = true;
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

test("the full-stage desktop composition keeps the car visible beside the reading veil", () => {
  for (const [width, height] of [
    [1024, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    const camera = new PerspectiveCamera(journeyFov, width / height, 0.1, 800);
    camera.setViewOffset(width, height, -width * 0.15, 0, width, height);
    const frame = Math.max(1, (height / width) * 1.12) * 1.28;
    for (let step = 0; step <= 200; step++) {
      const shot = journeyShot(step / 200),
        car = journeyCarPose(step / 200);
      camera.position
        .set(...(shot.camera as [number, number, number]))
        .multiplyScalar(frame);
      camera.lookAt(new Vector3(...(shot.target as [number, number, number])));
      camera.updateMatrixWorld();
      for (const dx of [-3, 3])
        for (const dz of [-3, 3]) {
          const point = new Vector3(car.x + dx, 2.2, car.z + dz).project(
            camera,
          );
          assert.ok(
            Math.abs(point.x) < 0.95 && Math.abs(point.y) < 0.9,
            `car clipped at ${width} px, ${step}`,
          );
        }
    }
  }
});

test("portrait framing brings the island closer while keeping the car visible throughout the route", () => {
  for (const [width, height] of [
    [320, 700],
    [390, 764],
    [440, 870],
    [760, 900],
  ]) {
    const frame = journeyFrame(width, height);
    const previousFrame = Math.max(1, (height / width) * 1.12) * 1.28;
    assert.ok(frame <= previousFrame);
    if (height / width > 1.5) assert.ok(frame <= previousFrame * 0.8);
    const camera = new PerspectiveCamera(journeyFov, width / height, 0.1, 800);
    for (let step = 0; step <= 200; step++) {
      const shot = journeyShot(step / 200),
        car = journeyCarPose(step / 200);
      camera.position
        .set(...(shot.camera as [number, number, number]))
        .multiplyScalar(frame);
      camera.lookAt(new Vector3(...(shot.target as [number, number, number])));
      camera.updateMatrixWorld();
      for (const dx of [-3, 3])
        for (const dz of [-3, 3]) {
          const point = new Vector3(car.x + dx, 2.2, car.z + dz).project(
            camera,
          );
          assert.ok(
            Math.abs(point.x) < 0.94 && Math.abs(point.y) < 0.9,
            `phone car clipped at ${width} px, ${step}`,
          );
        }
    }
  }
  assert.equal(journeyFrame(1440, 900), 1.28);
  assert.equal(journeyFrame(0, 0), 1.28);
});

test("chapter landmarks remain visible beside the copy during closer camera moments", () => {
  for (const [width, height] of [
    [320, 700],
    [768, 900],
    [1440, 900],
  ]) {
    const camera = new PerspectiveCamera(journeyFov, width / height, 0.1, 800);
    if (width > 900)
      camera.setViewOffset(width, height, -width * 0.15, 0, width, height);
    journeyStops.forEach((stop, i) => {
      const shot = journeyShot(stop);
      camera.position
        .set(...(shot.camera as [number, number, number]))
        .multiplyScalar(journeyFrame(width, height));
      camera.lookAt(new Vector3(...(shot.target as [number, number, number])));
      camera.updateMatrixWorld();
      const landmark = new Vector3(...journeyLandmarks[i]).project(camera);
      assert.ok(
        Math.abs(landmark.x) < 0.9 && Math.abs(landmark.y) < 0.8,
        `chapter ${i} at ${width}px`,
      );
      if (width > 900)
        assert.ok(landmark.x > -0.3, `chapter ${i} behind desktop copy`);
    });
  }
});
