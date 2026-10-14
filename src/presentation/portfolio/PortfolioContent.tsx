import type { SectionId } from "../../domain/portfolio/types";
import { type ProjectFilter } from "../../domain/portfolio/project-districts";

import Projects from "./ProjectGallery";
import About from "./AboutSection";
import Skills from "./SkillsSection";
import Experience from "./ExperienceSection";
import Labs from "./LabsSection";
import Contact from "./ContactSection";
export function PortfolioContent({
  section,
  onNavigate,
  initialProjectFilter = "All",
  onFilterChange,
}: {
  section: SectionId;
  onNavigate: (section: SectionId) => void;
  initialProjectFilter?: ProjectFilter;
  onFilterChange?: (filter: ProjectFilter) => void;
}) {
  if (section === "projects")
    return (
      <Projects
        initialFilter={initialProjectFilter}
        onFilterChange={onFilterChange}
      />
    );
  if (section === "about") return <About onNavigate={onNavigate} />;
  if (section === "skills") return <Skills />;
  if (section === "experience") return <Experience />;
  if (section === "labs") return <Labs />;
  return <Contact />;
}
