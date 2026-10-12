import { useEffect, useMemo, useRef } from "react";
import * as T from "three";
import { useCartoonMotion } from "./CartoonMotion";
import { shoreline } from "../lib/pavilion-layout";
import { CoastalPalms } from "./PavilionNature";

function strip(
  start: (x: number) => number,
  end: (x: number) => number,
  y: number,
) {
  const points: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = -400 + i * 4;
    points.push(x, y, start(x), x, y, end(x));
    uv.push(x / 3, start(x) / 3, x / 3, end(x) / 3);
    if (i < 200) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(points, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
export function waterNormal() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const data = ctx.createImageData(256, 256);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4;
      data.data[i] =
        128 +
        Math.sin((x / 256) * Math.PI * 8 + Math.sin((y / 256) * Math.PI * 4)) *
          22;
      data.data[i + 1] =
        128 +
        Math.cos((y / 256) * Math.PI * 10 + Math.sin((x / 256) * Math.PI * 4)) *
          18;
      data.data[i + 2] = 250;
      data.data[i + 3] = 255;
    }
  ctx.putImageData(data, 0, 0);
  const t = new T.CanvasTexture(c);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.repeat.set(100, 100);
  return t;
}
export default function PavilionCoast({ night }: { night: boolean }) {
  const waves = useMemo(waterNormal, []);
  const foamMesh = useRef<T.Mesh>(null);
  useCartoonMotion((t) => {
    waves.offset.set(t * 0.01, t * 0.006);
    if (foamMesh.current)
      foamMesh.current.position.z = Math.sin(t * 0.65) * 0.6;
  });
  const beach = useMemo(() => strip(() => 39.5, shoreline, -0.01), []);
  const wet = useMemo(
    () =>
      strip(
        (x) => shoreline(x) - 1.8,
        (x) => shoreline(x) + 1.4,
        -0.12,
      ),
    [],
  );
  const foam = useMemo(
    () =>
      strip(
        (x) => shoreline(x) + 1.05,
        (x) => shoreline(x) + 1.3,
        -0.22,
      ),
    [],
  );
  useEffect(
    () => () => {
      waves.dispose();
      beach.dispose();
      wet.dispose();
      foam.dispose();
    },
    [waves, beach, wet, foam],
  );
  return (
    <>
      <mesh position={[0, -0.27, 400]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshPhysicalMaterial
          color={night ? "#2e7d92" : "#5dcac7"}
          normalMap={waves}
          normalScale={new T.Vector2(0.12, 0.12)}
          roughness={0.5}
          metalness={0.05}
          clearcoat={0.8}
        />
      </mesh>
      <mesh geometry={beach} receiveShadow>
        <meshStandardMaterial color="#f2d6a1" roughness={1} />
      </mesh>
      <mesh geometry={wet}>
        <meshStandardMaterial color="#e5c895" roughness={0.4} />
      </mesh>
      <mesh ref={foamMesh} geometry={foam}>
        <meshBasicMaterial color="#fff6dd" transparent opacity={0.9} />
      </mesh>
      <CoastalPalms />
      {[-32, 7, 35].map((x, i) => (
        <group key={x} position={[x, 0, 45]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 3, 8]} />
            <meshStandardMaterial color="#96856b" />
          </mesh>
          <mesh position={[0, 2.9, 0]} castShadow>
            <coneGeometry args={[2.5, 0.6, 16]} />
            <meshStandardMaterial
              color={i % 2 ? "#80c8b8" : "#e99d7e"}
              side={T.DoubleSide}
            />
          </mesh>
          {[-1.1, 1.1].map((dx) => (
            <mesh
              key={dx}
              position={[dx, 0.28, 1.5]}
              rotation={[-0.08, 0, 0]}
              castShadow
            >
              <boxGeometry args={[0.75, 0.16, 2.3]} />
              <meshStandardMaterial color="#f5e7c8" />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[35, 0, 62]} rotation={[0, -0.13, 0]}>
        <mesh position={[0, 0.18, 0]} receiveShadow>
          <boxGeometry args={[3.1, 0.28, 25]} />
          <meshStandardMaterial color="#d6a370" roughness={0.86} />
        </mesh>
        {Array.from({ length: 50 }, (_, i) => (
          <mesh key={i} position={[0, 0.33, -12.1 + i * 0.49]}>
            <boxGeometry args={[3, 0.025, 0.025]} />
            <meshStandardMaterial color="#c39266" />
          </mesh>
        ))}
        {[-1.4, 1.4].flatMap((x) =>
          [-10, -4, 2, 8].map((z) => (
            <mesh key={`${x}:${z}`} position={[x, -0.2, z]}>
              <cylinderGeometry args={[0.1, 0.1, 1.7, 7]} />
              <meshStandardMaterial color="#8b7b60" />
            </mesh>
          )),
        )}
      </group>
    </>
  );
}
