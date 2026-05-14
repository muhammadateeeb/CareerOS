/**
 * Advanced section detection engine using confidence scoring and structural heuristics.
 */

type SectionType = "summary" | "experience" | "education" | "skills" | "certifications" | "projects" | "awards" | "achievements";

interface Section {
  type: SectionType;
  content: string;
  confidence: number;
}

const SECTION_MAP: Record<SectionType, RegExp[]> = {
  summary: [/summary/i, /objective/i, /profile/i, /about\s*me/i, /professional\s*profile/i],
  experience: [/experience/i, /employment/i, /work\s*history/i, /professional\s*background/i],
  education: [/education/i, /academic/i, /qualifications/i, /university/i],
  skills: [/skills/i, /technical\s*expertise/i, /technologies/i, /core\s*competencies/i],
  certifications: [/certifications/i, /certificates/i, /credentials/i, /licenses/i],
  projects: [/projects/i, /personal\s*projects/i, /portfolio/i, /side\s*projects/i],
  awards: [/awards/i, /honors/i, /distinctions/i],
  achievements: [/achievements/i, /major\s*achievements/i]
};

export function detectSections(text: string): Section[] {
  const sections: Section[] = [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  let currentSection: { type: SectionType, lines: string[], confidence: number } | null = null;

  lines.forEach(line => {
    let detectedType: SectionType | null = null;
    let maxConfidence = 0;

    // Heading detection: short, capitalized, matches patterns
    if (line.length < 50 && line === line.toUpperCase()) {
      for (const [type, patterns] of Object.entries(SECTION_MAP)) {
        for (const pattern of patterns) {
          if (pattern.test(line)) {
            detectedType = type as SectionType;
            maxConfidence = 100;
            break;
          }
        }
        if (detectedType) break;
      }
    }

    if (detectedType) {
      if (currentSection) {
        sections.push({
          type: currentSection.type,
          content: currentSection.lines.join("\n"),
          confidence: currentSection.confidence
        });
      }
      currentSection = { type: detectedType, lines: [], confidence: maxConfidence };
    } else if (currentSection) {
      currentSection.lines.push(line);
    }
  });

  if (currentSection) {
    sections.push({
      type: currentSection.type,
      content: currentSection.lines.join("\n"),
      confidence: currentSection.confidence
    });
  }

  return sections;
}
