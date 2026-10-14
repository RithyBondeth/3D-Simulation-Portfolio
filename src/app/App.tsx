import RouteMap from "../presentation/interface/RouteMap";
import SiteFooter from "../presentation/interface/SiteFooter";
import DrivingControls from "../presentation/interface/DrivingControls";
import ControlsHelp from "../presentation/interface/ControlsHelp";
import WorldSettings from "../presentation/interface/WorldSettings";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BooksIcon,
  BriefcaseIcon,
  SparkleIcon,
  UserIcon,
  HouseIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react";
import {
  readPortfolioRoute,
  portfolioURL,
} from "../domain/portfolio/portfolio-route";
import {
  CarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CubeIcon,
  ListIcon,
  MoonIcon,
  SunIcon,
  XIcon,
} from "@phosphor-icons/react";
import { worldDestinations } from "../domain/world/destinations";
import { sectionNames } from "../domain/portfolio/sections";
import { type SectionId } from "../domain/portfolio/types";
import { type MovementInput } from "../application/driving-input";
import { districts, islandProjects } from "../data/portfolio/project-catalog";
import {
  nearbyDistrict,
  routeDistrict,
  type DistrictId,
  type ProjectFilter,
} from "../domain/portfolio/project-districts";
import BrandMark, { BrandName } from "../presentation/shared/BrandMark";
import PortfolioIntro from "../presentation/portfolio/PortfolioIntro";
import SelectedWork from "../presentation/portfolio/SelectedWork";
import PortfolioDestinations from "../presentation/portfolio/PortfolioDestinations";
import {
  portfolioSections,
  portfolioSectionHref,
} from "../domain/portfolio/portfolio-story";
import { projectHref } from "../domain/portfolio/portfolio-route";
import {
  chooseGraphicsQuality,
  type GraphicsPreference,
} from "../domain/world/graphics-quality";
import {
  journeyChapter,
  journeyNames,
  journeyStops,
} from "../domain/world/scroll-journey";
const projectIds = islandProjects.map((project) => project.id);
const deviceHints = () => {
  const device = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    compact: window.matchMedia("(max-width: 760px)").matches,
    saveData: device.connection?.saveData,
    cores: navigator.hardwareConcurrency,
    memory: device.deviceMemory,
  };
};
const initialRoute = () => readPortfolioRoute(window.location.href, projectIds);
const writeRoute = (
  section: SectionId | null,
  projectId?: string,
  replace = false,
) => {
  const url = portfolioURL(window.location.href, { section, projectId });
  if (url !== window.location.href)
    window.history[replace ? "replaceState" : "pushState"](null, "", url);
};

const WorldCanvas = lazy(() => import("../presentation/world/WorldCanvas"));
import { spawnCar, type RoadTelemetry } from "../domain/world/driving";
import { DrivingHUD } from "../presentation/world/DrivingHUD";
const PortfolioContent = lazy(() =>
  import("../presentation/portfolio/PortfolioContent").then((m) => ({
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

import WorldBoundary from "../presentation/shared/WorldBoundary";
import Dialog from "../presentation/shared/Dialog";
import useReducedMotion from "../application/useReducedMotion";

export default function App() {
  const [section, setSection] = useState<SectionId | null>(
    () => initialRoute().section,
  );
  const [simple, setSimple] = useState(() => {
    try {
      return (
        window.location.pathname.startsWith("/projects/") ||
        !!initialRoute().projectId ||
        localStorage.getItem("bondeth-view") === "simple"
      );
    } catch {
      return (
        window.location.pathname.startsWith("/projects/") ||
        !!initialRoute().projectId
      );
    }
  });
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsTrigger = useRef<HTMLButtonElement>(null);
  const [graphicsPreference, setGraphicsPreference] =
    useState<GraphicsPreference>(() => {
      try {
        const saved = localStorage.getItem("bondeth-graphics");
        return saved === "high" || saved === "low" ? saved : "auto";
      } catch {
        return "auto";
      }
    });
  const [graphicsQuality, setGraphicsQuality] = useState(() =>
    chooseGraphicsQuality(graphicsPreference, deviceHints()),
  );
  useEffect(() => {
    setGraphicsQuality(
      chooseGraphicsQuality(graphicsPreference, deviceHints()),
    );
    try {
      localStorage.setItem("bondeth-graphics", graphicsPreference);
    } catch {
      /* Optional preference. */
    }
  }, [graphicsPreference]);
  const reduceQuality = useCallback(() => {
    if (graphicsPreference === "auto") setGraphicsQuality("low");
  }, [graphicsPreference]);
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
    setProjectFilter("All");
    writeRoute(id);
  }, []);
  const close = useCallback(() => {
    setSection(null);
    writeRoute(null, undefined, true);
  }, []);
  const changeMode = useCallback((drive: boolean) => {
    if (drive) {
      portfolioScroll.current = window.scrollY;
    }
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
  useEffect(() => {
    const legacy = initialRoute().projectId;
    if (legacy) window.location.replace(projectHref(legacy));
  }, []);
  const startDrive = useCallback(() => changeMode(true), [changeMode]);
  const onReady = useCallback(() => setReady(true), []);
  const fallback = useCallback(() => {
    setSimple(true);
    setSection("about");
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
      const route = initialRoute();
      setSection(route.section);
      if (route.projectId)
        window.location.replace(projectHref(route.projectId));
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
      if (index >= 0 && index < portfolioSections.length)
        select(portfolioSections[index].id);
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
    if (!section) setSection("about");
    if (simple) close();
  };
  useEffect(() => {
    if (!toolsOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest(".world-tools")
      )
        setToolsOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setToolsOpen(false);
        toolsTrigger.current?.focus();
      }
    };
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", escape);
    };
  }, [toolsOpen]);
  const activeSection = section || "about";
  const nearStation = worldDestinations.find((s) => s.id === near);
  const move = (x?: number, z?: number) => {
    if (x !== undefined) movement.current.x = x;
    if (z !== undefined) movement.current.z = z;
    movement.current.invalidate?.();
  };

  return (
    <div
      className={`app world-app portfolio-app ${simple ? "simple-mode" : ""} ${exploring ? "exploring driving-mode" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to portfolio
      </a>
      <header className="site-header">
        <div className="header-inner">
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
            <BrandName />
          </button>
          <nav className="header-nav" aria-label="Main navigation">
            <button
              className={`all-projects-button ${section === "projects" || (simple && activeSection === "projects") ? "active" : ""}`}
              onClick={() => select("projects")}
              aria-label={`Work ${islandProjects.length} — Explore all projects`}
            >
              Work <span>{islandProjects.length}</span>
              <ArrowUpRightIcon size={14} />
            </button>

            <button
              className={section === "about" ? "active" : ""}
              onClick={() => select("about")}
            >
              About
            </button>
          </nav>
          <div className="header-actions">
            <button
              className="view-switch"
              onClick={setView}
              aria-label={simple ? "Explore in 3D" : "Portfolio view"}
              title={simple ? "Explore the 3D world" : "Browse the portfolio"}
            >
              {simple ? <CubeIcon size={17} /> : <ListIcon size={17} />}
              <span>{simple ? "Explore in 3D" : "Portfolio view"}</span>
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
            <button
              className="contact-button"
              onClick={() => select("contact")}
            >
              Let’s talk
              <ArrowUpRightIcon size={16} />
            </button>
          </div>
        </div>
      </header>

      {simple && (
        <main
          id="main-content"
          className={`simple-main ${activeSection === "projects" ? "work-first" : ""}`}
        >
          <PortfolioIntro section={activeSection} onWorld={setView} />
          {activeSection === "projects" && <SelectedWork />}
          <nav className="simple-nav" aria-label="Portfolio sections">
            {portfolioSections.map(({ id, name }) => {
              const Icon = icons[id];
              return (
                <button
                  key={id}
                  className={id === activeSection ? "active" : ""}
                  aria-current={id === activeSection ? "page" : undefined}
                  onClick={() => select(id)}
                >
                  <Icon size={19} />
                  {name}
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
                {portfolioSections.findIndex(({ id }) => id === activeSection) +
                  1}{" "}
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
                key={activeSection}
                initialProjectFilter={projectFilter}
                onFilterChange={setProjectFilter}
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
          className="portfolio-main world-main"
          hidden={simple}
        >
          <div ref={journeyStage} className="journey-stage">
            <div
              className="world-shell"
              role="region"
              aria-label={
                exploring
                  ? "Optional BMW M4 drive through Bondeth World. Use WASD or arrow keys, and Space to brake."
                  : "Scroll to drive the BMW M4 around the island. Choose a destination to explore my background, skills, journey, work, experiments, and contact."
              }
            >
              <WorldBoundary onFallback={fallback} onError={onReady}>
                <Suspense fallback={null}>
                  <WorldCanvas
                    selected={section}
                    onSelect={select}
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
                    graphicsQuality={graphicsQuality}
                    automaticQuality={graphicsPreference === "auto"}
                    onReduceQuality={reduceQuality}
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
                  <div className="loading-track" aria-hidden="true">
                    <span />
                  </div>
                  <p>
                    {slow
                      ? "Taking a little longer. You can browse while the island loads."
                      : "The world is loading. Your work is ready to browse."}
                  </p>
                  <button className="text-button" onClick={fallback}>
                    Browse projects now
                    <ArrowRightIcon size={16} />
                  </button>
                </div>
              )}
            </div>

            <WorldSettings
              open={toolsOpen}
              triggerRef={toolsTrigger}
              onToggle={() => setToolsOpen((value) => !value)}
              night={night}
              onToggleNight={() => setNight((value) => !value)}
              muted={muted}
              onToggleSound={toggleSound}
              animationPaused={ambientPaused}
              onToggleAnimation={() => setAmbientPaused((value) => !value)}
              reduceMotion={reduceMotion}
              onReset={() => {
                if (!exploring) jumpToChapter(0);
                setReset((value) => value + 1);
              }}
              onHelp={() => setHelp(true)}
              graphicsPreference={graphicsPreference}
              onGraphicsChange={setGraphicsPreference}
            />

            {!exploring ? (
              <>
                <section
                  key={chapter}
                  className={`world-hero chapter-${chapter}`}
                  aria-label={journeyNames[chapter]}
                >
                  <div className="world-eyebrow">
                    <span />
                    {portfolioSections[chapter].eyebrow}
                  </div>
                  {chapter === 0 ? (
                    <>
                      <h1>
                        <span>Rithy</span>{" "}
                        <span>
                          Bondeth<span className="name-dot">.</span>
                        </span>
                      </h1>
                      <p className="world-role">
                        Full Stack Developer <span>& AI Engineer</span>
                      </p>
                    </>
                  ) : (
                    <h2 className="journey-title">
                      {portfolioSections[chapter].title}
                    </h2>
                  )}
                  <p className="world-description">
                    {portfolioSections[chapter].description}
                  </p>
                  <ul className="story-facts">
                    {portfolioSections[chapter].facts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                  <div className="world-actions">
                    <button
                      className="world-work-button"
                      onClick={() => select(portfolioSections[chapter].id)}
                    >
                      {portfolioSections[chapter].action}
                      <ArrowUpRightIcon size={18} />
                    </button>
                    <a
                      className="world-about-button"
                      href={portfolioSectionHref(portfolioSections[chapter].id)}
                    >
                      More on bondeth.dev
                      <ArrowUpRightIcon size={16} />
                    </a>
                  </div>
                  <div className="world-location">
                    <span /> Phnom Penh, Cambodia{" "}
                    <span className="location-line" /> Open to collaborations
                  </div>
                </section>
                <div className="island-caption" aria-hidden="true">
                  <span>
                    {chapter === 3
                      ? activeDistrict.name
                      : portfolioSections[chapter].name}
                  </span>
                  <span>
                    {chapter === 3
                      ? activeDistrict.description
                      : portfolioSections[chapter].detail}
                  </span>
                </div>
                <RouteMap
                  progress={journeyProgress}
                  chapter={chapter}
                  activeDistrict={activeDistrict}
                />
                <button
                  className="world-drive-button"
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

            {exploring && <DrivingControls movement={movement} move={move} />}
            {!exploring && (
              <PortfolioDestinations
                active={section ?? portfolioSections[chapter].id}
                onSelect={(id) => {
                  jumpToChapter(
                    portfolioSections.findIndex(
                      (destination) => destination.id === id,
                    ),
                  );
                  select(id);
                }}
              />
            )}
          </div>
        </main>
      )}

      <SiteFooter
        simple={simple}
        onContact={() => select("contact")}
        onHelp={() => setHelp(true)}
        onWorld={setView}
      />

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
                key={section}
                initialProjectFilter={projectFilter}
                onFilterChange={setProjectFilter}
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
        <ControlsHelp
          onClose={() => setHelp(false)}
          onDrive={() => {
            setHelp(false);
            changeMode(true);
          }}
          onSimple={() => {
            setHelp(false);
            fallback();
          }}
        />
      )}
    </div>
  );
}
