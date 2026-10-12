/** Metres in world space. Rendering, collision and the minimap share this plan. */
export const CITY_LIMIT = 123;
export const CITY_ROADS = [-96, -32, 32, 96];
export const ROAD_WIDTH = 14;
export const BLOCK_CENTRES = [-64, 0, 64];
export interface CityBuilding {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  style: "glass" | "stone" | "bronze";
  name?: string;
}
export const cityBuildings: CityBuilding[] = [
  {
    x: -64,
    z: 65,
    w: 36,
    d: 30,
    h: 13,
    style: "stone",
    name: "WORK / GALLERY",
  },
  { x: -74, z: 45, w: 15, d: 9, h: 24, style: "bronze" },
  { x: 0, z: 65, w: 36, d: 34, h: 7, style: "stone", name: "BONDETH / AI LAB" },
  { x: 3, z: 62, w: 25, d: 26, h: 76, style: "glass" },
  { x: 59, z: 63, w: 24, d: 34, h: 48, style: "glass", name: "THE TOOLKIT" },
  { x: 79, z: 57, w: 11, d: 22, h: 29, style: "stone" },
  { x: -63, z: 0, w: 32, d: 36, h: 38, style: "stone", name: "MEET THE MAKER" },
  { x: -61, z: -21, w: 30, d: 5, h: 5, style: "bronze" },
  { x: 64, z: -65, w: 29, d: 29, h: 104, style: "glass", name: "THE JOURNEY" },
  { x: 65, z: -64, w: 42, d: 40, h: 6, style: "stone" },
  { x: -74, z: -65, w: 21, d: 34, h: 64, style: "bronze" },
  { x: -51, z: -65, w: 17, d: 32, h: 46, style: "glass" },
  { x: -8, z: -65, w: 25, d: 34, h: 42, style: "stone" },
  { x: 15, z: -63, w: 13, d: 36, h: 59, style: "bronze" },
  { x: 55, z: -1, w: 20, d: 35, h: 58, style: "glass" },
  { x: 77, z: 2, w: 15, d: 29, h: 32, style: "stone" },
];
// Street-facing buildings continue past the district, rather than exposing a flat map edge.
for (const side of [-1, 1])
  for (const centre of BLOCK_CENTRES) {
    if (side < 0)
      cityBuildings.push({
        x: centre,
        z: side * 128,
        w: 48,
        d: 40,
        h: 24 + ((centre + 64) / 64) * 13,
        style: centre === 0 ? "glass" : "stone",
      });
    cityBuildings.push({
      x: side * 128,
      z: centre,
      w: 40,
      d: 48,
      h: 32 + ((centre + 64) / 64) * 11,
      style: centre === 0 ? "bronze" : "glass",
    });
  }
export const parkObstacles = [
  { x: 0, z: 0, w: 9, d: 24 },
  { x: 15, z: -13, w: 12, d: 5 },
  { x: -80, z: 115, w: 12, d: 5 },
  { x: 76, z: 137, w: 4.5, d: 4.5 },
];
export function onCityRoad(x: number, z: number) {
  return (
    Math.abs(x) <= CITY_LIMIT &&
    z >= -CITY_LIMIT &&
    z <= 103 &&
    CITY_ROADS.some(
      (axis) =>
        Math.abs(x - axis) <= ROAD_WIDTH / 2 ||
        Math.abs(z - axis) <= ROAD_WIDTH / 2,
    )
  );
}
export function cityBlocked(x: number, z: number) {
  const radius = 1.15;
  return (
    Math.abs(x) > CITY_LIMIT - radius ||
    z < -CITY_LIMIT + radius ||
    z > shoreline(x) - 3.5 ||
    [...cityBuildings, ...parkObstacles].some(
      (b) =>
        Math.abs(x - b.x) < b.w / 2 + radius &&
        Math.abs(z - b.z) < b.d / 2 + radius,
    )
  );
}

export function shoreline(x: number) {
  return 157 + Math.sin(x / 43) * 5 + Math.sin(x / 19) * 1.8;
}
