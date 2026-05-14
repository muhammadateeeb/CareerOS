/**
 * CareerOS ATS Scoring Engine
 *
 * Computes a real, derived ATS score (0–100) from:
 *   - parsed resume text
 *   - onboarding profile (target role, industry, skills, experience level)
 *   - role keyword dataset (roles.ts / industries.ts)
 *
 * Score breakdown:
 *   Keyword Match   40 %
 *   Semantic Match  20 %
 *   Experience Fit  15 %
 *   Resume Quality  15 %
 *   Job Alignment   10 %
 *
 * No hardcoded scores. No external APIs. Pure TypeScript.
 */

import { ROLE_CATEGORIES } from "@/data/roles";
import { INDUSTRIES } from "@/data/industries";
import type { UserCareerProfile } from "@/types/onboarding";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ATSInput {
  /** Raw text extracted from the resume (PDF / DOCX / TXT). */
  resumeText: string;
  /** Onboarding profile collected from the user. */
  onboardingProfile: Partial<UserCareerProfile>;
  /**
   * Optional free-text job description to score against.
   * When omitted the engine uses the role + industry from onboardingProfile.
   */
  jobRole?: string;
}

export interface ScoreComponent {
  /** Weighted contribution already applied (0–max). */
  score: number;
  /** Maximum possible contribution for this component. */
  max: number;
  /** Human-readable label. */
  label: string;
  /** Short explanation of what drove this score. */
  detail: string;
}

export interface ATSResult {
  /** Final composite score 0–100. */
  score: number;
  /** Per-component breakdown. */
  breakdown: {
    keywordMatch: ScoreComponent;
    semanticMatch: ScoreComponent;
    experienceFit: ScoreComponent;
    resumeQuality: ScoreComponent;
    jobAlignment: ScoreComponent;
  };
  /** Keywords from the role dataset found in the resume. */
  matchedKeywords: string[];
  /** Keywords from the role dataset NOT found in the resume. */
  missingKeywords: string[];
  /** Actionable, specific improvement suggestions. */
  suggestions: string[];
}

// ─── Synonym / normalisation map ─────────────────────────────────────────────
// Maps surface forms → canonical form so "js" and "javascript" both match.

const SYNONYMS: Record<string, string> = {
  // JavaScript ecosystem
  js: "javascript",
  "react.js": "react",
  reactjs: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  "vue.js": "vue",
  vuejs: "vue",
  "node.js": "nodejs",
  nodejs: "nodejs",
  "express.js": "express",
  expressjs: "express",
  ts: "typescript",
  // Python ecosystem
  py: "python",
  sklearn: "scikit-learn",
  "scikit learn": "scikit-learn",
  tf: "tensorflow",
  // Cloud
  aws: "amazon web services",
  "amazon web services": "amazon web services",
  gcp: "google cloud platform",
  "google cloud": "google cloud platform",
  azure: "microsoft azure",
  "microsoft azure": "microsoft azure",
  // DevOps
  k8s: "kubernetes",
  "ci/cd": "cicd",
  "ci cd": "cicd",
  "continuous integration": "cicd",
  "continuous deployment": "cicd",
  // Databases
  postgres: "postgresql",
  mongo: "mongodb",
  // Security
  "pen testing": "penetration testing",
  pentest: "penetration testing",
  "pen test": "penetration testing",
  appsec: "application security",
  "app security": "application security",
  soc: "security operations center",
  "security operations": "security operations center",
  // AI/ML
  ml: "machine learning",
  ai: "artificial intelligence",
  nlp: "natural language processing",
  cv: "computer vision",
  dl: "deep learning",
  llm: "large language model",
  // General
  mgmt: "management",
  dev: "development",
  eng: "engineering",
};

// ─── Strong / weak action verb lists ─────────────────────────────────────────

const STRONG_VERBS = new Set([
  "built", "engineered", "architected", "designed", "developed", "created",
  "launched", "deployed", "shipped", "implemented", "delivered", "automated",
  "optimised", "optimized", "reduced", "increased", "improved", "accelerated",
  "scaled", "migrated", "refactored", "led", "managed", "directed", "spearheaded",
  "established", "founded", "pioneered", "transformed", "streamlined", "secured",
  "integrated", "orchestrated", "negotiated", "generated", "drove", "achieved",
  "exceeded", "surpassed", "mentored", "coached", "trained", "hired", "grew",
  "expanded", "consolidated", "resolved", "diagnosed", "audited", "analysed",
  "analyzed", "researched", "published", "presented", "authored", "collaborated",
]);

const WEAK_VERBS = new Set([
  "worked", "helped", "assisted", "supported", "involved", "participated",
  "contributed", "responsible", "tasked", "assigned", "handled", "dealt",
  "tried", "attempted", "used", "utilized", "utilised", "did", "made",
  "got", "had", "was", "were", "been",
]);

// ─── Experience level → approximate years range ───────────────────────────────

const EXPERIENCE_LEVEL_YEARS: Record<string, [number, number]> = {
  "entry level (0-2 years)":    [0, 2],
  "junior (2-4 years)":         [2, 4],
  "mid-level (4-7 years)":      [4, 7],
  "senior (7-10 years)":        [7, 10],
  "lead/principal (10+ years)": [10, 40],
  "executive/management":       [10, 40],
  // Legacy values from dashboardStore Onboarding type
  entry:     [0, 2],
  mid:       [3, 6],
  senior:    [7, 12],
  executive: [12, 40],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lowercase + collapse whitespace. */
function clean(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Normalise a single token through the synonym map. */
function normalise(token: string): string {
  const c = clean(token);
  return SYNONYMS[c] ?? c;
}

/**
 * Tokenise resume text into a Set of normalised unigrams and bigrams.
 * Bigrams catch multi-word keywords like "machine learning".
 */
function tokenise(text: string): Set<string> {
  const words = clean(text)
    .replace(/[^a-z0-9\s.#+/]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const tokens = new Set<string>();

  for (let i = 0; i < words.length; i++) {
    const uni = normalise(words[i]);
    tokens.add(uni);

    if (i + 1 < words.length) {
      const bi = normalise(`${words[i]} ${words[i + 1]}`);
      tokens.add(bi);
    }

    if (i + 2 < words.length) {
      const tri = normalise(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      tokens.add(tri);
    }
  }

  return tokens;
}

/** Return true if `keyword` (possibly multi-word) appears in the token set. */
function tokenMatches(keyword: string, tokens: Set<string>): boolean {
  const norm = normalise(keyword);
  if (tokens.has(norm)) return true;
  // Also try each word individually for compound keywords
  const parts = norm.split(" ");
  if (parts.length > 1 && parts.every((p) => tokens.has(p))) return true;
  return false;
}

/**
 * Resolve the role keyword list.
 * Tries exact match first, then partial match on role name, then category match.
 */
function resolveRoleKeywords(targetRole: string): string[] {
  if (!targetRole) return [];
  const roleLower = clean(targetRole);

  // 1. Exact role match
  for (const cat of ROLE_CATEGORIES) {
    for (const role of cat.roles) {
      if (clean(role) === roleLower) return cat.keywords;
    }
  }

  // 2. Partial role name match
  for (const cat of ROLE_CATEGORIES) {
    for (const role of cat.roles) {
      if (clean(role).includes(roleLower) || roleLower.includes(clean(role))) {
        return cat.keywords;
      }
    }
  }

  // 3. Category name match (e.g. user typed "cybersecurity")
  for (const cat of ROLE_CATEGORIES) {
    if (clean(cat.category).includes(roleLower) || roleLower.includes(clean(cat.category))) {
      return cat.keywords;
    }
  }

  return [];
}

/** Resolve industry keywords from the INDUSTRIES dataset. */
function resolveIndustryKeywords(industry: string): string[] {
  if (!industry) return [];
  const ind = INDUSTRIES.find(
    (i) => clean(i.name) === clean(industry) || clean(industry).includes(clean(i.name))
  );
  return ind ? ind.keywords : [];
}

/** Count how many times a regex pattern matches in text. */
function countMatches(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

/** Detect approximate years of experience from resume text. */
function detectYearsOfExperience(resumeText: string): number | null {
  // Patterns: "5 years of experience", "3+ years", "over 7 years"
  const patterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/gi,
    /(\d+)\+?\s*years?\s+(?:in|working|at)/gi,
    /over\s+(\d+)\s*years?/gi,
    /more\s+than\s+(\d+)\s*years?/gi,
  ];

  const found: number[] = [];
  for (const p of patterns) {
    let m: RegExpExecArray | null;
    const re = new RegExp(p.source, p.flags);
    while ((m = re.exec(resumeText)) !== null) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n < 50) found.push(n);
    }
  }

  if (found.length === 0) return null;
  // Return the maximum stated years (most senior claim)
  return Math.max(...found);
}

// ─── Component 1: Keyword Match (40 pts) ─────────────────────────────────────

interface KeywordMatchResult {
  component: ScoreComponent;
  matched: string[];
  missing: string[];
}

function scoreKeywordMatch(
  tokens: Set<string>,
  targetRole: string,
  industry: string,
  userSkills: string[]
): KeywordMatchResult {
  const MAX = 40;

  // Build the master keyword list for this role + industry
  const roleKws = resolveRoleKeywords(targetRole);
  const industryKws = resolveIndustryKeywords(industry);

  // Deduplicate, normalise
  const allKws = [...new Set([...roleKws, ...industryKws])].map(clean);

  if (allKws.length === 0) {
    // No dataset keywords — fall back to user-declared skills only
    const skillMatched = userSkills.filter((s) => tokenMatches(s, tokens));
    const skillMissing = userSkills.filter((s) => !tokenMatches(s, tokens));
    const ratio = userSkills.length > 0 ? skillMatched.length / userSkills.length : 0;
    return {
      component: {
        score: Math.round(ratio * MAX),
        max: MAX,
        label: "Keyword Match",
        detail: `${skillMatched.length}/${userSkills.length} declared skills found in resume`,
      },
      matched: skillMatched,
      missing: skillMissing,
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of allKws) {
    if (tokenMatches(kw, tokens)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  // Also check user-declared skills that aren't in the role dataset
  for (const skill of userSkills) {
    const norm = normalise(skill);
    if (!allKws.includes(norm)) {
      if (tokenMatches(skill, tokens)) {
        matched.push(norm);
      } else {
        missing.push(norm);
      }
    }
  }

  const uniqueMatched = [...new Set(matched)];
  const uniqueMissing = [...new Set(missing)];
  const total = uniqueMatched.length + uniqueMissing.length;
  const ratio = total > 0 ? uniqueMatched.length / total : 0;

  return {
    component: {
      score: Math.round(ratio * MAX),
      max: MAX,
      label: "Keyword Match",
      detail: `${uniqueMatched.length} of ${total} role/industry keywords found`,
    },
    matched: uniqueMatched,
    missing: uniqueMissing,
  };
}

// ─── Component 2: Semantic Match (20 pts) ────────────────────────────────────
//
// Without an embedding model we approximate semantic similarity using:
//   a) concept cluster coverage  — does the resume cover the main concept
//      clusters for the role (e.g. "security" cluster, "cloud" cluster)?
//   b) co-occurrence density     — how often do role-adjacent terms appear
//      near each other in the text?
//   c) section presence          — does the resume have the sections a
//      recruiter for this role expects?

const CONCEPT_CLUSTERS: Record<string, string[][]> = {
  Cybersecurity: [
    ["siem", "splunk", "log", "alert", "monitoring"],
    ["incident", "response", "forensic", "investigation"],
    ["vulnerability", "patch", "cve", "exploit", "pentest", "penetration"],
    ["firewall", "ids", "ips", "network", "packet"],
    ["compliance", "nist", "iso", "gdpr", "hipaa", "pci"],
  ],
  "Software Engineering": [
    ["javascript", "typescript", "python", "java", "golang", "rust"],
    ["react", "vue", "angular", "frontend", "ui"],
    ["node", "express", "django", "spring", "backend", "api"],
    ["docker", "kubernetes", "cicd", "devops", "pipeline"],
    ["sql", "nosql", "database", "postgresql", "mongodb"],
  ],
  "AI/ML": [
    ["machine learning", "deep learning", "neural", "model", "training"],
    ["pytorch", "tensorflow", "keras", "scikit-learn"],
    ["nlp", "natural language", "transformer", "bert", "gpt", "llm"],
    ["data", "dataset", "feature", "pipeline", "mlops"],
    ["computer vision", "opencv", "image", "detection", "classification"],
  ],
  Design: [
    ["figma", "sketch", "adobe", "prototype", "wireframe"],
    ["user research", "usability", "testing", "persona", "journey"],
    ["design system", "component", "token", "accessibility"],
    ["typography", "color", "layout", "visual", "branding"],
  ],
  Marketing: [
    ["seo", "sem", "ppc", "google ads", "paid"],
    ["content", "blog", "copywriting", "editorial"],
    ["analytics", "conversion", "funnel", "retention", "acquisition"],
    ["email", "automation", "hubspot", "marketo", "crm"],
  ],
  Finance: [
    ["financial model", "dcf", "valuation", "forecast", "budget"],
    ["gaap", "ifrs", "audit", "compliance", "reporting"],
    ["excel", "power bi", "tableau", "sql", "python"],
    ["risk", "portfolio", "asset", "investment", "trading"],
  ],
  DevOps: [
    ["docker", "kubernetes", "container", "orchestration"],
    ["terraform", "ansible", "infrastructure", "iac"],
    ["jenkins", "github actions", "gitlab", "cicd", "pipeline"],
    ["prometheus", "grafana", "monitoring", "alerting", "observability"],
    ["aws", "azure", "gcp", "cloud", "serverless"],
  ],
};

function scoreSemanticMatch(
  tokens: Set<string>,
  resumeText: string,
  targetRole: string
): ScoreComponent {
  const MAX = 20;

  // Find which concept cluster set applies
  let clusters: string[][] | null = null;
  const roleLower = clean(targetRole);

  for (const [catName, catClusters] of Object.entries(CONCEPT_CLUSTERS)) {
    if (
      roleLower.includes(clean(catName)) ||
      clean(catName).includes(roleLower) ||
      // Check if any role in that category matches
      (ROLE_CATEGORIES.find((c) => clean(c.category) === clean(catName))?.roles ?? []).some(
        (r) => clean(r).includes(roleLower) || roleLower.includes(clean(r))
      )
    ) {
      clusters = catClusters;
      break;
    }
  }

  if (!clusters) {
    // No cluster data — give partial credit based on generic professional language
    const professionalTerms = [
      "experience", "project", "team", "deliver", "result",
      "stakeholder", "process", "solution", "impact", "goal",
    ];
    const found = professionalTerms.filter((t) => tokens.has(t)).length;
    const ratio = found / professionalTerms.length;
    return {
      score: Math.round(ratio * MAX * 0.6), // cap at 60 % when no cluster data
      max: MAX,
      label: "Semantic Match",
      detail: "Role-specific concept clusters not available; scored on professional language coverage",
    };
  }

  // Score: how many clusters have ≥1 term present?
  let clustersHit = 0;
  for (const cluster of clusters) {
    const hit = cluster.some((term) => tokenMatches(term, tokens));
    if (hit) clustersHit++;
  }

  const clusterRatio = clustersHit / clusters.length;

  // Bonus: co-occurrence — count sentences that contain ≥2 role terms
  const sentences = resumeText.split(/[.!\n]+/).map(clean);
  const allRoleTerms = clusters.flat();
  let richSentences = 0;
  for (const sentence of sentences) {
    const sentTokens = tokenise(sentence);
    const hits = allRoleTerms.filter((t) => tokenMatches(t, sentTokens)).length;
    if (hits >= 2) richSentences++;
  }
  const coOccurrenceBonus = Math.min(richSentences / Math.max(sentences.length * 0.1, 1), 1) * 0.2;

  const rawRatio = Math.min(clusterRatio + coOccurrenceBonus, 1);

  return {
    score: Math.round(rawRatio * MAX),
    max: MAX,
    label: "Semantic Match",
    detail: `${clustersHit}/${clusters.length} concept clusters covered`,
  };
}

// ─── Component 3: Experience Fit (15 pts) ────────────────────────────────────

function scoreExperienceFit(
  resumeText: string,
  experienceLevel: string
): ScoreComponent {
  const MAX = 15;

  const levelKey = clean(experienceLevel);
  const expectedRange = EXPERIENCE_LEVEL_YEARS[levelKey] ?? null;

  // Detect stated years from resume
  const detectedYears = detectYearsOfExperience(resumeText);

  // Count experience entries (rough proxy: lines with date ranges)
  const dateRangePattern =
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|\d{4})\s*[-–—to]+\s*(?:present|current|now|\d{4})/gi;
  const dateRangeCount = countMatches(resumeText, dateRangePattern);

  // Has an experience section?
  const hasExperienceSection =
    /\b(experience|employment|work history|career|positions? held)\b/i.test(resumeText);

  let score = 0;
  let detail = "";

  if (!hasExperienceSection) {
    score = 2;
    detail = "No experience section detected";
  } else if (expectedRange === null) {
    // Unknown level — give credit for having experience
    score = Math.min(dateRangeCount * 3, MAX);
    detail = `${dateRangeCount} date range(s) found; experience level not specified`;
  } else {
    const [minYrs, maxYrs] = expectedRange;

    if (detectedYears !== null) {
      if (detectedYears >= minYrs && detectedYears <= maxYrs) {
        score = MAX; // Perfect fit
        detail = `${detectedYears} years stated — matches "${experienceLevel}"`;
      } else if (detectedYears < minYrs) {
        // Under-qualified: partial credit proportional to how close
        const ratio = detectedYears / minYrs;
        score = Math.round(ratio * MAX * 0.8);
        detail = `${detectedYears} years stated — below "${experienceLevel}" minimum (${minYrs} yrs)`;
      } else {
        // Over-qualified: still good, slight penalty
        score = Math.round(MAX * 0.85);
        detail = `${detectedYears} years stated — above "${experienceLevel}" range`;
      }
    } else {
      // No explicit years — use date range count as proxy
      const estimatedYears = dateRangeCount * 1.5; // rough: 1.5 yrs per role
      if (estimatedYears >= minYrs) {
        score = Math.round(MAX * 0.75);
        detail = `${dateRangeCount} role(s) detected; years not explicitly stated`;
      } else {
        score = Math.round(MAX * 0.4);
        detail = `Only ${dateRangeCount} role(s) detected; may not meet "${experienceLevel}" requirement`;
      }
    }
  }

  return { score: Math.min(score, MAX), max: MAX, label: "Experience Fit", detail };
}

// ─── Component 4: Resume Quality (15 pts) ────────────────────────────────────

function scoreResumeQuality(resumeText: string): ScoreComponent {
  const MAX = 15;
  let score = 0;
  const notes: string[] = [];

  const text = clean(resumeText);
  const words = text.split(/\s+/).filter(Boolean);
  const lines = resumeText.split(/\n/).map((l) => l.trim()).filter(Boolean);

  // ── 1. Action verb quality (4 pts) ──────────────────────────────────────
  const firstWords = lines
    .map((l) => l.split(/\s+/)[0]?.toLowerCase() ?? "")
    .filter(Boolean);

  const strongCount = firstWords.filter((w) => STRONG_VERBS.has(w)).length;
  const weakCount = firstWords.filter((w) => WEAK_VERBS.has(w)).length;
  const verbLines = strongCount + weakCount;

  if (verbLines > 0) {
    const verbRatio = strongCount / verbLines;
    const verbScore = Math.round(verbRatio * 4);
    score += verbScore;
    if (verbRatio >= 0.8) {
      notes.push(`Strong action verbs: ${strongCount}/${verbLines} bullet lines`);
    } else {
      notes.push(`Weak verbs detected (${weakCount}): replace with strong action verbs`);
    }
  } else {
    score += 1;
    notes.push("No bullet-line action verbs detected");
  }

  // ── 2. Quantification (4 pts) ────────────────────────────────────────────
  // Numbers, percentages, currency, multipliers
  const quantPattern =
    /\b(\d[\d,]*\.?\d*\s*(%|x|k|m|b|million|thousand|billion|percent|users?|customers?|requests?|transactions?|ms|seconds?|hours?|days?|weeks?|months?|years?)|\$\s*\d[\d,]*\.?\d*|\d+\s*[-–]\s*\d+\s*(?:people|engineers?|developers?|team))\b/gi;
  const quantCount = countMatches(resumeText, quantPattern);

  if (quantCount >= 5) {
    score += 4;
    notes.push(`Good quantification: ${quantCount} measurable results found`);
  } else if (quantCount >= 2) {
    score += 2;
    notes.push(`Some quantification: ${quantCount} metrics found — add more numbers`);
  } else {
    score += 0;
    notes.push("No quantified achievements — add metrics (%, $, users, time saved)");
  }

  // ── 3. Bullet structure (3 pts) ──────────────────────────────────────────
  const bulletLines = lines.filter((l) => /^[-•*▪◦→>]/.test(l)).length;
  const bulletRatio = lines.length > 0 ? bulletLines / lines.length : 0;

  if (bulletRatio >= 0.3 && bulletLines >= 5) {
    score += 3;
    notes.push(`Well-structured: ${bulletLines} bullet points`);
  } else if (bulletLines >= 2) {
    score += 1;
    notes.push(`Limited bullet structure: ${bulletLines} bullets — use more`);
  } else {
    score += 0;
    notes.push("No bullet points detected — structure experience as bullet points");
  }

  // ── 4. Contact information (2 pts) ───────────────────────────────────────
  const hasEmail = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(resumeText);
  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(resumeText);
  const hasLinkedIn = /linkedin\.com\/in\//i.test(resumeText);

  const contactScore = (hasEmail ? 1 : 0) + (hasPhone || hasLinkedIn ? 1 : 0);
  score += contactScore;
  if (!hasEmail) notes.push("Missing email address");
  if (!hasPhone && !hasLinkedIn) notes.push("Add phone number or LinkedIn URL");

  // ── 5. Length sanity (2 pts) ─────────────────────────────────────────────
  if (words.length >= 200 && words.length <= 900) {
    score += 2;
    notes.push(`Resume length optimal (${words.length} words)`);
  } else if (words.length < 200) {
    score += 0;
    notes.push(`Resume too short (${words.length} words) — add more detail`);
  } else {
    score += 1;
    notes.push(`Resume may be too long (${words.length} words) — aim for 1–2 pages`);
  }

  return {
    score: Math.min(score, MAX),
    max: MAX,
    label: "Resume Quality",
    detail: notes.join(" | "),
  };
}

// ─── Component 5: Job Alignment (10 pts) ─────────────────────────────────────

function scoreJobAlignment(
  tokens: Set<string>,
  resumeText: string,
  targetRole: string,
  industry: string,
  jobRole?: string
): ScoreComponent {
  const MAX = 10;

  // Build alignment corpus: job description (if provided) OR role title + industry
  const alignmentText = jobRole
    ? clean(jobRole)
    : `${clean(targetRole)} ${clean(industry)}`;

  const alignmentTokens = tokenise(alignmentText);

  // How many alignment tokens appear in the resume?
  const alignmentTerms = [...alignmentTokens].filter((t) => t.length > 3);
  if (alignmentTerms.length === 0) {
    return {
      score: 5,
      max: MAX,
      label: "Job Alignment",
      detail: "No job description provided; scored on role title match",
    };
  }

  const matched = alignmentTerms.filter((t) => tokens.has(t));
  const ratio = matched.length / alignmentTerms.length;

  // Bonus: does the resume explicitly mention the target role title?
  const roleMentioned = clean(resumeText).includes(clean(targetRole));
  const bonus = roleMentioned ? 0.1 : 0;

  const rawRatio = Math.min(ratio + bonus, 1);

  return {
    score: Math.round(rawRatio * MAX),
    max: MAX,
    label: "Job Alignment",
    detail: jobRole
      ? `${matched.length}/${alignmentTerms.length} job description terms matched`
      : `Role title "${targetRole}" ${roleMentioned ? "found" : "not found"} in resume`,
  };
}

// ─── Suggestion engine ────────────────────────────────────────────────────────

function buildSuggestions(
  breakdown: ATSResult["breakdown"],
  missing: string[],
  resumeText: string,
  profile: Partial<UserCareerProfile>
): string[] {
  const suggestions: string[] = [];
  const text = clean(resumeText);
  const lines = resumeText.split(/\n/).map((l) => l.trim()).filter(Boolean);

  // ── Keyword suggestions ──────────────────────────────────────────────────
  if (breakdown.keywordMatch.score < breakdown.keywordMatch.max * 0.6) {
    const topMissing = missing.slice(0, 5);
    if (topMissing.length > 0) {
      suggestions.push(
        `Add these missing keywords to your resume: ${topMissing.join(", ")}. ` +
        `Weave them into bullet points naturally — e.g. "Implemented ${topMissing[0]} to improve system reliability."`
      );
    }
  }

  // ── Semantic suggestions ─────────────────────────────────────────────────
  if (breakdown.semanticMatch.score < breakdown.semanticMatch.max * 0.5) {
    suggestions.push(
      `Your resume lacks depth in ${profile.targetRole ?? "your target role"} concepts. ` +
      `Add a dedicated "Technical Skills" or "Core Competencies" section that groups related skills by domain.`
    );
  }

  // ── Experience suggestions ───────────────────────────────────────────────
  if (breakdown.experienceFit.score < breakdown.experienceFit.max * 0.6) {
    const level = profile.experienceLevel ?? "";
    if (level) {
      suggestions.push(
        `Your stated experience may not clearly match "${level}". ` +
        `Add a line like "X years of professional experience in [field]" near the top of your resume.`
      );
    } else {
      suggestions.push(
        `Explicitly state your total years of experience near the top of your resume ` +
        `(e.g. "5+ years of experience in software engineering").`
      );
    }
  }

  // ── Quality: weak verbs ──────────────────────────────────────────────────
  const weakFound = lines
    .map((l) => l.split(/\s+/)[0]?.toLowerCase() ?? "")
    .filter((w) => WEAK_VERBS.has(w));

  if (weakFound.length > 0) {
    const examples: Record<string, string> = {
      worked:      "Built / Engineered / Developed",
      helped:      "Accelerated / Enabled / Supported → Delivered",
      assisted:    "Collaborated on / Co-developed",
      responsible: "Owned / Led / Managed",
      involved:    "Contributed to / Drove",
      used:        "Leveraged / Implemented / Applied",
      handled:     "Managed / Resolved / Processed",
    };
    const fixes = [...new Set(weakFound)]
      .slice(0, 3)
      .map((w) => `"${w}" → ${examples[w] ?? "a strong action verb"}`)
      .join("; ");
    suggestions.push(`Replace weak opening verbs: ${fixes}.`);
  }

  // ── Quality: no quantification ───────────────────────────────────────────
  const quantPattern =
    /\b(\d[\d,]*\.?\d*\s*(%|x|k|m|b|million|thousand|billion|percent|users?|customers?|requests?|transactions?|ms|seconds?|hours?|days?|weeks?|months?|years?)|\$\s*\d[\d,]*\.?\d*)\b/gi;
  const quantCount = (resumeText.match(quantPattern) ?? []).length;

  if (quantCount < 3) {
    suggestions.push(
      `Add measurable results to at least 3 bullet points. Examples: ` +
      `"Reduced API latency by 40%", "Onboarded 200+ enterprise clients", ` +
      `"Cut infrastructure costs by $12k/month".`
    );
  }

  // ── Quality: missing contact info ────────────────────────────────────────
  if (!/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(resumeText)) {
    suggestions.push("Add a professional email address to your resume header.");
  }
  if (!/linkedin\.com\/in\//i.test(resumeText) && !profile.linkedinUrl) {
    suggestions.push(
      "Add your LinkedIn URL to the resume header — recruiters verify profiles before reaching out."
    );
  }

  // ── Job alignment ────────────────────────────────────────────────────────
  if (breakdown.jobAlignment.score < breakdown.jobAlignment.max * 0.5 && profile.targetRole) {
    suggestions.push(
      `Your resume doesn't clearly signal "${profile.targetRole}". ` +
      `Add a 2-line professional summary at the top: ` +
      `"${profile.targetRole} with X years of experience in [key area]. ` +
      `Specialised in [top skill 1] and [top skill 2]."`
    );
  }

  // ── Bullet structure ─────────────────────────────────────────────────────
  const bulletLines = lines.filter((l) => /^[-•*▪◦→>]/.test(l)).length;
  if (bulletLines < 5) {
    suggestions.push(
      "Structure your experience as bullet points starting with action verbs. " +
      "Each bullet should follow: [Action verb] + [what you did] + [result/impact]."
    );
  }

  // Deduplicate and cap
  return [...new Set(suggestions)].slice(0, 8);
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Calculate a real, derived ATS score from resume text and onboarding profile.
 *
 * @example
 * const result = calculateATS({
 *   resumeText: extractedText,
 *   onboardingProfile: useOnboardingStore.getState().profile,
 * });
 * console.log(result.score); // e.g. 73
 */
export function calculateATS(input: ATSInput): ATSResult {
  const { resumeText, onboardingProfile, jobRole } = input;

  if (!resumeText || resumeText.trim().length < 50) {
    return {
      score: 0,
      breakdown: {
        keywordMatch:  { score: 0, max: 40, label: "Keyword Match",  detail: "No resume text provided" },
        semanticMatch: { score: 0, max: 20, label: "Semantic Match", detail: "No resume text provided" },
        experienceFit: { score: 0, max: 15, label: "Experience Fit", detail: "No resume text provided" },
        resumeQuality: { score: 0, max: 15, label: "Resume Quality", detail: "No resume text provided" },
        jobAlignment:  { score: 0, max: 10, label: "Job Alignment",  detail: "No resume text provided" },
      },
      matchedKeywords: [],
      missingKeywords: [],
      suggestions: ["Upload a resume with readable text to receive your ATS score."],
    };
  }

  const targetRole  = onboardingProfile.targetRole  ?? "";
  const industry    = onboardingProfile.industry    ?? "";
  const expLevel    = onboardingProfile.experienceLevel ?? "";
  const userSkills  = onboardingProfile.skills ?? [];

  // Tokenise once — shared across all components
  const tokens = tokenise(resumeText);

  // ── Score each component ─────────────────────────────────────────────────
  const kwResult    = scoreKeywordMatch(tokens, targetRole, industry, userSkills);
  const semResult   = scoreSemanticMatch(tokens, resumeText, targetRole);
  const expResult   = scoreExperienceFit(resumeText, expLevel);
  const qualResult  = scoreResumeQuality(resumeText);
  const alignResult = scoreJobAlignment(tokens, resumeText, targetRole, industry, jobRole);

  const breakdown: ATSResult["breakdown"] = {
    keywordMatch:  kwResult.component,
    semanticMatch: semResult,
    experienceFit: expResult,
    resumeQuality: qualResult,
    jobAlignment:  alignResult,
  };

  // ── Composite score ──────────────────────────────────────────────────────
  const raw =
    kwResult.component.score +
    semResult.score +
    expResult.score +
    qualResult.score +
    alignResult.score;

  // Theoretical max = 40 + 20 + 15 + 15 + 10 = 100
  const score = Math.min(Math.max(Math.round(raw), 0), 100);

  // ── Suggestions ──────────────────────────────────────────────────────────
  const suggestions = buildSuggestions(
    breakdown,
    kwResult.missing,
    resumeText,
    onboardingProfile
  );

  return {
    score,
    breakdown,
    matchedKeywords: kwResult.matched,
    missingKeywords: kwResult.missing,
    suggestions,
  };
}

// ─── Convenience helpers (consumed by Resume Lab UI) ─────────────────────────

/** Human-readable grade for a score. */
export function getScoreGrade(score: number): "Excellent" | "Good" | "Fair" | "Poor" {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

/** Tailwind colour class for a score. */
export function getScoreColour(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-500";
  return "text-red-600";
}

/** Tailwind background colour class for a score. */
export function getScoreBgColour(score: number): string {
  if (score >= 80) return "bg-green-100";
  if (score >= 60) return "bg-blue-100";
  if (score >= 40) return "bg-amber-100";
  return "bg-red-100";
}
