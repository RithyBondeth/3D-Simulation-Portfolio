import { ArrowUpRightIcon, NavigationArrowIcon } from "@phosphor-icons/react";
import { districts, islandProjects } from "../project-catalog";
import type { DistrictId } from "../lib/project-districts";

export default function DistrictBrowser({
  active,
  following,
  onFollow,
  onChoose,
  onAll,
}: {
  active: DistrictId;
  following: boolean;
  onFollow: () => void;
  onChoose: (id: DistrictId) => void;
  onAll: () => void;
}) {
  return (
    <section className="district-browser" aria-label="Project districts">
      <div className="district-browser-heading">
        <span>
          {islandProjects.length} projects · {districts.length} districts
        </span>
        <button
          className="district-follow"
          aria-pressed={following}
          onClick={onFollow}
        >
          <NavigationArrowIcon size={12} /> Follow car
        </button>
        <button className="district-all" onClick={onAll}>
          Explore all {islandProjects.length} projects{" "}
          <ArrowUpRightIcon size={14} />
        </button>
      </div>
      <nav className="district-options" aria-label="Choose a project district">
        {districts.map((district) => (
          <button
            key={district.id}
            className={`district-option district-${district.id}`}
            aria-pressed={active === district.id}
            aria-label={`Visit ${district.title} district, ${district.projects.length} projects`}
            onClick={() => onChoose(district.id)}
          >
            <span className="district-swatch" aria-hidden="true" />
            <span>
              <strong>{district.title}</strong>
              <small>{district.name}</small>
            </span>
            <span className="district-count">
              {String(district.projects.length).padStart(2, "0")}
            </span>
            <ArrowUpRightIcon size={15} className="district-option-arrow" />
          </button>
        ))}
      </nav>
    </section>
  );
}
