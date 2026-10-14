import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as T from "three";
import type { Vec3 } from "../../../domain/world/types";
import { mint, ink } from "./world-palette";

export function Block({
  at = [0, 0, 0],
  size,
  color = ink,
  radius = 0.35,
  glow = false,
}: {
  at?: Vec3;
  size: Vec3;
  color?: string;
  radius?: number;
  glow?: boolean;
}) {
  return (
    <RoundedBox
      position={at}
      args={size}
      radius={Math.min(radius, ...size.map((v) => v * 0.45))}
      smoothness={3}
      bevelSegments={2}
      castShadow={!glow}
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={0.64}
        metalness={0.12}
        emissive={glow ? color : "#000000"}
        emissiveIntensity={glow ? 1.4 : 0}
      />
    </RoundedBox>
  );
}

export function roundedRect(w: number, d: number, r: number) {
  const s = new T.Shape(),
    x = -w / 2,
    y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export function Sign({
  text,
  at,
  width,
  color = mint,
  height = 1.1,
}: {
  text: string;
  at: Vec3;
  width: number;
  color?: string;
  height?: number;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 160;
    const map = new T.CanvasTexture(c);
    map.colorSpace = T.SRGBColorSpace;
    return map;
  }, []);
  useEffect(() => {
    let active = true;
    const paint = () => {
      if (!active) return;
      const ctx = (texture.image as HTMLCanvasElement).getContext("2d")!;
      ctx.clearRect(0, 0, 1024, 160);
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 86px Ubuntu, sans-serif";
      ctx.fillText(text, 512, 84, 980);
      texture.needsUpdate = true;
      invalidate();
    };
    paint();
    // Canvas does not repaint when a web font arrives, unlike DOM text.
    void document.fonts.load("700 86px Ubuntu").then(paint, () => {});
    return () => {
      active = false;
    };
  }, [texture, text, color, invalidate]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={at}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
