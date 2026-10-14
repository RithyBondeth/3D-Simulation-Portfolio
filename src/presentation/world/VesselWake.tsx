import { useEffect, useMemo, useRef } from "react";
import * as T from "three";
import { useThree } from "@react-three/fiber";
import { fleet, vesselWakePoint } from "../../domain/world/maritime";
import { useSceneMotion } from "./SceneMotion";
import type { GraphicsQuality } from "../../domain/world/graphics-quality";

/** Two tapered foam ribbons share one draw and follow the vessel's curved history. */
export default function VesselWake({
  vessel,
  width,
  night,
  quality,
}: {
  vessel: (typeof fleet)[number];
  width: number;
  night: boolean;
  quality: GraphicsQuality;
}) {
  const segments = quality === "low" ? 12 : 28;
  const invalidate = useThree((state) => state.invalidate);
  const elapsed = useRef(0);
  const geometry = useMemo(() => {
    const geometry = new T.BufferGeometry();
    const positions = new T.BufferAttribute(
      new Float32Array((segments + 1) * 12),
      3,
    );
    positions.setUsage(T.DynamicDrawUsage);
    const uv: number[] = [],
      indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      uv.push(u, 0, u, 1, u, 0, u, 1);
      if (i < segments) {
        const a = i * 4;
        for (const side of [0, 2])
          indices.push(
            a + side,
            a + side + 1,
            a + side + 4,
            a + side + 1,
            a + side + 5,
            a + side + 4,
          );
      }
    }
    geometry.setAttribute("position", positions);
    geometry.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    return geometry;
  }, [segments]);
  const material = useMemo(
    () =>
      new T.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: T.DoubleSide,
        uniforms: {
          time: { value: 0 },
          opacity: { value: night ? 0.3 : 0.58 },
        },
        vertexShader: `varying vec2 vUv; void main(){
      vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
    }`,
        fragmentShader: `varying vec2 vUv; uniform float time; uniform float opacity;
      void main(){
        float fade=pow(1.-vUv.x,1.7)*smoothstep(0.,.035,vUv.x);
        float edge=sin(vUv.y*3.14159);
        float ripple=.6+.4*sin(vUv.x*43.-time*1.6);
        gl_FragColor=vec4(vec3(.78,.96,.89),opacity*fade*edge*ripple);
        #include <colorspace_fragment>
      }`,
      }),
    [night],
  );
  const paint = useMemo(
    () => (time: number) => {
      elapsed.current = time;
      const positions = geometry.getAttribute("position") as T.BufferAttribute;
      for (let i = 0; i <= segments; i++) {
        const age = (i / segments) * 10;
        const point = vesselWakePoint(vessel, time, age);
        const spread = width * 0.35 + age * 0.32;
        const thickness = 0.18 + age * 0.035;
        for (let side = 0; side < 2; side++) {
          for (let edge = 0; edge < 2; edge++) {
            const offset =
              (side === 0 ? -1 : 1) * (spread + (edge - 0.5) * thickness);
            positions.setXYZ(
              i * 4 + side * 2 + edge,
              point.x + Math.cos(point.yaw) * offset,
              -18.94,
              point.z - Math.sin(point.yaw) * offset,
            );
          }
        }
      }
      positions.needsUpdate = true;
      material.uniforms.time.value = time;
    },
    [geometry, segments, vessel, width, material],
  );
  useEffect(() => {
    paint(elapsed.current);
    invalidate();
  }, [paint, invalidate]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useSceneMotion(paint);
  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}
