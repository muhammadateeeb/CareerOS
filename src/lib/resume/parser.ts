import { SKILLS_ONTOLOGY } from "../data/roleSkillMap";

export interface ParsedResume {
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    location?: string;
  };
  summary?: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  extractedSections: string[];
  parsingConfidence: number;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  duration: string;
  bullets: string[];
  isQuantified: boolean;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  year: string;
}

export interface ProjectEntry {
  title: string;
  tech: string[];
  bullets: string[];
}

/**
 * Deterministic Structured Resume Parser.
 * Uses heuristics and regex - NO AI here for extraction.
 */
export function parseResume(rawText: string): ParsedResume {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  const sections = groupSections(rawText);

  const contact = extractContact(lines.slice(0, 15)); // Contact is usually top
  const skills = extractSkills(rawText);
  const experience = extractExperience(sections["experience"] || []);
  const education = extractEducation(sections["education"] || []);
  const projects = extractProjects(sections["projects"] || []);
  const certifications = extractSimpleList(sections["certifications"] || []);
  const achievements = extractSimpleList(sections["achievements"] || []);

  return {
    contact,
    summary: sections["summary"]?.[0] || "",
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    languages: extractSimpleList(sections["languages"] || []),
    extractedSections: Object.keys(sections),
    parsingConfidence: calculateParsingConfidence(contact, skills, experience)
  };
}

function groupSections(text: string): Record<string, string[]> {
  const sectionHeaders: Record<string, RegExp> = {
    summary: /SUMMARY|PROFESSIONAL PROFILE|OBJECTIVE/i,
    experience: /EXPERIENCE|WORK HISTORY|EMPLOYMENT/i,
    education: /EDUCATION|ACADEMIC/i,
    skills: /SKILLS|TECHNICAL STRENGTHS/i,
    projects: /PROJECTS|PORTFOLIO/i,
    certifications: /CERTIFICATIONS|LICENSES/i,
    achievements: /ACHIEVEMENTS|AWARDS/i,
    languages: /LANGUAGES/i
  };

  const lines = text.split("\n");
  const result: Record<string, string[]> = {};
  let currentSection = "header";

  lines.forEach(line => {
    let found = false;
    for (const [key, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line) && line.length < 30) {
        currentSection = key;
        found = true;
        break;
      }
    }
    if (!found) {
      if (!result[currentSection]) result[currentSection] = [];
      result[currentSection].push(line.trim());
    }
  });

  return result;
}

function extractContact(lines: string[]): ParsedResume["contact"] {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const linkedinRegex = /linkedin\.com\/in\/[a-z0-9-]+/i;
  const githubRegex = /github\.com\/[a-z0-9-]+/i;

  const contact: ParsedResume["contact"] = {};

  for (const line of lines) {
    if (!contact.email && emailRegex.test(line)) {
      contact.email = line.match(emailRegex)?.[0];
    }
    if (!contact.phone && phoneRegex.test(line)) {
      contact.phone = line.match(phoneRegex)?.[0];
    }
    if (!contact.linkedin && linkedinRegex.test(line)) {
      contact.linkedin = line.match(linkedinRegex)?.[0];
    }
    if (!contact.github && githubRegex.test(line)) {
      contact.github = line.match(githubRegex)?.[0];
    }
    // Simple name heuristic: first non-empty line that isn't contact info
    if (!contact.name && line.length > 3 && !emailRegex.test(line) && !phoneRegex.test(line)) {
      if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(line)) {
        contact.name = line;
      }
    }
  }

  return contact;
}

function extractSkills(text: string): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  SKILLS_ONTOLOGY.forEach(skill => {
    const searchTerms = [skill.canonical.toLowerCase(), ...skill.aliases.map(a => a.toLowerCase())];
    for (const term of searchTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(lowerText)) {
        found.add(skill.canonical);
        break;
      }
    }
  });

  return Array.from(found);
}

function extractExperience(lines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  let current: Partial<ExperienceEntry> | null = null;

  lines.forEach(line => {
    // Detect company/role line (usually has a date or pipe)
    if (/\d{4}/.test(line) && (line.includes("|") || line.includes("-") || line.length < 60)) {
      if (current && current.role) entries.push(current as ExperienceEntry);
      current = {
        role: line.split(/[|\-,]/)[0]?.trim() || "Unknown Role",
        company: line.split(/[|\-,]/)[1]?.trim() || "Unknown Company",
        duration: line.match(/\d{4}.*?(\d{4}|Present)/i)?.[0] || "",
        bullets: [],
        isQuantified: false
      };
    } else if (current) {
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        const bullet = line.replace(/^[•\-*]\s*/, "");
        current.bullets?.push(bullet);
        if (/\d+%|\d+\s?%|reduced|increased|optimized|saved|\$\d+/i.test(bullet)) {
          current.isQuantified = true;
        }
      }
    }
  });

  if (current && current.role) entries.push(current as ExperienceEntry);
  return entries;
}

function extractEducation(lines: string[]): EducationEntry[] {
  const edu: EducationEntry[] = [];
  lines.forEach(line => {
    if (/Bachelor|Master|B\.S\.|M\.S\.|Degree|University|College/i.test(line)) {
      edu.push({
        institution: line.split(/,|at/)[1]?.trim() || line,
        degree: line.split(/,|at/)[0]?.trim() || "",
        year: line.match(/\d{4}/)?.[0] || ""
      });
    }
  });
  return edu;
}

function extractProjects(lines: string[]): ProjectEntry[] {
  // Similar to experience but looking for project titles
  return []; // Simplified for now
}

function extractSimpleList(lines: string[]): string[] {
  return lines.filter(l => l.length > 5 && (l.startsWith("•") || l.startsWith("-") || l.startsWith("*")))
              .map(l => l.replace(/^[•\-*]\s*/, ""));
}

function calculateParsingConfidence(contact: any, skills: string[], experience: any[]): number {
  let score = 0;
  if (contact.name && contact.email) score += 0.4;
  if (skills.length > 5) score += 0.3;
  if (experience.length > 0) score += 0.3;
  return score;
}
