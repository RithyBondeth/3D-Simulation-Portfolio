import { useEffect, useMemo } from "react";
import { Html } from "@react-three/drei";
import * as T from "three";
import { InstancedBoxes } from "./rendering/InstancedBoxes";
import {
  bridgePath,
  bridgeDeckWidth,
  bridgeRoadWidth,
  annexRoad,
  accessRoads,
  innovationIsland,
} from "../../domain/world/infrastructure";
import { createBridgeDetails } from "./geometry/bridge-details";
import { roadRibbon } from "./geometry/road-surface";
import type { SectionId } from "../../domain/portfolio/types";

export default function BridgeDistrict({
  night,
  onSelect,
  immersive,
}: {
  night: boolean;
  onSelect: (id: SectionId) => void;
  immersive: boolean;
}) {
  const surfaces = useMemo(
    () => ({
      deck: roadRibbon(bridgePath, bridgeDeckWidth, 0, -0.25),
      asphalt: roadRibbon(bridgePath, bridgeRoadWidth),
      cycle: roadRibbon(bridgePath, 1.8, -4.9, 0.07),
      walk: roadRibbon(bridgePath, 1.5, 5.2, 0.08),
      loop: roadRibbon(annexRoad, 6.4),
      promenade: roadRibbon(annexRoad, 1.5, -5, 0.08),
      access: accessRoads.map((path) => roadRibbon(path, 4.8)),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(surfaces)
        .flat()
        .forEach((g) => g.dispose());
    },
    [surfaces],
  );
  const pieces = useMemo(createBridgeDetails, []);
  return (
    <>
      <group
        position={[innovationIsland.x, 0, innovationIsland.z]}
        scale={[1, 1, innovationIsland.rz / innovationIsland.rx]}
      >
        <mesh position={[0, -4.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[27, 22, 8, 64]} />
          <meshStandardMaterial color="#c5b99c" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.12, 0]} receiveShadow>
          <cylinderGeometry args={[27, 27, 0.2, 64]} />
          <meshStandardMaterial color="#92b78a" roughness={0.9} />
        </mesh>
        <mesh position={[0, -11.5, 0]} castShadow>
          <cylinderGeometry args={[22, 15, 7, 48]} />
          <meshStandardMaterial color="#a6b297" roughness={0.9} />
        </mesh>
        <mesh position={[0, -17, 0]}>
          <cylinderGeometry args={[15, 10, 5, 48]} />
          <meshStandardMaterial color="#819b88" roughness={0.9} />
        </mesh>
      </group>
      <mesh geometry={surfaces.deck} receiveShadow>
        <meshStandardMaterial
          color="#d7d7c3"
          side={T.DoubleSide}
          roughness={0.8}
        />
      </mesh>
      {[surfaces.asphalt, surfaces.loop, ...surfaces.access].map((g, i) => (
        <mesh key={i} geometry={g} receiveShadow>
          <meshStandardMaterial color="#465e62" roughness={0.8} />
        </mesh>
      ))}
      <mesh
        position={[94, 0.036, -8]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[5.2, 40]} />
        <meshStandardMaterial color="#465e62" roughness={0.8} />
      </mesh>
      <mesh geometry={surfaces.cycle}>
        <meshStandardMaterial color="#4ca99b" roughness={0.8} />
      </mesh>
      {[surfaces.walk, surfaces.promenade].map((g, i) => (
        <mesh key={i} geometry={g} receiveShadow>
          <meshStandardMaterial color="#e6dcc0" roughness={0.85} />
        </mesh>
      ))}
      <InstancedBoxes pieces={pieces} night={night} />
      <Html
        position={[112, 27, -8]}
        center
        zIndexRange={[8, 1]}
        style={{ display: immersive ? "block" : "none" }}
      >
        <button className="world-marker" onClick={() => onSelect("projects")}>
          Innovation island<span>Explore the work ↗</span>
        </button>
      </Html>
      <Html
        position={[51, 4.5, -32]}
        center
        zIndexRange={[8, 1]}
        style={{ display: immersive ? "block" : "none" }}
      >
        <span className="infrastructure-sign">
          Innovation island →<small>Bridge · keep right</small>
        </span>
      </Html>
    </>
  );
}
