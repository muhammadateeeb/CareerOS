import {
  FileText,
  Search,
  Zap,
  Mail,
  Linkedin,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Resume Optimization",
    desc: "AI rewrites bullets, fixes formatting, and tunes keywords until your ATS score breaks 90%.",
  },
  {
    icon: Search,
    title: "Smart Job Matching",
    desc: "We score every job against your profile in real time so you only apply where you actually fit.",
  },
  {
    icon: Zap,
    title: "Application Strategy Engine",
    desc: "Daily playbook telling you exactly which roles to apply to, in what order, and how.",
  },
  {
    icon: Mail,
    title: "Cover Letter Generator",
    desc: "Tailored, recruiter-grade letters in 30 seconds — personalized to the role and company.",
  },
  {
    icon: Linkedin,
    title: "LinkedIn Optimization",
    desc: "Headline, About, and skills rewritten to maximize recruiter inbound and search ranking.",
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation AI",
    desc: "Practice real interview questions with instant feedback on structure, clarity, and impact.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The solution
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your AI Career Operating System
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Six integrated tools, one connected workflow. Built to turn applications into interviews.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.62_0.20_250)] text-primary-foreground shadow-[var(--shadow-glow)]">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="relative mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Learn more →
              </div>
              <span className="sr-only">Feature {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
