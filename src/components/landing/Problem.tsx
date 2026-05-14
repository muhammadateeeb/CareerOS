import { ShieldX, KeyRound, Crosshair, Linkedin } from "lucide-react";

const problems = [
  {
    icon: ShieldX,
    title: "ATS filters reject resumes",
    desc: "75% of resumes never reach a human. Most are filtered out by automated tracking systems before review.",
  },
  {
    icon: KeyRound,
    title: "No keyword optimization",
    desc: "Generic resumes miss the exact keywords recruiters and ATS scanners are actually searching for.",
  },
  {
    icon: Crosshair,
    title: "Poor job targeting",
    desc: "Spraying applications wastes time. Without fit scoring, you apply to roles you'll never get callbacks from.",
  },
  {
    icon: Linkedin,
    title: "Weak LinkedIn profile",
    desc: "Recruiters search LinkedIn first. An unoptimized profile means inbound opportunities pass you by.",
  },
];

export function Problem() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The problem
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Why Most Job Applications Fail
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Even strong candidates get filtered out. The job market isn't a meritocracy — it's a
            system, and systems can be optimized.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
