import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as T from "three";
import type { Vec3 } from "../../../domain/world/types";

export type BoxPiece = { at: Vec3; size: Vec3; color: string; rotation?: Vec3 };
/** Hundreds of windows, roof panels and street details share two draw calls. */
export function InstancedBoxes({
  pieces,
  glass = false,
  night,
}: {
  pieces: BoxPiece[];
  glass?: boolean;
  night: boolean;
}) {
  const mesh = useRef<T.InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const obj = new T.Object3D();
    const color = new T.Color();
    pieces.forEach((piece, index) => {
      obj.position.set(...piece.at);
      obj.scale.set(...piece.size);
      obj.rotation.set(...(piece.rotation ?? [0, 0, 0]));
      obj.updateMatrix();
      mesh.current!.setMatrixAt(index, obj.matrix);
      mesh.current!.setColorAt(
        index,
        color.set(glass && night ? "#f4d7a0" : piece.color),
      );
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
    if (mesh.current!.instanceColor)
      mesh.current!.instanceColor.needsUpdate = true;
    mesh.current!.computeBoundingSphere();
    invalidate();
  }, [pieces, glass, night, invalidate]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, pieces.length]}
      castShadow={!glass}
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial
        roughness={glass ? 0.3 : 0.78}
        metalness={glass ? 0.28 : 0.08}
        emissive={glass && night ? "#dfae64" : "#000000"}
        emissiveIntensity={glass && night ? 0.28 : 0}
      />
    </instancedMesh>
  );
}
