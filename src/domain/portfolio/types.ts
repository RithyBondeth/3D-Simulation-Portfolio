export type SectionId =
  "projects" | "about" | "skills" | "experience" | "contact" | "labs";
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  domains: string[];
  image: string;
}
