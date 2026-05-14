/**
 * Resume Intelligence Engine Types
 */

export interface ParsedResume {
  personalInfo: PersonalInfo;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  projects: ProjectEntry[];
  rawText: string;
  sanitizedText: string;
}

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
  website?: string;
}

export interface ExperienceEntry {
  company?: string;
  role?: string;
  duration?: string;
  location?: string;
  achievements: string[];
  metricsFound: number;
  actionVerbsFound: number;
}

export interface EducationEntry {
  institution?: string;
  degree?: string;
  field?: string;
  location?: string;
  duration?: string;
}

export interface ProjectEntry {
  title?: string;
  description?: string;
  technologies: string[];
  link?: string;
}

export interface ATSResult {
  score: number;
  grade: "Excellent" | "Good" | "Fair" | "Poor";
  breakdown: {
    contactCompleteness: ScoreComponent;
    skillsRelevance: ScoreComponent;
    experienceQuality: ScoreComponent;
    projectsQuality: ScoreComponent;
    formatting: ScoreComponent;
    readability: ScoreComponent;
    certifications: ScoreComponent;
    keywordMatch: ScoreComponent;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: Recommendation[];
  roleMatchPercentage: number;
  interviewTopics: string[];
}

export interface ScoreComponent {
  score: number;
  max: number;
  label: string;
  detail: string;
}

export interface Recommendation {
  id: string;
  category: "content" | "formatting" | "optimization" | "missing_info";
  message: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
}

export interface Role {
  id: string;
  title: string;
  keywords: string[];
  preferredSkills: string[];
  atsRequirements: string[];
  interviewTopics: string[];
  missingSkillSuggestions: string[];
  strongSkillIndicators: string[];
}
