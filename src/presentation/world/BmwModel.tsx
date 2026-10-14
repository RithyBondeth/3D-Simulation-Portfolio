import { useEffect, useMemo, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as T from "three";
import { type CarState } from "../../domain/world/driving";

function CambodiaPlates() {
  const texture = useTexture("/textures/cambodia-plate.png");
  texture.colorSpace = T.SRGBColorSpace;
  return (
    <>
      {[
        { z: -2.45, y: 0.74, width: 0.8 },
        { z: 2.44, y: 0.48, width: 0.77 },
      ].map(({ z, y, width }) => (
        <group
          key={z}
          position={[0, y, z]}
          rotation={[0, z < 0 ? Math.PI : 0, 0]}
        >
          <mesh position={[0, 0, -0.018]} castShadow>
            <boxGeometry args={[width + 0.025, width / 4.73 + 0.022, 0.025]} />
            <meshStandardMaterial color="#172126" roughness={0.5} />
          </mesh>
          <mesh>
            <planeGeometry args={[width, width / 4.73]} />
            <meshStandardMaterial map={texture} roughness={0.45} />
          </mesh>
        </group>
      ))}
    </>
  );
}
export default function BmwModel({
  car,
  steering,
}: {
  car: MutableRefObject<CarState>;
  steering: MutableRefObject<number>;
}) {
  const { scene } = useGLTF("/models/bmw-m4.glb");
  const model = useMemo(() => {
    const clone = scene.clone(true),
      root = new T.Group(),
      wheels: T.Group[] = [],
      frontWheels: T.Group[] = [];
    const materials = new Map<string, T.MeshStandardMaterial>(),
      geometries: T.BufferGeometry[] = [];
    clone.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(clone),
      size = box.getSize(new T.Vector3()),
      center = box.getCenter(new T.Vector3());
    clone.traverse((child) => {
      if (!(child instanceof T.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const customize = (original: T.MeshStandardMaterial) => {
        const paint =
          /body151|zx1|livery/i.test(original.name) ||
          ["Object_24", "Object_30"].includes(child.name);
        const key = original.uuid + (paint ? "paint" : "");
        if (materials.has(key)) return materials.get(key)!;
        const m = original.clone();
        if (paint) {
          m.color.set("#8acbdd");
          m.metalness = 0.35;
          m.roughness = 0.32;
          m.map = null;
          m.vertexColors = false;
        }
        if (/windows/i.test(m.name)) {
          m.color.set("#183544");
          m.roughness = 0.4;
          m.metalness = 0.15;
          m.transparent = false;
          m.opacity = 1;
          m.map = null;
        }
        if (/chrome51/i.test(m.name)) {
          m.color.set("#718b96");
          m.metalness = 0.8;
          m.roughness = 0.25;
        }
        if (/led111/i.test(m.name)) {
          m.emissive.set("#e0f5ff");
          m.emissiveIntensity = 0.65;
        }
        if (/m8rim001/i.test(m.name)) {
          m.color.set("#181c20");
          m.metalness = 0.04;
          m.roughness = 0.88;
        } else if (/m8rim1/i.test(m.name)) {
          m.color.set("#53636c");
          m.metalness = 0.85;
          m.roughness = 0.25;
        }
        if (/caliper/i.test(m.name)) {
          m.color.set("#34799d");
          m.metalness = 0.4;
        }
        materials.set(key, m);
        return m;
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(customize)
        : customize(child.material);
      if (/m8rim/i.test((child.material as T.Material).name)) {
        // The artist grouped all four wheels in one mesh. Split the triangles into
        // wheel quadrants so the actual model's tyres and rims can roll and steer.
        const source: T.BufferGeometry = child.geometry.index
          ? child.geometry.toNonIndexed()
          : child.geometry.clone();
        const quantized = source.getAttribute("position");
        const decoded = new Float32Array(quantized.count * 3);
        for (let v = 0; v < quantized.count; v++) {
          decoded[v * 3] = quantized.getX(v);
          decoded[v * 3 + 1] = quantized.getY(v);
          decoded[v * 3 + 2] = quantized.getZ(v);
        }
        source.setAttribute("position", new T.BufferAttribute(decoded, 3));
        source.applyMatrix4(child.matrixWorld);
        const pos = source.getAttribute("position");
        const indices: number[][] = [[], [], [], []];
        for (let i = 0; i < pos.count; i += 3) {
          const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
          const z = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
          indices[(x > center.x ? 1 : 0) + (z > center.z ? 2 : 0)].push(
            i,
            i + 1,
            i + 2,
          );
        }
        indices.forEach((list, index) => {
          if (!list.length) return;
          const geo = new T.BufferGeometry();
          for (const [name, attr] of Object.entries(source.attributes)) {
            const values = new Float32Array(list.length * attr.itemSize);
            list.forEach((v, j) => {
              for (let k = 0; k < attr.itemSize; k++)
                values[j * attr.itemSize + k] = attr.getComponent(v, k);
            });
            geo.setAttribute(
              name,
              new T.BufferAttribute(values, attr.itemSize),
            );
          }
          geo.computeBoundingBox();
          const c = geo.boundingBox!.getCenter(new T.Vector3());
          geo.translate(-c.x, -c.y, -c.z);
          geometries.push(geo);
          const pivot = new T.Group(),
            rolling = new T.Group(),
            mesh = new T.Mesh(geo, child.material);
          pivot.position.copy(c);
          rolling.add(mesh);
          pivot.add(rolling);
          root.add(pivot);
          mesh.castShadow = true;
          wheels.push(rolling);
          if (index >= 2) frontWheels.push(pivot);
        });
        source.dispose();
        child.visible = false;
      }
    });
    root.add(clone);
    const scale = 4.85 / Math.max(size.x, size.z);
    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    return { root, wheels, frontWheels, materials, geometries };
  }, [scene]);
  useFrame((_, dt) => {
    model.wheels.forEach((w) => {
      w.rotation.x += (car.current.speed * Math.min(dt, 0.1)) / 0.36;
    });
    model.frontWheels.forEach((w) => {
      w.rotation.y = -steering.current * 0.4;
    });
  });
  useEffect(
    () => () => {
      model.materials.forEach((m) => m.dispose());
      model.geometries.forEach((g) => g.dispose());
    },
    [model],
  );
  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={model.root} />
      <CambodiaPlates />
    </group>
  );
}
