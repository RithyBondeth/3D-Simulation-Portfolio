import { useMemo, useRef, useState } from "react";
import { Html, RoundedBox, useCursor } from "@react-three/drei";
import * as T from "three";
import { useCartoonMotion } from "./CartoonMotion";
import type { SectionId } from "../types";

function Cloud({
  position,
  scale,
  phase,
}: {
  position: [number, number, number];
  scale: number;
  phase: number;
}) {
  const cloud = useRef<T.Group>(null);
  useCartoonMotion((t) => {
    cloud.current!.position.x = position[0] + Math.sin(t * 0.09 + phase) * 3;
    cloud.current!.position.y = position[1] + Math.sin(t * 0.2 + phase) * 0.3;
  });
  return (
    <group ref={cloud} position={position} scale={scale}>
      {[
        [0, 0, 0, 2.6],
        [-2.3, -0.2, 0, 1.7],
        [2.4, -0.4, 0, 1.8],
        [0.6, 1, -0.5, 2],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1.2, 0.7, 0.85]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#fff8e8" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Balloon({ onSelect }: { onSelect: (id: SectionId) => void }) {
  const balloon = useRef<T.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const profile = useMemo(
    () => [
      new T.Vector2(0.35, -2.7),
      new T.Vector2(1.1, -2.2),
      new T.Vector2(2.2, -1.3),
      new T.Vector2(2.7, 0),
      new T.Vector2(2.4, 1.5),
      new T.Vector2(1.4, 2.5),
      new T.Vector2(0, 2.8),
    ],
    [],
  );
  useCartoonMotion((t) => {
    balloon.current!.position.y = 23 + Math.sin(t * 0.6) * 0.8;
    balloon.current!.rotation.z = Math.sin(t * 0.4) * 0.035;
    balloon.current!.rotation.y = Math.sin(t * 0.2) * 0.15;
    balloon.current!.scale.lerp(
      new T.Vector3().setScalar(hovered ? 1.06 : 1),
      0.08,
    );
  });
  return (
    <group
      ref={balloon}
      position={[-13, 23, 9]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("contact");
      }}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} castShadow>
          <latheGeometry args={[profile, 6, (i * Math.PI) / 4, Math.PI / 4]} />
          <meshStandardMaterial
            color={i % 2 ? "#fff0ce" : "#e68c70"}
            roughness={0.85}
            side={T.DoubleSide}
          />
        </mesh>
      ))}
      {[-0.6, 0.6].flatMap((x) =>
        [-0.6, 0.6].map((z) => (
          <mesh key={`${x}:${z}`} position={[x, -3.4, z]}>
            <cylinderGeometry args={[0.035, 0.035, 2.1, 6]} />
            <meshStandardMaterial color="#bd8c66" />
          </mesh>
        )),
      )}
      <RoundedBox
        position={[0, -4.4, 0]}
        args={[1.7, 1, 1.4]}
        radius={0.18}
        smoothness={2}
        bevelSegments={2}
        castShadow
      >
        <meshStandardMaterial color="#cba06f" roughness={1} />
      </RoundedBox>
      <Html position={[0, -5.7, 0]} center zIndexRange={[12, 1]}>
        <button
          className="pavilion-label balloon-label"
          onClick={(e) => {
            e.stopPropagation();
            onSelect("contact");
          }}
        >
          Say hello ↗
        </button>
      </Html>
    </group>
  );
}

export function PlaySculpture({
  onSelect,
}: {
  onSelect: (id: SectionId) => void;
}) {
  const rings = useRef<T.Group>(null),
    orbit = useRef<T.Group>(null);
  useCartoonMotion((t) => {
    rings.current!.rotation.y = t * 0.22;
    rings.current!.position.y = 3 + Math.sin(t * 0.8) * 0.2;
    orbit.current!.rotation.y = -t * 0.4;
  });
  return (
    <group
      position={[0, 0, 1]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("labs");
      }}
    >
      <group ref={rings} position={[0, 3, 0]} rotation={[0.15, 0, -0.2]}>
        {["#ed997b", "#edc36c", "#70b7a4"].map((color, i) => (
          <mesh
            key={color}
            rotation={[(i * Math.PI) / 3, (i * Math.PI) / 3, 0]}
            castShadow
          >
            <torusGeometry args={[2, 0.22, 8, 40]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.55, 16, 12]} />
          <meshStandardMaterial color="#fff2d7" roughness={0.75} />
        </mesh>
      </group>
      <group ref={orbit} position={[0, 3, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos(i * 2.09) * 2.8,
              Math.sin(i * 2.09) * 0.7,
              Math.sin(i * 2.09) * 2.8,
            ]}
            castShadow
          >
            <sphereGeometry args={[0.32, 12, 8]} />
            <meshStandardMaterial color={i === 1 ? "#f2c976" : "#e89b83"} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function CartoonDetails({
  onSelect,
}: {
  onSelect: (id: SectionId) => void;
}) {
  return (
    <>
      <Cloud position={[-35, 26, -23]} scale={1.2} phase={0} />
      <Cloud position={[19, 31, -35]} scale={1.6} phase={2} />
      <Cloud position={[42, 22, 1]} scale={0.95} phase={4} />
      <Balloon onSelect={onSelect} />
    </>
  );
}
