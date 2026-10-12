import { useEffect, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import * as T from "three";
import type { Vec3 } from "../types";
import { useCartoonMotion } from "./CartoonMotion";

function Tower({
  at,
  size,
  color,
  roof,
  night,
}: {
  at: Vec3;
  size: Vec3;
  color: string;
  roof: string;
  night: boolean;
}) {
  const windows = useRef<T.InstancedMesh>(null);
  const [w, h, d] = size;
  const rows = Math.max(2, Math.floor(h / 2.4));
  const columns = Math.max(2, Math.floor(w / 2.2));
  const sideColumns = Math.max(2, Math.floor(d / 2.2));
  const count = rows * (columns + sideColumns) * 2;
  useEffect(() => {
    const o = new T.Object3D();
    let index = 0;
    for (let side = 0; side < 4; side++) {
      const across = side < 2 ? w : d,
        cols = side < 2 ? columns : sideColumns;
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols; col++) {
          const offset = -across / 2 + ((col + 0.5) * across) / cols;
          const y = -h / 2 + 1.3 + (row * (h - 1.6)) / rows;
          o.position.set(
            side < 2 ? offset : (side === 2 ? 1 : -1) * (w / 2 + 0.025),
            y,
            side < 2 ? (side ? -1 : 1) * (d / 2 + 0.025) : offset,
          );
          o.rotation.set(
            0,
            side === 0
              ? 0
              : side === 1
                ? Math.PI
                : side === 2
                  ? Math.PI / 2
                  : -Math.PI / 2,
            0,
          );
          o.scale.set((across / cols) * 0.52, 1.25, 1);
          o.updateMatrix();
          windows.current!.setMatrixAt(index++, o.matrix);
        }
    }
    windows.current!.instanceMatrix.needsUpdate = true;
    windows.current!.computeBoundingSphere();
  }, [w, h, d, rows, columns, sideColumns]);
  return (
    <group position={at}>
      <RoundedBox
        args={size}
        radius={0.35}
        smoothness={2}
        bevelSegments={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.9} />
      </RoundedBox>
      <instancedMesh ref={windows} args={[undefined, undefined, count]}>
        <planeGeometry />
        <meshStandardMaterial
          color={night ? "#ffe6a4" : "#d6f2e6"}
          roughness={0.65}
          emissive={night ? "#ffc972" : "#000000"}
          emissiveIntensity={night ? 0.6 : 0}
        />
      </instancedMesh>
      <RoundedBox
        position={[0, h / 2 + 0.1, 0]}
        args={[w + 0.9, 0.65, d + 0.9]}
        radius={0.25}
        smoothness={2}
        bevelSegments={2}
        castShadow
      >
        <meshStandardMaterial color={roof} roughness={0.9} />
      </RoundedBox>
      <RoundedBox
        position={[w * 0.2, h / 2 + 0.95, -d * 0.15]}
        args={[w * 0.4, 1.1, d * 0.4]}
        radius={0.2}
        smoothness={2}
        bevelSegments={2}
        castShadow
      >
        <meshStandardMaterial color={color} roughness={1} />
      </RoundedBox>
      {[0, 1].map((i) => (
        <mesh
          key={i}
          position={[-w * 0.3, h / 2 + 0.75 + i * 0.7, d * 0.25]}
          castShadow
        >
          <cylinderGeometry args={[0.5, 0.5, 0.55, 12]} />
          <meshStandardMaterial color={roof} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function WindSpinner() {
  const rotor = useRef<T.Group>(null);
  useCartoonMotion((t) => {
    if (rotor.current) rotor.current.rotation.z = -t * 0.8;
  });
  return (
    <group position={[7, 29, -20]}>
      <mesh position={[0, -1.4, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 3, 8]} />
        <meshStandardMaterial color="#f8eed4" />
      </mesh>
      <group ref={rotor}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <RoundedBox
              position={[0, 1, 0]}
              args={[0.35, 2.3, 0.14]}
              radius={0.07}
              smoothness={2}
              bevelSegments={2}
              castShadow
            >
              <meshStandardMaterial color="#f2c56f" />
            </RoundedBox>
          </group>
        ))}
        <mesh position={[0, 0, 0.1]}>
          <sphereGeometry args={[0.3, 12, 8]} />
          <meshStandardMaterial color="#e98d72" />
        </mesh>
      </group>
    </group>
  );
}

/** The skyline grows from the existing, collision-tested gallery footprints. */
export default function CartoonCity({ night }: { night: boolean }) {
  return (
    <>
      <Tower
        at={[-26, 11.2, -10]}
        size={[7.5, 11.2, 11]}
        color="#e89b7c"
        roof="#d87d67"
        night={night}
      />
      <Tower
        at={[-20, 10.1, 3]}
        size={[6.7, 9, 8]}
        color="#eec06d"
        roof="#dcaa5e"
        night={night}
      />
      <Tower
        at={[-6, 16.4, -20]}
        size={[10, 19, 8]}
        color="#67b8b0"
        roof="#599e9e"
        night={night}
      />
      <Tower
        at={[7, 12.4, -20]}
        size={[11, 11, 8]}
        color="#b0a2cb"
        roof="#9488b4"
        night={night}
      />
      <Tower
        at={[22, 12.3, -10]}
        size={[10, 13.5, 11]}
        color="#7aafd0"
        roof="#6c96b2"
        night={night}
      />
      <Tower
        at={[25, 9.7, 2]}
        size={[7, 8.3, 7]}
        color="#e7a184"
        roof="#cc8a73"
        night={night}
      />
      <WindSpinner />
      {[-34, -12, 13, 35].map((x) => (
        <group key={x} position={[x, 0, 24.5]}>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 5, 10]} />
            <meshStandardMaterial color="#5a8b83" />
          </mesh>
          <RoundedBox
            position={[0.6, 5, 0]}
            args={[1.4, 0.2, 0.25]}
            radius={0.08}
            smoothness={2}
            bevelSegments={2}
          >
            <meshStandardMaterial color="#5a8b83" />
          </RoundedBox>
          <mesh position={[1.1, 4.8, 0]}>
            <sphereGeometry args={[0.3, 12, 8]} />
            <meshStandardMaterial
              color="#ffdfa0"
              emissive="#ffd087"
              emissiveIntensity={night ? 1 : 0}
            />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          position={[-2.4 + i * 0.8, 0.03, 30.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.4, 6]} />
          <meshStandardMaterial color="#fff3d9" />
        </mesh>
      ))}
    </>
  );
}
