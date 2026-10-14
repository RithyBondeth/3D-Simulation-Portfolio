import type { SectionId } from "../portfolio/types";
import type { Vec3 } from "./types";

export const worldDestinations: {
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
