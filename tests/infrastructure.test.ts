import test from "node:test";
import assert from "node:assert/strict";
import {
  bridgePoint,
  bridgePath,
  annexRoad,
  accessRoads,
  driveElevation,
  innovationBuildings,
  innovationIsland,
  nearestPathPoint,
} from "../src/lib/infrastructure.ts";
import { onRoad, blocked, advanceCar, spawnCar } from "../src/lib/driving.ts";
import {
  railPose,
  railLength,
  railHeight,
  railPeriod,
  railStations,
  transitObstacles,
  trainSchedule,
} from "../src/lib/sky-rail.ts";
import { fleet, vesselPose } from "../src/lib/maritime.ts";

test("bridge and annex loop are connected asphalt with safe collision clearance", () => {
  assert.ok(
    Math.hypot(
      bridgePath.at(-1)!.x - annexRoad[0].x,
      bridgePath.at(-1)!.z - annexRoad[0].z,
    ) < 1e-8,
  );
  for (const path of [bridgePath, annexRoad, ...accessRoads]) {
    for (let i = 0; i < path.length - 1; i++) {
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const x = path[i].x * (1 - t) + path[i + 1].x * t;
        const z = path[i].z * (1 - t) + path[i + 1].z * t;
        assert.ok(onRoad(x, z), `missing asphalt at ${x}, ${z}`);
        assert.equal(blocked(x, z), false, `obstruction at ${x}, ${z}`);
      }
    }
  }
  assert.ok(onRoad(44.5, -29));
  for (const building of [...innovationBuildings, ...transitObstacles])
    assert.ok(blocked(building.x, building.z));
});

test("bridge height is continuous and its guardrails stop a departing car", () => {
  assert.ok(
    Math.abs(driveElevation(bridgePoint(0).x, bridgePoint(0).z)) < 1e-8,
  );
  assert.ok(
    Math.abs(driveElevation(bridgePoint(1).x, bridgePoint(1).z)) < 1e-8,
  );
  let previous = 0;
  for (let i = 0; i <= 500; i++) {
    const p = bridgePoint(i / 500),
      height = driveElevation(p.x, p.z);
    assert.ok(Math.abs(height - p.y) < 0.004);
    assert.ok(Math.abs(height - previous) < 0.02);
    previous = height;
  }
  const p = bridgePoint(0.5);
  let car = { ...spawnCar(), x: p.x, z: p.z, yaw: 0, speed: 7 };
  for (let i = 0; i < 180; i++)
    car = advanceCar(car, { throttle: 1, steer: 0, brake: false }, 1 / 60);
  assert.equal(car.speed, 0);
  assert.equal(blocked(car.x, car.z), false);
  assert.ok(nearestPathPoint(bridgePath, car.x, car.z).distance <= 2.6);
});

test("the BMW can follow the curved bridge from the original road onto the new island", () => {
  let car = { ...spawnCar(), x: 44.5, z: -29, yaw: -Math.PI / 2 };
  let arrived = false;
  for (let step = 0; step < 1800; step++) {
    const nearest = nearestPathPoint(bridgePath, car.x, car.z);
    if (nearest.progress > 0.995) {
      arrived = true;
      break;
    }
    const ahead = bridgePoint(Math.min(1, nearest.progress + 0.065));
    const desired = Math.atan2(-(ahead.x - car.x), -(ahead.z - car.z));
    const error = Math.atan2(
      Math.sin(desired - car.yaw),
      Math.cos(desired - car.yaw),
    );
    car = advanceCar(
      car,
      {
        throttle: 1,
        steer: Math.max(-1, Math.min(1, -error * 1.7)),
        brake: false,
      },
      1 / 60,
    );
    assert.equal(blocked(car.x, car.z), false);
  }
  assert.ok(arrived);
  assert.ok(car.distance > 50);
});

test("rail loop and train timetable remain continuous and stop at every platform", () => {
  for (let i = 0; i < 1000; i++) {
    const a = railPose((i / 1000) * railLength),
      b = railPose(((i + 1) / 1000) * railLength);
    assert.ok(Math.hypot(a.x - b.x, a.z - b.z) < 0.24);
    assert.equal(a.y, railHeight);
  }
  assert.deepEqual(railPose(0), railPose(railLength));
  const visits = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    const time = (i / 1000) * railPeriod;
    const schedule = trainSchedule(time),
      next = trainSchedule(time + 0.001);
    const a = railPose(schedule.distance),
      b = railPose(next.distance);
    assert.ok(Math.hypot(a.x - b.x, a.z - b.z) < 0.009);
    if (schedule.station) {
      visits.add(schedule.station);
      assert.equal(schedule.distance, next.distance);
    }
    const second = trainSchedule(time, railPeriod / 2);
    const separation = Math.abs(schedule.distance - second.distance);
    assert.ok(Math.min(separation, railLength - separation) > 24);
  }
  assert.deepEqual([...visits].sort(), railStations.map((s) => s.id).sort());
});

test("ships stay outside the new island foundation", () => {
  for (const vessel of fleet) {
    const period = (Math.PI * 2) / vessel.speed;
    for (let i = 0; i <= 1000; i++) {
      const pose = vesselPose(vessel, (i / 1000) * period);
      assert.ok(
        ((pose.x - innovationIsland.x) / 43) ** 2 +
          ((pose.z - innovationIsland.z) / 40) ** 2 >
          1,
      );
    }
  }
});
