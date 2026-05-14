import { Job, Onboarding, ParsedResumeData } from '@/store/dashboardStore';

// ==================== TYPES ====================

export interface JobMatchResult {
  jobs: Job[];
  totalMatches: number;
  matchDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

export interface JobSearchCriteria {
  keywords?: string[];
  location?: string;
  workType?: 'remote' | 'hybrid' | 'onsite';
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: Onboarding['experienceLevel'];
  industry?: string;
}

export interface MatchScore {
  total: number;
  breakdown: {
    skills: number;
    experience: number;
    keywords: number;
    location: number;
    salary: number;
  };
}

// ==================== CONSTANTS ====================

const MATCH_WEIGHTS = {
  skills: 0.35,      // 35%
  experience: 0.25,  // 25%
  keywords: 0.20,    // 20%
  location: 0.10,    // 10%
  salary: 0.10,      // 10%
};

const MATCH_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
};

// Sample job data - In production, this would come from job APIs
const SAMPLE_JOBS: Omit<Job, 'matchPercentage' | 'status'>[] = [
  {
    id: 'job_1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: { min: 120000, max: 180000, currency: 'USD', type: 'yearly' },
    type: 'full-time',
    remote: true,
    description: 'We are looking for a Senior Software Engineer to join our growing team...',
    requirements: ['5+ years of experience', 'React', 'Node.js', 'TypeScript', 'AWS'],
    tags: ['react', 'nodejs', 'typescript', 'aws', 'senior'],
    postedDate: new Date().toISOString(),
    source: 'internal',
    url: 'https://example.com/job/1',
  },
  {
    id: 'job_2',
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    salary: { min: 80000, max: 120000, currency: 'USD', type: 'yearly' },
    type: 'full-time',
    remote: false,
    description: 'Join our frontend team to build amazing user experiences...',
    requirements: ['3+ years of experience', 'React', 'CSS', 'JavaScript', 'UI/UX'],
    tags: ['react', 'css', 'javascript', 'frontend', 'ui'],
    postedDate: new Date().toISOString(),
    source: 'internal',
    url: 'https://example.com/job/2',
  },
  {
    id: 'job_3',
    title: 'Full Stack Developer',
    company: 'DigitalAgency',
    location: 'Remote',
    salary: { min: 90000, max: 140000, currency: 'USD', type: 'yearly' },
    type: 'full-time',
    remote: true,
    description: 'Looking for a versatile full stack developer...',
    requirements: ['React', 'Node.js', 'MongoDB', 'Docker', 'Agile'],
    tags: ['react', 'nodejs', 'mongodb', 'docker', 'fullstack'],
    postedDate: new Date().toISOString(),
    source: 'internal',
    url: 'https://example.com/job/3',
  },
  {
    id: 'job_4',
    title: 'Product Manager',
    company: 'InnovationLabs',
    location: 'Boston, MA',
    salary: { min: 110000, max: 160000, currency: 'USD', type: 'yearly' },
    type: 'full-time',
    remote: true,
    description: 'Lead product strategy and development...',
    requirements: ['5+ years experience', 'Product management', 'Agile', 'Analytics', 'Leadership'],
    tags: ['product', 'management', 'agile', 'analytics', 'leadership'],
    postedDate: new Date().toISOString(),
    source: 'internal',
    url: 'https://example.com/job/4',
  },
  {
    id: 'job_5',
    title: 'Data Scientist',
    company: 'AIStartup',
    location: 'Seattle, WA',
    salary: { min: 100000, max: 150000, currency: 'USD', type: 'yearly' },
    type: 'full-time',
    remote: true,
    description: 'Apply machine learning to solve real-world problems...',
    requirements: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
    tags: ['python', 'machine-learning', 'statistics', 'sql', 'data'],
    postedDate: new Date().toISOString(),
    source: 'internal',
    url: 'https://example.com/job/5',
  },
];

// ==================== MAIN MATCHING FUNCTION ====================

export function findMatchingJobs(
  onboardingData: Onboarding | null,
  resumeData: ParsedResumeData | null,
  criteria?: JobSearchCriteria
): JobMatchResult {
  if (!onboardingData) {
    return {
      jobs: [],
      totalMatches: 0,
      matchDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
    };
  }

  // Get jobs to match against (sample data for now)
  const jobsToMatch = filterJobs(SAMPLE_JOBS, criteria);

  // Calculate match scores for each job
  const jobsWithScores = jobsToMatch.map(job => {
    const matchScore = calculateJobMatch(job, onboardingData, resumeData);
    return {
      ...job,
      matchPercentage: matchScore.total,
      status: 'new' as const,
    };
  });

  // Sort by match percentage (highest first)
  const sortedJobs = jobsWithScores.sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Calculate distribution
  const distribution = calculateMatchDistribution(sortedJobs);

  return {
    jobs: sortedJobs,
    totalMatches: sortedJobs.length,
    matchDistribution: distribution,
  };
}

// ==================== MATCH SCORE CALCULATION ====================

function calculateJobMatch(
  job: Omit<Job, 'matchPercentage' | 'status'>,
  onboardingData: Onboarding,
  resumeData: ParsedResumeData | null
): MatchScore {
  const breakdown = {
    skills: calculateSkillsMatch(job, onboardingData, resumeData),
    experience: calculateExperienceMatch(job, onboardingData),
    keywords: calculateKeywordMatch(job, onboardingData, resumeData),
    location: calculateLocationMatch(job, onboardingData),
    salary: calculateSalaryMatch(job, onboardingData),
  };

  const total = Object.entries(breakdown).reduce((score, [key, value]) => {
    const weight = MATCH_WEIGHTS[key as keyof typeof MATCH_WEIGHTS];
    return score + (value * weight);
  }, 0);

  return {
    total: Math.round(total),
    breakdown,
  };
}

// ==================== INDIVIDUAL MATCH CALCULATIONS ====================

function calculateSkillsMatch(
  job: Omit<Job, 'matchPercentage' | 'status'>,
  onboardingData: Onboarding,
  resumeData: ParsedResumeData | null
): number {
  const jobSkills = job.tags.map(tag => tag.toLowerCase());
  const userSkills = [
    ...(onboardingData.skills || []),
    ...(resumeData?.skills || []),
  ].map(skill => skill.toLowerCase());

  if (jobSkills.length === 0) return 50; // Neutral score

  const matchedSkills = jobSkills.filter(jobSkill =>
    userSkills.some(userSkill =>
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )
  );

  return (matchedSkills.length / jobSkills.length) * 100;
}

function calculateExperienceMatch(
  job: Omit<Job, 'matchPercentage' | 'status'>,
  onboardingData: Onboarding
): number {
  const jobTitle = job.title.toLowerCase();
  const targetRole = onboardingData.targetRole.toLowerCase();

  // Check if job title matches target role
  const roleKeywords = extractRoleKeywords(targetRole);
  const titleMatch = roleKeywords.some(keyword => jobTitle.includes(keyword));

  // Check experience level match
  const jobLevel = inferJobLevel(job.title);
  const userLevel = onboardingData.experienceLevel;

  let score = 0;

  // Title match (40% of experience score)
  if (titleMatch) {
    score += 40;
  } else {
    // Partial match for related roles
    const relatedRoles = getRelatedRoles(targetRole);
    if (relatedRoles.some(related => jobTitle.includes(related))) {
      score += 20;
    }
  }

  // Experience level match (60% of experience score)
  const levelScore = getExperienceLevelScore(jobLevel, userLevel);
  score += levelScore * 0.6;

  return Math.min(score, 100);
}

function calculateKeywordMatch(
  job: Omit<Job, 'matchPercentage' | 'status'>,
  onboardingData: Onboarding,
  resumeData: ParsedResumeData | null
): number {
  const jobText = `${job.title} ${job.description} ${job.requirements.join(' ')}`.toLowerCase();
  
  const userKeywords = [
    onboardingData.targetRole,
    onboardingData.industry,
    ...(onboardingData.skills || []),
    ...(resumeData?.keywords || []),
  ].map(keyword => keyword.toLowerCase());

  if (userKeywords.length === 0) return 50;

  const matchedKeywords = userKeywords.filter(keyword =>
    jobText.includes(keyword)
  );

  return (matchedKeywords.length / userKeywords.length) * 100;
}

function calculateLocationMatch(
  job: Omit<Job, 'matchPercentage' | 'status'>,
  onboardingData: Onboarding
): number {
  const userWorkType = onboardingData.workType;
  const userCountry = onboardingData.country.toLowerCase();
  const jobLocation = job.location.toLowerCase();

  // Perfect match for remote
  if (userWorkType === 'remote' && job.remote) {
    return 100;
  }

  // User wants remote but job is not remote
  if (userWorkType === 'remote' && !job.remote) {
    return 30;
  }

  // User wants onsite/hybrid and job is in same country
  if (userWorkType !== 'remote' && jobLocation.includes(userCountry)) {
    return 90;
  }

  // Partial location match
  if (userWorkType !== 'remote') {
    return 50;
  }

  return 0;
}

function calculateSalaryMatch(
  job: Omit<Job, 'matchPercentage' | 'status'>,
  onboardingData: Onboarding
): number {
  const userSalaryTarget = onboardingData.salaryTarget;
  
  if (!job.salary.min && !job.salary.max) return 50; // No salary info

  const jobMin = job.salary.min || 0;
  const jobMax = job.salary.max || jobMin * 1.5; // Estimate max if not provided
  const jobMid = (jobMin + jobMax) / 2;

  const userMin = userSalaryTarget.min;
  const userMax = userSalaryTarget.max;
  const userMid = (userMin + userMax) / 2;

  // Calculate overlap percentage
  const overlapStart = Math.max(jobMin, userMin);
  const overlapEnd = Math.min(jobMax, userMax);

  if (overlapEnd >= overlapStart) {
    // There's overlap
    const overlapRange = overlapEnd - overlapStart;
    const userRange = userMax - userMin;
    return (overlapRange / userRange) * 100;
  } else {
    // No overlap, calculate how close they are
    const diff = Math.abs(jobMid - userMid);
    const maxDiff = Math.max(jobMid, userMid);
    return Math.max(0, 100 - (diff / maxDiff) * 100);
  }
}

// ==================== UTILITY FUNCTIONS ====================

function filterJobs(
  jobs: Omit<Job, 'matchPercentage' | 'status'>[],
  criteria?: JobSearchCriteria
): Omit<Job, 'matchPercentage' | 'status'>[] {
  if (!criteria) return jobs;

  return jobs.filter(job => {
    // Keyword filter
    if (criteria.keywords && criteria.keywords.length > 0) {
      const jobText = `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase();
      const hasKeyword = criteria.keywords.some(keyword =>
        jobText.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    // Location filter
    if (criteria.location) {
      const locationMatch = job.location.toLowerCase().includes(criteria.location.toLowerCase());
      if (!locationMatch) return false;
    }

    // Work type filter
    if (criteria.workType) {
      if (criteria.workType === 'remote' && !job.remote) return false;
      if (criteria.workType === 'onsite' && job.remote) return false;
    }

    // Salary filter
    if (criteria.salaryMin && job.salary.max && job.salary.max < criteria.salaryMin) return false;
    if (criteria.salaryMax && job.salary.min && job.salary.min > criteria.salaryMax) return false;

    return true;
  });
}

function calculateMatchDistribution(jobs: Job[]): {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
} {
  return jobs.reduce(
    (distribution, job) => {
      const match = job.matchPercentage || 0;
      if (match >= MATCH_THRESHOLDS.excellent) distribution.excellent++;
      else if (match >= MATCH_THRESHOLDS.good) distribution.good++;
      else if (match >= MATCH_THRESHOLDS.fair) distribution.fair++;
      else distribution.poor++;

      return distribution;
    },
    { excellent: 0, good: 0, fair: 0, poor: 0 }
  );
}

function extractRoleKeywords(role: string): string[] {
  const roleLower = role.toLowerCase();
  const keywords: string[] = [];

  // Role-specific keywords
  const roleMappings: Record<string, string[]> = {
    'software engineer': ['software engineer', 'developer', 'programmer', 'engineer'],
    'frontend developer': ['frontend', 'front-end', 'ui developer', 'web developer'],
    'backend developer': ['backend', 'back-end', 'server developer'],
    'full stack developer': ['full stack', 'full-stack', 'fullstack'],
    'product manager': ['product manager', 'product owner', 'product lead'],
    'data scientist': ['data scientist', 'data analyst', 'machine learning'],
    'designer': ['designer', 'ui designer', 'ux designer', 'graphic designer'],
  };

  for (const [keyRole, words] of Object.entries(roleMappings)) {
    if (roleLower.includes(keyRole)) {
      keywords.push(...words);
    }
  }

  // Also include the role itself
  keywords.push(roleLower);

  return [...new Set(keywords)];
}

function inferJobLevel(jobTitle: string): Onboarding['experienceLevel'] {
  const title = jobTitle.toLowerCase();

  if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
    return 'senior';
  } else if (title.includes('junior') || title.includes('entry') || title.includes('associate')) {
    return 'entry';
  } else if (title.includes('manager') || title.includes('director') || title.includes('vp')) {
    return 'executive';
  } else {
    return 'mid';
  }
}

function getExperienceLevelScore(
  jobLevel: Onboarding['experienceLevel'],
  userLevel: Onboarding['experienceLevel']
): number {
  const levelScores = {
    entry: 0,
    mid: 25,
    senior: 50,
    executive: 75,
  };

  const jobScore = levelScores[jobLevel];
  const userScore = levelScores[userLevel];

  // Perfect match
  if (jobLevel === userLevel) return 100;

  // Close matches
  const diff = Math.abs(jobScore - userScore);
  if (diff <= 25) return 80;
  if (diff <= 50) return 60;
  if (diff <= 75) return 40;

  return 20; // Very different levels
}

function getRelatedRoles(role: string): string[] {
  const roleLower = role.toLowerCase();
  const relatedMappings: Record<string, string[]> = {
    'software engineer': ['developer', 'programmer', 'engineer'],
    'frontend developer': ['ui developer', 'web developer', 'frontend'],
    'backend developer': ['server developer', 'backend', 'api developer'],
    'product manager': ['product owner', 'product lead', 'product'],
    'data scientist': ['data analyst', 'machine learning engineer', 'data'],
  };

  for (const [keyRole, related] of Object.entries(relatedMappings)) {
    if (roleLower.includes(keyRole)) {
      return related;
    }
  }

  return [];
}

// ==================== JOB RECOMMENDATION ENGINE ====================

export function generateJobRecommendations(
  onboardingData: Onboarding,
  jobs: Job[]
): string[] {
  const recommendations: string[] = [];

  if (jobs.length === 0) {
    recommendations.push('Try adjusting your search criteria to find more opportunities');
    return recommendations;
  }

  const excellentMatches = jobs.filter(job => (job.matchPercentage || 0) >= MATCH_THRESHOLDS.excellent);
  const goodMatches = jobs.filter(job => {
    const match = job.matchPercentage || 0;
    return match >= MATCH_THRESHOLDS.good && match < MATCH_THRESHOLDS.excellent;
  });

  if (excellentMatches.length > 0) {
    recommendations.push(`You have ${excellentMatches.length} excellent matches - apply to these first!`);
  }

  if (goodMatches.length > 3) {
    recommendations.push(`Focus on the top 3 good matches to maximize your chances`);
  }

  if (onboardingData.workType === 'remote' && jobs.filter(job => job.remote).length < jobs.length / 2) {
    recommendations.push('Consider expanding your location preferences for more opportunities');
  }

  if (onboardingData.salaryTarget.min > 0) {
    const belowTarget = jobs.filter(job => {
      const jobMax = job.salary.max || 0;
      return jobMax < onboardingData.salaryTarget.min;
    });

    if (belowTarget.length > jobs.length / 2) {
      recommendations.push('Consider adjusting your salary expectations for more opportunities');
    }
  }

  return recommendations;
}

// ==================== JOB STATISTICS ====================

export function getJobStatistics(jobs: Job[]): {
  totalJobs: number;
  averageMatch: number;
  topCompanies: { name: string; count: number }[];
  salaryRanges: { range: string; count: number }[];
  locationDistribution: { location: string; count: number }[];
} {
  const totalJobs = jobs.length;
  const averageMatch = jobs.reduce((sum, job) => sum + (job.matchPercentage || 0), 0) / totalJobs;

  // Top companies
  const companyCounts = jobs.reduce((counts, job) => {
    counts[job.company] = (counts[job.company] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Salary ranges
  const salaryRanges = {
    'Under 80k': 0,
    '80k-120k': 0,
    '120k-160k': 0,
    'Over 160k': 0,
  };

  jobs.forEach(job => {
    const jobMax = job.salary.max || 0;
    if (jobMax < 80000) salaryRanges['Under 80k']++;
    else if (jobMax < 120000) salaryRanges['80k-120k']++;
    else if (jobMax < 160000) salaryRanges['120k-160k']++;
    else salaryRanges['Over 160k']++;
  });

  const salaryRangesArray = Object.entries(salaryRanges)
    .map(([range, count]) => ({ range, count }))
    .filter(item => item.count > 0);

  // Location distribution
  const locationCounts = jobs.reduce((counts, job) => {
    const location = job.remote ? 'Remote' : job.location.split(',')[0];
    counts[location] = (counts[location] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const locationDistribution = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalJobs,
    averageMatch: Math.round(averageMatch),
    topCompanies,
    salaryRanges: salaryRangesArray,
    locationDistribution,
  };
}
