export const journeyFov = 42;
export const journeyStops = [0, 0.38, 0.68, 1] as const;
export const journeyNames = [
  "Welcome",
  "Selected work",
  "The AI portal",
  "Say hello",
] as const;
export function journeyChapter(progress: number) {
  return progress < 0.2 ? 0 : progress < 0.53 ? 1 : progress < 0.81 ? 2 : 3;
}
export function journeyCarX(progress: number) {
  return -17 + Math.max(0, Math.min(1, progress)) * 49;
}
const shots = [
  { camera: [48, 34, 91], target: [-25, 5, 4] },
  { camera: [21, 16, 61], target: [-13, 2, 20] },
  { camera: [34, 22, 70], target: [2, 2, 20] },
  { camera: [53, 20, 73], target: [20, 3, 24] },
];
/** Smooth camera cuts are interpolated between four physically connected places. */
export function journeyShot(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  let segment = journeyStops.findIndex(
    (stop, i) => i < 3 && p <= journeyStops[i + 1],
  );
  if (segment < 0) segment = 2;
  const t =
    (p - journeyStops[segment]) /
    (journeyStops[segment + 1] - journeyStops[segment]);
  const eased = t * t * (3 - 2 * t);
  const mix = (key: "camera" | "target") =>
    shots[segment][key].map(
      (value, i) => value + (shots[segment + 1][key][i] - value) * eased,
    );
  return { camera: mix("camera"), target: mix("target") };
}
