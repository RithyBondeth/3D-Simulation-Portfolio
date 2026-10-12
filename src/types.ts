export type SectionId =
  "projects" | "about" | "skills" | "experience" | "contact" | "labs";
export type Vec3 = [number, number, number];
export type MovementInput = {
  x: number;
  z: number;
  brake?: boolean;
  invalidate?: () => void;
};

export const sectionNames: Record<SectionId, string> = {
  projects: "Selected work",
  about: "Meet the maker",
  skills: "The toolkit",
  experience: "The journey",
  contact: "Let’s make something.",
  labs: "A space for curiosity.",
};

export interface Project {
  id: string;
  title: string;
  description: string;
  overview?: string;
  tags: string[];
  category: string;
  domains: string[];
  tier: string;
  visibility: string;
  links: { kind: string; url: string }[];
  image: string;
  caseStudy?: {
    problem: string;
    decisions: { title: string; body: string; tradeoff?: string }[];
    outcome: string;
    constraints?: string[];
    metrics?: { value: string; label: string }[];
  };
}

export const stations: {
  id: SectionId;
  title: string;
  subtitle: string;
  number: string;
  position: Vec3;
}[] = [
  {
    id: "projects",
    title: "Selected work",
    subtitle: "The project gallery",
    number: "01",
    position: [-23, 6.2, 9],
  },
  {
    id: "labs",
    title: "The AI lab",
    subtitle: "Ideas in practice",
    number: "02",
    position: [0, 7.4, -14],
  },
  {
    id: "skills",
    title: "My toolkit",
    subtitle: "Tools of the craft",
    number: "03",
    position: [23, 6.2, 8],
  },
  {
    id: "about",
    title: "A little about me",
    subtitle: "The person behind the work",
    number: "04",
    position: [-18, 2.4, 18],
  },
  {
    id: "experience",
    title: "The journey",
    subtitle: "Experience & education",
    number: "05",
    position: [20, 2.4, 18],
  },
];
