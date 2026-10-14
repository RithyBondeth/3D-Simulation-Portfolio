import { useEffect, useMemo } from "react";
import * as T from "three";
import { useSceneMotion } from "./SceneMotion";

export default function Waterfall() {
  const material = useMemo(
    () =>
      new T.ShaderMaterial({
        transparent: true,
        side: T.DoubleSide,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader:
          "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: `varying vec2 vUv;uniform float uTime;void main(){float line=pow(.5+.5*sin(vUv.x*100.+sin(vUv.y*7.+uTime)*2.),5.);float flow=.7+.3*sin(vUv.y*25.+uTime*2.);float alpha=smoothstep(0.,.1,vUv.x)*(1.-smoothstep(.9,1.,vUv.x))*smoothstep(0.,.2,vUv.y);gl_FragColor=vec4(mix(vec3(.1,.49,.51),vec3(.65,.94,.83),line*flow),alpha*.75);
#include <colorspace_fragment>
}`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useSceneMotion((t) => {
    material.uniforms.uTime.value = t;
  });
  return (
    <group position={[17, -7.5, 59.7]}>
      <mesh>
        <planeGeometry args={[8, 15]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, -7.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial
          color="#8ce8ce"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
