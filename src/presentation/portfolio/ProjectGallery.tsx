import { useEffect, useState } from "react";
import { projectHref } from "../../domain/portfolio/portfolio-route";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import data from "../../data/portfolio/content.json";
import type { Project } from "../../domain/portfolio/types";
import { isAIProject } from "../../domain/portfolio/project-classification";
import {
  matchesProjectFilter,
  type ProjectFilter,
} from "../../domain/portfolio/project-districts";

const projects: Project[] = data.projects;
const featured = [
  "apsara-agentic",
  "apsara-assistant",
  "apsara-talent",
  "apsara-elearning",
  "bondex-notch",
  "apsara-wallet",
  "pdfflow",
  "reahu-generator",
];
const sortedProjects = [...projects].sort(
  (a, b) =>
    (featured.indexOf(a.id) < 0 ? 99 : featured.indexOf(a.id)) -
    (featured.indexOf(b.id) < 0 ? 99 : featured.indexOf(b.id)),
);

export default function ProjectGallery({
  initialFilter,
  onFilterChange,
}: {
  initialFilter: ProjectFilter;
  onFilterChange?: (filter: ProjectFilter) => void;
}) {
  const [filter, setFilter] = useState<ProjectFilter>(initialFilter);
  const [query, setQuery] = useState("");
  useEffect(() => setFilter(initialFilter), [initialFilter]);
  const list = sortedProjects.filter((p) => {
    const matches = `${p.title} ${p.description} ${p.tags.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matches && matchesProjectFilter(p, filter, featured);
  });
  return (
    <>
      <p className="section-intro">
        Real products. Practical problems. A few things I’ve helped bring to
        life.
      </p>
      <p className="project-link-note">
        Open a project to read its full case study on bondeth.dev.
      </p>
      <div className="project-tools">
        <div className="filter-tabs" aria-label="Filter projects">
          {(
            [
              "All",
              "Featured",
              "AI",
              "Web",
              "Mobile",
              "macOS",
            ] as ProjectFilter[]
          ).map((f) => (
            <button
              key={f}
              className={f === filter ? "active" : ""}
              aria-pressed={f === filter}
              onClick={() => {
                setFilter(f);
                onFilterChange?.(f);
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="search-field">
          <MagnifyingGlassIcon size={17} />
          <input
            aria-label="Search projects"
            placeholder="Find a project…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="result-count">
        {list.length} {list.length === 1 ? "project" : "projects"} to discover
      </div>
      <div className="project-grid">
        {list.map((p) => (
          <a className="project-card" key={p.id} href={projectHref(p.id)}>
            <div className="project-image">
              <img src={p.image} loading="lazy" alt={`${p.title} preview`} />
              <span className="project-open">
                <ArrowUpRightIcon size={19} />
              </span>
            </div>
            <div className="project-card-body">
              <span className="project-category">
                {p.category}
                {isAIProject(p) ? " + AI" : ""}
              </span>
              <h3>
                {p.title}
                <ArrowUpRightIcon size={17} />
              </h3>
              <p>{p.description}</p>
              <div className="project-tech">
                {p.tags.slice(0, 3).join(" · ")}
              </div>
            </div>
          </a>
        ))}
      </div>
      {!list.length && (
        <div className="empty-state">
          <MagnifyingGlassIcon size={30} />
          <h3>No projects found</h3>
          <p>Try another name or technology.</p>
          <button
            className="text-button"
            onClick={() => {
              setQuery("");
              setFilter("All");
              onFilterChange?.("All");
            }}
          >
            Show all projects
            <ArrowRightIcon size={16} />
          </button>
        </div>
      )}
    </>
  );
}
