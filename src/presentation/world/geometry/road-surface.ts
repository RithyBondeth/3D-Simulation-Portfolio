import * as T from "three";

/** Shared centreline data defines asphalt, bridge decks, paths and painted lines. */
export function roadRibbon(
  path: readonly { x: number; z: number; y: number }[],
  width: number,
  offset = 0,
  lift = 0.035,
) {
  const positions: number[] = [],
    indices: number[] = [];
  path.forEach((point, i) => {
    const before = path[Math.max(0, i - 1)],
      after = path[Math.min(path.length - 1, i + 1)];
    const dx = after.x - before.x,
      dz = after.z - before.z,
      length = Math.hypot(dx, dz) || 1;
    for (const side of [-1, 1]) {
      const distance = offset + (side * width) / 2;
      positions.push(
        point.x - (dz / length) * distance,
        point.y + lift,
        point.z + (dx / length) * distance,
      );
    }
    if (i < path.length - 1) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
