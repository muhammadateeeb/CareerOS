import { ParsedResume, ATSResult, Role } from "../types/resume.types";
import { analyzeKeywords } from "./keywordEngine";
import { analyzeFormatting } from "./formatEngine";
import { generateRecommendations } from "./recommendationEngine";
import { calculateReadabilityScore } from "../utils/textMetrics";

/**
 * Main ATS scoring engine.
 */
export function calculateATSScore(parsed: ParsedResume, targetRole?: Role): ATSResult {
  /**
   * Weights:
   * Contact Completeness → 10
   * Role Keyword Match → 20
   * Skills Match → 20
   * Experience Quality → 15
   * Projects Quality → 10
   * Formatting Quality → 10
   * Achievements & Metrics → 5
   * Certifications → 5
   * Readability → 5
   */

  // 1. Contact (10)
  const contactFields = ["name", "email", "phone", "linkedin", "github"];
  const presentFields = contactFields.filter(f => !!(parsed.personalInfo as any)[f]);
  const contactScore = (presentFields.length / contactFields.length) * 10;

  // 2. Keyword Match (20)
  const keywordAnalysis = analyzeKeywords(parsed.sanitizedText, targetRole?.keywords || []);
  const keywordScore = (keywordAnalysis.percentage / 100) * 20;

  // 3. Skills Match (20)
  let skillsMatchScore = 0;
  if (targetRole) {
    const matchedSkills = parsed.skills.filter(s =>
      targetRole.preferredSkills.some(ps => ps.toLowerCase() === s.toLowerCase())
    );
    skillsMatchScore = (matchedSkills.length / Math.max(targetRole.preferredSkills.length, 1)) * 20;
  } else {
    skillsMatchScore = Math.min((parsed.skills.length / 10) * 20, 20);
  }

  // 4. Experience Quality (15)
  const expScore = Math.min((parsed.experience.length / 3) * 15, 15);

  // 5. Projects Quality (10)
  const projectScore = Math.min((parsed.projects.length / 2) * 10, 10);

  // 6. Formatting (10)
  const formatAnalysis = analyzeFormatting(parsed);
  const formatScore = (formatAnalysis.score / 100) * 10;

  // 7. Achievements & Metrics (5)
  const totalMetrics = parsed.experience.reduce((sum, exp) => sum + exp.metricsFound, 0);
  const metricsScore = Math.min((totalMetrics / 5) * 5, 5);

  // 8. Certifications (5)
  const certScore = Math.min((parsed.certifications.length / 2) * 5, 5);

  // 9. Readability (5)
  const readabilityValue = calculateReadabilityScore(parsed.sanitizedText);
  // Target Flesch score around 60 (Standard/Professional)
  const readabilityScore = Math.max(0, Math.min(5, (readabilityValue / 60) * 5));

  const totalScore = Math.round(
    contactScore + keywordScore + skillsMatchScore + expScore + projectScore + formatScore + metricsScore + certScore + readabilityScore
  );

  const finalScore = Math.min(totalScore, 100);

  const grade =
    finalScore >= 80 ? "Excellent" :
    finalScore >= 60 ? "Good" :
    finalScore >= 40 ? "Fair" : "Poor";

  return {
    score: finalScore,
    grade,
    breakdown: {
      contactCompleteness: { score: Math.round(contactScore), max: 10, label: "Contact Info", detail: `${presentFields.length}/${contactFields.length} fields found` },
      skillsRelevance: { score: Math.round(skillsMatchScore), max: 20, label: "Skills", detail: "Matching against role skills" },
      experienceQuality: { score: Math.round(expScore), max: 15, label: "Experience", detail: `${parsed.experience.length} roles detected` },
      projectsQuality: { score: Math.round(projectScore), max: 10, label: "Projects", detail: `${parsed.projects.length} projects found` },
      formatting: { score: Math.round(formatScore), max: 10, label: "Formatting", detail: formatAnalysis.issues[0] || "No major formatting issues" },
      readability: { score: Math.round(readabilityScore), max: 5, label: "Readability", detail: `Flesch Score: ${Math.round(readabilityValue)}` },
      certifications: { score: Math.round(certScore), max: 5, label: "Certifications", detail: `${parsed.certifications.length} certifications found` },
      keywordMatch: { score: Math.round(keywordScore), max: 20, label: "Keywords", detail: `${keywordAnalysis.matched.length} keywords matched` },
    },
    matchedKeywords: keywordAnalysis.matched,
    missingKeywords: keywordAnalysis.missing,
    recommendations: generateRecommendations(parsed, finalScore, keywordAnalysis.missing, targetRole),
    roleMatchPercentage: Math.round(((keywordScore + skillsMatchScore) / 40) * 100),
    interviewTopics: targetRole?.interviewTopics || []
  };
}
