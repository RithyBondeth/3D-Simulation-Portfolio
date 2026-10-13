import { useCallback, useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as T from "three";
import {
  cyclistPose,
  cycleLoopLength,
  pedestrianLoops,
  pedestrianPose,
} from "../lib/island-district";
import { useCartoonMotion } from "./CartoonMotion";

const coats = [
  "#e4a078",
  "#e6c365",
  "#72aaa3",
  "#486c83",
  "#f0dfbd",
  "#bd8194",
];
const skin = ["#be8762", "#e4b58b", "#8b5b42", "#d59b72"];
const walkers = Array.from({ length: 28 }, (_, i) => {
  const loop = i < 8 ? 0 : i < 16 ? 1 : i < 22 ? 2 : 3;
  const first = [0, 8, 16, 22][loop],
    count = loop < 2 ? 8 : 6;
  const route = pedestrianLoops[loop];
  return {
    loop,
    phase: (i - first) / count,
    speed: 0.75 + (i % 4) * 0.12,
    length: 2 * (route.maxX - route.minX + route.maxZ - route.minZ),
    scale: 0.9 + (i % 3) * 0.07,
  };
});

/** Walking crowds use three instanced meshes, including articulated limbs. */
function Pedestrians() {
  const bodies = useRef<T.InstancedMesh>(null);
  const heads = useRef<T.InstancedMesh>(null);
  const hair = useRef<T.InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);
  const transforms = useMemo(
    () => ({
      root: new T.Object3D(),
      part: new T.Object3D(),
      matrix: new T.Matrix4(),
    }),
    [],
  );
  const animate = useCallback(
    (time: number) => {
      if (!bodies.current || !heads.current || !hair.current) return;
      const { root, part, matrix } = transforms;
      const place = (
        mesh: T.InstancedMesh,
        index: number,
        x: number,
        y: number,
        z: number,
        sx: number,
        sy: number,
        sz: number,
        angle = 0,
      ) => {
        part.position.set(x, y, z);
        part.scale.set(sx, sy, sz);
        part.rotation.set(angle, 0, 0);
        part.updateMatrix();
        matrix.multiplyMatrices(root.matrix, part.matrix);
        mesh.setMatrixAt(index, matrix);
      };
      walkers.forEach((walker, i) => {
        const pose = pedestrianPose(
          walker.loop,
          walker.phase + (time * walker.speed) / walker.length,
        );
        const stride = Math.sin(time * walker.speed * 6 + i * 1.9) * 0.4;
        root.position.set(pose.x, 0.23 + Math.abs(stride) * 0.05, pose.z);
        root.rotation.set(0, pose.yaw, 0);
        root.scale.setScalar(walker.scale);
        root.updateMatrix();
        place(bodies.current!, i * 5, 0, 1.28, 0, 0.58, 0.75, 0.36);
        place(
          bodies.current!,
          i * 5 + 1,
          -0.4,
          1.25,
          0,
          0.17,
          0.68,
          0.2,
          stride,
        );
        place(
          bodies.current!,
          i * 5 + 2,
          0.4,
          1.25,
          0,
          0.17,
          0.68,
          0.2,
          -stride,
        );
        place(
          bodies.current!,
          i * 5 + 3,
          -0.17,
          0.52,
          0,
          0.22,
          0.83,
          0.25,
          -stride,
        );
        place(
          bodies.current!,
          i * 5 + 4,
          0.17,
          0.52,
          0,
          0.22,
          0.83,
          0.25,
          stride,
        );
        place(heads.current!, i, 0, 1.94, 0.015, 0.27, 0.3, 0.27);
        place(hair.current!, i, 0, 2.13, -0.035, 0.48, 0.16, 0.44);
      });
      [bodies.current, heads.current, hair.current].forEach((mesh) => {
        mesh.instanceMatrix.needsUpdate = true;
      });
    },
    [transforms],
  );
  useEffect(() => {
    const color = new T.Color();
    walkers.forEach((_, i) => {
      for (let part = 0; part < 5; part++)
        bodies.current!.setColorAt(
          i * 5 + part,
          color.set(part < 3 ? coats[i % coats.length] : "#3e5663"),
        );
      heads.current!.setColorAt(i, color.set(skin[i % skin.length]));
      hair.current!.setColorAt(
        i,
        color.set(i % 5 === 0 ? "#e4c985" : "#3b4544"),
      );
    });
    [bodies.current!, heads.current!, hair.current!].forEach((mesh) => {
      mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
      mesh.instanceColor!.needsUpdate = true;
    });
    animate(0);
    invalidate();
    // The initial pose also renders when ambient/reduced-motion animation is paused.
  }, [animate, invalidate, transforms]);
  useCartoonMotion(animate);
  return (
    <>
      <instancedMesh
        ref={bodies}
        args={[undefined, undefined, walkers.length * 5]}
        frustumCulled={false}
        castShadow
      >
        <boxGeometry />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={heads}
        args={[undefined, undefined, walkers.length]}
        frustumCulled={false}
        castShadow
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={hair}
        args={[undefined, undefined, walkers.length]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
    </>
  );
}

function Cyclist({ index }: { index: number }) {
  const group = useRef<T.Group>(null);
  const front = useRef<T.Group>(null),
    rear = useRef<T.Group>(null);
  const pose = cyclistPose((index * cycleLoopLength) / 3);
  useCartoonMotion((time) => {
    const distance = time * (2.4 + index * 0.15);
    const position = cyclistPose((index * cycleLoopLength) / 3 + distance);
    group.current!.position.set(position.x, 0.24, position.z);
    group.current!.rotation.y = position.yaw;
    front.current!.rotation.x = rear.current!.rotation.x = distance / 0.43;
  });
  return (
    <group
      ref={group}
      position={[pose.x, 0.24, pose.z]}
      rotation={[0, pose.yaw, 0]}
    >
      {[-0.75, 0.75].map((z, i) => (
        <group key={z} ref={i ? front : rear} position={[0, 0.46, z]}>
          <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
            <torusGeometry args={[0.43, 0.065, 5, 12]} />
            <meshStandardMaterial color="#3d5157" />
          </mesh>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[0.04, 0.74, 0.04]} />
            <meshStandardMaterial color="#a2b8b7" />
          </mesh>
        </group>
      ))}
      {/* Wheel geometry lies in the bicycle's YZ plane. */}
      <BikeFrame color={coats[index * 2]} />
      <mesh position={[0, 1.5, -0.12]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.48, 0.7, 0.35]} />
        <meshStandardMaterial color={coats[index * 2]} />
      </mesh>
      <mesh position={[0, 2.06, 0.08]}>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshStandardMaterial color={skin[index]} />
      </mesh>
      <mesh position={[0, 2.24, 0.08]}>
        <sphereGeometry args={[0.27, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f1e6c8" />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.22, 1.45, 0.33]} rotation={[-0.75, 0, 0]}>
            <boxGeometry args={[0.15, 0.65, 0.17]} />
            <meshStandardMaterial color={coats[index * 2]} />
          </mesh>
          <mesh
            position={[side * 0.18, 0.89, -0.05]}
            rotation={[0.5 * side, 0, 0]}
          >
            <boxGeometry args={[0.2, 0.65, 0.2]} />
            <meshStandardMaterial color="#3e5663" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BikeFrame({ color }: { color: string }) {
  return (
    <>
      {[
        [-0.35, -0.55],
        [0.35, 0.55],
      ].map(([angle, z]) => (
        <mesh key={z} position={[0, 0.83, z]} rotation={[angle, 0, 0]}>
          <boxGeometry args={[0.09, 1, 0.09]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.18, -0.35]}>
        <boxGeometry args={[0.34, 0.12, 0.42]} />
        <meshStandardMaterial color="#334b54" />
      </mesh>
      <mesh position={[0, 1.25, 0.7]}>
        <boxGeometry args={[0.7, 0.08, 0.09]} />
        <meshStandardMaterial color="#334b54" />
      </mesh>
    </>
  );
}

export default function IslandPeople() {
  return (
    <>
      <Pedestrians />
      {[0, 1, 2].map((index) => (
        <Cyclist key={index} index={index} />
      ))}
    </>
  );
}
