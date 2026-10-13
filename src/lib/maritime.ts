export type VesselKind = "yacht" | "ferry" | "cargo";
export const fleet = [
  { kind: "ferry", phase: 0.45, rx: 112, rz: 100, speed: 0.012 },
  { kind: "yacht", phase: 2.4, rx: 108, rz: 98, speed: 0.017 },
  { kind: "cargo", phase: 4.5, rx: 164, rz: 148, speed: 0.006 },
  { kind: "yacht", phase: 5.65, rx: 112, rz: 96, speed: 0.014 },
  { kind: "ferry", phase: 3.5, rx: 158, rz: 140, speed: 0.009 },
  { kind: "cargo", phase: 1.8, rx: 192, rz: 176, speed: 0.005 },
  { kind: "yacht", phase: 0.1, rx: 172, rz: 152, speed: 0.015 },
] as const;
export function vesselPose(vessel: (typeof fleet)[number], seconds: number) {
  const angle = vessel.phase + seconds * vessel.speed;
  const dx = -vessel.rx * Math.sin(angle),
    dz = vessel.rz * Math.cos(angle);
  return {
    x: Math.cos(angle) * vessel.rx,
    z: Math.sin(angle) * vessel.rz,
    yaw: Math.atan2(-dx, -dz),
  };
}
