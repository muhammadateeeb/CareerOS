import { User, Onboarding, Resume, Application, Job } from '@/store/dashboardStore';

// ==================== TYPES ====================

export interface ProfileData {
  user: User;
  onboarding: Onboarding | null;
  resume: Resume;
  applications: Application[];
  jobs: Job[];
}

export interface ProfileUpdateData {
  user?: Partial<User>;
  onboarding?: Partial<Onboarding>;
  resume?: Partial<Resume>;
}

export interface ProfileStats {
  totalApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  averageMatchScore: number;
  profileCompletion: number;
  lastActiveDate: string;
}

// ==================== PROFILE SERVICE ====================

export class ProfileService {
  // In a real application, this would integrate with Supabase
  // For now, we'll use localStorage as a fallback
  
  private static readonly STORAGE_KEY_PREFIXES = {
    PROFILE: 'careeros_profile',
    ONBOARDING: 'careeros_onboarding',
    RESUME: 'careeros_resume',
    APPLICATIONS: 'careeros_applications',
    JOBS: 'careeros_jobs',
  };

  // Returns user-scoped storage keys so data from one user never bleeds into another
  private static keys(userId: string) {
    return {
      PROFILE: `${this.STORAGE_KEY_PREFIXES.PROFILE}_${userId}`,
      ONBOARDING: `${this.STORAGE_KEY_PREFIXES.ONBOARDING}_${userId}`,
      RESUME: `${this.STORAGE_KEY_PREFIXES.RESUME}_${userId}`,
      APPLICATIONS: `${this.STORAGE_KEY_PREFIXES.APPLICATIONS}_${userId}`,
      JOBS: `${this.STORAGE_KEY_PREFIXES.JOBS}_${userId}`,
    };
  }

  // Keep the old unscoped keys for backward-compat reads (legacy data migration)
  private static readonly STORAGE_KEYS = {
    PROFILE: 'careeros_profile',
    ONBOARDING: 'careeros_onboarding',
    RESUME: 'careeros_resume',
    APPLICATIONS: 'careeros_applications',
    JOBS: 'careeros_jobs',
  };

  // ==================== USER PROFILE ====================

  static async getUserProfile(userId: string): Promise<ProfileData | null> {
    try {
      // In production, this would be a Supabase query
      // For now, we'll retrieve from localStorage (user-scoped keys)
      const k = this.keys(userId);
      const profile = this.getFromStorage(k.PROFILE);
      const onboarding = this.getFromStorage(k.ONBOARDING);
      const resume = this.getFromStorage(k.RESUME);
      const applications = this.getFromStorage(k.APPLICATIONS) || [];
      const jobs = this.getFromStorage(k.JOBS) || [];

      if (!profile) return null;

      return {
        user: profile,
        onboarding,
        resume: resume || { uploaded: false },
        applications,
        jobs,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(
    userId: string, 
    updates: ProfileUpdateData
  ): Promise<boolean> {
    try {
      const k = this.keys(userId);

      // Update user data
      if (updates.user) {
        const currentProfile = this.getFromStorage(k.PROFILE) || {};
        const updatedProfile = { ...currentProfile, ...updates.user };
        this.setToStorage(k.PROFILE, updatedProfile);
      }

      // Update onboarding data
      if (updates.onboarding) {
        const currentOnboarding = this.getFromStorage(k.ONBOARDING);
        const updatedOnboarding = { ...currentOnboarding, ...updates.onboarding };
        this.setToStorage(k.ONBOARDING, updatedOnboarding);
      }

      // Update resume data
      if (updates.resume) {
        const currentResume = this.getFromStorage(k.RESUME) || { uploaded: false };
        const updatedResume = { ...currentResume, ...updates.resume };
        this.setToStorage(k.RESUME, updatedResume);
      }

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // ==================== ONBOARDING ====================

  static async saveOnboarding(
    userId: string, 
    onboardingData: Onboarding
  ): Promise<boolean> {
    try {
      this.setToStorage(this.STORAGE_KEYS.ONBOARDING, onboardingData);
      return true;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      return false;
    }
  }

  static async getOnboarding(userId: string): Promise<Onboarding | null> {
    try {
      return this.getFromStorage(this.STORAGE_KEYS.ONBOARDING);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      return null;
    }
  }

  static async completeOnboarding(userId: string): Promise<boolean> {
    try {
      const currentOnboarding = this.getFromStorage(this.STORAGE_KEYS.ONBOARDING);
      if (currentOnboarding) {
        const completedOnboarding = {
          ...currentOnboarding,
          completed: true,
          completedAt: new Date().toISOString(),
        };
        this.setToStorage(this.STORAGE_KEYS.ONBOARDING, completedOnboarding);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  }

  // ==================== RESUME ====================

  static async saveResume(
    userId: string, 
    resumeData: Resume
  ): Promise<boolean> {
    try {
      this.setToStorage(this.STORAGE_KEYS.RESUME, resumeData);
      return true;
    } catch (error) {
      console.error('Error saving resume data:', error);
      return false;
    }
  }

  static async getResume(userId: string): Promise<Resume | null> {
    try {
      return this.getFromStorage(this.STORAGE_KEYS.RESUME);
    } catch (error) {
      console.error('Error fetching resume data:', error);
      return null;
    }
  }

  static async deleteResume(userId: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.RESUME);
      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      return false;
    }
  }

  // ==================== APPLICATIONS ====================

  static async saveApplication(
    userId: string, 
    application: Application
  ): Promise<boolean> {
    try {
      const applications = this.getFromStorage(this.STORAGE_KEYS.APPLICATIONS) || [];
      const existingIndex = applications.findIndex((app: Application) => app.id === application.id);
      
      if (existingIndex >= 0) {
        applications[existingIndex] = application;
      } else {
        applications.push(application);
      }
      
      this.setToStorage(this.STORAGE_KEYS.APPLICATIONS, applications);
      return true;
    } catch (error) {
      console.error('Error saving application:', error);
      return false;
    }
  }

  static async getApplications(userId: string): Promise<Application[]> {
    try {
      return this.getFromStorage(this.STORAGE_KEYS.APPLICATIONS) || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  static async deleteApplication(
    userId: string, 
    applicationId: string
  ): Promise<boolean> {
    try {
      const applications = this.getFromStorage(this.STORAGE_KEYS.APPLICATIONS) || [];
      const filteredApplications = applications.filter((app: Application) => app.id !== applicationId);
      this.setToStorage(this.STORAGE_KEYS.APPLICATIONS, filteredApplications);
      return true;
    } catch (error) {
      console.error('Error deleting application:', error);
      return false;
    }
  }

  static async updateApplicationStatus(
    userId: string, 
    applicationId: string, 
    status: Application['status']
  ): Promise<boolean> {
    try {
      const applications = this.getFromStorage(this.STORAGE_KEYS.APPLICATIONS) || [];
      const applicationIndex = applications.findIndex((app: Application) => app.id === applicationId);
      
      if (applicationIndex >= 0) {
        applications[applicationIndex] = {
          ...applications[applicationIndex],
          status,
          lastUpdate: new Date().toISOString(),
        };
        this.setToStorage(this.STORAGE_KEYS.APPLICATIONS, applications);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating application status:', error);
      return false;
    }
  }

  // ==================== JOBS ====================

  static async saveJobs(userId: string, jobs: Job[]): Promise<boolean> {
    try {
      this.setToStorage(this.STORAGE_KEYS.JOBS, jobs);
      return true;
    } catch (error) {
      console.error('Error saving jobs:', error);
      return false;
    }
  }

  static async getJobs(userId: string): Promise<Job[]> {
    try {
      return this.getFromStorage(this.STORAGE_KEYS.JOBS) || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  static async saveJob(userId: string, job: Job): Promise<boolean> {
    try {
      const jobs = this.getFromStorage(this.STORAGE_KEYS.JOBS) || [];
      const existingIndex = jobs.findIndex((j: Job) => j.id === job.id);
      
      if (existingIndex >= 0) {
        jobs[existingIndex] = job;
      } else {
        jobs.push(job);
      }
      
      this.setToStorage(this.STORAGE_KEYS.JOBS, jobs);
      return true;
    } catch (error) {
      console.error('Error saving job:', error);
      return false;
    }
  }

  // ==================== PROFILE STATISTICS ====================

  static async getProfileStats(userId: string): Promise<ProfileStats> {
    try {
      const applications = await this.getApplications(userId);
      const jobs = await this.getJobs(userId);
      const resume = await this.getResume(userId);
      const onboarding = await this.getOnboarding(userId);

      const totalApplications = applications.length;
      const interviewsScheduled = applications.filter(app => app.status === 'interview').length;
      const offersReceived = applications.filter(app => app.status === 'offer').length;
      
      const averageMatchScore = jobs.length > 0
        ? jobs.reduce((sum, job) => sum + (job.matchPercentage || 0), 0) / jobs.length
        : 0;

      const profileCompletion = this.calculateProfileCompletion(onboarding, resume, applications);

      const lastActiveDate = this.getLastActiveDate(applications, resume, onboarding);

      return {
        totalApplications,
        interviewsScheduled,
        offersReceived,
        averageMatchScore: Math.round(averageMatchScore),
        profileCompletion,
        lastActiveDate,
      };
    } catch (error) {
      console.error('Error calculating profile stats:', error);
      return {
        totalApplications: 0,
        interviewsScheduled: 0,
        offersReceived: 0,
        averageMatchScore: 0,
        profileCompletion: 0,
        lastActiveDate: new Date().toISOString(),
      };
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  private static calculateProfileCompletion(
    onboarding: Onboarding | null,
    resume: Resume | null,
    applications: Application[]
  ): number {
    let completion = 0;
    const totalItems = 6;

    // Onboarding completed
    if (onboarding?.completed) completion++;

    // Resume uploaded
    if (resume?.uploaded) completion++;

    // Skills added
    if (onboarding?.skills && onboarding.skills.length > 0) completion++;

    // LinkedIn added
    if (onboarding?.linkedinUrl) completion++;

    // ATS score calculated
    if (resume?.atsScore !== undefined) completion++;

    // At least one application
    if (applications.length > 0) completion++;

    return Math.round((completion / totalItems) * 100);
  }

  private static getLastActiveDate(
    applications: Application[],
    resume: Resume | null,
    onboarding: Onboarding | null
  ): string {
    const dates = [];

    // Application dates
    applications.forEach(app => {
      dates.push(new Date(app.lastUpdate));
    });

    // Resume upload date
    if (resume?.uploadedAt) {
      dates.push(new Date(resume.uploadedAt));
    }

    // Onboarding completion date
    if (onboarding?.completedAt) {
      dates.push(new Date(onboarding.completedAt));
    }

    if (dates.length === 0) {
      return new Date().toISOString();
    }

    return dates.reduce((latest, current) => current > latest ? current : latest).toISOString();
  }

  private static getFromStorage(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  private static setToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  }

  // ==================== DATA MIGRATION ====================

  static async migrateToSupabase(userId: string): Promise<boolean> {
    try {
      // This would be used to migrate localStorage data to Supabase
      // when implementing the backend integration
      
      const profileData = await this.getUserProfile(userId);
      if (!profileData) return false;

      console.log('Migrating profile data to Supabase for user:', userId);
      
      // TODO: Implement Supabase migration logic
      // await supabase.from('profiles').upsert(profileData.user);
      // await supabase.from('onboarding').upsert(profileData.onboarding);
      // await supabase.from('resumes').upsert(profileData.resume);
      // await supabase.from('applications').upsert(profileData.applications);
      
      return true;
    } catch (error) {
      console.error('Error migrating to Supabase:', error);
      return false;
    }
  }

  // ==================== DATA VALIDATION ====================

  static validateProfileData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate user data
    if (data.user) {
      if (!data.user.id || typeof data.user.id !== 'string') {
        errors.push('User ID is required and must be a string');
      }
      if (!data.user.email || !this.isValidEmail(data.user.email)) {
        errors.push('Valid user email is required');
      }
    }

    // Validate onboarding data
    if (data.onboarding) {
      if (!data.onboarding.targetRole || typeof data.onboarding.targetRole !== 'string') {
        errors.push('Target role is required');
      }
      if (!data.onboarding.industry || typeof data.onboarding.industry !== 'string') {
        errors.push('Industry is required');
      }
      if (!Array.isArray(data.onboarding.skills)) {
        errors.push('Skills must be an array');
      }
    }

    // Validate resume data
    if (data.resume) {
      if (data.resume.uploaded && !data.resume.fileName) {
        errors.push('Resume filename is required when uploaded');
      }
      if (data.resume.fileSize && (typeof data.resume.fileSize !== 'number' || data.resume.fileSize < 0)) {
        errors.push('Resume file size must be a positive number');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ==================== PROFILE EXPORT ====================

  static async exportProfileData(userId: string): Promise<string> {
    try {
      const profileData = await this.getUserProfile(userId);
      if (!profileData) {
        throw new Error('No profile data found');
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        userId,
        ...profileData,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting profile data:', error);
      throw error;
    }
  }

  // ==================== PROFILE CLEANUP ====================

  static async cleanupOldApplications(userId: string, daysOld: number = 365): Promise<number> {
    try {
      const applications = await this.getApplications(userId);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const oldApplications = applications.filter(app => 
        new Date(app.lastUpdate) < cutoffDate
      );

      const updatedApplications = applications.filter(app => 
        new Date(app.lastUpdate) >= cutoffDate
      );

      this.setToStorage(this.STORAGE_KEYS.APPLICATIONS, updatedApplications);

      return oldApplications.length;
    } catch (error) {
      console.error('Error cleaning up old applications:', error);
      return 0;
    }
  }
}
