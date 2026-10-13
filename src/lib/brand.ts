/** Head-only crop of Byte, from bondeth.dev's robot-geometry.ts (34 × 26). */
type Paint = "ink" | "face" | "shade" | "accent";
type Pixel = readonly [number, number, number, number, Paint];

export const byteHead: readonly Pixel[] = [
  [1, 12, 4, 8, "ink"], [2, 13, 2, 6, "accent"],
  [29, 12, 4, 8, "ink"], [30, 13, 2, 6, "accent"],
  [16, 3, 2, 4, "ink"], [14, 0, 6, 3, "accent"],
  [4, 7, 26, 18, "ink"], [6, 9, 22, 14, "face"],
  [6, 21, 22, 2, "shade"], [26, 9, 2, 12, "shade"],
];
export const byteEyes: readonly Pixel[] = [
  [10, 12, 4, 4, "ink"], [11, 13, 1, 1, "face"],
  [20, 12, 4, 4, "ink"], [21, 13, 1, 1, "face"],
];
export const byteMouth: readonly Pixel[] = [
  [12, 18, 2, 2, "accent"], [16, 18, 2, 2, "accent"], [20, 18, 2, 2, "accent"],
];
export const byteLightPalette: Record<Paint, string> = {
  ink: "#294d3c", face: "#FAF9F5", shade: "#e0e8da", accent: "#38664e",
};
