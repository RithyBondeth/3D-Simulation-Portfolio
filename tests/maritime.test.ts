import test from "node:test";
import assert from "node:assert/strict";
import {
  fleet,
  vesselPose,
  vesselWakePoint,
} from "../src/domain/world/maritime.ts";

test("the fleet completes continuous circuits outside the island and marina", () => {
  for (const vessel of fleet) {
    const period = (Math.PI * 2) / vessel.speed;
    const start = vesselPose(vessel, 0),
      end = vesselPose(vessel, period);
    assert.ok(Math.hypot(start.x - end.x, start.z - end.z) < 1e-8);
    for (let i = 0; i <= 720; i++) {
      const t = (i / 720) * period,
        pose = vesselPose(vessel, t),
        next = vesselPose(vessel, t + 0.001);
      assert.ok(Number.isFinite(pose.yaw));
      assert.ok(
        Math.abs(pose.x) > 66 || Math.abs(pose.z) > 66,
        "vessel entered the island foundation",
      );
      assert.ok(
        pose.x < -96 || pose.x > -60 || pose.z < -44 || pose.z > -22,
        "vessel entered marina safety margin",
      );
      const tangent = Math.atan2(-(next.x - pose.x), -(next.z - pose.z));
      assert.ok(
        Math.abs(Math.sin(tangent - pose.yaw)) < 0.001,
        "vessel heading must follow its tangent",
      );
    }
  }
});

test("wake starts at the stern and follows historical boat positions through turns", () => {
  for (const vessel of fleet) {
    for (const seconds of [0, 12, 180]) {
      const pose = vesselPose(vessel, seconds);
      const stern = vesselWakePoint(vessel, seconds, 0);
      const length =
        vessel.kind === "cargo" ? 24 : vessel.kind === "ferry" ? 14 : 10;
      assert.ok(
        Math.abs(Math.hypot(stern.x - pose.x, stern.z - pose.z) - length / 2) <
          1e-8,
      );
      const forwardX = -Math.sin(pose.yaw),
        forwardZ = -Math.cos(pose.yaw);
      assert.ok(
        (stern.x - pose.x) * forwardX + (stern.z - pose.z) * forwardZ < 0,
      );
      for (const age of [2, 5, 10]) {
        const point = vesselWakePoint(vessel, seconds, age);
        assert.deepEqual(point, vesselWakePoint(vessel, seconds - age, 0));
        assert.ok(
          (point.x - stern.x) * forwardX + (point.z - stern.z) * forwardZ < 0,
        );
      }
    }
  }
});
