export type GraphicsPreference = "auto" | "high" | "low";
export type GraphicsQuality = "high" | "low";
export type DeviceHints = {
  compact: boolean;
  saveData?: boolean;
  cores?: number;
  memory?: number;
};

export function chooseGraphicsQuality(
  preference: GraphicsPreference,
  hints: DeviceHints,
): GraphicsQuality {
  if (preference !== "auto") return preference;
  return hints.compact ||
    hints.saveData ||
    (hints.cores !== undefined && hints.cores <= 4) ||
    (hints.memory !== undefined && hints.memory <= 4)
    ? "low"
    : "high";
}

/** Require a sustained slow window; a single shader-compilation stall isn't enough. */
export function shouldReduceQuality(frameSeconds: readonly number[]) {
  return (
    frameSeconds.length >= 60 &&
    frameSeconds.filter((dt) => dt > 0.05).length / frameSeconds.length > 0.6
  );
}
