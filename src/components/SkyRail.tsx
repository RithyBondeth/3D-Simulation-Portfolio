import { useEffect, useMemo } from "react";
import * as T from "three";
import { Instances, type Piece } from "./IslandDistrict";
import RailStation from "./RailStation";
import {
  railPose,
  railLength,
  railHeight,
  railPeriod,
  railStations,
  railSupports,
  stationSupports,
} from "../lib/sky-rail";
import SkyTrain from "./SkyTrain";
import type { GraphicsQuality } from "../lib/graphics-quality";
import type { SectionId } from "../types";
export default function SkyRail({
  night,
  quality,
  immersive,
  chapter,
  onSelect,
}: {
  night: boolean;
  quality: GraphicsQuality;
  immersive: boolean;
  chapter: number;
  onSelect: (id: SectionId) => void;
}) {
  const segments = quality === "low" ? 96 : 160;
  const track = useMemo(() => {
    const deck: Piece[] = [];
    for (let i = 0; i < segments; i++) {
      const pose = railPose(((i + 0.5) / segments) * railLength);
      deck.push({
        at: [pose.x, railHeight - 0.45, pose.z],
        size: [3.7, 0.6, railLength / segments + 0.1],
        rotation: [0, pose.yaw, 0],
        color: "#cbd6c5",
      });
    }
    for (const support of [...railSupports, ...stationSupports]) {
      deck.push({
        at: [support.x, (railHeight - 0.7) / 2, support.z],
        size: [support.w, railHeight - 0.7, support.d],
        color: "#b4c5b3",
      });
      deck.push({
        at: [support.x, 0.25, support.z],
        size: [support.w + 0.7, 0.5, support.d + 0.7],
        color: "#cdd7c2",
      });
    }
    const rails = [-0.92, 0.92].map((offset) => {
      const points = Array.from({ length: segments }, (_, i) => {
        const pose = railPose((i / segments) * railLength);
        return new T.Vector3(
          pose.x + Math.cos(pose.yaw) * offset,
          railHeight - 0.05,
          pose.z - Math.sin(pose.yaw) * offset,
        );
      });
      return new T.TubeGeometry(
        new T.CatmullRomCurve3(points, true),
        segments * 2,
        0.065,
        5,
        true,
      );
    });
    return { deck, rails };
  }, [segments]);
  useEffect(() => () => track.rails.forEach((rail) => rail.dispose()), [track]);
  const trains = quality === "low" ? 1 : 2;
  return (
    <>
      <Instances pieces={track.deck} night={night} />
      {track.rails.map((rail, i) => (
        <mesh key={i} geometry={rail}>
          <meshStandardMaterial
            color="#52776e"
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>
      ))}
      {Array.from({ length: trains }, (_, i) => (
        <SkyTrain key={i} phase={(i * railPeriod) / trains} night={night} />
      ))}
      {railStations.map((station) => (
        <RailStation
          key={station.id}
          station={station}
          night={night}
          trains={trains}
          onSelect={onSelect}
          showLabel={
            immersive ||
            (station.id === "work" && chapter === 3) ||
            (station.id === "labs" && chapter === 4) ||
            (station.id === "waterfront" && chapter === 5)
          }
        />
      ))}
    </>
  );
}
