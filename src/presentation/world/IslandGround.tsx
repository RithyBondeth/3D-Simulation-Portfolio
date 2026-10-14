import { useEffect, useMemo } from "react";
import * as T from "three";
import { journeyCarPose } from "../../domain/world/scroll-journey";
import { driveElevation } from "../../domain/world/infrastructure";
import { Block, Sign, roundedRect } from "./rendering/WorldPrimitives";
import { mint } from "./rendering/world-palette";

export default function IslandGround() {
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
          return new T.Vector3(
            pose.x,
            0.04 + driveElevation(pose.x, pose.z),
            pose.z,
          );
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
