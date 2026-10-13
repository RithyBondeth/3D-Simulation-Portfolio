import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { portfolioSections, mainPortfolio } from "../lib/portfolio-story";
import type { SectionId } from "../types";

export default function PortfolioDestinations({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <section
      className="portfolio-destinations"
      aria-label="Explore the full portfolio"
    >
      <div className="portfolio-destinations-heading">
        <span>A little of everything I do</span>
        <a href={mainPortfolio}>
          Full portfolio <ArrowUpRightIcon size={13} />
        </a>
      </div>
      <nav aria-label="Island destinations">
        {portfolioSections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSelect(section.id)}
            aria-current={active === section.id ? "location" : undefined}
          >
            <strong>{section.name}</strong>
            <span>{section.detail}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
