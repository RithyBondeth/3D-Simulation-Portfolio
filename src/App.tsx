import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDownIcon,
  CarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  ArrowCounterClockwiseIcon,
  BooksIcon,
  BriefcaseIcon,
  CubeIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  HouseIcon,
  ListIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  MouseIcon,
  QuestionIcon,
  SparkleIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  SunIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  stations,
  sectionNames,
  type SectionId,
  type MovementInput,
} from "./types";
import profile from "./profile.json";
import { districts, islandProjects } from "./project-catalog";
import {
  nearbyDistrict,
  routeDistrict,
  type DistrictId,
  type ProjectFilter,
} from "./lib/project-districts";
import DistrictBrowser from "./components/DistrictBrowser";
import BrandMark from "./components/BrandMark";
import PortfolioIntro from "./components/PortfolioIntro";
import {
  journeyCarPose,
  journeyChapter,
  journeyNames,
  journeyStops,
} from "./lib/coastal-journey";

const DrivingWorld = lazy(() => import("./components/DrivingWorld"));
import { spawnCar, type RoadTelemetry } from "./lib/driving";
import { DrivingHUD } from "./components/DrivingHUD";
const PortfolioContent = lazy(() =>
  import("./components/PortfolioContent").then((m) => ({
    default: m.PortfolioContent,
  })),
);
const icons = {
  projects: BriefcaseIcon,
  labs: SparkleIcon,
  skills: BooksIcon,
  about: UserIcon,
  experience: HouseIcon,
  contact: EnvelopeSimpleIcon,
};
const validSection = (value: string): value is SectionId =>
  ["projects", "about", "skills", "experience", "contact", "labs"].includes(
    value,
  );

class WorldBoundary extends Component<
  { children: ReactNode; onFallback: () => void; onError: () => void },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.error)
      return (
        <div className="world-error">
          <CubeIcon size={38} />
          <h2>The 3D scene couldn’t load.</h2>
          <p>Your browser may not support 3D. All the work is still here.</p>
          <button className="primary-button" onClick={this.props.onFallback}>
            Open simple view
            <ArrowRightIcon size={17} />
          </button>
        </div>
      );
    return this.props.children;
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return reduced;
}

function Dialog({
  children,
  className,
  titleId,
  onClose,
}: {
  children: ReactNode;
  className: string;
  titleId: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => {
      node?.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={className}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      {children}
    </dialog>
  );
}

export default function App() {
  const [section, setSection] = useState<SectionId | null>(() => {
    const hash = window.location.hash.slice(1);
    return validSection(hash) ? hash : null;
  });
  const [simple, setSimple] = useState(() => {
    try {
      return localStorage.getItem("bondeth-view") === "simple";
    } catch {
      return false;
    }
  });
  // Drei's DOM labels own nested React roots. Retain a visited canvas across
  // view changes so those roots aren't torn down during the page's DOM commit.
  const [worldVisited, setWorldVisited] = useState(!simple);
  useEffect(() => {
    if (!simple) setWorldVisited(true);
  }, [simple]);
  const [exploring, setExploring] = useState(false);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const journeyMain = useRef<HTMLElement>(null);
  const journeyStage = useRef<HTMLDivElement>(null);
  const portfolioScroll = useRef(0);
  const previousMode = useRef(false);
  const chapter = journeyChapter(journeyProgress);
  const routeCar = journeyCarPose(journeyProgress);
  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>("All");
  const [chosenDistrict, setChosenDistrict] = useState<DistrictId | null>(null);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [help, setHelp] = useState(false);
  const [night, setNight] = useState(
    () => document.documentElement.dataset.theme === "dark",
  );
  const [muted, setMuted] = useState(true);
  const [ambientPaused, setAmbientPaused] = useState(false);
  const [reset, setReset] = useState(0);
  const [near, setNear] = useState<SectionId | null>(null);
  const [telemetry, setTelemetry] = useState<RoadTelemetry>(() => ({
    ...spawnCar(),
    offroad: false,
  }));
  const movement = useRef<MovementInput>({ x: 0, z: 0 });
  const audio = useRef<AudioContext | null>(null);
  const reduceMotion = useReducedMotion();
  const route = routeDistrict(journeyProgress);
  const activeDistrictId =
    chosenDistrict ??
    (exploring ? nearbyDistrict(telemetry.x, telemetry.z) : route.id);
  const activeDistrict = districts.find((d) => d.id === activeDistrictId)!;
  const routeProjectIndex =
    chosenDistrict || exploring
      ? 0
      : Math.min(
          activeDistrict.projects.length - 1,
          Math.floor(route.progress * activeDistrict.projects.length),
        );
  const select = useCallback((id: SectionId) => {
    setSection(id);
    setHelp(false);
    setSelectedProject(undefined);
    setProjectFilter("All");
    if (window.location.hash !== `#${id}`)
      window.history.pushState(null, "", `#${id}`);
  }, []);
  const close = useCallback(() => {
    setSection(null);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }, []);
  const changeMode = useCallback((drive: boolean) => {
    if (drive) portfolioScroll.current = window.scrollY;
    setExploring(drive);
    setChosenDistrict(null);
    setReset((r) => r + 1);
  }, []);
  const jumpToProgress = useCallback(
    (progress: number) => {
      const main = journeyMain.current,
        stage = journeyStage.current;
      if (!main || !stage) return;
      const header = document.querySelector(".site-header")?.clientHeight ?? 92;
      const start = main.getBoundingClientRect().top + window.scrollY - header;
      window.scrollTo({
        top: start + (main.offsetHeight - stage.offsetHeight) * progress,
        behavior: reduceMotion ? "instant" : "smooth",
      });
    },
    [reduceMotion],
  );
  const jumpToChapter = useCallback(
    (index: number) => {
      setChosenDistrict(null);
      jumpToProgress(journeyStops[index]);
    },
    [jumpToProgress],
  );
  const browseDistrict = useCallback(
    (id: DistrictId) => {
      select("projects");
      setProjectFilter(districts.find((d) => d.id === id)!.filter);
    },
    [select],
  );
  useEffect(() => {
    if (simple || exploring) return;
    let frame = 0;
    const measure = () => {
      const main = journeyMain.current,
        stage = journeyStage.current;
      if (!main || !stage) return;
      const header = document.querySelector(".site-header")?.clientHeight ?? 92;
      const travel = main.offsetHeight - stage.offsetHeight;
      setJourneyProgress(
        Math.max(
          0,
          Math.min(
            1,
            (header - main.getBoundingClientRect().top) / Math.max(1, travel),
          ),
        ),
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [simple, exploring]);
  useEffect(() => {
    if (previousMode.current === exploring) return;
    previousMode.current = exploring;
    const frame = requestAnimationFrame(() =>
      window.scrollTo({
        top: exploring ? 0 : portfolioScroll.current,
        behavior: "instant",
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [exploring]);
  const openProject = useCallback(
    (id: string) => {
      select("projects");
      setSelectedProject(id);
    },
    [select],
  );
  const startDrive = useCallback(() => changeMode(true), [changeMode]);
  const onReady = useCallback(() => setReady(true), []);
  const fallback = useCallback(() => {
    setSimple(true);
    setSection("projects");
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = night ? "dark" : "light";
    try {
      localStorage.setItem("bondeth-island-theme", night ? "dark" : "light");
    } catch {
      /* Storage is optional. */
    }
  }, [night]);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 9000);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("bondeth-view", simple ? "simple" : "3d");
    } catch {
      /* Storage is optional. */
    }
  }, [simple]);
  useEffect(() => {
    const historyChange = () => {
      const value = window.location.hash.slice(1);
      setSection(validSection(value) ? value : null);
    };
    window.addEventListener("popstate", historyChange);
    window.addEventListener("hashchange", historyChange);
    return () => {
      window.removeEventListener("popstate", historyChange);
      window.removeEventListener("hashchange", historyChange);
    };
  }, []);
  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest("input,textarea,select,[contenteditable]")
      )
        return;
      if (e.ctrlKey || e.metaKey || e.altKey || section || help || simple)
        return;
      if (e.key.toLowerCase() === "r") {
        if (!exploring) jumpToChapter(0);
        setReset((r) => r + 1);
        return;
      }
      if (e.key.toLowerCase() === "m") {
        changeMode(!exploring);
        return;
      }
      if (e.key === "?") {
        setHelp(true);
        return;
      }
      if (e.key.toLowerCase() === "e" && near) {
        select(near);
        return;
      }
      const index = Number(e.key) - 1;
      if (index >= 0 && index < stations.length) select(stations[index].id);
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [
    select,
    section,
    help,
    simple,
    near,
    exploring,
    changeMode,
    jumpToChapter,
  ]);
  useEffect(() => {
    if (muted || !section || !audio.current) return;
    const ctx = audio.current;
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      780,
      ctx.currentTime + 0.12,
    );
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  }, [section, muted]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  const toggleSound = async () => {
    if (muted) {
      try {
        audio.current ??= new AudioContext();
        await audio.current.resume();
        setMuted(false);
      } catch {
        setMuted(true);
      }
    } else setMuted(true);
  };
  const setView = () => {
    setSimple((s) => !s);
    if (!section) setSection("projects");
    if (simple) close();
  };
  const activeSection = section || "projects";
  const nearStation = stations.find((s) => s.id === near);
  const move = (x?: number, z?: number) => {
    if (x !== undefined) movement.current.x = x;
    if (z !== undefined) movement.current.z = z;
    movement.current.invalidate?.();
  };

  return (
    <div
      className={`app pavilion-app metaverse-app ${simple ? "simple-mode" : ""} ${exploring ? "exploring driving-mode" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to portfolio
      </a>
      <header className="site-header">
        <button
          className="brand"
          title="Back to Bondeth World"
          onClick={() => {
            close();
            setSimple(false);
            changeMode(false);
            jumpToChapter(0);
          }}
        >
          <BrandMark />
          <span>
            Bondeth
            <span className="brand-separator" aria-hidden="true">
              /
            </span>
            <span className="brand-studio">code, with curiosity</span>
          </span>
        </button>
        <nav className="header-nav" aria-label="Main navigation">
          <button
            className={section === "projects" ? "active" : ""}
            onClick={() => select("projects")}
          >
            Work
          </button>
          <button
            className={section === "about" ? "active" : ""}
            onClick={() => select("about")}
          >
            About
          </button>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bondeth on GitHub"
          >
            <GithubLogoIcon size={20} />
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="all-projects-button"
            onClick={() => select("projects")}
            aria-label={`Explore all ${islandProjects.length} projects`}
          >
            All work <span>{islandProjects.length}</span>
            <ArrowUpRightIcon size={14} />
          </button>
          <button
            className="view-switch"
            onClick={setView}
            aria-label={simple ? "Switch to 3D view" : "Switch to Simple view"}
          >
            {simple ? <CubeIcon size={17} /> : <ListIcon size={17} />}
            <span>{simple ? "3D view" : "Simple view"}</span>
          </button>
          {simple && (
            <button
              className="portfolio-theme-toggle"
              onClick={() => setNight((value) => !value)}
              aria-label={night ? "Switch to daytime" : "Switch to nighttime"}
              title={night ? "Light theme" : "Dark theme"}
            >
              {night ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
          )}
          <button className="contact-button" onClick={() => select("contact")}>
            Let’s talk
            <ArrowUpRightIcon size={16} />
          </button>
        </div>
      </header>

      {simple && (
        <main id="main-content" className="simple-main">
          <PortfolioIntro section={activeSection} onWorld={setView} />
          <nav className="simple-nav" aria-label="Portfolio sections">
            {(
              [
                "projects",
                "about",
                "skills",
                "experience",
                "labs",
                "contact",
              ] as SectionId[]
            ).map((id) => {
              const Icon = icons[id];
              return (
                <button
                  key={id}
                  className={id === activeSection ? "active" : ""}
                  aria-current={id === activeSection ? "page" : undefined}
                  onClick={() => select(id)}
                >
                  <Icon size={19} />
                  {id === "experience"
                    ? "Experience"
                    : id === "projects"
                      ? "Work"
                      : id === "skills"
                        ? "Skills"
                        : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              );
            })}
          </nav>
          <section
            id="portfolio-section"
            className={`simple-content portfolio-section-${activeSection}`}
            aria-labelledby="portfolio-section-title"
          >
            <div className="portfolio-section-heading">
              <span className="portfolio-section-index">
                0
                {[
                  "projects",
                  "about",
                  "skills",
                  "experience",
                  "labs",
                  "contact",
                ].indexOf(activeSection) + 1}{" "}
                / THE PORTFOLIO
              </span>
              <h2 id="portfolio-section-title">
                {sectionNames[activeSection].replace(/\.$/, "")}
                <span>.</span>
              </h2>
            </div>
            <Suspense
              fallback={
                <p className="section-intro" role="status">
                  Opening portfolio…
                </p>
              }
            >
              <PortfolioContent
                key={`${activeSection}:${selectedProject ?? "list"}:${projectFilter}`}
                initialProjectId={selectedProject}
                initialProjectFilter={projectFilter}
                section={activeSection}
                onNavigate={select}
              />
            </Suspense>
          </section>
        </main>
      )}
      {(worldVisited || !simple) && (
        <main
          ref={journeyMain}
          id={simple ? undefined : "main-content"}
          className="studio-main pavilion-main"
          hidden={simple}
        >
          <div ref={journeyStage} className="journey-stage">
            <div
              className="world-shell"
              role="region"
              aria-label={
                exploring
                  ? "Optional BMW M4 drive through Bondeth World. Use WASD or arrow keys, and Space to brake."
                  : "Scroll to drive the BMW M4 around the island. Click the floating project labels to explore the work."
              }
            >
              <WorldBoundary onFallback={fallback} onError={onReady}>
                <Suspense fallback={null}>
                  <DrivingWorld
                    selected={section}
                    onSelect={select}
                    onProject={openProject}
                    activeDistrictId={activeDistrictId}
                    projectIndex={routeProjectIndex}
                    onDistrict={browseDistrict}
                    onReady={onReady}
                    onNear={setNear}
                    onTelemetry={setTelemetry}
                    night={night}
                    reduceMotion={reduceMotion}
                    paused={simple || help || !!section}
                    reset={reset}
                    movement={movement}
                    immersive={exploring}
                    journeyProgress={journeyProgress}
                    ambientPaused={ambientPaused}
                    onDrive={startDrive}
                  />
                </Suspense>
              </WorldBoundary>
              {!ready && (
                <div className="world-loading" role="status">
                  <div className="loading-model">
                    <CubeIcon size={39} weight="duotone" />
                  </div>
                  <strong>Welcome to Bondeth World.</strong>
                  <span>Preparing your arrival…</span>
                  {slow && (
                    <button className="text-button" onClick={fallback}>
                      Browse in simple view
                      <ArrowRightIcon size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="world-tools">
              <button
                className="icon-button"
                onClick={() => setNight((n) => !n)}
                aria-label={night ? "Switch to daytime" : "Switch to nighttime"}
                title={night ? "Daytime" : "Nighttime"}
              >
                {night ? <MoonIcon size={19} /> : <SunIcon size={20} />}
              </button>
              <button
                className="icon-button"
                onClick={toggleSound}
                aria-label={
                  muted
                    ? "Enable interaction sounds"
                    : "Mute interaction sounds"
                }
                title={muted ? "Sound off" : "Sound on"}
              >
                {muted ? (
                  <SpeakerSlashIcon size={19} />
                ) : (
                  <SpeakerHighIcon size={19} />
                )}
              </button>
              <button
                className="icon-button"
                onClick={() => setAmbientPaused((value) => !value)}
                aria-label={
                  ambientPaused
                    ? "Play scene animation"
                    : "Pause scene animation"
                }
                aria-pressed={ambientPaused}
                title={ambientPaused ? "Play animation" : "Pause animation"}
                disabled={reduceMotion}
              >
                {ambientPaused || reduceMotion ? (
                  <PlayIcon size={19} />
                ) : (
                  <PauseIcon size={19} />
                )}
              </button>
              <span className="tool-divider" />
              <button
                className="icon-button"
                onClick={() => {
                  if (!exploring) jumpToChapter(0);
                  setReset((r) => r + 1);
                }}
                aria-label="Reset car and camera"
                title="Return to start"
              >
                <ArrowCounterClockwiseIcon size={19} />
              </button>
              <button
                className="icon-button"
                onClick={() => setHelp(true)}
                aria-label="How to explore"
                title="How to explore"
              >
                <QuestionIcon size={20} />
              </button>
            </div>

            {!exploring ? (
              <>
                <section
                  key={chapter}
                  className={`pavilion-hero chapter-${chapter}`}
                  aria-label={journeyNames[chapter]}
                >
                  <div className="pavilion-eyebrow">
                    <span />{" "}
                    {
                      [
                        "Developer. Maker. Curious human.",
                        "Ideas, brought into the real world",
                        "A little space for big what-ifs",
                        "The next chapter starts with a hello",
                      ][chapter]
                    }
                  </div>
                  {chapter === 0 ? (
                    <>
                      <h1>
                        <span>Rithy</span>{" "}
                        <span>
                          Bondeth<span className="name-dot">.</span>
                        </span>
                      </h1>
                      <p className="pavilion-role">
                        Full Stack Developer <span>& AI Engineer</span>
                      </p>
                    </>
                  ) : (
                    <h2 className="journey-title">
                      {
                        [
                          null,
                          <>
                            Real problems.
                            <br />
                            Useful software<span className="name-dot">.</span>
                          </>,
                          <>
                            Always
                            <br />
                            building<span className="name-dot">.</span>
                          </>,
                          <>
                            Have something
                            <br />
                            in mind<span className="name-dot">?</span>
                          </>,
                        ][chapter]
                      }
                    </h2>
                  )}
                  <p className="pavilion-description">
                    {
                      [
                        "I turn curious ideas into useful digital things. Explore my work, meet the maker, and take the scenic route.",
                        "From local coding agents to commerce assistants and native macOS apps. Explore the products, and the thinking behind them.",
                        "I’m drawn to useful AI, careful interfaces, and ideas that make everyday life a little better. There’s always another experiment on my desk.",
                        "A new product, a fresh perspective, or a good conversation. I’d love to hear what you’re working on.",
                      ][chapter]
                    }
                  </p>
                  <div className="pavilion-actions">
                    <button
                      className="pavilion-work-button"
                      onClick={() =>
                        select(
                          chapter === 2
                            ? "labs"
                            : chapter === 3
                              ? "contact"
                              : "projects",
                        )
                      }
                    >
                      {
                        [
                          "Explore my work",
                          "Explore the projects",
                          "Visit my AI lab",
                          "Let’s talk",
                        ][chapter]
                      }{" "}
                      <ArrowUpRightIcon size={18} />
                    </button>
                    {chapter === 3 ? (
                      <a
                        className="pavilion-about-button"
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        My resume <ArrowUpRightIcon size={16} />
                      </a>
                    ) : (
                      <button
                        className="pavilion-about-button"
                        onClick={() =>
                          select(chapter === 2 ? "skills" : "about")
                        }
                      >
                        {chapter === 2 ? "My toolkit" : "Meet the maker"}{" "}
                        <ArrowRightIcon size={16} />
                      </button>
                    )}
                  </div>
                  <nav
                    className="pavilion-links"
                    aria-label="More about Bondeth"
                  >
                    <button onClick={() => select("skills")}>Toolkit</button>
                    <span>/</span>
                    <button onClick={() => select("experience")}>
                      Journey
                    </button>
                    <span>/</span>
                    <button onClick={() => select("labs")}>AI lab</button>
                  </nav>
                  <div className="pavilion-location">
                    <span /> Phnom Penh, Cambodia{" "}
                    <span className="location-line" /> Open to collaborations
                  </div>
                </section>
                <nav className="journey-navigation" aria-label="World chapters">
                  <div className="journey-progress" aria-hidden="true">
                    <span style={{ transform: `scaleX(${journeyProgress})` }} />
                  </div>
                  <div className="journey-chapters">
                    {journeyNames.map((name, i) => (
                      <button
                        key={name}
                        aria-label={`0${i + 1} ${name}`}
                        aria-current={chapter === i ? "step" : undefined}
                        onClick={() => jumpToChapter(i)}
                      >
                        <span>0{i + 1}</span>
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                  <span className="journey-scroll">
                    <ArrowDownIcon size={13} />{" "}
                    {reduceMotion
                      ? "Scroll to change the view"
                      : "Scroll to take the scenic route"}
                  </span>
                </nav>
                <div className="island-caption" aria-hidden="true">
                  <span>{activeDistrict.name}</span>
                  <span>{activeDistrict.description}</span>
                </div>
                <aside
                  className="route-map"
                  aria-label={`Island route, ${Math.round(journeyProgress * 100)} percent complete`}
                >
                  <div>
                    <span className="route-status" /> Scenic route{" "}
                    <span>
                      {String(Math.round(journeyProgress * 100)).padStart(
                        2,
                        "0",
                      )}
                      %
                    </span>
                  </div>
                  <svg viewBox="-57 -49 114 98" aria-hidden="true">
                    <rect
                      x="-35"
                      y="-25"
                      width="70"
                      height="44"
                      rx="6"
                      className="map-island"
                    />
                    <rect
                      x="-44.5"
                      y="-38.5"
                      width="89"
                      height="69"
                      rx="8.5"
                      className="map-road"
                    />
                    <rect x="-28" y="-15" width="13" height="22" rx="2" />
                    <rect x="-12" y="-23" width="25" height="8" rx="2" />
                    <rect x="18" y="-15" width="12" height="22" rx="2" />
                    <circle
                      cx={routeCar.x}
                      cy={routeCar.z}
                      r="3"
                      className="map-car"
                    />
                  </svg>
                  <span>
                    {activeDistrict.name} · {activeDistrict.projects.length}{" "}
                    projects
                  </span>
                </aside>
                <button
                  className="pavilion-drive-button"
                  onClick={() => changeMode(true)}
                >
                  <CarIcon size={18} />
                  <span>
                    Take the wheel
                    <small>WASD · Your own adventure</small>
                  </span>
                  <ArrowUpRightIcon size={17} />
                </button>
              </>
            ) : (
              <>
                <div className="drive-mode-bar">
                  <button onClick={() => changeMode(false)}>
                    <ArrowLeftIcon size={16} /> Back to portfolio
                  </button>
                  <span>Your world. Your route.</span>
                </div>
                <DrivingHUD telemetry={telemetry} />
                {nearStation && (
                  <button
                    className="near-prompt"
                    onClick={() => select(nearStation.id)}
                  >
                    <kbd>E</kbd> {nearStation.title}{" "}
                    <ArrowUpRightIcon size={15} />
                  </button>
                )}
              </>
            )}

            {exploring && (
              <div
                className="drive-touch-controls"
                aria-label="Driving controls"
              >
                {[
                  {
                    x: -1,
                    z: undefined,
                    label: "Steer left",
                    Icon: ArrowLeftIcon,
                    className: "steer-left",
                  },
                  {
                    x: 1,
                    z: undefined,
                    label: "Steer right",
                    Icon: ArrowRightIcon,
                    className: "steer-right",
                  },
                  {
                    x: undefined,
                    z: 1,
                    label: "Reverse",
                    Icon: ArrowDownIcon,
                    className: "reverse",
                  },
                  {
                    x: undefined,
                    z: -1,
                    label: "Accelerate",
                    Icon: ArrowUpIcon,
                    className: "accelerate",
                  },
                ].map(({ x, z, label, Icon, className }) => (
                  <button
                    key={label}
                    className={className}
                    aria-label={label}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      move(x, z);
                    }}
                    onPointerUp={() =>
                      move(
                        x === undefined ? undefined : 0,
                        z === undefined ? undefined : 0,
                      )
                    }
                    onPointerCancel={() =>
                      move(
                        x === undefined ? undefined : 0,
                        z === undefined ? undefined : 0,
                      )
                    }
                    onLostPointerCapture={() =>
                      move(
                        x === undefined ? undefined : 0,
                        z === undefined ? undefined : 0,
                      )
                    }
                  >
                    <Icon size={22} />
                  </button>
                ))}
                <button
                  className="brake"
                  aria-label="Brake"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    movement.current.brake = true;
                    movement.current.invalidate?.();
                  }}
                  onPointerUp={() => {
                    movement.current.brake = false;
                  }}
                  onPointerCancel={() => {
                    movement.current.brake = false;
                  }}
                  onLostPointerCapture={() => {
                    movement.current.brake = false;
                  }}
                >
                  BRAKE
                </button>
              </div>
            )}
            {!exploring && (
              <DistrictBrowser
                active={activeDistrictId}
                following={chosenDistrict === null}
                onFollow={() => setChosenDistrict(null)}
                onChoose={(id) => {
                  setChosenDistrict(id);
                  jumpToProgress(districts.find((d) => d.id === id)!.stop);
                }}
                onAll={() => select("projects")}
              />
            )}
          </div>
        </main>
      )}

      <footer className="site-footer">
        <span>
          Made with curiosity
          <span className="footer-location"> in Phnom Penh, Cambodia.</span>
        </span>
        {!simple && (
          <div className="control-legend">
            <span>
              <MouseIcon size={16} />
              {exploring
                ? "Drag to look around"
                : "Scroll to explore the world"}
            </span>
            {exploring && <span className="zoom-legend">Scroll to zoom</span>}
            {exploring && (
              <span>
                <span className="key-group">
                  <kbd>W</kbd>
                  <kbd>A</kbd>
                  <kbd>S</kbd>
                  <kbd>D</kbd>
                </span>{" "}
                to drive
              </span>
            )}
          </div>
        )}
        {!simple && (
          <button className="credits-button" onClick={() => setHelp(true)}>
            Controls & credits
          </button>
        )}
        <span className="footer-credit">
          © {new Date().getFullYear()} Bondeth
        </span>
      </footer>

      {section && !simple && (
        <Dialog
          className={`drawer ${section === "projects" ? "drawer-wide" : ""}`}
          titleId="drawer-title"
          onClose={close}
        >
          <div className="drawer-top">
            <span>
              <CubeIcon size={16} />
              BONDETH / PORTFOLIO
            </span>
            <button
              className="icon-button"
              onClick={close}
              aria-label="Close panel"
            >
              <XIcon size={21} />
            </button>
          </div>
          <div className="drawer-scroll">
            <div className="drawer-heading">
              <span className="content-kicker">
                {section === "contact" ? "SAY HELLO" : "COME A LITTLE CLOSER"}
              </span>
              <h2 id="drawer-title">{sectionNames[section]}</h2>
            </div>
            <Suspense
              fallback={
                <p className="section-intro" role="status">
                  Opening portfolio…
                </p>
              }
            >
              <PortfolioContent
                key={`${section}:${selectedProject ?? "list"}:${projectFilter}`}
                initialProjectId={selectedProject}
                initialProjectFilter={projectFilter}
                section={section}
                onNavigate={select}
              />
            </Suspense>
          </div>
          <div className="drawer-footer">
            <span>There’s more to explore.</span>
            <button className="text-button" onClick={close}>
              Back to the world
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </Dialog>
      )}

      {help && (
        <Dialog
          className="help-dialog"
          titleId="help-title"
          onClose={() => setHelp(false)}
        >
          <button
            className="icon-button help-close"
            aria-label="Close help"
            onClick={() => setHelp(false)}
          >
            <XIcon size={21} />
          </button>
          <span className="help-icon">
            <CubeIcon size={32} weight="duotone" />
          </span>
          <h2 id="help-title">Make yourself at home.</h2>
          <p>
            Scroll through the world to discover the work, or take the M4 for a
            short drive of your own.
          </p>
          <div className="help-rows">
            <div>
              <MouseIcon size={23} />
              <span>
                <strong>Explore the world</strong>Scroll through four views, or
                choose a chapter below the introduction. In driving mode, drag
                to look around and scroll to zoom.
              </span>
            </div>
            <div>
              <span className="key-group">
                <kbd>W</kbd>
                <kbd>A</kbd>
                <kbd>S</kbd>
                <kbd>D</kbd>
              </span>
              <span>
                <strong>You’re in the driver’s seat</strong>W / S accelerate and
                reverse. A / D steer. Space brakes.
              </span>
            </div>
            <div>
              <kbd>E</kbd>
              <span>
                <strong>Discover a corner</strong>Click a marker, or press E
                when you’re nearby while driving. M returns to the portfolio. R
                returns to the start.
              </span>
            </div>
            <div>
              <kbd>1-5</kbd>
              <span>
                <strong>Jump right in</strong>Number keys open the five
                portfolio destinations.
              </span>
            </div>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setHelp(false);
              changeMode(true);
            }}
          >
            Take a short drive
            <ArrowUpRightIcon size={18} />
          </button>
          <p className="model-credit">
            <a
              href="https://sketchfab.com/3d-models/bmw-m4-competition-m-package-5c0a2dafb1ad408d9fc9eeef9aee531b"
              target="_blank"
              rel="noopener noreferrer"
            >
              BMW M4 Competition
            </a>{" "}
            model by{" "}
            <a
              href="https://sketchfab.com/TheRealSRT"
              target="_blank"
              rel="noopener noreferrer"
            >
              SRT Performance
            </a>{" "}
            ·{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY 4.0
            </a>
            . Optimized for web; paint and wheel animation adapted.
          </p>
          <button
            className="text-button help-simple"
            onClick={() => {
              setHelp(false);
              fallback();
            }}
          >
            I prefer a simple portfolio
            <ArrowRightIcon size={16} />
          </button>
        </Dialog>
      )}
    </div>
  );
}
