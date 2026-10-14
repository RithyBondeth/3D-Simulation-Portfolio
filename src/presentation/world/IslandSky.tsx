import { useEffect, useMemo, useRef } from "react";
import * as T from "three";
import { useSceneMotion } from "./SceneMotion";
import type { Vec3 } from "../../domain/world/types";
import { Block } from "./rendering/WorldPrimitives";
import { mint } from "./rendering/world-palette";
import { Tree } from "./IslandPark";

export function SatelliteIsland({
  at,
  scale,
  phase,
}: {
  at: Vec3;
  scale: number;
  phase: number;
}) {
  const island = useRef<T.Group>(null);
  useSceneMotion((t) => {
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

export default function IslandSky({ night }: { night: boolean }) {
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
