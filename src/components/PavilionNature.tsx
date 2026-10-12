import { useEffect, useMemo, useRef } from "react";
import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Vec3 } from "../types";

const random = (n: number) => {
  const r = Math.sin(n * 127.1 + 311.7) * 43758.5;
  return r - Math.floor(r);
};
const treePositions: Vec3[] = [
  [-11, 0, 3],
  [12, 0, -6],
  [-35, 0, 13],
  [-36, 0, -13],
  [35, 0, 14],
  [35, 0, -17],
  [-28, 0, -30],
  [27, 0, -30],
  [-15, 0, 18],
  [24, 0, 19],
];

export function GardenTrees() {
  const trunks = useRef<T.InstancedMesh>(null),
    crowns = useRef<T.InstancedMesh>(null);
  useEffect(() => {
    const o = new T.Object3D(),
      color = new T.Color();
    const colors = ["#64b58b", "#83c795", "#4eaa8b", "#a4ce8e"];
    treePositions.forEach(([x, , z], i) => {
      const h = i === 0 ? 5.2 : 3.5 + random(i) * 1.3;
      o.position.set(x, h / 2, z);
      o.scale.set(0.32, h, 0.32);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      trunks.current!.setMatrixAt(i, o.matrix);
      for (let j = 0; j < 4; j++) {
        const angle = j * 2.4;
        o.position.set(
          x + Math.cos(angle) * (j ? 1.3 : 0),
          h + 0.3 + (j === 0 ? 1.4 : 0),
          z + Math.sin(angle) * (j ? 1.2 : 0),
        );
        const radius = j === 0 ? 2.3 : 1.8;
        o.scale.set(radius, radius * (j === 0 ? 1.15 : 0.9), radius);
        o.updateMatrix();
        crowns.current!.setMatrixAt(i * 4 + j, o.matrix);
        crowns.current!.setColorAt(
          i * 4 + j,
          color.set(colors[(i + j) % colors.length]),
        );
      }
    });
    trunks.current!.instanceMatrix.needsUpdate =
      crowns.current!.instanceMatrix.needsUpdate = true;
    crowns.current!.instanceColor!.needsUpdate = true;
    trunks.current!.computeBoundingSphere();
    crowns.current!.computeBoundingSphere();
  }, []);
  return (
    <>
      <instancedMesh
        ref={trunks}
        args={[undefined, undefined, treePositions.length]}
        castShadow
      >
        <cylinderGeometry args={[0.65, 1, 1, 8]} />
        <meshStandardMaterial color="#bf946d" roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={crowns}
        args={[undefined, undefined, treePositions.length * 4]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
    </>
  );
}

export function CoastalPalms() {
  const geometry = useMemo(() => {
    const fronds: T.BufferGeometry[] = [];
    for (let f = 0; f < 8; f++) {
      const points: number[] = [],
        indices: number[] = [];
      for (let j = 0; j <= 12; j++) {
        const t = j / 12,
          width = Math.sin(t * Math.PI) * 0.65 + 0.015;
        const y = Math.sin(t * Math.PI) * 0.8 - t * t * 1.6;
        points.push(-width, y, t * 4.8, width, y, t * 4.8);
        if (j < 12) {
          const n = j * 2;
          indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
        }
      }
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(points, 3));
      g.setIndex(indices);
      g.computeVertexNormals();
      g.rotateY((f * Math.PI) / 4);
      fronds.push(g);
    }
    const merged = mergeGeometries(fronds);
    fronds.forEach((g) => g.dispose());
    return merged;
  }, []);
  const trunk = useMemo(
    () =>
      new T.TubeGeometry(
        new T.QuadraticBezierCurve3(
          new T.Vector3(),
          new T.Vector3(-0.7, 4, 0),
          new T.Vector3(0.4, 8.5, 0),
        ),
        16,
        0.34,
        9,
        false,
      ),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      trunk.dispose();
    },
    [geometry, trunk],
  );
  return (
    <>
      {[-44, -30, 44, 56].map((x, i) => (
        <group
          key={x}
          position={[x, 0, 39]}
          rotation={[0, i * 1.2, 0]}
          scale={0.85 + (i % 3) * 0.12}
        >
          <mesh geometry={trunk} castShadow>
            <meshStandardMaterial color="#c69d76" roughness={1} />
          </mesh>
          <mesh geometry={geometry} position={[0.4, 8.5, 0]} castShadow>
            <meshStandardMaterial
              color="#55b493"
              side={T.DoubleSide}
              roughness={0.85}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function Grasses() {
  const grass = useRef<T.InstancedMesh>(null);
  const blades = useMemo(() => {
    const g = new T.BufferGeometry();
    g.setAttribute(
      "position",
      new T.Float32BufferAttribute(
        [
          -0.15, 0, 0, 0.06, 0.7, 0.04, 0.13, 0, 0, 0, 0, -0.15, 0.04, 0.9,
          0.02, 0, 0, 0.15, -0.1, 0, -0.1, 0.12, 0.6, 0.12, 0.1, 0, 0.1,
        ],
        3,
      ),
    );
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => blades.dispose(), [blades]);
  useEffect(() => {
    const o = new T.Object3D(),
      c = new T.Color();
    for (let i = 0; i < 650; i++) {
      const bed = i % 3;
      o.position.set(
        bed === 0
          ? -27 + random(i) * 16
          : bed === 1
            ? 12 + random(i) * 15
            : -47 + random(i) * 94,
        bed < 2 ? 0.58 : 0.24,
        bed < 2 ? 16 + random(i + 77) * 4 : 36.5 + random(i + 19),
      );
      o.scale.setScalar(0.6 + random(i + 32) * 0.6);
      o.rotation.set(0, i * 2.4, 0);
      o.updateMatrix();
      grass.current!.setMatrixAt(i, o.matrix);
      grass.current!.setColorAt(
        i,
        c.setHSL(0.31, 0.35, 0.52 + random(i) * 0.15),
      );
    }
    grass.current!.instanceMatrix.needsUpdate = true;
    grass.current!.instanceColor!.needsUpdate = true;
    grass.current!.computeBoundingSphere();
  }, []);
  return (
    <instancedMesh ref={grass} args={[blades, undefined, 650]} receiveShadow>
      <meshStandardMaterial roughness={1} side={T.DoubleSide} />
    </instancedMesh>
  );
}

/** Oversized daisies add small patches of color to the creative park. */
export function ParkFlowers() {
  const stems = useRef<T.InstancedMesh>(null),
    petals = useRef<T.InstancedMesh>(null),
    centers = useRef<T.InstancedMesh>(null);
  useEffect(() => {
    const o = new T.Object3D(),
      color = new T.Color();
    for (let i = 0; i < 30; i++) {
      const x = (i % 2 ? 1 : -1) * (7 + random(i + 11) * 5),
        z = -10 + random(i + 19) * 28;
      const h = 0.7 + random(i) * 0.3;
      o.position.set(x, 0.3 + h / 2, z);
      o.scale.set(0.035, h, 0.035);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      stems.current!.setMatrixAt(i, o.matrix);
      o.position.set(x, 0.3 + h, z);
      o.scale.set(0.18, 0.1, 0.18);
      o.updateMatrix();
      centers.current!.setMatrixAt(i, o.matrix);
      for (let j = 0; j < 5; j++) {
        const a = (j * Math.PI * 2) / 5;
        o.position.set(
          x + Math.sin(a) * 0.25,
          0.3 + h - 0.025,
          z + Math.cos(a) * 0.25,
        );
        o.scale.set(0.18, 0.065, 0.3);
        o.rotation.set(0, a, 0);
        o.updateMatrix();
        petals.current!.setMatrixAt(i * 5 + j, o.matrix);
        petals.current!.setColorAt(
          i * 5 + j,
          color.set(i % 3 ? "#fff1d2" : "#efac97"),
        );
      }
    }
    for (const ref of [stems, petals, centers]) {
      ref.current!.instanceMatrix.needsUpdate = true;
      ref.current!.computeBoundingSphere();
    }
    petals.current!.instanceColor!.needsUpdate = true;
  }, []);
  return (
    <>
      <instancedMesh ref={stems} args={[undefined, undefined, 30]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#599b76" />
      </instancedMesh>
      <instancedMesh ref={petals} args={[undefined, undefined, 150]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={centers} args={[undefined, undefined, 30]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#e8ba59" roughness={0.9} />
      </instancedMesh>
    </>
  );
}
