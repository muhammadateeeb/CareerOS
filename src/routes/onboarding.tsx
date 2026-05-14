import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { ChevronLeft, ChevronRight, CheckCircle, Briefcase, Wrench, MapPin, DollarSign, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useOnboardingStore } from "@/store/onboardingStore";
import { useDashboardStore, dashboardActions } from "@/store/dashboardStore";
import { RoleCombobox } from "@/components/onboarding/RoleCombobox";
import { SkillsInput } from "@/components/onboarding/SkillsInput";
import { CountrySelector } from "@/components/onboarding/CountrySelector";
import { getAllIndustries } from "@/data/industries";
import { analytics } from "@/lib/analytics";

import {
  validateBasicInfo,
  validateSkills,
  validatePreferences,
  validateProfiles,
} from "@/lib/onboardingValidation";
import type { UserCareerProfile } from "@/types/onboarding";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Complete Your Profile — CareerOS" },
      { name: "description", content: "Set up your CareerOS profile to get personalised job recommendations." },
    ],
  }),
  component: OnboardingPage,
});

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: "basic-info",   title: "Career Goals",         description: "Tell us about the role you're targeting",       icon: Briefcase },
  { id: "skills",       title: "Skills & Expertise",   description: "Add the skills that define your expertise",     icon: Wrench    },
  { id: "preferences",  title: "Work Preferences",     description: "Where and how do you want to work?",            icon: MapPin    },
  { id: "salary",       title: "Salary Expectations",  description: "What compensation are you targeting?",          icon: DollarSign },
  { id: "profiles",     title: "Professional Profiles", description: "Link your online presence (all optional)",     icon: Link2     },
] as const;

type StepId = typeof STEPS[number]["id"];

const EXPERIENCE_LEVELS = [
  "Entry Level (0-2 years)",
  "Junior (2-4 years)",
  "Mid-Level (4-7 years)",
  "Senior (7-10 years)",
  "Lead/Principal (10+ years)",
  "Executive/Management",
] as const;

// ─── Main component ───────────────────────────────────────────────────────────

function OnboardingPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  // New onboarding store (single source of truth)
  const {
    profile,
    updateProfile,
    addSkill,
    removeSkill,
    isCompleted,
    resetOnboarding,
  } = useOnboardingStore();

  // Dashboard store — only used to sync on completion
  const { dispatch } = useDashboardStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = STEPS.length;
  const step = STEPS[currentStep];
  const progressPct = Math.round(((currentStep) / totalSteps) * 100);

  // If already completed, go straight to dashboard
  useEffect(() => {
    if (isCompleted) {
      navigate({ to: "/dashboard" });
    }
  }, [isCompleted, navigate]);

  // ── Validation per step ──────────────────────────────────────────────────

  const validateStep = (stepId: StepId): boolean => {
    let result: { success: boolean; errors: Record<string, string> };

    switch (stepId) {
      case "basic-info":
        result = validateBasicInfo(profile);
        break;
      case "skills":
        result = validateSkills(profile);
        break;
      case "preferences":
        result = validatePreferences(profile);
        break;
      case "salary":
        // salary is optional — always valid
        result = { success: true, errors: {} };
        break;
      case "profiles":
        result = validateProfiles(profile);
        break;
      default:
        result = { success: true, errors: {} };
    }

    if (!result.success) {
      setErrors(result.errors);
      return false;
    }
    setErrors({});
    return true;
  };

  // ── Navigation ───────────────────────────────────────────────────────────

  const handleNext = async () => {
    if (!validateStep(step.id)) return;

    analytics.track("onboarding_step_completed", {
      stepId: step.id,
      stepTitle: step.title,
    });

    if (currentStep < totalSteps - 1) {
      setCurrentStep((p) => p + 1);
    } else {
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((p) => p - 1);
      setErrors({});
    }
  };

  // ── Completion ───────────────────────────────────────────────────────────

  const handleComplete = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();

      // Finalise profile in onboarding store
      updateProfile({ createdAt: profile.createdAt || now });

      // Sync into dashboard store so dashboard/ATS/jobs can read it
      dispatch(
        dashboardActions.setOnboarding({
          targetRole:      profile.targetRole      ?? "",
          industry:        profile.industry        ?? "",
          experienceLevel: (profile.experienceLevel as any) ?? "mid",
          skills:          profile.skills          ?? [],
          country:         profile.country         ?? "",
          workType:        (profile.workPreference as any) ?? "remote",
          salaryTarget: {
            min:      profile.salaryExpectation ?? 0,
            max:      profile.salaryExpectation ?? 0,
            currency: "USD",
          },
          linkedinUrl:  profile.linkedinUrl  ?? undefined,
          completed:    true,
          completedAt:  now,
        })
      );
      dispatch(dashboardActions.completeOnboarding());

      // Mark onboarding store as completed
      useOnboardingStore.setState({ isCompleted: true });

      analytics.track("onboarding_completed", {
        userId: user.id,
        completedAt: now,
      });

      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Guard ────────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to continue.</p>
      </div>
    );
  }

  const StepIcon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your CareerOS Profile
          </h1>
          <p className="text-gray-600 mb-6">
            Help us understand your career goals so we can personalise everything for you.
          </p>

          {/* Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{progressPct}% complete</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        </div>

        {/* ── Step card ── */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <StepIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            {/* ── Step content ── */}
            {step.id === "basic-info" && (
              <BasicInfoStep
                profile={profile}
                errors={errors}
                onChange={(field, val) => {
                  updateProfile({ [field]: val } as Partial<UserCareerProfile>);
                  if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
                }}
              />
            )}

            {step.id === "skills" && (
              <SkillsStep
                skills={profile.skills ?? []}
                error={errors.skills}
                onAdd={addSkill}
                onRemove={removeSkill}
              />
            )}

            {step.id === "preferences" && (
              <PreferencesStep
                profile={profile}
                errors={errors}
                onChange={(field, val) => {
                  updateProfile({ [field]: val } as Partial<UserCareerProfile>);
                  if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
                }}
              />
            )}

            {step.id === "salary" && (
              <SalaryStep
                value={profile.salaryExpectation}
                error={errors.salaryExpectation}
                onChange={(val) => updateProfile({ salaryExpectation: val })}
              />
            )}

            {step.id === "profiles" && (
              <ProfilesStep
                profile={profile}
                errors={errors}
                onChange={(field, val) => {
                  updateProfile({ [field]: val } as Partial<UserCareerProfile>);
                  if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* ── Navigation ── */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button onClick={handleNext} disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? (
              "Saving..."
            ) : currentStep === totalSteps - 1 ? (
              <>
                Complete
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* ── Step dots ── */}
        <div className="flex justify-center mt-8 gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentStep
                  ? "bg-blue-600"
                  : i < currentStep
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step sub-components ──────────────────────────────────────────────────────

function BasicInfoStep({
  profile,
  errors,
  onChange,
}: {
  profile: Partial<UserCareerProfile>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  const industries = getAllIndustries();

  return (
    <div className="space-y-5">
      {/* Target role */}
      <div className="space-y-2">
        <Label>Target Role <span className="text-red-500">*</span></Label>
        <RoleCombobox
          value={profile.targetRole ?? ""}
          onChange={(v) => onChange("targetRole", v)}
          placeholder="e.g. Software Engineer, SOC Analyst…"
        />
        {errors.targetRole && <p className="text-sm text-red-500">{errors.targetRole}</p>}
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label>Industry <span className="text-red-500">*</span></Label>
        <Select
          value={profile.industry ?? ""}
          onValueChange={(v) => onChange("industry", v)}
        >
          <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
            <SelectValue placeholder="Select your target industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((ind) => (
              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
      </div>

      {/* Experience level */}
      <div className="space-y-2">
        <Label>Experience Level <span className="text-red-500">*</span></Label>
        <Select
          value={profile.experienceLevel ?? ""}
          onValueChange={(v) => onChange("experienceLevel", v)}
        >
          <SelectTrigger className={errors.experienceLevel ? "border-red-500" : ""}>
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_LEVELS.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.experienceLevel && <p className="text-sm text-red-500">{errors.experienceLevel}</p>}
      </div>
    </div>
  );
}

function SkillsStep({
  skills,
  error,
  onAdd,
  onRemove,
}: {
  skills: string[];
  error?: string;
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>
        Your Skills <span className="text-red-500">*</span>
        <span className="ml-2 text-xs text-muted-foreground font-normal">(at least 1 required)</span>
      </Label>
      <SkillsInput
        value={skills}
        onChange={(updated) => {
          // Reconcile: add new, remove deleted
          const toAdd = updated.filter((s) => !skills.includes(s));
          const toRemove = skills.filter((s) => !updated.includes(s));
          toAdd.forEach(onAdd);
          toRemove.forEach(onRemove);
        }}
        placeholder="Type a skill and press Enter…"
        maxSkills={20}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function PreferencesStep({
  profile,
  errors,
  onChange,
}: {
  profile: Partial<UserCareerProfile>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Country */}
      <div className="space-y-2">
        <Label>Country <span className="text-red-500">*</span></Label>
        <CountrySelector
          value={profile.country ?? ""}
          onChange={(v) => onChange("country", v)}
          placeholder="Search your country…"
        />
        {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
      </div>

      {/* Work preference */}
      <div className="space-y-2">
        <Label>Work Arrangement <span className="text-red-500">*</span></Label>
        <Select
          value={profile.workPreference ?? ""}
          onValueChange={(v) => onChange("workPreference", v)}
        >
          <SelectTrigger className={errors.workPreference ? "border-red-500" : ""}>
            <SelectValue placeholder="Select work arrangement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>
        {errors.workPreference && <p className="text-sm text-red-500">{errors.workPreference}</p>}
      </div>
    </div>
  );
}

function SalaryStep({
  value,
  error,
  onChange,
}: {
  value?: number;
  error?: string;
  onChange: (val: number | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>
        Expected Annual Salary
        <span className="ml-2 text-xs text-muted-foreground font-normal">(optional)</span>
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
        <Input
          type="number"
          min={0}
          max={10000000}
          value={value ?? ""}
          onChange={(e) => {
            const n = e.target.value === "" ? undefined : Number(e.target.value);
            onChange(n);
          }}
          placeholder="e.g. 90000"
          className={`pl-7 ${error ? "border-red-500" : ""}`}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Enter your expected gross annual salary in USD. This helps us surface relevant opportunities.
      </p>
    </div>
  );
}

function ProfilesStep({
  profile,
  errors,
  onChange,
}: {
  profile: Partial<UserCareerProfile>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <UrlField
        label="LinkedIn URL"
        field="linkedinUrl"
        value={profile.linkedinUrl ?? ""}
        error={errors.linkedinUrl}
        placeholder="https://linkedin.com/in/yourprofile"
        onChange={onChange}
      />
      <UrlField
        label="GitHub URL"
        field="githubUrl"
        value={profile.githubUrl ?? ""}
        error={errors.githubUrl}
        placeholder="https://github.com/yourusername"
        onChange={onChange}
      />
      <UrlField
        label="Portfolio / Website"
        field="portfolioUrl"
        value={profile.portfolioUrl ?? ""}
        error={errors.portfolioUrl}
        placeholder="https://yourportfolio.com"
        onChange={onChange}
      />
    </div>
  );
}

function UrlField({
  label,
  field,
  value,
  error,
  placeholder,
  onChange,
}: {
  label: string;
  field: string;
  value: string;
  error?: string;
  placeholder: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        <span className="ml-2 text-xs text-muted-foreground font-normal">(optional)</span>
      </Label>
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
