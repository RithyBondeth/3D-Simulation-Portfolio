import type { Vec3 } from "../../domain/world/types";
import WaterEdge from "./WaterEdge";
import Waterfall from "./Waterfall";
import { Block } from "./rendering/WorldPrimitives";

export function Tree({ at, scale = 1 }: { at: Vec3; scale?: number }) {
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

export default function IslandPark({ night }: { night: boolean }) {
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
      <WaterEdge night={night} />
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
