import { useMemo, useRef } from "react";
import * as T from "three";
import { useCartoonMotion } from "./CartoonMotion";
import { Instances, type Piece } from "./IslandDistrict";
import type { Vec3 } from "../types";

const cream = "#eee7cf",
  timber = "#bc9470",
  green = "#7fa98a",
  teal = "#426b69";

function GardenIsland({ at, radius }: { at: Vec3; radius: number }) {
  return (
    <group position={at}>
      <mesh position={[0, -2.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.7, 5, 9]} />
        <meshStandardMaterial color="#c5b69a" roughness={0.9} />
      </mesh>
      <mesh position={[0, -7, 0]} rotation={[0, 0.25, Math.PI]}>
        <coneGeometry args={[radius * 0.7, 6, 7]} />
        <meshStandardMaterial color="#8da28a" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.35, 9]} />
        <meshStandardMaterial color="#a7bd96" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 2.4, radius - 1.1, 48]} />
        <meshStandardMaterial color="#e5d8ba" roughness={0.9} />
      </mesh>
    </group>
  );
}

function scenicDetails() {
  const solid: Piece[] = [],
    glass: Piece[] = [];
  const box = (at: Vec3, size: Vec3, color: string, rotation?: Vec3) =>
    solid.push({ at, size, color, rotation });
  // Elevated pedestrian links sit entirely beyond the car's bounded circuit.
  for (const [start, end, z] of [
    [56, 61, 19],
    [-56, -66, 29],
  ]) {
    for (let i = 0; i < 18; i++) {
      const progress = (i + 0.5) / 18;
      const x = start + (end - start) * progress;
      const y = 0.6 + Math.sin(progress * Math.PI) * 1.5;
      const tilt = Math.atan(
        (1.5 * Math.PI * Math.cos(progress * Math.PI)) / (end - start),
      );
      box(
        [x, y, z],
        [Math.abs(end - start) / 18 + 0.02, 0.22, 3.4],
        i % 2 ? "#ccb18a" : "#dfc8a2",
        [0, 0, tilt],
      );
      for (const side of [-1, 1]) {
        box(
          [x, y + 1.2, z + side * 1.7],
          [Math.abs(end - start) / 18 + 0.02, 0.09, 0.09],
          timber,
          [0, 0, tilt],
        );
        if (i % 3 === 0) {
          box([x, y + 0.6, z + side * 1.7], [0.1, 1.2, 0.1], teal);
          glass.push({
            at: [x, y + 1.3, z + side * 1.7],
            size: [0.23, 0.17, 0.23],
            color: "#f0d9a0",
          });
        }
      }
    }
  }
  for (const [cx, cz] of [
    [68, 19],
    [-75, 29],
  ]) {
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x = cx + Math.cos(angle) * 9,
        z = cz + Math.sin(angle) * 9;
      box([x, 0.4, z], [1.8, 0.7, 1.5], "#c6b794", [0, angle, 0]);
      box([x, 1, z], [1.7, 0.8, 1.4], i % 2 ? green : "#91b99b", [0, angle, 0]);
      if (i % 2) {
        box([x, 2.4, z], [0.1, 3.5, 0.1], teal);
        glass.push({
          at: [x, 4.2, z],
          size: [0.45, 0.35, 0.45],
          color: "#eed2a0",
        });
      }
    }
    for (const side of [-1, 1]) {
      box([cx + side * 5, 0.8, cz + 5], [3, 0.2, 1], timber);
      box([cx + side * 5, 1.3, cz + 5.45], [3, 0.8, 0.1], timber);
      box([cx + side * 5, 0.45, cz + 5], [2.5, 0.65, 0.1], teal);
    }
  }
  // A tiny open-air bookshop and striped canopy beside the observation wheel.
  box([-75, 1.3, 36], [5, 2.4, 2.4], "#cbab89");
  box([-75, 1.45, 37.23], [4.4, 1.7, 0.08], teal);
  for (let i = 0; i < 8; i++)
    box(
      [-77.4 + i * 0.68, 3, 36.7],
      [0.68, 0.16, 3.4],
      i % 2 ? cream : "#b7795c",
      [-0.1, 0, 0],
    );
  for (let i = 0; i < 10; i++)
    box(
      [-76.8 + i * 0.4, 1.4 + (i % 2) * 0.35, 37.3],
      [0.22, 0.55, 0.12],
      ["#e4bc83", "#a1bfad", "#d6a590"][i % 3],
    );
  return { solid, glass };
}

function Lighthouse({ night }: { night: boolean }) {
  const beacon = useRef<T.Group>(null);
  useCartoonMotion((time) => {
    beacon.current!.rotation.y = time * 0.35;
  });
  return (
    <group position={[68, 0.2, 18]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.4, 5, 0.8, 12]} />
        <meshStandardMaterial color={cream} roughness={0.8} />
      </mesh>
      <mesh position={[0, 7.4, 0]} castShadow>
        <cylinderGeometry args={[2, 3.2, 13.5, 16]} />
        <meshStandardMaterial color="#eadbc1" roughness={0.75} />
      </mesh>
      {[3.5, 7.5, 11.5].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <cylinderGeometry
            args={[3.2 - y * 0.088, 3.32 - y * 0.088, 1.35, 16]}
          />
          <meshStandardMaterial color="#b8785f" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 14.5, 0]} castShadow>
        <cylinderGeometry args={[3.1, 3.1, 0.45, 16]} />
        <meshStandardMaterial color={teal} />
      </mesh>
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 2.6, 12]} />
        <meshStandardMaterial
          color="#b6d5c3"
          transparent
          opacity={0.42}
          roughness={0.2}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i * Math.PI) / 3) * 2,
            16,
            Math.cos((i * Math.PI) / 3) * 2,
          ]}
        >
          <cylinderGeometry args={[0.09, 0.09, 2.8, 6]} />
          <meshStandardMaterial color={teal} />
        </mesh>
      ))}
      <mesh position={[0, 16, 0]}>
        <sphereGeometry args={[0.8, 12, 8]} />
        <meshStandardMaterial
          color="#ffe6ad"
          emissive="#ffe0a0"
          emissiveIntensity={night ? 2 : 0.5}
        />
      </mesh>
      <mesh position={[0, 18, 0]} castShadow>
        <coneGeometry args={[3.1, 2.2, 12]} />
        <meshStandardMaterial color={teal} />
      </mesh>
      <mesh position={[0, 19.4, 0]}>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshStandardMaterial color="#c39563" metalness={0.4} />
      </mesh>
      <group ref={beacon} position={[0, 16, 0]} visible={night}>
        <mesh position={[10, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[3, 20, 16, 1, true]} />
          <meshBasicMaterial
            color="#ffe8ac"
            transparent
            opacity={0.045}
            depthWrite={false}
            side={T.DoubleSide}
          />
        </mesh>
      </group>
      <mesh position={[0, 2.1, 3.03]}>
        <boxGeometry args={[1.2, 2.5, 0.12]} />
        <meshStandardMaterial color={teal} />
      </mesh>
      {[5, 10].map((y) => (
        <mesh key={y} position={[0, y, 3.25 - y * 0.088]}>
          <boxGeometry args={[0.65, 1.05, 0.1]} />
          <meshStandardMaterial
            color="#4e7774"
            emissive={night ? "#e4b977" : "#000000"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function ObservationWheel({ night }: { night: boolean }) {
  const wheel = useRef<T.Group>(null),
    cabins = useRef<(T.Group | null)[]>([]);
  useCartoonMotion((time) => {
    const angle = time * 0.08;
    wheel.current!.rotation.z = angle;
    cabins.current.forEach((cabin) => {
      if (cabin) cabin.rotation.z = -angle;
    });
  });
  return (
    <group position={[-75, 0.3, 27]} rotation={[0, -0.25, 0]}>
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[10, 0.4, 6]} />
        <meshStandardMaterial color="#e4d8bb" />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[0, 0, side * 1.5]}>
          {[-1, 1].map((leg) => (
            <mesh
              key={leg}
              position={[leg * 2.1, 5.2, 0]}
              rotation={[0, 0, leg * 0.39]}
              castShadow
            >
              <boxGeometry args={[0.45, 11.3, 0.45]} />
              <meshStandardMaterial color={teal} />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[0, 10.3, 0]} ref={wheel}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0, 0, side * 0.6]}>
            <torusGeometry args={[7.1, 0.15, 6, 64]} />
            <meshStandardMaterial
              color={cream}
              emissive={night ? "#d2b883" : "#000000"}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
            <boxGeometry args={[0.12, 14, 0.12]} />
            <meshStandardMaterial color="#bb9776" />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 2.4, 12]} />
          <meshStandardMaterial color="#ca8a66" />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * Math.PI) / 4;
          return (
            <group
              key={i}
              position={[Math.sin(angle) * 7.1, Math.cos(angle) * 7.1, 0]}
              ref={(node) => {
                cabins.current[i] = node;
              }}
            >
              <mesh position={[0, -0.9, 0]} castShadow>
                <boxGeometry args={[1.6, 1.25, 1.6]} />
                <meshStandardMaterial color={i % 2 ? "#c78d70" : "#8db8a7"} />
              </mesh>
              <mesh position={[0, -0.12, 0]}>
                <boxGeometry args={[1.85, 0.2, 1.85]} />
                <meshStandardMaterial color={cream} />
              </mesh>
              <mesh position={[0, -0.65, 0.81]}>
                <boxGeometry args={[1.2, 0.55, 0.05]} />
                <meshStandardMaterial
                  color="#3d6969"
                  emissive={night ? "#e9c78d" : "#000000"}
                  emissiveIntensity={0.5}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function ExplorerBalloon() {
  const balloon = useRef<T.Group>(null);
  useCartoonMotion((time) => {
    balloon.current!.position.y = 34 + Math.sin(time * 0.35) * 1.1;
    balloon.current!.position.x = -48 + Math.sin(time * 0.06) * 5;
    balloon.current!.rotation.z = Math.sin(time * 0.25) * 0.04;
  });
  return (
    <group ref={balloon} position={[-48, 34, 20]}>
      <mesh scale={[1, 1.22, 1]} castShadow>
        <sphereGeometry args={[3.4, 16, 12]} />
        <meshStandardMaterial color="#c68a6b" roughness={0.85} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={i}
          rotation={[0, (i * Math.PI) / 2, 0]}
          scale={[1.005, 1.225, 1.005]}
        >
          <sphereGeometry args={[3.4, 16, 12, 0, Math.PI / 5]} />
          <meshStandardMaterial
            color="#efdbb5"
            side={T.DoubleSide}
            roughness={0.9}
          />
        </mesh>
      ))}
      <mesh position={[0, -4.8, 0]} castShadow>
        <boxGeometry args={[1.5, 1.1, 1.3]} />
        <meshStandardMaterial color={timber} />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}:${z}`} position={[x * 0.6, -3.8, z * 0.5]}>
            <cylinderGeometry args={[0.035, 0.035, 2, 5]} />
            <meshStandardMaterial color={teal} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** Scenic annexes add silhouette and depth without obstructing the driving route. */
export default function IslandLandmarks({ night }: { night: boolean }) {
  const pieces = useMemo(scenicDetails, []);
  return (
    <>
      <GardenIsland at={[68, 0, 19]} radius={10} />
      <GardenIsland at={[-75, 0, 29]} radius={12} />
      <Instances pieces={pieces.solid} night={night} />
      <Instances pieces={pieces.glass} glass night={night} />
      <Lighthouse night={night} />
      <ObservationWheel night={night} />
      <ExplorerBalloon />
    </>
  );
}
