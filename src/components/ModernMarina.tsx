import { useMemo } from "react";
import { Instances, type Piece } from "./IslandDistrict";

/** Floating pontoons and solar shade sit below the island, outside the driving world. */
export default function ModernMarina({ night }: { night: boolean }) {
  const pieces = useMemo(() => {
    const result: Piece[] = [];
    const box = (at: Piece["at"], size: Piece["size"], color: string) =>
      result.push({ at, size, color });
    box([0, 0, 70], [30, 0.7, 4], "#f0ead7");
    box([0, 0.38, 70], [29, 0.12, 3.5], "#cda276");
    for (const side of [-1, 1]) {
      box([side * 11, 0, 74], [2.7, 0.7, 8], "#f0ead7");
      box([side * 11, 0.38, 74], [2.2, 0.12, 7.6], "#cda276");
      for (const z of [68.5, 71.5]) {
        box([side * 8, 1.8, z], [0.12, 3.6, 0.12], "#3b6871");
        box([side * 14, 1.8, z], [0.12, 3.6, 0.12], "#3b6871");
      }
      box([side * 11, 3.7, 70], [7, 0.2, 4.8], "#f5f0e0");
      for (let i = 0; i < 4; i++)
        box(
          [side * 11 - 2.5 + i * 1.65, 3.85, 70],
          [1.45, 0.12, 3.7],
          "#275c7d",
        );
      for (const z of [73, 77]) {
        box([side * 11, 0.85, z], [0.35, 0.8, 0.35], "#345463");
        box(
          [side * 11, 1.3, z],
          [0.45, 0.12, 0.45],
          night ? "#7ee9e2" : "#d8f4e6",
        );
      }
      // Two low-profile electric tenders in the sheltered berths.
      box([side * 6, 0.6, 74], [2.8, 0.7, 5.8], "#f1eee0");
      box([side * 6, 1.2, 74], [2.2, 0.5, 3.2], "#28596b");
      box([side * 6, 1.55, 74.5], [2.6, 0.15, 3.4], "#f3ecd9");
    }
    box([0, 0.5, 68], [27, 0.08, 0.08], "#4dd6cb");
    return result;
  }, [night]);
  return (
    <group position={[-78, -18.6, -105]}>
      <Instances pieces={pieces} night={night} />
    </group>
  );
}
