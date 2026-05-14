import { TrendingUp, Briefcase, Send, Target } from "lucide-react";

/** Compact dashboard mock used in the hero. */
export function HeroDashboard() {
  return (
    <div className="relative">
      {/* glow */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-primary/5 to-success/15 blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="ml-3 text-xs font-medium text-muted-foreground">careeros.app/dashboard</span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          <Stat
            icon={<Target className="h-4 w-4" />}
            label="ATS Score"
            value="87%"
            tone="success"
            trend="+12%"
          />
          <Stat
            icon={<Briefcase className="h-4 w-4" />}
            label="Job Matches"
            value="24"
            tone="primary"
            trend="today"
          />
          <Stat
            icon={<Send className="h-4 w-4" />}
            label="Applications"
            value="12"
            tone="primary"
            trend="this week"
          />
          <Stat
            icon={<TrendingUp className="h-4 w-4" />}
            label="Interview Rate"
            value="34%"
            tone="success"
            trend="+8%"
          />
        </div>

        {/* chart card */}
        <div className="mx-4 mb-4 rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Application performance</div>
              <div className="text-xs text-muted-foreground">Last 30 days</div>
            </div>
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
              ▲ 28%
            </span>
          </div>
          <MiniChart />
        </div>
      </div>

      {/* floating badge */}
      <div className="absolute -right-4 top-24 hidden rotate-2 rounded-xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-elevated)] sm:block">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-soft text-success">
            ✓
          </span>
          <div>
            <div className="text-xs font-semibold text-foreground">Resume optimized</div>
            <div className="text-[10px] text-muted-foreground">+18 ATS points</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "success";
  trend: string;
}) {
  const toneClass =
    tone === "success"
      ? "bg-success-soft text-success"
      : "bg-primary-soft text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
          {icon}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">{trend}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MiniChart() {
  // simple SVG line chart with brand colors
  const points = [10, 18, 14, 26, 22, 34, 30, 42, 38, 52, 48, 64];
  const max = Math.max(...points);
  const w = 320;
  const h = 90;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - (p / max) * (h - 10) - 4;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(37 99 235)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(37 99 235)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g1)" />
      <path d={path} fill="none" stroke="rgb(37 99 235)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
