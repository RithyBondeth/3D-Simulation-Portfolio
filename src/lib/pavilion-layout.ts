/** Shared metre-scale plan for the architecture and optional coastal drive. */
export const DRIVE_LIMIT = 51;
export const ROAD_CENTRE_Z = -4;
export const pavilionFootprints = [
  { x: -23, z: -5, w: 14, d: 30, h: 5.2 },
  { x: 0, z: -20, w: 32, d: 10, h: 6.4 },
  { x: 23, z: -6, w: 14, d: 28, h: 5.2 },
];
export const gardenObstacles = [
  { x: 0, z: 2, w: 8, d: 16 },
  { x: -19, z: 18, w: 16, d: 5 },
  { x: 20, z: 18, w: 15, d: 5 },
];
export function roundedDistance(
  x: number,
  z: number,
  halfX: number,
  halfZ: number,
  r: number,
) {
  const qx = Math.abs(x) - halfX + r;
  const qz = Math.abs(z - ROAD_CENTRE_Z) - halfZ + r;
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) +
    Math.min(Math.max(qx, qz), 0) -
    r
  );
}
export function onPavilionRoad(x: number, z: number) {
  return (
    roundedDistance(x, z, 48, 38, 12) <= 0 &&
    roundedDistance(x, z, 41, 31, 5) >= 0
  );
}
export function shoreline(x: number) {
  return 52 + Math.sin(x / 18) * 2.2 + Math.cos(x / 9) * 0.5;
}
export function pavilionBlocked(x: number, z: number) {
  const radius = 1.2;
  return (
    Math.abs(x) > DRIVE_LIMIT - radius ||
    z < -45 + radius ||
    z > shoreline(x) - 3.5 ||
    [...pavilionFootprints, ...gardenObstacles].some(
      (b) =>
        Math.abs(x - b.x) < b.w / 2 + radius &&
        Math.abs(z - b.z) < b.d / 2 + radius,
    )
  );
}
