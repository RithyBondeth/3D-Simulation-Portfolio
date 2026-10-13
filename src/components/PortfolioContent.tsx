import { useEffect, useState } from "react";
import { projectHref } from "../lib/portfolio-route";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BrainIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  GraduationCapIcon,
  LinkedinLogoIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TerminalWindowIcon,
} from "@phosphor-icons/react";
import data from "../content.json";
import type { Project, SectionId } from "../types";
import { isAIProject } from "../lib/studio-navigation";
import {
  matchesProjectFilter,
  type ProjectFilter,
} from "../lib/project-districts";

const projects = data.projects as Project[];
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
const aiProject = isAIProject;

export function PortfolioContent({
  section,
  onNavigate,
  initialProjectId,
  initialProjectFilter = "All",
  onProjectChange,
  onFilterChange,
}: {
  section: SectionId;
  onNavigate: (section: SectionId) => void;
  initialProjectId?: string;
  initialProjectFilter?: ProjectFilter;
  onProjectChange?: (id?: string) => void;
  onFilterChange?: (filter: ProjectFilter) => void;
}) {
  if (section === "projects")
    return (
      <Projects
        initialProjectId={initialProjectId}
        initialFilter={initialProjectFilter}
        onProjectChange={onProjectChange}
        onFilterChange={onFilterChange}
      />
    );
  if (section === "about") return <About onNavigate={onNavigate} />;
  if (section === "skills") return <Skills />;
  if (section === "experience") return <Experience />;
  if (section === "labs") return <Labs />;
  return <Contact />;
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="tags">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}

function Projects({
  initialProjectId,
  initialFilter,
  onProjectChange,
  onFilterChange,
}: {
  initialProjectId?: string;
  initialFilter: ProjectFilter;
  onProjectChange?: (id?: string) => void;
  onFilterChange?: (filter: ProjectFilter) => void;
}) {
  const [filter, setFilter] = useState<ProjectFilter>(initialFilter);
  const [query, setQuery] = useState("");
  const [localProjectId, setLocalProjectId] = useState(initialProjectId);
  const [linkCopied, setLinkCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const projectId = onProjectChange ? initialProjectId : localProjectId;
  const project = projects.find((p) => p.id === projectId);
  useEffect(() => setFilter(initialFilter), [initialFilter]);
  useEffect(() => {
    setLinkCopied(false);
    setCopyError(false);
  }, [projectId]);
  const setProject = (project: Project | null) => {
    setLocalProjectId(project?.id);
    onProjectChange?.(project?.id);
    document.querySelector(".drawer-scroll")?.scrollTo({ top: 0 });
    document
      .getElementById("portfolio-section")
      ?.scrollIntoView({ block: "start", behavior: "instant" });
  };
  const copyLink = async () => {
    if (!project) return;
    try {
      await navigator.clipboard.writeText(
        new URL(projectHref(project.id), window.location.href).href,
      );
      setLinkCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  const list = sortedProjects.filter((p) => {
    const matches = `${p.title} ${p.description} ${p.tags.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matches && matchesProjectFilter(p, filter, featured);
  });
  if (project)
    return (
      <article className="project-detail">
        <div className="case-study-navigation">
          <button className="text-button" onClick={() => setProject(null)}>
            <ArrowLeftIcon size={16} /> Back to{" "}
            {filter === "All" ? "all projects" : `${filter} projects`}
          </button>
          <button className="text-button project-share" onClick={copyLink}>
            {linkCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            {linkCopied ? "Link copied" : "Copy project link"}
          </button>
        </div>
        <span className="sr-only" role="status">
          {linkCopied ? "Project link copied to clipboard." : ""}
        </span>
        {copyError && (
          <p role="alert">
            Copy isn’t available. You can copy the project URL from your address
            bar.
          </p>
        )}
        <img
          className="detail-image"
          src={project.image}
          alt={`${project.title} product preview`}
        />
        <span className="content-kicker">
          {project.category} /{" "}
          {project.visibility === "limited"
            ? "Limited public profile"
            : "Public project"}
        </span>
        <h3>{project.title}</h3>
        <p className="lead">{project.description}</p>
        <Tags tags={project.tags} />
        {project.overview && (
          <>
            <h4>Inside the project</h4>
            <p>{project.overview}</p>
          </>
        )}
        {project.caseStudy && (
          <>
            <h4>The problem</h4>
            <p>{project.caseStudy.problem}</p>
            <h4>How it’s built</h4>
            <div className="decisions">
              {project.caseStudy.decisions.slice(0, 4).map((d) => (
                <details key={d.title}>
                  <summary>
                    {d.title}
                    <ArrowDownIcon size={14} />
                  </summary>
                  <p>{d.body}</p>
                  {d.tradeoff && <p className="muted">{d.tradeoff}</p>}
                </details>
              ))}
            </div>
            <h4>The outcome</h4>
            <p>{project.caseStudy.outcome}</p>
          </>
        )}
        <div className="detail-actions">
          {project.links.map((link, i) => (
            <a
              key={i}
              className="primary-button"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.kind === "repo" ? "View source" : "Visit project"}
              <ArrowUpRightIcon size={17} />
            </a>
          ))}
          <a
            className="text-button"
            href={`https://www.bondeth.dev/en/projects/${project.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Full case study
            <ArrowUpRightIcon size={15} />
          </a>
        </div>
      </article>
    );
  return (
    <>
      <p className="section-intro">
        Real products. Practical problems. A few things I’ve helped bring to
        life.
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
          <a
            className="project-card"
            key={p.id}
            href={projectHref(p.id)}
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              setProject(p);
            }}
          >
            <div className="project-image">
              <img src={p.image} loading="lazy" alt={`${p.title} preview`} />
              <span className="project-open">
                <ArrowUpRightIcon size={19} />
              </span>
            </div>
            <div className="project-card-body">
              <span className="project-category">
                {p.category}
                {aiProject(p) ? " + AI" : ""}
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

function About({ onNavigate }: { onNavigate: (section: SectionId) => void }) {
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
      <button className="primary-button" onClick={() => onNavigate("contact")}>
        Start a conversation
        <ArrowUpRightIcon size={17} />
      </button>
    </div>
  );
}

function Skills() {
  return (
    <>
      <p className="section-intro">
        The tools behind the work, from the first interface to the last
        deployment.
      </p>
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

function Experience() {
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
      <div className="education">
        <GraduationCapIcon size={27} />
        <div>
          <span>2020 - 2024</span>
          <h3>Bachelor of Computer Science</h3>
          <p>Cambodia Academy of Digital Technology</p>
          <strong>Techo Scholar</strong>
        </div>
      </div>
      <a
        className="primary-button"
        href={data.profile.resume}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read my resume
        <ArrowUpRightIcon size={17} />
      </a>
    </>
  );
}

function Labs() {
  const labs = [
    {
      name: "Retrieval playground",
      description:
        "Explore how a question finds the right context before an AI model answers.",
      href: "rag-retrieval",
      label: "RAG & search",
      icon: MagnifyingGlassIcon,
    },
    {
      name: "Structured outputs",
      description:
        "Turn a free-form model response into dependable, typed data.",
      href: "structured-output",
      label: "Reliable AI",
      icon: CodeIcon,
    },
    {
      name: "LLM evaluation",
      description:
        "Compare model responses and see what makes an evaluation useful.",
      href: "llm-evals",
      label: "Measure & improve",
      icon: BrainIcon,
    },
  ];
  return (
    <>
      <div className="lab-hero">
        <TerminalWindowIcon size={40} weight="duotone" />
        <span>Always learning. Always building.</span>
        <p>Small experiments with the ideas behind intelligent software.</p>
      </div>
      <div className="lab-list">
        {labs.map((l) => (
          <a
            href={`https://www.bondeth.dev/en/labs/${l.href}`}
            target="_blank"
            rel="noopener noreferrer"
            key={l.name}
          >
            <l.icon size={27} weight="duotone" />
            <div>
              <span>{l.label}</span>
              <h3>{l.name}</h3>
              <p>{l.description}</p>
            </div>
            <ArrowUpRightIcon size={19} />
          </a>
        ))}
      </div>
      <a
        className="text-button"
        href="https://www.bondeth.dev/en/blog"
        target="_blank"
        rel="noopener noreferrer"
      >
        Read the stories behind the work
        <ArrowUpRightIcon size={16} />
      </a>
    </>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.profile.email);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  return (
    <div className="contact-content">
      <div className="contact-illustration">
        <EnvelopeSimpleIcon size={64} weight="duotone" />
        <span>Good things start with a hello.</span>
      </div>
      <p className="lead">
        Have a project in mind, a problem to solve, or an idea worth exploring?
        I’d love to hear about it.
      </p>
      <div className="contact-availability">
        <span className="availability-dot" />
        Available for selected software & AI projects
      </div>
      <a className="email-link" href={`mailto:${data.profile.email}`}>
        {data.profile.email}
        <ArrowUpRightIcon size={20} />
      </a>
      <button className="text-button copy-button" onClick={copy}>
        {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        {copied ? "Email copied" : "Copy email address"}
      </button>
      <div className="sr-only" role="status">
        {copied ? "Email address copied to clipboard." : ""}
      </div>
      {copyError && (
        <p role="alert">
          Copy isn’t available here. You can select the address above or open it
          in your email app.
        </p>
      )}
      <a
        className="primary-button"
        href={`mailto:${data.profile.email}?subject=Let%27s%20build%20something`}
      >
        Say hello
        <ArrowUpRightIcon size={17} />
      </a>
      <div className="social-links">
        <a href={data.profile.github} target="_blank" rel="noopener noreferrer">
          <GithubLogoIcon size={22} />
          GitHub
          <ArrowUpRightIcon size={14} />
        </a>
        <a
          href={data.profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedinLogoIcon size={22} />
          LinkedIn
          <ArrowUpRightIcon size={14} />
        </a>
      </div>
      <p className="contact-location">
        <MapPinIcon size={16} />
        Phnom Penh, Cambodia · UTC+7
      </p>
    </div>
  );
}
