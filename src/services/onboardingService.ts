import { Onboarding } from '@/store/dashboardStore';
import { ProfileService } from './profileService';
import { analytics } from '@/lib/analytics';

// ==================== TYPES ====================

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  fields: OnboardingField[];
  validation?: (data: any) => ValidationResult;
}

export interface OnboardingField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'multiselect' | 'number' | 'url' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  completionPercentage: number;
}

// ==================== ONBOARDING CONFIGURATION ====================

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'target-role',
    title: 'Target Role',
    description: 'Tell us about your career goals',
    fields: [
      {
        name: 'targetRole',
        label: 'What is your target role?',
        type: 'select',
        required: true,
        options: [
          'Software Engineer',
          'Frontend Developer',
          'Backend Developer',
          'Full Stack Developer',
          'Product Manager',
          'Data Scientist',
          'UX/UI Designer',
          'Marketing Manager',
          'Sales Representative',
          'Project Manager',
          'Business Analyst',
          'DevOps Engineer',
        ],
        placeholder: 'Select your target role',
      },
      {
        name: 'industry',
        label: 'What industry are you targeting?',
        type: 'select',
        required: true,
        options: [
          'Technology',
          'Healthcare',
          'Finance',
          'Education',
          'Retail',
          'Manufacturing',
          'Consulting',
          'Media',
          'Government',
          'Non-profit',
          'Real Estate',
          'Transportation',
        ],
        placeholder: 'Select your target industry',
      },
      {
        name: 'experienceLevel',
        label: 'What is your experience level?',
        type: 'select',
        required: true,
        options: ['entry', 'mid', 'senior', 'executive'],
        placeholder: 'Select your experience level',
      },
    ],
  },
  {
    id: 'skills',
    title: 'Skills & Expertise',
    description: 'Help us understand your technical and soft skills',
    fields: [
      {
        name: 'skills',
        label: 'What are your key skills? (Select up to 10)',
        type: 'multiselect',
        required: true,
        options: [
          'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
          'Node.js', 'Python', 'Java', 'C++', 'C#',
          'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL',
          'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
          'Git', 'Agile', 'Scrum', 'JIRA', 'Confluence',
          'Leadership', 'Communication', 'Problem Solving', 'Team Management',
          'Project Management', 'Data Analysis', 'Machine Learning', 'UI/UX Design',
        ],
        validation: {
          custom: (value: string[]) => {
            if (value.length > 10) return 'Please select a maximum of 10 skills';
            if (value.length < 3) return 'Please select at least 3 skills';
            return null;
          },
        },
      },
    ],
  },
  {
    id: 'location',
    title: 'Location & Work Preferences',
    description: 'Let us know where and how you want to work',
    fields: [
      {
        name: 'country',
        label: 'Which country are you in?',
        type: 'select',
        required: true,
        options: [
          'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
          'France', 'Netherlands', 'Sweden', 'Denmark', 'Norway',
          'India', 'Singapore', 'Japan', 'South Korea', 'China',
          'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia',
        ],
        placeholder: 'Select your country',
      },
      {
        name: 'workType',
        label: 'What is your preferred work arrangement?',
        type: 'select',
        required: true,
        options: ['remote', 'hybrid', 'onsite'],
        placeholder: 'Select work type',
      },
    ],
  },
  {
    id: 'salary',
    title: 'Salary Expectations',
    description: 'Help us find opportunities that match your expectations',
    fields: [
      {
        name: 'salaryTarget',
        label: 'What is your expected salary range?',
        type: 'number',
        required: true,
        validation: {
          min: 20000,
          max: 500000,
          custom: (value: number) => {
            if (value < 20000) return 'Minimum salary should be at least $20,000';
            if (value > 500000) return 'Maximum salary should not exceed $500,000';
            return null;
          },
        },
        placeholder: 'Enter your expected annual salary',
      },
    ],
  },
  {
    id: 'linkedin',
    title: 'Professional Profile',
    description: 'Connect your professional profiles for better matching',
    fields: [
      {
        name: 'linkedinUrl',
        label: 'LinkedIn Profile URL (Optional)',
        type: 'url',
        required: false,
        placeholder: 'https://linkedin.com/in/yourprofile',
        validation: {
          pattern: '^https?://(www\\.)?linkedin\\.com/.+',
          custom: (value: string) => {
            if (value && !value.match(/^https?:\/\/(www\.)?linkedin\.com\/.+/)) {
              return 'Please enter a valid LinkedIn URL';
            }
            return null;
          },
        },
      },
    ],
  },
];

// ==================== ONBOARDING SERVICE ====================

export class OnboardingService {
  // ==================== STEP MANAGEMENT ====================

  static getStepById(stepId: string): OnboardingStep | undefined {
    return ONBOARDING_STEPS.find(step => step.id === stepId);
  }

  static getAllSteps(): OnboardingStep[] {
    return ONBOARDING_STEPS;
  }

  static getTotalSteps(): number {
    return ONBOARDING_STEPS.length;
  }

  // ==================== PROGRESS TRACKING ====================

  static calculateProgress(onboardingData: Partial<Onboarding>): OnboardingProgress {
    const totalSteps = this.getTotalSteps();
    const completedSteps: string[] = [];

    // Check which steps are completed
    if (onboardingData.targetRole && onboardingData.industry && onboardingData.experienceLevel) {
      completedSteps.push('target-role');
    }

    if (onboardingData.skills && onboardingData.skills.length >= 3) {
      completedSteps.push('skills');
    }

    if (onboardingData.country && onboardingData.workType) {
      completedSteps.push('location');
    }

    if (onboardingData.salaryTarget) {
      completedSteps.push('salary');
    }

    // LinkedIn is optional, so we don't require it for progress
    completedSteps.push('linkedin');

    const completionPercentage = Math.round((completedSteps.length / totalSteps) * 100);
    const currentStep = Math.min(completedSteps.length, totalSteps - 1);

    return {
      currentStep,
      totalSteps,
      completedSteps,
      completionPercentage,
    };
  }

  static isStepCompleted(stepId: string, onboardingData: Partial<Onboarding>): boolean {
    switch (stepId) {
      case 'target-role':
        return !!(onboardingData.targetRole && onboardingData.industry && onboardingData.experienceLevel);
      case 'skills':
        return !!(onboardingData.skills && onboardingData.skills.length >= 3);
      case 'location':
        return !!(onboardingData.country && onboardingData.workType);
      case 'salary':
        return !!onboardingData.salaryTarget;
      case 'linkedin':
        return true; // Always considered completed since it's optional
      default:
        return false;
    }
  }

  // ==================== VALIDATION ====================

  static validateStep(stepId: string, data: any): ValidationResult {
    const step = this.getStepById(stepId);
    if (!step) {
      return { valid: false, errors: { general: 'Invalid step ID' } };
    }

    const errors: Record<string, string> = {};

    // Validate each field
    for (const field of step.fields) {
      const value = data[field.name];

      // Required field validation
      if (field.required && (value === undefined || value === null || value === '')) {
        errors[field.name] = `${field.label} is required`;
        continue;
      }

      // Skip further validation if field is not required and empty
      if (!field.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type-specific validation
      switch (field.type) {
        case 'email':
          if (!this.isValidEmail(value)) {
            errors[field.name] = 'Please enter a valid email address';
          }
          break;

        case 'url':
          if (value && !this.isValidUrl(value)) {
            errors[field.name] = 'Please enter a valid URL';
          }
          break;

        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors[field.name] = 'Please enter a valid number';
          } else {
            if (field.validation?.min && numValue < field.validation.min) {
              errors[field.name] = `Value must be at least ${field.validation.min}`;
            }
            if (field.validation?.max && numValue > field.validation.max) {
              errors[field.name] = `Value must not exceed ${field.validation.max}`;
            }
          }
          break;

        case 'select':
          if (field.options && !field.options.includes(value)) {
            errors[field.name] = 'Please select a valid option';
          }
          break;

        case 'multiselect':
          if (Array.isArray(value)) {
            if (field.options && !value.every(v => field.options!.includes(v))) {
              errors[field.name] = 'Please select valid options';
            }
          } else {
            errors[field.name] = 'This field requires an array of values';
          }
          break;
      }

      // Custom validation
      if (field.validation?.custom && !errors[field.name]) {
        const customError = field.validation.custom(value);
        if (customError) {
          errors[field.name] = customError;
        }
      }

      // Pattern validation
      if (field.validation?.pattern && !errors[field.name]) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors[field.name] = 'Please enter a valid format';
        }
      }
    }

    // Step-level validation
    if (step.validation && Object.keys(errors).length === 0) {
      const stepValidation = step.validation(data);
      if (!stepValidation.valid) {
        Object.assign(errors, stepValidation.errors);
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // ==================== DATA MANAGEMENT ====================

  static async saveOnboardingData(
    userId: string, 
    stepId: string, 
    data: Partial<Onboarding>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate the step data
      const validation = this.validateStep(stepId, data);
      if (!validation.valid) {
        return {
          success: false,
          error: Object.values(validation.errors).join(', '),
        };
      }

      // Get existing onboarding data
      const existingData = await ProfileService.getOnboarding(userId);

      // Merge with new data
      const updatedData: Partial<Onboarding> = {
        ...existingData,
        ...data,
      };

      // Save to profile service
      const success = await ProfileService.saveOnboarding(userId, updatedData as Onboarding);
      
      if (success) {
        // Track analytics
        analytics.track('onboarding_step_completed', {
          stepId,
          stepTitle: this.getStepById(stepId)?.title,
          completionPercentage: this.calculateProgress(updatedData).completionPercentage,
        });

        return { success: true };
      } else {
        return { success: false, error: 'Failed to save onboarding data' };
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  static async completeOnboarding(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const success = await ProfileService.completeOnboarding(userId);
      
      if (success) {
        // Track analytics
        analytics.track('onboarding_completed', {
          userId,
          completedAt: new Date().toISOString(),
        });

        return { success: true };
      } else {
        return { success: false, error: 'Failed to complete onboarding' };
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  static async getOnboardingData(userId: string): Promise<Partial<Onboarding> | null> {
    try {
      return await ProfileService.getOnboarding(userId);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      return null;
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ==================== RECOMMENDATIONS ====================

  static generateRecommendations(onboardingData: Partial<Onboarding>): string[] {
    const recommendations: string[] = [];

    // Skills recommendations
    if (!onboardingData.skills || onboardingData.skills.length < 5) {
      recommendations.push('Add more skills to improve your job matching accuracy');
    }

    // LinkedIn recommendation
    if (!onboardingData.linkedinUrl) {
      recommendations.push('Add your LinkedIn profile to increase your visibility to recruiters');
    }

    // Salary recommendations
    if (onboardingData.salaryTarget && onboardingData.experienceLevel) {
      const recommendedSalary = this.getRecommendedSalary(onboardingData.experienceLevel);
      if (onboardingData.salaryTarget.min < recommendedSalary * 0.8) {
        recommendations.push('Consider increasing your salary expectations based on your experience level');
      } else if (onboardingData.salaryTarget.min > recommendedSalary * 1.5) {
        recommendations.push('Your salary expectations might be too high for your experience level');
      }
    }

    return recommendations;
  }

  private static getRecommendedSalary(experienceLevel: Onboarding['experienceLevel']): number {
    switch (experienceLevel) {
      case 'entry': return 50000;
      case 'mid': return 80000;
      case 'senior': return 120000;
      case 'executive': return 180000;
      default: return 70000;
    }
  }

  // ==================== ONBOARDING RESET ====================

  static async resetOnboarding(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const success = await ProfileService.saveOnboarding(userId, {} as Onboarding);
      
      if (success) {
        analytics.track('onboarding_reset', { userId });
        return { success: true };
      } else {
        return { success: false, error: 'Failed to reset onboarding' };
      }
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // ==================== DATA EXPORT ====================

  static exportOnboardingData(onboardingData: Partial<Onboarding>): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      onboarding: onboardingData,
      progress: this.calculateProgress(onboardingData),
    };

    return JSON.stringify(exportData, null, 2);
  }
}
