import {
  mainPortfolio,
  portfolioSectionHref,
} from "../../domain/portfolio/portfolio-story";
import { ArrowUpRightIcon, GraduationCapIcon } from "@phosphor-icons/react";
import data from "../../data/portfolio/content.json";

import profile from "../../data/portfolio/profile.json";
import Tags from "./ProjectTags";
export default function ExperienceSection() {
  return (
    <>
      <p className="section-intro">
        From teaching the first lines of code to shipping software that people
        depend on.
      </p>
      <div className="timeline">
        {data.experience.map((role, i) => (
          <article key={role.company}>
            <div className={`timeline-marker ${i === 0 ? "current" : ""}`} />
            <span className="timeline-period">{role.period}</span>
            <h3>{role.role}</h3>
            <h4>{role.company}</h4>
            <p>{role.description}</p>
            <Tags tags={role.tags} />
          </article>
        ))}
      </div>
      <a className="text-button" href={portfolioSectionHref("experience")}>
        Full career story on bondeth.dev
        <ArrowUpRightIcon size={16} />
      </a>
      <div className="education">
        <GraduationCapIcon size={27} />
        <div>
          <span>{data.education[0].period}</span>
          <h3>{data.education[0].degree}</h3>
          <p>{data.education[0].institution}</p>
          <strong>{data.education[0].award}</strong>
          <a className="text-button" href={`${mainPortfolio}#education`}>
            Education details
            <ArrowUpRightIcon size={15} />
          </a>
        </div>
      </div>
      <a
        className="primary-button"
        href={profile.resume}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read my resume
        <ArrowUpRightIcon size={17} />
      </a>
    </>
  );
}
