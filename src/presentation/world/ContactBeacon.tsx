import { useRef, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import * as T from "three";
import { useSceneMotion } from "./SceneMotion";
import type { SectionId } from "../../domain/portfolio/types";
import { Block, Sign } from "./rendering/WorldPrimitives";
import { mint, coral } from "./rendering/world-palette";

export default function ContactBeacon({
  onSelect,
  showLabel,
}: {
  onSelect: (id: SectionId) => void;
  showLabel: boolean;
}) {
  const beacon = useRef<T.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  useSceneMotion((t) => {
    beacon.current!.position.y = 10 + Math.sin(t * 0.7 + 2) * 0.6;
    beacon.current!.rotation.y = Math.sin(t * 0.25) * 0.12;
  });
  return (
    <group
      ref={beacon}
      position={[32, 10, 39]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("contact");
      }}
    >
      <Block
        size={[4.6, 3.4, 0.9]}
        color={hover ? "#b6d9ab" : "#38664e"}
        radius={0.65}
      />
      <Sign
        text="@"
        at={[0, 0.1, 0.47]}
        width={2.5}
        height={2}
        color="#2b4a50"
      />
      <mesh rotation={[0.5, 0.2, 0.25]}>
        <torusGeometry args={[3.4, 0.04, 6, 48]} />
        <meshBasicMaterial color={mint} />
      </mesh>
      <mesh position={[0, -3.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.9, 32]} />
        <meshBasicMaterial
          color={coral}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
      <Html
        position={[0, -3, 0]}
        center
        zIndexRange={[12, 1]}
        style={{ display: showLabel ? "block" : "none" }}
      >
        <button
          className="world-marker contact-marker"
          onClick={(e) => {
            e.stopPropagation();
            onSelect("contact");
          }}
        >
          <span className="beacon-context">Let’s make something</span>
          <span className="beacon-action">Say hello ↗</span>
        </button>
      </Html>
    </group>
  );
}
