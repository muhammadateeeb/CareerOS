// CareerOS Onboarding Validation - Zod Schema
// Strict validation for all onboarding fields

import { z } from 'zod';
import { UserCareerProfile, WorkPreference, ExperienceLevel } from '@/types/onboarding';

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Experience level validation
const EXPERIENCE_LEVELS = [
  'Entry Level (0-2 years)',
  'Junior (2-4 years)',
  'Mid-Level (4-7 years)',
  'Senior (7-10 years)',
  'Lead/Principal (10+ years)',
  'Executive/Management'
] as const;

// Work preference validation
const WORK_PREFERENCES = ['remote', 'hybrid', 'onsite'] as const;

// Base validation schemas
const baseProfileSchema = z.object({
  targetRole: z
    .string()
    .min(2, 'Target role must be at least 2 characters')
    .max(100, 'Target role must be less than 100 characters')
    .trim()
    .refine((val) => val.length > 0, 'Target role is required'),

  industry: z
    .string()
    .min(2, 'Industry must be at least 2 characters')
    .max(50, 'Industry must be less than 50 characters')
    .trim()
    .refine((val) => val.length > 0, 'Industry is required'),

  experienceLevel: z
    .enum(EXPERIENCE_LEVELS, {
      errorMap: () => ({ message: 'Please select a valid experience level' })
    }),

  skills: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one skill is required')
    .max(20, 'Maximum 20 skills allowed')
    .refine((skills) => skills.every(skill => skill.trim().length > 0), {
      message: 'Skills cannot be empty'
    })
    .refine((skills) => new Set(skills).size === skills.length, {
      message: 'Duplicate skills are not allowed'
    }),

  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must be less than 50 characters')
    .trim()
    .refine((val) => val.length > 0, 'Country is required'),

  workPreference: z
    .enum(WORK_PREFERENCES, {
      errorMap: () => ({ message: 'Please select a valid work preference' })
    }),

  salaryExpectation: z
    .number()
    .min(0, 'Salary expectation cannot be negative')
    .max(10000000, 'Salary expectation seems too high')
    .optional()
    .nullable(),

  linkedinUrl: z
    .string()
    .url('Please enter a valid LinkedIn URL')
    .regex(URL_REGEX, 'Please enter a valid URL')
    .optional()
    .nullable(),

  githubUrl: z
    .string()
    .url('Please enter a valid GitHub URL')
    .regex(URL_REGEX, 'Please enter a valid URL')
    .optional()
    .nullable(),

  portfolioUrl: z
    .string()
    .url('Please enter a valid portfolio URL')
    .regex(URL_REGEX, 'Please enter a valid URL')
    .optional()
    .nullable(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Complete profile schema with all validations
export const userCareerProfileSchema = baseProfileSchema.refine(
  (data) => {
    // LinkedIn URL validation (if provided)
    if (data.linkedinUrl) {
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+/;
      if (!linkedinRegex.test(data.linkedinUrl)) {
        return false;
      }
    }

    // GitHub URL validation (if provided)
    if (data.githubUrl) {
      const githubRegex = /^https?:\/\/(www\.)?github\.com\/.+/;
      if (!githubRegex.test(data.githubUrl)) {
        return false;
      }
    }

    return true;
  },
  {
    message: 'Please check your profile URLs',
    path: ['linkedinUrl'] // This will show error on LinkedIn URL field
  }
);

// Step-specific validation schemas
export const basicInfoStepSchema = baseProfileSchema.pick({
  targetRole: true,
  industry: true,
  experienceLevel: true
});

export const skillsStepSchema = baseProfileSchema.pick({
  skills: true
});

export const preferencesStepSchema = baseProfileSchema.pick({
  country: true,
  workPreference: true,
  salaryExpectation: true
});

export const profilesStepSchema = baseProfileSchema.pick({
  linkedinUrl: true,
  githubUrl: true,
  portfolioUrl: true
});

// Validation functions
export const validateBasicInfo = (data: Partial<UserCareerProfile>) => {
  try {
    basicInfoStepSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

export const validateSkills = (data: Partial<UserCareerProfile>) => {
  try {
    skillsStepSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

export const validatePreferences = (data: Partial<UserCareerProfile>) => {
  try {
    preferencesStepSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

export const validateProfiles = (data: Partial<UserCareerProfile>) => {
  try {
    profilesStepSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

export const validateCompleteProfile = (data: Partial<UserCareerProfile>) => {
  try {
    userCareerProfileSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Type inference
export type UserCareerProfileInput = z.infer<typeof userCareerProfileSchema>;
export type BasicInfoInput = z.infer<typeof basicInfoStepSchema>;
export type SkillsInput = z.infer<typeof skillsStepSchema>;
export type PreferencesInput = z.infer<typeof preferencesStepSchema>;
export type ProfilesInput = z.infer<typeof profilesStepSchema>;

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
}

// Helper functions for common validations
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return URL_REGEX.test(url);
  } catch {
    return false;
  }
};

export const isValidLinkedInUrl = (url: string): boolean => {
  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+/;
  return linkedinRegex.test(url);
};

export const isValidGitHubUrl = (url: string): boolean => {
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/.+/;
  return githubRegex.test(url);
};

export const isValidSkill = (skill: string): boolean => {
  return skill.trim().length >= 1 && skill.trim().length <= 50;
};

export const isValidSalary = (salary: number): boolean => {
  return salary >= 0 && salary <= 10000000;
};
