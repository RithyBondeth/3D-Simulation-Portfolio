import { useRef } from "react";
import * as T from "three";
import { useCartoonMotion } from "./CartoonMotion";
import type { Vec3 } from "../types";

function Cloud({
  at,
  scale = 1,
  phase = 0,
}: {
  at: Vec3;
  scale?: number;
  phase?: number;
}) {
  const group = useRef<T.Group>(null);
  useCartoonMotion((t) => {
    group.current!.position.x = at[0] + Math.sin(t * 0.07 + phase) * 4;
    group.current!.position.y = at[1] + Math.sin(t * 0.13 + phase) * 0.5;
  });
  return (
    <group ref={group} position={at} scale={scale}>
      {[
        [0, 0, 0, 4],
        [-4, -0.6, 0, 2.8],
        [4, -0.8, 0, 3],
        [0.8, 1.6, -0.5, 3],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1.4, 0.65, 1]}>
          <sphereGeometry args={[r, 12, 8]} />
          <meshStandardMaterial color="#fff9e9" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Sailboat() {
  const boat = useRef<T.Group>(null);
  useCartoonMotion((t) => {
    boat.current!.position.y = 0.5 + Math.sin(t * 0.9) * 0.15;
    boat.current!.rotation.z = Math.sin(t * 0.7) * 0.05;
  });
  return (
    <group ref={boat} position={[-24, 0.5, 49]} rotation={[0, -0.45, 0]}>
      <mesh scale={[2.5, 0.45, 1]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#e9ad7c" />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 4, 8]} />
        <meshStandardMaterial color="#9b8a6d" />
      </mesh>
      <mesh
        position={[0.85, 2.2, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={[1.3, 1, 0.02]}
      >
        <coneGeometry args={[1.2, 2.8, 3]} />
        <meshStandardMaterial color="#fff1d5" side={T.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Small handmade details share the scene's visibility-aware animation clock. */
export default function IslandAtmosphere() {
  const birds = useRef<T.Group>(null);
  const water = useRef<T.Group>(null);
  useCartoonMotion((t) => {
    birds.current!.position.x = Math.sin(t * 0.06) * 28;
    birds.current!.position.z = Math.cos(t * 0.06) * 22;
    birds.current!.rotation.y = t * 0.06;
    water.current!.position.x = Math.sin(t * 0.3) * 0.5;
  });
  return (
    <>
      <Cloud at={[-73, 20, -29]} scale={1.4} />
      <Cloud at={[60, 31, -63]} scale={1.1} phase={2} />
      <Cloud at={[-27, -14, 76]} scale={1.2} phase={4} />
      <Cloud at={[76, -6, 19]} scale={0.8} phase={1} />
      <group ref={birds} position={[0, 36, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <group
            key={i}
            position={[i * 3.5 - 7, Math.abs(i - 2) * 0.5, Math.abs(i - 2) * 2]}
          >
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[side * 0.6, 0, 0]}
                rotation={[0, 0, side * 0.25]}
              >
                <boxGeometry args={[1.3, 0.08, 0.35]} />
                <meshStandardMaterial color="#f9f4df" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      <group ref={water}>
        {Array.from({ length: 16 }, (_, i) => (
          <mesh
            key={i}
            position={[-44 + i * 5.5, 0.025, 49 + (i % 3) * 1.8]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[2.2 + (i % 3), 0.12]} />
            <meshBasicMaterial color="#c6f2df" transparent opacity={0.55} />
          </mesh>
        ))}
      </group>
      <Sailboat />
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: 18 }, (_, i) => (
            <group
              key={i}
              position={[
                side * (7.5 + (i % 3) * 1.5),
                0.65,
                -9 + Math.floor(i / 3) * 4,
              ]}
            >
              <mesh position={[0, 0.18, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.4, 5]} />
                <meshStandardMaterial color="#618969" />
              </mesh>
              <mesh position={[0, 0.42, 0]}>
                <icosahedronGeometry args={[0.22, 0]} />
                <meshStandardMaterial color={i % 3 ? "#f4d58f" : "#ea9b86"} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </>
  );
}
