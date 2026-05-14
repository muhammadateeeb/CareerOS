import { ParsedResumeData, Onboarding, ResumeFeedback } from '@/store/dashboardStore';

// ==================== TYPES ====================

export interface ATSScoreResult {
  score: number;
  breakdown: ATSScoreBreakdown;
  feedback: ResumeFeedback[];
  recommendations: string[];
}

export interface ATSScoreBreakdown {
  keywordMatch: {
    score: number;
    maxScore: number;
    details: string[];
  };
  skillsMatch: {
    score: number;
    maxScore: number;
    details: string[];
  };
  formatting: {
    score: number;
    maxScore: number;
    details: string[];
  };
  experienceMatch: {
    score: number;
    maxScore: number;
    details: string[];
  };
  achievements: {
    score: number;
    maxScore: number;
    details: string[];
  };
}

export interface ATSAnalysis {
  readabilityScore: number;
  structureScore: number;
  contentScore: number;
  keywordDensity: Record<string, number>;
  sectionCompleteness: Record<string, boolean>;
}

// ==================== CONSTANTS ====================

const ATS_WEIGHTS = {
  keywordMatch: 0.30,    // 30%
  skillsMatch: 0.25,     // 25%
  formatting: 0.15,      // 15%
  experienceMatch: 0.20,  // 20%
  achievements: 0.10,     // 10%
};

// ==================== ROLE-SPECIFIC KEYWORD DATASETS ====================

const ROLE_KEYWORDS = {
  'Software Engineer': [
    'javascript', 'react', 'typescript', 'api', 'frontend', 'backend', 'node', 'git',
    'python', 'java', 'aws', 'docker', 'kubernetes', 'mongodb', 'postgresql',
    'rest', 'graphql', 'ci/cd', 'agile', 'scrum', 'microservices', 'testing'
  ],
  'Security Analyst': [
    'siem', 'splunk', 'incident response', 'soc', 'threat analysis', 'vulnerability',
    'firewall', 'ids', 'ips', 'malware', 'forensics', 'compliance',
    'risk assessment', 'security policies', 'network security', 'penetration testing'
  ],
  'Product Manager': [
    'product strategy', 'roadmap', 'user stories', 'agile', 'scrum', 'kanban',
    'stakeholder management', 'market research', 'analytics', 'kpi', 'metrics',
    'launch', 'go-to-market', 'user experience', 'a/b testing', 'product lifecycle'
  ],
  'Data Scientist': [
    'python', 'r', 'machine learning', 'statistics', 'data analysis', 'pandas',
    'numpy', 'scikit-learn', 'tensorflow', 'sql', 'tableau', 'power bi',
    'data visualization', 'predictive modeling', 'nlp', 'deep learning', 'algorithms'
  ],
  'DevOps Engineer': [
    'ci/cd', 'jenkins', 'github actions', 'docker', 'kubernetes', 'aws', 'azure',
    'terraform', 'ansible', 'monitoring', 'logging', 'infrastructure', 'automation',
    'cloud', 'microservices', 'deployment', 'scaling', 'reliability', 'uptime'
  ],
  'UX Designer': [
    'figma', 'sketch', 'adobe xd', 'prototyping', 'user research', 'wireframing',
    'user testing', 'usability', 'design systems', 'interaction design', 'visual design',
    'accessibility', 'responsive design', 'mobile design', 'user journey', 'personas'
  ]
};

const TARGET_KEYWORDS = {
  // Common job-related keywords
  general: [
    'experience', 'skills', 'developed', 'managed', 'led', 'created', 'implemented',
    'improved', 'increased', 'decreased', 'reduced', 'optimized', 'achieved',
    'collaborated', 'coordinated', 'designed', 'analyzed', 'maintained', 'supported',
  ],
  technical: [
    'javascript', 'python', 'java', 'react', 'node.js', 'aws', 'docker', 'kubernetes',
    'sql', 'mongodb', 'git', 'agile', 'scrum', 'rest api', 'graphql', 'ci/cd',
  ],
  soft: [
    'communication', 'leadership', 'teamwork', 'problem-solving', 'critical thinking',
    'adaptability', 'creativity', 'time management', 'project management', 'attention to detail',
  ],
};

const FORMATTING_RULES = {
  maxWordCount: 1000,
  minWordCount: 150,
  maxBulletPointsPerSection: 10,
  minBulletPointsPerSection: 3,
  maxSectionLength: 200, // words
};

// ==================== MAIN ATS SCORING FUNCTION ====================

export function calculateATSScore(
  resumeData: ParsedResumeData,
  onboardingData: Onboarding | null
): ATSScoreResult {
  const breakdown: ATSScoreBreakdown = {
    keywordMatch: calculateKeywordMatch(resumeData, onboardingData),
    skillsMatch: calculateSkillsMatch(resumeData, onboardingData),
    formatting: calculateFormattingScore(resumeData),
    experienceMatch: calculateExperienceMatch(resumeData, onboardingData),
    achievements: calculateAchievementsScore(resumeData),
  };

  const totalScore = Object.entries(breakdown).reduce((total, [key, section]) => {
    const weight = ATS_WEIGHTS[key as keyof typeof ATS_WEIGHTS];
    return total + (section.score / section.maxScore) * weight * 100;
  }, 0);

  const feedback = generateATSFeedback(breakdown, resumeData, onboardingData);
  const recommendations = generateSMARTRecommendations(resumeData, totalScore, onboardingData);

  return {
    score: Math.round(Math.min(totalScore, 100)),
    breakdown,
    feedback,
    recommendations,
  };
}

// ==================== KEYWORD MATCH SCORING ====================

// ==================== SEMANTIC KEYWORD NORMALIZATION ====================

const SEMANTIC_MAPPINGS: Record<string, string> = {
  // JavaScript variations
  'js': 'javascript',
  'javascript': 'javascript',
  'reactjs': 'react',
  'react.js': 'react',
  
  // Backend variations
  'node': 'node.js',
  'nodejs': 'node.js',
  'express': 'express.js',
  
  // Database variations
  'postgres': 'postgresql',
  'mysql': 'mysql',
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  
  // Cloud variations
  'aws': 'amazon web services',
  'azure': 'microsoft azure',
  'gcp': 'google cloud platform',
  
  // DevOps variations
  'ci': 'ci/cd',
  'cd': 'ci/cd',
  'continuous integration': 'ci/cd',
  'continuous deployment': 'ci/cd',
};

function normalizeKeyword(keyword: string): string {
  const normalized = keyword.toLowerCase().trim();
  return SEMANTIC_MAPPINGS[normalized] || normalized;
}

function extractKeywordsFromRole(role: string): string[] {
  return ROLE_KEYWORDS[role as keyof typeof ROLE_KEYWORDS] || [];
}

// ==================== ENHANCED KEYWORD MATCHING ====================

function calculateKeywordMatch(
  resumeData: ParsedResumeData,
  onboardingData: Onboarding | null
): { score: number; maxScore: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const maxScore = 30;

  const resumeText = resumeData.rawText.toLowerCase();
  const normalizedResumeWords = resumeData.keywords.map(normalizeKeyword);
  
  // Target role keywords with semantic matching
  if (onboardingData?.targetRole) {
    const roleKeywords = extractKeywordsFromRole(onboardingData.targetRole);
    const normalizedRoleKeywords = roleKeywords.map(normalizeKeyword);
    
    const matchedRoleKeywords = normalizedRoleKeywords.filter(keyword => 
      normalizedResumeWords.some(resumeKeyword => 
        resumeKeyword.includes(keyword) || keyword.includes(resumeKeyword)
      )
    );
    
    score += (matchedRoleKeywords.length / Math.max(normalizedRoleKeywords.length, 1)) * 15;
    details.push(`Role keywords (with semantic matching): ${matchedRoleKeywords.length}/${normalizedRoleKeywords.length} matched`);
  } else {
    score += 5;
    details.push('No target role specified - partial credit applied');
  }

  // Industry keywords
  if (onboardingData?.industry) {
    const industryKeywords = extractKeywordsFromIndustry(onboardingData.industry);
    const normalizedIndustryKeywords = industryKeywords.map(normalizeKeyword);
    
    const matchedIndustryKeywords = normalizedIndustryKeywords.filter(keyword => 
      normalizedResumeWords.some(resumeKeyword => 
        resumeKeyword.includes(keyword) || keyword.includes(resumeKeyword)
      )
    );
    
    score += (matchedIndustryKeywords.length / Math.max(normalizedIndustryKeywords.length, 1)) * 10;
    details.push(`Industry keywords: ${matchedIndustryKeywords.length}/${normalizedIndustryKeywords.length} matched`);
  } else {
    score += 3;
    details.push('No industry specified - partial credit applied');
  }

  // General ATS keywords
  const matchedGeneralKeywords = TARGET_KEYWORDS.general.filter(keyword => 
    normalizedResumeWords.some(resumeKeyword => 
      resumeKeyword.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(resumeKeyword)
    )
  );
  
  score += (matchedGeneralKeywords.length / TARGET_KEYWORDS.general.length) * 5;
  details.push(`General keywords: ${matchedGeneralKeywords.length}/${TARGET_KEYWORDS.general.length} matched`);

  return { score: Math.round(score), maxScore, details };
}

// ==================== SKILLS MATCH SCORING ====================

function calculateSkillsMatch(
  resumeData: ParsedResumeData,
  onboardingData: Onboarding | null
): { score: number; maxScore: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const maxScore = 25;

  const resumeSkills = resumeData.skills.map(skill => skill.toLowerCase());
  const resumeText = resumeData.rawText.toLowerCase();

  // Match with onboarding skills
  if (onboardingData?.skills && onboardingData.skills.length > 0) {
    const onboardingSkills = onboardingData.skills.map(skill => skill.toLowerCase());
    const matchedSkills = onboardingSkills.filter(skill => 
      resumeSkills.some(resumeSkill => resumeSkill.includes(skill) || skill.includes(resumeSkill))
    );
    score += (matchedSkills.length / Math.max(onboardingSkills.length, 1)) * 20;
    details.push(`Skills match: ${matchedSkills.length}/${onboardingSkills.length} matched`);
  } else {
    score += 10;
    details.push('No target skills specified - partial credit applied');
  }

  // Technical skills presence
  const technicalSkillsFound = TARGET_KEYWORDS.technical.filter(skill => 
    resumeText.includes(skill.toLowerCase())
  );
  score += (technicalSkillsFound.length / TARGET_KEYWORDS.technical.length) * 5;
  details.push(`Technical skills: ${technicalSkillsFound.length} found`);

  return { score: Math.round(score), maxScore, details };
}

// ==================== FORMATTING SCORING ====================

function calculateFormattingScore(
  resumeData: ParsedResumeData
): { score: number; maxScore: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const maxScore = 15;

  const text = resumeData.rawText;
  const wordCount = text.split(/\s+/).length;
  const lines = text.split('\n');
  const bulletPoints = lines.filter(line => /^\s*[-•*]\s/.test(line)).length;

  // Word count check
  if (wordCount >= FORMATTING_RULES.minWordCount && wordCount <= FORMATTING_RULES.maxWordCount) {
    score += 5;
    details.push('Word count optimal');
  } else if (wordCount < FORMATTING_RULES.minWordCount) {
    score += 2;
    details.push('Word count too low');
  } else {
    score += 3;
    details.push('Word count too high');
  }

  // Bullet points check
  if (bulletPoints >= 5 && bulletPoints <= 20) {
    score += 5;
    details.push('Good use of bullet points');
  } else if (bulletPoints < 5) {
    score += 2;
    details.push('Not enough bullet points');
  } else {
    score += 3;
    details.push('Too many bullet points');
  }

  // Section structure check
  const hasExperience = resumeData.experience.length > 0;
  const hasEducation = resumeData.education.length > 0;
  const hasSkills = resumeData.skills.length > 0;

  if (hasExperience && hasEducation && hasSkills) {
    score += 5;
    details.push('All key sections present');
  } else {
    const missingSections = [];
    if (!hasExperience) missingSections.push('experience');
    if (!hasEducation) missingSections.push('education');
    if (!hasSkills) missingSections.push('skills');
    score += 2;
    details.push(`Missing sections: ${missingSections.join(', ')}`);
  }

  return { score: Math.round(score), maxScore, details };
}

// ==================== EXPERIENCE MATCH SCORING ====================

function calculateExperienceMatch(
  resumeData: ParsedResumeData,
  onboardingData: Onboarding | null
): { score: number; maxScore: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const maxScore = 20;

  const experience = resumeData.experience;

  // Experience level match
  if (onboardingData?.experienceLevel) {
    const totalExperience = calculateTotalExperience(experience);
    const expectedExperience = getExpectedExperienceYears(onboardingData.experienceLevel);
    
    if (Math.abs(totalExperience - expectedExperience) <= 2) {
      score += 10;
      details.push('Experience level matches target');
    } else if (Math.abs(totalExperience - expectedExperience) <= 4) {
      score += 7;
      details.push('Experience level close to target');
    } else {
      score += 4;
      details.push('Experience level mismatch');
    }
  } else {
    score += 5;
    details.push('No experience level specified - partial credit');
  }

  // Experience relevance
  if (experience.length > 0) {
    const relevantExperience = experience.filter(exp => 
      isExperienceRelevant(exp, onboardingData)
    );
    score += (relevantExperience.length / Math.max(experience.length, 1)) * 10;
    details.push(`Relevant experience: ${relevantExperience.length}/${experience.length} positions`);
  } else {
    score += 0;
    details.push('No experience found');
  }

  return { score: Math.round(score), maxScore, details };
}

// ==================== ACHIEVEMENTS SCORING ====================

function calculateAchievementsScore(
  resumeData: ParsedResumeData
): { score: number; maxScore: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const maxScore = 10;

  const achievements = resumeData.achievements;
  const experience = resumeData.experience;

  // Count achievements with metrics
  const achievementsWithMetrics = achievements.filter(achievement => 
    achievement.metrics && achievement.metrics.length > 0
  );

  // Count experience entries with achievements
  const experienceWithAchievements = experience.filter(exp => 
    exp.achievements && exp.achievements.length > 0
  );

  // Score based on quantified achievements
  if (achievementsWithMetrics.length >= 3) {
    score += 10;
    details.push('Excellent quantified achievements');
  } else if (achievementsWithMetrics.length >= 1) {
    score += 7;
    details.push('Good quantified achievements');
  } else if (experienceWithAchievements.length >= 1) {
    score += 4;
    details.push('Some achievements found');
  } else {
    score += 1;
    details.push('No quantified achievements');
  }

  return { score: Math.round(score), maxScore, details };
}

// ==================== FEEDBACK GENERATION ====================

function generateATSFeedback(
  breakdown: ATSScoreBreakdown,
  resumeData: ParsedResumeData,
  onboardingData: Onboarding | null
): ResumeFeedback[] {
  const feedback: ResumeFeedback[] = [];

  // Keyword feedback with specific recommendations
  if (breakdown.keywordMatch.score < breakdown.keywordMatch.maxScore * 0.7) {
    feedback.push({
      type: 'recommendation',
      category: 'keywords',
      message: onboardingData 
        ? `Include more ${onboardingData.targetRole} keywords like: ${extractKeywordsFromRole(onboardingData.targetRole).slice(0, 3).join(', ')}`
        : 'Add role-specific keywords relevant to your target position',
      priority: 'high'
    });
  }

  // Skills feedback with specific recommendations
  if (breakdown.skillsMatch.score < breakdown.skillsMatch.maxScore * 0.7) {
    feedback.push({
      type: 'recommendation',
      category: 'skills',
      message: 'Highlight technical skills like: React, Node.js, AWS, Docker, Git, and relevant frameworks',
      priority: 'high'
    });
  }

  // Formatting feedback with specific recommendations
  if (breakdown.formatting.score < breakdown.formatting.maxScore * 0.7) {
    const missingItems = [];
    if (!resumeData.formatting.hasEmail) missingItems.push('email address');
    if (!resumeData.formatting.hasPhone) missingItems.push('phone number');
    if (!resumeData.formatting.hasLinkedIn) missingItems.push('LinkedIn URL');
    
    feedback.push({
      type: 'recommendation',
      category: 'formatting',
      message: missingItems.length > 0 
        ? `Add missing contact information: ${missingItems.join(', ')}`
        : 'Improve resume formatting with clear sections and consistent styling',
      priority: 'medium'
    });
  }

  // Experience feedback
  if (breakdown.experienceMatch.score < breakdown.experienceMatch.maxScore * 0.7) {
    feedback.push({
      type: 'recommendation',
      category: 'content',
      message: 'Enhance experience descriptions with specific responsibilities, technologies used, and project outcomes',
      priority: 'medium'
    });
  }

  // Achievements feedback with specific recommendations
  if (breakdown.achievements.score < breakdown.achievements.maxScore * 0.7) {
    feedback.push({
      type: 'recommendation',
      category: 'achievements',
      message: 'Add measurable achievements like: "Improved API response time by 35%", "Reduced costs by $50K", "Managed team of 8 developers"',
      priority: 'high'
    });
  }

  // Add strengths for good scores
  if (breakdown.keywordMatch.score >= breakdown.keywordMatch.maxScore * 0.8) {
    feedback.push({
      type: 'strength',
      category: 'keywords',
      message: 'Excellent keyword alignment with target role requirements',
      priority: 'low'
    });
  }

  if (breakdown.achievements.score >= breakdown.achievements.maxScore * 0.8) {
    feedback.push({
      type: 'strength',
      category: 'achievements',
      message: 'Strong quantifiable achievements with measurable impact',
      priority: 'low'
    });
  }

  return feedback;
}

// ==================== RECOMMENDATIONS ====================

function generateRecommendations(
  breakdown: ATSScoreBreakdown,
  resumeData: ParsedResumeData,
  onboardingData: Onboarding | null
): string[] {
  const recommendations: string[] = [];

  // Keyword recommendations
  if (breakdown.keywordMatch.score < 20) {
    if (onboardingData?.targetRole) {
      recommendations.push(`Add more keywords related to "${onboardingData.targetRole}"`);
    }
    if (onboardingData?.industry) {
      recommendations.push(`Include industry-specific terms for "${onboardingData.industry}"`);
    }
  }

  // Skills recommendations
  if (breakdown.skillsMatch.score < 15) {
    recommendations.push('Expand your skills section with relevant technical and soft skills');
    if (onboardingData?.skills) {
      recommendations.push(`Highlight these key skills: ${onboardingData.skills.slice(0, 3).join(', ')}`);
    }
  }

  // Formatting recommendations
  if (breakdown.formatting.score < 10) {
    const wordCount = resumeData.rawText.split(/\s+/).length;
    if (wordCount < 150) {
      recommendations.push('Add more detail to your resume content');
    } else if (wordCount > 1000) {
      recommendations.push('Condense your resume to be more concise');
    }
    recommendations.push('Use bullet points to highlight achievements');
    recommendations.push('Ensure all key sections (experience, education, skills) are present');
  }

  // Experience recommendations
  if (breakdown.experienceMatch.score < 12) {
    recommendations.push('Add more detail to your work experience');
    recommendations.push('Focus on experience relevant to your target role');
  }

  // Achievements recommendations
  if (breakdown.achievements.score < 5) {
    recommendations.push('Add measurable achievements with numbers and percentages');
    recommendations.push('Quantify your impact with specific metrics');
    recommendations.push('Include results like "increased sales by 25%" or "reduced costs by $10K"');
  }

  // General recommendations
  if (resumeData.skills.length < 5) {
    recommendations.push('Add more skills to showcase your capabilities');
  }

  // LinkedIn recommendation would be checked from onboarding data or resume text
  if (onboardingData && !onboardingData.linkedinUrl) {
    recommendations.push('Consider adding your LinkedIn profile URL');
  }

  return recommendations;
}

// ==================== BAD RESUME DETECTION ====================

interface BadResumeIndicators {
  hasNoMeasurableAchievements: boolean;
  hasWeakSummary: boolean;
  missingContactInfo: boolean;
  noLinkedIn: boolean;
  lowKeywordDensity: boolean;
  weakProjectDescriptions: boolean;
  missingTechnicalSkills: boolean;
  tooShort: boolean;
  tooGeneric: boolean;
}

function detectBadResume(resumeData: ParsedResumeData, onboardingData: Onboarding | null): BadResumeIndicators {
  const indicators: BadResumeIndicators = {
    hasNoMeasurableAchievements: resumeData.achievements.length === 0,
    hasWeakSummary: !resumeData.rawText.includes('summary') && resumeData.rawText.length < 100,
    missingContactInfo: !resumeData.personalInfo.email && !resumeData.personalInfo.phone,
    noLinkedIn: !resumeData.personalInfo.linkedin,
    lowKeywordDensity: resumeData.keywords.length < 10,
    weakProjectDescriptions: resumeData.projects.every(p => p.description.length < 50),
    missingTechnicalSkills: resumeData.skills.filter(s => 
      ['javascript', 'python', 'react', 'aws', 'sql', 'git'].some(tech => 
        s.toLowerCase().includes(tech)
      )
    ).length === 0,
    tooShort: resumeData.rawText.length < 300,
    tooGeneric: resumeData.rawText.toLowerCase().includes('hard worker') && 
                 resumeData.rawText.toLowerCase().includes('team player'),
  };

  return indicators;
}

// ==================== SMART RECOMMENDATION ENGINE ====================

function generateSMARTRecommendations(
  resumeData: ParsedResumeData,
  atsScore: number,
  onboardingData: Onboarding | null
): string[] {
  const recommendations: string[] = [];
  const badIndicators = detectBadResume(resumeData, onboardingData);

  // Actionable recommendations based on specific issues
  if (badIndicators.hasNoMeasurableAchievements) {
    recommendations.push(
      "Add measurable achievements like:\n" +
      "• 'Improved API response time by 35%'\n" +
      "• 'Reduced customer support tickets by 40%'\n" +
      "• 'Managed team of 8 developers, delivering 3 major features'"
    );
  }

  if (badIndicators.missingContactInfo) {
    recommendations.push(
      "Add complete contact information:\n" +
      "• Professional email address\n" +
      "• Phone number\n" +
      "• LinkedIn profile URL"
    );
  }

  if (badIndicators.noLinkedIn && onboardingData?.targetRole !== 'Entry Level') {
    recommendations.push(
      "Add your LinkedIn profile URL - recruiters actively search LinkedIn for candidates"
    );
  }

  if (badIndicators.lowKeywordDensity && onboardingData) {
    const roleKeywords = extractKeywordsFromRole(onboardingData.targetRole);
    recommendations.push(
      `Include more ${onboardingData.targetRole} keywords:\n` +
      roleKeywords.slice(0, 5).map(k => `• ${k}`).join('\n')
    );
  }

  if (badIndicators.missingTechnicalSkills && onboardingData?.targetRole?.includes('Engineer')) {
    recommendations.push(
      "Highlight technical skills:\n" +
      "• Add specific technologies (React, Node.js, AWS)\n" +
      "• Include frameworks and tools\n" +
      "• Mention technical certifications"
    );
  }

  if (atsScore < 60) {
    recommendations.push(
      "Critical improvements needed:\n" +
      "• Add quantifiable achievements\n" +
      "• Include role-specific keywords\n" +
      "• Improve formatting and structure"
    );
  } else if (atsScore >= 60 && atsScore < 80) {
    recommendations.push(
      "Good foundation - enhance with:\n" +
      "• More specific metrics\n" +
      "• Additional technical skills\n" +
      "• Stronger action verbs"
    );
  }

  return recommendations;
}

// ==================== UTILITY FUNCTIONS ====================

function extractKeywordsFromIndustry(industry: string): string[] {
  const industryLower = industry.toLowerCase();
  const keywords: string[] = [];

  const industryKeywords: Record<string, string[]> = {
    'technology': ['technology', 'software', 'it', 'tech', 'digital'],
    'healthcare': ['healthcare', 'medical', 'health', 'patient care'],
    'finance': ['finance', 'financial', 'banking', 'investment', 'fintech'],
    'education': ['education', 'teaching', 'learning', 'academic'],
    'retail': ['retail', 'sales', 'customer service', 'merchandising'],
  };

  for (const [keyIndustry, words] of Object.entries(industryKeywords)) {
    if (industryLower.includes(keyIndustry)) {
      keywords.push(...words);
    }
  }

  return [...new Set(keywords)];
}

function calculateTotalExperience(experience: ParsedResumeData['experience']): number {
  let totalYears = 0;

  for (const exp of experience) {
    if (exp.startDate && exp.endDate) {
      const start = new Date(exp.startDate);
      const end = new Date(exp.endDate);
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalYears += years;
    } else if (exp.startDate) {
      const start = new Date(exp.startDate);
      const now = new Date();
      const years = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalYears += years;
    }
  }

  return Math.round(totalYears * 10) / 10; // Round to 1 decimal place
}

function getExpectedExperienceYears(level: Onboarding['experienceLevel']): number {
  switch (level) {
    case 'entry': return 0.5;
    case 'mid': return 3;
    case 'senior': return 7;
    case 'executive': return 15;
    default: return 3;
  }
}

function isExperienceRelevant(
  experience: ParsedResumeData['experience'][0],
  onboardingData: Onboarding | null
): boolean {
  if (!onboardingData) return true;

  const targetRole = onboardingData.targetRole.toLowerCase();
  const position = experience.position.toLowerCase();
  const description = experience.description.toLowerCase();

  // Check if position or description contains target role keywords
  const roleKeywords = extractKeywordsFromRole(onboardingData.targetRole);
  
  return roleKeywords.some(keyword => 
    position.includes(keyword) || description.includes(keyword)
  );
}

// ==================== ATS ANALYSIS UTILITIES ====================

export function analyzeResumeStructure(resumeData: ParsedResumeData): ATSAnalysis {
  const text = resumeData.rawText;
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/);

  // Readability score (simplified Flesch-Kincaid)
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
  const avgSyllablesPerWord = 1.5; // Simplified
  const readabilityScore = Math.max(0, Math.min(100, 
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  ));

  // Structure score
  const hasAllSections = resumeData.experience.length > 0 && 
                        resumeData.education.length > 0 && 
                        resumeData.skills.length > 0;
  const structureScore = hasAllSections ? 100 : 50;

  // Content score
  const contentScore = Math.min(100, (words.length / 500) * 100);

  // Keyword density
  const keywordDensity: Record<string, number> = {};
  resumeData.keywords.forEach(keyword => {
    const occurrences = (text.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    keywordDensity[keyword] = (occurrences / words.length) * 100;
  });

  // Section completeness
  const sectionCompleteness: Record<string, boolean> = {
    experience: resumeData.experience.length > 0,
    education: resumeData.education.length > 0,
    skills: resumeData.skills.length > 0,
    certifications: resumeData.certifications.length > 0,
    achievements: resumeData.achievements.length > 0,
  };

  return {
    readabilityScore,
    structureScore,
    contentScore,
    keywordDensity,
    sectionCompleteness,
  };
}

export function getATSCategory(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export function getATSCategoryColor(score: number): string {
  const category = getATSCategory(score);
  switch (category) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-blue-600';
    case 'fair': return 'text-yellow-600';
    case 'poor': return 'text-red-600';
  }
}
