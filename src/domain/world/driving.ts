import { isWorldBlocked, isWorldRoad } from "./island-layout.ts";

export interface CarState {
  x: number;
  z: number;
  yaw: number;
  speed: number;
  distance: number;
}
export interface DriveInput {
  throttle: number;
  steer: number;
  brake: boolean;
}
export interface RoadTelemetry extends CarState {
  offroad: boolean;
}
export const spawnCar = (): CarState => ({
  x: -12,
  z: 30.5,
  yaw: -Math.PI / 2,
  speed: 0,
  distance: 0,
});
export const onRoad = isWorldRoad;
export const blocked = isWorldBlocked;
export function advanceCar(
  car: CarState,
  input: DriveInput,
  seconds: number,
): CarState {
  // Substeps keep curb/building collision and braking stable on slow devices.
  const dt = Math.min(Math.max(seconds, 0), 0.1);
  const steps = Math.max(1, Math.ceil(dt / (1 / 60)));
  let next = { ...car };
  for (let i = 0; i < steps; i++) {
    const t = dt / steps,
      road = onRoad(next.x, next.z);
    const throttle = Math.max(-1, Math.min(1, input.throttle));
    const steer = Math.max(-1, Math.min(1, input.steer));
    let speed = next.speed;
    const opposing =
      throttle &&
      Math.sign(throttle) !== Math.sign(speed) &&
      Math.abs(speed) > 0.2;
    if (input.brake || !throttle || opposing) {
      const deceleration = input.brake ? 23 : opposing ? 16 : road ? 3.4 : 6;
      speed =
        Math.sign(speed) * Math.max(0, Math.abs(speed) - deceleration * t);
    } else speed += throttle * 8.5 * t;
    const limit = road ? 18 : 7;
    speed = Math.max(-6, Math.min(limit, speed));
    const yaw = next.yaw - ((steer * speed) / 2.8) * 0.5 * t;
    const x = next.x - Math.sin(yaw) * speed * t;
    const z = next.z - Math.cos(yaw) * speed * t;
    if (blocked(x, z)) return { ...next, speed: 0 };
    else
      next = {
        x,
        z,
        yaw,
        speed,
        distance: next.distance + Math.abs(speed) * t,
      };
  }
  return next;
}
