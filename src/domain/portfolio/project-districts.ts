import { isAIProject } from "./project-classification.ts";

export type DistrictId = "ai" | "web" | "mobile" | "macos";
export type ProjectFilter =
  "All" | "Featured" | "AI" | "Web" | "Mobile" | "macOS" | "Apps";
export const projectDistricts = [
  {
    id: "ai",
    title: "AI",
    name: "Intelligence garden",
    description: "Useful intelligence, built into everyday tools.",
    color: "#c78b62",
    position: [-23, 6.4, 7],
    stop: 0.8,
    filter: "AI",
  },
  {
    id: "web",
    title: "Web",
    name: "Web quarter",
    description: "Platforms, public services, and ideas on the web.",
    color: "#70a899",
    position: [0, 7.5, -17],
    stop: 0.54,
    filter: "Web",
  },
  {
    id: "mobile",
    title: "Mobile",
    name: "Pocket park",
    description: "Small screens. Things that go with you.",
    color: "#91a7c5",
    position: [23, 6.4, 5],
    stop: 0.29,
    filter: "Mobile",
  },
  {
    id: "macos",
    title: "macOS",
    name: "Native harbour",
    description: "Thoughtful little tools, made for the Mac.",
    color: "#ba9cae",
    position: [-19, 2.8, 18],
    stop: 0,
    filter: "macOS",
  },
] as const;
export type DistrictProject = {
  category: string;
  tags: string[];
  domains: string[];
  description: string;
};

/** Each project has one home; AI-enabled phone apps still belong to Mobile. */
export function districtForProject(project: DistrictProject): DistrictId {
  if (project.category === "Mobile") return "mobile";
  if (project.category === "macOS") return "macos";
  return isAIProject(project) ? "ai" : "web";
}

export function matchesProjectFilter(
  project: DistrictProject & { id: string },
  filter: ProjectFilter,
  featured: readonly string[],
) {
  if (filter === "All") return true;
  if (filter === "Featured") return featured.includes(project.id);
  if (filter === "Apps")
    return ["mobile", "macos"].includes(districtForProject(project));
  return (
    projectDistricts.find((d) => d.filter === filter)?.id ===
    districtForProject(project)
  );
}

/** Districts follow the waterfront, east avenue, north quarter, then west garden. */
export function routeDistrict(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const segments = [
    { id: "macos", start: 0, end: 0.17 },
    { id: "mobile", start: 0.17, end: 0.41 },
    { id: "web", start: 0.41, end: 0.7 },
    { id: "ai", start: 0.7, end: 0.91 },
    { id: "macos", start: 0.91, end: 1.000001 },
  ] as const;
  const segment = segments.find((s) => p < s.end)!;
  return {
    id: segment.id,
    progress: (p - segment.start) / (segment.end - segment.start),
  };
}

export function nearbyDistrict(x: number, z: number): DistrictId {
  if (z > 22 && Math.abs(x) < 35) return "macos";
  if (z < -29) return "web";
  return x > 0 ? "mobile" : "ai";
}
