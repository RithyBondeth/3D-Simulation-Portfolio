export type Point2 = { x: number; z: number };
export type Footprint = Point2 & { w: number; d: number };

export const innovationIsland = { x: 112, z: -8, rx: 27, rz: 24 };
export const bridgeRoadWidth = 7.6;
export const bridgeDeckWidth = 13.6;

/** Curved, gently rising connection from the east avenue to the annex loop. */
export function bridgePoint(progress: number) {
  const t = Math.max(0, Math.min(1, progress)),
    u = 1 - t;
  return {
    x:
      u * u * u * 44.5 +
      3 * u * u * t * 65 +
      3 * u * t * t * 79 +
      t * t * t * 94,
    z:
      u * u * u * -29 +
      3 * u * u * t * -29 +
      3 * u * t * t * -17 +
      t * t * t * -8,
    y: Math.sin(t * Math.PI) * 2.2,
  };
}
export const bridgePath = Array.from({ length: 81 }, (_, i) =>
  bridgePoint(i / 80),
);
export const annexRoad = Array.from({ length: 129 }, (_, i) => {
  const angle = Math.PI + (i / 128) * Math.PI * 2;
  return {
    x: innovationIsland.x + Math.cos(angle) * 18,
    z: innovationIsland.z + Math.sin(angle) * 16,
    y: 0,
  };
});
export const accessRoads = [
  [
    { x: 19, z: -38.5, y: 0 },
    { x: 19, z: -29.5, y: 0 },
  ],
  [
    { x: 44.5, z: 22, y: 0 },
    { x: 38, z: 24, y: 0 },
  ],
] as const;
export const innovationBuildings: Footprint[] = [
  { x: 112, z: -8, w: 11, d: 11 },
  { x: 124, z: -10, w: 6, d: 7 },
];
export const innovationPlanters: Footprint[] = [
  { x: 101, z: -15, w: 3.5, d: 1.3 },
  { x: 112, z: 4, w: 3.5, d: 1.3 },
  { x: 108, z: -19, w: 3.5, d: 1.3 },
];

export function nearestPathPoint(
  path: readonly Point2[],
  x: number,
  z: number,
) {
  let nearest = { distance: Infinity, progress: 0, x: 0, z: 0, segment: 0 };
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i],
      b = path[i + 1];
    const dx = b.x - a.x,
      dz = b.z - a.z;
    const t = Math.max(
      0,
      Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)),
    );
    const px = a.x + dx * t,
      pz = a.z + dz * t;
    const distance = Math.hypot(x - px, z - pz);
    if (distance < nearest.distance)
      nearest = {
        distance,
        progress: (i + t) / (path.length - 1),
        x: px,
        z: pz,
        segment: i,
      };
  }
  return nearest;
}
export function onInfrastructureRoad(x: number, z: number) {
  if (Math.hypot(x - 94, z + 8) <= 5.2) return true;
  // Reject most of the mainland before sampling the longer annex paths.
  if (
    x >= 41 &&
    nearestPathPoint(bridgePath, x, z).distance <= bridgeRoadWidth / 2
  )
    return true;
  if (x >= 88 && nearestPathPoint(annexRoad, x, z).distance <= 3.2) return true;
  return accessRoads.some(
    (path) => nearestPathPoint(path, x, z).distance <= 2.4,
  );
}
export function onInfrastructureLand(x: number, z: number) {
  const island = innovationIsland;
  if (
    ((x - island.x) / (island.rx - 1.8)) ** 2 +
      ((z - island.z) / (island.rz - 1.8)) ** 2 <=
    1
  )
    return true;
  return (
    x >= 44 &&
    nearestPathPoint(bridgePath, x, z).distance <= bridgeRoadWidth / 2 - 1.2
  );
}
export function driveElevation(x: number, z: number) {
  if (x < 44 || x > 96 || z < -34 || z > -3) return 0;
  const nearest = nearestPathPoint(bridgePath, x, z);
  return nearest.distance <= bridgeDeckWidth / 2
    ? bridgePoint(nearest.progress).y
    : 0;
}
export function driveSurfacePitch(x: number, z: number, yaw: number) {
  const dx = -Math.sin(yaw) * 0.8,
    dz = -Math.cos(yaw) * 0.8;
  return Math.atan2(
    driveElevation(x + dx, z + dz) - driveElevation(x - dx, z - dz),
    1.6,
  );
}
export function footprintBlocks(
  b: Footprint,
  x: number,
  z: number,
  margin = 1.2,
) {
  return (
    Math.abs(x - b.x) < b.w / 2 + margin && Math.abs(z - b.z) < b.d / 2 + margin
  );
}
