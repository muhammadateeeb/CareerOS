import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle,
  Loader2, X, ChevronDown, ChevronUp, RefreshCw,
  Target, Zap, Award, TrendingUp, Eye, Lightbulb,
  Search, Shield, Briefcase, BarChart3, Layout,
  MessageSquare, Wand2, Info
} from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { useDashboardStore, dashboardActions } from "@/store/dashboardStore";
import { useOnboardingStore }                  from "@/store/onboardingStore";

import { formatFileSize } from "@/services/resumeParser";
import { extractResumeText, ExtractionResult } from "@/lib/resume/extractor";
import { parseResume, ParsedResume } from "@/lib/resume/parser";
import { calculateATSScore, ATSScore } from "@/lib/resume/atsEngine";
import { getResumeAdvice, AIAdvice } from "@/lib/ai/resumeAdvisor";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/resume-lab")({
  head: () => ({
    meta: [
      { title: "Resume Intelligence Lab — CareerOS" },
      { name: "description", content: "Professional-grade resume analysis and ATS optimization." },
    ],
  }),
  component: ResumeLabPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-500";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-50";
  if (score >= 60) return "bg-blue-50";
  if (score >= 40) return "bg-amber-50";
  return "bg-red-50";
}

function CircularProgress({ score, size = 120 }: { score: number, size?: number }) {
  const radius = (size / 2) - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="transparent"
          stroke="#f3f4f6"
          strokeWidth="8"
        />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground uppercase font-semibold">ATS Score</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ResumeLabPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { profile } = useOnboardingStore();
  const { dispatch, onboarding, resume: storeResume } = useDashboardStore();

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [ats, setAts] = useState<ATSScore | null>(null);
  const [advice, setAdvice] = useState<AIAdvice | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from store if exists
  useEffect(() => {
    if (storeResume?.uploaded && storeResume.parsedData && !parsed) {
      // In a real app we might re-run the ATS engine or just show stored results
      // For now, let's allow re-upload or re-parse if needed
    }
  }, [storeResume, parsed]);

  const handleFileUpload = async (file: File) => {
    setProcessing(true);
    setError(null);
    setProgress(10);

    try {
      // 1. Extraction
      const extResult = await extractResumeText(file);
      setExtraction(extResult);
      setProgress(40);

      // 2. Parsing
      const parseResult = parseResume(extResult.rawText);
      setParsed(parseResult);
      setProgress(60);

      // 3. ATS Scoring
      const targetRole = profile.targetRole || onboarding?.targetRole || "Software Engineer";
      const atsResult = calculateATSScore(parseResult, targetRole);
      setAts(atsResult);
      setProgress(80);

      // 4. AI Advice (Async)
      getResumeAdvice(parseResult, atsResult, targetRole).then(setAdvice);

      // 5. Store Update
      dispatch(dashboardActions.setResume({
        uploaded: true,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        extractedText: extResult.rawText,
        parsedData: parseResult as any,
        atsScore: atsResult.total,
        feedback: atsResult.categories as any // Simplified for now
      }));

      setProgress(100);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h1 className="font-bold text-lg">Resume Intelligence Lab</h1>
          </div>
        </div>

        {ats && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`${getScoreBg(ats.total)} ${getScoreColor(ats.total)} border-none px-3 py-1 font-bold`}>
              ATS: {ats.total}/100
            </Badge>
            <Button size="sm" onClick={() => fileInputRef.current?.click()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-upload
            </Button>
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Status & Stats */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 flex flex-col gap-6">
          {!ats ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold">Upload Resume</h3>
                <p className="text-sm text-muted-foreground">Upload a PDF or DOCX to begin deep analysis.</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                {processing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Select File
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center gap-4">
                <CircularProgress score={ats.total} />
                <div>
                  <h2 className="text-xl font-bold">Analysis Complete</h2>
                  <p className="text-xs text-muted-foreground mt-1">Based on {profile.targetRole || "target role"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pipeline Metadata</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Layout className="w-3.5 h-3.5" /> Extraction</span>
                    <span className="font-medium text-blue-600">{extraction?.extractionMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Confidence</span>
                    <span className="font-medium">{Math.round((extraction?.confidence || 0) * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Match</span>
                    <span className="font-medium">{Math.round((ats.metrics.skillMatchRatio || 0) * 100)}%</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick Score</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{ats.metrics.quantifiedCount}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Metrics</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{parsed?.skills.length}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Skills</div>
                  </div>
                </div>
              </div>
            </>
          )}
          <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".pdf,.docx,.txt" />
        </aside>

        {/* CENTER PANEL: Content */}
        <main className="flex-1 bg-gray-50 overflow-y-auto p-8">
          {!ats ? (
            <div className="max-w-3xl mx-auto space-y-8 mt-12 text-center">
              <h2 className="text-4xl font-extrabold tracking-tight">Your Resume, <span className="text-blue-600">Perfected.</span></h2>
              <p className="text-xl text-muted-foreground">CareerOS analyzes your resume using enterprise-grade logic used by top recruiters. Get real scores, not just random percentages.</p>

              <div className="grid grid-cols-3 gap-6 mt-12 text-left">
                {[
                  { icon: Shield, title: "OCR Tech", desc: "We parse even low-quality scanned PDFs correctly." },
                  { icon: BarChart3, title: "Weighted ATS", desc: "Real scoring logic based on contact, skills, and metrics." },
                  { icon: Wand2, title: "AI Enhancement", desc: "GPT-4o-mini powered bullet point rewriting." }
                ].map((f, i) => (
                  <Card key={i} className="border-none shadow-sm">
                    <CardContent className="pt-6">
                      <f.icon className="w-8 h-8 text-blue-600 mb-4" />
                      <h4 className="font-bold mb-2">{f.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white p-1 border border-gray-200">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ats">ATS Breakdown</TabsTrigger>
                  <TabsTrigger value="skills">Missing Skills</TabsTrigger>
                  <TabsTrigger value="parsed">Parsed Resume</TabsTrigger>
                  <TabsTrigger value="recruiter">Recruiter View</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" /> ATS Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{advice?.explanation || "Calculating performance insights..."}</p>
                        <div className="space-y-3">
                          {Object.entries(ats.categories).map(([key, val]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <span>{key}</span>
                                <span>{val}/100</span>
                              </div>
                              <Progress value={val} className="h-1.5" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> Actionable Fixes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {(advice?.actionableFixes || ["Quantify achievements", "Complete contact info"]).map((fix, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="skills">
                  <Card>
                    <CardHeader>
                      <CardTitle>Missing Role-Critical Skills</CardTitle>
                      <CardDescription>Based on your target role as a {profile.targetRole || "Professional"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {advice?.missingSkills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="bg-red-50 text-red-700 border-red-100 px-3 py-1">
                            + {skill}
                          </Badge>
                        ))}
                        {(!advice || advice.missingSkills.length === 0) && (
                          <p className="text-sm text-muted-foreground">All major skills for this role were detected.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="parsed">
                   <Card>
                    <CardHeader>
                      <CardTitle>Structured Data Extraction</CardTitle>
                      <CardDescription>What the ATS actually sees in your resume.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground">Name</div>
                          <div className="font-medium">{parsed?.contact.name || "Not detected"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground">Email</div>
                          <div className="font-medium">{parsed?.contact.email || "Not detected"}</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold border-b pb-2">Professional Experience</h4>
                        {parsed?.experience.map((exp, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-sm">{exp.role}</span>
                              <span className="text-xs text-muted-foreground">{exp.duration}</span>
                            </div>
                            <div className="text-xs font-medium text-blue-600">{exp.company}</div>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              {exp.bullets.map((b, j) => (
                                <li key={j} className="text-xs text-muted-foreground">{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>

        {/* RIGHT PANEL: AI Assistant */}
        <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Wand2 className="w-5 h-5" />
            <h3 className="font-bold">AI Intelligence Advisor</h3>
          </div>

          {!ats ? (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Upload your resume to receive AI-powered bullet point rewrites and recruiter tips.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                  <Info className="w-3 h-3" /> Pro Tip
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Recruiters spend an average of 6 seconds on a resume. Focus on making your top 3 achievements quantified with percentages.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bullet Rewrites</h4>
                <div className="space-y-4">
                  {advice?.bulletRewrites.map((item, i) => (
                    <div key={i} className="space-y-2 group">
                      <div className="p-3 bg-red-50 rounded-lg text-[11px] text-red-600 italic border border-red-100">
                        "{item.original}"
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg text-[11px] text-green-700 font-medium border border-green-100 flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Improved version
                        </span>
                        "{item.improved}"
                      </div>
                    </div>
                  ))}
                  {!advice && (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full text-xs" size="sm">
                View All Improvements
              </Button>
            </div>
          )}
        </aside>
      </div>

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full shadow-2xl">
            <CardContent className="pt-8 flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div className="text-center space-y-2 w-full">
                <h3 className="font-bold text-lg">Analyzing Resume...</h3>
                <p className="text-sm text-muted-foreground">Running multi-layer extraction & ATS verification</p>
                <Progress value={progress} className="h-2 w-full mt-4" />
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase mt-2">
                  <span>Extracting</span>
                  <span>Scoring</span>
                  <span>AI Enhancement</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
