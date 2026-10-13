import { useEffect, useMemo } from "react";
import * as T from "three";
import { Instances, type Piece } from "./IslandDistrict";

/** Paired sculptural fins frame the lab without the former roof and stilts. */
export default function PortalArchitecture({ night }: { night: boolean }) {
  const fin = useMemo(() => {
    const outline = new T.Shape();
    outline.moveTo(4.8, 0.8);
    outline.lineTo(6.6, 0.8);
    outline.bezierCurveTo(9.2, 7, 7.8, 15, 1.2, 16.5);
    outline.quadraticCurveTo(0.2, 16.7, -0.6, 16.3);
    outline.lineTo(-0.3, 15.5);
    outline.bezierCurveTo(5.3, 15.2, 7.2, 8, 4.8, 0.8);
    const geometry = new T.ExtrudeGeometry(outline, {
      depth: 1.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.16,
      bevelThickness: 0.16,
      curveSegments: 24,
    });
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => fin.dispose(), [fin]);
  const pieces = useMemo<Piece[]>(
    () => [
      { at: [0, 0.85, 2], size: [8, 0.45, 15], color: "#203d51" },
      { at: [0, 1.12, 6], size: [7.2, 0.12, 6], color: "#e0ba82" },
      ...[-1, 1].flatMap((side) => [
        {
          at: [side * 3.7, 1.25, 2],
          size: [0.13, 0.12, 13],
          color: "#49d9d0",
        } as Piece,
        {
          at: [side * 5.6, 0.5, 2.6],
          size: [2.8, 0.55, 3.2],
          color: "#dfd7bf",
        } as Piece,
        {
          at: [side * 5.6, 0.83, 2.6],
          size: [2.4, 0.25, 2.8],
          color: "#48a68d",
        } as Piece,
      ]),
    ],
    [],
  );
  return (
    <group>
      <Instances pieces={pieces} night={night} />
      {[-1, 1].map((side) => (
        <group key={side} scale={[side, 1, 1]}>
          <mesh geometry={fin} position={[0, 0, 1.4]} castShadow receiveShadow>
            <meshStandardMaterial
              color="#f1ead9"
              roughness={0.42}
              metalness={0.16}
              side={T.DoubleSide}
            />
          </mesh>
          <mesh
            geometry={fin}
            position={[0, 0, 1.22]}
            scale={[1.018, 1.008, 0.12]}
          >
            <meshStandardMaterial
              color="#cd9553"
              roughness={0.38}
              metalness={0.55}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 16.2, 2.15]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.09, 6, 40]} />
        <meshStandardMaterial
          color="#4ce0d4"
          emissive="#35bfb6"
          emissiveIntensity={night ? 1 : 0.2}
        />
      </mesh>
    </group>
  );
}
