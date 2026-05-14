import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle,
  Loader2, X, ChevronDown, ChevronUp, Bug, RefreshCw,
  Target, Zap, Award, TrendingUp, Eye, Lightbulb,
} from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDashboardStore, dashboardActions } from "@/store/dashboardStore";
import { useOnboardingStore }                  from "@/store/onboardingStore";

import { validateResumeFile, formatFileSize } from "@/services/resumeParser";
import { runParserPipeline } from "@/services/resume/parser/parserPipeline";
import { detectSections } from "@/services/resume/parser/sectionEngine";
import { sanitizeResumeText } from "@/services/resume/parser/sanitize";
import { extractContactInfo } from "@/services/resume/extractors/contactExtractor";
import { extractSkills } from "@/services/resume/extractors/skillsExtractor";
import { extractExperience } from "@/services/resume/extractors/experienceExtractor";
import { extractEducation } from "@/services/resume/extractors/educationExtractor";
import { extractCertifications } from "@/services/resume/extractors/certificationExtractor";
import { extractProjects } from "@/services/resume/extractors/projectsExtractor";
import { calculateATSScore } from "@/services/resume/ats/atsEngine";
import { ROLES } from "@/services/resume/roles/roles";
import type { ParsedResume, ATSResult } from "@/services/resume/types/resume.types";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/resume-lab")({
  head: () => ({
    meta: [
      { title: "Resume Lab — CareerOS" },
      { name: "description", content: "Upload your resume and get a real ATS score with actionable fixes." },
    ],
  }),
  component: ResumeLabPage,
});

// ─── Debug sample resume (only shown in dev mode) ─────────────────────────────

const DEBUG_RESUME = `Jane Smith
jane.smith@email.com | +1 (555) 123-4567 | linkedin.com/in/janesmith

SUMMARY
Software Engineer with 5 years of experience building scalable web applications.

EXPERIENCE

Senior Software Engineer | Acme Corp | Jan 2021 – Present
• Built React dashboard serving 50,000 daily active users, reducing load time by 40%
• Engineered Node.js microservices architecture handling 2M requests/day
• Led team of 6 engineers to deliver 3 major product features on schedule
• Reduced AWS infrastructure costs by $18k/month through resource optimisation

Software Engineer | StartupXYZ | Mar 2019 – Dec 2020
• Developed TypeScript REST APIs consumed by 200+ enterprise clients
• Implemented CI/CD pipeline with GitHub Actions, cutting deploy time from 45min to 8min
• Worked on backend services using Python and PostgreSQL

EDUCATION

Bachelor of Science in Computer Science
University of California, Berkeley | 2015 – 2019

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes,
PostgreSQL, MongoDB, Redis, GraphQL, Git, CI/CD, Agile, Scrum

PROJECTS

CareerOS Platform
Built with: React, Node.js, PostgreSQL, AWS
• Full-stack job search platform with AI-powered resume analysis
• Deployed on AWS ECS with auto-scaling, serving 10k users

CERTIFICATIONS
AWS Certified Solutions Architect
Certified Kubernetes Administrator (CKA)
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreRingColour(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#2563eb";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const colour = scoreRingColour(score);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r} fill="none"
        stroke={colour} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

function ComponentBar({ label, score, max, detail }: {
  label: string; score: number; max: number; detail: string;
}) {
  const pct = Math.round((score / max) * 100);
  const colour =
    pct >= 75 ? "bg-green-500" :
    pct >= 50 ? "bg-blue-500"  :
    pct >= 30 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{score}/{max}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colour}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

interface UploadZoneProps {
  onResult: (parsed: ParsedResume, ats: ATSResult, fileName: string, fileSize: number, parserUsed: string, qualityScore: number) => void;
}

function UploadZone({ onResult }: UploadZoneProps) {
  const { user }    = useUser();
  const { profile } = useOnboardingStore();
  const { dispatch, onboarding } = useDashboardStore();

  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stage,     setStage]     = useState<"idle" | "reading" | "parsing" | "scoring">("idle");
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const process = useCallback(async (file: File) => {
    setError(null);
    setProgress(0);

    const validation = validateResumeFile(file);
    if (!validation.valid) { setError(validation.error ?? "Invalid file"); return; }

    setUploading(true);
    setStage("reading");
    setProgress(15);

    try {
      // ── Multi-Layer Parser Pipeline ───────────────────────────────────
      const rawText = await runParserPipeline(file);

      setProgress(45);
      setStage("parsing");

      // ── Deep Sanitization ────────────────────────────────────────────
      const cleanText = sanitizeResumeText(rawText);

      // ── Structural Section Detection ──────────────────────────────────
      const sections = detectSections(cleanText);

      // ── Structured extraction ────────────────────────────────────────
      const personalInfo = extractContactInfo(cleanText);
      const skills = extractSkills(cleanText);
      const experience = extractExperience(cleanText);
      const education = extractEducation(cleanText);
      const certifications = extractCertifications(cleanText);
      const projects = extractProjects(cleanText);

      const parsed: ParsedResume = {
        personalInfo,
        skills,
        experience,
        education,
        certifications,
        projects,
        rawText,
        sanitizedText: cleanText
      };

      setProgress(70);
      setStage("scoring");

      // ── Enterprise ATS & Role Matching ───────────────────────────────
      const targetTitle = profile.targetRole || onboarding?.targetRole || "";
      const targetRole = ROLES.find(r => r.title === targetTitle) || ROLES[0];

      const atsResult = calculateATSScore(parsed, targetRole);
      setProgress(90);

      // ── Persist to dashboard store ────────────────────────────────────
      dispatch(dashboardActions.setResume({
        uploaded:      true,
        fileName:      file.name,
        fileSize:      file.size,
        uploadedAt:    new Date().toISOString(),
        extractedText: rawText,
        parsedData:    parsed as any,
        atsScore:      atsResult.score,
        feedback:      atsResult.recommendations.map(r => ({
          type:     "recommendation" as const,
          category: r.category as any,
          message:  r.message,
          priority: r.priority,
        })),
      }));

      setProgress(100);
      onResult(parsed, atsResult, file.name, file.size, "Pipeline (Multi-Layer)", 95);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setTimeout(() => { setUploading(false); setStage("idle"); setProgress(0); }, 600);
    }
  }, [user?.id, profile, onboarding, dispatch, onResult]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) process(f);
  };

  const stageLabel: Record<typeof stage, string> = {
    idle:    "",
    reading: "Reading file…",
    parsing: "Parsing resume…",
    scoring: "Calculating ATS score…",
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200 select-none
          ${dragging  ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"}
          ${uploading ? "pointer-events-none opacity-70" : ""}
        `}
      >
        <input
          ref={fileRef} type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) process(f); }}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
            <p className="font-medium text-foreground">{stageLabel[stage]}</p>
            <Progress value={progress} className="max-w-xs mx-auto h-1.5" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Drop your resume here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse — PDF, DOCX, TXT up to 10 MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Analysis panels ──────────────────────────────────────────────────────────

function getScoreColour(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-500";
  return "text-red-600";
}

function getScoreBgColour(score: number): string {
  if (score >= 80) return "bg-green-100";
  if (score >= 60) return "bg-blue-100";
  if (score >= 40) return "bg-amber-100";
  return "bg-red-100";
}

function ScoreOverview({ ats, fileName, fileSize, onReset }: {
  ats: ATSResult; fileName: string; fileSize: number; onReset: () => void;
}) {
  const grade  = ats.grade;
  const colour = getScoreColour(ats.score);
  const bg     = getScoreBgColour(ats.score);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Ring */}
          <div className="relative shrink-0">
            <ScoreRing score={ats.score} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${colour}`}>{ats.score}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={`text-xl font-bold ${colour}`}>{grade}</span>
              <Badge className={`${bg} ${colour} border-0`}>{grade}</Badge>
              <Badge variant="outline" className="ml-2 border-primary/30 text-primary">Role Match: {ats.roleMatchPercentage}%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {grade === "Excellent" && "Your resume is well-optimised for ATS systems."}
              {grade === "Good"      && "Solid resume — a few targeted improvements will push it higher."}
              {grade === "Fair"      && "Your resume needs work before it clears most ATS filters."}
              {grade === "Poor"      && "Significant improvements needed — follow the suggestions below."}
            </p>
            <p className="text-xs text-muted-foreground">
              <FileText className="inline w-3 h-3 mr-1" />
              {fileName} · {formatFileSize(fileSize)}
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={onReset} className="shrink-0">
            <RefreshCw className="w-4 h-4 mr-2" />
            New upload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownPanel({ ats }: { ats: ATSResult }) {
  const { breakdown } = ats;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4" />
          Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <ComponentBar {...breakdown.contactCompleteness} label={breakdown.contactCompleteness.label} />
        <ComponentBar {...breakdown.skillsRelevance} label={breakdown.skillsRelevance.label} />
        <ComponentBar {...breakdown.experienceQuality} label={breakdown.experienceQuality.label} />
        <ComponentBar {...breakdown.projectsQuality} label={breakdown.projectsQuality.label} />
        <ComponentBar {...breakdown.formatting} label={breakdown.formatting.label} />
        <ComponentBar {...breakdown.certifications} label={breakdown.certifications.label} />
        <ComponentBar {...breakdown.keywordMatch} label={breakdown.keywordMatch.label} />
      </CardContent>
    </Card>
  );
}

function KeywordsPanel({ ats }: { ats: ATSResult }) {
  const [showAll, setShowAll] = useState(false);
  const missing = ats.missingKeywords;
  const matched = ats.matchedKeywords;
  const visibleMissing = showAll ? missing : missing.slice(0, 12);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="w-4 h-4" />
          Keyword Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Matched */}
        <div>
          <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Matched ({matched.length})
          </p>
          {matched.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {matched.slice(0, 20).map((kw) => (
                <Badge key={kw} variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                  {kw}
                </Badge>
              ))}
              {matched.length > 20 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{matched.length - 20} more
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No role keywords matched yet.</p>
          )}
        </div>

        {/* Missing */}
        <div>
          <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Missing ({missing.length})
          </p>
          {missing.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {visibleMissing.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs border-red-300 text-red-700 bg-red-50">
                    {kw}
                  </Badge>
                ))}
              </div>
              {missing.length > 12 && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-2 text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  {showAll ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {missing.length}</>}
                </button>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">All role keywords are present.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestionsPanel({ ats }: { ats: ATSResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="w-4 h-4" />
          Actionable Fixes & Interview Prep
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold">Recommendations</p>
          {ats.recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recommendations — your resume looks great.</p>
          ) : (
            ats.recommendations.map((r, i) => (
              <div key={r.id} className={`flex gap-3 rounded-lg p-3 text-sm ${
                r.priority === "high" ? "bg-red-50 border border-red-100" :
                r.priority === "medium" ? "bg-amber-50 border border-amber-100" : "bg-blue-50 border border-blue-100"
              }`}>
                <span className={`shrink-0 font-bold text-xs mt-0.5 ${
                  r.priority === "high" ? "text-red-600" :
                  r.priority === "medium" ? "text-amber-600" : "text-blue-600"
                }`}>
                  {r.priority.toUpperCase()}
                </span>
                <p className="text-foreground leading-relaxed">{r.message}</p>
              </div>
            ))
          )}
        </div>

        {ats.interviewTopics.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Targeted Interview Topics
            </p>
            <div className="flex flex-wrap gap-2">
              {ats.interviewTopics.map((topic, i) => (
                <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                  {topic}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Brush up on these topics based on your target role.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ParsedDataPanel({ parsed }: { parsed: ParsedResume }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="w-4 h-4" />
          Parsed Resume Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        {/* Contact */}
        <div>
          <p className="font-medium mb-2">Contact Info</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
            <span>Name</span>      <span className="text-foreground">{parsed.personalInfo.name      ?? "—"}</span>
            <span>Email</span>     <span className="text-foreground">{parsed.personalInfo.email     ?? "—"}</span>
            <span>Phone</span>     <span className="text-foreground">{parsed.personalInfo.phone     ?? "—"}</span>
            <span>LinkedIn</span>  <span className="text-foreground truncate">{parsed.personalInfo.linkedin ?? "—"}</span>
          </div>
        </div>

        {/* Skills */}
        {parsed.skills.length > 0 && (
          <div>
            <p className="font-medium mb-2">Skills ({parsed.skills.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {parsed.skills.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {parsed.experience.length > 0 && (
          <div>
            <p className="font-medium mb-2">Experience ({parsed.experience.length} roles)</p>
            <div className="space-y-3">
              {parsed.experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-border pl-3">
                  <p className="font-medium text-foreground">{exp.role ?? "Unknown role"}</p>
                  {exp.company  && <p className="text-muted-foreground">{exp.company}</p>}
                  {exp.duration && <p className="text-xs text-muted-foreground">{exp.duration}</p>}
                  {exp.achievements.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {exp.achievements.slice(0, 3).map((a, j) => (
                        <li key={j} className="text-xs text-muted-foreground">• {a}</li>
                      ))}
                      {exp.achievements.length > 3 && (
                        <li className="text-xs text-muted-foreground">• +{exp.achievements.length - 3} more</li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {parsed.education.length > 0 && (
          <div>
            <p className="font-medium mb-2">Education</p>
            <div className="space-y-1">
              {parsed.education.map((edu, i) => (
                <div key={i} className="text-muted-foreground">
                  {edu.degree && <span className="text-foreground">{edu.degree}</span>}
                  {edu.institution && <span> · {edu.institution}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {parsed.certifications.length > 0 && (
          <div>
            <p className="font-medium mb-2">Certifications ({parsed.certifications.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {parsed.certifications.map((c) => (
                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {parsed.projects.length > 0 && (
          <div>
            <p className="font-medium mb-2">Projects ({parsed.projects.length})</p>
            <div className="space-y-2">
              {parsed.projects.map((p, i) => (
                <div key={i} className="border-l-2 border-border pl-3">
                  {p.title && <p className="font-medium text-foreground">{p.title}</p>}
                  {p.description && <p className="text-xs text-muted-foreground">{p.description.slice(0, 120)}{p.description.length > 120 ? "…" : ""}</p>}
                  {p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.technologies.slice(0, 6).map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Debug panel (dev only) ───────────────────────────────────────────────────

function DebugPanel({ onLoad, result }: {
  onLoad: (text: string) => void;
  result?: { parsed: ParsedResume; ats: ATSResult; parserUsed?: string; qualityScore?: number };
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  return (
    <div className="rounded-xl border border-dashed border-amber-400 bg-amber-50 p-4 space-y-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900"
      >
        <Bug className="w-4 h-4" />
        Debug Mode
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-xs text-amber-700">
              Test the parser and ATS engine without uploading a file.
              The sample resume below is pre-loaded with a Software Engineer profile.
            </p>

            <Button
              size="sm"
              variant="outline"
              className="border-amber-400 text-amber-800 hover:bg-amber-100"
              onClick={() => onLoad(DEBUG_RESUME)}
            >
              <Zap className="w-3.5 h-3.5 mr-2" />
              Run sample resume
            </Button>

            <div className="space-y-1">
              <p className="text-xs font-medium text-amber-700">Or paste your own resume text:</p>
              <textarea
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                rows={6}
                placeholder="Paste raw resume text here…"
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-mono text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={!custom.trim()}
                className="border-amber-400 text-amber-800 hover:bg-amber-100"
                onClick={() => { if (custom.trim()) onLoad(custom); }}
              >
                Analyse pasted text
              </Button>
            </div>
          </div>

          {result && (
            <div className="pt-4 border-t border-amber-200 space-y-3">
              <p className="text-xs font-bold text-amber-800 uppercase">Engine Metadata</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-amber-700">
                <div className="bg-white p-2 rounded border border-amber-200">
                  <p className="font-bold mb-1">Text Stats</p>
                  <p>Raw: {result.parsed.rawText.length} chars</p>
                  <p>Clean: {result.parsed.sanitizedText.length} chars</p>
                  <p>Parser: {result.parserUsed}</p>
                  <p>Quality: {result.qualityScore}%</p>
                </div>
                <div className="bg-white p-2 rounded border border-amber-200">
                  <p className="font-bold mb-1">Extraction</p>
                  <p>Skills: {result.parsed.skills.length}</p>
                  <p>Exp: {result.parsed.experience.length} blocks</p>
                </div>
                <div className="col-span-2 bg-white p-2 rounded border border-amber-200">
                  <p className="font-bold mb-1">ATS Breakdown</p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(result.ats.breakdown, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ResumeLabPage() {
  const { isSignedIn } = useUser();
  const navigate       = useNavigate();
  const { profile }    = useOnboardingStore();
  const { onboarding } = useDashboardStore();

  const [result, setResult] = useState<{
    parsed:   ParsedResume;
    ats:      ATSResult;
    fileName: string;
    fileSize: number;
    parserUsed?: string;
    qualityScore?: number;
  } | null>(null);

  const isDev = import.meta.env.DEV;

  // Auth guard
  if (!isSignedIn) {
    navigate({ to: "/login" });
    return null;
  }

  // Check if onboarding profile is set — warn but don't block
  const hasProfile = !!(
    (profile.targetRole || onboarding?.targetRole) &&
    (profile.industry   || onboarding?.industry)
  );

  const handleResult = useCallback((
    parsed: ParsedResume, ats: ATSResult, fileName: string, fileSize: number, parserUsed: string, qualityScore: number
  ) => {
    setResult({ parsed, ats, fileName, fileSize, parserUsed, qualityScore });
  }, []);

  // Debug: run analysis directly on raw text (no file upload)
  const handleDebugText = useCallback((text: string) => {
    const cleanText = sanitizeResumeText(text);

    const personalInfo = extractContactInfo(cleanText);
    const skills = extractSkills(cleanText);
    const experience = extractExperience(cleanText);
    const education = extractEducation(cleanText);
    const certifications = extractCertifications(cleanText);
    const projects = extractProjects(cleanText);

    const parsed: ParsedResume = {
      personalInfo,
      skills,
      experience,
      education,
      certifications,
      projects,
      rawText: text,
      sanitizedText: cleanText
    };

    const targetTitle = profile.targetRole || onboarding?.targetRole || "";
    const targetRole = ROLES.find(r => r.title === targetTitle) || ROLES[0];

    const ats = calculateATSScore(parsed, targetRole);
    setResult({ parsed, ats, fileName: "debug-input.txt", fileSize: text.length, parserUsed: "Debug Text", qualityScore: 100 });
  }, [profile, onboarding]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Dashboard
            </Button>
            <span className="text-muted-foreground">/</span>
            <h1 className="font-semibold">Resume Lab</h1>
          </div>
          {result && (
            <Badge className={`${getScoreBgColour(result.ats.score)} ${getScoreColour(result.ats.score)} border-0`}>
              ATS {result.ats.score}/100
            </Badge>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">

        {/* ── Profile warning ── */}
        {!hasProfile && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Your onboarding profile is incomplete. ATS scoring will be generic until you
              {" "}<button onClick={() => navigate({ to: "/onboarding" })} className="underline font-medium">complete your profile</button>.
            </span>
          </div>
        )}

        {!result ? (
          /* ── Upload state ── */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold">Analyse Your Resume</h2>
              <p className="text-muted-foreground text-sm">
                Get a real ATS score, keyword gap analysis, and specific fixes — all computed from your profile.
              </p>
            </div>

            <UploadZone onResult={handleResult} />

            {/* Debug panel — dev only */}
            {isDev && <DebugPanel onLoad={handleDebugText} />}

            {/* Tips */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Tips for a higher ATS score
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>• Start bullet points with strong action verbs (Built, Engineered, Led)</li>
                  <li>• Add at least 3 quantified achievements (%, $, user counts)</li>
                  <li>• Include a dedicated Skills section with role-relevant keywords</li>
                  <li>• Keep your resume to 1–2 pages (200–900 words)</li>
                  <li>• Add your LinkedIn URL and email to the header</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* ── Results state ── */
          <div className="space-y-6">
            <ScoreOverview
              ats={result.ats}
              fileName={result.fileName}
              fileSize={result.fileSize}
              onReset={() => setResult(null)}
            />

            <Tabs defaultValue="breakdown">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="fixes">Fixes</TabsTrigger>
                <TabsTrigger value="parsed">Parsed Data</TabsTrigger>
              </TabsList>

              <TabsContent value="breakdown" className="mt-4">
                <BreakdownPanel ats={result.ats} />
              </TabsContent>

              <TabsContent value="keywords" className="mt-4">
                <KeywordsPanel ats={result.ats} />
              </TabsContent>

              <TabsContent value="fixes" className="mt-4">
                <SuggestionsPanel ats={result.ats} />
              </TabsContent>

              <TabsContent value="parsed" className="mt-4">
                <ParsedDataPanel parsed={result.parsed} />
              </TabsContent>
            </Tabs>

            {/* Debug panel also available after results in dev */}
            {isDev && (
              <DebugPanel onLoad={handleDebugText} result={result} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
