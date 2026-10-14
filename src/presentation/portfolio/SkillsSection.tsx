import {
  mainPortfolio,
  portfolioSectionHref,
  services,
} from "../../domain/portfolio/portfolio-story";
import { ArrowUpRightIcon, BrainIcon } from "@phosphor-icons/react";
import data from "../../data/portfolio/content.json";

import Tags from "./ProjectTags";
export default function SkillsSection() {
  return (
    <>
      <p className="section-intro">
        The tools behind the work, from the first interface to the last
        deployment.
      </p>
      <section className="services-overview" aria-labelledby="services-title">
        <h3 id="services-title">What I can help with</h3>
        <div>
          {services.map((service) => (
            <article key={service.title}>
              <h4>{service.title}</h4>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
        <a className="text-button" href={`${mainPortfolio}#services`}>
          Explore my services
          <ArrowUpRightIcon size={16} />
        </a>
      </section>
      <div className="skills-grid">
        {data.skills.map((g, i) => (
          <section
            className={`skill-group skill-group-${i % 3}`}
            key={g.category}
          >
            <span className="skill-index">0{i + 1}</span>
            <h3>{g.category}</h3>
            <Tags tags={g.items} />
          </section>
        ))}
      </div>
      <a className="text-button" href={portfolioSectionHref("skills")}>
        Full skills overview on bondeth.dev
        <ArrowUpRightIcon size={16} />
      </a>
      <div className="note">
        <BrainIcon size={24} />
        <p>
          Currently exploring reliable AI agents, retrieval augmented
          generation, and practical LLM evaluation.
        </p>
      </div>
    </>
  );
}
