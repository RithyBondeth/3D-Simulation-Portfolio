import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Html, RoundedBox, useCursor } from "@react-three/drei";
import * as T from "three";
import { districts, type ProjectDistrict } from "../project-catalog";
import type { DistrictId } from "../lib/project-districts";
import { pavilionFootprints } from "../lib/pavilion-layout";
import { useCartoonMotion } from "./CartoonMotion";
import type { SectionId, Vec3 } from "../types";
import IslandAtmosphere from "./IslandAtmosphere";
import IslandDistrict from "./IslandDistrict";
import IslandLandmarks from "./IslandLandmarks";
import PortalArchitecture from "./PortalArchitecture";
import { projectHref } from "../lib/portfolio-route";
import { journeyCarPose } from "../lib/coastal-journey";

const mint = "#92ead0",
  coral = "#ff9c78",
  ink = "#1d3948";

function Block({
  at = [0, 0, 0],
  size,
  color = ink,
  radius = 0.35,
  glow = false,
}: {
  at?: Vec3;
  size: Vec3;
  color?: string;
  radius?: number;
  glow?: boolean;
}) {
  return (
    <RoundedBox
      position={at}
      args={size}
      radius={Math.min(radius, ...size.map((v) => v * 0.45))}
      smoothness={3}
      bevelSegments={2}
      castShadow={!glow}
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={0.64}
        metalness={0.12}
        emissive={glow ? color : "#000000"}
        emissiveIntensity={glow ? 1.4 : 0}
      />
    </RoundedBox>
  );
}

function roundedRect(w: number, d: number, r: number) {
  const s = new T.Shape(),
    x = -w / 2,
    y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function Sign({
  text,
  at,
  width,
  color = mint,
  height = 1.1,
}: {
  text: string;
  at: Vec3;
  width: number;
  color?: string;
  height?: number;
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 160;
    const map = new T.CanvasTexture(c);
    map.colorSpace = T.SRGBColorSpace;
    return map;
  }, []);
  useEffect(() => {
    let active = true;
    const paint = () => {
      if (!active) return;
      const ctx = (texture.image as HTMLCanvasElement).getContext("2d")!;
      ctx.clearRect(0, 0, 1024, 160);
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 86px Ubuntu, sans-serif";
      ctx.fillText(text, 512, 84, 980);
      texture.needsUpdate = true;
    };
    paint();
    // Canvas does not repaint when a web font arrives, unlike DOM text.
    void document.fonts.load("700 86px Ubuntu").then(paint, () => {});
    return () => { active = false; };
  }, [texture, text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={at}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function IslandGround() {
  const geometries = useMemo(() => {
    const shape = roundedRect(114, 108, 13);
    const roadShape = roundedRect(96, 76, 12);
    const hole = roundedRect(82, 62, 5);
    roadShape.holes.push(new T.Path(hole.getPoints(32).reverse()));
    return {
      land: new T.ShapeGeometry(shape, 24),
      base: new T.ExtrudeGeometry(shape, {
        depth: 4.5,
        bevelEnabled: true,
        bevelSize: 1.5,
        bevelThickness: 1,
        bevelSegments: 3,
        steps: 1,
        curveSegments: 24,
      }),
      road: new T.ShapeGeometry(roadShape, 24),
      plaza: new T.ShapeGeometry(roundedRect(72, 54, 3), 16),
      centreline: new T.BufferGeometry().setFromPoints(
        Array.from({ length: 241 }, (_, i) => {
          const pose = journeyCarPose(i / 240);
          return new T.Vector3(pose.x, 0.04, pose.z);
        }),
      ),
    };
  }, []);
  useEffect(
    () => () => Object.values(geometries).forEach((g) => g.dispose()),
    [geometries],
  );
  return (
    <>
      <mesh
        geometry={geometries.base}
        position={[0, -5.6, 4]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#c9b99c" roughness={0.85} />
      </mesh>
      <Block at={[0, -8, 3]} size={[91, 8, 83]} radius={7} color="#acb79c" />
      <Block at={[0, -13, 3]} size={[67, 6, 65]} radius={8} color="#92a58e" />
      <Block at={[0, -17.5, 3]} size={[38, 4, 42]} radius={7} color="#7d9683" />
      <mesh
        geometry={geometries.land}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.035, 4]}
        receiveShadow
      >
        <meshStandardMaterial color="#81bd8d" roughness={0.95} />
      </mesh>
      <mesh
        geometry={geometries.road}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, -4]}
        receiveShadow
      >
        <meshStandardMaterial color="#465e62" roughness={0.78} />
      </mesh>
      <mesh
        geometry={geometries.plaza}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.15, -2]}
        receiveShadow
      >
        <meshStandardMaterial color="#e4d7ad" roughness={0.8} />
      </mesh>
      <Block at={[0, -2.1, 59.55]} size={[80, 0.15, 0.18]} color={mint} glow />
      <Block at={[-58.55, -2.1, 4]} size={[0.18, 0.15, 66]} color={mint} glow />
      <Block at={[58.55, -2.1, 4]} size={[0.18, 0.15, 66]} color={mint} glow />
      <lineLoop
        onUpdate={(line) => line.computeLineDistances()}
        geometry={geometries.centreline}
      >
        <lineDashedMaterial color="#d3dccc" dashSize={1.6} gapSize={2.2} />
      </lineLoop>
      {[-1, 1].map((side) => (
        <Block
          key={side}
          at={[side * 44.5, 0.05, -5]}
          size={[0.1, 0.05, 48]}
          color="#c0d6c1"
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <Block
          key={i}
          at={[-3.2 + i * 0.9, 0.04, 24.4]}
          size={[0.4, 0.03, 4]}
          color="#d9e8d7"
          radius={0.01}
        />
      ))}
      <Sign text="BONDETH WORLD" at={[2, -3.5, 60.1]} width={30} height={2.8} />
    </>
  );
}

function Tower({
  at,
  size,
  color,
  terraces = false,
}: {
  at: Vec3;
  size: Vec3;
  color: string;
  terraces?: boolean;
}) {
  const [w, h, d] = size,
    rows = Math.floor(h / 2.8);
  return (
    <group position={at}>
      <Block size={size} radius={1.1} color={color} />
      {Array.from({ length: rows }, (_, i) => (
        <group key={i} position={[0, -h / 2 + 1.5 + i * 2.7, 0]}>
          <Block
            at={[0, 0, d / 2 + 0.04]}
            size={[w - 1.5, 0.8, 0.12]}
            radius={0.2}
            color="#214d5b"
          />
          <Block
            at={[w / 2 + 0.04, 0, 0]}
            size={[0.12, 0.8, d - 1.5]}
            radius={0.2}
            color="#214d5b"
          />
          {i % 2 === 0 && (
            <Block
              at={[w * 0.27, 0, d / 2 + 0.12]}
              size={[w * 0.2, 0.38, 0.06]}
              color="#f5c5a1"
              glow
            />
          )}
        </group>
      ))}
      <Block
        at={[0, h / 2, 0]}
        size={[w + 0.7, 0.7, d + 0.7]}
        radius={0.5}
        color="#c6e5da"
      />
      <Block
        at={[0, h / 2 + 0.4, 0]}
        size={[w - 1, 0.25, d - 1]}
        color="#548c77"
      />
      <Block
        at={[-w / 2 + 0.5, 0, d / 2 + 0.16]}
        size={[0.13, h - 1.8, 0.12]}
        color={mint}
        glow
      />
      {terraces &&
        [0, 1, 2].map((i) => (
          <group key={i} position={[0, h / 2 + 1.1 + i * 1.2, 0]}>
            <Block
              size={[w - i * 1.7, 0.6, d - i * 1.7]}
              color={color}
              radius={0.25}
            />
          </group>
        ))}
    </group>
  );
}

function DistrictLandmark({
  district,
  projectIndex,
  onProject,
  onDistrict,
  showLabel,
}: {
  district: ProjectDistrict;
  projectIndex: number;
  onProject: (id: string) => void;
  onDistrict: (id: DistrictId) => void;
  showLabel: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [selection, setSelection] = useState<{
    step: number;
    index: number;
  } | null>(null);
  const index =
    selection?.step === projectIndex ? selection.index : projectIndex;
  const project =
    district.projects[
      Math.max(0, Math.min(index, district.projects.length - 1))
    ];
  const sculpture = useRef<T.Group>(null);
  useCursor(hover);
  useCartoonMotion((t) => {
    if (!sculpture.current) return;
    sculpture.current.position.y =
      1.9 + Math.sin(t * 0.8 + district.stop * 5) * 0.2;
    sculpture.current.rotation.y =
      district.id === "mobile" || district.id === "macos"
        ? Math.sin(t * 0.3) * 0.18
        : t * 0.13;
  });
  return (
    <group position={[...district.position]}>
      <Block at={[0, -0.25, 0]} size={[6.5, 0.45, 5]} color="#e7e7cf" />
      <Block at={[0, 0.05, 0]} size={[5.3, 0.14, 4]} color={district.color} />
      <group
        ref={sculpture}
        position={[0, 1.9, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => {
          e.stopPropagation();
          onDistrict(district.id);
        }}
      >
        {district.id === "mobile" ? (
          <group rotation={[0, -0.18, -0.12]}>
            <Block
              size={[2.5, 4.4, 0.48]}
              color={hover ? "#ffe4b6" : "#496476"}
              radius={0.35}
            />
            <Block at={[0, 0, 0.26]} size={[2.13, 3.7, 0.06]} color="#c0d7db" />
            <Block
              at={[0, 1.65, 0.32]}
              size={[0.7, 0.12, 0.04]}
              color="#496476"
            />
            {[0, 1, 2].map((i) => (
              <Block
                key={i}
                at={[-0.55 + i * 0.55, -0.9, 0.33]}
                size={[0.38, 0.38, 0.08]}
                color={["#c78b62", "#70a899", "#ba9cae"][i]}
              />
            ))}
          </group>
        ) : district.id === "macos" ? (
          <group rotation={[0, 0.15, 0]}>
            <Block
              at={[0, 0.4, 0]}
              size={[4.5, 2.9, 0.3]}
              color={hover ? "#ffe4b6" : "#536873"}
            />
            <Block
              at={[0, 0.4, 0.18]}
              size={[4.1, 2.5, 0.07]}
              color="#bfc6d4"
            />
            <Block
              at={[0, 1.57, 0.24]}
              size={[1.3, 0.18, 0.07]}
              color="#536873"
            />
            <Block
              at={[0, -1.05, 0.8]}
              size={[4.8, 0.2, 2.3]}
              color="#d0c4ca"
            />
            <Block
              at={[0, 0.4, 0.24]}
              size={[1.3, 0.7, 0.06]}
              color="#e9d7b4"
            />
          </group>
        ) : (
          <>
            {[0, 1].map((i) => (
              <mesh
                key={i}
                rotation={[(i * Math.PI) / 2, 0, Math.PI / 4]}
                castShadow
              >
                <torusGeometry
                  args={[2.1, 0.25, 8, district.id === "ai" ? 40 : 4]}
                />
                <meshStandardMaterial
                  color={hover ? "#ffe4b6" : district.color}
                  roughness={0.4}
                  metalness={0.25}
                />
              </mesh>
            ))}
            <mesh>
              <icosahedronGeometry args={[0.8, district.id === "ai" ? 1 : 0]} />
              <meshStandardMaterial
                color="#f4deb5"
                emissive="#e9c385"
                emissiveIntensity={0.25}
              />
            </mesh>
          </>
        )}
      </group>
      <Sign
        text={`${district.title.toUpperCase()} / ${district.projects.length} PROJECT${district.projects.length === 1 ? "" : "S"}`}
        at={[0, 0.45, 2.56]}
        width={5.6}
        height={0.6}
        color="#4c655b"
      />
      <Html
        position={[0, district.id === "macos" ? 12.2 : 6.2, 0]}
        center
        zIndexRange={[12, 1]}
        style={{ display: showLabel ? "block" : "none" }}
      >
        <article
          className={`project-landmark district-landmark district-${district.id}`}
          aria-label={`${district.title} district project`}
        >
          <span className="landmark-meta">
            <span className="district-swatch" />
            {district.name}
          </span>
          <a
            className="landmark-project"
            href={projectHref(project.id)}
            aria-label={`Explore ${project.title}`}
          >
            <strong key={project.id}>
              {project.title}
              <span aria-hidden="true">↗</span>
            </strong>
            <span className="district-project-description">
              {project.description}
            </span>
          </a>
          <div className="landmark-pagination">
            <span>
              {index + 1} / {district.projects.length}
            </span>
            <button
              aria-label={`Previous ${district.title} project`}
              disabled={district.projects.length < 2}
              onClick={() =>
                setSelection({
                  step: projectIndex,
                  index:
                    (index - 1 + district.projects.length) %
                    district.projects.length,
                })
              }
            >
              ←
            </button>
            <button
              aria-label={`Next ${district.title} project`}
              disabled={district.projects.length < 2}
              onClick={() =>
                setSelection({
                  step: projectIndex,
                  index: (index + 1) % district.projects.length,
                })
              }
            >
              →
            </button>
            <button
              className="landmark-browse"
              onClick={() => onDistrict(district.id)}
            >
              All {district.title} ↗
            </button>
          </div>
        </article>
      </Html>
    </group>
  );
}

function Architecture({
  onProject,
  onDistrict,
  activeDistrictId,
  projectIndex,
  showProjectLabels,
}: {
  showProjectLabels: boolean;
  onProject: (id: string) => void;
  onDistrict: (id: DistrictId) => void;
  activeDistrictId: DistrictId;
  projectIndex: number;
}) {
  return (
    <>
      {pavilionFootprints.map((b, i) => (
        <group key={i} position={[b.x, 0.2, b.z]}>
          <Block
            at={[0, 0.15, 0]}
            size={[b.w + 0.9, 0.3, b.d + 0.9]}
            color="#b7bda5"
          />
          <Block
            at={[0, b.h / 2, 0]}
            size={[b.w, b.h, b.d]}
            color={["#b3cbb2", "#d6cab0", "#adc5be"][i]}
            radius={0.8}
          />
          <Block
            at={[0, b.h + 0.15, 0]}
            size={[b.w + 1.6, 0.7, b.d + 1.6]}
            color="#eff0d5"
            radius={0.5}
          />
          <Block
            at={[0, b.h - 0.3, b.d / 2 + 0.4]}
            size={[b.w + 1, 0.1, 0.12]}
            color={i === 1 ? coral : mint}
            glow
          />
          {[-1, 1].map((side) => (
            <Block
              key={side}
              at={[side * (b.w / 2 - 0.5), b.h / 2, b.d / 2 + 0.1]}
              size={[0.3, b.h - 0.7, 0.35]}
              color="#87c9bd"
            />
          ))}
        </group>
      ))}
      {districts.map((district) => (
        <DistrictLandmark
          key={district.id}
          district={district}
          projectIndex={activeDistrictId === district.id ? projectIndex : 0}
          showLabel={showProjectLabels && activeDistrictId === district.id}
          onProject={onProject}
          onDistrict={onDistrict}
        />
      ))}
      <Tower at={[-25, 10.5, -11]} size={[9, 9, 12]} color="#3cbaa3" terraces />
      <Tower at={[-23, 8, 1]} size={[8, 4, 10]} color="#edc16f" />
      <Tower at={[-7, 15.3, -20]} size={[11, 16, 8]} color="#62bfc8" terraces />
      <Tower at={[7, 11.8, -20]} size={[11, 9, 8]} color="#829fd4" />
      <group position={[24, 11, -11]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[4.4, 5.2, 10, 32]} />
          <meshStandardMaterial
            color="#e48869"
            roughness={0.65}
            metalness={0.12}
          />
        </mesh>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, -3 + i * 3, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[4.9 - i * 0.15, 0.19, 8, 40]} />
              <meshStandardMaterial color="#f3c898" roughness={0.5} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 5.4, 0]}>
          <cylinderGeometry args={[5.4, 5.4, 0.65, 32]} />
          <meshStandardMaterial color="#e9a57d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3, 0.12, 8, 40]} />
          <meshBasicMaterial color={mint} />
        </mesh>
        <mesh position={[0, 7.2, 0]}>
          <sphereGeometry args={[1.1, 16, 12]} />
          <meshStandardMaterial
            color={mint}
            emissive={mint}
            emissiveIntensity={0.5}
            roughness={0.4}
          />
        </mesh>
      </group>
      <Block at={[-6, 25.7, -20]} size={[8, 0.16, 7]} color={mint} glow />
      <Sign
        text="BUILD / EXPLORE / REPEAT"
        at={[-7, 21.3, -15.85]}
        width={8.6}
        height={0.7}
        color="#d4e9e1"
      />
    </>
  );
}

function Portal({
  onSelect,
  showLabel,
}: {
  onSelect: (id: SectionId) => void;
  showLabel: boolean;
}) {
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const ring = useRef<T.Group>(null),
    orbit = useRef<T.Group>(null);
  const material = useMemo(
    () =>
      new T.ShaderMaterial({
        transparent: true,
        side: T.DoubleSide,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader:
          "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float a=atan(p.y,p.x);
      float swirl=sin(r*13.-uTime*.8+a*2.)*.5+.5;float edge=pow(r,4.);
      float stars=pow(max(0.,sin(p.x*79.+uTime*.3)*cos(p.y*93.-uTime*.2)),24.);
      vec3 col=mix(vec3(.025,.12,.24),vec3(.04,.76,.78),swirl*.5+edge*.4);
      col+=stars*vec3(.7,1.,.85);gl_FragColor=vec4(col,(1.-smoothstep(.91,1.,r))*.8);
#include <colorspace_fragment>
}`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useCartoonMotion((t) => {
    material.uniforms.uTime.value = t;
    ring.current!.rotation.z = t * 0.12;
    orbit.current!.rotation.z = -t * 0.2;
  });
  return (
    <group
      position={[0, 8.3, 2]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("labs");
      }}
    >
      <Block at={[0, -7.6, 0]} size={[8, 1.1, 16]} color="#2c4c5a" />
      <Block at={[0, -6.85, 0]} size={[7, 0.3, 7]} color="#37b8ae" />
      <mesh>
        <circleGeometry args={[5.05, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
      <group ref={ring}>
        <mesh castShadow>
          <torusGeometry args={[5.5, 0.28, 12, 80]} />
          <meshStandardMaterial
            color="#254f60"
            roughness={0.38}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[0, 0, 0.18]}>
          <torusGeometry args={[5.2, 0.09, 8, 80]} />
          <meshBasicMaterial color="#75fff0" toneMapped={false} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
            <Block
              at={[0, 5.5, 0.42]}
              size={[0.14, 0.58, 0.25]}
              color={mint}
              glow
            />
          </group>
        ))}
      </group>
      <group ref={orbit} rotation={[0, 0, -0.3]}>
        <mesh>
          <torusGeometry args={[6.6, 0.045, 6, 80, Math.PI * 1.5]} />
          <meshBasicMaterial color={coral} />
        </mesh>
        <mesh position={[6.6, 0, 0]}>
          <sphereGeometry args={[0.28, 12, 8]} />
          <meshBasicMaterial color={coral} />
        </mesh>
      </group>
      <Html
        position={[0, -7.1, 1]}
        center
        zIndexRange={[12, 1]}
        style={{ display: showLabel ? "block" : "none" }}
      >
        <button
          className="world-marker portal-marker"
          onClick={(e) => {
            e.stopPropagation();
            onSelect("labs");
          }}
        >
          <span className="marker-dot" />
          AI lab<span>Enter portal ↗</span>
        </button>
      </Html>
    </group>
  );
}

function Tree({ at, scale = 1 }: { at: Vec3; scale?: number }) {
  return (
    <group position={at} scale={scale}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.35, 3.2, 8]} />
        <meshStandardMaterial color="#a68d73" roughness={0.9} />
      </mesh>
      {[
        [0, 4, 0, 1.8],
        [-1, 3.5, 0.3, 1.25],
        [1, 3.7, -0.3, 1.4],
      ].map(([x, y, z, r], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          scale={[1, 1.1, 0.9]}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial
            color={["#55b98d", "#9ed979", "#319e84"][i]}
            roughness={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

function Park() {
  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Block
            at={[side * 10.8, 0.3, 2]}
            size={[8.5, 0.32, 30]}
            color="#568f75"
            radius={1.5}
          />
          {[-10, -1, 10].map((z, i) => (
            <Tree
              key={z}
              at={[side * (10.5 + (i % 2)), 0.5, z]}
              scale={0.7 + i * 0.08}
            />
          ))}
          <Block
            at={[side * 19.5, 0.3, 18]}
            size={[15, 0.5, 5]}
            color="#2f5158"
            radius={1}
          />
          <Block
            at={[side * 19.5, 0.6, 18]}
            size={[14.2, 0.1, 4.2]}
            color="#76a88a"
          />
          <Block
            at={[side * 19.5, 0.8, 21]}
            size={[13, 0.3, 0.8]}
            color="#cfaf8e"
          />
          {[-5, -2, 1, 4].map((x, i) => (
            <mesh key={x} position={[side * 19.5 + x, 1.1, 18]} castShadow>
              <icosahedronGeometry args={[0.85 + (i % 2) * 0.3, 1]} />
              <meshStandardMaterial color={i % 2 ? "#8bc96e" : "#36a783"} />
            </mesh>
          ))}
        </group>
      ))}
      {(
        [
          [-36, 0, 12],
          [36, 0, 12],
          [-35, 0, -24],
          [35, 0, -24],
          [-23, 0, -34],
          [23, 0, -34],
        ] as Vec3[]
      ).map((at, i) => (
        <Tree key={i} at={at} scale={i < 2 ? 1.2 : 0.9} />
      ))}
      {[-33, -10, 13, 35].map((x) => (
        <group key={x} position={[x, 0, 24.5]}>
          <Block at={[0, 2.5, 0]} size={[0.2, 5, 0.2]} color="#476f79" />
          <Block at={[0.6, 5, 0]} size={[1.4, 0.24, 0.4]} color="#b7dacf" />
          <Block
            at={[0.8, 4.85, 0]}
            size={[0.7, 0.08, 0.3]}
            color="#ffcf9c"
            glow
          />
        </group>
      ))}
      <Block
        at={[0, 0.1, 38.5]}
        size={[98, 0.2, 2.5]}
        color="#aac4b5"
        radius={0.3}
      />
      <Block
        at={[0, -0.01, 44]}
        size={[99, 0.12, 8]}
        color="#bba988"
        radius={3}
      />
      <Block
        at={[0, -0.04, 51]}
        size={[96, 0.08, 6]}
        color="#4caaa5"
        radius={1}
      />
      {[-38, 37].map((x) => (
        <group key={x} position={[x, 0, 42]}>
          <mesh position={[0, 2.7, 0]} rotation={[0, 0, -0.1]} castShadow>
            <cylinderGeometry args={[0.2, 0.4, 5.4, 8]} />
            <meshStandardMaterial color="#ba9e7c" />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => (
            <group
              key={i}
              position={[0.3, 5.4, 0]}
              rotation={[0, (i * Math.PI * 2) / 7, 0]}
            >
              <mesh
                rotation={[0, 0, -0.55]}
                position={[1.2, -0.4, 0]}
                scale={[2.1, 0.18, 0.45]}
                castShadow
              >
                <sphereGeometry args={[1, 10, 6]} />
                <meshStandardMaterial color="#77b48c" roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <Block
        at={[17, -0.02, 56]}
        size={[8, 0.08, 8]}
        color="#4caaa5"
        radius={0.1}
      />
      <Waterfall />
    </>
  );
}

function Waterfall() {
  const material = useMemo(
    () =>
      new T.ShaderMaterial({
        transparent: true,
        side: T.DoubleSide,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader:
          "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: `varying vec2 vUv;uniform float uTime;void main(){float line=pow(.5+.5*sin(vUv.x*100.+sin(vUv.y*7.+uTime)*2.),5.);float flow=.7+.3*sin(vUv.y*25.+uTime*2.);float alpha=smoothstep(0.,.1,vUv.x)*(1.-smoothstep(.9,1.,vUv.x))*smoothstep(0.,.2,vUv.y);gl_FragColor=vec4(mix(vec3(.1,.49,.51),vec3(.65,.94,.83),line*flow),alpha*.75);
#include <colorspace_fragment>
}`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useCartoonMotion((t) => {
    material.uniforms.uTime.value = t;
  });
  return (
    <group position={[17, -7.5, 59.7]}>
      <mesh>
        <planeGeometry args={[8, 15]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, -7.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial
          color="#8ce8ce"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Companion({
  onSelect,
  showLabel,
}: {
  onSelect: (id: SectionId) => void;
  showLabel: boolean;
}) {
  const drone = useRef<T.Group>(null),
    propellers = useRef<T.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  useCartoonMotion((t) => {
    drone.current!.position.y = 16 + Math.sin(t * 0.8) * 0.8;
    drone.current!.rotation.y = Math.sin(t * 0.35) * 0.2;
    propellers.current!.rotation.y = t * 3;
  });
  return (
    <group
      ref={drone}
      position={[-15, 16, 12]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("about");
      }}
    >
      <Block
        size={[3.8, 2.3, 2.5]}
        color={hover ? "#e3f6da" : "#b9dcd0"}
        radius={0.8}
      />
      <Block
        at={[0, 0.1, 1.25]}
        size={[2.8, 1.1, 0.12]}
        color="#183d4c"
        radius={0.3}
      />
      {[-0.7, 0.7].map((x) => (
        <Block
          key={x}
          at={[x, 0.15, 1.34]}
          size={[0.3, 0.44, 0.04]}
          color={mint}
          radius={0.12}
          glow
        />
      ))}
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1, 8]} />
        <meshStandardMaterial color="#94c8b5" />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.22, 12, 8]} />
        <meshBasicMaterial color={coral} />
      </mesh>
      <group ref={propellers} position={[0, 1.55, 0]}>
        <Block size={[5, 0.08, 0.4]} color="#82b9ab" />
        <Block size={[0.4, 0.08, 5]} color="#82b9ab" />
      </group>
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1.1, 1.4, 16, 1, true]} />
        <meshBasicMaterial
          color={mint}
          transparent
          opacity={0.08}
          side={T.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <Html
        position={[0, 3.9, 0]}
        center
        zIndexRange={[12, 1]}
        style={{ display: showLabel ? "block" : "none" }}
      >
        <button
          className="world-marker companion-marker"
          onClick={(e) => {
            e.stopPropagation();
            onSelect("about");
          }}
        >
          Hey, I’m Bondeth<span>Meet the maker ↗</span>
        </button>
      </Html>
    </group>
  );
}

function ContactBeacon({
  onSelect,
  showLabel,
}: {
  onSelect: (id: SectionId) => void;
  showLabel: boolean;
}) {
  const beacon = useRef<T.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  useCartoonMotion((t) => {
    beacon.current!.position.y = 10 + Math.sin(t * 0.7 + 2) * 0.6;
    beacon.current!.rotation.y = Math.sin(t * 0.25) * 0.12;
  });
  return (
    <group
      ref={beacon}
      position={[32, 10, 39]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("contact");
      }}
    >
      <Block
        size={[4.6, 3.4, 0.9]}
        color={hover ? "#ffba8e" : coral}
        radius={0.65}
      />
      <Sign
        text="@"
        at={[0, 0.1, 0.47]}
        width={2.5}
        height={2}
        color="#2b4a50"
      />
      <mesh rotation={[0.5, 0.2, 0.25]}>
        <torusGeometry args={[3.4, 0.04, 6, 48]} />
        <meshBasicMaterial color={mint} />
      </mesh>
      <mesh position={[0, -3.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.9, 32]} />
        <meshBasicMaterial
          color={coral}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
      <Html
        position={[0, -3, 0]}
        center
        zIndexRange={[12, 1]}
        style={{ display: showLabel ? "block" : "none" }}
      >
        <button
          className="world-marker contact-marker"
          onClick={(e) => {
            e.stopPropagation();
            onSelect("contact");
          }}
        >
          <span className="beacon-context">Let’s make something</span>
          <span className="beacon-action">Say hello ↗</span>
        </button>
      </Html>
    </group>
  );
}

function SkyTram() {
  const tram = useRef<T.Group>(null);
  useCartoonMotion((t) => {
    tram.current!.position.x = Math.sin(t * 0.13) * 42;
    tram.current!.position.y = 27 + Math.sin(t * 0.3) * 0.6;
    tram.current!.rotation.z = Math.cos(t * 0.13) * -0.04;
  });
  return (
    <group ref={tram} position={[0, 27, -38]}>
      <Block size={[6.5, 2.1, 2.2]} color="#d8d5ba" radius={0.8} />
      <Block
        at={[0.4, 0.15, 1.1]}
        size={[4.2, 0.85, 0.1]}
        color="#24525e"
        radius={0.25}
      />
      <Block at={[0, -1, 0]} size={[4.7, 0.1, 1.6]} color={mint} glow />
      <Block at={[-3.4, 0, 0]} size={[1.5, 0.15, 5]} color="#7dada4" />
      <Block at={[3.4, 0, 0]} size={[1.5, 0.15, 5]} color="#7dada4" />
      <mesh position={[-3.35, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.1, 8, 24]} />
        <meshBasicMaterial color={mint} />
      </mesh>
      <mesh position={[3.35, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.1, 8, 24]} />
        <meshBasicMaterial color={mint} />
      </mesh>
    </group>
  );
}

function SatelliteIsland({
  at,
  scale,
  phase,
}: {
  at: Vec3;
  scale: number;
  phase: number;
}) {
  const island = useRef<T.Group>(null);
  useCartoonMotion((t) => {
    island.current!.position.y = at[1] + Math.sin(t * 0.25 + phase) * 1.1;
  });
  return (
    <group ref={island} position={at} scale={scale}>
      <mesh position={[0, -2, 0]} castShadow>
        <cylinderGeometry args={[9, 5, 4, 7]} />
        <meshStandardMaterial color="#bbc4a5" roughness={0.85} />
      </mesh>
      <mesh position={[0, -5.5, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[5, 5, 7]} />
        <meshStandardMaterial color="#91a88d" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9, 7]} />
        <meshStandardMaterial color="#95bfa2" roughness={0.85} />
      </mesh>
      <Tree at={[-3, 0, 0]} scale={0.9} />
      <Tree at={[3, 0, -2]} scale={0.65} />
      <Block
        at={[2, 1.4, 3]}
        size={[3, 2.8, 3]}
        color="#aad8c3"
        radius={0.65}
      />
      <Block at={[2, 1.5, 4.55]} size={[1.8, 0.5, 0.1]} color={mint} glow />
    </group>
  );
}

function Sky({ night }: { night: boolean }) {
  const material = useMemo(
    () =>
      new T.ShaderMaterial({
        side: T.BackSide,
        depthWrite: false,
        uniforms: {
          horizon: { value: new T.Color("#2c6470") },
          zenith: { value: new T.Color("#0b1a2b") },
        },
        vertexShader:
          "varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: `varying vec3 vDirection;uniform vec3 horizon;uniform vec3 zenith;void main(){float h=normalize(vDirection).y;float t=smoothstep(-.12,.65,h);gl_FragColor=vec4(mix(horizon,zenith,t),1.);
#include <colorspace_fragment>
}`,
      }),
    [],
  );
  useEffect(() => {
    material.uniforms.horizon.value.set(night ? "#224952" : "#bddbd7");
    material.uniforms.zenith.value.set(night ? "#102333" : "#86bccc");
  }, [night, material]);
  useEffect(() => () => material.dispose(), [material]);
  const stars = useMemo(() => {
    const p = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i++) {
      const a = i * 2.39996,
        y = 0.05 + ((i * 0.618034) % 1) * 0.9,
        r = Math.sqrt(1 - y * y);
      p.set([Math.cos(a) * r * 230, y * 230, Math.sin(a) * r * 230], i * 3);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(p, 3));
    return g;
  }, []);
  useEffect(() => () => stars.dispose(), [stars]);
  return (
    <>
      <mesh renderOrder={-100}>
        <sphereGeometry args={[600, 32, 24]} />
        <primitive object={material} attach="material" />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial
          color="#afcfcf"
          size={0.35}
          transparent
          opacity={night ? 0.8 : 0}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <group position={[44, 42, -45]} rotation={[0.3, -0.2, 0.5]}>
        <mesh>
          <sphereGeometry args={[7.5, 40, 24]} />
          <meshStandardMaterial color="#d2af94" roughness={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[12, 0.13, 8, 80]} />
          <meshBasicMaterial color="#a3d3cc" transparent opacity={0.45} />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[11.2, 0.55, 6, 80]} />
          <meshStandardMaterial
            color="#75a5a4"
            transparent
            opacity={0.22}
            side={T.DoubleSide}
          />
        </mesh>
      </group>
    </>
  );
}

/** A compact, collision-aligned world; the portfolio lives inside its landmarks. */
export default function MetaverseWorld({
  night,
  onSelect,
  onProject,
  buildingsRef,
  chapter,
  immersive,
  activeDistrictId,
  projectIndex,
  onDistrict,
}: {
  night: boolean;
  chapter: number;
  immersive: boolean;
  onSelect: (id: SectionId) => void;
  onProject: (id: string) => void;
  buildingsRef: MutableRefObject<T.Group | null>;
  activeDistrictId: DistrictId;
  projectIndex: number;
  onDistrict: (id: DistrictId) => void;
}) {
  return (
    <>
      <Sky night={night} />
      <IslandGround />
      <group ref={buildingsRef}>
        <Architecture
          onProject={onProject}
          activeDistrictId={activeDistrictId}
          projectIndex={projectIndex}
          showProjectLabels={chapter === 3 || immersive}
          onDistrict={onDistrict}
        />
        <IslandDistrict night={night} />
        <PortalArchitecture night={night} />
      </group>
      <Park />
      <IslandLandmarks night={night} />
      <Portal onSelect={onSelect} showLabel={chapter === 4 || immersive} />
      <Companion onSelect={onSelect} showLabel={chapter === 0 || immersive} />
      <ContactBeacon
        onSelect={onSelect}
        showLabel={chapter === 5 || immersive}
      />
      <SkyTram />
      <IslandAtmosphere />
      <SatelliteIsland at={[-80, 9, -48]} scale={1.1} phase={0} />
      <SatelliteIsland at={[69, 16, -57]} scale={0.85} phase={2} />
      <SatelliteIsland at={[18, 32, -100]} scale={0.6} phase={4} />
    </>
  );
}
