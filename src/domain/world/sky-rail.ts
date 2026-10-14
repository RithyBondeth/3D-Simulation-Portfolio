import { onInfrastructureRoad, type Footprint } from "./infrastructure.ts";

const radius = 9,
  arc = (Math.PI * radius) / 2;
const legs = [54, arc, 32, arc, 54, arc, 32, arc];
export const railLength = legs.reduce((sum, leg) => sum + leg, 0);
export const railHeight = 14.8;
export function railPose(distance: number) {
  let travel = ((distance % railLength) + railLength) % railLength,
    leg = 0;
  while (leg < legs.length - 1 && travel > legs[leg]) travel -= legs[leg++];
  let x = 0,
    z = 0,
    dx = 0,
    dz = 0;
  if (leg % 2) {
    const corner = (leg - 1) / 2;
    const angle = Math.PI / 2 - (corner * Math.PI) / 2 - travel / radius;
    const cx = corner < 2 ? 27 : -27,
      cz = corner === 0 || corner === 3 ? 12 : -20;
    x = cx + radius * Math.cos(angle);
    z = cz + radius * Math.sin(angle);
    dx = Math.sin(angle);
    dz = -Math.cos(angle);
  } else if (leg === 0) {
    x = -27 + travel;
    z = 21;
    dx = 1;
  } else if (leg === 2) {
    x = 36;
    z = 12 - travel;
    dz = -1;
  } else if (leg === 4) {
    x = 27 - travel;
    z = -29;
    dx = -1;
  } else {
    x = -36;
    z = -20 + travel;
    dz = 1;
  }
  return { x, y: railHeight, z, yaw: Math.atan2(-dx, -dz) };
}
export const railStations = [
  {
    id: "waterfront",
    name: "Waterfront",
    section: "contact",
    distance: 47,
    shaft: { x: 19, z: 26, w: 1.6, d: 1.6 },
  },
  {
    id: "work",
    name: "Work quarter",
    section: "projects",
    distance: 54 + arc + 32 + arc + 22,
    shaft: { x: 24, z: -32.5, w: 1.6, d: 1.6 },
  },
  {
    id: "labs",
    name: "AI garden",
    section: "labs",
    distance: 54 + arc + 32 + arc + 54 + arc + 25,
    shaft: { x: -39.5, z: 8.8, w: 1.6, d: 1.6 },
  },
] as const;
const speed = 8,
  dwell = 3;
export const railPeriod = railLength / speed + railStations.length * dwell;

/** An analytic timetable avoids drifting trains and keeps pauses deterministic. */
export function trainSchedule(seconds: number, phase = 0) {
  let time = (((seconds + phase) % railPeriod) + railPeriod) % railPeriod;
  let previous = 0;
  for (const station of railStations) {
    const travel = (station.distance - previous) / speed;
    if (time < travel)
      return {
        distance: previous + time * speed,
        station: null,
        stopped: false,
      };
    time -= travel;
    if (time < dwell)
      return { distance: station.distance, station: station.id, stopped: true };
    time -= dwell;
    previous = station.distance;
  }
  return { distance: previous + time * speed, station: null, stopped: false };
}

export const railSupports: Footprint[] = Array.from({ length: 16 }, (_, i) => {
  const pose = railPose((i / 16) * railLength);
  return { x: pose.x, z: pose.z, w: 1.1, d: 1.1 };
}).filter((p) => !onInfrastructureRoad(p.x, p.z));
// Platforms cantilever from these safe sidewalk sites, away from crossings and the shuttle.
export const stationSupports: Footprint[] = [
  [17, 26],
  [23, 26],
  [1, -33],
  [12, -33],
  [-40, -12],
  [-40, 4],
].map(([x, z]) => ({ x, z, w: 0.8, d: 0.8 }));
export const transitObstacles: Footprint[] = [
  ...railSupports,
  ...stationSupports,
  ...railStations.map((s) => s.shaft),
];
