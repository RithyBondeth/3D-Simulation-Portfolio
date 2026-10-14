import data from "./content.json";
import {
  districtForProject,
  projectDistricts,
} from "../../domain/portfolio/project-districts";

/** Derived from the portfolio records so new projects appear on the island automatically. */
export const islandProjects = data.projects.map((project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  district: districtForProject(project),
}));
export const districts = projectDistricts.map((district) => ({
  ...district,
  projects: islandProjects.filter(
    (project) => project.district === district.id,
  ),
}));
export type ProjectDistrict = (typeof districts)[number];
