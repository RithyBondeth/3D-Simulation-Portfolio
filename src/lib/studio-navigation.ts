export type Point = { x: number; z: number };
export type Obstacle = Point & { w: number; d: number };

export const obstacles: Obstacle[] = [
  { x: -2.45, z: -2.35, w: 3.7, d: 1.5 },
  { x: -2.45, z: -1.2, w: 0.85, d: 0.85 },
  { x: 2.45, z: -3.42, w: 3.4, d: 0.8 },
  { x: 2.8, z: -0.9, w: 2.1, d: 2.1 },
  { x: 2.95, z: 1.8, w: 1.4, d: 2.5 },
  { x: 1.65, z: 2.35, w: 1.4, d: 1.4 },
  { x: -4.48, z: 1.2, w: 0.85, d: 3 },
];

/** Screen-relative movement with equal diagonal speed, wall limits and sliding collisions. */
export function advancePlayer(
  position: Point,
  input: Point,
  delta: number,
  solids: Obstacle[] = obstacles,
): Point {
  const dx = input.x + input.z,
    dz = -input.x + input.z;
  const length = Math.hypot(dx, dz);
  if (!length) return position;
  const step = Math.max(0, Math.min(delta, 0.05)) * 2.7;
  const nextX = Math.max(
    -4.6,
    Math.min(4.6, position.x + (dx / length) * step),
  );
  const nextZ = Math.max(
    -3.6,
    Math.min(3.6, position.z + (dz / length) * step),
  );
  const blocked = (x: number, z: number) =>
    solids.some(
      (o) =>
        Math.abs(x - o.x) < o.w / 2 + 0.2 && Math.abs(z - o.z) < o.d / 2 + 0.2,
    );
  const x = blocked(nextX, position.z) ? position.x : nextX;
  const z = blocked(x, nextZ) ? position.z : nextZ;
  return { x, z };
}

export function isAIProject(project: {
  tags: string[];
  domains: string[];
  description: string;
}): boolean {
  return (
    project.tags.some((t) =>
      /^(LLM APIs|LiteLLM|MCP|LangChain|LangGraph|OpenAI|Anthropic|Gemini|AI)$/i.test(
        t,
      ),
    ) ||
    project.domains.some((d) => /\bAI\b/i.test(d)) ||
    /\bAI\b/.test(project.description)
  );
}
