/** A denser outer neighbourhood leaves the original driving circuit intact. */
export const districtBuildings = [
  { x: -33, z: -46, w: 7, d: 6, h: 10, color: "#e29a73" },
  { x: -20, z: -46, w: 8, d: 6, h: 16, color: "#4fae9d" },
  { x: -7, z: -46, w: 8, d: 6, h: 24, color: "#579fca" },
  { x: 7, z: -46, w: 8, d: 6, h: 14, color: "#edbc65" },
  { x: 20, z: -46, w: 8, d: 6, h: 20, color: "#7c9bd0" },
  { x: 33, z: -46, w: 7, d: 6, h: 11, color: "#a4c77b" },
  { x: -52, z: -18, w: 6, d: 8, h: 11, color: "#df8469" },
  { x: -52, z: -3, w: 6, d: 8, h: 15, color: "#65bda5" },
  { x: -52, z: 12, w: 6, d: 8, h: 8, color: "#efc278" },
  { x: 52, z: -18, w: 6, d: 8, h: 13, color: "#55b4be" },
  { x: 52, z: -3, w: 6, d: 8, h: 17, color: "#b794c0" },
  { x: 52, z: 12, w: 6, d: 8, h: 9, color: "#e6a66a" },
];

export const districtObstacles = [
  { x: -29, z: 43.4, w: 8, d: 4.2 },
  { x: 29, z: 43.4, w: 8, d: 4.2 },
  { x: 34, z: 18, w: 5, d: 3 },
  { x: 29, z: 24, w: 6.8, d: 2.6 },
  { x: -35, z: 0, w: 1, d: 6 },
];

export const pedestrianLoops = [
  { minX: -39, maxX: 39, minZ: 39, maxZ: 40.4 },
  { minX: -13, maxX: 13, minZ: 22.4, maxZ: 25 },
  { minX: -34, maxX: -32, minZ: -28, maxZ: 20 },
  { minX: 32, maxX: 34, minZ: -28, maxZ: 14 },
];

/** A closed, protected waterfront lane with rounded ends. */
export const cycleLoopLength = 156 + Math.PI * 1.3;
export function cyclistPose(distance: number) {
  let travel =
    ((distance % cycleLoopLength) + cycleLoopLength) % cycleLoopLength;
  if (travel < 78) return { x: -39 + travel, z: 35.8, yaw: Math.PI / 2 };
  travel -= 78;
  if (travel < Math.PI * 0.65) {
    const angle = travel / 0.65;
    return {
      x: 39 + Math.sin(angle) * 0.65,
      z: 36.45 - Math.cos(angle) * 0.65,
      yaw: Math.PI / 2 - angle,
    };
  }
  travel -= Math.PI * 0.65;
  if (travel < 78) return { x: 39 - travel, z: 37.1, yaw: -Math.PI / 2 };
  const angle = (travel - 78) / 0.65;
  return {
    x: -39 - Math.sin(angle) * 0.65,
    z: 36.45 + Math.cos(angle) * 0.65,
    yaw: -Math.PI / 2 - angle,
  };
}

export function pedestrianPose(loopIndex: number, progress: number) {
  const { minX, maxX, minZ, maxZ } = pedestrianLoops[loopIndex];
  const w = maxX - minX,
    d = maxZ - minZ;
  let travel = (((progress % 1) + 1) % 1) * (2 * (w + d));
  if (travel < w) return { x: minX + travel, z: minZ, yaw: Math.PI / 2 };
  travel -= w;
  if (travel < d) return { x: maxX, z: minZ + travel, yaw: 0 };
  travel -= d;
  if (travel < w) return { x: maxX - travel, z: maxZ, yaw: -Math.PI / 2 };
  return { x: minX, z: maxZ - (travel - w), yaw: Math.PI };
}
