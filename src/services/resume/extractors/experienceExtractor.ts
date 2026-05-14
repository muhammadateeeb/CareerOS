import { ExperienceEntry } from "../types/resume.types";

/**
 * Extracts professional experience with achievement detection.
 */

const ACTION_VERBS = [
  "built", "developed", "engineered", "led", "managed", "implemented", "created",
  "designed", "reduced", "increased", "optimized", "improved", "automated",
  "delivered", "launched", "migrated", "scaled", "architected", "mentored"
];

export function extractExperience(text: string): ExperienceEntry[] {
  const experiences: ExperienceEntry[] = [];

  // Look for experience section
  const expMatch = text.match(/(?:EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY)(.*?)(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|$)/is);
  if (!expMatch) return [];

  const section = expMatch[1];

  // Simple heuristic: split by lines that look like company/role headers
  // Usually: "Company Name | Role | Date" or "Role at Company"
  const lines = section.split("\n").map(l => l.trim()).filter(Boolean);
  let currentEntry: ExperienceEntry | null = null;

  for (const line of lines) {
    // Detect potential header: contains a date range or pipe
    const hasDate = /\b(19|20)\d{2}\b/.test(line);
    const hasSeparator = /[|–\-]/.test(line);

    if (hasDate && (hasSeparator || line.length < 100)) {
      if (currentEntry) experiences.push(currentEntry);

      currentEntry = {
        company: line.split(/[|–\-]/)[0]?.trim(),
        role: line.split(/[|–\-]/)[1]?.trim(),
        duration: line.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}|Present|\d{4})\b.*?\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}|Present|\d{4})\b/i)?.[0],
        achievements: [],
        metricsFound: 0,
        actionVerbsFound: 0
      };
    } else if (currentEntry) {
      // It's a bullet point or description
      if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        const achievement = line.replace(/^[•\-*]\s*/, "").trim();
        currentEntry.achievements.push(achievement);

        // Count metrics
        const metrics = achievement.match(/\d+(%|k|m|b|\s?users|\s?clients|\s?requests)/gi);
        if (metrics) currentEntry.metricsFound += metrics.length;

        // Count action verbs
        const lowerAch = achievement.toLowerCase();
        ACTION_VERBS.forEach(verb => {
          if (lowerAch.includes(verb)) currentEntry.actionVerbsFound++;
        });
      }
    }
  }

  if (currentEntry) experiences.push(currentEntry);

  return experiences;
}
