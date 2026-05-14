import { Upload, Sparkles, Trophy, ArrowRight } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Upload,
    title: "Upload Resume",
    desc: "Drop your current resume. We instantly parse experience, skills, and gaps.",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "AI Optimizes",
    desc: "CareerOS rewrites bullets, tunes keywords, and matches you to high-fit roles.",
  },
  {
    n: "03",
    icon: Trophy,
    title: "Get Interviews",
    desc: "Apply with one click and track real interview callbacks in your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            From resume to interviews in 3 steps
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-3xl font-bold text-primary/15">{s.n}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-primary/40 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
