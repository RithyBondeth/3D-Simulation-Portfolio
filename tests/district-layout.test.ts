import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cyclistPose,
  cycleLoopLength,
  pedestrianLoops,
  pedestrianPose,
  districtBuildings,
  districtObstacles,
} from "../src/domain/world/district-layout.ts";
import {
  isWorldRoad,
  isWorldBlocked,
  shoreline,
} from "../src/domain/world/island-layout.ts";
import { advanceCar, spawnCar } from "../src/domain/world/driving.ts";

test("pedestrians and cyclists stay on land, outside the driving circuit and solid district features", () => {
  for (let step = 0; step <= 500; step++) {
    const poses = pedestrianLoops.map((_, loop) =>
      pedestrianPose(loop, step / 500),
    );
    poses.push(cyclistPose((step / 500) * cycleLoopLength));
    for (const pose of poses) {
      assert.ok(
        Math.abs(pose.x) < 56 && pose.z > -49 && pose.z < shoreline(pose.x),
      );
      assert.equal(isWorldRoad(pose.x, pose.z), false);
      for (const obstacle of [...districtBuildings, ...districtObstacles]) {
        assert.ok(
          Math.abs(pose.x - obstacle.x) > obstacle.w / 2 + 0.35 ||
            Math.abs(pose.z - obstacle.z) > obstacle.d / 2 + 0.35,
        );
      }
    }
  }
});

test("the cycle lane closes without a position or heading jump", () => {
  const start = cyclistPose(0),
    end = cyclistPose(cycleLoopLength - 1e-5);
  assert.ok(Math.hypot(start.x - end.x, start.z - end.z) < 0.00002);
  assert.ok(
    Math.abs(
      Math.atan2(Math.sin(start.yaw - end.yaw), Math.cos(start.yaw - end.yaw)),
    ) < 0.0001,
  );
  assert.deepEqual(cyclistPose(cycleLoopLength * 3), start);
});

test("manual driving stops before the parked electric shuttle", () => {
  const car = { ...spawnCar(), x: 29, z: 27.1, yaw: 0, speed: 18 };
  assert.equal(isWorldBlocked(car.x, car.z), false);
  const next = advanceCar(car, { throttle: 1, steer: 0, brake: false }, 10);
  assert.equal(next.speed, 0);
  assert.ok(next.z >= 26.5);
  assert.equal(isWorldBlocked(next.x, next.z), false);
});
