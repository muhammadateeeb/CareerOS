import { Star } from "lucide-react";

const items = [
  {
    quote: "Got 3 interviews in 10 days after months of silence. The match scoring alone is worth the price.",
    name: "Maya R.",
    role: "Senior Product Manager",
    initials: "MR",
  },
  {
    quote: "ATS score improved instantly from 62 to 91. Recruiters started reaching out within a week.",
    name: "David K.",
    role: "Software Engineer",
    initials: "DK",
  },
  {
    quote: "Finally a structured job search. CareerOS replaced 5 tools and a spreadsheet I hated.",
    name: "Priya S.",
    role: "Data Scientist",
    initials: "PS",
  },
];

export function Testimonials() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Loved by job seekers
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Real outcomes, not just better resumes
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="flex gap-0.5 text-success">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-base leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {t.initials}
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
