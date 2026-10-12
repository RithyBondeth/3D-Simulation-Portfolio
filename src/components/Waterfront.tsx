import { useEffect, useMemo, useRef } from "react";
import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { shoreline } from "../lib/city-layout";
import type { Vec3 } from "../types";

function coastStrip(
  start: (x: number) => number,
  end: (x: number) => number,
  y: number,
) {
  const positions: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= 240; i++) {
    const x = -600 + i * 5;
    positions.push(x, y, start(x), x, y, end(x));
    uv.push(x / 4, start(x) / 4, x / 4, end(x) / 4);
    if (i < 240) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
function naturalTexture(kind: "sand" | "water") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = kind === "sand" ? "#cabe9c" : "#8080ff";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 16000; i++) {
    const x = ((((Math.sin(i * 127.1) * 43758.5) % 1) + 1) % 1) * 256;
    const y = ((((Math.sin(i * 73.5) * 9182.1) % 1) + 1) % 1) * 256;
    ctx.fillStyle = i % 2 ? "#eee4c8" : "#766c50";
    ctx.globalAlpha = 0.1;
    if (kind === "sand") ctx.fillRect(x, y, 1, 1);
  }
  if (kind === "water") {
    ctx.globalAlpha = 1;
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 256; x++) {
        const nx =
          128 +
          Math.sin(
            (x / 256) * Math.PI * 8 + Math.sin((y / 256) * Math.PI * 4),
          ) *
            23;
        const ny =
          128 +
          Math.cos(
            (y / 256) * Math.PI * 10 + Math.sin((x / 256) * Math.PI * 4),
          ) *
            18;
        ctx.fillStyle = `rgb(${nx},${ny},250)`;
        ctx.fillRect(x, y, 1, 1);
      }
  }
  const t = new T.CanvasTexture(c);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.anisotropy = 4;
  if (kind === "sand") t.colorSpace = T.SRGBColorSpace;
  else t.repeat.set(220, 220);
  return t;
}
function Block({
  at,
  size,
  color = "#a49276",
}: {
  at: Vec3;
  size: Vec3;
  color?: string;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}
function Palms() {
  const leafGeometry = useMemo(() => {
    const leaves: T.BufferGeometry[] = [];
    // Individual narrow leaflets give the fronds a broken, feathery silhouette.
    for (let frond = 0; frond < 9; frond++)
      for (let j = 1; j <= 13; j++)
        for (const side of [-1, 1]) {
          const t = j / 14,
            a = (frond * Math.PI * 2) / 9;
          const stem = new T.Vector3(0, 0.4 - t * t * 1.8, t * 3.6);
          const tip = new T.Vector3(
            side * Math.sin(t * Math.PI) * 0.85,
            stem.y - 0.18,
            stem.z + 0.55,
          );
          const verts = [
            stem.x - side * 0.045,
            stem.y,
            stem.z - 0.12,
            tip.x,
            tip.y,
            tip.z,
            stem.x + side * 0.055,
            stem.y,
            stem.z + 0.13,
          ];
          const g = new T.BufferGeometry();
          g.setAttribute("position", new T.Float32BufferAttribute(verts, 3));
          g.computeVertexNormals();
          g.rotateY(a);
          leaves.push(g);
        }
    const merged = mergeGeometries(leaves);
    leaves.forEach((g) => g.dispose());
    return merged;
  }, []);
  const trunkGeometry = useMemo(
    () =>
      new T.TubeGeometry(
        new T.QuadraticBezierCurve3(
          new T.Vector3(),
          new T.Vector3(-0.4, 4, 0),
          new T.Vector3(0.35, 8, 0),
        ),
        12,
        0.18,
        7,
        false,
      ),
    [],
  );
  useEffect(
    () => () => {
      leafGeometry.dispose();
      trunkGeometry.dispose();
    },
    [leafGeometry, trunkGeometry],
  );
  const trunks = useRef<T.InstancedMesh>(null),
    leaves = useRef<T.InstancedMesh>(null);
  useEffect(() => {
    const o = new T.Object3D(),
      color = new T.Color();
    for (let i = 0; i < 21; i++) {
      const x = -120 + i * 12,
        scale = 0.88 + (i % 4) * 0.06;
      o.position.set(x, 0.18, 117);
      o.rotation.set(0, i * 1.4, 0);
      o.scale.setScalar(scale);
      o.updateMatrix();
      trunks.current!.setMatrixAt(i, o.matrix);
      o.position.y += 8 * scale;
      o.updateMatrix();
      leaves.current!.setMatrixAt(i, o.matrix);
      leaves.current!.setColorAt(i, color.set(i % 2 ? "#475b35" : "#52683d"));
    }
    trunks.current!.instanceMatrix.needsUpdate =
      leaves.current!.instanceMatrix.needsUpdate = true;
    leaves.current!.instanceColor!.needsUpdate = true;
    trunks.current!.computeBoundingSphere();
    leaves.current!.computeBoundingSphere();
  }, []);
  return (
    <>
      <instancedMesh
        ref={trunks}
        args={[trunkGeometry, undefined, 21]}
        castShadow
      >
        <meshStandardMaterial color="#8a7960" roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={leaves}
        args={[leafGeometry, undefined, 21]}
        castShadow
      >
        <meshStandardMaterial roughness={0.9} side={T.DoubleSide} />
      </instancedMesh>
    </>
  );
}
function BeachFurniture() {
  return (
    <>
      {[-100, -65, -27, 10, 43, 97].map((x, i) => (
        <group key={x} position={[x, 0, 137 + (i % 2) * 6]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.035, 0.045, 2.8, 8]} />
            <meshStandardMaterial color="#8b7b60" />
          </mesh>
          <mesh position={[0, 2.75, 0]} castShadow>
            <coneGeometry args={[2.4, 0.75, 12]} />
            <meshStandardMaterial
              color={i % 2 ? "#a4bdba" : "#ddd3b9"}
              side={T.DoubleSide}
            />
          </mesh>
          {[-1.1, 1.1].map((dx) => (
            <group key={dx} position={[dx, 0, 1.2]}>
              <Block at={[0, 0.3, 0]} size={[0.8, 0.15, 2.2]} color="#c4baa2" />
              <Block
                at={[0, 0.55, -0.75]}
                size={[0.8, 0.55, 0.15]}
                color="#d4cbb8"
              />
            </group>
          ))}
        </group>
      ))}
      {/* A small cafe on the promenade and a timber lifeguard station on the sand. */}
      <Block at={[-80, 3.4, 115]} size={[13, 0.25, 6]} color="#d0c5ad" />
      {[-85.5, -74.5].flatMap((x) =>
        [112.8, 117.2].map((z) => (
          <Block
            key={`${x}:${z}`}
            at={[x, 1.7, z]}
            size={[0.18, 3.4, 0.18]}
            color="#504f43"
          />
        )),
      )}
      <Block at={[-80, 0.75, 115]} size={[10, 1.5, 2]} color="#998466" />
      <Block at={[76, 1.8, 137]} size={[4.5, 2.4, 4.5]} color="#b4a38a" />
      <Block at={[76, 3.15, 137]} size={[5.8, 0.3, 5.8]} color="#d9d6c7" />
      <Block at={[76, 2.3, 139.3]} size={[3.4, 0.65, 0.1]} color="#507d88" />
      {Array.from({ length: 5 }, (_, i) => (
        <Block
          key={i}
          at={[76, 0.1 + i * 0.12, 141.2 - i * 0.35]}
          size={[1.8, 0.2 + i * 0.24, 0.4]}
          color="#a7997d"
        />
      ))}
      {[-108, -52, 0, 52, 108].map((x) => (
        <group key={x}>
          <Block at={[x, 0.65, 114]} size={[3.4, 0.18, 0.85]} color="#887358" />
          <Block at={[x, 1, 113.6]} size={[3.4, 0.7, 0.13]} color="#887358" />
          <Block
            at={[x - 1, 0.35, 114]}
            size={[0.14, 0.7, 0.7]}
            color="#344548"
          />
          <Block
            at={[x + 1, 0.35, 114]}
            size={[0.14, 0.7, 0.7]}
            color="#344548"
          />
        </group>
      ))}
      <Block at={[40, 0.08, 187]} size={[5, 0.35, 67]} color="#9d896a" />
      {Array.from({ length: 10 }, (_, i) => (
        <group key={i}>
          {[-2.2, 2.2].map((x) => (
            <Block
              key={x}
              at={[40 + x, -0.9, 159 + i * 6]}
              size={[0.18, 2.5, 0.18]}
              color="#716650"
            />
          ))}
        </group>
      ))}
    </>
  );
}
export default function Waterfront({ night }: { night: boolean }) {
  const sand = useMemo(() => naturalTexture("sand"), []),
    waves = useMemo(() => naturalTexture("water"), []);
  const beach = useMemo(
    () =>
      coastStrip(
        () => 119,
        (x) => shoreline(x),
        -0.005,
      ),
    [],
  );
  const wet = useMemo(
    () =>
      coastStrip(
        (x) => shoreline(x) - 2.7,
        (x) => shoreline(x) + 2,
        -0.12,
      ),
    [],
  );
  const foam = useMemo(
    () =>
      coastStrip(
        (x) => shoreline(x) + 1.3 + Math.sin(x * 0.7) * 0.3,
        (x) => shoreline(x) + 1.65 + Math.sin(x * 0.7) * 0.3,
        -0.22,
      ),
    [],
  );
  useEffect(
    () => () => {
      sand.dispose();
      waves.dispose();
      beach.dispose();
      wet.dispose();
      foam.dispose();
    },
    [sand, waves, beach, wet, foam],
  );
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 600]}>
        <planeGeometry args={[3000, 3000]} />
        <meshPhysicalMaterial
          color={night ? "#1c3c4c" : "#3c8d9b"}
          normalMap={waves}
          normalScale={new T.Vector2(0.3, 0.3)}
          roughness={0.22}
          metalness={0.38}
          clearcoat={0.8}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh geometry={beach} receiveShadow>
        <meshStandardMaterial map={sand} roughness={0.98} />
      </mesh>
      <mesh geometry={wet} receiveShadow>
        <meshStandardMaterial map={sand} color="#a49b7a" roughness={0.4} />
      </mesh>
      <mesh geometry={foam}>
        <meshStandardMaterial
          color="#c9e3db"
          transparent
          opacity={0.55}
          roughness={0.4}
        />
      </mesh>
      <Block at={[0, 0.13, 110.8]} size={[246, 0.2, 8]} color="#b9ae97" />
      <Block at={[0, 0.175, 106.2]} size={[246, 0.03, 2.5]} color="#6c9994" />
      <Block at={[0, 0.18, 117]} size={[246, 0.1, 4]} color="#6c7850" />
      {[-96, -32, 32, 96].map((x) => (
        <Block
          key={x}
          at={[x, 0.245, 117]}
          size={[5, 0.02, 4.1]}
          color="#c6bda8"
        />
      ))}
      <Palms />
      <BeachFurniture />
    </>
  );
}
