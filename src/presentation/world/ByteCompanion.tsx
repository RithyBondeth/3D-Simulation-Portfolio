import { useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import * as T from "three";
import {
  byteHead,
  byteEyes,
  byteMouth,
  byteLightPalette,
} from "../../domain/brand/byte";
import { InstancedBoxes, type BoxPiece } from "./rendering/InstancedBoxes";
import { useSceneMotion } from "./SceneMotion";
import type { SectionId } from "../../domain/portfolio/types";

/** The logo's exact pixel grid, extruded into a small floating guide. */
export default function ByteCompanion({
  onSelect,
  showLabel,
  night,
}: {
  onSelect: (id: SectionId) => void;
  showLabel: boolean;
  night: boolean;
}) {
  const group = useRef<T.Group>(null);
  const [hover, setHover] = useState(false);
  const camera = useThree((state) => state.camera);
  useCursor(hover);
  const pieces = useMemo<BoxPiece[]>(() => {
    const palette = night
      ? { ink: "#b6d9ab", face: "#223c33", shade: "#304e40", accent: "#9fddb2" }
      : byteLightPalette;
    const eyes = hover
      ? [...byteEyes.slice(0, 2), [20, 15, 4, 1, "ink"] as const]
      : byteEyes;
    return [...byteHead, ...eyes, ...byteMouth].map(
      ([x, y, w, h, paint], i) => ({
        at: [
          (x + w / 2 - 17) * 0.2,
          (13 - y - h / 2) * 0.2,
          paint === "ink" && i < byteHead.length ? 0 : 0.82 + i * 0.012,
        ],
        size: [
          w * 0.2,
          h * 0.2,
          paint === "ink" && i < byteHead.length ? 1.6 : 0.16,
        ],
        color: paint === "accent" && hover ? "#72b788" : palette[paint],
      }),
    );
  }, [hover, night]);
  useSceneMotion((t) => {
    if (!group.current) return;
    group.current.position.y = 16 + Math.sin(t * 0.8) * 0.5;
    const yaw = Math.atan2(camera.position.x + 15, camera.position.z - 12);
    group.current.rotation.y = yaw + Math.sin(t * 0.35) * 0.08;
  });
  return (
    <group
      ref={group}
      position={[-15, 16, 12]}
      rotation={[0, -0.12, 0]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect("about");
      }}
    >
      <InstancedBoxes pieces={pieces} night={night} />
      <mesh position={[0, -3.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.1, 0.045, 6, 40]} />
        <meshBasicMaterial
          color="#9be7ad"
          transparent
          opacity={hover ? 0.8 : 0.4}
        />
      </mesh>
      <Html
        position={[0, 10, 0]}
        center
        zIndexRange={[12, 1]}
        style={{ display: showLabel ? "block" : "none" }}
      >
        <button
          className="world-marker companion-marker"
          aria-label="Byte: meet Bondeth"
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          onClick={(event) => {
            event.stopPropagation();
            onSelect("about");
          }}
        >
          Hey, I’m Byte<span>Meet Bondeth, my maker ↗</span>
        </button>
      </Html>
    </group>
  );
}
