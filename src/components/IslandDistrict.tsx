import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as T from "three";
import { districtBuildings } from "../lib/island-district";
import { useCartoonMotion } from "./CartoonMotion";
import IslandPeople from "./IslandPeople";
import type { Vec3 } from "../types";

export type Piece = { at: Vec3; size: Vec3; color: string; rotation?: Vec3 };
const stone = "#dfd5be",
  dark = "#3b5d62",
  timber = "#bb9877",
  green = "#78a68b";

/** Hundreds of windows, roof panels and street details share two draw calls. */
export function Instances({
  pieces,
  glass = false,
  night,
}: {
  pieces: Piece[];
  glass?: boolean;
  night: boolean;
}) {
  const mesh = useRef<T.InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const obj = new T.Object3D();
    const color = new T.Color();
    pieces.forEach((piece, index) => {
      obj.position.set(...piece.at);
      obj.scale.set(...piece.size);
      obj.rotation.set(...(piece.rotation ?? [0, 0, 0]));
      obj.updateMatrix();
      mesh.current!.setMatrixAt(index, obj.matrix);
      mesh.current!.setColorAt(
        index,
        color.set(glass && night ? "#f4d7a0" : piece.color),
      );
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
    if (mesh.current!.instanceColor)
      mesh.current!.instanceColor.needsUpdate = true;
    mesh.current!.computeBoundingSphere();
    invalidate();
  }, [pieces, glass, night, invalidate]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, pieces.length]}
      castShadow={!glass}
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial
        roughness={glass ? 0.3 : 0.78}
        metalness={glass ? 0.28 : 0.08}
        emissive={glass && night ? "#dfae64" : "#000000"}
        emissiveIntensity={glass && night ? 0.28 : 0}
      />
    </instancedMesh>
  );
}

function createDistrict() {
  const solid: Piece[] = [],
    glass: Piece[] = [];
  const box = (at: Vec3, size: Vec3, color: string, rotation?: Vec3) =>
    solid.push({ at, size, color, rotation });
  const pane = (at: Vec3, size: Vec3, color = "#2f5661", rotation?: Vec3) =>
    glass.push({ at, size, color, rotation });
  districtBuildings.forEach((b, i) => {
    const { x, z, w, d, h, color } = b;
    box([x, 0.2, z], [w + 0.6, 0.4, d + 0.6], "#bfcbb5");
    box([x, h / 2 + 0.4, z], [w, h, d], color);
    // Set-back penthouses and alternating floor plates make a varied skyline.
    box([x, h + 1.4, z], [w * 0.7, 2, d * 0.7], stone);
    box([x, h + 2.5, z], [w * 0.76, 0.22, d * 0.76], green);
    for (let floor = 0; floor < Math.floor(h / 2.5); floor++) {
      const y = 1.7 + floor * 2.5;
      for (let side = 0; side < 4; side++) {
        const front = side < 2,
          width = front ? w : d;
        for (let col = 0; col < 3; col++) {
          const across = -width / 2 + (width * (col + 0.5)) / 3;
          pane(
            [
              x + (front ? across : (side === 2 ? 1 : -1) * (w / 2 + 0.025)),
              y,
              z + (front ? (side === 0 ? 1 : -1) * (d / 2 + 0.025) : across),
            ],
            front
              ? [width / 3 - 0.35, 1.25, 0.06]
              : [0.06, 1.25, width / 3 - 0.35],
          );
        }
      }
      if (floor % 2 === 0)
        box([x, y + 1, z], [w + 0.25, 0.15, d + 0.25], stone);
    }
    box([x, h + 0.5, z], [w + 0.45, 0.3, d + 0.45], stone);
    // Solar roof, service core, green terraces.
    for (let panel = 0; panel < 3; panel++) {
      box(
        [x - w * 0.28 + panel * w * 0.28, h + 2.9, z],
        [w * 0.22, 0.13, d * 0.36],
        "#304c6b",
        [-0.2, 0, 0],
      );
      box(
        [x - w * 0.28 + panel * w * 0.28, h + 3, z],
        [0.04, 0.025, d * 0.35],
        "#8ebbc5",
        [-0.2, 0, 0],
      );
    }
    if (i % 2 === 0) {
      box([x + w * 0.3, h + 0.85, z + d * 0.25], [w * 0.28, 0.65, 1], timber);
      box([x + w * 0.3, h + 1.3, z + d * 0.25], [w * 0.25, 0.5, 0.9], green);
    }
    // Canopied ground-floor entrance.
    const side = x > 45 ? -1 : x < -45 ? 1 : 0;
    if (side) {
      box([x + side * (w / 2 + 0.5), 3.1, z], [1.1, 0.2, 3.6], stone);
      pane([x + side * (w / 2 + 0.04), 1.5, z], [0.08, 2.4, 1.5], "#365863");
    } else {
      box([x, 3.1, z + d / 2 + 0.4], [3.8, 0.2, 1.2], stone);
      pane([x, 1.5, z + d / 2 + 0.04], [1.6, 2.4, 0.08], "#365863");
    }
  });
  // Connected pedestrian surfaces and a protected waterfront cycle track.
  [-1, 1].forEach((side) => {
    box([side * 33, 0.17, -4], [4, 0.12, 54], "#d9dccc");
    box([side * 49, 0.1, -5], [1.1, 0.12, 55], "#c6cfba");
  });
  box([0, 0.12, -32], [72, 0.16, 3.8], "#d9dccc");
  box([0, 0.16, 24], [77, 0.12, 3.8], "#e8e2cd");
  box([0, 0.16, 36.45], [80, 0.12, 2.5], "#7da99e");
  box([0, 0.19, 38], [83, 0.14, 0.22], stone);
  for (let x = -38; x <= 38; x += 4)
    box([x, 0.24, 36.45], [1.6, 0.02, 0.08], "#e7efdc");
  // Railings along the beach and north overlook.
  for (const z of [46.2, -43]) {
    for (let x = -40; x <= 40; x += 4)
      if (z < 0 || x !== -4) box([x, 0.7, z], [0.08, 1.4, 0.08], dark);
    const spans =
      z < 0
        ? [[0, 80]]
        : [
            [-23.5, 33],
            [18.5, 43],
          ];
    spans.forEach(([x, width]) => {
      box([x, 1.35, z], [width, 0.08, 0.08], dark);
      box([x, 0.65, z], [width, 0.055, 0.055], dark);
    });
  }
  // A gently arched timber footbridge crosses the waterfront canal.
  for (let step = 0; step < 22; step++) {
    const p = (step + 0.5) / 22,
      z = 45 + p * 12;
    const y = 0.3 + Math.sin(p * Math.PI) * 1.15;
    const tilt = -Math.atan((Math.cos(p * Math.PI) * Math.PI * 1.15) / 12);
    box([-5, y, z], [3.2, 0.16, 0.54], step % 2 ? "#c4a983" : "#d0b892", [
      tilt,
      0,
      0,
    ]);
    [-1, 1].forEach((side) => {
      box([-5 + side * 1.65, y + 1.1, z], [0.07, 0.08, 0.57], timber, [
        tilt,
        0,
        0,
      ]);
      pane([-5 + side * 1.65, y + 0.3, z], [0.045, 0.045, 0.57], "#e9cd9c", [
        tilt,
        0,
        0,
      ]);
      if (step % 3 === 0)
        box([-5 + side * 1.65, y + 0.55, z], [0.08, 1.1, 0.08], dark);
    });
  }
  // Harbour landing and a small timber viewing deck.
  box([-5, 0.29, 57], [7, 0.25, 2.1], "#c9b28d");
  [-8, -2].forEach((x) => {
    box([x, 0.8, 57.7], [0.15, 1.2, 0.15], dark);
    pane([x, 1.45, 57.7], [0.35, 0.18, 0.35], "#edd5a7");
  });
  // Waterfront cafés: timber pergolas, striped awnings and open counters.
  [-29, 29].forEach((x, i) => {
    box([x, 0.2, 43.4], [9, 0.3, 5.2], "#d7cbb0");
    box([x, 1.05, 44.5], [7.7, 1.7, 1.8], i ? "#95bbae" : "#d8ac86");
    box([x, 2, 44.5], [8.1, 0.18, 2.1], stone);
    for (const side of [-1, 1])
      box([x + side * 3.7, 2.1, 43.4], [0.16, 3.8, 0.16], timber);
    for (let slat = 0; slat < 9; slat++)
      box(
        [x - 4 + slat, 4, 43.4],
        [0.6, 0.13, 4.6],
        slat % 2 ? stone : i ? "#7fa393" : "#d29973",
      );
    for (let cup = 0; cup < 3; cup++)
      box([x - 2 + cup * 2, 2.2, 43.7], [0.3, 0.35, 0.3], "#f6efe0");
  });
  // Benches, planter beds, recycling bins and bollards.
  [-19, -12, 12, 19].forEach((x) => {
    box([x, 0.8, 43], [3.2, 0.18, 0.9], timber);
    box([x, 1.25, 43.45], [3.2, 0.7, 0.12], timber);
    [-1, 1].forEach((side) =>
      box([x + side, 0.45, 43], [0.15, 0.75, 0.65], dark),
    );
  });
  [-42, -19, 0, 19, 42].forEach((x) => {
    box([x, 0.45, 41.8], [2.5, 0.9, 1.2], "#c5bca2");
    box([x, 1, 41.8], [2.3, 0.5, 1.05], green);
  });
  [-40, -7, 7, 40].forEach((x) => {
    box([x, 0.75, 43.8], [0.75, 1.5, 0.7], dark);
    box([x, 1.5, 43.8], [0.55, 0.08, 0.55], "#93c8a6");
  });
  for (let x = -37; x <= 37; x += 8)
    box([x, 0.55, 34.9], [0.16, 1.1, 0.16], dark);
  // Tram-stop shelter and route information, away from the driving lane.
  box([34, 0.3, 18], [6, 0.3, 4], "#b4c5b8");
  box([34, 3.7, 18], [6.2, 0.2, 4], stone);
  [31.5, 36.5].forEach((x) => box([x, 2, 18], [0.12, 3.5, 0.12], dark));
  pane([34, 2, 16.5], [5.2, 2.8, 0.08], "#8aaeb0");
  box([34, 0.9, 17], [4, 0.2, 0.75], timber);
  box([36.7, 2.1, 19.3], [0.9, 2.5, 0.15], dark);
  pane([36.7, 2.4, 19.4], [0.7, 1.4, 0.06], "#96d6b9");
  // Parked electric shuttle: windows, lights and a roof battery.
  box([29, 1.2, 24], [6.8, 2, 2.6], "#b1d5b9");
  box([29, 2.3, 24], [5.7, 0.4, 2.3], stone);
  box([29, 2.65, 24], [2.6, 0.3, 1.6], "#647d7d");
  [-1, 1].forEach((side) => {
    pane([29, 1.6, 24 + side * 1.32], [5.6, 1, 0.04], "#31556a");
    [-2.1, 2.1].forEach((offset) =>
      box([29 + offset, 0.5, 24 + side * 1.25], [0.8, 0.8, 0.24], "#32494b"),
    );
  });
  pane([32.42, 1.5, 24], [0.05, 1.2, 2.3], "#31556a");
  box([32.45, 0.8, 24], [0.06, 0.15, 1.9], "#fff0b7");
  // EV bays, charging posts and shaded bike parking.
  box([-36, 0.24, 0], [4, 0.1, 9], "#91b9a3");
  [-2.5, 0, 2.5].forEach((z) => {
    box([-35, 1.3, z], [0.65, 2.1, 0.7], stone);
    pane([-34.65, 1.7, z], [0.04, 0.65, 0.5], "#76bea4");
    box([-36.5, 0.31, z - 1.15], [2.5, 0.025, 0.07], stone);
    box([-35.4, 1.1, z + 0.4], [0.12, 0.7, 0.12], dark);
  });
  for (let i = 0; i < 4; i++) {
    box([-35 + i, 0.65, 17], [0.08, 1.1, 1.1], dark);
    box([-35 + i, 1.2, 17], [0.08, 0.08, 1.1], dark);
  }
  // Street-light network with solar caps and warm lamps.
  const lamps: Vec3[] = [
    [-36, 0, -29],
    [36, 0, -29],
    [-32, 0, 24],
    [18, 0, 24],
    [-44, 0, 42.8],
    [44, 0, 42.8],
    [-14, 0, 42.8],
    [14, 0, 42.8],
  ];
  lamps.forEach(([x, , z]) => {
    box([x, 2.6, z], [0.12, 5.2, 0.12], dark);
    box([x + 0.65, 5.2, z], [1.4, 0.15, 0.45], stone);
    pane([x + 1, 5.1, z], [0.6, 0.08, 0.35], "#f2d2a2");
    box([x, 5.45, z], [1.2, 0.1, 0.8], "#375771", [0, 0, 0.15]);
  });
  return { solid, glass };
}

function WindTurbine({ at, phase }: { at: Vec3; phase: number }) {
  const rotor = useRef<T.Group>(null);
  useCartoonMotion((t) => {
    rotor.current!.rotation.z = t * 0.7 + phase;
  });
  return (
    <group position={at}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.22, 6, 8]} />
        <meshStandardMaterial color="#f2ecd9" />
      </mesh>
      <group ref={rotor} position={[0, 6, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[
              Math.sin((i * Math.PI * 2) / 3) * 1.15,
              Math.cos((i * Math.PI * 2) / 3) * 1.15,
              0,
            ]}
            rotation={[0, 0, (-i * Math.PI * 2) / 3]}
          >
            <boxGeometry args={[0.27, 2.4, 0.13]} />
            <meshStandardMaterial color="#f3e6c8" />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.3, 10, 8]} />
          <meshStandardMaterial color="#d6a174" />
        </mesh>
      </group>
    </group>
  );
}

export default function IslandDistrict({ night }: { night: boolean }) {
  const pieces = useMemo(createDistrict, []);
  return (
    <>
      <Instances pieces={pieces.solid} night={night} />
      <Instances pieces={pieces.glass} glass night={night} />
      <WindTurbine at={[-33, 13, -46]} phase={0} />
      <WindTurbine at={[33, 14, -46]} phase={2} />
      <IslandPeople />
    </>
  );
}
