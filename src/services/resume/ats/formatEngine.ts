import { ParsedResume } from "../types/resume.types";

/**
 * Analyzes resume formatting and layout.
 */
export function analyzeFormatting(parsed: ParsedResume) {
  const issues: string[] = [];
  let score = 100;

  // Penalize huge paragraphs
  const longParagraphs = parsed.experience.some(exp =>
    exp.achievements.some(ach => ach.length > 300)
  );
  if (longParagraphs) {
    issues.push("Some bullet points are too long. Aim for concise 1-2 line achievements.");
    score -= 20;
  }

  // Penalize missing sections
  if (parsed.experience.length === 0) {
    issues.push("Work experience section is missing or unreadable.");
    score -= 30;
  }
  if (parsed.education.length === 0) {
    issues.push("Education section is missing or unreadable.");
    score -= 20;
  }

  // Check for bullet points
  const hasBullets = parsed.experience.some(exp => exp.achievements.length > 0);
  if (!hasBullets) {
    issues.push("Use bullet points for your achievements to improve readability.");
    score -= 30;
  }

  return {
    score: Math.max(0, score),
    issues
  };
}
