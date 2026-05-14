/**
 * CareerOS Resume Parser
 * src/services/resume/parser.ts
 *
 * Converts raw resume text into structured, ATS-ready data.
 * Pure TypeScript — no external APIs, no UI imports, no side effects.
 *
 * Entry point:
 *   parseResume(resumeText: string): ParsedResume
 */

// ─── Public type ──────────────────────────────────────────────────────────────

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: string[];
}

export interface ExperienceEntry {
  company?: string;
  role?: string;
  duration?: string;
  achievements: string[];
}

export interface EducationEntry {
  degree?: string;
  institution?: string;
}

export interface ProjectEntry {
  title?: string;
  technologies: string[];
  description?: string;
}

// ─── Internal skill dataset ───────────────────────────────────────────────────
// Each entry: [canonical display name, ...aliases / alternate spellings]
// All matching is done case-insensitively against the full resume text.

const SKILL_DEFINITIONS: [string, ...string[]][] = [
  // ── Web / Frontend ──────────────────────────────────────────────────────
  ["React", "react.js", "reactjs"],
  ["Next.js", "nextjs", "next js"],
  ["Vue.js", "vue", "vuejs", "vue.js"],
  ["Angular", "angularjs", "angular.js"],
  ["TypeScript", "ts"],
  ["JavaScript", "js", "es6", "es2015", "ecmascript"],
  ["HTML", "html5"],
  ["CSS", "css3", "sass", "scss", "less"],
  ["Tailwind CSS", "tailwind"],
  ["Redux", "redux toolkit"],
  ["GraphQL"],
  ["REST API", "restful api", "rest apis", "restful"],
  ["Webpack", "vite", "parcel"],

  // ── Backend ─────────────────────────────────────────────────────────────
  ["Node.js", "nodejs", "node js"],
  ["Express.js", "express", "expressjs"],
  ["Python"],
  ["Django", "django rest framework", "drf"],
  ["FastAPI"],
  ["Flask"],
  ["Java"],
  ["Spring Boot", "spring framework", "spring"],
  ["Go", "golang"],
  ["Rust"],
  ["C#", "csharp", "c sharp"],
  ["PHP", "laravel", "symfony"],
  ["Ruby", "ruby on rails", "rails"],

  // ── Databases ────────────────────────────────────────────────────────────
  ["SQL", "mysql", "mariadb"],
  ["PostgreSQL", "postgres"],
  ["MongoDB", "mongo"],
  ["Redis"],
  ["Elasticsearch", "elastic search"],
  ["SQLite"],
  ["DynamoDB"],
  ["Cassandra"],
  ["Firebase"],
  ["Supabase"],

  // ── Cloud & Infrastructure ───────────────────────────────────────────────
  ["AWS", "amazon web services", "amazon aws"],
  ["Azure", "microsoft azure"],
  ["GCP", "google cloud", "google cloud platform"],
  ["Docker"],
  ["Kubernetes", "k8s"],
  ["Terraform"],
  ["Ansible"],
  ["Jenkins"],
  ["GitHub Actions", "github action"],
  ["GitLab CI", "gitlab ci/cd"],
  ["CI/CD", "continuous integration", "continuous deployment", "continuous delivery"],
  ["Linux", "ubuntu", "debian", "centos", "rhel"],
  ["Nginx"],
  ["Apache"],
  ["Serverless", "aws lambda", "lambda functions"],

  // ── Cybersecurity ────────────────────────────────────────────────────────
  ["SIEM", "security information and event management"],
  ["Splunk"],
  ["Burp Suite", "burpsuite"],
  ["Nmap"],
  ["Wireshark"],
  ["Metasploit"],
  ["Kali Linux", "kali"],
  ["Penetration Testing", "pen testing", "pentest", "pentesting"],
  ["Vulnerability Assessment", "vulnerability scanning"],
  ["Incident Response", "incident handling"],
  ["Threat Intelligence", "threat hunting"],
  ["Firewall", "palo alto", "fortinet", "checkpoint"],
  ["IDS/IPS", "ids", "ips", "intrusion detection", "intrusion prevention"],
  ["MITRE ATT&CK", "mitre attack", "mitre attck"],
  ["Zero Trust", "zero-trust"],
  ["SOC", "security operations center", "security operations"],
  ["OSINT"],
  ["Malware Analysis", "malware reverse engineering"],
  ["Digital Forensics", "forensics"],
  ["Encryption", "cryptography", "tls", "ssl"],
  ["NIST", "nist framework"],
  ["ISO 27001", "iso27001"],
  ["GDPR"],
  ["HIPAA"],
  ["PCI DSS", "pci-dss"],

  // ── AI / ML / Data ───────────────────────────────────────────────────────
  ["Machine Learning", "ml"],
  ["Deep Learning", "dl"],
  ["TensorFlow", "tensorflow 2"],
  ["PyTorch"],
  ["Scikit-learn", "sklearn", "scikit learn"],
  ["Pandas"],
  ["NumPy", "numpy"],
  ["Jupyter", "jupyter notebook", "jupyter lab"],
  ["NLP", "natural language processing"],
  ["Computer Vision", "cv", "image recognition"],
  ["LLM", "large language model", "gpt", "llama", "mistral"],
  ["LangChain", "langchain"],
  ["Hugging Face", "huggingface"],
  ["MLOps", "ml ops"],
  ["Data Science"],
  ["Data Analysis", "data analytics"],
  ["Tableau"],
  ["Power BI", "powerbi"],
  ["Apache Spark", "spark", "pyspark"],
  ["Hadoop"],

  // ── DevOps / SRE ─────────────────────────────────────────────────────────
  ["Prometheus"],
  ["Grafana"],
  ["Datadog"],
  ["New Relic"],
  ["ELK Stack", "elk", "elasticsearch logstash kibana"],
  ["Helm"],
  ["ArgoCD", "argo cd"],
  ["Vault", "hashicorp vault"],

  // ── Design ───────────────────────────────────────────────────────────────
  ["Figma"],
  ["Sketch"],
  ["Adobe XD", "adobexd"],
  ["Photoshop", "adobe photoshop"],
  ["Illustrator", "adobe illustrator"],
  ["UI/UX", "ux design", "ui design", "user experience", "user interface"],
  ["Wireframing", "wireframes"],
  ["Prototyping"],

  // ── Project / Process ────────────────────────────────────────────────────
  ["Agile"],
  ["Scrum"],
  ["Kanban"],
  ["JIRA", "jira software"],
  ["Confluence"],
  ["Git", "github", "gitlab", "bitbucket"],
  ["Microservices", "microservice architecture"],
  ["System Design"],
  ["API Design"],

  // ── Business / Marketing ─────────────────────────────────────────────────
  ["SEO", "search engine optimization"],
  ["Google Analytics", "ga4"],
  ["HubSpot", "hubspot crm"],
  ["Salesforce"],
  ["Excel", "microsoft excel", "google sheets"],
  ["SQL Server", "mssql", "t-sql"],
];

// ─── Internal certification dataset ──────────────────────────────────────────
// Each entry: [canonical name, ...patterns to match in text]

const CERT_DEFINITIONS: [string, ...string[]][] = [
  // Cybersecurity
  ["CEH", "certified ethical hacker"],
  ["OSCP", "offensive security certified professional"],
  ["CISSP", "certified information systems security professional"],
  ["CompTIA Security+", "security+", "security plus", "comptia security"],
  ["CompTIA Network+", "network+", "network plus", "comptia network"],
  ["CompTIA CySA+", "cysa+", "cybersecurity analyst"],
  ["CompTIA PenTest+", "pentest+"],
  ["CompTIA A+", "comptia a+"],
  ["CISM", "certified information security manager"],
  ["CISA", "certified information systems auditor"],
  ["GIAC GSEC", "gsec"],
  ["GIAC GPEN", "gpen"],
  ["GIAC GCIH", "gcih"],
  ["eJPT", "ejpt", "ejptv2"],
  ["PNPT", "practical network penetration tester"],
  // AWS
  ["AWS Certified Solutions Architect", "aws solutions architect", "aws-saa", "aws saa-c03"],
  ["AWS Certified Developer", "aws developer associate", "aws-dva"],
  ["AWS Certified SysOps", "aws sysops"],
  ["AWS Certified DevOps Engineer", "aws devops professional"],
  ["AWS Certified Cloud Practitioner", "aws cloud practitioner", "aws-clf"],
  // Google Cloud
  ["Google Cloud Professional", "gcp professional", "google professional cloud architect"],
  ["Google Associate Cloud Engineer", "google ace", "associate cloud engineer"],
  ["Google Cloud Digital Leader", "cloud digital leader"],
  // Azure
  ["Azure Fundamentals", "az-900", "az900"],
  ["Azure Administrator", "az-104", "az104"],
  ["Azure Developer", "az-204", "az204"],
  ["Azure Solutions Architect", "az-305", "az305"],
  ["Azure Security Engineer", "az-500", "az500"],
  // Cisco
  ["CCNA", "cisco certified network associate"],
  ["CCNP", "cisco certified network professional"],
  ["CCIE", "cisco certified internetwork expert"],
  // Other
  ["PMP", "project management professional"],
  ["Certified Scrum Master", "csm", "scrum master certified"],
  ["CPA", "certified public accountant"],
  ["CFA", "chartered financial analyst"],
  ["Google Analytics Certified", "google analytics certification"],
  ["HubSpot Certified", "hubspot certification"],
  ["Kubernetes CKA", "cka", "certified kubernetes administrator"],
  ["Kubernetes CKAD", "ckad", "certified kubernetes application developer"],
  ["Terraform Associate", "hashicorp terraform associate"],
  ["Docker Certified Associate", "dca"],
];

// ─── Section heading patterns ─────────────────────────────────────────────────
// Order matters: more specific patterns first.

type SectionKey =
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "projects"
  | "summary";

const SECTION_PATTERNS: Record<SectionKey, RegExp> = {
  experience: /^(work\s+experience|professional\s+experience|employment(\s+history)?|career(\s+history)?|experience)[\s:]*$/i,
  education:  /^(education(\s+&\s+training)?|academic(\s+background)?|qualifications?|degrees?)[\s:]*$/i,
  skills:     /^(technical\s+skills?|core\s+competenc(y|ies)|skills?(\s+&\s+expertise)?|technologies|tools(\s+&\s+technologies)?)[\s:]*$/i,
  certifications: /^(certifications?|certificates?|credentials?|licenses?\s*&\s*certifications?|professional\s+certifications?)[\s:]*$/i,
  projects:   /^(projects?|personal\s+projects?|portfolio|side\s+projects?|open[\s-]source)[\s:]*$/i,
  summary:    /^(summary|professional\s+summary|objective|profile|about(\s+me)?)[\s:]*$/i,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Trim and collapse internal whitespace. */
function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** True if a line looks like a section heading (short, no sentence punctuation). */
function isSectionHeading(line: string): SectionKey | null {
  const t = clean(line);
  if (t.length === 0 || t.length > 60) return null;
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS) as [SectionKey, RegExp][]) {
    if (pattern.test(t)) return key;
  }
  return null;
}

/** Split raw text into labelled sections. Lines before the first heading go to "header". */
function splitSections(text: string): Record<string, string[]> {
  const lines = text.split(/\r?\n/);
  const sections: Record<string, string[]> = { header: [] };
  let current: string = "header";

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = isSectionHeading(line);
    if (heading) {
      current = heading;
      if (!sections[current]) sections[current] = [];
    } else {
      if (!sections[current]) sections[current] = [];
      sections[current].push(line);
    }
  }

  return sections;
}

/** True if a line is a bullet point. */
function isBullet(line: string): boolean {
  return /^[\s]*[-•*▪◦→>·]\s+/.test(line);
}

/** Strip bullet marker from a line. */
function stripBullet(line: string): string {
  return clean(line.replace(/^[\s]*[-•*▪◦→>·]\s+/, ""));
}

/** True if a line contains a measurable achievement signal. */
function isAchievementLine(line: string): boolean {
  return (
    /\d+\s*%/.test(line) ||                                          // percentage
    /\$\s*[\d,]+/.test(line) ||                                      // currency
    /\b\d[\d,]*\s*(x|k|m|b|million|thousand|billion)\b/i.test(line) || // scale
    /\b(increased?|decreased?|reduced?|improved?|grew|saved?|generated?|cut|boosted?|accelerated?|optimized?|streamlined?)\b.*\d/i.test(line) || // verb + number
    /\b\d+\s*(users?|customers?|clients?|engineers?|developers?|people|team members?|tickets?|requests?|transactions?|deployments?|services?|systems?|applications?)\b/i.test(line) // count + noun
  );
}

// ─── 1. Contact info extraction ───────────────────────────────────────────────

function extractName(headerLines: string[]): string | undefined {
  // The name is almost always the very first non-empty line of the resume.
  // We reject lines that look like contact info, URLs, or job titles alone.
  const contactish = /[@()\d+\-./]|http|linkedin|github|www\./i;
  const titleish   = /^(software|senior|junior|lead|principal|staff|engineer|developer|analyst|manager|director|designer|consultant|architect)/i;

  for (const raw of headerLines) {
    const line = clean(raw);
    if (!line || line.length < 3) continue;
    if (contactish.test(line)) continue;
    // Must look like a name: 2–4 capitalised words, no digits
    if (/^[A-Z][a-zA-Z'-]+(\s+[A-Z][a-zA-Z'-]+){1,3}$/.test(line)) return line;
    // Fallback: first short line that isn't obviously a title keyword
    if (line.length <= 50 && !titleish.test(line) && !/\d/.test(line)) return line;
  }
  return undefined;
}

function extractEmail(text: string): string | undefined {
  const m = text.match(/\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/);
  return m ? m[0].toLowerCase() : undefined;
}

function extractPhone(text: string): string | undefined {
  // Matches international and local formats: +1 (555) 123-4567, 555.123.4567, etc.
  const m = text.match(
    /(\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/
  );
  return m ? clean(m[0]) : undefined;
}

function extractLinkedIn(text: string): string | undefined {
  // Capture the full URL or just the path
  const m = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_\-%.]+\/?/i
  );
  return m ? m[0].replace(/\/$/, "") : undefined;
}

// ─── 2. Skills extraction ─────────────────────────────────────────────────────

/**
 * Build a lookup structure once at module load:
 * alias (lowercase) → canonical display name
 */
const SKILL_ALIAS_MAP = new Map<string, string>();

for (const [canonical, ...aliases] of SKILL_DEFINITIONS) {
  SKILL_ALIAS_MAP.set(canonical.toLowerCase(), canonical);
  for (const alias of aliases) {
    SKILL_ALIAS_MAP.set(alias.toLowerCase(), canonical);
  }
}

/**
 * Scan the full resume text for every known skill.
 * Uses word-boundary matching so "Go" doesn't match "Google".
 * Returns deduplicated canonical names, sorted alphabetically.
 */
function extractSkills(fullText: string, skillsSectionText: string): string[] {
  const found = new Set<string>();
  const lower = fullText.toLowerCase();

  for (const [alias, canonical] of SKILL_ALIAS_MAP) {
    // Escape special regex chars in the alias
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Use word boundaries; for short tokens (≤2 chars) require surrounding space/punctuation
    const boundary = alias.length <= 2 ? `(?<![a-z])${escaped}(?![a-z])` : `\\b${escaped}\\b`;
    try {
      if (new RegExp(boundary, "i").test(lower)) {
        found.add(canonical);
      }
    } catch {
      // Malformed regex edge case — skip
    }
  }

  // Also parse the skills section as a delimited list to catch free-text skills
  // not in our dataset (e.g. niche tools the user typed)
  if (skillsSectionText) {
    const parts = skillsSectionText
      .split(/[,;|\n•·▪◦\t]/)
      .map(clean)
      .filter((p) => p.length >= 2 && p.length <= 50 && !/\s{3,}/.test(p));

    for (const part of parts) {
      // Only add if it looks like a skill token (no full sentences)
      if (!/[.!?]/.test(part) && part.split(" ").length <= 5) {
        // Check if it maps to a known canonical name
        const known = SKILL_ALIAS_MAP.get(part.toLowerCase());
        if (known) {
          found.add(known);
        } else if (part.length >= 2) {
          // Add as-is (free-text skill from the skills section)
          found.add(part);
        }
      }
    }
  }

  return [...found].sort((a, b) => a.localeCompare(b));
}

// ─── 3. Experience parsing ────────────────────────────────────────────────────

/**
 * Duration patterns:
 *   Jan 2020 – Mar 2022
 *   2019 - Present
 *   June 2021 to Current
 *   03/2018 – 07/2020
 */
const DURATION_RE =
  /(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?\d{4}\s*(?:[-–—]|to)\s*(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?\d{4}|(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?\d{4}\s*(?:[-–—]|to)\s*(?:present|current|now|today)|(?:0?[1-9]|1[0-2])\/\d{4}\s*[-–—]\s*(?:(?:0?[1-9]|1[0-2])\/\d{4}|present|current)/gi;

/**
 * Known role title keywords — used to distinguish a role line from a company line.
 * A line is treated as a role header if it contains one of these words.
 */
const ROLE_KEYWORDS =
  /\b(engineer|developer|analyst|manager|director|designer|consultant|architect|specialist|lead|head|officer|coordinator|administrator|associate|intern|scientist|researcher|writer|editor|strategist|executive|president|vp|cto|ceo|cfo|coo|founder|co-founder)\b/i;

interface RawExperienceBlock {
  headerLines: string[];
  bodyLines: string[];
}

/** Group experience section lines into blocks separated by role headers. */
function groupExperienceBlocks(lines: string[]): RawExperienceBlock[] {
  const blocks: RawExperienceBlock[] = [];
  let current: RawExperienceBlock | null = null;

  for (const raw of lines) {
    const line = clean(raw);
    if (!line) continue;

    const hasDuration = DURATION_RE.test(line);
    // Reset lastIndex since DURATION_RE is global
    DURATION_RE.lastIndex = 0;

    const looksLikeHeader =
      hasDuration ||
      ROLE_KEYWORDS.test(line) ||
      // Short line with title-case words and no sentence punctuation
      (/^[A-Z]/.test(line) && line.length < 80 && !/[.!?]$/.test(line) && !isBullet(raw));

    if (looksLikeHeader && !isBullet(raw)) {
      if (current) blocks.push(current);
      current = { headerLines: [line], bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(raw);
    } else {
      // Lines before any header — start a block
      current = { headerLines: [line], bodyLines: [] };
    }
  }

  if (current) blocks.push(current);
  return blocks;
}

/**
 * From a block's header lines, extract role, company, and duration.
 *
 * Common formats:
 *   Software Engineer | Acme Corp | Jan 2021 – Present
 *   Senior Developer — TechCo (2019–2022)
 *   Acme Corp\nSoftware Engineer\nJan 2020 – Dec 2021
 *   Software Engineer at Acme Corp, 2020–2022
 */
function parseExperienceHeader(headerLines: string[]): {
  role?: string;
  company?: string;
  duration?: string;
} {
  const joined = headerLines.join(" | ");

  // Extract duration first
  const durationMatch = joined.match(DURATION_RE);
  DURATION_RE.lastIndex = 0;
  const duration = durationMatch ? clean(durationMatch[0]) : undefined;

  // Remove duration from the string to make role/company parsing cleaner
  const withoutDuration = duration
    ? joined.replace(duration, "").replace(/[()[\]]/g, "").trim()
    : joined;

  let role: string | undefined;
  let company: string | undefined;

  // Pattern: "Role at Company" or "Role @ Company"
  const atMatch = withoutDuration.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
  if (atMatch) {
    role    = clean(atMatch[1]);
    company = clean(atMatch[2]);
    return { role, company, duration };
  }

  // Pattern: "Role | Company" or "Role — Company" or "Role - Company"
  const sepMatch = withoutDuration.match(/^(.+?)\s*[|—–\-]\s*(.+)$/);
  if (sepMatch) {
    const left  = clean(sepMatch[1]);
    const right = clean(sepMatch[2]);
    // Whichever part contains a role keyword is the role
    if (ROLE_KEYWORDS.test(left)) {
      role    = left;
      company = right;
    } else if (ROLE_KEYWORDS.test(right)) {
      role    = right;
      company = left;
    } else {
      // Default: left = role, right = company
      role    = left;
      company = right;
    }
    return { role, company, duration };
  }

  // Pattern: two separate header lines
  if (headerLines.length >= 2) {
    const l1 = clean(headerLines[0]);
    const l2 = clean(headerLines[1]);
    if (ROLE_KEYWORDS.test(l1)) {
      role    = l1;
      company = l2;
    } else if (ROLE_KEYWORDS.test(l2)) {
      role    = l2;
      company = l1;
    } else {
      role    = l1;
      company = l2;
    }
    return { role, company, duration };
  }

  // Single line — treat as role only
  role = clean(withoutDuration);
  return { role, company: undefined, duration };
}

function parseExperience(lines: string[]): ExperienceEntry[] {
  const blocks = groupExperienceBlocks(lines);
  const entries: ExperienceEntry[] = [];

  for (const block of blocks) {
    if (block.headerLines.length === 0 && block.bodyLines.length === 0) continue;

    const { role, company, duration } = parseExperienceHeader(block.headerLines);

    // Extract achievements from body lines
    const achievements: string[] = [];
    for (const raw of block.bodyLines) {
      const line = clean(raw);
      if (!line || line.length < 10) continue;

      if (isBullet(raw)) {
        const text = stripBullet(raw);
        if (text.length >= 10) achievements.push(text);
      } else if (isAchievementLine(line)) {
        achievements.push(line);
      }
    }

    // Only add if we have at least a role or company
    if (role || company) {
      entries.push({ role, company, duration, achievements });
    }
  }

  return entries;
}

// ─── 4. Education parsing ─────────────────────────────────────────────────────

const DEGREE_KEYWORDS =
  /\b(bachelor(?:'s)?|master(?:'s)?|phd|ph\.d|doctorate|associate(?:'s)?|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?eng\.?|m\.?eng\.?|b\.?sc\.?|m\.?sc\.?|mba|llb|llm|btech|mtech|diploma|certificate\s+(?:in|of)|degree\s+(?:in|of))\b/i;

const INSTITUTION_KEYWORDS =
  /\b(university|college|institute|school|academy|polytechnic|faculty|campus)\b/i;

interface RawEducationBlock {
  lines: string[];
}

function groupEducationBlocks(lines: string[]): RawEducationBlock[] {
  const blocks: RawEducationBlock[] = [];
  let current: string[] = [];

  for (const raw of lines) {
    const line = clean(raw);
    if (!line) {
      if (current.length > 0) {
        blocks.push({ lines: current });
        current = [];
      }
      continue;
    }

    const isDegreeOrInstitution =
      DEGREE_KEYWORDS.test(line) || INSTITUTION_KEYWORDS.test(line);

    if (isDegreeOrInstitution && current.length > 0) {
      // Check if this line starts a new block or continues the current one
      const currentHasDegree = current.some((l) => DEGREE_KEYWORDS.test(l));
      const currentHasInstitution = current.some((l) => INSTITUTION_KEYWORDS.test(l));

      if (currentHasDegree && currentHasInstitution) {
        // Current block is complete — start a new one
        blocks.push({ lines: current });
        current = [line];
      } else {
        current.push(line);
      }
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) blocks.push({ lines: current });
  return blocks;
}

function parseEducation(lines: string[]): EducationEntry[] {
  const blocks = groupEducationBlocks(lines);
  const entries: EducationEntry[] = [];

  for (const block of blocks) {
    let degree: string | undefined;
    let institution: string | undefined;

    for (const line of block.lines) {
      if (!degree && DEGREE_KEYWORDS.test(line)) {
        degree = clean(line);
      } else if (!institution && INSTITUTION_KEYWORDS.test(line)) {
        institution = clean(line);
      }
    }

    // If we only have one line, try to split it
    if (!degree && !institution && block.lines.length === 1) {
      const line = block.lines[0];
      if (DEGREE_KEYWORDS.test(line) || INSTITUTION_KEYWORDS.test(line)) {
        degree = clean(line);
      }
    }

    if (degree || institution) {
      entries.push({ degree, institution });
    }
  }

  return entries;
}

// ─── 5. Projects parsing ──────────────────────────────────────────────────────

/**
 * A project block starts with a title line (short, no bullet, often followed
 * by a tech stack line or description bullets).
 */
function parseProjects(lines: string[]): ProjectEntry[] {
  const entries: ProjectEntry[] = [];

  let title: string | undefined;
  let descLines: string[] = [];
  let techLines: string[] = [];

  const flush = () => {
    if (!title && descLines.length === 0) return;

    // Extract technologies from tech lines and description
    const combined = [...techLines, ...descLines].join(" ");
    const technologies = extractSkills(combined, "");

    const description = descLines
      .map((l) => (isBullet(l) ? stripBullet(l) : clean(l)))
      .filter(Boolean)
      .join(" ");

    entries.push({
      title: title ?? undefined,
      technologies,
      description: description || undefined,
    });

    title = undefined;
    descLines = [];
    techLines = [];
  };

  // Patterns that suggest a tech stack line
  const techLineRe = /\b(tech(?:nologies|nology|nical)?(?:\s+stack)?|built\s+with|stack|tools?|languages?)\s*[:\-–]?\s*/i;
  // URL pattern — often appears in project entries
  const urlRe = /https?:\/\/|github\.com|gitlab\.com|bitbucket\.org/i;

  for (const raw of lines) {
    const line = clean(raw);
    if (!line) continue;

    const isShortNonBullet = !isBullet(raw) && line.length < 80;
    const looksLikeTitle =
      isShortNonBullet &&
      !/[.!?]$/.test(line) &&
      !DURATION_RE.test(line) &&
      !techLineRe.test(line);
    DURATION_RE.lastIndex = 0;

    if (looksLikeTitle && !title) {
      // First non-bullet short line → project title
      title = line;
    } else if (techLineRe.test(line) || urlRe.test(line)) {
      techLines.push(line);
    } else if (isBullet(raw) || line.length > 30) {
      descLines.push(raw);
    } else if (isShortNonBullet && title) {
      // Another short line after title — could be a new project
      flush();
      title = line;
    }
  }

  flush();
  return entries;
}

// ─── 6. Certifications extraction ────────────────────────────────────────────

/**
 * Build alias → canonical map at module load.
 */
const CERT_ALIAS_MAP = new Map<string, string>();

for (const [canonical, ...aliases] of CERT_DEFINITIONS) {
  CERT_ALIAS_MAP.set(canonical.toLowerCase(), canonical);
  for (const alias of aliases) {
    CERT_ALIAS_MAP.set(alias.toLowerCase(), canonical);
  }
}

function extractCertifications(certSectionLines: string[], fullText: string): string[] {
  const found = new Set<string>();
  const lower = fullText.toLowerCase();

  // Scan full text for known certification aliases
  for (const [alias, canonical] of CERT_ALIAS_MAP) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const boundary = alias.length <= 4
      ? `(?<![a-z])${escaped}(?![a-z])`
      : `\\b${escaped}\\b`;
    try {
      if (new RegExp(boundary, "i").test(lower)) {
        found.add(canonical);
      }
    } catch {
      // skip malformed
    }
  }

  // Also parse the certifications section line by line for free-text certs
  for (const raw of certSectionLines) {
    const line = clean(raw);
    if (!line || line.length < 3) continue;

    const text = isBullet(raw) ? stripBullet(raw) : line;
    if (text.length < 3 || text.length > 120) continue;

    // Check if this line matches a known cert
    const knownMatch = CERT_ALIAS_MAP.get(text.toLowerCase());
    if (knownMatch) {
      found.add(knownMatch);
      continue;
    }

    // Accept free-text cert lines that look like certification names
    // (contain "certified", "certificate", "certification", or known issuer names)
    const certLineRe =
      /\b(certified|certification|certificate|credential|license|comptia|cisco|aws|google|microsoft|isaca|isc2|ec-council|giac|pmi|hashicorp|cncf|linux foundation)\b/i;
    if (certLineRe.test(text) && text.split(" ").length <= 10) {
      found.add(text);
    }
  }

  return [...found].sort((a, b) => a.localeCompare(b));
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Parse raw resume text into structured ATS-ready data.
 *
 * All fields are derived purely from the input text.
 * Missing information returns undefined (scalars) or [] (arrays).
 *
 * @example
 * const parsed = parseResume(extractedText);
 * console.log(parsed.name);        // "Jane Smith"
 * console.log(parsed.skills);      // ["Python", "AWS", "Docker", ...]
 * console.log(parsed.experience);  // [{ role, company, duration, achievements }]
 */
export function parseResume(resumeText: string): ParsedResume {
  if (!resumeText || resumeText.trim().length === 0) {
    return {
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    };
  }

  const text = resumeText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const sections = splitSections(text);

  const headerLines  = sections["header"]        ?? [];
  const expLines     = sections["experience"]     ?? [];
  const eduLines     = sections["education"]      ?? [];
  const skillLines   = sections["skills"]         ?? [];
  const certLines    = sections["certifications"] ?? [];
  const projectLines = sections["projects"]       ?? [];

  // Contact info — scan the full text for robustness
  const name     = extractName(headerLines);
  const email    = extractEmail(text);
  const phone    = extractPhone(text);
  const linkedin = extractLinkedIn(text);

  // Skills — scan full text + skills section
  const skills = extractSkills(text, skillLines.join("\n"));

  // Structured sections
  const experience     = parseExperience(expLines);
  const education      = parseEducation(eduLines);
  const projects       = parseProjects(projectLines);
  const certifications = extractCertifications(certLines, text);

  return {
    name,
    email,
    phone,
    linkedin,
    skills,
    experience,
    education,
    projects,
    certifications,
  };
}
