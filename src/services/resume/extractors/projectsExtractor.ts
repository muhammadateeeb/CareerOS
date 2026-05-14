import { ProjectEntry } from "../types/resume.types";
import { extractSkills } from "./skillsExtractor";

/**
 * Extracts projects and their tech stacks from resume text.
 */
export function extractProjects(text: string): ProjectEntry[] {
  const projects: ProjectEntry[] = [];

  const projMatch = text.match(/(?:PROJECTS|PERSONAL PROJECTS|SIDE PROJECTS|PORTFOLIO)(.*?)(?:EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|$)/is);
  if (!projMatch) return [];

  const section = projMatch[1];
  const lines = section.split("\n").map(l => l.trim()).filter(Boolean);

  let currentProject: ProjectEntry | null = null;

  for (const line of lines) {
    // Project title is usually short and not a bullet
    if (line.length < 50 && !line.startsWith("•") && !line.startsWith("-") && !line.startsWith("*")) {
      if (currentProject) projects.push(currentProject);

      currentProject = {
        title: line,
        description: "",
        technologies: []
      };
    } else if (currentProject) {
      currentProject.description += line + " ";
      // Extract tech stack
      const skills = extractSkills(line);
      currentProject.technologies = Array.from(new Set([...currentProject.technologies, ...skills]));
    }
  }

  if (currentProject) projects.push(currentProject);

  return projects;
}
