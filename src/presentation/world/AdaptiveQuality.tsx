import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { shouldReduceQuality } from "../../domain/world/graphics-quality";

export default function AdaptiveQuality({
  enabled,
  onReduce,
}: {
  enabled: boolean;
  onReduce: () => void;
}) {
  const frames = useRef<number[]>([]);
  const warmup = useRef(0);
  useFrame((_, dt) => {
    if (!enabled || document.hidden) {
      frames.current = [];
      warmup.current = 0;
      return;
    }
    warmup.current += Math.min(dt, 0.1);
    if (warmup.current < 3) return;
    frames.current.push(Math.min(dt, 0.25));
    if (frames.current.length === 90) {
      if (shouldReduceQuality(frames.current)) onReduce();
      frames.current = [];
    }
  });
  return null;
}
