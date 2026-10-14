import { mainPortfolio } from "./portfolio-story.ts";
import type { SectionId } from "./types.ts";

export type PortfolioRoute = { section: SectionId | null; projectId?: string };
const sections = [
  "projects",
  "about",
  "skills",
  "experience",
  "contact",
  "labs",
];

/** Recognize legacy project links so the app can redirect to the primary portfolio. */
export function readPortfolioRoute(
  href: string,
  projectIds: readonly string[],
): PortfolioRoute {
  const url = new URL(href);
  const path = url.pathname.match(/^\/projects\/([^/]+)\/?$/);
  let pathId: string | undefined;
  try {
    pathId = path ? decodeURIComponent(path[1]) : undefined;
  } catch {
    /* Invalid path opens the gallery. */
  }
  const candidate = pathId ?? url.searchParams.get("project");
  const projectId =
    candidate && projectIds.includes(candidate) ? candidate : undefined;
  const hash = url.hash.slice(1);
  return {
    section:
      projectId || path || url.searchParams.has("project")
        ? "projects"
        : sections.includes(hash)
          ? (hash as SectionId)
          : null,
    projectId,
  };
}

export function portfolioURL(href: string, route: PortfolioRoute) {
  const url = new URL(href);
  url.searchParams.delete("project");
  if (route.projectId)
    url.pathname = `/projects/${encodeURIComponent(route.projectId)}/`;
  else if (url.pathname.startsWith("/projects/")) url.pathname = "/";
  url.hash = route.projectId ? "" : (route.section ?? "");
  return url.href;
}

export function projectHref(id: string) {
  return `${mainPortfolio}/projects/${encodeURIComponent(id)}`;
}
