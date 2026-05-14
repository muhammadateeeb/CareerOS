// CareerOS Onboarding System - Strict Type Definitions
// Single Source of Truth for User Career Profile

export interface UserCareerProfile {
  // Core Career Information
  targetRole: string;
  industry: string;
  experienceLevel: string;
  
  // Skills & Expertise
  skills: string[];
  
  // Location & Work Preferences
  country: string;
  workPreference: 'remote' | 'hybrid' | 'onsite';
  
  // Salary Expectations
  salaryExpectation?: number;
  
  // Professional Profiles
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  isValid: boolean;
}

export interface OnboardingState {
  // User Profile Data
  profile: Partial<UserCareerProfile>;
  
  // Step Management
  currentStep: number;
  steps: OnboardingStep[];
  
  // Validation State
  isValid: boolean;
  errors: Record<string, string>;
  
  // UI State
  isSubmitting: boolean;
  isCompleted: boolean;
}

export interface OnboardingActions {
  // Profile Management
  updateProfile: (updates: Partial<UserCareerProfile>) => void;
  setProfile: (profile: UserCareerProfile) => void;
  
  // Skills Management
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  updateSkills: (skills: string[]) => void;
  
  // Step Management
  setCurrentStep: (step: number) => void;
  completeStep: (stepId: string) => void;
  validateStep: (stepId: string) => void;
  
  // Validation
  validateProfile: () => boolean;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  
  // Submission
  submitOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  
  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

// Validation Rules
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Experience Levels
export type ExperienceLevel = 
  | 'Entry Level (0-2 years)'
  | 'Junior (2-4 years)'
  | 'Mid-Level (4-7 years)'
  | 'Senior (7-10 years)'
  | 'Lead/Principal (10+ years)'
  | 'Executive/Management';

// Work Preferences
export type WorkPreference = 'remote' | 'hybrid' | 'onsite';

// Country Data
export interface Country {
  code: string;
  name: string;
  flag: string;
}

// Role Suggestion
export interface RoleSuggestion {
  role: string;
  category: string;
  keywords: string[];
  matchScore: number;
}

// Skill Suggestion
export interface SkillSuggestion {
  skill: string;
  category: string;
  relevance: number;
  commonlyUsed: boolean;
}

// Onboarding Completion Data
export interface OnboardingCompletion {
  profile: UserCareerProfile;
  completedAt: string;
  sessionDuration: number;
  skippedSteps: string[];
}

// Analytics Events
export interface OnboardingAnalytics {
  stepStarted: string;
  stepCompleted: string;
  fieldUpdated: string;
  validationError: string;
  timeSpent: number;
  dropoffPoint?: string;
}
