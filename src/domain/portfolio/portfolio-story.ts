import type { SectionId } from "./types.ts";

export const mainPortfolio = "https://www.bondeth.dev/en";
export const portfolioSections = [
  {
    id: "about",
    name: "About",
    detail: "The person & principles",
    stop: 0,
    eyebrow: "A developer, a maker, a curious human",
    title: "Rithy Bondeth.",
    description:
      "A full stack developer and AI engineer in Phnom Penh. I build software, teach what I learn, and make useful ideas real.",
    action: "Meet the maker",
    facts: [
      "Phnom Penh · UTC+7",
      "Khmer & English",
      "Clarity, care, lasting quality",
    ],
  },
  {
    id: "skills",
    name: "Skills",
    detail: "Toolkit & services",
    stop: 0.18,
    eyebrow: "What I bring to a project",
    title: "From idea to delivery.",
    description:
      "Interfaces, APIs, mobile apps, and practical AI. Explore the tools I use and the software services I can help you build.",
    action: "Skills & services",
    facts: [
      "Web & mobile development",
      "AI systems & integration",
      "Custom business software",
    ],
  },
  {
    id: "experience",
    name: "Journey",
    detail: "Career & education",
    stop: 0.38,
    eyebrow: "The experience behind the work",
    title: "Learning. Building. Growing.",
    description:
      "From teaching code and supporting teams to delivering production software. My career and education shape how I approach each project.",
    action: "My journey",
    facts: [
      "Six roles across teams",
      "CADT · Computer Science",
      "Techo Scholar · 2020–2024",
    ],
  },
  {
    id: "projects",
    name: "Work",
    detail: "Products & case studies",
    stop: 0.58,
    eyebrow: "Ideas brought into the real world",
    title: "Useful software.",
    description:
      "Web platforms, mobile products, native apps, and AI tools. Discover the work here, then read each case study on bondeth.dev.",
    action: "Explore work",
    facts: [
      "Web, mobile, native & AI",
      "Public products & selected work",
      "Case studies on bondeth.dev",
    ],
  },
  {
    id: "labs",
    name: "Explore",
    detail: "Labs, writing & videos",
    stop: 0.78,
    eyebrow: "Ideas to try, read, and watch",
    title: "Curiosity in practice.",
    description:
      "Interactive AI experiments, engineering articles, and technical videos in English and Khmer. Explore how the ideas work in practice.",
    action: "Explore ideas",
    facts: [
      "Three interactive AI labs",
      "Software engineering articles",
      "Technical videos · English & Khmer",
    ],
  },
  {
    id: "contact",
    name: "Contact",
    detail: "Start a conversation",
    stop: 1,
    eyebrow: "The next chapter starts with a hello",
    title: "Let’s build something useful.",
    description:
      "Have a product, a problem, or an idea in mind? Tell me what you are working on and we can find a practical next step.",
    action: "Get in touch",
    facts: [
      "Selected software & AI collaborations",
      "Local & remote teams",
      "Phnom Penh · UTC+7",
    ],
  },
] as const satisfies readonly {
  id: SectionId;
  name: string;
  detail: string;
  stop: number;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  facts: readonly string[];
}[];

export function portfolioSectionHref(section: SectionId) {
  if (section === "projects" || section === "labs")
    return `${mainPortfolio}/${section}`;
  return `${mainPortfolio}#${section}`;
}
export const services = [
  {
    title: "Web development",
    description: "Websites, platforms, dashboards, and APIs.",
  },
  {
    title: "Mobile development",
    description: "Practical cross-platform apps and mobile workflows.",
  },
  {
    title: "AI integration",
    description: "Assistants, retrieval, automation, and evaluation.",
  },
  {
    title: "Custom software",
    description: "Internal tools and systems for real operational needs.",
  },
];
export const writing = [
  {
    title: "Reliable background jobs",
    topic: "Backend · Queues",
    href: "background-jobs-idempotency-retries",
  },
  {
    title: "Safer database changes",
    topic: "Databases · PostgreSQL",
    href: "zero-downtime-database-migrations",
  },
  {
    title: "AI and the way we work",
    topic: "AI · Ideas",
    href: "can-ai-replace-humans",
  },
];
