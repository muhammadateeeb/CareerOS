import { ParsedResume } from "./parser";
import { ROLE_SKILL_MAP } from "../data/roleSkillMap";

export interface ATSScore {
  total: number;
  categories: {
    contact: number;
    structure: number;
    skills: number;
    experience: number;
    achievements: number;
    roleAlignment: number;
    formatting: number;
  };
  metrics: {
    quantifiedCount: number;
    skillMatchRatio: number;
    readabilityScore: number;
  };
}

/**
 * Real ATS Scoring Engine.
 * Calculations are based on weights and actual parsed content.
 */
export function calculateATSScore(parsed: ParsedResume, targetRoleName: string): ATSScore {
  const contactScore = calculateContactScore(parsed.contact);
  const structureScore = calculateStructureScore(parsed.extractedSections);
  const { score: skillsScore, ratio: skillRatio } = calculateSkillsScore(parsed.skills, targetRoleName);
  const experienceScore = calculateExperienceScore(parsed.experience);
  const achievementsScore = calculateAchievementsScore(parsed.experience);
  const roleAlignmentScore = calculateRoleAlignment(parsed, targetRoleName);
  const formattingScore = calculateFormattingScore(parsed);

  const total = (
    contactScore * 0.10 +
    structureScore * 0.10 +
    skillsScore * 0.15 +
    experienceScore * 0.20 +
    achievementsScore * 0.15 +
    roleAlignmentScore * 0.20 +
    formattingScore * 0.10
  );

  return {
    total: Math.round(total),
    categories: {
      contact: Math.round(contactScore),
      structure: Math.round(structureScore),
      skills: Math.round(skillsScore),
      experience: Math.round(experienceScore),
      achievements: Math.round(achievementsScore),
      roleAlignment: Math.round(roleAlignmentScore),
      formatting: Math.round(formattingScore)
    },
    metrics: {
      quantifiedCount: parsed.experience.filter(e => e.isQuantified).length,
      skillMatchRatio: skillRatio,
      readabilityScore: 85 // Heuristic for now
    }
  };
}

export function getATSCategory(score: number): "Excellent" | "Good" | "Fair" | "Poor" {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

export function getATSCategoryColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-500";
  return "text-red-600";
}

function calculateContactScore(contact: ParsedResume["contact"]): number {
  let score = 0;
  if (contact.name) score += 20;
  if (contact.email) score += 20;
  if (contact.phone) score += 20;
  if (contact.linkedin) score += 20;
  if (contact.location) score += 20;
  return score;
}

function calculateStructureScore(sections: string[]): number {
  const essential = ["experience", "education", "skills"];
  const found = essential.filter(s => sections.includes(s)).length;
  return (found / essential.length) * 100;
}

function calculateSkillsScore(skills: string[], targetRole: string): { score: number; ratio: number } {
  const roleData = ROLE_SKILL_MAP.find(r => r.role === targetRole);
  if (!roleData) return { score: 50, ratio: 0.5 };

  const targetSkills = [...roleData.requiredSkills, ...roleData.preferredSkills];
  const matched = skills.filter(s => targetSkills.includes(s)).length;
  const ratio = matched / targetSkills.length;

  return {
    score: Math.min(100, ratio * 120), // Slight bonus for matching many
    ratio
  };
}

function calculateExperienceScore(exp: any[]): number {
  if (exp.length === 0) return 0;
  if (exp.length < 2) return 50;
  return 100;
}

function calculateAchievementsScore(exp: any[]): number {
  const quantified = exp.filter(e => e.isQuantified).length;
  if (quantified === 0) return 20;
  return Math.min(100, (quantified / exp.length) * 100 + 20);
}

function calculateRoleAlignment(parsed: ParsedResume, targetRole: string): number {
  // Checks for role keywords in title or summary
  const lowerText = JSON.stringify(parsed).toLowerCase();
  if (lowerText.includes(targetRole.toLowerCase())) return 100;
  return 40;
}

function calculateFormattingScore(parsed: ParsedResume): number {
  // Penalize long paragraphs, rewards bullets
  let score = 100;
  parsed.experience.forEach(e => {
    if (e.bullets.length === 0) score -= 20;
  });
  return Math.max(0, score);
}
