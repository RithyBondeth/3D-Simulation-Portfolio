export type SectionId =
  "projects" | "about" | "skills" | "experience" | "contact" | "labs";
export type Vec3 = [number, number, number];
export type MovementInput = { x: number; z: number; brake?: boolean; invalidate?: () => void };

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
    position: [-20, 6, -22],
  },
  {
    id: "labs",
    title: "The AI lab",
    subtitle: "The innovation pavilion",
    number: "02",
    position: [20, 8, -23],
  },
  {
    id: "skills",
    title: "My toolkit",
    subtitle: "The tech garden",
    number: "03",
    position: [23, 6, 22],
  },
  {
    id: "about",
    title: "A little about me",
    subtitle: "The waterfront house",
    number: "04",
    position: [-20, 6, 22],
  },
  {
    id: "experience",
    title: "The journey",
    subtitle: "The coastal lookout",
    number: "05",
    position: [-47, 7, 0],
  },
];
