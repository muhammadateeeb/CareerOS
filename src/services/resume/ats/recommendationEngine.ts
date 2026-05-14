import { ParsedResume, Recommendation, Role } from "../types/resume.types";

/**
 * Generates intelligent, prioritized recommendations based on resume analysis and onboarding goals.
 */
export function generateRecommendations(
  parsed: ParsedResume,
  atsScore: number,
  missingKeywords: string[],
  targetRole?: Role
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. Missing Critical Info
  if (!parsed.personalInfo.linkedin) {
    recommendations.push({
      id: "rec-linkedin",
      category: "missing_info",
      message: "Add your LinkedIn profile to the header. Recruiters often use it to verify professional background.",
      priority: "high",
      actionable: true
    });
  }

  if (!parsed.personalInfo.github && targetRole && ["Frontend Developer", "Backend Developer", "Full Stack Developer", "AI Engineer"].includes(targetRole.title)) {
    recommendations.push({
      id: "rec-github",
      category: "missing_info",
      message: "For engineering roles, a GitHub profile is highly recommended to showcase your coding ability.",
      priority: "medium",
      actionable: true
    });
  }

  // 2. Metrics & Achievements
  const totalMetrics = parsed.experience.reduce((sum, exp) => sum + exp.metricsFound, 0);
  if (totalMetrics < 3) {
    recommendations.push({
      id: "rec-metrics",
      category: "content",
      message: "Your resume lacks quantified achievements. Add specific metrics (e.g., 'Reduced costs by 15%', 'Optimized API response by 200ms') to prove impact.",
      priority: "high",
      actionable: true
    });
  }

  // 3. Keyword Optimization
  if (missingKeywords.length > 5) {
    recommendations.push({
      id: "rec-keywords",
      category: "optimization",
      message: `Your resume is missing critical keywords for a ${targetRole?.title || "professional"} role. Focus on incorporating: ${missingKeywords.slice(0, 3).join(", ")}.`,
      priority: "high",
      actionable: true
    });
  }

  // 4. Role-Specific Skill Gaps
  if (targetRole) {
    const missingSkills = targetRole.preferredSkills.filter(s =>
      !parsed.skills.some(ps => ps.toLowerCase() === s.toLowerCase())
    );

    if (missingSkills.length > 0) {
      recommendations.push({
        id: "rec-skills",
        category: "content",
        message: `To better align with ${targetRole.title} positions, consider gaining experience in or highlighting: ${missingSkills.slice(0, 3).join(", ")}.`,
        priority: "medium",
        actionable: true
      });
    }
  }

  // 5. Project Depth
  if (parsed.projects.length < 2) {
    recommendations.push({
      id: "rec-projects",
      category: "content",
      message: "Add more detailed projects to your portfolio. Real-world applications of your skills carry significant weight in ATS screenings.",
      priority: "medium",
      actionable: true
    });
  }

  // 6. Formatting
  const hasBullets = parsed.experience.some(exp => exp.achievements.length > 0);
  if (!hasBullets) {
    recommendations.push({
      id: "rec-format",
      category: "formatting",
      message: "Restructure your experience using bullet points. Walls of text are difficult for both ATS and human recruiters to parse.",
      priority: "high",
      actionable: true
    });
  }

  return recommendations;
}
