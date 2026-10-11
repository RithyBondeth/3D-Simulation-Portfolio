import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  ContactShadows,
  Html,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  stations,
  type SectionId,
  type Vec3,
  type MovementInput,
} from "../types";
import { advancePlayer } from "../lib/studio-navigation";

type StudioProps = {
  selected: SectionId | null;
  onSelect: (id: SectionId) => void;
  onReady: () => void;
  onNear: (id: SectionId | null) => void;
  night: boolean;
  muted: boolean;
  reduceMotion: boolean;
  paused: boolean;
  reset: number;
  movement: MutableRefObject<MovementInput>;
  immersive: boolean;
};

const palette = {
  wood: "#b88d68",
  edge: "#333b3c",
  wall: "#444c4c",
  sage: "#a0ad90",
  coral: "#ee906f",
  ink: "#1e2923",
  light: "#dcded0",
  metal: "#424b43",
};

function Box({
  at = [0, 0, 0],
  size,
  color,
  round = 0,
  rotation,
  children,
  castShadow = true,
  receiveShadow = true,
}: {
  at?: Vec3;
  size: Vec3;
  color: string;
  round?: number;
  rotation?: Vec3;
  children?: ReactNode;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const rounded = useMemo(
    () =>
      round
        ? new RoundedBoxGeometry(size[0], size[1], size[2], 2, round)
        : null,
    [round, size[0], size[1], size[2]],
  );
  useEffect(
    () => () => {
      rounded?.dispose();
    },
    [rounded],
  );
  return (
    <mesh
      position={at}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      {rounded ? (
        <primitive object={rounded} attach="geometry" />
      ) : (
        <boxGeometry args={size} />
      )}
      <meshStandardMaterial color={color} roughness={0.85} />
      {children}
    </mesh>
  );
}

function Cylinder({
  at,
  radius,
  height,
  color,
  radiusTop,
  rotation,
}: {
  at: Vec3;
  radius: number;
  radiusTop?: number;
  height: number;
  color: string;
  rotation?: Vec3;
}) {
  return (
    <mesh position={at} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radiusTop ?? radius, radius, height, 24]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
}

function Sphere({
  at,
  size = 0.3,
  color,
  scale,
}: {
  at: Vec3;
  size?: number;
  color: string;
  scale?: Vec3;
}) {
  return (
    <mesh position={at} scale={scale} castShadow>
      <sphereGeometry args={[size, 18, 14]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function Plant({
  at,
  scale = 1,
  pot = "#e4d4c1",
}: {
  at: Vec3;
  scale?: number;
  pot?: string;
}) {
  return (
    <group position={at} scale={scale}>
      <Cylinder
        at={[0, 0.25, 0]}
        radius={0.32}
        radiusTop={0.39}
        height={0.5}
        color={pot}
      />
      <Cylinder
        at={[0, 0.51, 0]}
        radius={0.33}
        height={0.025}
        color="#655b44"
      />
      <Cylinder at={[0, 0.95, 0]} radius={0.04} height={0.9} color="#8c7952" />
      {Array.from({ length: 8 }, (_, i) => (
        <group
          key={i}
          rotation={[0, i * 2.4, (i % 2 ? 1 : -1) * 0.15]}
          position={[0, 0.8 + (i % 4) * 0.2, 0]}
        >
          <mesh
            position={[0.23, 0.12, 0]}
            rotation={[0, 0, -0.7]}
            scale={[1, 0.4, 0.5]}
            castShadow
          >
            <sphereGeometry args={[0.34, 12, 10]} />
            <meshStandardMaterial color={i % 2 ? "#66815a" : "#87966e"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Picture({
  at,
  image,
  width = 1,
  height = 1,
  rotation = [0, 0, 0],
}: {
  at: Vec3;
  image: string;
  width?: number;
  height?: number;
  rotation?: Vec3;
}) {
  const texture = useTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <group position={at} rotation={rotation}>
      <Box
        at={[0, 0, -0.025]}
        size={[width + 0.12, height + 0.12, 0.08]}
        color={palette.edge}
      />
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

function Monitor({
  at,
  image,
  rotation = [0, 0, 0],
  width = 1.45,
}: {
  at: Vec3;
  image: string;
  rotation?: Vec3;
  width?: number;
}) {
  const texture = useTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <group position={at} rotation={rotation}>
      <Box
        at={[0, 0.03, 0]}
        size={[0.54, 0.06, 0.35]}
        color={palette.metal}
        round={0.02}
      />
      <Box
        at={[0, 0.3, -0.03]}
        size={[0.08, 0.5, 0.07]}
        color={palette.metal}
      />
      <Box
        at={[0, 0.69, 0]}
        size={[width, 0.94, 0.09]}
        color="#38433f"
        round={0.04}
      />
      <mesh position={[0, 0.71, 0.049]}>
        <planeGeometry args={[width - 0.09, 0.8]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <Sphere at={[0, 0.25, 0.052]} size={0.015} color={palette.light} />
    </group>
  );
}

function Interactive({
  id,
  onSelect,
  children,
}: {
  id: SectionId;
  onSelect: StudioProps["onSelect"];
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <group
      scale={hovered && id !== "experience" ? 1.012 : 1}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      {children}
    </group>
  );
}

function Workstation({ onSelect }: { onSelect: StudioProps["onSelect"] }) {
  return (
    <group position={[-2.45, 0, -2.35]}>
      <Interactive id="projects" onSelect={onSelect}>
        <Box
          at={[0, 1.04, 0]}
          size={[3.55, 0.16, 1.25]}
          color={palette.wood}
          round={0.06}
        />
        {[-1.5, 1.5].map((x) => (
          <Box
            key={x}
            at={[x, 0.5, 0]}
            size={[0.09, 1.02, 0.9]}
            color={palette.light}
          />
        ))}
        <Monitor
          at={[-0.75, 1.12, -0.25]}
          image="/images/apsara-talent.webp"
          rotation={[0, 0.12, 0]}
        />
        <Monitor
          at={[0.79, 1.12, -0.25]}
          image="/images/apsara-agentic.webp"
          rotation={[0, -0.12, 0]}
        />
        <Box
          at={[-0.2, 1.14, 0.35]}
          size={[1.1, 0.055, 0.38]}
          color="#26342d"
          round={0.02}
        />
        {Array.from({ length: 12 }, (_, i) => (
          <Box
            key={i}
            at={[
              -0.68 + (i % 6) * 0.19,
              1.172,
              0.24 + Math.floor(i / 6) * 0.17,
            ]}
            size={[0.13, 0.02, 0.1]}
            color={i === 0 || i === 5 ? palette.coral : "#70816d"}
          />
        ))}
        <Box
          at={[0.73, 1.14, 0.35]}
          size={[0.45, 0.02, 0.48]}
          color={palette.sage}
          round={0.02}
        />
        <Sphere
          at={[0.74, 1.18, 0.34]}
          size={0.12}
          scale={[0.8, 0.45, 1]}
          color={palette.light}
        />
        <Cylinder
          at={[1.48, 1.28, 0.28]}
          radius={0.12}
          height={0.28}
          color={palette.coral}
        />
        <Cylinder
          at={[1.48, 1.424, 0.28]}
          radius={0.09}
          height={0.01}
          color="#604f3e"
        />
        <Box
          at={[-1.44, 1.45, -0.35]}
          size={[0.25, 0.64, 0.28]}
          color={palette.ink}
          round={0.03}
        />
      </Interactive>
      <mesh position={[0, 1.01, 0.61]}>
        <boxGeometry args={[3.38, 0.025, 0.015]} />
        <meshStandardMaterial
          color={palette.coral}
          emissive={palette.coral}
          emissiveIntensity={1.7}
        />
      </mesh>
      <group position={[0, 0, 1.1]} rotation={[0, -0.2, 0]}>
        <Cylinder
          at={[0, 0.22, 0]}
          radius={0.04}
          height={0.45}
          color={palette.metal}
        />
        {Array.from({ length: 5 }, (_, i) => (
          <group key={i} rotation={[0, i * Math.PI * 0.4, 0]}>
            <Box
              at={[0, 0.12, 0.23]}
              size={[0.06, 0.07, 0.55]}
              color={palette.metal}
            />
            <Sphere at={[0, 0.08, 0.48]} size={0.07} color={palette.ink} />
          </group>
        ))}
        <Box
          at={[0, 0.58, 0]}
          size={[0.75, 0.18, 0.7]}
          color={palette.coral}
          round={0.08}
        />
        <Box
          at={[0, 1, 0.3]}
          size={[0.75, 0.75, 0.14]}
          color={palette.coral}
          round={0.08}
          rotation={[0.12, 0, 0]}
        />
        {[-0.45, 0.45].map((x) => (
          <Box
            key={x}
            at={[x, 0.8, 0]}
            size={[0.1, 0.1, 0.65]}
            color={palette.ink}
            round={0.03}
          />
        ))}
      </group>
    </group>
  );
}

function Bookshelf({ onSelect }: { onSelect: StudioProps["onSelect"] }) {
  const colors = [
    "#cf7659",
    "#cccdb8",
    "#76886a",
    "#ba9a68",
    "#4c6150",
    "#95877a",
  ];
  return (
    <group position={[2.45, 0, -3.42]}>
      <Interactive id="skills" onSelect={onSelect}>
        <Box at={[0, 1.45, 0]} size={[3.2, 2.9, 0.4]} color="#344034" />
        <Box at={[0, 1.46, 0.22]} size={[3.02, 2.72, 0.055]} color="#303b31" />
        {[-1.54, -0.52, 0.52, 1.54].map((x) => (
          <Box
            key={x}
            at={[x, 1.48, 0.31]}
            size={[0.08, 2.9, 0.52]}
            color="#53624b"
          />
        ))}
        {[0.1, 1.02, 1.96, 2.88].map((y) => (
          <Box
            key={y}
            at={[0, y, 0.31]}
            size={[3.2, 0.08, 0.56]}
            color="#53624b"
          />
        ))}
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <group
              key={`${row}-${col}`}
              position={[-1.38 + col * 1.04, 0.18 + row * 0.94, 0.34]}
            >
              {Array.from(
                { length: col === 2 && row === 2 ? 0 : 4 },
                (_, i) => (
                  <Box
                    key={i}
                    at={[0.13 + i * 0.19, 0.27 + (i % 2) * 0.04, 0]}
                    size={[0.14, 0.52 + (i % 2) * 0.08, 0.29]}
                    color={colors[(i + col * 2 + row) % colors.length]}
                    rotation={[0, 0, i === 3 ? -0.14 : 0]}
                  />
                ),
              )}
            </group>
          )),
        )}
        <Plant at={[1.05, 2.02, 0.37]} scale={0.5} pot={palette.light} />
        <Box
          at={[-0.95, 3.01, 0]}
          size={[0.7, 0.2, 0.4]}
          color={palette.light}
          round={0.01}
        />
        <Box
          at={[-0.96, 3.17, 0]}
          size={[0.6, 0.12, 0.35]}
          color={palette.sage}
          round={0.01}
        />
      </Interactive>
      {[1.02, 1.96, 2.88].map((y) => (
        <mesh key={y} position={[0, y - 0.045, 0.59]}>
          <boxGeometry args={[3.02, 0.014, 0.018]} />
          <meshStandardMaterial
            color="#e9a581"
            emissive="#e9a581"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function Robot({ at = [0, 0, 0], scale = 1 }: { at?: Vec3; scale?: number }) {
  return (
    <group position={at} scale={scale}>
      <Box
        at={[0, 0.3, 0]}
        size={[0.54, 0.53, 0.38]}
        color={palette.light}
        round={0.12}
      />
      <Box
        at={[0, 0.88, 0]}
        size={[0.8, 0.6, 0.53]}
        color={palette.light}
        round={0.14}
      />
      <Box
        at={[0, 0.91, 0.274]}
        size={[0.62, 0.33, 0.025]}
        color={palette.ink}
        round={0.08}
      />
      {[-0.17, 0.17].map((x) => (
        <Box
          key={x}
          at={[x, 0.93, 0.292]}
          size={[0.07, 0.12, 0.02]}
          color="#b7c99d"
          round={0.02}
        />
      ))}
      <Cylinder
        at={[0, 1.24, 0]}
        radius={0.025}
        height={0.2}
        color={palette.ink}
      />
      <Sphere at={[0, 1.36, 0]} size={0.07} color={palette.coral} />
      {[-0.39, 0.39].map((x) => (
        <Box
          key={x}
          at={[x, 0.34, 0]}
          size={[0.18, 0.36, 0.18]}
          color={palette.coral}
          round={0.06}
          rotation={[0, 0, x < 0 ? 0.3 : -0.3]}
        />
      ))}
      {[-0.16, 0.16].map((x) => (
        <Box
          key={x}
          at={[x, 0.03, 0.08]}
          size={[0.18, 0.14, 0.3]}
          color={palette.ink}
          round={0.04}
        />
      ))}
      <Sphere at={[0, 0.34, 0.2]} size={0.06} color={palette.coral} />
    </group>
  );
}

function AILab({
  onSelect,
  reduceMotion,
}: {
  onSelect: StudioProps["onSelect"];
  reduceMotion: boolean;
}) {
  const rings = useRef<THREE.Group>(null);
  // The rings turn with the camera and user movement; the scene rests when idle.
  useFrame((_, delta) => {
    if (rings.current && !reduceMotion)
      rings.current.rotation.y += Math.min(delta, 0.05) * 0.23;
  });
  return (
    <group position={[2.8, 0, -0.9]}>
      <Interactive id="labs" onSelect={onSelect}>
        <Cylinder
          at={[0, 0.12, 0]}
          radius={1.03}
          height={0.24}
          color="#344236"
        />
        <Cylinder
          at={[0, 0.62, 0]}
          radius={0.57}
          radiusTop={0.7}
          height={1.05}
          color="#9aa78a"
        />
        <Cylinder
          at={[0, 1.17, 0]}
          radius={0.8}
          height={0.12}
          color={palette.sage}
        />
        <Robot at={[0, 1.25, 0]} scale={0.73} />
        <group ref={rings} position={[0, 1.8, 0]}>
          {[0, Math.PI / 2].map((angle, i) => (
            <mesh key={i} rotation={[0.4, angle, 0.6]}>
              <torusGeometry args={[0.95, 0.018, 6, 64]} />
              <meshStandardMaterial
                color={i ? "#edaa83" : "#c4d4aa"}
                emissive={i ? "#edaa83" : "#c4d4aa"}
                emissiveIntensity={0.6}
                metalness={0.3}
                roughness={0.3}
              />
            </mesh>
          ))}
          <Sphere at={[0.95, 0, 0]} size={0.07} color={palette.coral} />
        </group>
      </Interactive>
    </group>
  );
}

function Lounge({ onSelect }: { onSelect: StudioProps["onSelect"] }) {
  return (
    <group position={[2.4, 0, 2.25]}>
      <Interactive id="about" onSelect={onSelect}>
        <Box
          at={[0, 0.035, 0]}
          size={[4.15, 0.04, 2.7]}
          color="#727b65"
          round={0.2}
        />
        {Array.from({ length: 12 }, (_, i) => (
          <Box
            key={i}
            at={[-1.85 + i * 0.34, 0.06, 0]}
            size={[0.012, 0.005, 2.4]}
            color="#929c80"
          />
        ))}
        <group position={[0.55, 0, -0.45]} rotation={[0, -Math.PI / 2, 0]}>
          <Box
            at={[0, 0.35, 0]}
            size={[2.3, 0.5, 0.95]}
            color={palette.sage}
            round={0.12}
          />
          <Box
            at={[0, 0.83, -0.38]}
            size={[2.3, 0.8, 0.22]}
            color={palette.sage}
            round={0.1}
          />
          {[-1.06, 1.06].map((x) => (
            <Box
              key={x}
              at={[x, 0.64, 0]}
              size={[0.24, 0.65, 1]}
              color={palette.sage}
              round={0.1}
            />
          ))}
          {[-0.48, 0.48].map((x) => (
            <Box
              key={x}
              at={[x, 0.64, 0.04]}
              size={[0.88, 0.18, 0.69]}
              color="#aebb9a"
              round={0.08}
            />
          ))}
          <Box
            at={[-0.68, 0.9, -0.2]}
            size={[0.46, 0.46, 0.15]}
            color="#eddcc1"
            round={0.07}
            rotation={[0, 0, -0.2]}
          />
          <Box
            at={[0.66, 0.9, -0.2]}
            size={[0.46, 0.46, 0.15]}
            color={palette.coral}
            round={0.07}
            rotation={[0, 0, 0.2]}
          />
        </group>
        <Cylinder
          at={[-0.75, 0.45, 0.1]}
          radius={0.67}
          height={0.1}
          color={palette.wood}
        />
        {Array.from({ length: 3 }, (_, i) => (
          <group
            key={i}
            rotation={[0, i * 2.1, 0]}
            position={[-0.75, 0.24, 0.1]}
          >
            <Box
              at={[0.28, 0, 0]}
              size={[0.055, 0.43, 0.055]}
              color={palette.edge}
              rotation={[0, 0, -0.2]}
            />
          </group>
        ))}
        <Box
          at={[-0.9, 0.53, 0.15]}
          size={[0.43, 0.06, 0.31]}
          color={palette.coral}
          rotation={[0, 0.2, 0]}
        />
        <Cylinder
          at={[-0.48, 0.6, 0]}
          radius={0.09}
          height={0.2}
          color={palette.light}
        />
      </Interactive>
      <Plant at={[1.8, 0.05, 0.55]} scale={1.1} />
      <group position={[1.55, 0, -1.65]}>
        <Cylinder
          at={[0, 0.08, 0]}
          radius={0.33}
          height={0.1}
          color={palette.ink}
        />
        <Cylinder
          at={[0, 1.05, 0]}
          radius={0.025}
          height={2}
          color={palette.ink}
        />
        <Cylinder
          at={[0, 2.04, 0]}
          radius={0.45}
          radiusTop={0.2}
          height={0.45}
          color="#e8caa3"
        />
      </group>
    </group>
  );
}

function StudioWindow({ night }: { night: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext("2d")!;
    const sky = ctx.createLinearGradient(0, 0, 0, 640);
    sky.addColorStop(0, night ? "#233c3d" : "#9cbfba");
    sky.addColorStop(0.62, night ? "#b48268" : "#efc29c");
    sky.addColorStop(1, night ? "#d3a081" : "#f1d8b0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1024, 640);
    ctx.fillStyle = night ? "#f6ddb2" : "#fae4b5";
    ctx.beginPath();
    ctx.arc(740, 185, 64, 0, Math.PI * 2);
    ctx.fill();
    // A quiet, deterministic skyline, painted only when the lighting changes.
    for (let i = 0; i < 24; i++) {
      const height = 75 + ((i * 47) % 135);
      ctx.fillStyle = i % 2 ? "#4d5f50" : "#5a6b59";
      ctx.fillRect(i * 46 - 20, 640 - height, 42, height);
      if (night) {
        ctx.fillStyle = "#d9b18b";
        for (let row = 0; row < 4; row++) {
          if ((row + i) % 3 !== 0)
            ctx.fillRect(i * 46 - 9, 655 - height + row * 29, 5, 9);
        }
      }
    }
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, [night]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group position={[-2.5, 2.3, -3.84]}>
      <Box size={[3.3, 2.02, 0.14]} color="#24382e" round={0.035} />
      <mesh position={[0, 0, 0.081]}>
        <planeGeometry args={[3.12, 1.85]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {[-1.52, -0.5, 0.5, 1.52].map((x) => (
        <Box
          key={x}
          at={[x, 0, 0.13]}
          size={[0.047, 1.9, 0.08]}
          color="#344b39"
        />
      ))}
      <Box at={[0, -0.14, 0.13]} size={[3.12, 0.045, 0.08]} color="#344b39" />
      <Box
        at={[0, -1.02, 0.19]}
        size={[3.42, 0.1, 0.38]}
        color={palette.wood}
        round={0.02}
      />
      <mesh position={[0, 1.03, 0.06]}>
        <boxGeometry args={[3.3, 0.02, 0.03]} />
        <meshBasicMaterial color="#efae84" toneMapped={false} />
      </mesh>
      <Plant at={[-1.12, -0.96, 0.2]} scale={0.34} />
    </group>
  );
}

function StudioDetails() {
  return (
    <>
      {/* Architectural trim, acoustic slats and a ceiling rail anchor the room. */}
      <Box at={[0, 3.47, -4]} size={[10.24, 0.1, 0.24]} color="#25382b" />
      <Box at={[-5, 3.47, 0]} size={[0.24, 0.1, 8.24]} color="#25382b" />
      {Array.from({ length: 23 }, (_, i) => (
        <Box
          key={i}
          at={[-4.9, 1.76, -3.83 + i * 0.34]}
          size={[0.035, 3.25, 0.045]}
          color="#334631"
        />
      ))}
      <group position={[-0.25, 0, -3.42]}>
        <Box
          at={[0, 0.52, 0]}
          size={[0.65, 1.04, 0.62]}
          color="#22352a"
          round={0.06}
        />
        <Box
          at={[0, 0.52, 0.32]}
          size={[0.53, 0.86, 0.02]}
          color="#40523c"
          round={0.02}
        />
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, 0.28 + i * 0.24, 0.34]}>
            <Box size={[0.4, 0.14, 0.03]} color="#25372b" round={0.01} />
            <mesh position={[-0.14, 0, 0.025]}>
              <boxGeometry args={[0.025, 0.025, 0.01]} />
              <meshBasicMaterial color={palette.coral} toneMapped={false} />
            </mesh>
          </group>
        ))}
        <Plant at={[0, 1.04, 0]} scale={0.4} pot={palette.coral} />
      </group>
      <group position={[0.55, 3.2, -2.4]}>
        <Box at={[0, 0.2, 0]} size={[2, 0.055, 0.06]} color="#25382b" />
        {[-0.65, 0.65].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Cylinder
              at={[0, -0.16, 0]}
              radius={0.012}
              height={0.68}
              color="#314032"
            />
            <mesh position={[0, -0.52, 0]} castShadow>
              <coneGeometry args={[0.27, 0.27, 32, 1, true]} />
              <meshStandardMaterial color="#2e3b2f" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -0.63, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.23, 24]} />
              <meshBasicMaterial color="#f9c399" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Recessed light follows the front edge of the floating plinth. */}
      <mesh position={[0, -0.21, 4.145]}>
        <boxGeometry args={[9.9, 0.018, 0.012]} />
        <meshBasicMaterial color="#eeb28d" toneMapped={false} />
      </mesh>
      <mesh position={[5.145, -0.21, 0]}>
        <boxGeometry args={[0.012, 0.018, 7.9]} />
        <meshBasicMaterial color="#eeb28d" toneMapped={false} />
      </mesh>
    </>
  );
}

function Room({
  onSelect,
  reduceMotion,
  night,
}: Pick<StudioProps, "onSelect" | "reduceMotion" | "night">) {
  return (
    <group>
      <Box
        at={[0, -0.26, 0]}
        size={[10.25, 0.42, 8.25]}
        color={palette.edge}
        round={0.12}
      />
      <Box at={[0, -0.04, 0]} size={[10, 0.08, 8]} color="#666e68" />
      {Array.from({ length: 20 }, (_, i) => (
        <Box
          key={i}
          at={[-4.75 + i * 0.5, 0.006, 0]}
          size={[0.492, 0.015, 7.98]}
          color={i % 3 === 0 ? "#69716b" : i % 3 === 1 ? "#6d756f" : "#666e68"}
        />
      ))}
      <Box
        at={[0, 1.72, -4.02]}
        size={[10.15, 3.45, 0.16]}
        color={night ? palette.wall : "#829086"}
      />
      <Box
        at={[-5.02, 1.72, 0]}
        size={[0.16, 3.45, 8.15]}
        color={night ? "#495252" : "#7f8d81"}
      />
      <Box at={[0, 0.13, -3.91]} size={[9.97, 0.23, 0.07]} color="#3c4b35" />
      <Box at={[-4.91, 0.13, 0]} size={[0.07, 0.23, 7.97]} color="#3c4b35" />
      <StudioWindow night={night} />
      <StudioDetails />
      <Interactive id="experience" onSelect={onSelect}>
        <Picture
          at={[-4.8, 2.2, 0.15]}
          image="/images/studio-art.webp"
          width={1.55}
          height={1.55}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Picture
          at={[-4.8, 2.35, 1.85]}
          image="/images/bondeth.webp"
          width={0.85}
          height={1.1}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Box
          at={[-4.48, 0.64, 1.2]}
          size={[0.7, 1.28, 2.7]}
          color={palette.wood}
          round={0.03}
        />
        {[-0.75, 0.25, 1.25].map((z) => (
          <Box
            key={z}
            at={[-4.1, 0.65, z + 1]}
            size={[0.03, 1.05, 0.92]}
            color="#c09b74"
          />
        ))}
        <Plant at={[-4.42, 1.3, 1.95]} scale={0.65} pot={palette.coral} />
        <Box
          at={[-4.45, 1.38, 0.4]}
          size={[0.4, 0.16, 0.6]}
          color={palette.light}
        />
        <Box
          at={[-4.45, 1.52, 0.4]}
          size={[0.36, 0.12, 0.57]}
          color={palette.sage}
          rotation={[0, 0.15, 0]}
        />
      </Interactive>
      <Workstation onSelect={onSelect} />
      <Bookshelf onSelect={onSelect} />
      <AILab onSelect={onSelect} reduceMotion={reduceMotion} />
      <Lounge onSelect={onSelect} />
      <Plant at={[-4.2, 0, -3.25]} scale={1.15} pot={palette.light} />
      <Box
        at={[-1.95, 0.03, 2.65]}
        size={[2.1, 0.035, 1.3]}
        color="#c1c8b0"
        round={0.08}
      />
      {Array.from({ length: 8 }, (_, i) => (
        <Box
          key={i}
          at={[-2.8 + i * 0.25, 0.055, 2.65]}
          size={[0.04, 0.01, 1.2]}
          color="#e3e4d2"
        />
      ))}
      <Cylinder
        at={[-4.6, 0.5, -0.5]}
        radius={0.24}
        height={0.65}
        color={palette.light}
      />
    </group>
  );
}

function Avatar({
  movement,
  reset,
  onNear,
  selected,
  reduceMotion,
  position,
}: Pick<
  StudioProps,
  "movement" | "reset" | "onNear" | "selected" | "reduceMotion"
> & { position: MutableRefObject<THREE.Vector3> }) {
  const invalidate = useThree((s) => s.invalidate);
  const body = useRef<THREE.Group>(null);
  const figure = useRef<THREE.Group>(null);
  const arms = useRef<(THREE.Group | null)[]>([]);
  const legs = useRef<(THREE.Group | null)[]>([]);
  const keys = useRef(new Set<string>());
  const near = useRef<SectionId | null>(null);
  const moving = useRef(false);
  useEffect(() => {
    const press = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest("input,textarea,select,[contenteditable]") ||
          e.ctrlKey ||
          e.metaKey ||
          e.altKey)
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
        ].includes(e.key.toLowerCase())
      ) {
        if (!selected && !(e.target instanceof HTMLButtonElement))
          e.preventDefault();
        keys.current.add(e.key.toLowerCase());
        invalidate();
      }
    };
    const release = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
      invalidate();
    };
    const clear = () => {
      keys.current.clear();
      invalidate();
    };
    window.addEventListener("keydown", press);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", press);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", clear);
    };
  }, [selected, invalidate]);
  useEffect(() => {
    movement.current.invalidate = invalidate;
    return () => {
      delete movement.current.invalidate;
    };
  }, [movement, invalidate]);
  useEffect(() => {
    position.current.set(-1.7, 0.03, 1.5);
    if (body.current) body.current.rotation.y = 0.4;
  }, [reset]);
  useFrame((state, delta) => {
    if (!body.current || !figure.current) return;
    const k = keys.current;
    // Screen-relative directions in the default isometric camera.
    const horizontal =
      (k.has("d") || k.has("arrowright") ? 1 : 0) -
      (k.has("a") || k.has("arrowleft") ? 1 : 0) +
      movement.current.x;
    const vertical =
      (k.has("s") || k.has("arrowdown") ? 1 : 0) -
      (k.has("w") || k.has("arrowup") ? 1 : 0) +
      movement.current.z;
    const dx = horizontal + vertical,
      dz = -horizontal + vertical;
    const length = Math.hypot(dx, dz);
    moving.current = length > 0 && !selected;
    if (moving.current) {
      const next = advancePlayer(
        position.current,
        { x: horizontal, z: vertical },
        delta,
      );
      position.current.x = next.x;
      position.current.z = next.z;
      body.current.rotation.y = Math.atan2(dx, dz);
      invalidate();
    }
    body.current.position.copy(position.current);
    figure.current.position.y =
      moving.current && !reduceMotion
        ? Math.sin(state.clock.elapsedTime * 15) * 0.045
        : 0;
    const stride =
      moving.current && !reduceMotion
        ? Math.sin(state.clock.elapsedTime * 11) * 0.42
        : 0;
    arms.current.forEach((arm, i) => {
      if (arm) arm.rotation.x = stride * (i ? -1 : 1);
    });
    legs.current.forEach((leg, i) => {
      if (leg) leg.rotation.x = stride * (i ? 1 : -1);
    });
    const nearest = stations
      .map((s) => ({
        id: s.id,
        distance: Math.hypot(
          position.current.x - s.position[0],
          position.current.z - s.position[2],
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0];
    const next = nearest.distance < 2 ? nearest.id : null;
    if (next !== near.current) {
      near.current = next;
      onNear(next);
    }
  });
  return (
    <group ref={body} name="player">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0.34, 0.38, 32]} />
        <meshBasicMaterial color={palette.coral} transparent opacity={0.8} />
      </mesh>
      <group ref={figure}>
        <Box
          at={[0, 0.47, 0]}
          size={[0.44, 0.48, 0.3]}
          color={palette.coral}
          round={0.09}
        />
        <Sphere at={[0, 0.91, 0]} size={0.24} color="#d8b18f" />
        <Sphere
          at={[0, 1.03, -0.02]}
          size={0.25}
          scale={[1.03, 0.65, 1]}
          color="#34423a"
        />
        <Box
          at={[0, 0.99, -0.19]}
          size={[0.42, 0.16, 0.15]}
          color="#34423a"
          round={0.04}
        />
        <mesh position={[0, 1.02, 0]}>
          <torusGeometry args={[0.27, 0.028, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#202c23" />
        </mesh>
        {[-0.25, 0.25].map((x) => (
          <Sphere
            key={x}
            at={[x, 0.93, 0]}
            size={0.075}
            color={palette.light}
            scale={[0.5, 1, 1]}
          />
        ))}
        {[-0.09, 0.09].map((x) => (
          <Sphere
            key={x}
            at={[x, 0.92, 0.216]}
            size={0.027}
            color={palette.ink}
          />
        ))}
        {[-0.13, 0.13].map((x, i) => (
          <group
            key={x}
            position={[x, 0.32, 0]}
            ref={(node) => {
              legs.current[i] = node;
            }}
          >
            <Box
              at={[0, -0.15, 0]}
              size={[0.17, 0.3, 0.2]}
              color={palette.ink}
              round={0.025}
            />
            <Box
              at={[0, -0.265, 0.06]}
              size={[0.19, 0.1, 0.31]}
              color={palette.light}
              round={0.03}
            />
          </group>
        ))}
        {[-0.3, 0.3].map((x, i) => (
          <group
            key={x}
            position={[x, 0.66, 0]}
            ref={(node) => {
              arms.current[i] = node;
            }}
          >
            <Box
              at={[0, -0.2, 0]}
              size={[0.14, 0.34, 0.17]}
              color={palette.coral}
              round={0.05}
              rotation={[0, 0, x < 0 ? 0.15 : -0.15]}
            />
            <Sphere at={[0, -0.39, 0]} size={0.079} color="#d8b18f" />
          </group>
        ))}
      </group>
      <Html center position={[0, 1.55, 0]} zIndexRange={[7, 0]}>
        <span className="player-name">
          that's you <span>↓</span>
        </span>
      </Html>
    </group>
  );
}

function CameraRig({
  selected,
  reset,
  reduceMotion,
  immersive,
  playerPosition,
}: Pick<StudioProps, "selected" | "reset" | "reduceMotion" | "immersive"> & {
  playerPosition: MutableRefObject<THREE.Vector3>;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size, invalidate } = useThree();
  const destination = useRef(new THREE.Vector3(0, 0.8, 0));
  const moving = useRef(true);
  const dragging = useRef(false);
  useEffect(() => {
    if (!immersive) return;
    const target = new THREE.Vector3(
      playerPosition.current.x,
      0.85,
      playerPosition.current.z,
    );
    camera.position.copy(target).add(new THREE.Vector3(4.8, 4.8, 6.2));
    controls.current?.target.copy(target);
    controls.current?.update();
    invalidate();
  }, [immersive, reset, camera, invalidate, playerPosition]);
  useEffect(() => {
    if (immersive) return;
    const station = stations.find((s) => s.id === selected);
    destination.current.set(
      station ? station.position[0] * 0.25 : 0,
      0.8,
      station ? station.position[2] * 0.25 : 0,
    );
    moving.current = true;
    if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
      const ortho = camera as THREE.OrthographicCamera;
      ortho.zoom = Math.min(size.width / 14.2, size.height / 9.5);
      ortho.updateProjectionMatrix();
    }
    invalidate();
  }, [selected, reset, camera, size, invalidate, immersive]);
  useFrame((_, delta) => {
    if (
      (!moving.current && !immersive) ||
      !controls.current ||
      dragging.current
    )
      return;
    const alpha = reduceMotion ? 1 : 1 - Math.exp(-delta * 5);
    if (immersive) {
      const shift = new THREE.Vector3(
        playerPosition.current.x,
        0.85,
        playerPosition.current.z,
      ).sub(controls.current.target);
      if (shift.length() > 0.002) {
        shift.multiplyScalar(alpha);
        camera.position.add(shift);
        controls.current.target.add(shift);
        controls.current.update();
        invalidate();
      }
      return;
    }
    controls.current.target.lerp(destination.current, alpha);
    const cameraDestination = new THREE.Vector3(12, 10.5, 14).add(
      destination.current,
    );
    camera.position.lerp(cameraDestination, alpha);
    controls.current.update();
    if (
      camera.position.distanceTo(cameraDestination) < 0.01 &&
      controls.current.target.distanceTo(destination.current) < 0.01
    )
      moving.current = false;
    else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minZoom={22}
      maxZoom={100}
      minDistance={4}
      maxDistance={16}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI / 2.4}
      minAzimuthAngle={-0.65}
      maxAzimuthAngle={1.75}
      enableDamping
      dampingFactor={0.08}
      onStart={() => {
        moving.current = false;
        dragging.current = true;
      }}
      onEnd={() => {
        dragging.current = false;
        invalidate();
      }}
    />
  );
}

function Scene({ onReady, ...props }: StudioProps) {
  const playerPosition = useRef(new THREE.Vector3(-1.7, 0.03, 1.5));
  useEffect(() => {
    onReady();
  }, [onReady]);
  return (
    <>
      {props.immersive ? (
        <PerspectiveCamera
          makeDefault
          fov={48}
          position={[3.1, 5.65, 7.7]}
          near={0.1}
          far={100}
        />
      ) : (
        <OrthographicCamera
          makeDefault
          position={[12, 11.3, 14]}
          zoom={45}
          near={0.1}
          far={100}
        />
      )}
      <ambientLight intensity={props.night ? 0.65 : 1.05} />
      <hemisphereLight args={["#f4efe8", "#687876", props.night ? 0.8 : 1.1]} />
      <directionalLight
        position={[-3, 9, 7]}
        intensity={props.night ? 3.5 : 3.2}
        color="#ffebd9"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={4}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-normalBias={0.04}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[6, 5, -2]}
        intensity={props.night ? 1.8 : 1.3}
        color="#c8dcdd"
      />
      <pointLight
        position={[-2.5, 2.5, -2.9]}
        intensity={props.night ? 24 : 10}
        color="#f3bc8a"
        distance={7}
      />
      {props.night && (
        <pointLight
          position={[4, 2.1, 0.6]}
          intensity={23}
          color="#ffd1a1"
          distance={8}
        />
      )}
      <Room
        onSelect={props.onSelect}
        reduceMotion={props.reduceMotion}
        night={props.night}
      />
      <Avatar
        movement={props.movement}
        reset={props.reset}
        onNear={props.onNear}
        selected={props.paused ? "contact" : props.selected}
        reduceMotion={props.reduceMotion}
        position={playerPosition}
      />
      {stations.map((station) => (
        <Html
          key={station.id}
          position={station.position}
          center
          zIndexRange={[8, 0]}
        >
          <button
            className={`world-label ${station.id === "projects" || station.id === "labs" ? "world-label-primary" : ""} ${props.selected === station.id ? "is-selected" : ""}`}
            onClick={() => props.onSelect(station.id)}
          >
            <span className="sr-only">Explore </span>
            <span className="world-label-dot">
              {station.number}{" "}
            </span>
            <span className="world-label-name">{station.title}</span>
            <ArrowUpRightIcon size={12} />
          </button>
        </Html>
      ))}
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={props.night ? 0.65 : 0.32}
        scale={23}
        blur={2.8}
        far={6}
        resolution={256}
        color="#080f08"
        frames={1}
      />
      <CameraRig
        selected={props.selected}
        reset={props.reset}
        reduceMotion={props.reduceMotion}
        immersive={props.immersive}
        playerPosition={playerPosition}
      />
    </>
  );
}

export default function Studio(props: StudioProps) {
  const gl = useMemo(
    () => ({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance" as const,
    }),
    [],
  );
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.7]}
      camera={{ position: [3.1, 5.65, 7.7], fov: 48, near: 0.1, far: 100 }}
      gl={gl}
      onCreated={({ gl: renderer }) => {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
      }}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
