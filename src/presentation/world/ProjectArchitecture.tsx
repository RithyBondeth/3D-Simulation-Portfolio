import { useRef, useState, type CSSProperties } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as T from "three";
import {
  districts,
  type ProjectDistrict,
} from "../../data/portfolio/project-catalog";
import type { DistrictId } from "../../domain/portfolio/project-districts";
import { landmarkFootprints } from "../../domain/world/island-layout";
import { useSceneMotion } from "./SceneMotion";
import type { Vec3 } from "../../domain/world/types";
import { projectHref } from "../../domain/portfolio/portfolio-route";
import { Block, Sign } from "./rendering/WorldPrimitives";
import { mint, coral } from "./rendering/world-palette";

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
  onDistrict,
  showLabel,
}: {
  district: ProjectDistrict;
  projectIndex: number;
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
  const highlighted = hover || showLabel;
  useCursor(hover);
  useSceneMotion((t) => {
    if (!sculpture.current) return;
    sculpture.current.position.y =
      1.9 + (hover ? 0.45 : 0) + Math.sin(t * 0.8 + district.stop * 5) * 0.2;
    if (district.id === "ai") sculpture.current.rotation.y = t * 0.13;
  });
  useFrame(({ camera }) => {
    if (sculpture.current && district.id !== "ai")
      sculpture.current.rotation.y = Math.atan2(
        camera.position.x - district.position[0],
        camera.position.z - district.position[2],
      );
  });
  return (
    <group position={[...district.position]}>
      <Block at={[0, -0.25, 0]} size={[6.5, 0.45, 5]} color="#e7e7cf" />
      <Block at={[0, 0.05, 0]} size={[5.3, 0.14, 4]} color={district.color} />
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.5, highlighted ? 3.8 : 3.62, 48]} />
        <meshBasicMaterial
          color={highlighted ? "#9be7ad" : "#38664e"}
          transparent
          opacity={highlighted ? 0.95 : 0.4}
          depthWrite={false}
        />
      </mesh>
      <group
        ref={sculpture}
        position={[0, hover ? 2.35 : 1.9, 0]}
        scale={hover ? 1.06 : 1}
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
              color={highlighted ? "#38664e" : "#496476"}
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
              color={highlighted ? "#38664e" : "#536873"}
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
        ) : district.id === "web" ? (
          <group rotation={[0, -0.12, 0]}>
            <Block
              size={[6.2, 4.2, 0.45]}
              color={highlighted ? "#38664e" : "#426b69"}
              radius={0.25}
            />
            <Block
              at={[0, -0.25, 0.26]}
              size={[5.6, 2.9, 0.08]}
              color="#edf2df"
              radius={0.12}
            />
            {[-2.3, -1.7, -1.1].map((x) => (
              <Block
                key={x}
                at={[x, 1.5, 0.27]}
                size={[0.28, 0.28, 0.07]}
                color="#b6d9ab"
                radius={0.1}
              />
            ))}
            <Sign
              text="</>"
              at={[0, -0.15, 0.32]}
              width={3.6}
              height={1.7}
              color="#38664e"
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
                  color={highlighted ? "#38664e" : district.color}
                  roughness={0.4}
                  metalness={0.25}
                />
              </mesh>
            ))}
            <mesh>
              <icosahedronGeometry args={[0.8, district.id === "ai" ? 1 : 0]} />
              <meshStandardMaterial
                color="#b6d9ab"
                emissive="#70b984"
                emissiveIntensity={0.25}
              />
            </mesh>
            {[
              [2.1, 0, 0],
              [0, 2.1, 0],
              [-1.5, 0, 1.5],
            ].map((at, i) => (
              <mesh key={i} position={at as [number, number, number]}>
                <sphereGeometry args={[0.35, 12, 8]} />
                <meshStandardMaterial color="#b6d9ab" roughness={0.35} />
              </mesh>
            ))}
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
        position={[0, district.id === "macos" ? 12.2 : 11.5, 0]}
        center
        zIndexRange={[12, 1]}
        style={{ display: showLabel ? "block" : "none" }}
      >
        <article
          className="project-landmark district-landmark"
          style={{ "--district-color": district.color } as CSSProperties}
          aria-label={`${district.title} district project`}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onFocusCapture={() => setHover(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setHover(false);
          }}
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

export default function ProjectArchitecture({
  onDistrict,
  activeDistrictId,
  projectIndex,
  showProjectLabels,
}: {
  showProjectLabels: boolean;
  onDistrict: (id: DistrictId) => void;
  activeDistrictId: DistrictId;
  projectIndex: number;
}) {
  return (
    <>
      {landmarkFootprints.map((b, i) => (
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
