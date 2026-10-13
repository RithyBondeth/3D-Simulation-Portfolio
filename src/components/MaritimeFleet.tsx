import { useEffect, useMemo, useRef } from "react";
import * as T from "three";
import { Instances, type Piece } from "./IslandDistrict";
import { useCartoonMotion } from "./CartoonMotion";
import { fleet, vesselPose, type VesselKind } from "../lib/maritime";
import type { GraphicsQuality } from "../lib/graphics-quality";
import VesselWake from "./VesselWake";

const seaLevel = -19;
function hullGeometry(width: number, length: number, height: number) {
  const shape = new T.Shape();
  shape.moveTo(0, length / 2);
  shape.lineTo(width * 0.48, length * 0.25);
  shape.lineTo(width / 2, -length * 0.4);
  shape.quadraticCurveTo(0, -length * 0.54, -width / 2, -length * 0.4);
  shape.lineTo(-width * 0.48, length * 0.25);
  shape.closePath();
  return new T.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.18,
    bevelThickness: 0.12,
  });
}
function details(kind: VesselKind) {
  const solid: Piece[] = [],
    glass: Piece[] = [];
  const box = (at: Piece["at"], size: Piece["size"], color: string) =>
    solid.push({ at, size, color });
  const window = (at: Piece["at"], size: Piece["size"]) =>
    glass.push({ at, size, color: "#234a62" });
  const length = kind === "cargo" ? 24 : kind === "ferry" ? 14 : 10;
  const width = kind === "cargo" ? 6 : kind === "ferry" ? 4.8 : 3.2;
  box([0, 1.1, 0], [width * 0.87, 0.18, length * 0.78], "#dfc69c");
  if (kind === "cargo") {
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 2; col++) {
        box(
          [(col - 0.5) * 2.5, 2, -6 + row * 4.2],
          [2.3, 1.7, 3.8],
          ["#e67c56", "#3ca5b4", "#eac268"][(row + col) % 3],
        );
        for (let rib = 0; rib < 4; rib++)
          box(
            [(col - 0.5) * 2.5 - 1 + rib * 0.65, 2.9, -6 + row * 4.2],
            [0.055, 0.07, 3.7],
            "#edd9b4",
          );
      }
    box([0, 2.3, 8], [4.8, 2.4, 4.5], "#f3efdb");
    box([0, 4, 7.8], [5.2, 0.3, 4], "#f3efdb");
    window([0, 3.3, 5.72], [4, 0.65, 0.06]);
    box([1.5, 4.7, 9], [0.8, 1.3, 1], "#db7350");
  } else {
    box(
      [0, 1.8, kind === "ferry" ? 0 : 1],
      [width * 0.75, 1.3, length * 0.42],
      "#f4f0df",
    );
    window([0, 2, -length * 0.21 + 0.01], [width * 0.7, 0.75, 0.06]);
    for (const side of [-1, 1]) {
      window([side * width * 0.38, 2, 0.6], [0.06, 0.65, length * 0.35]);
      box(
        [side * width * 0.42, 1.4, -length * 0.15],
        [0.08, 0.5, length * 0.65],
        "#eae7d5",
      );
    }
    box([0, 2.6, 0.4], [width * 0.9, 0.18, length * 0.48], "#f4f0df");
    if (kind === "ferry")
      for (const x of [-1.2, 0, 1.2])
        box([x, 2.73, 0.4], [0.95, 0.1, 5.5], "#285c7d");
    else {
      box([0, 1.4, 3.3], [2.1, 0.4, 1.6], "#e6a278");
      box([0, 3.2, 1], [0.07, 1.1, 0.07], "#d9dfdc");
    }
  }
  for (const side of [-1, 1])
    glass.push({
      at: [side * width * 0.4, 1.5, -length * 0.3],
      size: [0.12, 0.12, 0.25],
      color: side < 0 ? "#d66158" : "#42c39b",
    });
  return { solid, glass, length, width };
}
function Vessel({
  vessel,
  night,
  quality,
}: {
  vessel: (typeof fleet)[number];
  night: boolean;
  quality: GraphicsQuality;
}) {
  const group = useRef<T.Group>(null);
  const model = useMemo(() => details(vessel.kind), [vessel.kind]);
  const hull = useMemo(
    () => hullGeometry(model.width, model.length, 0.9),
    [model],
  );
  useEffect(() => () => hull.dispose(), [hull]);
  const initial = vesselPose(vessel, 0);
  useCartoonMotion((t) => {
    const pose = vesselPose(vessel, t);
    group.current!.position.set(
      pose.x,
      seaLevel + 0.3 + Math.sin(t * 0.65 + vessel.phase) * 0.12,
      pose.z,
    );
    group.current!.rotation.set(
      Math.sin(t * 0.4 + vessel.phase) * 0.015,
      pose.yaw,
      Math.sin(t * 0.7 + vessel.phase) * 0.02,
    );
  });
  return (
    <>
      <VesselWake
        vessel={vessel}
        width={model.width}
        night={night}
        quality={quality}
      />
      <group
        ref={group}
        position={[initial.x, seaLevel + 0.3, initial.z]}
        rotation={[0, initial.yaw, 0]}
      >
        <mesh geometry={hull} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={vessel.kind === "cargo" ? "#28516b" : "#f2f0e1"}
            roughness={0.45}
            metalness={0.15}
          />
        </mesh>
        <Instances pieces={model.solid} night={night} />
        <Instances pieces={model.glass} glass night={night} />
      </group>
    </>
  );
}
export default function MaritimeFleet({
  night,
  quality,
}: {
  night: boolean;
  quality: GraphicsQuality;
}) {
  return (
    <>
      {fleet.slice(0, quality === "low" ? 3 : 7).map((vessel, i) => (
        <Vessel key={i} vessel={vessel} night={night} quality={quality} />
      ))}
    </>
  );
}
