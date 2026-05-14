import { 
  ParsedResumeData, 
  ExperienceEntry, 
  EducationEntry, 
  CertificationEntry, 
  AchievementEntry,
  PersonalInfo,
  ProjectEntry,
  FormattingAnalysis
} from '@/store/dashboardStore';
import { cleanResumeText } from '@/services/resume/cleaner';

// ==================== TYPES ====================

export interface ParseResult {
  success: boolean;
  data?: ParsedResumeData;
  error?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: string;
  fileSize?: number;
}

// ==================== CONSTANTS ====================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'application/msword': 'doc',
};

// ==================== VALIDATION ====================

export function validateResumeFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check file type
  const fileType = ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES];
  if (!fileType) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Allowed types: PDF, DOCX, DOC, TXT`,
    };
  }

  return {
    valid: true,
    fileType,
    fileSize: file.size,
  };
}

// ==================== PARSING ENGINE ====================

export async function parseResumeFile(file: File): Promise<ParseResult> {
  try {
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const fileType = validation.fileType!;
    let rawText = '';

    // Extract text based on file type
    switch (fileType) {
      case 'pdf':
        rawText = await parsePDF(file);
        break;
      case 'docx':
        rawText = await parseDOCX(file);
        break;
      case 'doc':
        rawText = await parseDOC(file);
        break;
      case 'txt':
        rawText = await parseTXT(file);
        break;
      default:
        return {
          success: false,
          error: `Unsupported file type: ${fileType}`,
        };
    }

    if (!rawText || rawText.trim().length < 100) {
      return {
        success: false,
        error: 'Resume text too short or could not be extracted. Please ensure your resume contains readable text.',
      };
    }

    // ── Clean / normalise the raw text before parsing ──────────────────────
    const cleanedText = cleanResumeText(rawText);

    // Parse the extracted text into structured data
    const parsedData = parseResumeText(cleanedText);

    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    console.error('Resume parsing error:', error);
    return {
      success: false,
      error: `Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ==================== FILE TYPE PARSERS ====================

async function parsePDF(file: File): Promise<string> {
  const methods = [
    parsePDFWithPDFParse,
    parsePDFWithPDFJS,
    parsePDFWithTextExtraction,
    parsePDFFallback
  ];

  let lastError: Error | null = null;

  for (const method of methods) {
    try {
      console.log(`🔍 Trying PDF parsing method: ${method.name}`);
      const result = await method(file);
      
      if (result && result.trim().length > 50) {
        console.log(`✅ PDF parsing successful with ${method.name}`);
        return result;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown parsing error');
      console.warn(`⚠️ PDF parsing method ${method.name} failed:`, lastError.message);
    }
  }

  throw new Error(`PDF parsing failed with all methods. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Method 1: Enhanced pdf-parse library (primary method)
async function parsePDFWithPDFParse(file: File): Promise<string> {
  try {
    // Dynamic import with type assertion to avoid TypeScript issues
    const pdfParseModule = await import('pdf-parse') as any;
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    if (!pdfParse || typeof pdfParse !== 'function') {
      throw new Error('pdf-parse library not available');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse with enhanced options
    const data = await pdfParse(buffer, {
      normalizeWhitespace: false,
      disableCombineTextItems: false,
      max: 0 // No page limit for resume parsing
    });
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text extracted from PDF - document may be scanned or image-based');
    }
    
    return data.text;
  } catch (error) {
    throw new Error(`pdf-parse failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Method 2: PDF.js (Mozilla's PDF reader)
async function parsePDFWithPDFJS(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    if (!fullText.trim()) {
      throw new Error('No text extracted using PDF.js');
    }
    
    return fullText;
  } catch (error) {
    throw new Error(`PDF.js failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Method 3: Text extraction using browser APIs
async function parsePDFWithTextExtraction(file: File): Promise<string> {
  try {
    // Try to use File API to read as text first (for text-based PDFs)
    const text = await file.text();
    
    if (text && text.trim().length > 50) {
      return text;
    }
    
    throw new Error('Text extraction failed - PDF may be binary format');
  } catch (error) {
    throw new Error(`Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Method 4: Final fallback - basic file reading
async function parsePDFFallback(file: File): Promise<string> {
  try {
    // Last resort - try reading as array buffer and convert to string
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Look for readable text patterns in the binary data
    let text = '';
    for (let i = 0; i < uint8Array.length; i++) {
      const char = String.fromCharCode(uint8Array[i]);
      // Only add readable ASCII characters
      if (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) {
        text += char;
      } else if (char.charCodeAt(0) === 10 || char.charCodeAt(0) === 13) {
        text += '\n';
      }
    }
    
    // Clean up the extracted text
    text = text.replace(/[^\w\s\n\r\t.,;:!?@#$%^&*()_+\-=[\]{}'"`~|\\<>/]/g, ' ');
    text = text.replace(/\s+/g, ' ');
    text = text.trim();
    
    if (text.length < 50) {
      throw new Error('Fallback extraction yielded insufficient text');
    }
    
    return text;
  } catch (error) {
    throw new Error(`Fallback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function parseDOCX(file: File): Promise<string> {
  try {
    const mammoth = (await import('mammoth')).default;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function parseDOC(file: File): Promise<string> {
  // For DOC files, we'll need to convert them first or use a different library
  // For now, we'll return an error suggesting DOCX conversion
  throw new Error('DOC files are not yet supported. Please convert your document to DOCX or PDF format.');
}

async function parseTXT(file: File): Promise<string> {
  try {
    return await file.text();
  } catch (error) {
    throw new Error(`TXT parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ==================== TEXT PARSING LOGIC ====================

function parseResumeText(rawText: string): ParsedResumeData {
  const text = rawText.trim();
  
  // Extract sections
  const sections = extractSections(text);
  
  // Parse each section
  const personalInfo = extractPersonalInfo(text);
  const experience = parseExperience(sections.experience || '');
  const education = parseEducation(sections.education || '');
  const certifications = parseCertifications(sections.certifications || '');
  const skills = extractSkills(sections.skills || '', text);
  const achievements = extractAchievements(text);
  const keywords = extractKeywords(text);
  const projects = parseProjects(sections.projects || '');
  const formatting = analyzeFormatting(text);

  return {
    rawText: text,
    personalInfo,
    skills,
    education,
    experience,
    projects,
    certifications,
    achievements,
    keywords,
    formatting,
  };
}

// ==================== SECTION EXTRACTION ====================

interface ResumeSections {
  experience?: string;
  education?: string;
  skills?: string;
  certifications?: string;
  projects?: string;
  summary?: string;
}

function extractSections(text: string): ResumeSections {
  const sections: ResumeSections = {};

  // Section patterns
  const sectionPatterns = {
    experience: [
      /experience\s*[:\n]/i,
      /work\s+experience\s*[:\n]/i,
      /professional\s+experience\s*[:\n]/i,
      /employment\s*[:\n]/i,
      /career\s*[:\n]/i,
    ],
    education: [
      /education\s*[:\n]/i,
      /academic\s*[:\n]/i,
      /qualifications\s*[:\n]/i,
      /university\s*[:\n]/i,
      /college\s*[:\n]/i,
    ],
    skills: [
      /skills\s*[:\n]/i,
      /technical\s+skills\s*[:\n]/i,
      /competencies\s*[:\n]/i,
      /expertise\s*[:\n]/i,
      /technologies\s*[:\n]/i,
    ],
    certifications: [
      /certifications?\s*[:\n]/i,
      /certificates?\s*[:\n]/i,
      /credentials?\s*[:\n]/i,
      /licenses?\s*[:\n]/i,
    ],
    projects: [
      /projects?\s*[:\n]/i,
      /portfolio\s*[:\n]/i,
    ],
    summary: [
      /summary\s*[:\n]/i,
      /objective\s*[:\n]/i,
      /profile\s*[:\n]/i,
      /about\s*[:\n]/i,
    ],
  };

  // Find section boundaries
  const lines = text.split('\n');
  let currentSection = '';
  let sectionContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this line is a section header
    let foundSection = '';
    for (const [sectionName, patterns] of Object.entries(sectionPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          foundSection = sectionName;
          break;
        }
      }
      if (foundSection) break;
    }

    if (foundSection) {
      // Save previous section
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof ResumeSections] = sectionContent.join('\n').trim();
      }
      
      // Start new section
      currentSection = foundSection;
      sectionContent = [];
    } else if (currentSection && line.length > 0) {
      sectionContent.push(line);
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection as keyof ResumeSections] = sectionContent.join('\n').trim();
  }

  return sections;
}

// ==================== EXPERIENCE PARSING ====================

function parseExperience(experienceText: string): ExperienceEntry[] {
  const experiences: ExperienceEntry[] = [];
  const lines = experienceText.split('\n').filter(line => line.trim().length > 0);
  
  let currentExperience: Partial<ExperienceEntry> | null = null;
  let descriptionLines: string[] = [];

  for (const line of lines) {
    // Check if this line looks like a job title/company line
    if (isJobHeader(line)) {
      // Save previous experience if exists
      if (currentExperience && currentExperience.company) {
        currentExperience.description = descriptionLines.join(' ');
        currentExperience.achievements = extractAchievementsFromDescription(currentExperience.description).map(a => a.title);
        experiences.push(currentExperience as ExperienceEntry);
      }

      // Start new experience
      const parsed = parseJobHeader(line);
      currentExperience = parsed;
      descriptionLines = [];
    } else if (currentExperience) {
      // Add to description
      descriptionLines.push(line.trim());
    }
  }

  // Save last experience
  if (currentExperience && currentExperience.company) {
    currentExperience.description = descriptionLines.join(' ');
    currentExperience.achievements = extractAchievementsFromDescription(currentExperience.description).map(a => a.title);
    experiences.push(currentExperience as ExperienceEntry);
  }

  return experiences;
}

function isJobHeader(line: string): boolean {
  // Look for patterns like: "Company Name - Position" or "Position at Company"
  const patterns = [
    /.+?\s*(?:-|–|at|@)\s*.+/i,
    /.+?\s*\|\s*.+/i,
    /.+?\s*,\s*.+/i,
  ];
  
  return patterns.some(pattern => pattern.test(line));
}

function parseJobHeader(line: string): Partial<ExperienceEntry> {
  // Try to extract company and position
  let company = '';
  let position = '';
  
  // Pattern: "Company - Position"
  const dashMatch = line.match(/^(.+?)\s*(?:-|–)\s*(.+)$/);
  if (dashMatch) {
    company = dashMatch[1].trim();
    position = dashMatch[2].trim();
  } else {
    // Pattern: "Position at Company"
    const atMatch = line.match(/^(.+?)\s+at\s+(.+)$/i);
    if (atMatch) {
      position = atMatch[1].trim();
      company = atMatch[2].trim();
    } else {
      // Fallback: assume the first part is position, second is company
      const parts = line.split(/[,|]/);
      if (parts.length >= 2) {
        position = parts[0].trim();
        company = parts[1].trim();
      }
    }
  }

  return {
    company,
    position,
    current: false, // Will be determined by date parsing
  };
}

// ==================== EDUCATION PARSING ====================

function parseEducation(educationText: string): EducationEntry[] {
  const educations: EducationEntry[] = [];
  const lines = educationText.split('\n').filter(line => line.trim().length > 0);

  for (const line of lines) {
    const education = parseEducationLine(line);
    if (education) {
      educations.push(education);
    }
  }

  return educations;
}

function parseEducationLine(line: string): EducationEntry | null {
  // Look for degree patterns
  const degreePatterns = [
    /(.+?)\s*(?:Bachelor|Master|PhD|Associate|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Ph\.D\.)/i,
    /(.+?)\s*(?:University|College|Institute)/i,
  ];

  for (const pattern of degreePatterns) {
    const match = line.match(pattern);
    if (match) {
      return {
        institution: match[1].trim(),
        degree: line.trim(),
        field: '', // Would need more sophisticated parsing
      };
    }
  }

  return null;
}

// ==================== CERTIFICATIONS PARSING ====================

function parseCertifications(certificationsText: string): CertificationEntry[] {
  const certifications: CertificationEntry[] = [];
  const lines = certificationsText.split('\n').filter(line => line.trim().length > 0);

  for (const line of lines) {
    const certification = parseCertificationLine(line);
    if (certification) {
      certifications.push(certification);
    }
  }

  return certifications;
}

function parseCertificationLine(line: string): CertificationEntry | null {
  // Look for certification patterns
  const patterns = [
    /^(.+?)\s+(?:Certified|Certificate|Certification)/i,
    /^(.+?)\s+\|\s*(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      return {
        name: match[1].trim(),
        issuer: match[2]?.trim() || '',
      };
    }
  }

  return null;
}

// ==================== SKILLS EXTRACTION ====================

function extractSkills(skillsText: string, fullText: string): string[] {
  const skills: Set<string> = new Set();

  // Extract from skills section
  if (skillsText) {
    const skillsSection = extractSkillsFromText(skillsText);
    skillsSection.forEach(skill => skills.add(skill));
  }

  // Extract common technical skills from full text
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'Git', 'Linux', 'REST API', 'GraphQL', 'Machine Learning', 'Data Science', 'DevOps',
    'Agile', 'Scrum', 'JIRA', 'Confluence', 'Slack', 'Microsoft Office', 'Excel', 'PowerPoint',
  ];

  commonSkills.forEach(skill => {
    if (fullText.toLowerCase().includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  return Array.from(skills);
}

function extractSkillsFromText(text: string): string[] {
  const skills: string[] = [];

  // Split by common delimiters
  const delimiters = [',', ';', '•', '·', '|', '\n'];
  let cleanText = text;

  delimiters.forEach(delimiter => {
    cleanText = cleanText.replace(new RegExp(delimiter, 'g'), ',');
  });

  const parts = cleanText.split(',').map(part => part.trim()).filter(part => part.length > 0);

  parts.forEach(part => {
    if (part.length <= 50 && !part.includes('.')) { // Likely a skill, not a sentence
      skills.push(part);
    }
  });

  return skills;
}

// ==================== ACHIEVEMENTS EXTRACTION ====================

function extractAchievements(text: string): AchievementEntry[] {
  const achievements: AchievementEntry[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const achievement = extractAchievementFromLine(line);
    if (achievement) {
      achievements.push(achievement);
    }
  }

  return achievements;
}

function extractAchievementFromLine(line: string): AchievementEntry | null {
  // Enhanced achievement detection for measurable impact
  const achievementPatterns = [
    // Percentage improvements
    /(\d+)%?\s*(?:increase|decrease|reduction|growth|improvement|improved|reduced|decreased|grew|declined)/i,
    // Currency/money impact
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|thousand|k|b|m|t)?/i,
    /(?:saved|generated|increased|reduced|cost|budgeted|spent)\s+\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    // Time-based achievements
    /(?:reduced|decreased|improved|optimized|saved|increased)\s+.*?\s+(?:time|hours|days|weeks|months)\s+by\s+(\d+)/i,
    /(\d+)\s+(?:years?|months?|weeks?|days?)\s+(?:experience|work|tenure)/i,
    // Impact verbs with numbers
    /(?:managed|led|supervised|oversaw|coordinated|mentored|trained|hired|built|created|developed|launched|implemented|deployed)\s+(\d+)\s+(?:people|teams|projects|initiatives|campaigns|products|features|applications|systems|processes)/i,
    // Scale achievements
    /(?:scaled|grew|expanded|increased|reached)\s+.*?\s+(?:to|by)\s+(\d+)%?/i,
    /(?:served|supported|handled|processed|managed|resolved)\s+(\d+)\s+(?:customers|clients|tickets|requests|applications|transactions|orders)/i,
    // Efficiency improvements
    /(?:improved|optimized|increased|reduced|decreased|accelerated|streamlined)\s+.*?\s+(?:by|to)\s+(\d+)%?/i,
    // Quality metrics
    /(?:achieved|reached|maintained|secured|gained)\s+(\d+)%?\s+(?:accuracy|success|rate|quality|compliance|adoption|engagement|satisfaction)/i,
  ];

  for (const pattern of achievementPatterns) {
    if (pattern.test(line)) {
      const metrics = extractMetrics(line);
      return {
        title: line.trim(),
        description: line.trim(),
        metrics,
      };
    }
  }

  return null;
}

function extractAchievementsFromDescription(description: string): AchievementEntry[] {
  const achievements: AchievementEntry[] = [];
  const sentences = description.split(/[.!?]/).filter(s => s.trim().length > 0);

  for (const sentence of sentences) {
    const achievement = extractAchievementFromLine(sentence);
    if (achievement) {
      achievements.push(achievement);
    }
  }

  return achievements;
}

function extractMetrics(text: string): AchievementEntry['metrics'] {
  const metrics: AchievementEntry['metrics'] = [];

  // Percentage metrics
  const percentageMatches = text.match(/(\d+)%/g);
  if (percentageMatches) {
    percentageMatches.forEach(match => {
      const value = match.replace('%', '');
      metrics.push({
        value: `${value}%`,
        context: text.substring(Math.max(0, text.indexOf(match) - 20), text.indexOf(match) + 20),
      });
    });
  }

  // Currency metrics
  const currencyMatches = text.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
  if (currencyMatches) {
    currencyMatches.forEach(match => {
      metrics.push({
        value: match,
        context: text.substring(Math.max(0, text.indexOf(match) - 20), text.indexOf(match) + 20),
      });
    });
  }

  // Time metrics
  const timeMatches = text.match(/(\d+)\s+(years?|months?|weeks?|days?)/gi);
  if (timeMatches) {
    timeMatches.forEach(match => {
      metrics.push({
        value: match,
        context: text.substring(Math.max(0, text.indexOf(match) - 20), text.indexOf(match) + 20),
      });
    });
  }

  return metrics;
}

// ==================== PERSONAL INFO EXTRACTION ====================

function extractPersonalInfo(text: string): PersonalInfo {
  const personalInfo: PersonalInfo = {};
  
  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
  if (emailMatch) personalInfo.email = emailMatch[0];
  
  // Extract phone
  const phoneMatch = text.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g);
  if (phoneMatch) personalInfo.phone = phoneMatch[0];
  
  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/gi);
  if (linkedinMatch) personalInfo.linkedin = linkedinMatch[0];
  
  // Extract GitHub
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9-]+/gi);
  if (githubMatch) personalInfo.github = githubMatch[0];
  
  // Extract name (simplified - usually at top of resume)
  const lines = text.split('\n').slice(0, 5);
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.length > 5 && !cleanLine.includes('@') && !cleanLine.includes('http')) {
      personalInfo.name = cleanLine;
      break;
    }
  }
  
  return personalInfo;
}

// ==================== PROJECTS EXTRACTION ====================

function parseProjects(projectsText: string): ProjectEntry[] {
  const projects: ProjectEntry[] = [];
  const lines = projectsText.split('\n').filter(line => line.trim().length > 0);
  
  for (const line of lines) {
    if (line.includes('http') || line.includes('github') || line.includes(' deployed')) {
      const project: ProjectEntry = {
        name: line.split(':')[0]?.trim() || line.trim(),
        description: line.trim(),
        technologies: extractTechnologies(line),
      };
      projects.push(project);
    }
  }
  
  return projects;
}

function extractTechnologies(text: string): string[] {
  const techStack = [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'node', 'python', 'java',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'mongodb', 'postgresql',
    'mysql', 'redis', 'graphql', 'rest', 'api', 'git', 'ci/cd', 'webpack'
  ];
  
  return techStack.filter(tech => 
    text.toLowerCase().includes(tech.toLowerCase())
  );
}

// ==================== FORMATTING ANALYSIS ====================

function analyzeFormatting(text: string): FormattingAnalysis {
  return {
    hasEmail: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text),
    hasPhone: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/.test(text),
    hasLinkedIn: /linkedin\.com\/in\/[a-zA-Z0-9-]+/i.test(text),
    hasSections: /(experience|education|skills|projects?)/i.test(text),
    pagesEstimated: Math.ceil(text.length / 2000), // Rough estimate
  };
}

// ==================== KEYWORDS EXTRACTION ====================

function extractKeywords(text: string): string[] {
  const keywords: Set<string> = new Set();

  // Common industry keywords
  const industryKeywords = [
    'leadership', 'management', 'strategy', 'development', 'design', 'analysis', 'research',
    'marketing', 'sales', 'customer', 'product', 'project', 'team', 'collaboration', 'communication',
    'innovation', 'optimization', 'performance', 'quality', 'security', 'compliance', 'integration',
    'automation', 'deployment', 'maintenance', 'support', 'training', 'documentation', 'testing',
  ];

  // Technical keywords
  const technicalKeywords = [
    'frontend', 'backend', 'full-stack', 'database', 'api', 'microservices', 'cloud', 'devops',
    'agile', 'scrum', 'waterfall', 'ci/cd', 'version control', 'unit testing', 'integration testing',
  ];

  const allKeywords = [...industryKeywords, ...technicalKeywords];

  allKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      keywords.add(keyword);
    }
  });

  return Array.from(keywords);
}

// ==================== UTILITY FUNCTIONS ====================

export function generateResumeId(): string {
  return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isResumeTextValid(text: string): boolean {
  if (!text || text.trim().length < 100) return false;
  
  // Check for common resume indicators
  const resumeIndicators = [
    /experience/i,
    /education/i,
    /skills?/i,
    /work\s+history/i,
    /employment/i,
    /qualification/i,
  ];

  const indicatorCount = resumeIndicators.reduce((count, pattern) => {
    return count + (pattern.test(text) ? 1 : 0);
  }, 0);

  return indicatorCount >= 2; // At least 2 resume indicators
}
