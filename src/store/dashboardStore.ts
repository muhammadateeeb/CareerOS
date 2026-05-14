import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== TYPES ====================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Onboarding {
  targetRole: string;
  industry: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  country: string;
  workType: 'remote' | 'hybrid' | 'onsite';
  salaryTarget: {
    min: number;
    max: number;
    currency: string;
  };
  linkedinUrl?: string;
  completed: boolean;
  completedAt?: string;
}

export interface Resume {
  uploaded: boolean;
  fileName?: string;
  fileSize?: number;
  filePath?: string;
  uploadedAt?: string;
  extractedText?: string;
  parsedData?: ParsedResumeData;
  atsScore?: number;
  feedback?: ResumeFeedback[];
}

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
}

export interface FormattingAnalysis {
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  hasSections: boolean;
  pagesEstimated: number;
}

export interface ParsedResumeData {
  rawText: string;
  
  personalInfo: PersonalInfo;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
  keywords: string[];
  
  formatting: FormattingAnalysis;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
}

export interface AchievementEntry {
  title: string;
  description: string;
  metrics?: {
    value: string;
    context: string;
  }[];
}

export interface ResumeFeedback {
  type: 'strength' | 'weakness' | 'recommendation';
  category: 'formatting' | 'content' | 'keywords' | 'achievements' | 'skills';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min?: number;
    max?: number;
    currency: string;
    type: 'yearly' | 'monthly' | 'hourly';
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  description: string;
  requirements: string[];
  tags: string[];
  postedDate: string;
  source: string;
  url: string;
  matchPercentage?: number;
  status: 'new' | 'viewed' | 'saved' | 'applied';
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  appliedDate?: string;
  lastUpdate: string;
  notes?: string;
  resumeVersion?: string;
  source: string;
  url?: string;
}

export interface Analytics {
  profileStrength: number;
  completionPercentage: number;
  interviews: number;
  applicationsCount: number;
  savedJobs: number;
  avgMatchScore: number;
  weeklyActivity: {
    applications: number;
    interviews: number;
    profileUpdates: number;
  };
  monthlyTrends: {
    applications: number[];
    interviews: number[];
    matchScores: number[];
  };
  recruiterInsights: string[];
}

export interface DashboardState {
  // Core data
  user: User | null;
  onboarding: Onboarding | null;
  resume: Resume;
  jobs: Job[];
  applications: Application[];
  analytics: Analytics;

  // UI state
  isLoading: boolean;
  error: string | null;
  selectedJob: Job | null;
  selectedApplication: Application | null;

  // Last updated timestamps
  lastUpdated: {
      onboarding?: string;
      resume?: string;
      jobs?: string;
      applications?: string;
  };
}

// ==================== INITIAL STATE ====================

const initialState: DashboardState = {
  user: null,
  onboarding: null,
  resume: {
    uploaded: false,
    fileName: undefined,
    fileSize: 0,
    filePath: undefined,
    uploadedAt: undefined,
    extractedText: undefined,
    parsedData: undefined,
    atsScore: undefined,
    feedback: undefined,
  },
  jobs: [],
  applications: [],
  analytics: {
    profileStrength: 0,
    completionPercentage: 0,
    interviews: 0,
    applicationsCount: 0,
    savedJobs: 0,
    avgMatchScore: 0,
    weeklyActivity: {
      applications: 0,
      interviews: 0,
      profileUpdates: 0,
    },
    monthlyTrends: {
      applications: [],
      interviews: [],
      matchScores: [],
    },
  },
  isLoading: false,
  error: null,
  selectedJob: null,
  selectedApplication: null,
  lastUpdated: {},
};

// ==================== ACTION TYPES ====================

export type DashboardAction =
  // User actions
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }

  // Onboarding actions
  | { type: 'SET_ONBOARDING'; payload: Onboarding }
  | { type: 'UPDATE_ONBOARDING'; payload: Partial<Onboarding> }
  | { type: 'COMPLETE_ONBOARDING' }

  // Resume actions
  | { type: 'SET_RESUME'; payload: Resume }
  | { type: 'UPDATE_RESUME'; payload: Partial<Resume> }
  | { type: 'SET_ATS_SCORE'; payload: number }
  | { type: 'SET_RESUME_FEEDBACK'; payload: ResumeFeedback[] }

  // Job actions
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_JOB'; payload: { id: string; updates: Partial<Job> } }
  | { type: 'REMOVE_JOB'; payload: string }
  | { type: 'SET_JOB_STATUS'; payload: { id: string; status: Job['status'] } }

  // Application actions
  | { type: 'SET_APPLICATIONS'; payload: Application[] }
  | { type: 'ADD_APPLICATION'; payload: Application }
  | { type: 'UPDATE_APPLICATION'; payload: { id: string; updates: Partial<Application> } }
  | { type: 'UPDATE_APPLICATION_STATUS'; payload: { id: string; status: Application['status'] } }
  | { type: 'REMOVE_APPLICATION'; payload: string }

  // Analytics actions
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<Analytics> }
  | { type: 'RECALCULATE_ANALYTICS' }

  // UI actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SELECT_JOB'; payload: Job | null }
  | { type: 'SELECT_APPLICATION'; payload: Application | null }

  // Timestamp actions
  | { type: 'UPDATE_TIMESTAMP'; payload: { key: keyof DashboardState['lastUpdated']; timestamp: string } };

// ==================== STORE ====================

interface DashboardStore extends DashboardState {
  // Actions
  dispatch: (action: DashboardAction) => void;
  
  // Computed values
  getProfileStrength: () => number;
  getCompletionPercentage: () => number;
  getApplicationsByStatus: (status: Application['status']) => Application[];
  getJobsByStatus: (status: Job['status']) => Job[];
  getRecentApplications: (limit?: number) => Application[];
  getUpcomingInterviews: () => Application[];
  getRecruiterInsights: () => string[];
  
  // Utility actions
  reset: () => void;
  hydrate: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==================== DISPATCH ====================
      dispatch: (action) => {
        const state = get();
        let newState = { ...state };

        switch (action.type) {
          // User actions
          case 'SET_USER':
            newState.user = action.payload;
            newState.lastUpdated = { ...state.lastUpdated };
            break;

          case 'CLEAR_USER':
            newState.user = null;
            break;

          // Onboarding actions
          case 'SET_ONBOARDING':
            newState.onboarding = action.payload;
            newState.lastUpdated = { 
              ...state.lastUpdated, 
              onboarding: new Date().toISOString() 
            };
            break;

          case 'UPDATE_ONBOARDING':
            if (state.onboarding) {
              newState.onboarding = { ...state.onboarding, ...action.payload };
              newState.lastUpdated = { 
                ...state.lastUpdated, 
                onboarding: new Date().toISOString() 
              };
            }
            break;

          case 'COMPLETE_ONBOARDING':
            if (state.onboarding) {
              newState.onboarding = {
                ...state.onboarding,
                completed: true,
                completedAt: new Date().toISOString(),
              };
              newState.lastUpdated = { 
                ...state.lastUpdated, 
                onboarding: new Date().toISOString() 
              };
            }
            break;

          // Resume actions
          case 'SET_RESUME':
            newState.resume = action.payload;
            newState.lastUpdated = { 
              ...state.lastUpdated, 
              resume: new Date().toISOString() 
            };
            break;

          case 'UPDATE_RESUME':
            newState.resume = { ...state.resume, ...action.payload };
            newState.lastUpdated = { 
              ...state.lastUpdated, 
              resume: new Date().toISOString() 
            };
            break;

          case 'SET_ATS_SCORE':
            newState.resume = { ...state.resume, atsScore: action.payload };
            break;

          case 'SET_RESUME_FEEDBACK':
            newState.resume = { ...state.resume, feedback: action.payload };
            break;

          // Job actions
          case 'SET_JOBS':
            newState.jobs = action.payload;
            newState.lastUpdated = { 
              ...state.lastUpdated, 
              jobs: new Date().toISOString() 
            };
            break;

          case 'ADD_JOB':
            newState.jobs = [...state.jobs, action.payload];
            break;

          case 'UPDATE_JOB':
            newState.jobs = state.jobs.map(job =>
              job.id === action.payload.id
                ? { ...job, ...action.payload.updates }
                : job
            );
            break;

          case 'REMOVE_JOB':
            newState.jobs = state.jobs.filter(job => job.id !== action.payload);
            break;

          case 'SET_JOB_STATUS':
            newState.jobs = state.jobs.map(job =>
              job.id === action.payload.id
                ? { ...job, status: action.payload.status }
                : job
            );
            break;

          // Application actions
          case 'SET_APPLICATIONS':
            newState.applications = action.payload;
            newState.lastUpdated = { 
              ...state.lastUpdated, 
              applications: new Date().toISOString() 
            };
            break;

          case 'ADD_APPLICATION':
            newState.applications = [...state.applications, action.payload];
            break;

          case 'UPDATE_APPLICATION':
            newState.applications = state.applications.map(app =>
              app.id === action.payload.id
                ? { ...app, ...action.payload.updates, lastUpdate: new Date().toISOString() }
                : app
            );
            break;

          case 'UPDATE_APPLICATION_STATUS':
            newState.applications = state.applications.map(app =>
              app.id === action.payload.id
                ? { ...app, status: action.payload.status, lastUpdate: new Date().toISOString() }
                : app
            );
            break;

          case 'REMOVE_APPLICATION':
            newState.applications = state.applications.filter(app => app.id !== action.payload);
            break;

          // Analytics actions
          case 'UPDATE_ANALYTICS':
            newState.analytics = { ...state.analytics, ...action.payload };
            break;

          case 'RECALCULATE_ANALYTICS':
            const analytics = calculateAnalytics(newState);
            newState.analytics = analytics;
            break;

          // UI actions
          case 'SET_LOADING':
            newState.isLoading = action.payload;
            break;

          case 'SET_ERROR':
            newState.error = action.payload;
            break;

          case 'CLEAR_ERROR':
            newState.error = null;
            break;

          case 'SELECT_JOB':
            newState.selectedJob = action.payload;
            break;

          case 'SELECT_APPLICATION':
            newState.selectedApplication = action.payload;
            break;

          // Timestamp actions
          case 'UPDATE_TIMESTAMP':
            newState.lastUpdated = {
              ...state.lastUpdated,
              [action.payload.key]: action.payload.timestamp,
            };
            break;
        }

        set(newState);
      },

      // ==================== COMPUTED VALUES ====================
      getProfileStrength: () => {
        const state = get();
        let score = 0;
        const weights = {
          resume: 25,
          atsScore: 30,
          linkedin: 15,
          skills: 15,
          applications: 15,
        };

        // Resume uploaded and parsed (25 points)
        if (state.resume.uploaded && state.resume.parsedData) {
          score += weights.resume;
        } else if (state.resume.uploaded) {
          score += weights.resume * 0.5; // Partial credit for upload without parse
        }

        // ATS score quality (30 points) - scaled by score
        if (state.resume.atsScore !== undefined) {
          const atsRatio = state.resume.atsScore / 100;
          score += weights.atsScore * atsRatio;
        }

        // LinkedIn profile (15 points)
        if (state.onboarding?.linkedinUrl || state.resume.parsedData?.personalInfo?.linkedin) {
          score += weights.linkedin;
        }

        // Skills count and quality (15 points)
        const skillCount = state.resume.parsedData?.skills?.length || state.onboarding?.skills?.length || 0;
        if (skillCount >= 10) {
          score += weights.skills;
        } else if (skillCount >= 5) {
          score += weights.skills * 0.7;
        } else if (skillCount > 0) {
          score += weights.skills * 0.4;
        }

        // Application activity (15 points)
        const appCount = state.applications.length;
        if (appCount >= 10) {
          score += weights.applications;
        } else if (appCount >= 5) {
          score += weights.applications * 0.7;
        } else if (appCount > 0) {
          score += weights.applications * 0.4;
        }

        return Math.round(Math.min(score, 100));
      },

      getCompletionPercentage: () => {
        const state = get();
        const checklist = [
          { key: 'onboarding', check: () => state.onboarding?.completed, weight: 20 },
          { key: 'resume', check: () => state.resume.uploaded, weight: 20 },
          { key: 'resumeParsed', check: () => !!state.resume.parsedData, weight: 15 },
          { key: 'atsScore', check: () => state.resume.atsScore !== undefined && state.resume.atsScore >= 60, weight: 15 },
          { key: 'skills', check: () => (state.resume.parsedData?.skills?.length || 0) >= 5, weight: 10 },
          { key: 'linkedin', check: () => !!(state.onboarding?.linkedinUrl || state.resume.parsedData?.personalInfo?.linkedin), weight: 10 },
          { key: 'applications', check: () => state.applications.length > 0, weight: 10 },
        ];

        const totalScore = checklist.reduce((sum, item) => {
          return sum + (item.check() ? item.weight : 0);
        }, 0);

        return Math.round(totalScore);
      },

      getApplicationsByStatus: (status) => {
        const state = get();
        return state.applications.filter(app => app.status === status);
      },

      getJobsByStatus: (status) => {
        const state = get();
        return state.jobs.filter(job => job.status === status);
      },

      getRecentApplications: (limit = 5) => {
        const state = get();
        return state.applications
          .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
          .slice(0, limit);
      },

      getUpcomingInterviews: () => {
        const state = get();
        return state.applications
          .filter(app => app.status === 'interview')
          .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
      },
      getRecruiterInsights: () => {
        const state = get();
        return getRecruiterInsights(state);
      },

      // ==================== UTILITY ACTIONS ====================
      reset: () => {
        set(initialState);
      },

      hydrate: async () => {
        // This will be used to fetch data from Supabase
        console.log('Hydrating dashboard data...');
      },
    }),
    {
      name: 'careeros-dashboard-store',
      partialize: (state) => ({
        user: state.user,
        onboarding: state.onboarding,
        resume: state.resume,
        jobs: state.jobs,
        applications: state.applications,
        analytics: state.analytics,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// ==================== UTILITY FUNCTIONS ====================

function calculateAnalytics(state: DashboardState): Analytics {
  const applications = state.applications;
  const jobs = state.jobs;

  const applicationsCount = applications.length;
  const interviews = applications.filter(app => app.status === 'interview').length;
  const savedJobs = jobs.filter(job => job.status === 'saved').length;
  
  const avgMatchScore = jobs.length > 0
    ? Math.round(jobs.reduce((sum, job) => sum + (job.matchPercentage || 0), 0) / jobs.length)
    : 0;

  const profileStrength = useDashboardStore.getState().getProfileStrength();
  const completionPercentage = useDashboardStore.getState().getCompletionPercentage();

  // Weekly activity - applications in last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyApplications = applications.filter(app => {
    const appDate = new Date(app.appliedDate || app.lastUpdate);
    return appDate > weekAgo;
  }).length;

  // Weekly interviews
  const weeklyInterviews = applications.filter(app => {
    if (app.status !== 'interview') return false;
    const appDate = new Date(app.lastUpdate);
    return appDate > weekAgo;
  }).length;

  // Profile updates tracking (resume uploads, onboarding changes)
  const profileUpdates = [
    state.lastUpdated.resume,
    state.lastUpdated.onboarding,
  ].filter(timestamp => {
    if (!timestamp) return false;
    const updateDate = new Date(timestamp);
    return updateDate > weekAgo;
  }).length;

  // Monthly trends - last 6 months
  const monthlyTrends = calculateMonthlyTrends(applications);

  return {
    profileStrength,
    completionPercentage,
    interviews,
    applicationsCount,
    savedJobs,
    avgMatchScore,
    weeklyActivity: {
      applications: weeklyApplications,
      interviews: weeklyInterviews,
      profileUpdates,
    },
    monthlyTrends,
    recruiterInsights: getRecruiterInsights(state),
  };
}

function calculateMonthlyTrends(applications: Application[]): {
  applications: number[];
  interviews: number[];
  matchScores: number[];
} {
  const now = new Date();
  const trends = {
    applications: [] as number[],
    interviews: [] as number[],
    matchScores: [] as number[],
  };

  // Calculate for last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthApps = applications.filter(app => {
      const appDate = new Date(app.appliedDate || app.lastUpdate);
      return appDate >= monthStart && appDate <= monthEnd;
    });

    trends.applications.push(monthApps.length);
    trends.interviews.push(monthApps.filter(app => app.status === 'interview').length);
    
    // Match scores would come from job matches - placeholder for now
    trends.matchScores.push(0);
  }

  return trends;
}

// ==================== COMPUTED FUNCTION IMPLEMENTATIONS ====================

export const calculateProfileStrength = (state: DashboardState): number => {
  let strength = 0;
  
  // Resume uploaded: +20 points
  if (state.resume?.uploaded) {
    strength += 20;
  }
  
  // LinkedIn present: +20 points
  if (state.resume?.parsedData?.personalInfo?.linkedin) {
    strength += 20;
  }
  
  // Skills > 5: +20 points
  if (state.resume?.parsedData?.skills && state.resume.parsedData.skills.length > 5) {
    strength += 20;
  }
  
  // ATS > 70: +20 points
  if (state.resume?.atsScore && state.resume.atsScore > 70) {
    strength += 20;
  }
  
  // Applications > 0: +20 points
  if (state.applications && state.applications.length > 0) {
    strength += 20;
  }
  
  return Math.min(strength, 100);
};

export const getRecruiterInsights = (state: DashboardState): string[] => {
  const insights: string[] = [];
  
  if (!state.resume?.parsedData) {
    insights.push("Upload your resume to get personalized recruiter insights");
    return insights;
  }
  
  const resume = state.resume.parsedData;
  const atsScore = state.resume.atsScore || 0;
  
  // ATS score insight
  if (atsScore >= 80) {
    insights.push("Your resume is highly optimized for ATS systems — recruiters will see it");
  } else if (atsScore >= 60) {
    insights.push("Your resume passes most ATS filters but could be stronger");
  } else if (atsScore > 0) {
    insights.push("Your resume may be filtered out by ATS — follow the Resume Lab suggestions");
  }
  
  // Quantification insight
  const hasQuantification = resume.rawText.match(/\d+%|\$\d+|(\d+)\s*(users?|customers?|million|thousand|k\b)/gi);
  if (hasQuantification && hasQuantification.length >= 3) {
    insights.push("Strong quantifiable achievements — recruiters love measurable impact");
  } else if (!hasQuantification || hasQuantification.length < 2) {
    insights.push("Add numbers and metrics to your achievements (%, $, user counts)");
  }
  
  // Technical skills depth
  const technicalSkills = resume.skills.filter(skill => {
    const s = skill.toLowerCase();
    return ['javascript', 'python', 'react', 'aws', 'docker', 'kubernetes', 'sql', 'git',
            'java', 'typescript', 'node', 'azure', 'gcp', 'terraform', 'jenkins'].some(tech => s.includes(tech));
  });
  
  if (technicalSkills.length >= 8) {
    insights.push("Deep technical skill set across multiple domains");
  } else if (technicalSkills.length >= 4) {
    insights.push("Solid technical foundation — consider adding more specialized skills");
  }
  
  // Leadership indicators
  const hasLeadership = resume.experience.some(exp => {
    const text = `${exp.position} ${exp.description}`.toLowerCase();
    return text.includes('led') || text.includes('managed') || 
           text.includes('supervised') || text.includes('mentored') ||
           text.includes('team of');
  });
  
  if (hasLeadership) {
    insights.push("Leadership experience demonstrated — valuable for senior roles");
  }
  
  // Certifications
  if (resume.certifications.length >= 2) {
    insights.push("Professional certifications show commitment to continuous learning");
  } else if (resume.certifications.length === 0 && state.onboarding?.experienceLevel !== 'entry') {
    insights.push("Consider adding relevant certifications to stand out");
  }
  
  // Project portfolio
  if (resume.projects.length >= 2) {
    insights.push("Project portfolio demonstrates hands-on experience");
  }
  
  // Contact completeness
  const hasEmail = !!resume.personalInfo.email;
  const hasPhone = !!resume.personalInfo.phone;
  const hasLinkedIn = !!resume.personalInfo.linkedin;
  
  if (hasEmail && hasPhone && hasLinkedIn) {
    insights.push("Complete contact information makes it easy for recruiters to reach you");
  } else {
    const missing = [];
    if (!hasEmail) missing.push("email");
    if (!hasPhone) missing.push("phone");
    if (!hasLinkedIn) missing.push("LinkedIn");
    insights.push(`Add missing contact info: ${missing.join(", ")}`);
  }
  
  // Experience level alignment
  if (state.onboarding?.experienceLevel) {
    const expCount = resume.experience.length;
    const level = state.onboarding.experienceLevel;
    
    if ((level === 'entry' && expCount >= 1) ||
        (level === 'mid' && expCount >= 2) ||
        (level === 'senior' && expCount >= 3)) {
      insights.push("Experience history aligns well with your target level");
    }
  }
  
  // Return top 5 most relevant insights
  return insights.slice(0, 5);
};

// ==================== ACTION CREATORS ====================

export const dashboardActions = {
  setUser: (user: User): DashboardAction => ({ type: 'SET_USER', payload: user }),
  clearUser: (): DashboardAction => ({ type: 'CLEAR_USER' }),

  setOnboarding: (onboarding: Onboarding): DashboardAction => ({ 
    type: 'SET_ONBOARDING', 
    payload: onboarding 
  }),
  updateOnboarding: (updates: Partial<Onboarding>): DashboardAction => ({ 
    type: 'UPDATE_ONBOARDING', 
    payload: updates 
  }),
  completeOnboarding: (): DashboardAction => ({ type: 'COMPLETE_ONBOARDING' }),

  setResume: (resume: Resume): DashboardAction => ({ type: 'SET_RESUME', payload: resume }),
  updateResume: (updates: Partial<Resume>): DashboardAction => ({ 
    type: 'UPDATE_RESUME', 
    payload: updates 
  }),
  setAtsScore: (score: number): DashboardAction => ({ type: 'SET_ATS_SCORE', payload: score }),
  setResumeFeedback: (feedback: ResumeFeedback[]): DashboardAction => ({ 
    type: 'SET_RESUME_FEEDBACK', 
    payload: feedback 
  }),

  setJobs: (jobs: Job[]): DashboardAction => ({ type: 'SET_JOBS', payload: jobs }),
  addJob: (job: Job): DashboardAction => ({ type: 'ADD_JOB', payload: job }),
  updateJob: (id: string, updates: Partial<Job>): DashboardAction => ({ 
    type: 'UPDATE_JOB', 
    payload: { id, updates } 
  }),
  removeJob: (id: string): DashboardAction => ({ type: 'REMOVE_JOB', payload: id }),
  setJobStatus: (id: string, status: Job['status']): DashboardAction => ({ 
    type: 'SET_JOB_STATUS', 
    payload: { id, status } 
  }),

  setApplications: (applications: Application[]): DashboardAction => ({ 
    type: 'SET_APPLICATIONS', 
    payload: applications 
  }),
  addApplication: (application: Application): DashboardAction => ({ 
    type: 'ADD_APPLICATION', 
    payload: application 
  }),
  updateApplication: (id: string, updates: Partial<Application>): DashboardAction => ({ 
    type: 'UPDATE_APPLICATION', 
    payload: { id, updates } 
  }),
  updateApplicationStatus: (id: string, status: Application['status']): DashboardAction => ({ 
    type: 'UPDATE_APPLICATION_STATUS', 
    payload: { id, status } 
  }),
  removeApplication: (id: string): DashboardAction => ({ type: 'REMOVE_APPLICATION', payload: id }),

  updateAnalytics: (updates: Partial<Analytics>): DashboardAction => ({ 
    type: 'UPDATE_ANALYTICS', 
    payload: updates 
  }),
  recalculateAnalytics: (): DashboardAction => ({ type: 'RECALCULATE_ANALYTICS' }),

  setLoading: (loading: boolean): DashboardAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): DashboardAction => ({ type: 'SET_ERROR', payload: error }),
  clearError: (): DashboardAction => ({ type: 'CLEAR_ERROR' }),
  selectJob: (job: Job | null): DashboardAction => ({ type: 'SELECT_JOB', payload: job }),
  selectApplication: (application: Application | null): DashboardAction => ({ 
    type: 'SELECT_APPLICATION', 
    payload: application 
  }),

  updateTimestamp: (key: keyof DashboardState['lastUpdated'], timestamp: string): DashboardAction => ({ 
    type: 'UPDATE_TIMESTAMP', 
    payload: { key, timestamp } 
  }),
};
