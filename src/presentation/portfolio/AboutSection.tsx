import { portfolioSectionHref } from "../../domain/portfolio/portfolio-story";
import {
  ArrowUpRightIcon,
  CodeIcon,
  GraduationCapIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import type { SectionId } from "../../domain/portfolio/types";

export default function AboutSection({
  onNavigate,
}: {
  onNavigate: (section: SectionId) => void;
}) {
  return (
    <div className="about-content">
      <div className="about-portrait">
        <img src="/images/bondeth.webp" alt="Rithy Bondeth" />
        <div>
          <span className="availability-dot" />
          Open to meaningful collaborations
        </div>
      </div>
      <h3>Hey, I’m Bondeth.</h3>
      <p className="lead">
        A full stack developer and AI engineer who likes turning complicated
        problems into useful, thoughtful software.
      </p>
      <p>
        I’m based in Phnom Penh, Cambodia. My work spans web platforms, mobile
        apps, and practical AI systems, with a particular interest in making
        technology more accessible in Khmer and English.
      </p>
      <p>
        Today, I build production web and mobile services at the Digital Economy
        and Business Committee. Outside that work, I explore AI agents,
        retrieval systems, and products that make everyday tasks a little
        easier.
      </p>
      <div className="about-facts">
        <span>
          <MapPinIcon size={19} />
          Phnom Penh, Cambodia
        </span>
        <span>
          <CodeIcon size={19} />
          Web, mobile & AI
        </span>
        <span>
          <GraduationCapIcon size={19} />
          CADT · Techo Scholar
        </span>
      </div>
      <div className="principles">
        <h4>What matters to me</h4>
        <p>
          <strong>Clarity.</strong> Software should feel understandable.
        </p>
        <p>
          <strong>Care.</strong> The small details shape the experience.
        </p>
        <p>
          <strong>Lasting quality.</strong> Build things that can grow.
        </p>
      </div>
      <a className="text-button" href={portfolioSectionHref("about")}>
        More about me on bondeth.dev
        <ArrowUpRightIcon size={16} />
      </a>
      <button className="primary-button" onClick={() => onNavigate("contact")}>
        Start a conversation
        <ArrowUpRightIcon size={17} />
      </button>
    </div>
  );
}
