import { useEffect, useMemo, useRef, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import * as T from "three";
import { useSceneMotion } from "./SceneMotion";
import type { SectionId } from "../../domain/portfolio/types";
import { Block } from "./rendering/WorldPrimitives";
import { mint, coral } from "./rendering/world-palette";

export default function AiPortal({
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
  useSceneMotion((t) => {
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
