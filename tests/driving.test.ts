import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advanceCar,
  blocked,
  onRoad,
  spawnCar,
  type CarState,
  type DriveInput,
} from "../src/lib/driving.ts";
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
  const start = { ...spawnCar(), x: -20, z: -21.5, yaw: Math.PI, speed: 18 };
  const next = advanceCar(start, { ...coast, throttle: 1 }, 10);
  assert.equal(next.speed, 0);
  assert.ok(next.z <= -21.15);
  assert.equal(blocked(next.x, next.z), false);
});
test("the sea boundary stops cars at the island edge", () => {
  const next = simulate(
    { ...spawnCar(), x: 57, z: 0, yaw: -Math.PI / 2, speed: 7 },
    { ...coast, throttle: 1 },
    2,
  );
  assert.ok(next.x <= 58.85);
  assert.equal(blocked(next.x, next.z), false);
});
test("off-road driving has a lower speed limit than asphalt", () => {
  assert.equal(onRoad(-22, -31), true);
  assert.equal(onRoad(-6, -38), false);
  const next = advanceCar(
    { ...spawnCar(), x: -6, z: -38, speed: 18 },
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
