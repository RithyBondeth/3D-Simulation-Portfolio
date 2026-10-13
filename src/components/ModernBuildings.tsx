import { useMemo } from "react";
import { Instances, type Piece } from "./IslandDistrict";
import {
  districtBuildings,
  type DistrictBuilding,
} from "../lib/island-district";

function SteppedTower({
  x,
  z,
  w,
  d,
  h,
  night,
}: DistrictBuilding & { night: boolean }) {
  const pieces = useMemo(() => {
    const solid: Piece[] = [],
      glass: Piece[] = [];
    for (let level = 0; level < 4; level++) {
      const width = w * (1 - level * 0.14),
        depth = d * (1 - level * 0.12),
        height = h / 4;
      const y = level * height;
      solid.push({
        at: [0, y + height / 2 + 0.2, 0],
        size: [width, height, depth],
        color: "#dde5d5",
      });
      solid.push({
        at: [0, y + height + 0.3, 0],
        size: [width + 0.25, 0.3, depth + 0.25],
        color: "#e9e5d2",
      });
      solid.push({
        at: [0, y + height + 0.5, 0],
        size: [width * 0.86, 0.2, depth * 0.8],
        color: "#5f956e",
      });
      for (const side of [-1, 1]) {
        glass.push({
          at: [0, y + height / 2 + 0.1, side * (depth / 2 + 0.02)],
          size: [width * 0.86, height * 0.55, 0.05],
          color: "#356f72",
        });
        glass.push({
          at: [side * (width / 2 + 0.02), y + height / 2 + 0.1, 0],
          size: [0.05, height * 0.55, depth * 0.86],
          color: "#356f72",
        });
      }
      for (const side of [-1, 1])
        solid.push({
          at: [side * width * 0.3, y + height + 0.9, depth * 0.28],
          size: [width * 0.18, 0.65, depth * 0.2],
          color: "#85b58a",
        });
    }
    return { solid, glass };
  }, [w, d, h]);
  return (
    <group position={[x, 0, z]}>
      <Instances pieces={pieces.solid} night={night} />
      <Instances pieces={pieces.glass} glass night={night} />
    </group>
  );
}

function CurvedTower({
  x,
  z,
  w,
  d,
  h,
  night,
}: DistrictBuilding & { night: boolean }) {
  const mullions = useMemo<Piece[]>(() => {
    const pieces: Piece[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      pieces.push({
        at: [(Math.cos(angle) * w) / 2, h / 2 + 0.4, (Math.sin(angle) * d) / 2],
        size: [0.1, h, 0.1],
        color: "#c5d8ca",
      });
    }
    return pieces;
  }, [w, d, h]);
  return (
    <group position={[x, 0, z]}>
      <mesh
        position={[0, h / 2 + 0.4, 0]}
        scale={[w / 2, 1, d / 2]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.9, 1, h, 32]} />
        <meshStandardMaterial
          color={night ? "#245b62" : "#428d95"}
          metalness={0.45}
          roughness={0.23}
        />
      </mesh>
      {Array.from({ length: Math.floor(h / 3) }, (_, i) => (
        <mesh
          key={i}
          position={[0, 1.2 + i * 3, 0]}
          scale={[(w / 2) * (1 - i * 0.012), 1, (d / 2) * (1 - i * 0.012)]}
        >
          <cylinderGeometry args={[1.015, 1.015, 0.16, 32]} />
          <meshStandardMaterial
            color="#d4dfd3"
            emissive={night ? "#779f8b" : "#000000"}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      <Instances pieces={mullions} night={night} />
      <mesh position={[0, h + 0.55, 0]} scale={[w / 2, 1, d / 2]} castShadow>
        <cylinderGeometry args={[0.94, 0.94, 0.35, 32]} />
        <meshStandardMaterial color="#62966e" roughness={0.8} />
      </mesh>
      <mesh position={[0, h + 1.2, 0]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[w * 0.6, 0.12, d * 0.45]} />
        <meshStandardMaterial color="#294d63" metalness={0.3} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function ModernBuildings({ night }: { night: boolean }) {
  return (
    <>
      {districtBuildings
        .filter((b) => b.style)
        .map((b) =>
          b.style === "curved" ? (
            <CurvedTower key={`${b.x}:${b.z}`} {...b} night={night} />
          ) : (
            <SteppedTower key={`${b.x}:${b.z}`} {...b} night={night} />
          ),
        )}
      <SteppedTower
        x={112}
        z={-8}
        w={11}
        d={11}
        h={23}
        color="#dde5d5"
        night={night}
      />
      <CurvedTower
        x={124}
        z={-10}
        w={6}
        d={7}
        h={15}
        color="#428d95"
        night={night}
      />
    </>
  );
}
