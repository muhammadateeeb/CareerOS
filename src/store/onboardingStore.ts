// CareerOS Onboarding Store - Single Source of Truth
// Zustand store with localStorage persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserCareerProfile, OnboardingStore, OnboardingStep, ExperienceLevel } from '@/types/onboarding';

// Initial state
const initialProfile: Partial<UserCareerProfile> = {
  targetRole: '',
  industry: '',
  experienceLevel: '',
  skills: [],
  country: '',
  workPreference: 'remote',
  salaryExpectation: undefined,
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  createdAt: '',
  updatedAt: ''
};

const initialSteps: OnboardingStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about your career goals',
    completed: false,
    isValid: false
  },
  {
    id: 'skills',
    title: 'Skills & Expertise',
    description: 'What are your key skills?',
    completed: false,
    isValid: false
  },
  {
    id: 'preferences',
    title: 'Work Preferences',
    description: 'How and where do you want to work?',
    completed: false,
    isValid: false
  },
  {
    id: 'profiles',
    title: 'Professional Profiles',
    description: 'Link your professional profiles',
    completed: false,
    isValid: true
  },
  {
    id: 'review',
    title: 'Review & Complete',
    description: 'Review your information',
    completed: false,
    isValid: true
  }
];

import { validateBasicInfo, validateSkills, validatePreferences, validateProfiles, validateCompleteProfile } from '@/lib/onboardingValidation';

// Step validators using Zod validation
const stepValidators: Record<string, (profile: Partial<UserCareerProfile>) => boolean> = {
  'basic-info': (profile) => validateBasicInfo(profile).success,
  'skills': (profile) => validateSkills(profile).success,
  'preferences': (profile) => validatePreferences(profile).success,
  'profiles': (profile) => validateProfiles(profile).success,
  'review': (profile) => validateCompleteProfile(profile).success
};

// Create the store
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // State
      profile: initialProfile,
      currentStep: 0,
      steps: initialSteps,
      isValid: false,
      errors: {},
      isSubmitting: false,
      isCompleted: false,

      // Profile Management
      updateProfile: (updates) => {
        const currentProfile = get().profile;
        const updatedProfile = {
          ...currentProfile,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        // Set createdAt if this is the first update
        if (!currentProfile.createdAt) {
          updatedProfile.createdAt = new Date().toISOString();
        }

        set((state) => ({
          profile: updatedProfile,
          errors: { ...state.errors, ...Object.keys(updates).reduce((acc, key) => {
            acc[key] = '';
            return acc;
          }, {} as Record<string, string>) }
        }));

        // Validate current step
        const currentStepId = get().steps[get().currentStep].id;
        get().validateStep(currentStepId);
      },

      setProfile: (profile) => {
        set({
          profile: {
            ...profile,
            updatedAt: new Date().toISOString()
          },
          errors: {}
        });
        
        // Validate all steps
        get().steps.forEach(step => {
          get().validateStep(step.id);
        });
      },

      // Skills Management
      addSkill: (skill) => {
        const currentSkills = get().profile.skills || [];
        const trimmedSkill = skill.trim();
        
        if (trimmedSkill && !currentSkills.includes(trimmedSkill)) {
          get().updateProfile({
            skills: [...currentSkills, trimmedSkill]
          });
        }
      },

      removeSkill: (skill) => {
        const currentSkills = get().profile.skills || [];
        get().updateProfile({
          skills: currentSkills.filter(s => s !== skill)
        });
      },

      updateSkills: (skills) => {
        get().updateProfile({
          skills: [...new Set(skills)] // Remove duplicates
        });
      },

      // Step Management
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      completeStep: (stepId) => {
        set((state) => ({
          steps: state.steps.map(step =>
            step.id === stepId ? { ...step, completed: true } : step
          )
        }));
      },

      validateStep: (stepId) => {
        const profile = get().profile;
        const validator = stepValidators[stepId];
        const isValid = validator ? validator(profile) : false;

        set((state) => ({
          steps: state.steps.map(step =>
            step.id === stepId ? { ...step, isValid } : step
          )
        }));

        // Update overall validity
        const allRequiredStepsValid = get().steps
          .filter(step => step.id !== 'profiles') // profiles is optional
          .every(step => step.isValid);

        set({ isValid: allRequiredStepsValid });
      },

      // Validation
      validateProfile: () => {
        const profile = get().profile;
        const validation = validateCompleteProfile(profile);
        
        set({ errors: validation.errors });
        return validation.success;
      },

      setErrors: (errors) => {
        set({ errors });
      },

      clearErrors: () => {
        set({ errors: {} });
      },

      // Submission
      submitOnboarding: async () => {
        const isValid = get().validateProfile();
        
        if (!isValid) {
          throw new Error('Please fix validation errors before submitting');
        }

        set({ isSubmitting: true });

        try {
          // Here you would typically save to your backend
          // For now, we'll just mark as completed
          set({ 
            isCompleted: true,
            isSubmitting: false 
          });

          // Save to localStorage
          get().saveToStorage();
        } catch (error) {
          set({ isSubmitting: false });
          throw error;
        }
      },

      resetOnboarding: () => {
        set({
          profile: initialProfile,
          currentStep: 0,
          steps: initialSteps,
          isValid: false,
          errors: {},
          isSubmitting: false,
          isCompleted: false
        });
      },

      // Persistence
      saveToStorage: () => {
        // This is handled automatically by persist middleware
        // But we can add additional logic here if needed
        const state = get();
        console.log('Onboarding state saved to storage', {
          isCompleted: state.isCompleted,
          profileKeys: Object.keys(state.profile),
          currentStep: state.currentStep
        });
      },

      loadFromStorage: () => {
        // This is handled automatically by persist middleware
        // But we can add additional logic here if needed
        const state = get();
        console.log('Onboarding state loaded from storage', {
          isCompleted: state.isCompleted,
          hasProfile: !!state.profile.targetRole
        });
      }
    }),
    {
      name: 'careeros-onboarding-store',
      partialize: (state) => ({
        profile: state.profile,
        steps: state.steps,
        currentStep: state.currentStep,
        isCompleted: state.isCompleted
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Onboarding store rehydrated');
        if (state) {
          // Re-validate steps on rehydration
          state.steps.forEach(step => {
            const validator = stepValidators[step.id];
            if (validator) {
              step.isValid = validator(state.profile);
            }
          });
        }
        return state;
      }
    }
  )
);

// Helper functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Selectors for common use cases
export const useOnboardingProfile = () => useOnboardingStore((state) => state.profile);
export const useOnboardingIsCompleted = () => useOnboardingStore((state) => state.isCompleted);
export const useOnboardingCurrentStep = () => useOnboardingStore((state) => state.currentStep);
export const useOnboardingErrors = () => useOnboardingStore((state) => state.errors);
export const useOnboardingIsValid = () => useOnboardingStore((state) => state.isValid);

// Action creators for easier usage
export const onboardingActions = {
  updateProfile: (updates: Partial<UserCareerProfile>) => 
    useOnboardingStore.getState().updateProfile(updates),
  
  addSkill: (skill: string) => 
    useOnboardingStore.getState().addSkill(skill),
  
  removeSkill: (skill: string) => 
    useOnboardingStore.getState().removeSkill(skill),
  
  setCurrentStep: (step: number) => 
    useOnboardingStore.getState().setCurrentStep(step),
  
  submitOnboarding: () => 
    useOnboardingStore.getState().submitOnboarding(),
  
  resetOnboarding: () => 
    useOnboardingStore.getState().resetOnboarding()
};
