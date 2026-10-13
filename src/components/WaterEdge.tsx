import { useEffect, useMemo } from "react";
import * as T from "three";
import { useThree } from "@react-three/fiber";
import { useCartoonMotion } from "./CartoonMotion";

/** Shallow waterfront water, with a broken foam line where it meets the beach. */
export default function WaterEdge({ night }: { night: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  const material = useMemo(
    () =>
      new T.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          deep: { value: new T.Color() },
          shallow: { value: new T.Color() },
          foamColor: { value: new T.Color() },
        },
        vertexShader: `varying vec2 vUv; void main(){
      vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
    }`,
        fragmentShader: `varying vec2 vUv; uniform float time;
      uniform vec3 deep; uniform vec3 shallow; uniform vec3 foamColor;
      void main(){
        float wave=sin(vUv.x*85.+time*.65)*sin(vUv.y*23.-time*.4);
        vec3 water=mix(deep,shallow,vUv.y*.55+wave*.06);
        float shore=1.-vUv.y;
        float edge=.065+sin(vUv.x*65.+time*.5)*.018;
        float foam=exp(-pow((shore-edge)/.025,2.));
        foam*=.45+.55*smoothstep(-.7,.6,sin(vUv.x*113.-time*.8));
        gl_FragColor=vec4(mix(water,foamColor,foam*.7),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
      }),
    [],
  );
  useEffect(() => {
    material.uniforms.deep.value.set(night ? "#1e5a57" : "#358f86");
    material.uniforms.shallow.value.set(night ? "#347c72" : "#62b5a5");
    material.uniforms.foamColor.value.set(night ? "#86b7a0" : "#e0f4de");
    invalidate();
  }, [material, night, invalidate]);
  useEffect(() => () => material.dispose(), [material]);
  useCartoonMotion((time) => {
    material.uniforms.time.value = time;
  });
  return (
    <mesh position={[0, 0.012, 51]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[96, 6]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
