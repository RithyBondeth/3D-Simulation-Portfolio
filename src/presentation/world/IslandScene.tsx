import { type MutableRefObject } from "react";
import * as T from "three";
import type { DistrictId } from "../../domain/portfolio/project-districts";
import type { SectionId } from "../../domain/portfolio/types";
import IslandAtmosphere from "./IslandAtmosphere";
import IslandDistrict from "./IslandDistrict";
import IslandLandmarks from "./IslandLandmarks";
import PortalArchitecture from "./PortalArchitecture";
import ByteCompanion from "./ByteCompanion";
import BridgeDistrict from "./BridgeDistrict";
import ModernBuildings from "./ModernBuildings";
import SkyRail from "./SkyRail";
import type { GraphicsQuality } from "../../domain/world/graphics-quality";
import IslandSky, { SatelliteIsland } from "./IslandSky";
import IslandGround from "./IslandGround";
import ProjectArchitecture from "./ProjectArchitecture";
import IslandPark from "./IslandPark";
import AiPortal from "./AiPortal";
import ContactBeacon from "./ContactBeacon";
/** A compact, collision-aligned world; the portfolio lives inside its landmarks. */
export default function IslandScene({
  night,
  quality,
  onSelect,
  buildingsRef,
  chapter,
  immersive,
  activeDistrictId,
  projectIndex,
  onDistrict,
}: {
  night: boolean;
  quality: GraphicsQuality;
  chapter: number;
  immersive: boolean;
  onSelect: (id: SectionId) => void;
  buildingsRef: MutableRefObject<T.Group | null>;
  activeDistrictId: DistrictId;
  projectIndex: number;
  onDistrict: (id: DistrictId) => void;
}) {
  return (
    <>
      <IslandSky night={night} />
      <IslandGround />
      <group ref={buildingsRef}>
        <ProjectArchitecture
          activeDistrictId={activeDistrictId}
          projectIndex={projectIndex}
          showProjectLabels={chapter === 3 || immersive}
          onDistrict={onDistrict}
        />
        <IslandDistrict night={night} />
        <PortalArchitecture night={night} />
        <ModernBuildings night={night} />
      </group>
      <BridgeDistrict night={night} onSelect={onSelect} immersive={immersive} />
      <SkyRail
        night={night}
        quality={quality}
        immersive={immersive}
        chapter={chapter}
        onSelect={onSelect}
      />
      <IslandPark night={night} />
      <IslandLandmarks night={night} />
      <AiPortal onSelect={onSelect} showLabel={chapter === 4 || immersive} />
      <ByteCompanion
        night={night}
        onSelect={onSelect}
        showLabel={chapter === 0 || immersive}
      />
      <ContactBeacon
        onSelect={onSelect}
        showLabel={chapter === 5 || immersive}
      />
      <IslandAtmosphere />
      <SatelliteIsland at={[-80, 9, -48]} scale={1.1} phase={0} />
      <SatelliteIsland at={[69, 16, -57]} scale={0.85} phase={2} />
      <SatelliteIsland at={[18, 32, -100]} scale={0.6} phase={4} />
    </>
  );
}
