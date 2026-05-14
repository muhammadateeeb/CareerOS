import { ParsedResume, Recommendation, ATSResult, Role } from "../types/resume.types";

/**
 * Generates intelligent recommendations based on resume analysis.
 */
export function generateRecommendations(
  parsed: ParsedResume,
  atsScore: number,
  missingKeywords: string[],
  targetRole?: Role
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Contact Info
  if (!parsed.personalInfo.linkedin) {
    recommendations.push({
      id: "rec-linkedin",
      category: "missing_info",
      message: "Add your LinkedIn profile to increase your professional visibility.",
      priority: "high",
      actionable: true
    });
  }

  // ATS Score
  if (atsScore < 60) {
    recommendations.push({
      id: "rec-optimize",
      category: "optimization",
      message: "Your ATS score is low. Focus on adding relevant keywords and quantifying your achievements.",
      priority: "high",
      actionable: true
    });
  }

  // Quantified Achievements
  const totalMetrics = parsed.experience.reduce((sum, exp) => sum + exp.metricsFound, 0);
  if (totalMetrics < 3) {
    recommendations.push({
      id: "rec-metrics",
      category: "content",
      message: "Add more quantified achievements (e.g., 'increased revenue by 20%', 'reduced latency by 50ms').",
      priority: "high",
      actionable: true
    });
  }

  // Role Specific
  if (targetRole && targetRole.title === "Cybersecurity Analyst") {
    const cyberSkills = ["SIEM", "Splunk", "Wireshark"];
    const missingCyber = cyberSkills.filter(s => !parsed.skills.includes(s));
    if (missingCyber.length > 0) {
      recommendations.push({
        id: "rec-cyber",
        category: "content",
        message: `Missing key cybersecurity tools: ${missingCyber.join(", ")}. Consider adding these if you have experience with them.`,
        priority: "medium",
        actionable: true
      });
    }
  }

  // Missing Keywords
  if (missingKeywords.length > 0) {
    recommendations.push({
      id: "rec-keywords",
      category: "optimization",
      message: `Consider incorporating these missing keywords: ${missingKeywords.slice(0, 5).join(", ")}.`,
      priority: "medium",
      actionable: true
    });
  }

  return recommendations;
}
