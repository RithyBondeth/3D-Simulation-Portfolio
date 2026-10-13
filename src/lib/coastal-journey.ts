/** Portrait phones favour the island itself over fitting every distant satellite. */
export function journeyFrame(width: number, height: number) {
  if (width <= 0 || height <= 0) return 1.28;
  return Math.max(1, (height / width) * (width <= 760 ? 0.84 : 1.12)) * 1.28;
}

export const journeyFov = 42;
export const journeyStops = [0, 0.32, 0.65, 1] as const;
export const journeyNames = [
  "Welcome",
  "The work",
  "The playground",
  "Say hello",
] as const;
export function journeyChapter(progress: number) {
  return progress < 0.17 ? 0 : progress < 0.49 ? 1 : progress < 0.83 ? 2 : 3;
}

const radius = 8.5;
const arc = (Math.PI * radius) / 2;
export const journeyLength = 248 + 4 * arc;

/** A metre-based circuit on the road's centreline. Tangents stay continuous at turns. */
export function journeyCarPose(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  let remaining = p * journeyLength;
  const legs = [56, arc, 52, arc, 72, arc, 52, arc, 16];
  let leg = 0;
  while (leg < legs.length - 1 && remaining > legs[leg]) {
    remaining -= legs[leg++];
  }
  let x = 0,
    z = 0,
    dx = 0,
    dz = 0;
  if (leg % 2 === 1) {
    const corner = (leg - 1) / 2;
    const a = Math.PI / 2 - (corner * Math.PI) / 2 - remaining / radius;
    const cx = corner < 2 ? 36 : -36;
    const cz = corner === 0 || corner === 3 ? 22 : -30;
    x = cx + radius * Math.cos(a);
    z = cz + radius * Math.sin(a);
    dx = Math.sin(a);
    dz = -Math.cos(a);
  } else if (leg === 0 || leg === 8) {
    x = (leg === 0 ? -20 : -36) + remaining;
    z = 30.5;
    dx = 1;
  } else if (leg === 2) {
    x = 44.5;
    z = 22 - remaining;
    dz = -1;
  } else if (leg === 4) {
    x = 36 - remaining;
    z = -38.5;
    dx = -1;
  } else {
    x = -44.5;
    z = -30 + remaining;
    dz = 1;
  }
  return { x, z, yaw: Math.atan2(-dx, -dz), distance: p * journeyLength };
}

/** Orbit from outside the bend so the car remains on the visible side of the island. */
export function journeyShot(progress: number) {
  const car = journeyCarPose(progress);
  const angle = Math.atan2(car.x, (car.z + 4) * 1.3) + 0.22;
  return {
    camera: [Math.sin(angle) * 124, 88, Math.cos(angle) * 124 - 4],
    target: [car.x * 0.12, 3, car.z * 0.12 - 2],
  };
}
