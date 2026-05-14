import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Send,
  MessageSquare,
  BarChart3,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FileText, label: "Resume" },
  { icon: Briefcase, label: "Jobs" },
  { icon: Send, label: "Applications" },
  { icon: MessageSquare, label: "Interviews" },
  { icon: BarChart3, label: "Analytics" },
];

export function DashboardSection() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Live product
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            One dashboard for your entire job search
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See your ATS score, match rate, application pipeline and interview probability — all in
            real time.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
          {/* chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>

          <div className="grid grid-cols-12">
            {/* sidebar */}
            <aside className="col-span-3 border-r border-border bg-card p-4 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2 px-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                  C
                </span>
                <span className="hidden text-sm font-bold text-foreground lg:inline">CareerOS</span>
              </div>
              <nav className="space-y-1">
                {navItems.map((n) => (
                  <a
                    key={n.label}
                    href="#"
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                      n.active
                        ? "bg-primary-soft text-primary"
                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    <n.icon className="h-4 w-4 shrink-0" />
                    <span className="hidden lg:inline">{n.label}</span>
                  </a>
                ))}
              </nav>
            </aside>

            {/* main */}
            <div className="col-span-9 p-6 lg:col-span-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Welcome back, Alex</h3>
                  <p className="text-sm text-muted-foreground">
                    Your application pipeline is performing 28% above benchmark.
                  </p>
                </div>
                <span className="hidden rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success md:inline-flex">
                  ● All systems active
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashCard label="ATS Score" value="92%" sub="+5 this week" tone="success" />
                <DashCard label="Job Match Score" value="84%" sub="High fit" tone="primary" />
                <DashCard label="Applications Sent" value="38" sub="Last 30 days" tone="primary" />
                <DashCard label="Interview Probability" value="41%" sub="vs 12% avg" tone="success" />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Interview probability over time
                      </div>
                      <div className="text-xs text-muted-foreground">Updated hourly</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                      <TrendingUp className="h-3.5 w-3.5" /> +12%
                    </span>
                  </div>
                  <BigChart />
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="text-sm font-semibold text-foreground">Today's matches</div>
                  <div className="mt-3 space-y-3">
                    {[
                      { c: "Stripe", r: "Senior PM", s: 94 },
                      { c: "Linear", r: "Product Lead", s: 89 },
                      { c: "Notion", r: "Growth PM", s: 82 },
                    ].map((j) => (
                      <div
                        key={j.c}
                        className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
                      >
                        <div>
                          <div className="text-sm font-semibold text-foreground">{j.r}</div>
                          <div className="text-xs text-muted-foreground">{j.c}</div>
                        </div>
                        <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">
                          {j.s}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "success" | "primary";
}) {
  const ring =
    tone === "success" ? "ring-success/20 bg-success-soft text-success" : "ring-primary/20 bg-primary-soft text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
      </div>
      <div className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${ring}`}>
        {sub}
      </div>
    </div>
  );
}

function BigChart() {
  const points = [22, 28, 24, 32, 30, 38, 35, 42, 40, 48, 45, 54, 52, 60, 58, 66];
  const w = 600;
  const h = 160;
  const max = 70;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - (p / max) * (h - 20) - 10;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(37 99 235)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="rgb(37 99 235)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g2)" />
      <path
        d={path}
        fill="none"
        stroke="rgb(37 99 235)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
