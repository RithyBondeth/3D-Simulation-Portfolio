import {
  MAIN_ISLAND_DRIVE_LIMIT,
  shoreline,
  landmarkFootprints,
} from "../src/domain/world/island-layout.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advanceCar,
  blocked,
  onRoad,
  spawnCar,
  type CarState,
  type DriveInput,
} from "../src/domain/world/driving.ts";

const coast: DriveInput = { throttle: 0, steer: 0, brake: false };
function simulate(car: CarState, input: DriveInput, seconds: number) {
  let state = car;
  for (let i = 0; i < Math.round(seconds * 60); i++)
    state = advanceCar(state, input, 1 / 60);
  return state;
}
test("a parked car remains parked without input", () => {
  assert.deepEqual(advanceCar(spawnCar(), coast, 0.05), spawnCar());
});
test("acceleration moves forward and records actual distance", () => {
  const start = spawnCar(),
    next = simulate(start, { ...coast, throttle: 1 }, 1);
  assert.ok(next.x > start.x + 3);
  assert.ok(next.speed > 8 && next.speed < 9);
  assert.ok(next.distance > 3);
  assert.ok(Math.abs(next.z - start.z) < 1e-8);
});
test("braking stops the car without switching into reverse", () => {
  const next = simulate(
    { ...spawnCar(), speed: 15 },
    { ...coast, brake: true },
    1,
  );
  assert.equal(next.speed, 0);
  assert.ok(next.distance < 6);
});
test("reverse input first brakes, then reverses", () => {
  const start = { ...spawnCar(), speed: 8 };
  const braking = simulate(start, { ...coast, throttle: -1 }, 0.3);
  assert.ok(braking.speed > 0 && braking.speed < 8);
  const reverse = simulate(braking, { ...coast, throttle: -1 }, 1);
  assert.ok(reverse.speed < 0 && reverse.speed >= -6);
});
test("steering follows direction of travel and cannot rotate a parked car", () => {
  const still = advanceCar(spawnCar(), { ...coast, steer: 1 }, 0.1);
  assert.equal(still.yaw, spawnCar().yaw);
  const forward = advanceCar(
    { ...spawnCar(), speed: 8 },
    { ...coast, steer: 1 },
    0.1,
  );
  const reverse = advanceCar(
    { ...spawnCar(), speed: -4 },
    { ...coast, steer: 1 },
    0.1,
  );
  assert.ok(forward.yaw < still.yaw);
  assert.ok(reverse.yaw > still.yaw);
});
test("building collisions stop at the wall even after a long frame", () => {
  const start = { ...spawnCar(), x: -23, z: 11.6, yaw: 0, speed: 18 };
  const next = advanceCar(start, { ...coast, throttle: 1 }, 10);
  assert.equal(next.speed, 0);
  assert.ok(next.z >= 11.2);
  assert.equal(blocked(next.x, next.z), false);
});
test("the retreat boundary stops cars before the scenery edge", () => {
  const next = simulate(
    { ...spawnCar(), x: 49.5, z: 30.5, yaw: -Math.PI / 2, speed: 7 },
    { ...coast, throttle: 1 },
    2,
  );
  assert.ok(next.x <= MAIN_ISLAND_DRIVE_LIMIT - 1.2);
  assert.equal(blocked(next.x, next.z), false);
});
test("off-road driving has a lower speed limit than asphalt", () => {
  assert.equal(onRoad(-12, 30.5), true);
  assert.equal(onRoad(5, 18), false);
  const next = advanceCar(
    { ...spawnCar(), x: 5, z: 18, speed: 18 },
    coast,
    0.05,
  );
  assert.ok(next.speed <= 7);
});
test("coasting stops and a suspended frame cannot teleport the vehicle", () => {
  const next = simulate({ ...spawnCar(), speed: 4 }, coast, 2);
  assert.equal(next.speed, 0);
  const stalled = advanceCar(
    { ...spawnCar(), speed: 18 },
    { ...coast, throttle: 1 },
    30,
  );
  assert.ok(stalled.distance <= 1.80001);
});

test("the coastal loop is continuous through straight roads and every bend", () => {
  const check = (x: number, z: number) => {
    assert.ok(onRoad(x, z), `road at ${x}, ${z}`);
    assert.equal(blocked(x, z), false, `clear road at ${x}, ${z}`);
  };
  for (let p = -36; p <= 36; p++) {
    check(p, 30.5);
    check(p, -38.5);
  }
  for (let p = -30; p <= 22; p++) {
    check(-44.5, p);
    check(44.5, p);
  }
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      for (let i = 0; i <= 30; i++) {
        const a = ((i / 30) * Math.PI) / 2;
        check(
          sx * (36 + Math.cos(a) * 8.5),
          -4 + sz * (26 + Math.sin(a) * 8.5),
        );
      }
});
test("all island buildings and the reflecting pool block the car", () => {
  for (const b of landmarkFootprints) assert.equal(blocked(b.x, b.z), true);
  assert.equal(blocked(0, 2), true, "courtyard reflecting pool");
  assert.equal(
    blocked(spawnCar().x, spawnCar().z),
    false,
    "parking position is clear",
  );
});

test("the waterfront is reachable and sand slows the car before the sea", () => {
  assert.equal(blocked(0, 44), false);
  assert.equal(onRoad(0, 44), false);
  const sand = advanceCar(
    { ...spawnCar(), x: 0, z: 44, speed: 18, yaw: Math.PI },
    coast,
    0.05,
  );
  assert.ok(sand.speed <= 7);
  const edge = simulate(
    { ...spawnCar(), x: 0, z: shoreline(0) - 4, speed: 7, yaw: Math.PI },
    { ...coast, throttle: 1 },
    2,
  );
  assert.equal(edge.speed, 0);
  assert.ok(edge.z <= shoreline(0) - 3.5);
  assert.equal(blocked(edge.x, edge.z), false);
});
