import test from "node:test";
import assert from "node:assert/strict";
import { fleet, vesselPose } from "../src/lib/maritime.ts";

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
