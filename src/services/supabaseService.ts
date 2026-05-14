import { createClient } from '@supabase/supabase-js';
import { User, Onboarding, Resume, Application, Job } from '@/store/dashboardStore';

// ==================== TYPES ====================

export interface DatabaseProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOnboarding {
  id: string;
  user_id: string;
  target_role: string;
  industry: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  country: string;
  work_type: 'remote' | 'hybrid' | 'onsite';
  salary_target: {
    min: number;
    max: number;
    currency: string;
  };
  linkedin_url?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseResume {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  extracted_text?: string;
  parsed_data?: any;
  ats_score?: number;
  feedback?: any[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseApplication {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  applied_date?: string;
  last_update: string;
  notes?: string;
  resume_version?: string;
  source: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseJob {
  id: string;
  user_id: string;
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
  posted_date: string;
  source: string;
  url: string;
  match_percentage?: number;
  status: 'new' | 'viewed' | 'saved' | 'applied';
  created_at: string;
  updated_at: string;
}

// ==================== SUPABASE CLIENT ====================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using localStorage fallback.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==================== SERVICE CLASS ====================

export class SupabaseService {
  // ==================== PROFILE OPERATIONS ====================

  static async createProfile(user: User): Promise<DatabaseProfile | null> {
    if (!supabase) {
      console.warn('Supabase not available, skipping profile creation');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }

  static async getProfile(userId: string): Promise<DatabaseProfile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<DatabaseProfile>): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // ==================== ONBOARDING OPERATIONS ====================

  static async saveOnboarding(userId: string, onboarding: Onboarding): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('onboarding')
        .upsert({
          user_id: userId,
          target_role: onboarding.targetRole,
          industry: onboarding.industry,
          experience_level: onboarding.experienceLevel,
          skills: onboarding.skills,
          country: onboarding.country,
          work_type: onboarding.workType,
          salary_target: onboarding.salaryTarget,
          linkedin_url: onboarding.linkedinUrl,
          completed: onboarding.completed,
          completed_at: onboarding.completedAt,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving onboarding:', error);
      return false;
    }
  }

  static async getOnboarding(userId: string): Promise<DatabaseOnboarding | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching onboarding:', error);
      return null;
    }
  }

  // ==================== RESUME OPERATIONS ====================

  static async uploadResume(userId: string, resume: Resume): Promise<DatabaseResume | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .upsert({
          user_id: userId,
          file_name: resume.fileName,
          file_size: resume.fileSize,
          file_path: resume.filePath,
          uploaded_at: resume.uploadedAt || new Date().toISOString(),
          extracted_text: resume.extractedText,
          parsed_data: resume.parsedData,
          ats_score: resume.atsScore,
          feedback: resume.feedback,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      return null;
    }
  }

  static async getResume(userId: string): Promise<DatabaseResume | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching resume:', error);
      return null;
    }
  }

  static async deleteResume(userId: string): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      return false;
    }
  }

  // ==================== APPLICATION OPERATIONS ====================

  static async saveApplication(userId: string, application: Application): Promise<DatabaseApplication | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          job_id: application.jobId,
          job_title: application.jobTitle,
          company: application.company,
          location: application.location,
          status: application.status,
          applied_date: application.appliedDate,
          last_update: application.lastUpdate,
          notes: application.notes,
          resume_version: application.resumeVersion,
          source: application.source,
          url: application.url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving application:', error);
      return null;
    }
  }

  static async getApplications(userId: string): Promise<DatabaseApplication[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('last_update', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  static async updateApplicationStatus(
    userId: string, 
    applicationId: string, 
    status: Application['status']
  ): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          last_update: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('id', applicationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      return false;
    }
  }

  static async deleteApplication(userId: string, applicationId: string): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('user_id', userId)
        .eq('id', applicationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting application:', error);
      return false;
    }
  }

  // ==================== JOB OPERATIONS ====================

  static async saveJobs(userId: string, jobs: Job[]): Promise<boolean> {
    if (!supabase) return false;

    try {
      const jobsToInsert = jobs.map(job => ({
        user_id: userId,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
        remote: job.remote,
        description: job.description,
        requirements: job.requirements,
        tags: job.tags,
        posted_date: job.postedDate,
        source: job.source,
        url: job.url,
        match_percentage: job.matchPercentage,
        status: job.status,
      }));

      const { error } = await supabase
        .from('jobs')
        .upsert(jobsToInsert, {
          onConflict: 'user_id,id',
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving jobs:', error);
      return false;
    }
  }

  static async getJobs(userId: string): Promise<DatabaseJob[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('match_percentage', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  // ==================== FILE STORAGE ====================

  static async uploadFile(
    bucket: string,
    filePath: string,
    file: File
  ): Promise<{ path: string; error?: string }> {
    if (!supabase) {
      return { path: '', error: 'Supabase not available' };
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;
      return { path: data.path };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { path: '', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getPublicUrl(
    bucket: string,
    filePath: string
  ): Promise<{ url: string; error?: string }> {
    if (!supabase) {
      return { url: '', error: 'Supabase not available' };
    }

    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { url: data.publicUrl };
    } catch (error) {
      console.error('Error getting public URL:', error);
      return { url: '', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async deleteFile(
    bucket: string,
    filePath: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase not available' };
    }

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== REALTIME SUBSCRIPTIONS ====================

  static subscribeToApplications(
    userId: string,
    callback: (application: DatabaseApplication) => void
  ) {
    if (!supabase) return null;

    return supabase
      .channel(`applications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as DatabaseApplication);
          }
        }
      )
      .subscribe();
  }

  static subscribeToJobs(
    userId: string,
    callback: (job: DatabaseJob) => void
  ) {
    if (!supabase) return null;

    return supabase
      .channel(`jobs:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as DatabaseJob);
          }
        }
      )
      .subscribe();
  }

  // ==================== UTILITY FUNCTIONS ====================

  static isAvailable(): boolean {
    return supabase !== null;
  }

  static async testConnection(): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }
}

// ==================== MIGRATION HELPERS ====================

export const DATABASE_SCHEMA = {
  profiles: `
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  onboarding: `
    CREATE TABLE IF NOT EXISTS onboarding (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
      target_role TEXT NOT NULL,
      industry TEXT NOT NULL,
      experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
      skills TEXT[] NOT NULL DEFAULT '{}',
      country TEXT NOT NULL,
      work_type TEXT NOT NULL CHECK (work_type IN ('remote', 'hybrid', 'onsite')),
      salary_target JSONB NOT NULL,
      linkedin_url TEXT,
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  resumes: `
    CREATE TABLE IF NOT EXISTS resumes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_size BIGINT NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      extracted_text TEXT,
      parsed_data JSONB,
      ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
      feedback JSONB DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  applications: `
    CREATE TABLE IF NOT EXISTS applications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT REFERENCES profiles(user_id) ON DELETE CASCADE,
      job_id TEXT NOT NULL,
      job_title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('saved', 'applied', 'interview', 'offer', 'rejected')),
      applied_date TIMESTAMP WITH TIME ZONE,
      last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      notes TEXT,
      resume_version TEXT,
      source TEXT NOT NULL,
      url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  jobs: `
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT REFERENCES profiles(user_id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      salary JSONB NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
      remote BOOLEAN DEFAULT FALSE,
      description TEXT NOT NULL,
      requirements TEXT[] DEFAULT '{}',
      tags TEXT[] DEFAULT '{}',
      posted_date TIMESTAMP WITH TIME ZONE NOT NULL,
      source TEXT NOT NULL,
      url TEXT NOT NULL,
      match_percentage INTEGER CHECK (match_percentage >= 0 AND match_percentage <= 100),
      status TEXT NOT NULL CHECK (status IN ('new', 'viewed', 'saved', 'applied')) DEFAULT 'new',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, id)
    );
  `,
};
