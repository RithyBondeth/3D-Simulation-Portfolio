import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { featuredProjects } from "../featured-projects";
import { projectHref } from "../lib/portfolio-route";

export default function SelectedWork({
  onProject,
}: {
  onProject: (id: string) => void;
}) {
  return (
    <section className="selected-work" aria-labelledby="selected-work-title">
      <div className="selected-work-heading">
        <h2 id="selected-work-title">
          A few places to start<span>.</span>
        </h2>
        <span>
          03 highlights <span className="swipe-hint">· Swipe to explore →</span>
        </span>
      </div>
      <div className="selected-work-grid">
        {featuredProjects.map((project, index) => (
          <a
            className="selected-work-card"
            href={projectHref(project.id)}
            key={project.id}
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              onProject(project.id);
            }}
          >
            <div className="selected-work-image">
              <img
                src={project.image}
                width="800"
                height="450"
                alt={`${project.title} product preview`}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <span>
                <ArrowUpRightIcon size={19} />
              </span>
            </div>
            <div className="selected-work-copy">
              <span>{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
