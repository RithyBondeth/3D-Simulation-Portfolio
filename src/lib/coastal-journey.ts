import { portfolioSections } from "./portfolio-story.ts";
import { detourLength, detourPose } from "./journey-detour.ts";
/** Portrait phones favour the island itself over fitting every distant satellite. */
export function journeyFrame(width: number, height: number) {
  if (width <= 0 || height <= 0) return 1.28;
  return Math.max(1, (height / width) * (width <= 760 ? 0.84 : 1.12)) * 1.28;
}

export const journeyFov = 42;
export const journeyStops = portfolioSections.map((section) => section.stop);
export const journeyNames = portfolioSections.map((section) => section.name);
export function journeyChapter(progress: number) {
  const index = journeyStops.findIndex(
    (stop, i) =>
      i < journeyStops.length - 1 &&
      progress < (stop + journeyStops[i + 1]) / 2,
  );
  return index < 0 ? journeyStops.length - 1 : index;
}

const radius = 8.5;
const arc = (Math.PI * radius) / 2;
const mainlandLength = 248 + 4 * arc;
const detourStart = 56 + arc + 47;
const detourEnd = 56 + arc + 52;
export const journeyLength = mainlandLength + detourLength - (detourEnd - detourStart);

/** A metre-based circuit on the road's centreline. Tangents stay continuous at turns. */
function mainlandCarPose(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  let remaining = p * mainlandLength;
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
  return { x, z, yaw: Math.atan2(-dx, -dz) };
}

/** A continuous round trip across the bridge, around Innovation island and home. */
export function journeyCarPose(progress: number) {
  const distance = Math.max(0, Math.min(1, progress)) * journeyLength;
  const pose = distance < detourStart
    ? mainlandCarPose(distance / mainlandLength)
    : distance <= detourStart + detourLength
      ? detourPose(distance - detourStart)
      : mainlandCarPose((distance - detourLength + detourEnd - detourStart) / mainlandLength);
  return { ...pose, distance };
}

/** Chapter landmarks receive a short, smoothly eased camera emphasis. */
export const journeyLandmarks = [
  [-15, 16, 12],
  [23, 7, 5],
  [0, 15, -20],
  [0, 11, -17],
  [0, 9, 2],
  [32, 10, 39],
] as const;

/** Orbit outside the bend; chapter emphasis preserves the car in the foreground. */
export function journeyShot(progress: number) {
  const car = journeyCarPose(progress);
  const angle = Math.atan2(car.x, (car.z + 4) * 1.3) + 0.22;
  const p = Math.max(0, Math.min(1, progress));
  const target = [car.x * 0.12, 3, car.z * 0.12 - 2];
  let emphasis = 0;
  journeyStops.forEach((stop, i) => {
    // Keep the opening wide, then move closer as visitors reach each chapter.
    const distance = Math.min(1, Math.abs(p - stop) / 0.11);
    const weight =
      (1 - distance * distance * (3 - 2 * distance)) * (i === 0 ? 0.2 : 1);
    emphasis += weight;
    journeyLandmarks[i].forEach((value, axis) => {
      target[axis] +=
        (value - target[axis]) * weight * (axis === 1 ? 0.06 : 0.22);
    });
  });
  const distance = 132 * (1 - emphasis * 0.09);
  const opening = Math.min(1, p / 0.24);
  const expansion = 1 - opening * opening * (3 - 2 * opening);
  target[0] += expansion * 36;
  const annexFocus = Math.max(0, car.x - 44);
  target[0] += annexFocus;
  return {
    camera: [
      (Math.sin(angle) * distance + expansion * 14.4) * (1 + expansion * 0.4) + annexFocus,
      88 * (1 - emphasis * 0.06) * (1 + expansion * 0.4),
      (Math.cos(angle) * distance - 4) * (1 + expansion * 0.4),
    ],
    target,
  };
}
