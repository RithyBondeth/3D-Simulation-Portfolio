import {
  ArrowDownIcon,
  ArrowUpRightIcon,
  CubeIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import BrandMark from "./BrandMark";
import type { SectionId } from "../types";
import { islandProjects } from "../project-catalog";

const introductions: Record<
  SectionId,
  { label: string; first: string; second: string; body: string }
> = {
  projects: {
    label: "Independent mind. Hands-on maker.",
    first: "A curious mind.",
    second: "Useful things.",
    body: "I’m Bondeth, a full stack developer and AI engineer. I turn complex problems into software that feels simple to use.",
  },
  about: {
    label: "A little about the maker",
    first: "Behind the code,",
    second: "a curious human.",
    body: "Based in Phnom Penh. Building for people everywhere, with a special place for technology in Khmer and English.",
  },
  skills: {
    label: "From interface to infrastructure",
    first: "Good ideas.",
    second: "The tools to build.",
    body: "Web, mobile, native apps, and practical AI. A toolkit shaped by real products and a habit of learning by doing.",
  },
  experience: {
    label: "Learning, building, moving forward",
    first: "Every chapter,",
    second: "something learned.",
    body: "From helping people write their first lines of code to building the services they use every day.",
  },
  labs: {
    label: "Room for a little curiosity",
    first: "Small experiments.",
    second: "Fresh possibilities.",
    body: "A space to try ideas, ask better questions, and understand what makes intelligent software useful.",
  },
  contact: {
    label: "Let’s make something useful",
    first: "Your next idea",
    second: "starts with hello.",
    body: "A product to build, a difficult problem, or a conversation about what’s possible. I’d love to hear from you.",
  },
};

export default function PortfolioIntro({
  section,
  onWorld,
}: {
  section: SectionId;
  onWorld: () => void;
}) {
  const intro = introductions[section];
  return (
    <section className="portfolio-intro" aria-labelledby="portfolio-title">
      <div className="portfolio-intro-copy">
        <span className="portfolio-eyebrow">
          <span />
          {intro.label}
        </span>
        <h1 id="portfolio-title">
          {intro.first}
          <br />
          <span>{intro.second}</span>
        </h1>
        <p>{intro.body}</p>
        <div className="portfolio-intro-actions">
          <button
            className="primary-button"
            onClick={() =>
              document
                .getElementById("portfolio-section")
                ?.scrollIntoView({
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "instant"
                    : "smooth",
                  block: "start",
                })
            }
          >
            {section === "projects"
              ? "Discover the work"
              : "Take a closer look"}
            <ArrowDownIcon size={16} />
          </button>
          <button className="text-button" onClick={onWorld}>
            <CubeIcon size={17} />
            Step into my world
            <ArrowUpRightIcon size={14} />
          </button>
        </div>
        <div className="portfolio-location">
          <MapPinIcon size={14} />
          Phnom Penh, Cambodia<span>·</span>Building with care
        </div>
      </div>
      <div
        className="portfolio-studio-card"
        aria-label="Bondeth studio: web, mobile, native, and AI products"
      >
        <div className="studio-card-top">
          <span>THE DIGITAL WORKSHOP</span>
          <span>EST. IN CAMBODIA ↗</span>
        </div>
        <div className="studio-card-art" aria-hidden="true">
          <div className="studio-orbit studio-orbit-one" />
          <div className="studio-orbit studio-orbit-two" />
          <span className="studio-art-coordinate">
            11.56° N<br />
            104.92° E
          </span>
          <div className="studio-monogram">
            <BrandMark />
          </div>
          <span className="studio-art-spark">✳</span>
          <span className="studio-art-label studio-art-label-one">
            &lt; built with curiosity /&gt;
          </span>
          <span className="studio-art-label studio-art-label-two">
            ideas → everyday tools
          </span>
        </div>
        <div className="studio-card-bottom">
          <div>
            <strong>{String(islandProjects.length).padStart(2, "0")}</strong>
            <span>projects & counting</span>
          </div>
          <p>
            Web. Mobile. Native. AI.
            <br />
            <span>Different tools, the same care.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
