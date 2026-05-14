// Onboarding Service Layer
// Prepared for future Supabase integration

export interface OnboardingProfile {
  id?: string;
  userId: string;
  careerGoal: {
    jobTitle: string;
    industry: string;
  };
  experience: {
    yearsExperience: string;
    skills: string[];
  };
  preferences: {
    country: string;
    workType: string;
    salaryTarget: string;
  };
  assets: {
    linkedinUrl: string;
    resumeFile?: string; // Will be file URL when integrated with storage
  };
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Local storage service (temporary implementation)
export const onboardingService = {
  // Save onboarding data to local storage
  saveOnboarding: (userId: string, data: Omit<OnboardingProfile, 'id' | 'userId' | 'completed' | 'createdAt' | 'updatedAt'>) => {
    const profile: OnboardingProfile = {
      userId,
      ...data,
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(`onboarding_profile_${userId}`, JSON.stringify(profile));
    return profile;
  },

  // Get onboarding data from local storage
  getOnboarding: (userId: string): OnboardingProfile | null => {
    const data = localStorage.getItem(`onboarding_profile_${userId}`);
    return data ? JSON.parse(data) : null;
  },

  // Check if onboarding is completed
  isOnboardingCompleted: (userId: string): boolean => {
    return localStorage.getItem(`onboarding_complete_${userId}`) === "true";
  },

  // Mark onboarding as completed
  markOnboardingCompleted: (userId: string) => {
    localStorage.setItem(`onboarding_complete_${userId}`, "true");
  },

  // Clear onboarding data (for testing/reset)
  clearOnboarding: (userId: string) => {
    localStorage.removeItem(`onboarding_complete_${userId}`);
    localStorage.removeItem(`onboarding_profile_${userId}`);
    localStorage.removeItem(`onboarding_data_${userId}`);
  },
};

// Future Supabase service (prepared for integration)
export const supabaseOnboardingService = {
  // This will be implemented when Supabase is integrated
  saveOnboarding: async (userId: string, data: Omit<OnboardingProfile, 'id' | 'userId' | 'completed' | 'createdAt' | 'updatedAt'>) => {
    // TODO: Implement Supabase integration
    // const { data, error } = await supabase
    //   .from('onboarding_profiles')
    //   .upsert({
    //     userId,
    //     ...data,
    //     completed: true,
    //     createdAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString(),
    //   })
    //   .select()
    //   .single();
    
    // return data;
    return onboardingService.saveOnboarding(userId, data);
  },

  getOnboarding: async (userId: string) => {
    // TODO: Implement Supabase integration
    // const { data, error } = await supabase
    //   .from('onboarding_profiles')
    //   .select('*')
    //   .eq('userId', userId)
    //   .single();
    
    // return data;
    return onboardingService.getOnboarding(userId);
  },

  isOnboardingCompleted: async (userId: string) => {
    // TODO: Implement Supabase integration
    // const { data, error } = await supabase
    //   .from('onboarding_profiles')
    //   .select('completed')
    //   .eq('userId', userId)
    //   .single();
    
    // return data?.completed || false;
    return onboardingService.isOnboardingCompleted(userId);
  },
};

// Validation utilities
export const onboardingValidation = {
  validateCareerGoal: (data: { jobTitle: string; industry: string }) => {
    const errors: Record<string, string> = {};
    
    if (!data.jobTitle.trim()) {
      errors.jobTitle = "Job title is required";
    }
    
    if (!data.industry.trim()) {
      errors.industry = "Industry is required";
    }
    
    return errors;
  },

  validateExperience: (data: { yearsExperience: string; skills: string[] }) => {
    const errors: Record<string, string> = {};
    
    if (!data.yearsExperience) {
      errors.yearsExperience = "Years of experience is required";
    }
    
    if (data.skills.length === 0) {
      errors.skills = "At least one skill is required";
    }
    
    return errors;
  },

  validatePreferences: (data: { country: string; workType: string; salaryTarget: string }) => {
    const errors: Record<string, string> = {};
    
    if (!data.country.trim()) {
      errors.country = "Country is required";
    }
    
    if (!data.workType) {
      errors.workType = "Work type is required";
    }
    
    if (!data.salaryTarget.trim()) {
      errors.salaryTarget = "Salary target is required";
    }
    
    return errors;
  },

  validateAssets: (data: { linkedinUrl: string }) => {
    const errors: Record<string, string> = {};
    
    if (!data.linkedinUrl.trim()) {
      errors.linkedinUrl = "LinkedIn URL is required";
    }
    
    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/;
    if (data.linkedinUrl && !urlPattern.test(data.linkedinUrl)) {
      errors.linkedinUrl = "Please enter a valid URL";
    }
    
    return errors;
  },
};
