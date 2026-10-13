import { useEffect, useMemo } from "react";
import * as T from "three";
import { Instances, type Piece } from "./IslandDistrict";

function roofGeometry(width: number, depth: number, height: number) {
  const corners = [
    [-width / 2, 0, -depth / 2],
    [width / 2, 0, -depth / 2],
    [width / 2, 0, depth / 2],
    [-width / 2, 0, depth / 2],
    [-width * 0.28, height, -depth * 0.28],
    [width * 0.28, height, -depth * 0.28],
    [width * 0.28, height, depth * 0.28],
    [-width * 0.28, height, depth * 0.28],
  ];
  const geometry = new T.BufferGeometry();
  geometry.setAttribute(
    "position",
    new T.Float32BufferAttribute(corners.flat(), 3),
  );
  geometry.setIndex([
    0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0, 4,
    7, 6, 4, 6, 5,
  ]);
  const flat = geometry.toNonIndexed();
  geometry.dispose();
  flat.computeVertexNormals();
  return flat;
}

/** Contemporary Khmer-inspired roof forms frame the lab, within its existing footprint. */
export default function KhmerPavilion({ night }: { night: boolean }) {
  const roofs = useMemo(
    () => [
      roofGeometry(12, 16, 2.2),
      roofGeometry(8.8, 11.8, 1.8),
      roofGeometry(6, 8, 1.4),
    ],
    [],
  );
  useEffect(() => () => roofs.forEach((roof) => roof.dispose()), [roofs]);
  const pieces = useMemo(() => {
    const result: Piece[] = [];
    for (const x of [-3.6, 3.6])
      for (const z of [-4, 8]) {
        result.push({
          at: [x, 10.45, z],
          size: [0.55, 19.5, 0.55],
          color: "#87503c",
        });
        for (const y of [1.2, 19.4, 20.1])
          result.push({
            at: [x, y, z],
            size: [0.85, 0.25, 0.85],
            color: "#d3a553",
          });
      }
    for (const y of [20.2, 22.2, 24])
      result.push({
        at: [0, y, 2],
        size: [12 - (y - 20.2) * 1.5, 0.22, 16 - (y - 20.2) * 2],
        color: "#d3a553",
      });
    return result;
  }, []);
  return (
    <group>
      <Instances pieces={pieces} night={night} />
      {roofs.map((roof, index) => (
        <mesh
          key={index}
          geometry={roof}
          position={[0, [20.3, 22.4, 24.2][index], 2]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={["#a64f39", "#b95f41", "#c67449"][index]}
            roughness={0.82}
            side={T.DoubleSide}
          />
        </mesh>
      ))}
      {[
        [-4.7, -4.1],
        [4.7, -4.1],
        [-4.7, 8.1],
        [4.7, 8.1],
        [0, 2],
      ].map(([x, z], index) => (
        <group key={index} position={[x, index === 4 ? 25.6 : 20.9, z]}>
          {[0, 1, 2].map((tier) => (
            <mesh key={tier} position={[0, tier * 0.65, 0]} castShadow>
              <coneGeometry args={[0.7 - tier * 0.17, 1.05, 8]} />
              <meshStandardMaterial
                color="#d5a64e"
                roughness={0.4}
                metalness={0.35}
                emissive="#c99a46"
                emissiveIntensity={night ? 0.35 : 0}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
