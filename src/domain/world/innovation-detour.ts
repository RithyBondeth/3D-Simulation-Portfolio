import { bridgePoint, innovationIsland } from "./infrastructure.ts";

type Point = { x: number; z: number };
type Sample = Point & { yaw: number; distance: number };
const samples: Sample[] = [];

function append(point: Point, dx: number, dz: number) {
  const last = samples.at(-1);
  const distance =
    (last?.distance ?? 0) +
    (last ? Math.hypot(point.x - last.x, point.z - last.z) : 0);
  if (last && distance === last.distance) return;
  samples.push({ ...point, yaw: Math.atan2(-dx, -dz), distance });
}

function cubic(a: Point, b: Point, c: Point, d: Point) {
  for (let i = 0; i <= 100; i++) {
    const t = i / 100,
      u = 1 - t;
    append(
      {
        x:
          u ** 3 * a.x +
          3 * u * u * t * b.x +
          3 * u * t * t * c.x +
          t ** 3 * d.x,
        z:
          u ** 3 * a.z +
          3 * u * u * t * b.z +
          3 * u * t * t * c.z +
          t ** 3 * d.z,
      },
      3 * u * u * (b.x - a.x) +
        6 * u * t * (c.x - b.x) +
        3 * t * t * (d.x - c.x),
      3 * u * u * (b.z - a.z) +
        6 * u * t * (c.z - b.z) +
        3 * t * t * (d.z - c.z),
    );
  }
}

const bridgeStart = bridgePoint(0.12),
  bridgeEnd = bridgePoint(0.95);
function bridgeTangent(t: number) {
  const a = bridgePoint(t - 0.0001),
    b = bridgePoint(t + 0.0001);
  const length = Math.hypot(b.x - a.x, b.z - a.z);
  return { x: (b.x - a.x) / length, z: (b.z - a.z) / length };
}
function offset(p: Point, tangent: Point, distance: number) {
  return { x: p.x + tangent.x * distance, z: p.z + tangent.z * distance };
}
const startTangent = bridgeTangent(0.12),
  endTangent = bridgeTangent(0.95);
function annex(angle: number) {
  return {
    x: innovationIsland.x + 18 * Math.cos(angle),
    z: innovationIsland.z + 16 * Math.sin(angle),
  };
}
function annexTangent(angle: number) {
  const x = 18 * Math.sin(angle),
    z = -16 * Math.cos(angle),
    length = Math.hypot(x, z);
  return { x: x / length, z: z / length };
}
const entryAngle = Math.PI - 0.25,
  exitAngle = -Math.PI + 0.25;
const entry = annex(entryAngle),
  exit = annex(exitAngle);

// Rounded junction turns stay inside the east avenue and the arrival apron.
cubic(
  { x: 44.5, z: -25 },
  { x: 44.5, z: -29 },
  offset(bridgeStart, startTangent, -3),
  bridgeStart,
);
for (let i = 1; i <= 200; i++) {
  const t = 0.12 + (0.83 * i) / 200,
    tangent = bridgeTangent(t);
  append(bridgePoint(t), tangent.x, tangent.z);
}
cubic(
  bridgeEnd,
  offset(bridgeEnd, endTangent, 2),
  offset(entry, annexTangent(entryAngle), -2),
  entry,
);
for (let i = 1; i <= 400; i++) {
  const angle = entryAngle + ((exitAngle - entryAngle) * i) / 400,
    tangent = annexTangent(angle);
  append(annex(angle), tangent.x, tangent.z);
}
cubic(
  exit,
  offset(exit, annexTangent(exitAngle), 2),
  offset(bridgeEnd, endTangent, 2),
  bridgeEnd,
);
for (let i = 1; i <= 200; i++) {
  const t = 0.95 - (0.83 * i) / 200,
    tangent = bridgeTangent(t);
  append(bridgePoint(t), -tangent.x, -tangent.z);
}
cubic(
  bridgeStart,
  offset(bridgeStart, startTangent, -3),
  { x: 44.5, z: -26 },
  { x: 44.5, z: -30 },
);

export const detourLength = samples.at(-1)!.distance;
export function detourPose(distance: number) {
  const d = Math.max(0, Math.min(detourLength, distance));
  let low = 0,
    high = samples.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (samples[mid].distance < d) low = mid;
    else high = mid;
  }
  const a = samples[low],
    b = samples[high],
    t = (d - a.distance) / (b.distance - a.distance);
  const turn = Math.atan2(Math.sin(b.yaw - a.yaw), Math.cos(b.yaw - a.yaw));
  return {
    x: a.x + (b.x - a.x) * t,
    z: a.z + (b.z - a.z) * t,
    yaw: a.yaw + turn * t,
  };
}
