import * as T from "three";
import type { BoxPiece } from "../rendering/InstancedBoxes";
import {
  bridgePath,
  bridgePoint,
  bridgeDeckWidth,
  annexRoad,
  innovationPlanters,
} from "../../../domain/world/infrastructure";

function beam(
  a: T.Vector3,
  b: T.Vector3,
  width: number,
  color: string,
): BoxPiece {
  const centre = a.clone().add(b).multiplyScalar(0.5);
  const rotation = new T.Euler().setFromQuaternion(
    new T.Quaternion().setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    ),
  );
  return {
    at: [centre.x, centre.y, centre.z],
    size: [width, a.distanceTo(b), width],
    rotation: [rotation.x, rotation.y, rotation.z],
    color,
  };
}

export function createBridgeDetails(): BoxPiece[] {
  const result: BoxPiece[] = [];
  bridgePath.forEach((p, i) => {
    if (i === bridgePath.length - 1) return;
    const next = bridgePath[i + 1],
      dx = next.x - p.x,
      dz = next.z - p.z,
      length = Math.hypot(dx, dz);
    const nx = -dz / length,
      nz = dx / length;
    result.push({
      at: [(p.x + next.x) / 2, (p.y + next.y) / 2 - 0.45, (p.z + next.z) / 2],
      size: [bridgeDeckWidth, 0.4, length + 0.08],
      rotation: [0, Math.atan2(dx, dz), 0],
      color: "#c9d1c1",
    });
    if (p.x > 50)
      for (const side of [-1, 1]) {
        result.push(
          beam(
            new T.Vector3(p.x + nx * side * 4, p.y + 0.18, p.z + nz * side * 4),
            new T.Vector3(
              next.x + nx * side * 4,
              next.y + 0.18,
              next.z + nz * side * 4,
            ),
            0.22,
            "#d5deca",
          ),
        );
        if (i % 4 === 0)
          result.push({
            at: [p.x + nx * side * 6.45, p.y + 0.7, p.z + nz * side * 6.45],
            size: [0.12, 1.4, 0.12],
            color: "#426b69",
          });
        result.push(
          beam(
            new T.Vector3(
              p.x + nx * side * 6.45,
              p.y + 1.3,
              p.z + nz * side * 6.45,
            ),
            new T.Vector3(
              next.x + nx * side * 6.45,
              next.y + 1.3,
              next.z + nz * side * 6.45,
            ),
            0.09,
            "#cbded0",
          ),
        );
      }
    if (i % 5 === 0)
      result.push(
        beam(
          new T.Vector3(p.x, p.y + 0.08, p.z),
          new T.Vector3(next.x + dx * 1.6, next.y + 0.08, next.z + dz * 1.6),
          0.09,
          "#e8ecd9",
        ),
      );
  });
  for (const t of [0.38, 0.7]) {
    const p = bridgePoint(t),
      next = bridgePoint(t + 0.01),
      yaw = Math.atan2(next.x - p.x, next.z - p.z);
    const nx = Math.cos(yaw),
      nz = -Math.sin(yaw);
    for (const side of [-1, 1]) {
      const x = p.x + nx * side * 6.2,
        z = p.z + nz * side * 6.2;
      result.push({
        at: [x, (p.y + 13.5 - 19) / 2, z],
        size: [0.75, p.y + 32.5, 0.75],
        color: "#e4e4d2",
      });
      result.push({
        at: [x, -18.8, z],
        size: [2.5, 0.6, 2.5],
        color: "#819b88",
      });
      for (const offset of [-0.2, -0.12, 0.12, 0.2]) {
        const anchor = bridgePoint(t + offset);
        result.push(
          beam(
            new T.Vector3(x, p.y + 13.2, z),
            new T.Vector3(
              anchor.x + nx * side * 5.9,
              anchor.y + 0.1,
              anchor.z + nz * side * 5.9,
            ),
            0.07,
            "#b6cbbd",
          ),
        );
      }
    }
    result.push(
      beam(
        new T.Vector3(p.x - nx * 6.2, p.y + 13.2, p.z - nz * 6.2),
        new T.Vector3(p.x + nx * 6.2, p.y + 13.2, p.z + nz * 6.2),
        0.4,
        "#dce3d3",
      ),
    );
  }
  for (let i = 0; i < annexRoad.length - 1; i += 7) {
    const p = annexRoad[i],
      b = annexRoad[i + 2];
    result.push(
      beam(
        new T.Vector3(p.x, 0.09, p.z),
        new T.Vector3(b.x, 0.09, b.z),
        0.08,
        "#e8ecd9",
      ),
    );
  }
  // Marked crossings sit at the access-road junctions, clear of the driving lane.
  for (const x of [16.8, 17.7, 18.6, 19.5, 20.4, 21.3])
    result.push({
      at: [x, 0.08, -36.4],
      size: [0.4, 0.025, 4.1],
      color: "#eef0dc",
    });
  for (const z of [20.5, 21.4, 22.3, 23.2])
    result.push({
      at: [42, 0.08, z],
      size: [4.2, 0.025, 0.4],
      color: "#eef0dc",
    });
  // Arrival plaza furniture stays inside the ring, away from the road.
  for (const { x, z } of innovationPlanters) {
    result.push({
      at: [x, 0.45, z],
      size: [3.5, 0.9, 1.3],
      color: "#b3bf9d",
    });
    result.push({ at: [x, 1.1, z], size: [3.1, 0.4, 1], color: "#75a67a" });
  }
  return result;
}
