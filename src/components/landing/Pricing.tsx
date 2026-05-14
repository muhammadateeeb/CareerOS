import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { analytics } from "@/lib/analytics";

const tiers = [
  {
    name: "Starter",
    price: 19,
    tag: "For active job seekers",
    features: [
      "Resume optimization (3/mo)",
      "ATS score & feedback",
      "20 job matches/day",
      "Basic cover letters",
    ],
    cta: "Start with Starter",
    highlight: false,
  },
  {
    name: "Pro",
    price: 49,
    tag: "Most popular",
    features: [
      "Unlimited resume rewrites",
      "Smart job matching engine",
      "Application strategy playbook",
      "LinkedIn optimization",
      "AI cover letter generator",
    ],
    cta: "Get Pro",
    highlight: true,
  },
  {
    name: "Elite",
    price: 99,
    tag: "Career acceleration",
    features: [
      "Everything in Pro",
      "1:1 AI interview coaching",
      "Recruiter outreach automation",
      "Salary negotiation toolkit",
      "Priority human review",
    ],
    cta: "Go Elite",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pricing
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple plans. Real interviews.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cancel anytime. 14-day money-back guarantee on every plan.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl bg-card p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] ${
                t.highlight
                  ? "border-2 border-primary shadow-[var(--shadow-glow)]"
                  : "border border-border"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                  Most popular
                </span>
              )}

              <div className="text-sm font-semibold text-primary">{t.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t.tag}</div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-foreground">${t.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>

              <Link to="/signup">
                <Button
                  size="lg"
                  variant={t.highlight ? "hero" : "outline"}
                  className="mt-6 w-full"
                  onClick={() => {
                    analytics.track('pricing_cta_click', {
                      plan: t.name,
                      price: t.price,
                      timestamp: new Date().toISOString(),
                    });
                  }}
                >
                  {t.cta}
                </Button>
              </Link>

              <ul className="mt-7 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
