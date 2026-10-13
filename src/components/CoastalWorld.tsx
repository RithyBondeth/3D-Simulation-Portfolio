import { useEffect, useMemo, useRef } from "react";
import * as T from "three";
import { useCartoonMotion } from "./CartoonMotion";
import type { GraphicsQuality } from "../lib/graphics-quality";

const seaLevel = -19;

/** A single opaque water draw, with analytic waves instead of reflection render targets. */
function Ocean({ night }: { night: boolean }) {
  const material = useMemo(
    () =>
      new T.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          deep: { value: new T.Color() },
          shallow: { value: new T.Color() },
          haze: { value: new T.Color() },
          light: { value: new T.Color() },
        },
        vertexShader: `varying vec3 world; void main(){
      vec4 p=modelMatrix*vec4(position,1.); world=p.xyz;
      gl_Position=projectionMatrix*viewMatrix*p;
    }`,
        fragmentShader: `varying vec3 world;
      uniform float time; uniform vec3 deep; uniform vec3 shallow; uniform vec3 haze; uniform vec3 light;
      void main(){
        vec2 p=world.xz;
        float wave=sin(p.x*.19+p.y*.12+time*.65)*sin(p.y*.27-p.x*.08-time*.45);
        float swell=sin(p.x*.047+p.y*.065+time*.22);
        float rim=1.-smoothstep(55.,145.,length(p));
        vec3 color=mix(deep,shallow,rim*.55+wave*.065+swell*.045);
        float glint=pow(max(0.,sin(p.x*.7+p.y*.47+time*.8)*sin(p.y*.52-time*.5)),18.);
        float path=exp(-pow((p.x+p.y*.35+70.)/45.,2.));
        color+=light*glint*(.05+path*.2);
        float distanceToEye=length(world-cameraPosition);
        color=mix(color,haze,smoothstep(200.,620.,distanceToEye));
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
      }),
    [],
  );
  useEffect(() => {
    material.uniforms.deep.value.set(night ? "#123d4b" : "#408f9b");
    material.uniforms.shallow.value.set(night ? "#287b82" : "#8bccc2");
    material.uniforms.haze.value.set(night ? "#224952" : "#bddbd7");
    material.uniforms.light.value.set(night ? "#8ccbd9" : "#fff1cb");
  }, [night, material]);
  useEffect(() => () => material.dispose(), [material]);
  useCartoonMotion((time) => {
    material.uniforms.time.value = time;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, seaLevel, 0]}>
      <planeGeometry args={[1600, 1600]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function CoastalBoat({ phase, night }: { phase: number; night: boolean }) {
  const boat = useRef<T.Group>(null);
  useCartoonMotion((time) => {
    const angle = phase + time * 0.012;
    boat.current!.position.set(
      Math.cos(angle) * 118,
      seaLevel + 0.65 + Math.sin(time * 0.7 + phase) * 0.16,
      Math.sin(angle) * 102,
    );
    boat.current!.rotation.set(
      Math.sin(time * 0.5 + phase) * 0.035,
      -angle,
      Math.sin(time * 0.6) * 0.04,
    );
  });
  return (
    <group
      ref={boat}
      position={[Math.cos(phase) * 118, seaLevel + 0.65, Math.sin(phase) * 102]}
      rotation={[0, -phase, 0]}
    >
      <mesh scale={[1.2, 0.65, 3.8]}>
        <sphereGeometry args={[1, 10, 6]} />
        <meshStandardMaterial color="#f4e7c9" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.7, 0.5]}>
        <boxGeometry args={[1.4, 1.1, 2]} />
        <meshStandardMaterial color="#c47f5e" />
      </mesh>
      <mesh position={[0, 1.5, 0.5]}>
        <boxGeometry args={[1.8, 0.16, 2.5]} />
        <meshStandardMaterial color="#f8ecd0" />
      </mesh>
      <mesh position={[0, 1.45, -0.55]}>
        <boxGeometry args={[0.7, 0.3, 0.03]} />
        <meshBasicMaterial color={night ? "#ffdf91" : "#446a70"} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, -0.55, 5 + i * 3]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1 + i * 1.8, 0.2]} />
          <meshBasicMaterial
            color="#d3eee4"
            transparent
            opacity={0.3 - i * 0.07}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Distant silhouettes sit outside every road and interactive destination. */
export default function CoastalWorld({
  night,
  quality,
}: {
  night: boolean;
  quality: GraphicsQuality;
}) {
  const count = quality === "low" ? 5 : 8;
  return (
    <>
      <Ocean night={night} />
      {Array.from({ length: count }, (_, i) => {
        const angle = i * 2.39996 + 0.5,
          radius = 205 + (i % 3) * 63;
        return (
          <group
            key={i}
            position={[
              Math.cos(angle) * radius,
              seaLevel,
              Math.sin(angle) * radius,
            ]}
            rotation={[0, angle, 0]}
            scale={0.8 + (i % 3) * 0.35}
          >
            <mesh position={[0, 0.2, 0]} scale={[20, 1.4, 12]}>
              <sphereGeometry args={[1, 12, 6]} />
              <meshStandardMaterial color="#d4c7a5" roughness={1} />
            </mesh>
            <mesh position={[-2, 2, 0]} scale={[16, 6, 9]}>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial
                color={night ? "#31595b" : "#7d9d8c"}
                roughness={1}
                flatShading
              />
            </mesh>
            <mesh position={[6, 2, 1]} scale={[9, 4, 7]}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color={night ? "#294e53" : "#688d80"}
                roughness={1}
                flatShading
              />
            </mesh>
          </group>
        );
      })}
      <CoastalBoat phase={0.6} night={night} />
      {quality === "high" && <CoastalBoat phase={3.8} night={night} />}
    </>
  );
}
