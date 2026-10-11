import {
  memo,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import * as T from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  stations,
  type MovementInput,
  type SectionId,
  type Vec3,
} from "../types";
import {
  advanceCar,
  onRoad,
  spawnCar,
  type CarState,
  type RoadTelemetry,
} from "../lib/driving";

type Props = {
  selected: SectionId | null;
  onSelect: (id: SectionId) => void;
  onReady: () => void;
  onNear: (id: SectionId | null) => void;
  onTelemetry: (value: RoadTelemetry) => void;
  night: boolean;
  reduceMotion: boolean;
  paused: boolean;
  reset: number;
  movement: MutableRefObject<MovementInput>;
  immersive: boolean;
};
const C = {
  concrete: "#f0ede3",
  white: "#fffdf1",
  road: "#424f56",
  line: "#e8e9db",
  grass: "#a8bd8a",
  sand: "#e4dcc3",
  water: "#8ec8cc",
  glass: "#315966",
  metal: "#253d44",
  wood: "#ae8661",
  blue: "#347da4",
};

function Block({
  at = [0, 0, 0],
  size,
  color = C.concrete,
  round = 0,
  rotation,
  metal = 0,
}: {
  at?: Vec3;
  size: Vec3;
  color?: string;
  round?: number;
  rotation?: Vec3;
  metal?: number;
}) {
  const geometry = useMemo(
    () =>
      round
        ? new RoundedBoxGeometry(...size, 2, round)
        : new T.BoxGeometry(...size),
    [size[0], size[1], size[2], round],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      position={at}
      rotation={rotation}
      geometry={geometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={metal ? 0.3 : 0.8}
        metalness={metal}
      />
    </mesh>
  );
}
function Cylinder({
  at,
  radius,
  height,
  color = C.concrete,
  top = radius,
}: {
  at: Vec3;
  radius: number;
  height: number;
  color?: string;
  top?: number;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <cylinderGeometry args={[top, radius, height, 24]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}
function roundShape(w: number, h: number, r: number) {
  const s = new T.Shape(),
    x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function Slab({
  w,
  d,
  r,
  y,
  color,
  hole,
}: {
  w: number;
  d: number;
  r: number;
  y: number;
  color: string;
  hole?: [number, number, number];
}) {
  const geo = useMemo(() => {
    const shape = roundShape(w, d, r);
    if (hole) shape.holes.push(new T.Path(roundShape(...hole).getPoints(36)));
    return new T.ShapeGeometry(shape, 32);
  }, [w, d, r, hole?.[0], hole?.[1], hole?.[2]]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh
      geometry={geo}
      position={[0, y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.91} />
    </mesh>
  );
}
function Sign({
  text,
  at,
  width = 8,
  height = 1.5,
  color = "#253d44",
  background,
  rotation = [0, 0, 0],
}: {
  text: string;
  at: Vec3;
  width?: number;
  height?: number;
  color?: string;
  background?: string;
  rotation?: Vec3;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.round((1024 * height) / width);
    const ctx = canvas.getContext("2d")!;
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = color;
    ctx.font = `600 ${canvas.height * 0.52}px "Sora Variable", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }, [text, width, height, color, background]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={at} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent={!background}
        depthWrite={!!background}
        side={T.DoubleSide}
      />
    </mesh>
  );
}
function Poster({
  url,
  at,
  width = 4.6,
  rotation = [0, 0, 0],
}: {
  url: string;
  at: Vec3;
  width?: number;
  rotation?: Vec3;
}) {
  const tex = useTexture(url);
  tex.colorSpace = T.SRGBColorSpace;
  return (
    <group position={at} rotation={rotation}>
      <Block
        at={[0, 0, -0.08]}
        size={[width + 0.24, width * 0.625 + 0.24, 0.16]}
        color={C.metal}
        round={0.07}
      />
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[width, width * 0.625]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  );
}
function Road() {
  const markings = useRef<T.InstancedMesh>(null);
  const placements = useMemo(() => {
    const p: { x: number; z: number; a: number }[] = [];
    for (let x = -27; x <= 27; x += 5)
      p.push({ x, z: -31, a: Math.PI / 2 }, { x, z: 31, a: Math.PI / 2 });
    for (let z = -19; z <= 19; z += 5)
      p.push({ x: -40, z, a: 0 }, { x: 40, z, a: 0 });
    for (const [cx, cz, base] of [
      [30, 21, 0],
      [-30, 21, Math.PI / 2],
      [-30, -21, Math.PI],
      [30, -21, Math.PI * 1.5],
    ])
      for (let i = 0; i < 4; i++) {
        const a = base + (i * Math.PI) / 8;
        p.push({ x: cx + Math.cos(a) * 10, z: cz + Math.sin(a) * 10, a: -a });
      }
    for (let x = -32; x <= 32; x += 5)
      if (Math.abs(x) > 11) p.push({ x, z: 0, a: Math.PI / 2 });
    return p;
  }, []);
  useEffect(() => {
    const obj = new T.Object3D();
    placements.forEach((p, i) => {
      obj.position.set(p.x, 0.065, p.z);
      obj.rotation.y = p.a;
      obj.updateMatrix();
      markings.current!.setMatrixAt(i, obj.matrix);
    });
    markings.current!.instanceMatrix.needsUpdate = true;
  }, [placements]);
  return (
    <>
      <Slab
        w={93}
        d={75}
        r={18}
        y={0.015}
        color={C.concrete}
        hole={[67, 49, 5]}
      />
      <Slab w={90} d={72} r={16} y={0.035} color={C.road} hole={[70, 52, 6]} />
      <Slab
        w={88.8}
        d={70.8}
        r={15.4}
        y={0.045}
        color={C.line}
        hole={[88.55, 70.55, 15.3]}
      />
      <Slab
        w={71.45}
        d={53.45}
        r={6.7}
        y={0.048}
        color={C.line}
        hole={[71.2, 53.2, 6.6]}
      />
      <Block at={[0, 0.028, 0]} size={[80, 0.035, 10.5]} color={C.concrete} />
      <Block at={[0, 0.052, 0]} size={[80, 0.02, 9]} color={C.road} />
      <Cylinder
        at={[0, 0.057, 0]}
        radius={9.6}
        height={0.025}
        color={C.concrete}
      />
      <Cylinder at={[0, 0.075, 0]} radius={9} height={0.025} color={C.road} />
      <instancedMesh
        ref={markings}
        args={[undefined, undefined, placements.length]}
      >
        <boxGeometry args={[0.13, 0.012, 2.1]} />
        <meshStandardMaterial color={C.line} />
      </instancedMesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: 7 }, (_, i) => (
            <Block
              key={i}
              at={[side * 34, 0.07, -2.5 + i * 0.8]}
              size={[2.1, 0.02, 0.35]}
              color={C.line}
            />
          ))}
        </group>
      ))}
      {/* Arrival bays are wide enough to leave the main road. */}
      {[-20, 20].map((x) => (
        <group key={x}>
          <Block at={[x, 0.03, -24.9]} size={[11, 0.04, 4]} color={C.road} />
          {[-4, 0, 4].map((dx) => (
            <Block
              key={dx}
              at={[x + dx, 0.065, -24.9]}
              size={[0.1, 0.02, 3]}
              color={C.line}
            />
          ))}
        </group>
      ))}
    </>
  );
}
const treePositions: Vec3[] = [
  [-49, 0, -28],
  [-50, 0, -17],
  [-51, 0, 18],
  [-48, 0, 30],
  [-37, 0, 41],
  [-22, 0, 42],
  [-7, 0, 43],
  [8, 0, 43],
  [24, 0, 42],
  [39, 0, 40],
  [50, 0, 29],
  [51, 0, 17],
  [51, 0, 3],
  [51, 0, -10],
  [49, 0, -25],
  [37, 0, -42],
  [21, 0, -43],
  [5, 0, -43],
  [-11, 0, -43],
  [-28, 0, -42],
  [-31, 0, -12],
  [-31, 0, -20],
  [-7, 0, -16],
  [-6, 0, -7],
  [6, 0, -8],
  [31, 0, -12],
  [32, 0, -21],
  [9, 0, -23],
  [-9, 0, 24],
  [-31, 0, 18],
  [-31, 0, 10],
  [-6, 0, 10],
  [7, 0, 12],
  [32, 0, 8],
  [8, 0, 24],
  [-14, 0, -7],
  [-14, 0, 7],
];
function Trees() {
  const trunks = useRef<T.InstancedMesh>(null),
    crowns = useRef<T.InstancedMesh>(null),
    lower = useRef<T.InstancedMesh>(null);
  useEffect(() => {
    const o = new T.Object3D();
    treePositions.forEach(([x, , z], i) => {
      const h = 3.1 + (i % 4) * 0.42;
      o.position.set(x, h / 2, z);
      o.scale.set(0.23, h, 0.23);
      o.rotation.set(0, 0, ((i % 3) - 1) * 0.03);
      o.updateMatrix();
      trunks.current!.setMatrixAt(i, o.matrix);
      o.position.y = h + 1.2;
      o.scale.set(2.2, 2.6, 2);
      o.rotation.set(i * 0.5, i, 0);
      o.updateMatrix();
      crowns.current!.setMatrixAt(i, o.matrix);
      crowns.current!.setColorAt(
        i,
        new T.Color(
          i % 3 === 0 ? "#60846b" : i % 3 === 1 ? "#7b996e" : "#8ea777",
        ),
      );
      o.position.y = h + 0.25;
      o.scale.set(2.5, 1.5, 2.3);
      o.updateMatrix();
      lower.current!.setMatrixAt(i, o.matrix);
    });
    [trunks, crowns, lower].forEach((r) => {
      r.current!.instanceMatrix.needsUpdate = true;
    });
    crowns.current!.instanceColor!.needsUpdate = true;
  }, []);
  return (
    <>
      <instancedMesh
        ref={trunks}
        args={[undefined, undefined, treePositions.length]}
        castShadow
      >
        <cylinderGeometry args={[0.8, 1, 1, 8]} />
        <meshStandardMaterial color="#8e7959" />
      </instancedMesh>
      <instancedMesh
        ref={crowns}
        args={[undefined, undefined, treePositions.length]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={lower}
        args={[undefined, undefined, treePositions.length]}
        castShadow
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#718f69" roughness={1} />
      </instancedMesh>
    </>
  );
}
function Palm({
  at,
  scale = 1,
  rotation = 0,
}: {
  at: Vec3;
  scale?: number;
  rotation?: number;
}) {
  return (
    <group position={at} scale={scale} rotation={[0, rotation, 0]}>
      <mesh position={[0.2, 3.5, 0]} rotation={[0, 0, -0.06]} castShadow>
        <cylinderGeometry args={[0.13, 0.26, 7, 8]} />
        <meshStandardMaterial color="#a28c68" />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <group
          key={i}
          position={[0.4, 7, 0]}
          rotation={[0, (i * Math.PI * 2) / 7, 0]}
        >
          <mesh
            position={[0, -0.32, 1.4]}
            rotation={[-0.34, 0, 0]}
            scale={[0.45, 0.1, 2.4]}
            castShadow
          >
            <sphereGeometry args={[1, 8, 5]} />
            <meshStandardMaterial
              color={i % 2 ? "#608b6e" : "#78996c"}
              roughness={0.85}
            />
          </mesh>
          <mesh
            position={[0, 0.12, 0.9]}
            rotation={[0.2, 0, 0]}
            castShadow
            scale={[0.34, 0.1, 1.8]}
          >
            <sphereGeometry args={[1, 8, 5]} />
            <meshStandardMaterial color="#78996c" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function Lamp({ at, night }: { at: Vec3; night: boolean }) {
  return (
    <group position={at}>
      <Block at={[0, 2.7, 0]} size={[0.13, 5.4, 0.13]} color={C.metal} />
      <Block at={[0.45, 5.35, 0]} size={[1.15, 0.12, 0.3]} color={C.metal} />
      <mesh position={[0.7, 5.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.2]} />
        <meshBasicMaterial color={night ? "#ffe2a2" : "#fffced"} />
      </mesh>
    </group>
  );
}
function Bench({ at, rotation = 0 }: { at: Vec3; rotation?: number }) {
  return (
    <group position={at} rotation={[0, rotation, 0]}>
      {[-0.7, 0.7].map((x) => (
        <Block
          key={x}
          at={[x, 0.4, 0]}
          size={[0.12, 0.8, 0.65]}
          color={C.metal}
        />
      ))}
      <Block
        at={[0, 0.8, 0]}
        size={[2.2, 0.13, 0.8]}
        color={C.wood}
        round={0.04}
      />
      <Block
        at={[0, 1.2, -0.35]}
        size={[2.2, 0.7, 0.1]}
        color={C.wood}
        round={0.04}
      />
    </group>
  );
}
function Gallery() {
  return (
    <group position={[-20, 0, -15]} rotation={[0, Math.PI, 0]}>
      <Block at={[0, 0.15, 0]} size={[21, 0.3, 13]} round={0.3} />
      <Block at={[0, 2.6, -3.8]} size={[18, 5.2, 2.4]} color={C.white} />
      <Block at={[-8, 2.6, 0]} size={[2, 5.2, 9.5]} color={C.white} />
      <Block at={[8, 2.6, 0]} size={[2, 5.2, 9.5]} color={C.white} />
      <Block
        at={[0, 5.2, 0]}
        size={[19, 0.5, 10]}
        color={C.white}
        round={0.18}
      />
      <Block
        at={[0, 2.2, 4.4]}
        size={[15.5, 4, 0.1]}
        color={C.glass}
        metal={0.5}
      />
      {[-5.1, 0, 5.1].map((x) => (
        <Block
          key={x}
          at={[x, 2.2, 4.51]}
          size={[0.1, 4, 0.13]}
          color={C.metal}
        />
      ))}
      <Poster
        url="/images/apsara-talent.webp"
        at={[-4.4, 2.7, 4.65]}
        width={4.6}
      />
      <Poster
        url="/images/apsara-agentic.webp"
        at={[2.5, 2.7, 4.65]}
        width={6.1}
      />
      <Sign
        text="THE PROJECT GALLERY"
        at={[0, 4.75, 4.72]}
        width={13}
        height={1}
      />
      <Sign
        text="01"
        at={[-8, 3.1, 5.08]}
        width={1.5}
        height={2}
        color={C.blue}
      />
      {[-6, -4, -2, 0, 2, 4, 6].map((x) => (
        <Block
          key={x}
          at={[x, 0.75, -3]}
          size={[0.2, 1.5, 0.2]}
          color={C.wood}
        />
      ))}
      <Block at={[0, 0.35, 6.8]} size={[8, 0.18, 2]} color={C.concrete} />
    </group>
  );
}
function Lab() {
  return (
    <group position={[20, 0, -16]}>
      <Block
        at={[0, 0.2, 0]}
        size={[17, 0.4, 16]}
        color={C.concrete}
        round={1.5}
      />
      <Cylinder at={[0, 3, 0]} radius={6.5} height={5.8} color={C.glass} />
      <Cylinder at={[0, 5.8, 0]} radius={7.4} height={0.45} color={C.white} />
      <Cylinder at={[0, 6.3, 0]} radius={5.2} height={0.6} color={C.concrete} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i * Math.PI * 2) / 14;
        return (
          <Block
            key={i}
            at={[Math.sin(a) * 6.55, 3, Math.cos(a) * 6.55]}
            size={[0.12, 5.6, 0.14]}
            color={C.white}
          />
        );
      })}
      <group position={[0, 7.3, 0]} rotation={[0.4, 0, 0.35]}>
        <mesh castShadow>
          <torusGeometry args={[2.6, 0.14, 10, 60]} />
          <meshStandardMaterial
            color={C.blue}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.45, 0]}>
          <torusGeometry args={[2.6, 0.14, 10, 60]} />
          <meshStandardMaterial
            color={C.blue}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial color={C.white} metalness={0.3} />
        </mesh>
      </group>
      <Block
        at={[0, 1.6, -6.6]}
        size={[6, 2.5, 0.16]}
        color={C.white}
        round={0.2}
      />
      <Sign
        text="THE AI LAB"
        at={[0, 1.8, -6.72]}
        rotation={[0, Math.PI, 0]}
        width={5}
        height={1}
      />
    </group>
  );
}
function TechGarden() {
  return (
    <group position={[23, 0, 16]}>
      <Block
        at={[0, 0.15, 0]}
        size={[18, 0.3, 14]}
        color={C.concrete}
        round={0.5}
      />
      <Block at={[0, 3, -3.5]} size={[13, 6, 2]} color={C.white} round={0.25} />
      <Block
        at={[0, 6.1, 0]}
        size={[15, 0.4, 11]}
        color={C.white}
        round={0.25}
      />
      {[-6, 6].map((x) => (
        <Block key={x} at={[x, 3, 3.7]} size={[0.3, 6, 0.3]} color={C.metal} />
      ))}
      {[-5, -2.5, 0, 2.5, 5].map((x, i) => (
        <group key={x}>
          <Block
            at={[x, 1.2, 1]}
            size={[1.8, 2.4, 1.8]}
            color={C.white}
            round={0.15}
          />
          <Sign
            text={["TS", "AI", "JS", "Py", "DB"][i]}
            at={[x, 1.35, 1.92]}
            width={1.4}
            height={1}
            color={C.blue}
          />
          <Cylinder
            at={[x, 2.55, 1]}
            radius={0.6}
            height={0.3}
            color="#7f9e79"
          />
        </group>
      ))}
      <Sign text="THE TOOLKIT" at={[0, 5.2, 5.56]} width={9} height={1.15} />
      <Bench at={[-4, 0, 5]} rotation={Math.PI} />
      <Bench at={[3, 0, 5]} rotation={Math.PI} />
      <Block at={[0, 0.8, -1.8]} size={[11, 1.6, 0.7]} color={C.wood} />
    </group>
  );
}
function House() {
  return (
    <group position={[-20, 0, 16]}>
      <Block
        at={[0, 0.16, 0]}
        size={[20, 0.3, 15]}
        color={C.wood}
        round={0.3}
      />
      <Block
        at={[0, 2.3, -1]}
        size={[15, 4.6, 8]}
        color={C.white}
        round={0.2}
      />
      <Block
        at={[-2, 2.4, 3.04]}
        size={[9, 4, 0.1]}
        color={C.glass}
        metal={0.4}
      />
      {[-6.4, -2, 2.4].map((x) => (
        <Block
          key={x}
          at={[x, 2.4, 3.15]}
          size={[0.13, 4, 0.15]}
          color={C.metal}
        />
      ))}
      <Block
        at={[0, 4.85, 0.2]}
        size={[17, 0.4, 12]}
        color={C.white}
        round={0.1}
      />
      <Block at={[5, 2.2, 3]} size={[3, 4.4, 1]} color={C.wood} />
      <Poster url="/images/bondeth.webp" at={[5, 2.7, 3.55]} width={2} />
      <Sign text="MEET THE MAKER" at={[-2, 4.45, 5.1]} width={10} height={1} />
      <Bench at={[-4, 0, 5.2]} />
      <Cylinder at={[2, 0.8, 5]} radius={0.8} height={0.1} />
      <mesh position={[2, 0.4, 5]} castShadow>
        <cylinderGeometry args={[0.09, 0.16, 0.8, 12]} />
        <meshStandardMaterial color={C.metal} />
      </mesh>
    </group>
  );
}
function Lookout() {
  return (
    <group position={[-53, 0, 0]}>
      <Block at={[0, 0.5, 0]} size={[9, 1, 18]} color={C.wood} round={0.3} />
      {[-3.7, 3.7].map((x) => (
        <Block
          key={x}
          at={[x, 3.3, 0]}
          size={[0.22, 5.8, 16]}
          color={C.white}
        />
      ))}
      <Block
        at={[0, 6.3, 0]}
        size={[10, 0.4, 18]}
        color={C.white}
        round={0.15}
      />
      {Array.from({ length: 9 }, (_, i) => (
        <Block
          key={i}
          at={[0, 6.55, -7.2 + i * 1.8]}
          size={[9, 0.15, 0.5]}
          color={C.wood}
        />
      ))}
      <Sign
        text="THE JOURNEY"
        at={[3.85, 4.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={11}
        height={1.5}
      />
      <Bench at={[0, 0.5, -4]} rotation={Math.PI / 2} />
      <Bench at={[0, 0.5, 4]} rotation={Math.PI / 2} />
      <Block at={[7, 0.18, 0]} size={[6, 0.3, 7]} />
    </group>
  );
}
function Plaza() {
  return (
    <group>
      <Cylinder
        at={[0, 0.24, 0]}
        radius={5.6}
        height={0.45}
        color={C.concrete}
      />
      <Cylinder at={[0, 0.53, 0]} radius={4.8} height={0.15} color="#76b7bc" />
      <Cylinder at={[0, 0.65, 0]} radius={1.8} height={0.3} color={C.white} />
      <group position={[0, 3, 0]} rotation={[0, 0.5, 0.2]}>
        <mesh castShadow rotation={[0, 0, -0.4]}>
          <torusGeometry args={[2.5, 0.34, 12, 64]} />
          <meshStandardMaterial
            color={C.blue}
            roughness={0.25}
            metalness={0.65}
          />
        </mesh>
        <mesh castShadow rotation={[0, Math.PI / 2, 0.4]}>
          <torusGeometry args={[2.5, 0.34, 12, 64]} />
          <meshStandardMaterial
            color={C.metal}
            roughness={0.25}
            metalness={0.65}
          />
        </mesh>
      </group>
    </group>
  );
}
function Coast() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.85, 0]}
        receiveShadow
      >
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial
          color={C.water}
          roughness={0.38}
          metalness={0.15}
        />
      </mesh>
      <Slab w={130} d={110} r={23} y={-0.75} color="#a9d4cc" />
      <Slab w={125} d={105} r={20} y={-0.45} color={C.sand} />
      <Slab w={120} d={100} r={16} y={0} color={C.grass} />
      <group position={[8, -0.1, 53]}>
        <Block at={[0, 0, 4]} size={[5, 0.4, 20]} color={C.wood} />
        {[-2.4, 2.4].map((x) => (
          <group key={x}>
            {[0, 6, 12].map((z) => (
              <Cylinder
                key={z}
                at={[x, -1, z]}
                radius={0.13}
                height={3}
                color={C.wood}
              />
            ))}
          </group>
        ))}
        <group position={[6, 0, 12]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.7, 4, 4, 12]} />
            <meshStandardMaterial color={C.white} />
          </mesh>
          <Cylinder at={[0, 3, 0]} radius={0.06} height={6} color={C.metal} />
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[2.5, 5, 3]} />
            <meshStandardMaterial color={C.white} side={T.DoubleSide} />
          </mesh>
        </group>
      </group>
      {[
        [-110, -75, 25],
        [-70, -120, 35],
        [60, -130, 32],
        [120, 60, 25],
      ].map(([x, z, s], i) => (
        <mesh
          key={i}
          position={[x, -s * 0.12, z]}
          scale={[s * 1.8, s, s * 1.4]}
          rotation={[0, i * 0.7, 0]}
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={i % 2 ? "#a5b8aa" : "#9db5ab"}
            flatShading
          />
        </mesh>
      ))}
    </>
  );
}
function Landscape({ night }: { night: boolean }) {
  return (
    <>
      <Coast />
      <Road />
      <Trees />
      <Gallery />
      <Lab />
      <House />
      <TechGarden />
      <Lookout />
      <Plaza />
      {[
        [-32, 0, -38],
        [2, 0, -38],
        [31, 0, -39],
        [46, 0, -13],
        [45, 0, 22],
        [-35, 0, 37],
        [1, 0, 38],
        [-45, 0, 13],
      ].map((p, i) => (
        <Palm
          key={i}
          at={p as Vec3}
          scale={0.85 + (i % 3) * 0.1}
          rotation={i}
        />
      ))}
      {[
        [-32, 0, -25],
        [2, 0, -25],
        [31, 0, -26],
        [-34, 0, 24],
        [3, 0, 25],
        [34, 0, 24],
        [-34, 0, -6],
        [34, 0, 6],
      ].map((p, i) => (
        <Lamp key={i} at={p as Vec3} night={night} />
      ))}
      <Sign
        text="BONDETH ISLAND"
        at={[-1, 0.07, -38.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={22}
        height={2.6}
        color="#e6e7d4"
      />
      <Sign
        text="SLOW / EXPLORE"
        at={[12, 0.09, -31]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        width={6}
        height={1.8}
        color="#b7c7c8"
      />
      {[-10, 10].map((x) => (
        <Bench key={x} at={[x, 0, 6]} rotation={Math.PI} />
      ))}
    </>
  );
}
function BMW({
  car,
  steering,
}: {
  car: MutableRefObject<CarState>;
  steering: MutableRefObject<number>;
}) {
  const { scene } = useGLTF("/models/bmw-m4.glb");
  const model = useMemo(() => {
    const clone = scene.clone(true),
      root = new T.Group(),
      wheels: T.Group[] = [],
      frontWheels: T.Group[] = [];
    const materials = new Map<string, T.MeshStandardMaterial>(),
      geometries: T.BufferGeometry[] = [];
    clone.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(clone),
      size = box.getSize(new T.Vector3()),
      center = box.getCenter(new T.Vector3());
    clone.traverse((child) => {
      if (!(child instanceof T.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const customize = (original: T.MeshStandardMaterial) => {
        const paint =
          /body151|zx1|livery/i.test(original.name) ||
          ["Object_24", "Object_30"].includes(child.name);
        const key = original.uuid + (paint ? "paint" : "");
        if (materials.has(key)) return materials.get(key)!;
        const m = original.clone();
        if (paint) {
          m.color.set("#277c9f");
          m.metalness = 0.65;
          m.roughness = 0.28;
          m.map = null;
          m.vertexColors = false;
        }
        if (/windows/i.test(m.name)) {
          m.color.set("#183544");
          m.roughness = 0.18;
          m.metalness = 0.4;
          m.transparent = false;
          m.opacity = 1;
          m.map = null;
        }
        if (/chrome51/i.test(m.name)) {
          m.color.set("#718b96");
          m.metalness = 0.8;
          m.roughness = 0.25;
        }
        if (/led111/i.test(m.name)) {
          m.emissive.set("#e0f5ff");
          m.emissiveIntensity = 0.65;
        }
        if (/m8rim001/i.test(m.name)) {
          m.color.set("#181c20");
          m.metalness = 0.04;
          m.roughness = 0.88;
        } else if (/m8rim1/i.test(m.name)) {
          m.color.set("#53636c");
          m.metalness = 0.85;
          m.roughness = 0.25;
        }
        if (/caliper/i.test(m.name)) {
          m.color.set("#34799d");
          m.metalness = 0.4;
        }
        materials.set(key, m);
        return m;
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(customize)
        : customize(child.material);
      if (/m8rim/i.test((child.material as T.Material).name)) {
        // The artist grouped all four wheels in one mesh. Split the triangles into
        // wheel quadrants so the actual model's tyres and rims can roll and steer.
        const source: T.BufferGeometry = child.geometry.index
          ? child.geometry.toNonIndexed()
          : child.geometry.clone();
        const quantized = source.getAttribute("position");
        const decoded = new Float32Array(quantized.count * 3);
        for (let v = 0; v < quantized.count; v++) {
          decoded[v * 3] = quantized.getX(v);
          decoded[v * 3 + 1] = quantized.getY(v);
          decoded[v * 3 + 2] = quantized.getZ(v);
        }
        source.setAttribute("position", new T.BufferAttribute(decoded, 3));
        source.applyMatrix4(child.matrixWorld);
        const pos = source.getAttribute("position");
        const indices: number[][] = [[], [], [], []];
        for (let i = 0; i < pos.count; i += 3) {
          const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
          const z = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
          indices[(x > center.x ? 1 : 0) + (z > center.z ? 2 : 0)].push(
            i,
            i + 1,
            i + 2,
          );
        }
        indices.forEach((list, index) => {
          if (!list.length) return;
          const geo = new T.BufferGeometry();
          for (const [name, attr] of Object.entries(source.attributes)) {
            const values = new Float32Array(list.length * attr.itemSize);
            list.forEach((v, j) => {
              for (let k = 0; k < attr.itemSize; k++)
                values[j * attr.itemSize + k] = attr.getComponent(v, k);
            });
            geo.setAttribute(
              name,
              new T.BufferAttribute(values, attr.itemSize),
            );
          }
          geo.computeBoundingBox();
          const c = geo.boundingBox!.getCenter(new T.Vector3());
          geo.translate(-c.x, -c.y, -c.z);
          geometries.push(geo);
          const pivot = new T.Group(),
            rolling = new T.Group(),
            mesh = new T.Mesh(geo, child.material);
          pivot.position.copy(c);
          rolling.add(mesh);
          pivot.add(rolling);
          root.add(pivot);
          mesh.castShadow = true;
          wheels.push(rolling);
          if (index >= 2) frontWheels.push(pivot);
        });
        source.dispose();
        child.visible = false;
      }
    });
    root.add(clone);
    const scale = 4.85 / Math.max(size.x, size.z);
    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    return { root, wheels, frontWheels, materials, geometries };
  }, [scene]);
  useFrame((_, dt) => {
    model.wheels.forEach((w) => {
      w.rotation.x += (car.current.speed * Math.min(dt, 0.1)) / 0.36;
    });
    model.frontWheels.forEach((w) => {
      w.rotation.y = -steering.current * 0.4;
    });
  });
  useEffect(
    () => () => {
      model.materials.forEach((m) => m.dispose());
      model.geometries.forEach((g) => g.dispose());
    },
    [model],
  );
  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={model.root} />
    </group>
  );
}
function Drive({
  car,
  movement,
  paused,
  reset,
  onNear,
  onTelemetry,
  controls,
  dragging,
  immersive,
  reduceMotion,
}: Omit<Props, "onSelect" | "selected" | "night" | "onReady"> & {
  car: MutableRefObject<CarState>;
  controls: MutableRefObject<OrbitControlsImpl | null>;
  dragging: MutableRefObject<boolean>;
}) {
  const steering = useRef(0);
  const contactShadow = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(32, 32, 4, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => contactShadow.dispose(), [contactShadow]);
  const body = useRef<T.Group>(null),
    keys = useRef(new Set<string>()),
    nearRef = useRef<SectionId | null>(null),
    elapsed = useRef(0),
    cameraSettling = useRef(0);
  const { invalidate, camera } = useThree();
  const offset = useMemo(() => new T.Vector3(), []),
    target = useMemo(() => new T.Vector3(), []),
    wanted = useMemo(() => new T.Vector3(), []);
  useEffect(() => {
    movement.current.invalidate = invalidate;
    const held = keys.current;
    const keydown = (e: KeyboardEvent) => {
      if (
        paused ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target instanceof HTMLElement &&
          e.target.closest("input,textarea,select,[contenteditable]"))
      )
        return;
      const key = e.key.toLowerCase();
      if (
        key === " " &&
        e.target instanceof HTMLElement &&
        e.target.closest("button,a")
      )
        return;
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          " ",
        ].includes(key)
      ) {
        e.preventDefault();
        held.add(key);
        invalidate();
      }
    };
    const keyup = (e: KeyboardEvent) => {
      held.delete(e.key.toLowerCase());
      invalidate();
    };
    const clear = () => {
      held.clear();
      movement.current.x = 0;
      movement.current.z = 0;
      movement.current.brake = false;
      car.current.speed = 0;
      invalidate();
    };
    const visibility = () => {
      if (document.hidden) clear();
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
      held.clear();
      movement.current.invalidate = undefined;
    };
  }, [paused, invalidate, movement, car]);
  useEffect(() => {
    car.current = spawnCar();
    cameraSettling.current = 0;
    invalidate();
  }, [reset, car, invalidate]);
  useEffect(() => {
    if (paused) {
      keys.current.clear();
      car.current.speed = 0;
      movement.current.x = 0;
      movement.current.z = 0;
      movement.current.brake = false;
      invalidate();
    }
  }, [paused, car, movement, invalidate]);
  useFrame((_, dt) => {
    const k = keys.current,
      m = movement.current;
    const throttle = paused
      ? 0
      : k.has("w") || k.has("arrowup")
        ? 1
        : k.has("s") || k.has("arrowdown")
          ? -1
          : -m.z;
    const steer = paused
      ? 0
      : k.has("a") || k.has("arrowleft")
        ? -1
        : k.has("d") || k.has("arrowright")
          ? 1
          : m.x;
    const brake = paused || k.has(" ") || !!m.brake;
    steering.current = steer;
    car.current = advanceCar(car.current, { throttle, steer, brake }, dt);
    const state = car.current;
    body.current!.position.set(state.x, 0.09, state.z);
    body.current!.rotation.y = state.yaw;
    const station = stations.reduce<{ id: SectionId | null; distance: number }>(
      (nearest, s) => {
        const d = Math.hypot(s.position[0] - state.x, s.position[2] - state.z);
        return d < nearest.distance ? { id: s.id, distance: d } : nearest;
      },
      { id: null, distance: 13 },
    );
    if (station.id !== nearRef.current) {
      nearRef.current = station.id;
      onNear(station.id);
    }
    elapsed.current += dt;
    if (elapsed.current > 0.1 || Math.abs(state.speed) < 0.01) {
      onTelemetry({ ...state, offroad: !onRoad(state.x, state.z) });
      elapsed.current = 0;
    }
    if (immersive && controls.current) {
      const control = controls.current;
      target.set(state.x, 1.1, state.z);
      const delta = target.clone().sub(control.target);
      camera.position.add(delta);
      control.target.copy(target);
      if (Math.abs(state.speed) > 0.08 && !dragging.current) {
        offset.set(7, 8.5, 14).applyAxisAngle(T.Object3D.DEFAULT_UP, state.yaw);
        wanted.copy(target).add(offset);
        camera.position.lerp(wanted, reduceMotion ? 1 : 1 - Math.exp(-dt * 2));
        cameraSettling.current = 0.9;
      } else if (cameraSettling.current > 0) {
        cameraSettling.current -= dt;
      }
      control.update();
    }
    if (
      throttle ||
      steer ||
      Math.abs(state.speed) > 0.01 ||
      cameraSettling.current > 0
    )
      invalidate();
  }, -0.5);
  return (
    <group ref={body}>
      <BMW car={car} steering={steering} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[2.6, 5.4]} />
        <meshBasicMaterial
          map={contactShadow}
          color="#1b3037"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
function Scene(props: Props) {
  const car = useRef(spawnCar()),
    controls = useRef<OrbitControlsImpl | null>(null);
  const dragging = useRef(false);
  const { size, invalidate } = useThree();
  const perspective = useRef<T.PerspectiveCamera>(null),
    overview = useRef<T.OrthographicCamera>(null);
  useEffect(() => {
    const c = props.immersive ? perspective.current : overview.current;
    if (!c) return;
    if (props.immersive) {
      const p = car.current;
      c.position.set(p.x + 11, 10, p.z - 15);
      c.lookAt(p.x, 1, p.z);
      if (controls.current) {
        controls.current.target.set(p.x, 1, p.z);
        controls.current.update();
      }
    } else {
      c.position.set(84, 105, 100);
      c.lookAt(0, 0, 0);
      if (controls.current) {
        controls.current.target.set(0, 0, 0);
        controls.current.update();
      }
    }
    invalidate();
  }, [props.immersive, props.reset, invalidate]);
  useEffect(() => {
    props.onReady();
  }, [props.onReady]);
  return (
    <>
      <color attach="background" args={[props.night ? "#203a4b" : "#c5dfe0"]} />
      <fog
        attach="fog"
        args={[props.night ? "#203a4b" : "#c5dfe0", 110, 310]}
      />
      <PerspectiveCamera
        ref={perspective}
        makeDefault={props.immersive}
        fov={45}
        near={0.1}
        far={600}
        position={[-11, 10, -46]}
      />
      <OrthographicCamera
        ref={overview}
        makeDefault={!props.immersive}
        position={[84, 105, 100]}
        zoom={Math.min(size.width / 165, size.height / 145)}
        near={0.1}
        far={600}
      />
      <ambientLight intensity={props.night ? 0.55 : 1.15} />
      <hemisphereLight
        args={["#e7f5ff", "#8f986b", props.night ? 0.65 : 1.1]}
      />
      <directionalLight
        position={[-35, 65, -25]}
        intensity={props.night ? 1.25 : 3.2}
        color={props.night ? "#9bbcd9" : "#ffefd4"}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={65}
        shadow-camera-bottom={-65}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.00015}
        shadow-normalBias={0.04}
        shadow-radius={3}
      />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.5}
          color="#f8fcff"
          position={[0, 15, -10]}
          scale={[20, 10, 1]}
          rotation={[-Math.PI / 3, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="#d0e8ed"
          position={[-15, 5, 0]}
          scale={[10, 10, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />
      </Environment>
      <Landscape night={props.night} />
      {stations.map((s) => (
        <Html
          key={s.id}
          position={s.position}
          center
          distanceFactor={props.immersive ? 16 : undefined}
          zIndexRange={[15, 1]}
          style={{ pointerEvents: props.paused ? "none" : "auto" }}
        >
          <button
            className={`map-marker ${props.selected === s.id ? "active" : ""}`}
            aria-label={`Explore ${s.number} ${s.title}`}
            onClick={() => props.onSelect(s.id)}
          >
            <span className="sr-only">Explore </span>
            <span className="marker-number">{s.number} </span>
            <span className="marker-name">{s.title}</span>
            <ArrowUpRightIcon size={14} />
          </button>
        </Html>
      ))}
      <Drive {...props} car={car} controls={controls} dragging={dragging} />
      <OrbitControls
        ref={controls}
        makeDefault
        onStart={() => {
          dragging.current = true;
        }}
        onEnd={() => {
          dragging.current = false;
        }}
        enablePan={false}
        enabled={!props.paused}
        minDistance={9}
        maxDistance={42}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.15}
        minZoom={2}
        maxZoom={14}
        enableDamping
        dampingFactor={0.1}
        target={props.immersive ? [-22, 1, -31] : [0, 0, 0]}
      />
    </>
  );
}
export default memo(function DrivingWorld(props: Props) {
  return (
    <Canvas
      shadows="percentage"
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = T.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
});
