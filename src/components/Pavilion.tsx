import { useEffect, useMemo, type MutableRefObject } from "react";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as T from "three";
import { pavilionFootprints } from "../lib/pavilion-layout";
import { featuredProjects } from "../featured-projects";
import CartoonCity from "./CartoonCity";
import { PlaySculpture } from "./CartoonDetails";
import type { SectionId, Vec3 } from "../types";
import PavilionCoast, { waterNormal } from "./PavilionCoast";
import { GardenTrees, Grasses, ParkFlowers } from "./PavilionNature";

const stone = "#f1ddba",
  dark = "#58857f",
  timber = "#d6a577";
function Box({
  at,
  size,
  color = stone,
  metal = false,
}: {
  at: Vec3;
  size: Vec3;
  color?: string;
  metal?: boolean;
}) {
  return (
    <RoundedBox
      position={at}
      args={size}
      radius={Math.min(0.18, ...size.map((v) => v * 0.22))}
      smoothness={2}
      bevelSegments={2}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={metal ? 0.6 : 0.92}
        metalness={metal ? 0.08 : 0}
      />
    </RoundedBox>
  );
}
function roundedShape(w: number, h: number, r: number) {
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
function Sign({
  text,
  at,
  width,
  height = 0.75,
  dark: invert = false,
}: {
  text: string;
  at: Vec3;
  width: number;
  height?: number;
  dark?: boolean;
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = Math.round((1024 * height) / width);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = invert ? "#58857f" : "#f3dfbc";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = invert ? "#fff3db" : "#3b6863";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `500 ${c.height * 0.52}px 'Ubuntu', sans-serif`;
    ctx.fillText(text, 512, c.height / 2, 975);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }, [text, width, height, invert]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={at}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={stone} roughness={0.8} />
    </mesh>
  );
}
function ProjectDisplay({
  image,
  at,
  width = 9,
}: {
  image: string;
  at: Vec3;
  width?: number;
}) {
  const map = useTexture(image);
  map.colorSpace = T.SRGBColorSpace;
  return (
    <group position={at}>
      <Box
        at={[0, 0, 0]}
        size={[width + 0.3, width * 0.56 + 0.3, 0.24]}
        color="#303d38"
        metal
      />
      <mesh position={[0, 0, 0.131]}>
        <planeGeometry args={[width, width * 0.56]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      <Box
        at={[0, -width * 0.3 - 0.2, 0.02]}
        size={[width * 0.3, 0.05, 0.3]}
        color={dark}
      />
    </group>
  );
}
function Architecture({ night }: { night: boolean }) {
  return (
    <>
      {pavilionFootprints.map((b, index) => (
        <group key={index} position={[b.x, 0.27, b.z]}>
          <Box
            at={[0, 0.12, 0]}
            size={[b.w + 0.7, 0.24, b.d + 0.7]}
            color="#a8997e"
          />
          <Box
            at={[0, b.h / 2, -b.d / 2]}
            size={[b.w, b.h, 0.4]}
            color={stone}
          />
          {[-1, 1].map((side) => (
            <group key={side} position={[(side * b.w) / 2, 0, 0]}>
              <Box at={[0, 0.5, 0]} size={[0.3, 0.8, b.d]} color={stone} />
              <Box
                at={[0, b.h - 0.3, 0]}
                size={[0.3, 0.5, b.d]}
                color={stone}
              />
              <mesh
                position={[0, b.h / 2 + 0.2, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[b.d, b.h - 1.4]} />
                <meshPhysicalMaterial
                  color="#91c6c3"
                  roughness={0.4}
                  metalness={0.05}
                  transparent
                  opacity={0.8}
                  depthWrite={false}
                  side={T.DoubleSide}
                  envMapIntensity={1.5}
                />
              </mesh>
              {Array.from({ length: Math.round(b.d / 2.4) + 1 }, (_, i) => (
                <Box
                  key={i}
                  at={[
                    0,
                    b.h / 2,
                    -b.d / 2 + (i * b.d) / Math.round(b.d / 2.4),
                  ]}
                  size={[0.1, b.h - 0.8, 0.07]}
                  color={dark}
                  metal
                />
              ))}
            </group>
          ))}
          {/* Furnished interiors keep the transparent facades from feeling empty. */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * b.w * 0.28, 0, b.d * 0.18]}>
              <Box at={[0, 0.65, 0]} size={[2.6, 0.8, 1.1]} color="#aea18a" />
              <Box
                at={[0, 1.1, -0.5]}
                size={[2.6, 0.75, 0.2]}
                color="#aea18a"
              />
              <Box at={[0, 0.6, 1.8]} size={[1.8, 0.1, 0.8]} color={timber} />
              <Box at={[0, 0.4, 1.8]} size={[1.3, 0.4, 0.35]} color={dark} />
            </group>
          ))}
          <Box
            at={[0, b.h + 0.13, 0.7]}
            size={[b.w + 2.2, 0.75, b.d + 2.5]}
            color={["#dd9479", "#e8c77b", "#8fcac0"][index]}
          />
          <Box
            at={[0, b.h - 0.13, 0.7]}
            size={[b.w + 1.8, 0.13, b.d + 2.1]}
            color={dark}
          />
          <Box
            at={[0, b.h - 0.21, 0.7]}
            size={[b.w + 1.4, 0.03, b.d + 1.8]}
            color={timber}
          />
          <Box
            at={[0, 0.29, 0]}
            size={[b.w - 0.45, 0.05, b.d - 0.5]}
            color="#b4a082"
          />
          <mesh position={[0, b.h / 2, b.d / 2 - 0.16]}>
            <planeGeometry args={[b.w - 0.5, b.h - 0.35]} />
            <meshPhysicalMaterial
              color={night ? "#8ebfc1" : "#9bd5cc"}
              roughness={0.12}
              metalness={0.05}
              transparent
              opacity={0.8}
              depthWrite={false}
              side={T.DoubleSide}
              envMapIntensity={1.1}
            />
          </mesh>
          {Array.from({ length: Math.round(b.w / 2.4) + 1 }, (_, i) => (
            <Box
              key={i}
              at={[
                -b.w / 2 + 0.2 + (i * (b.w - 0.4)) / Math.round(b.w / 2.4),
                b.h / 2,
                b.d / 2 - 0.1,
              ]}
              size={[0.075, b.h - 0.25, 0.09]}
              color={dark}
              metal
            />
          ))}
          <Box
            at={[0, b.h * 0.6, b.d / 2 - 0.08]}
            size={[b.w, 0.075, 0.1]}
            color={dark}
            metal
          />
          {/* Deep timber fins and a sheltered entrance give the gallery a human scale. */}
          {index === 0 &&
            Array.from({ length: 16 }, (_, i) => (
              <Box
                key={i}
                at={[-b.w / 2 - 0.24, b.h / 2, -b.d / 2 + 0.5 + i * 1.8]}
                size={[0.6, b.h - 0.1, 0.12]}
                color={timber}
              />
            ))}
          {night && (
            <mesh position={[0, b.h - 0.32, b.d / 2 + 0.6]}>
              <boxGeometry args={[b.w, 0.06, 0.08]} />
              <meshBasicMaterial color="#ffe0a6" />
            </mesh>
          )}
        </group>
      ))}
      <Sign
        text="SELECTED WORK"
        at={[-23, 5.75, 11.98]}
        width={10}
        height={0.6}
      />
      <Sign
        text="IDEAS INTO REALITY"
        at={[0, 6.96, -13.52]}
        width={19}
        height={0.6}
      />
      <Sign
        text="BUILT WITH CARE"
        at={[23, 5.75, 9.48]}
        width={10}
        height={0.6}
      />
      <ProjectDisplay
        image={featuredProjects[0].image}
        at={[-23, 2.9, 10.55]}
        width={9.1}
      />
      <ProjectDisplay
        image={featuredProjects[1].image}
        at={[0, 3.2, -14.6]}
        width={10}
      />
      <ProjectDisplay
        image={featuredProjects[2].image}
        at={[23, 2.9, 8.55]}
        width={9.1}
      />
      <Box at={[-34, 1.55, 23]} size={[2.7, 3.1, 0.6]} color={stone} />
      <Sign text="b." at={[-34, 1.8, 23.31]} width={1.4} height={1.4} />
      <Sign
        text="RITHY BONDETH"
        at={[-34, 0.75, 23.32]}
        width={2.1}
        height={0.27}
      />
    </>
  );
}
function Courtyard({
  night,
  onSelect,
}: {
  night: boolean;
  onSelect: (id: SectionId) => void;
}) {
  const ripples = useMemo(waterNormal, []);
  useEffect(() => () => ripples.dispose(), [ripples]);
  return (
    <>
      <Box at={[0, 0.25, 1]} size={[28, 0.08, 32]} color="#a4cf91" />
      <Box at={[0, 0.3, 1]} size={[11, 0.06, 33]} color="#f4e5c9" />
      <Box at={[0, 0.3, 12]} size={[28, 0.06, 2.3]} color="#f4e5c9" />
      <ParkFlowers />
      <Box at={[0, 0.29, 2]} size={[8.7, 0.21, 16.7]} color="#f8eac8" />
      <mesh position={[0, 0.41, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 16]} />
        <meshPhysicalMaterial
          color={night ? "#428b93" : "#77d4c8"}
          normalMap={ripples}
          normalScale={new T.Vector2(0.18, 0.18)}
          roughness={0.4}
          metalness={0.4}
          clearcoat={1}
        />
      </mesh>
      <PlaySculpture onSelect={onSelect} />
      {[
        { x: -19, w: 16 },
        { x: 20, w: 15 },
      ].map(({ x, w }) => (
        <group key={x} position={[x, 0, 18]}>
          <Box at={[0, 0.28, 0]} size={[w, 0.5, 5]} color="#ebd2ad" />
          <Box
            at={[0, 0.54, 0]}
            size={[w - 0.35, 0.03, 4.65]}
            color="#8dc490"
          />
          <Box at={[0, 0.68, 2.7]} size={[w + 0.3, 0.25, 0.8]} color={timber} />
          {[-w / 2 + 1, w / 2 - 1].map((dx) => (
            <Box
              key={dx}
              at={[dx, 0.37, 2.7]}
              size={[0.3, 0.5, 0.55]}
              color={dark}
            />
          ))}
        </group>
      ))}
      {/* A light pergola shelters a small outdoor reading terrace. */}
      {[-12, -5].flatMap((x) =>
        [-12, -4].map((z) => (
          <Box
            key={`${x}:${z}`}
            at={[x, 2.35, z]}
            size={[0.13, 4.3, 0.13]}
            color={timber}
          />
        )),
      )}
      {Array.from({ length: 14 }, (_, i) => (
        <Box
          key={i}
          at={[-8.5, 4.55, -12.6 + i * 0.7]}
          size={[8.4, 0.16, 0.16]}
          color={timber}
        />
      ))}
      {[
        [-9, -9],
        [11, 11],
      ].map(([x, z]) => (
        <group key={x} position={[x, 0.3, z]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[1, 1, 0.12, 24]} />
            <meshStandardMaterial color="#b5a183" />
          </mesh>
          <Box at={[0, 0.25, 0]} size={[0.13, 0.55, 0.13]} color={dark} />
          {[-1.4, 1.4].map((dx) => (
            <group key={dx} position={[dx, 0, 0]}>
              <Box at={[0, 0.4, 0]} size={[0.65, 0.12, 0.7]} color={timber} />
              <Box
                at={[0, 0.72, -0.3]}
                size={[0.65, 0.6, 0.08]}
                color={timber}
              />
            </group>
          ))}
        </group>
      ))}
      <GardenTrees />
      <Grasses />
      {[-36, -18, 18, 36].map((x) => (
        <group key={x} position={[x, 0, 35.6]}>
          <Box at={[0, 0.65, 0]} size={[0.2, 1.3, 0.2]} color={dark} />
          <mesh position={[0, 1.28, 0]}>
            <boxGeometry args={[0.26, 0.1, 0.26]} />
            {night ? (
              <meshBasicMaterial color="#ffe2ac" />
            ) : (
              <meshStandardMaterial color="#e9dfbb" />
            )}
          </mesh>
        </group>
      ))}
    </>
  );
}

export default function Pavilion({
  night,
  onSelect,
  buildingsRef,
}: {
  night: boolean;
  onSelect: (id: SectionId) => void;
  buildingsRef: MutableRefObject<T.Group>;
}) {
  const road = useMemo(() => {
    const s = roundedShape(96, 76, 12);
    s.holes.push(roundedShape(82, 62, 5));
    return new T.ShapeGeometry(s, 24);
  }, []);
  const platform = useMemo(
    () => new T.ShapeGeometry(roundedShape(72, 54, 1.5), 12),
    [],
  );
  useEffect(
    () => () => {
      road.dispose();
      platform.dispose();
    },
    [road, platform],
  );
  return (
    <>
      <mesh
        position={[0, -0.035, -460.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[2000, 1000]} />
        <meshStandardMaterial color="#b9d6a4" roughness={1} />
      </mesh>
      <mesh
        geometry={road}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, -4]}
        receiveShadow
      >
        <meshStandardMaterial color="#6f8f9c" roughness={1} />
      </mesh>
      <mesh
        geometry={platform}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.23, -2]}
        receiveShadow
      >
        <meshStandardMaterial color="#f4e5c9" roughness={0.9} />
      </mesh>
      <Box at={[0, 0.14, 24.5]} size={[12, 0.22, 3]} color="#ead4b4" />
      <Box at={[0, 0.05, 26.2]} size={[13, 0.1, 1]} color="#f2ddbc" />
      <Box at={[0, 0.12, 38.1]} size={[105, 0.2, 2.7]} color="#f4deb7" />
      <group ref={buildingsRef}>
        <Architecture night={night} />
        <CartoonCity night={night} />
      </group>
      <Courtyard night={night} onSelect={onSelect} />
      <PavilionCoast night={night} />
      {Array.from({ length: 14 }, (_, i) => (
        <mesh
          key={i}
          position={[-35 + i * 5.4, 0.024, 30.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1.4, 0.09]} />
          <meshStandardMaterial color="#fff0cd" />
        </mesh>
      ))}
    </>
  );
}
