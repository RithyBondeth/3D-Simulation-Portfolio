import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useTexture } from "@react-three/drei";
import * as T from "three";
import {
  BLOCK_CENTRES,
  CITY_ROADS,
  cityBuildings,
  type CityBuilding,
} from "../lib/city-layout";
import Waterfront from "./Waterfront";
import type { Vec3 } from "../types";

type Box = { at: Vec3; size: Vec3; color?: string; rotation?: number };
const stone = "#bdbab0",
  metal = "#303b40",
  pavement = "#b6b5ad";

/** Street details share geometry and material, rather than adding a draw per object. */
function Boxes({
  items,
  roughness = 0.8,
  shadows = true,
}: {
  items: Box[];
  roughness?: number;
  shadows?: boolean;
}) {
  const ref = useRef<T.InstancedMesh>(null);
  useEffect(() => {
    const o = new T.Object3D(),
      c = new T.Color();
    items.forEach((b, i) => {
      o.position.set(...b.at);
      o.scale.set(...b.size);
      o.rotation.set(0, b.rotation || 0, 0);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, c.set(b.color || stone));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    ref.current!.instanceColor!.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, items.length]}
      castShadow={shadows}
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial roughness={roughness} />
    </instancedMesh>
  );
}
function Cube({
  at,
  size,
  color = stone,
  metallic = false,
}: Box & { metallic?: boolean }) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={metallic ? 0.27 : 0.82}
        metalness={metallic ? 0.6 : 0}
      />
    </mesh>
  );
}
function Label({
  text,
  at,
  width = 10,
  height = 1,
  rotation = 0,
  dark = false,
}: {
  text: string;
  at: Vec3;
  width?: number;
  height?: number;
  rotation?: number;
  dark?: boolean;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.max(64, Math.round((1024 * height) / width));
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = dark ? "#202c31" : "#dcdcd2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = dark ? "#eeeae0" : "#27383d";
    ctx.font = `500 ${canvas.height * 0.48}px 'Sora Variable', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, canvas.height / 2, 970);
    const map = new T.CanvasTexture(canvas);
    map.colorSpace = T.SRGBColorSpace;
    return map;
  }, [text, width, height, dark]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={at} rotation={[0, rotation, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} roughness={0.7} side={T.DoubleSide} />
    </mesh>
  );
}
function random(seed: number) {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function facade(style: CityBuilding["style"], night: boolean) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 1024;
  const glow = document.createElement("canvas");
  glow.width = 512;
  glow.height = 1024;
  const ctx = c.getContext("2d")!,
    g = glow.getContext("2d")!;
  ctx.fillStyle =
    style === "stone" ? "#b8b7ae" : style === "bronze" ? "#55514a" : "#33505c";
  ctx.fillRect(0, 0, 512, 1024);
  g.fillStyle = "#000";
  g.fillRect(0, 0, 512, 1024);
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 4; col++) {
      const x = col * 128,
        y = row * 128,
        seed = row * 4 + col;
      const lit = night && random(seed + 4) > 0.79;
      const gap = style === "stone" ? 23 : 4;
      const grad = ctx.createLinearGradient(x, y, x + 110, y + 128);
      if (lit) {
        grad.addColorStop(0, "#aaa18c");
        grad.addColorStop(1, "#c8bda0");
      } else {
        grad.addColorStop(0, style === "stone" ? "#53676d" : "#536f79");
        grad.addColorStop(
          0.55,
          `hsl(${197 + random(seed) * 12} 16% ${29 + random(seed + 1) * 16}%)`,
        );
        grad.addColorStop(1, "#253b46");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x + gap, y + 8, 128 - gap * 2, 111);
      // Mullions, horizontal spandrels, blinds and subtle reflected sky streaks.
      ctx.fillStyle = style === "bronze" ? "#766f59" : "#9aa7a7";
      ctx.fillRect(x + 62, y + 8, 2, 111);
      ctx.fillRect(x, y + 123, 128, 3);
      ctx.fillStyle = "#d6e2de";
      ctx.globalAlpha = 0.12;
      ctx.fillRect(x + gap + 4, y + 10, 8, 104);
      ctx.globalAlpha = 1;
      if (random(seed + 10) > 0.65) {
        ctx.fillStyle = "#a6aaa0";
        ctx.globalAlpha = 0.3;
        ctx.fillRect(
          x + gap,
          y + 8,
          128 - gap * 2,
          18 + random(seed + 12) * 38,
        );
        ctx.globalAlpha = 1;
      }
      if (lit) {
        g.fillStyle = "#d6b778";
        g.fillRect(x + gap, y + 8, 128 - gap * 2, 111);
      }
    }
  const map = new T.CanvasTexture(c),
    emissive = new T.CanvasTexture(glow);
  [map, emissive].forEach((t) => {
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = 4;
  });
  return { map, emissive };
}
function Building({ b, night }: { b: CityBuilding; night: boolean }) {
  const materials = useMemo(() => {
    const textures = facade(b.style, night);
    const side = (span: number) => {
      const map = textures.map.clone(),
        glow = textures.emissive.clone();
      map.repeat.set(span / 12.8, b.h / 28);
      glow.repeat.copy(map.repeat);
      map.needsUpdate = glow.needsUpdate = true;
      return new T.MeshPhysicalMaterial({
        map,
        emissiveMap: glow,
        emissive: "#fff0d2",
        emissiveIntensity: night ? 0.5 : 0,
        roughness: b.style === "stone" ? 0.65 : 0.28,
        metalness: b.style === "stone" ? 0.12 : 0.48,
        clearcoat: b.style === "glass" ? 0.35 : 0,
        envMapIntensity: 0.85,
      });
    };
    const x = side(b.d),
      z = side(b.w),
      roof = new T.MeshStandardMaterial({
        color: b.style === "glass" ? "#56676d" : "#a6a79e",
        roughness: 0.8,
      });
    return { array: [x, x, roof, roof, z, z], textures, x, z, roof };
  }, [b, night]);
  useEffect(
    () => () => {
      [materials.x, materials.z].forEach((m) => {
        m.map?.dispose();
        m.emissiveMap?.dispose();
        m.dispose();
      });
      materials.roof.dispose();
      materials.textures.map.dispose();
      materials.textures.emissive.dispose();
    },
    [materials],
  );
  const details = useMemo(() => {
    const items: Box[] = [];
    // Slim floor bands make the massing read as architecture from street level.
    for (let y = 7; y < b.h - 1; y += b.style === "stone" ? 3.5 : 14)
      items.push({
        at: [b.x, y, b.z],
        size: [b.w + 0.25, b.style === "stone" ? 0.2 : 0.35, b.d + 0.25],
        color: b.style === "bronze" ? "#81745b" : "#aebcbd",
      });
    items.push({
      at: [b.x, b.h + 0.2, b.z],
      size: [b.w + 0.5, 0.45, b.d + 0.5],
      color: "#758489",
    });
    items.push({
      at: [b.x - b.w * 0.2, b.h + 1.3, b.z],
      size: [b.w * 0.28, 2.3, b.d * 0.3],
      color: "#828d8e",
    });
    items.push({
      at: [b.x + b.w * 0.2, b.h + 0.8, b.z - b.d * 0.2],
      size: [b.w * 0.2, 1.3, b.d * 0.22],
      color: "#545f63",
    });
    return items;
  }, [b]);
  return (
    <group>
      <mesh
        position={[b.x, b.h / 2 + 0.18, b.z]}
        material={materials.array}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[b.w, b.h, b.d]} />
      </mesh>
      <Boxes items={details} />
      {b.name && (
        <>
          <Cube
            at={[b.x, 4.1, b.z + b.d / 2 + 1.5]}
            size={[b.w + 2, 0.38, 3.4]}
            color="#c9cac1"
          />
          <Label
            text={b.name}
            at={[b.x, 4.85, b.z + b.d / 2 + 0.05]}
            width={Math.min(b.w - 2, 22)}
            height={1.1}
            dark
          />
          {[-0.37, 0.37].map((s) => (
            <Cube
              key={s}
              at={[b.x + b.w * s, 2.05, b.z + b.d / 2 + 2.7]}
              size={[0.2, 4.1, 0.2]}
              color={metal}
            />
          ))}
        </>
      )}
      {b.h > 90 && (
        <>
          <Cube
            at={[b.x, b.h + 4, b.z]}
            size={[b.w * 0.72, 7, b.d * 0.72]}
            color="#61777f"
            metallic
          />
          <Cube
            at={[b.x, b.h + 10, b.z]}
            size={[0.35, 15, 0.35]}
            color="#a1b2b9"
            metallic
          />
        </>
      )}
    </group>
  );
}
function pavingTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#b6b4a9";
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64)
    for (let x = 0; x < 256; x += 128) {
      ctx.fillStyle = `hsl(48 4% ${65 + random(x + y) * 8}%)`;
      ctx.fillRect(x + 1, y + 1, 126, 62);
    }
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = i % 2 ? "#fff" : "#333";
    ctx.globalAlpha = 0.035;
    ctx.fillRect(random(i) * 256, random(i + 99) * 256, 1, 1);
  }
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.repeat.set(12.5, 12.5);
  t.anisotropy = 4;
  return t;
}
function Streets() {
  const [color, normal, rough] = useTexture([
    "/textures/asphalt-color.webp",
    "/textures/asphalt-normal.webp",
    "/textures/asphalt-roughness.webp",
  ]);
  useMemo(() => {
    [color, normal, rough].forEach((t) => {
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(333, 203);
      t.anisotropy = 8;
    });
    color.colorSpace = T.SRGBColorSpace;
  }, [color, normal, rough]);
  const pavers = useMemo(pavingTexture, []);
  useEffect(() => () => pavers.dispose(), [pavers]);
  const slabs = useMemo(() => {
    const items: Box[] = [];
    for (const x of BLOCK_CENTRES)
      for (const z of BLOCK_CENTRES)
        items.push({ at: [x, 0.08, z], size: [50, 0.16, 50], color: pavement });
    items.push(
      { at: [0, 0.08, 113], size: [246, 0.16, 20], color: pavement },
      { at: [0, 0.08, -113], size: [246, 0.16, 20], color: pavement },
      { at: [113, 0.08, 0], size: [20, 0.16, 206], color: pavement },
      { at: [-113, 0.08, 0], size: [20, 0.16, 206], color: pavement },
    );
    return items;
  }, []);
  const paint = useMemo(() => {
    const items: Box[] = [];
    // Continuous white edge lines, dashed lane centres and intersection stop lines.
    for (const axis of CITY_ROADS)
      for (const t of [-1, 1]) {
        items.push(
          {
            at: [axis + t * 6.6, 0.025, 0],
            size: [0.1, 0.012, 242],
            color: "#cecec4",
          },
          {
            at: [0, 0.025, axis + t * 6.6],
            size: [242, 0.012, 0.1],
            color: "#cecec4",
          },
        );
      }
    for (const axis of CITY_ROADS)
      for (let p = -118; p <= 118; p += 6) {
        if (CITY_ROADS.some((v) => Math.abs(p - v) < 12)) continue;
        items.push(
          { at: [axis, 0.028, p], size: [0.12, 0.012, 2.7], color: "#e0d7a8" },
          { at: [p, 0.028, axis], size: [2.7, 0.012, 0.12], color: "#e0d7a8" },
        );
      }
    for (const x of CITY_ROADS)
      for (const z of CITY_ROADS)
        for (const side of [-1, 1]) {
          // Clear, correctly oriented zebra crossings on all four approaches.
          for (let k = -5; k <= 5; k += 1.25) {
            items.push(
              {
                at: [x + k, 0.031, z + side * 9],
                size: [0.65, 0.013, 2.4],
                color: "#dddcd2",
              },
              {
                at: [x + side * 9, 0.031, z + k],
                size: [2.4, 0.013, 0.65],
                color: "#dddcd2",
              },
            );
          }
          items.push(
            {
              at: [x + side * 3.3, 0.031, z + side * 12],
              size: [6.2, 0.013, 0.25],
              color: "#dddcd2",
            },
            {
              at: [x + side * 12, 0.031, z - side * 3.3],
              size: [0.25, 0.013, 6.2],
              color: "#dddcd2",
            },
          );
        }
    return items;
  }, []);
  return (
    <>
      <mesh
        position={[0, -0.025, -196]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[1000, 608]} />
        <meshStandardMaterial
          map={color}
          normalMap={normal}
          normalScale={new T.Vector2(0.5, 0.5)}
          roughnessMap={rough}
          color="#777c7d"
          roughness={0.94}
        />
      </mesh>
      <Boxes items={slabs} />
      {BLOCK_CENTRES.flatMap((x) =>
        BLOCK_CENTRES.map((z) => (
          <mesh
            key={`${x}:${z}`}
            position={[x, 0.168, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[49.8, 49.8]} />
            <meshStandardMaterial map={pavers} roughness={0.95} />
          </mesh>
        )),
      )}
      <Boxes items={paint} shadows={false} />
    </>
  );
}
const streetTrees: Vec3[] = [];
for (const x of BLOCK_CENTRES)
  for (const z of BLOCK_CENTRES)
    for (const s of [-1, 1])
      for (const t of [-14, 0, 14]) {
        streetTrees.push([x + 22.5 * s, 0, z + t], [x + t, 0, z + 22.5 * s]);
      }
for (let i = 0; i < 18; i++) {
  const a = i * 2.399;
  streetTrees.push([
    Math.cos(a) * (13 + (i % 5)),
    0,
    Math.sin(a) * (15 + (i % 5)),
  ]);
}
function Trees() {
  const trunks = useRef<T.InstancedMesh>(null),
    crowns = useRef<T.InstancedMesh>(null);
  const foliage = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    // Leaf clusters have ragged silhouettes and gaps for transmitted light.
    for (let i = 0; i < 1100; i++) {
      const a = random(i) * Math.PI * 2,
        r = Math.sqrt(random(i + 300)) * 112;
      const x = 128 + Math.cos(a) * r,
        y = 128 + Math.sin(a) * r * 0.9;
      ctx.fillStyle = `hsl(${76 + random(i + 22) * 26} 18% ${30 + random(i + 8) * 27}%)`;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        3 + random(i + 7) * 5,
        2 + random(i + 15) * 3,
        a,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    const t = new T.CanvasTexture(canvas);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => foliage.dispose(), [foliage]);
  useEffect(() => {
    const o = new T.Object3D(),
      color = new T.Color();
    streetTrees.forEach(([x, , z], i) => {
      const h = 3.6 + random(i) * 1.3;
      o.position.set(x, h / 2 + 0.16, z);
      o.scale.set(0.19, h, 0.19);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      trunks.current!.setMatrixAt(i, o.matrix);
      for (let j = 0; j < 12; j++) {
        const a = j * 2.399,
          r = 1.1 * Math.sqrt(random(i * 13 + j));
        o.position.set(
          x + Math.cos(a) * r,
          h + 0.6 + random(i + j) * 1.7,
          z + Math.sin(a) * r,
        );
        o.scale.setScalar(3.4 + random(i + j) * 0.8);
        o.rotation.set((random(j) - 0.5) * Math.PI, a, random(i + j) * 0.6);
        o.updateMatrix();
        crowns.current!.setMatrixAt(i * 12 + j, o.matrix);
        crowns.current!.setColorAt(
          i * 12 + j,
          color.setHSL(0.25, 0.12, 0.56 + random(i) * 0.14),
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
        args={[undefined, undefined, streetTrees.length]}
        castShadow
      >
        <cylinderGeometry args={[0.7, 1, 1, 8]} />
        <meshStandardMaterial color="#665a46" roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={crowns}
        args={[undefined, undefined, streetTrees.length * 12]}
        castShadow
        receiveShadow
      >
        <planeGeometry />
        <meshStandardMaterial
          map={foliage}
          alphaTest={0.48}
          side={T.DoubleSide}
          roughness={0.95}
        />
      </instancedMesh>
    </>
  );
}
function Furniture({ night }: { night: boolean }) {
  const { poles, lamps, benches, signals, greens } = useMemo(() => {
    const poles: Box[] = [],
      lamps: Box[] = [],
      benches: Box[] = [],
      signals: Box[] = [],
      greens: Box[] = [];
    for (const axis of CITY_ROADS)
      for (const p of [-113, -64, 0, 64, 113])
        for (const rotate of [false, true]) {
          const x = rotate ? p : axis + 8.1,
            z = rotate ? axis - 8.1 : p;
          poles.push(
            { at: [x, 4.2, z], size: [0.15, 8.4, 0.15], color: metal },
            {
              at: [x - (rotate ? 0 : 1.2), 8.3, z + (rotate ? 1.2 : 0)],
              size: rotate ? [0.3, 0.16, 2.6] : [2.6, 0.16, 0.3],
              color: metal,
            },
          );
          lamps.push({
            at: [x - (rotate ? 0 : 1.6), 8.19, z + (rotate ? 1.6 : 0)],
            size: rotate ? [0.22, 0.06, 1.2] : [1.2, 0.06, 0.22],
            color: night ? "#ffe5b5" : "#eee9da",
          });
        }
    for (const x of CITY_ROADS)
      for (const z of CITY_ROADS)
        for (const s of [-1, 1]) {
          poles.push(
            {
              at: [x + s * 8, 2.6, z - s * 8],
              size: [0.13, 5.2, 0.13],
              color: metal,
            },
            {
              at: [x + s * 8, 4.5, z - s * 8],
              size: [0.5, 1.3, 0.4],
              color: "#242b2d",
            },
          );
          signals.push({
            at: [x + s * 8, 4.9, z - s * 8 + s * 0.23],
            size: [0.2, 0.18, 0.05],
            color: "#ba3b32",
          });
          greens.push({
            at: [x + s * 8 + s * 0.28, 4.2, z - s * 8],
            size: [0.05, 0.18, 0.2],
            color: "#5a9975",
          });
        }
    for (const x of [-19, 19])
      for (const z of [-10, 9]) {
        benches.push(
          { at: [x, 0.7, z], size: [1, 0.18, 3.2], color: "#8e7555" },
          { at: [x + 0.45, 1.05, z], size: [0.15, 0.7, 3.2], color: "#8e7555" },
        );
        poles.push(
          { at: [x, 0.35, z - 1], size: [0.8, 0.7, 0.15], color: metal },
          { at: [x, 0.35, z + 1], size: [0.8, 0.7, 0.15], color: metal },
        );
      }
    // Bollards at the park edge, bike racks and curb drainage grilles.
    for (const x of [-22, 22])
      for (let z = -18; z <= 18; z += 6)
        poles.push({ at: [x, 0.65, z], size: [0.16, 1.3, 0.16], color: metal });
    for (const x of CITY_ROADS)
      for (const z of BLOCK_CENTRES)
        poles.push({
          at: [x + 6.5, 0.014, z],
          size: [0.5, 0.018, 1.2],
          color: "#3e4546",
        });
    return { poles, lamps, benches, signals, greens };
  }, [night]);
  return (
    <>
      <Boxes items={poles} />
      <Boxes items={benches} />
      {[lamps, signals, greens].map((items, k) => (
        <GlowBoxes key={k} items={items} intensity={night ? 2 : 0.6} />
      ))}
      <Label
        text="BONDETH AVENUE"
        at={[-23.8, 5, 88]}
        width={6}
        height={0.75}
        dark
      />
      <Label
        text="CENTRAL PARK"
        at={[0, 1.4, 23]}
        width={9}
        height={1.2}
        dark
      />
      <Cube at={[0, 0.9, 22.7]} size={[10, 1.8, 0.6]} color="#93978c" />
      <Label
        text="CITY LIMIT / TURN BACK"
        at={[120, 2.2, 96]}
        rotation={-Math.PI / 2}
        width={5}
        height={0.8}
        dark
      />
      <Label
        text="CITY LIMIT / TURN BACK"
        at={[-120, 2.2, -32]}
        rotation={Math.PI / 2}
        width={5}
        height={0.8}
        dark
      />
    </>
  );
}
function GlowBoxes({ items, intensity }: { items: Box[]; intensity: number }) {
  const ref = useRef<T.InstancedMesh>(null);
  useEffect(() => {
    const o = new T.Object3D(),
      c = new T.Color();
    items.forEach((b, i) => {
      o.position.set(...b.at);
      o.scale.set(...b.size);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, c.set(b.color!));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    ref.current!.instanceColor!.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <boxGeometry />
      <meshStandardMaterial emissive="#fff" emissiveIntensity={intensity} />
    </instancedMesh>
  );
}
function Park() {
  const paths = useMemo<Box[]>(
    () => [
      { at: [-13, 0.2, 0], size: [3, 0.06, 43], color: "#d4cdb9" },
      { at: [13, 0.2, 0], size: [3, 0.06, 43], color: "#d4cdb9" },
      { at: [0, 0.2, -18], size: [42, 0.06, 3], color: "#d4cdb9" },
      { at: [0, 0.2, 18], size: [42, 0.06, 3], color: "#d4cdb9" },
      { at: [0, 0.35, 0], size: [10, 0.4, 25], color: "#989d93" },
    ],
    [],
  );
  return (
    <>
      <Cube at={[0, 0.18, 0]} size={[43, 0.05, 43]} color="#65734d" />
      <Boxes items={paths} />
      <mesh position={[0, 0.57, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 24]} />
        <meshPhysicalMaterial
          color="#427b77"
          metalness={0.4}
          roughness={0.15}
          clearcoat={1}
        />
      </mesh>
      <Cube at={[15, 3.6, -13]} size={[12, 0.25, 5]} color="#7f7d6b" />
      {[-5, 5].flatMap((x) =>
        [-1.8, 1.8].map((z) => (
          <Cube
            key={`${x}:${z}`}
            at={[15 + x, 1.8, -13 + z]}
            size={[0.16, 3.6, 0.16]}
            color={metal}
          />
        )),
      )}
      <mesh position={[0, 3.2, 0]} rotation={[0.15, 0.3, 0.35]} castShadow>
        <torusGeometry args={[2.4, 0.4, 12, 40]} />
        <meshStandardMaterial
          color="#aab8b5"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
    </>
  );
}
function BackgroundCity({ night }: { night: boolean }) {
  const material = useMemo(() => {
    const textures = facade("glass", night);
    textures.map.repeat.set(2, 2);
    textures.emissive.repeat.set(2, 2);
    const mat = new T.MeshStandardMaterial({
      map: textures.map,
      color: "#a4b7bd",
      roughness: 0.4,
      metalness: 0.3,
      emissiveMap: textures.emissive,
      emissive: "#ffe9bf",
      emissiveIntensity: night ? 0.4 : 0,
    });
    return { mat, textures };
  }, [night]);
  const items = useMemo(() => {
    const list: Box[] = [];
    for (let ring = 0; ring < 3; ring++)
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2,
          r = 165 + ring * 85;
        if (Math.sin(a) * r > 108) continue;
        const h = 18 + random(i + ring * 50) * (ring ? 100 : 65);
        list.push({
          at: [Math.cos(a) * r, h / 2, Math.sin(a) * r],
          size: [18 + random(i * 2) * 15, h, 18 + random(i * 3) * 17],
          color: `hsl(200 8% ${55 + random(i) * 20}%)`,
        });
      }
    return list;
  }, []);
  const ref = useRef<T.InstancedMesh>(null);
  useEffect(() => {
    const o = new T.Object3D(),
      c = new T.Color();
    items.forEach((b, i) => {
      o.position.set(...b.at);
      o.scale.set(...b.size);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      ref.current!.setColorAt(i, c.set(b.color!));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    ref.current!.instanceColor!.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [items]);
  useEffect(
    () => () => {
      material.mat.dispose();
      material.textures.map.dispose();
      material.textures.emissive.dispose();
    },
    [material],
  );
  return (
    <instancedMesh ref={ref} args={[undefined, material.mat, items.length]}>
      <boxGeometry />
    </instancedMesh>
  );
}
function ParkedCars() {
  const parts = useMemo(() => {
    const body: Box[] = [],
      glass: Box[] = [],
      wheels: Box[] = [];
    const cars = [
      [-79, 106, 0],
      [-72, 106, 0],
      [48, 106, 0],
      [55, 106, 0],
      [108, 12, Math.PI / 2],
      [108, 20, Math.PI / 2],
      [-108, -60, Math.PI / 2],
      [-108, -70, Math.PI / 2],
      [10, -107, 0],
      [17, -107, 0],
    ];
    cars.forEach(([x, z, a], i) => {
      const local = (dx: number, y: number, dz: number): Vec3 => [
        x + Math.cos(a) * dx + Math.sin(a) * dz,
        y,
        z - Math.sin(a) * dx + Math.cos(a) * dz,
      ];
      body.push({
        at: local(0, 0.75, 0),
        size: [4.5, 0.72, 1.85],
        color: ["#d7d8d1", "#404d55", "#8d9694", "#8e5142"][i % 4],
        rotation: a,
      });
      glass.push({
        at: local(-0.2, 1.28, 0),
        size: [2.4, 0.65, 1.62],
        color: "#2c414b",
        rotation: a,
      });
      for (const dx of [-1.35, 1.35])
        for (const dz of [-0.87, 0.87])
          wheels.push({
            at: local(dx, 0.49, dz),
            size: [0.7, 0.68, 0.23],
            color: "#23292b",
            rotation: a,
          });
    });
    return { body, glass, wheels };
  }, []);
  return (
    <>
      <Boxes items={parts.body} roughness={0.3} />
      <Boxes items={parts.glass} roughness={0.18} />
      <Boxes items={parts.wheels} />
    </>
  );
}
function GalleryPosters() {
  const images = useTexture([
    "/images/apsara-talent.webp",
    "/images/apsara-agentic.webp",
  ]);
  images.forEach((t) => {
    t.colorSpace = T.SRGBColorSpace;
  });
  return (
    <>
      {images.map((image, i) => (
        <mesh key={i} position={[-73 + i * 17, 7.8, 80.07]}>
          <planeGeometry args={[13, 6.5]} />
          <meshStandardMaterial map={image} roughness={0.6} />
        </mesh>
      ))}
    </>
  );
}
export default function City({
  night,
  buildingsRef,
}: {
  night: boolean;
  buildingsRef: MutableRefObject<T.Group | null>;
}) {
  return (
    <>
      <Streets />
      <BackgroundCity night={night} />
      <group ref={buildingsRef}>
        {cityBuildings.map((b, i) => (
          <Building key={i} b={b} night={night} />
        ))}
      </group>
      <Waterfront night={night} />
      <Park />
      <Trees />
      <Furniture night={night} />
      <ParkedCars />
      <GalleryPosters />
      <Label
        text="ATELIER / COFFEE & CODE"
        at={[-63, 2.7, 18.08]}
        width={19}
        height={1}
        dark
      />
      <Label
        text="ROOFTOP / THE JOURNEY"
        at={[64, 3.2, -84.08]}
        width={22}
        height={1.1}
        rotation={Math.PI}
        dark
      />
      {night && (
        <>
          <pointLight
            position={[0, 6, 12]}
            intensity={65}
            distance={30}
            color="#ffe2a8"
          />
          <pointLight
            position={[-64, 6, 84]}
            intensity={85}
            distance={30}
            color="#f1d6a5"
          />
        </>
      )}
    </>
  );
}
