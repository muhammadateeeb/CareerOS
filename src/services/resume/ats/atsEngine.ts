import { ParsedResume, ATSResult, Role } from "../types/resume.types";
import { analyzeKeywords } from "./keywordEngine";
import { analyzeFormatting } from "./formatEngine";
import { generateRecommendations } from "./recommendationEngine";

/**
 * Main ATS scoring engine.
 */
export function calculateATSScore(parsed: ParsedResume, targetRole?: Role): ATSResult {
  // Weights:
  // Contact completeness → 10
  // Skills relevance → 25
  // Experience quality → 20
  // Projects quality → 15
  // ATS formatting → 10
  // Certifications → 10
  // Keyword match → 10

  // 1. Contact Completeness (10)
  const contactFields = ["name", "email", "phone", "linkedin"];
  const presentFields = contactFields.filter(f => !!(parsed.personalInfo as any)[f]);
  const contactScore = (presentFields.length / contactFields.length) * 10;

  // 2. Skills Relevance (25)
  // Higher score if they have more skills from the target role
  let skillsScore = 0;
  if (targetRole) {
    const matchedSkills = parsed.skills.filter(s =>
      targetRole.preferredSkills.some(ps => ps.toLowerCase() === s.toLowerCase())
    );
    skillsScore = (matchedSkills.length / Math.max(targetRole.preferredSkills.length, 1)) * 25;
  } else {
    skillsScore = Math.min((parsed.skills.length / 10) * 25, 25);
  }

  // 3. Experience Quality (20)
  // Based on number of achievements, metrics, and action verbs
  const totalAch = parsed.experience.reduce((sum, exp) => sum + exp.achievements.length, 0);
  const totalMetrics = parsed.experience.reduce((sum, exp) => sum + exp.metricsFound, 0);
  const totalVerbs = parsed.experience.reduce((sum, exp) => sum + exp.actionVerbsFound, 0);

  let expScore = 0;
  if (parsed.experience.length > 0) {
    expScore += Math.min((totalAch / 5) * 10, 10);
    expScore += Math.min((totalMetrics / 3) * 5, 5);
    expScore += Math.min((totalVerbs / 3) * 5, 5);
  }

  // 4. Projects Quality (15)
  const projectScore = Math.min((parsed.projects.length / 2) * 15, 15);

  // 5. ATS Formatting (10)
  const formatAnalysis = analyzeFormatting(parsed);
  const formatScore = (formatAnalysis.score / 100) * 10;

  // 6. Certifications (10)
  const certScore = Math.min((parsed.certifications.length / 2) * 10, 10);

  // 7. Keyword Match (10)
  const keywordAnalysis = analyzeKeywords(parsed.sanitizedText, targetRole?.keywords || []);
  const keywordScore = (keywordAnalysis.percentage / 100) * 10;

  const totalScore = Math.round(
    contactScore + skillsScore + expScore + projectScore + formatScore + certScore + keywordScore
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
      skillsRelevance: { score: Math.round(skillsScore), max: 25, label: "Skills", detail: "Matching against role skills" },
      experienceQuality: { score: Math.round(expScore), max: 20, label: "Experience", detail: "Based on achievements and metrics" },
      projectsQuality: { score: Math.round(projectScore), max: 15, label: "Projects", detail: `${parsed.projects.length} projects found` },
      formatting: { score: Math.round(formatScore), max: 10, label: "Formatting", detail: formatAnalysis.issues[0] || "No major formatting issues" },
      certifications: { score: Math.round(certScore), max: 10, label: "Certifications", detail: `${parsed.certifications.length} certifications found` },
      keywordMatch: { score: Math.round(keywordScore), max: 10, label: "Keywords", detail: `${keywordAnalysis.matched.length} keywords matched` },
    },
    matchedKeywords: keywordAnalysis.matched,
    missingKeywords: keywordAnalysis.missing,
    recommendations: generateRecommendations(parsed, finalScore, keywordAnalysis.missing, targetRole),
    roleMatchPercentage: Math.round((skillsScore / 25) * 100),
    interviewTopics: targetRole?.interviewTopics || []
  };
}
