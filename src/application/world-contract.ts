import { type MutableRefObject } from "react";
import { type MovementInput } from "./driving-input";
import { type SectionId } from "../domain/portfolio/types";
import { type RoadTelemetry } from "../domain/world/driving";
import { type DistrictId } from "../domain/portfolio/project-districts";
import { type GraphicsQuality } from "../domain/world/graphics-quality";

export type WorldCanvasProps = {
  graphicsQuality: GraphicsQuality;
  automaticQuality: boolean;
  onReduceQuality: () => void;
  selected: SectionId | null;
  onSelect: (id: SectionId) => void;
  onReady: () => void;
  onNear: (id: SectionId | null) => void;
  onTelemetry: (value: RoadTelemetry) => void;
  night: boolean;
  reduceMotion: boolean;
  paused: boolean;
  reset: number;
  movement: MutableRefObject<MovementInput>;
  immersive: boolean;
  onDrive: () => void;
  journeyProgress: number;
  ambientPaused: boolean;
  activeDistrictId: DistrictId;
  projectIndex: number;
  onDistrict: (id: DistrictId) => void;
};
