import { useEffect, useMemo, useRef } from "react";
import * as T from "three";
import { useThree } from "@react-three/fiber";
import { landmarkFootprints } from "../../domain/world/island-layout";
import { districtBuildings } from "../../domain/world/district-layout";
import { innovationBuildings } from "../../domain/world/infrastructure";

/** A single static draw adds contact depth without another shadow render pass. */
export default function GroundingShadows() {
  const mesh = useRef<T.InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(32, 32, 8, 32, 32, 32);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.55, "#ffffff88");
    gradient.addColorStop(1, "#ffffff00");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(canvas);
  }, []);
  const footprints = useMemo(
    () => [
      ...landmarkFootprints,
      ...districtBuildings,
      ...innovationBuildings,
      ...[-1, 1].flatMap((side) =>
        [-10, -1, 10].map((z, i) => ({
          x: side * (10.5 + (i % 2)),
          z,
          w: 3.6,
          d: 3.6,
        })),
      ),
      ...[
        [-36, 12],
        [36, 12],
        [-35, -24],
        [35, -24],
        [-23, -34],
        [23, -34],
      ].map(([x, z]) => ({ x, z, w: 4.2, d: 4.2 })),
    ],
    [],
  );
  useEffect(() => {
    const transform = new T.Object3D();
    footprints.forEach((b, i) => {
      transform.position.set(b.x, 0.175, b.z);
      transform.rotation.set(-Math.PI / 2, 0, 0);
      transform.scale.set(b.w + 4, b.d + 4, 1);
      transform.updateMatrix();
      mesh.current!.setMatrixAt(i, transform.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
    mesh.current!.computeBoundingSphere();
    invalidate();
  }, [footprints, invalidate]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, footprints.length]}
      renderOrder={1}
    >
      <planeGeometry />
      <meshBasicMaterial
        map={texture}
        color="#193e30"
        transparent
        opacity={0.24}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
