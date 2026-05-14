import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  Linkedin,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "CareerOS Dashboard | AI Job Success System" },
      {
        name: "description",
        content:
          "Premium AI career operating dashboard for tracking job matches, applications, resume health, interviews, and hiring momentum.",
      },
      { property: "og:title", content: "CareerOS Dashboard | AI Job Success System" },
      {
        property: "og:description",
        content:
          "Track hire readiness, high-fit jobs, application pipeline, and AI next best actions in CareerOS.",
      },
    ],
  }),
  component: DashboardPage,
});

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Resume Lab", icon: FileText },
  { label: "Job Matches", icon: Target },
  { label: "Applications", icon: BriefcaseBusiness },
  { label: "Cover Letters", icon: MessageSquareText },
  { label: "LinkedIn Boost", icon: Linkedin },
  { label: "Interview Prep", icon: UserRound },
  { label: "Analytics", icon: TrendingUp },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
];

const kpis = [
  { label: "ATS Score", value: "87%", note: "+11 this week", icon: Gauge, tone: "blue" },
  {
    label: "Matched Jobs Today",
    value: "24",
    note: "+7 since yesterday",
    icon: Target,
    tone: "green",
  },
  {
    label: "Applications This Week",
    value: "11",
    note: "Goal: 20",
    icon: BriefcaseBusiness,
    tone: "amber",
  },
  { label: "Interview Rate", value: "18%", note: "Trending up", icon: TrendingUp, tone: "blue" },
];

const jobs = [
  { company: "Google", role: "Security Analyst", match: "94%", salary: "$95k", action: "Apply" },
  { company: "Amazon", role: "SOC Analyst", match: "91%", salary: "$88k", action: "View" },
  { company: "RemoteCo", role: "Python Engineer", match: "89%", salary: "$72k", action: "Apply" },
  { company: "CloudX", role: "Junior Pentester", match: "87%", salary: "$68k", action: "Apply" },
];

const pipeline = [
  { title: "Saved", cards: ["Cloud incident analyst", "Remote SOC tier 1"] },
  { title: "Applied", cards: ["Amazon SOC Analyst", "RemoteCo Python Engineer"] },
  { title: "Interview", cards: ["Google Security Analyst"] },
  { title: "Offer", cards: ["CloudX Junior Pentester"] },
];

const trendData = [
  { day: "W1", applications: 4, replies: 1 },
  { day: "W2", applications: 8, replies: 2 },
  { day: "W3", applications: 14, replies: 4 },
  { day: "W4", applications: 11, replies: 5 },
  { day: "Now", applications: 18, replies: 7 },
];

const recommendations = [
  ["Add Python automation keywords to resume", "High"],
  ["Apply to 3 remote SOC roles today", "High"],
  ["Improve LinkedIn headline", "Medium"],
  ["Follow up on Amazon application", "Medium"],
];

function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className="min-h-screen bg-surface text-foreground">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-24" : "lg:pl-72")}>
        <TopHeader
          onOpenMobile={() => setMobileOpen(true)}
          onToggle={() => setCollapsed((value) => !value)}
        />
        <section className="animate-dashboard-in mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <HeroBanner />
          <KpiGrid />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.85fr)]">
            <div className="space-y-6">
              <JobMatches />
              <Pipeline />
              <TrendChart />
            </div>
            <aside className="space-y-6">
              <AiRecommendations />
              <ResumeHealth />
              <InterviewPrep />
              <LinkedInBoost />
              <BillingWidget />
            </aside>
          </div>
          <LowerSections />
        </section>
      </div>
    </main>
  );
}

function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const sidebar = (
    <div className="flex h-full flex-col border-r border-border bg-background px-4 py-5 shadow-soft">
      <div className="mb-7 flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && <div className="text-xl font-bold tracking-tight">CareerOS</div>}
        </div>
        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              item.active
                ? "bg-brand-soft text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      <div
        className={cn(
          "rounded-2xl border border-brand-ring bg-brand-soft p-4",
          collapsed && "hidden",
        )}
      >
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold">Upgrade to Pro</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Unlock unlimited AI applications and interview practice.
        </p>
        <Button variant="premium" size="sm" className="mt-4 w-full">
          Upgrade Plan
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 lg:block",
          collapsed ? "w-24" : "w-72",
        )}
      >
        {sidebar}
      </aside>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-foreground/25 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>
    </>
  );
}

function TopHeader({ onOpenMobile, onToggle }: { onOpenMobile: () => void; onToggle: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl border border-border bg-background p-2 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={onOpenMobile}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            className="hidden rounded-xl border border-border bg-background p-2 text-muted-foreground hover:text-foreground lg:inline-flex"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Welcome back, Ateeb 👋</h1>
            <p className="text-sm text-muted-foreground">Let’s get you hired faster today.</p>
          </div>
        </div>
        <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
          <label className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-brand-ring"
              placeholder="Search jobs, companies..."
            />
          </label>
          <button
            className="rounded-xl border border-border bg-background p-2.5 text-muted-foreground shadow-sm hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 pr-2 text-sm font-medium shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              A
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}

function HeroBanner() {
  return (
    <section className="dashboard-hero overflow-hidden rounded-2xl p-6 text-primary-foreground sm:p-8">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_220px]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-sm font-medium backdrop-blur">
            <ShieldCheck className="h-4 w-4" /> Career momentum updated
          </div>
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            Your profile strength improved this week.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/85 sm:text-base">
            ATS score increased by +11 points. 8 new job matches available today.
          </p>
          <Button className="mt-6 bg-background text-primary hover:bg-background/90">
            View Recommendations <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
        <ProgressRing value={87} />
      </div>
    </section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="mx-auto grid h-44 w-44 place-items-center rounded-full bg-background/15 backdrop-blur">
      <svg
        className="h-36 w-36 -rotate-90"
        viewBox="0 0 120 120"
        aria-label={`${value}% Hire Readiness`}
      >
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute text-center">
        <div className="animate-count-pop text-3xl font-bold">{value}%</div>
        <div className="text-xs font-medium text-primary-foreground/80">Hire Readiness</div>
      </div>
    </div>
  );
}

function KpiGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => (
        <article
          key={kpi.label}
          className="dashboard-card p-5"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <p className="animate-count-pop mt-2 text-3xl font-bold tracking-tight">
                {kpi.value}
              </p>
              <p className="mt-2 text-sm text-success">{kpi.note}</p>
            </div>
            <div
              className={cn(
                "rounded-xl p-2.5",
                kpi.tone === "green"
                  ? "bg-success/10 text-success"
                  : kpi.tone === "amber"
                    ? "bg-warning/15 text-warning"
                    : "bg-brand-soft text-primary",
              )}
            >
              <kpi.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.slice(0, 4)}>
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="var(--primary)"
                  fill="var(--brand-soft)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      ))}
    </section>
  );
}

function JobMatches() {
  return (
    <Card title="High-Fit Opportunities" action={<SegmentedFilters />}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring"
            placeholder="Search roles or companies"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-3 font-semibold">Company</th>
              <th className="py-3 font-semibold">Role</th>
              <th className="py-3 font-semibold">Match %</th>
              <th className="py-3 font-semibold">Salary</th>
              <th className="py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={`${job.company}-${job.role}`}
                className="border-b border-border/70 last:border-0"
              >
                <td className="py-4 font-semibold">{job.company}</td>
                <td className="py-4 text-muted-foreground">{job.role}</td>
                <td className="py-4">
                  <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                    {job.match}
                  </span>
                </td>
                <td className="py-4 font-medium">{job.salary}</td>
                <td className="py-4 text-right">
                  <Button variant="premium" size="sm">
                    {job.action}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SegmentedFilters() {
  return (
    <div className="flex rounded-xl border border-border bg-surface p-1 text-xs font-medium">
      {["Remote", "Onsite", "Hybrid"].map((filter, index) => (
        <button
          key={filter}
          className={cn(
            "rounded-lg px-3 py-1.5 transition",
            index === 0
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

function Pipeline() {
  return (
    <Card title="Application Pipeline">
      <div className="grid gap-3 md:grid-cols-4">
        {pipeline.map((column) => (
          <div key={column.title} className="rounded-2xl border border-border bg-surface p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {column.cards.length}
              </span>
            </div>
            <div className="space-y-2">
              {column.cards.map((card) => (
                <div
                  key={card}
                  className="rounded-xl border border-border bg-background p-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5"
                >
                  {card}
                  <p className="mt-2 text-xs text-muted-foreground">AI score improving</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TrendChart() {
  return (
    <Card
      title="Response Trend"
      action={<span className="text-sm text-muted-foreground">Last 30 days</span>}
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 14,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-soft)",
              }}
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="replies"
              stroke="var(--success)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function AiRecommendations() {
  return (
    <Card title="Next Best Actions" icon={<Sparkles className="h-5 w-5 text-primary" />}>
      <div className="space-y-3">
        {recommendations.map(([item, priority], index) => (
          <div key={item} className="flex gap-3 rounded-xl border border-border p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-primary">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-5">{item}</p>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                  priority === "High"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-warning/15 text-warning",
                )}
              >
                {priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ResumeHealth() {
  const checks = [
    ["ATS formatting optimized", true],
    ["Keywords added", true],
    ["Grammar clean", true],
    ["Quantified achievements missing", false],
    ["Certifications should move higher", false],
  ] as const;
  return (
    <Card title="Resume Health">
      <div className="space-y-3">
        {checks.map(([text, ok]) => (
          <div key={text} className="flex items-center gap-2 text-sm">
            {ok ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">
                !
              </span>
            )}
            <span className={ok ? "text-foreground" : "text-muted-foreground"}>{text}</span>
          </div>
        ))}
      </div>
      <Button variant="blueOutline" className="mt-5 w-full">
        Open Resume Lab
      </Button>
    </Card>
  );
}

function InterviewPrep() {
  return (
    <Card title="Likely Questions for Security Analyst">
      <ul className="space-y-2 text-sm text-muted-foreground">
        {[
          "Tell me about yourself",
          "Explain SIEM tools experience",
          "How do you handle incidents?",
          "Why should we hire you?",
        ].map((q) => (
          <li key={q} className="rounded-xl bg-surface px-3 py-2">
            {q}
          </li>
        ))}
      </ul>
      <Button variant="premium" className="mt-5 w-full">
        Practice Now
      </Button>
    </Card>
  );
}

function LinkedInBoost() {
  return (
    <Card title="LinkedIn Boost">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Profile Strength</span>
        <span className="text-2xl font-bold">72%</span>
      </div>
      <ProgressBar value={72} />
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {["Better headline needed", "Add banner", "Add featured projects"].map((tip) => (
          <li key={tip}>• {tip}</li>
        ))}
      </ul>
      <Button variant="blueOutline" className="mt-5 w-full">
        Optimize LinkedIn
      </Button>
    </Card>
  );
}

function BillingWidget() {
  return (
    <Card title="Billing">
      <div className="flex items-center justify-between rounded-xl bg-surface p-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Plan</p>
          <p className="font-bold">Pro</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Renewal</p>
          <p className="font-bold">May 28</p>
        </div>
      </div>
      <Button variant="blueOutline" className="mt-4 w-full">
        Manage Billing
      </Button>
    </Card>
  );
}

function LowerSections() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr_0.85fr]">
      <Card title="Weekly Goals">
        <div className="space-y-5">
          <Goal label="Apply to 20 jobs" value={55} />
          <Goal label="2 mock interviews" value={50} />
          <Goal label="LinkedIn updates" value={80} />
        </div>
      </Card>
      <Card title="Success Stories">
        <p className="text-3xl font-bold tracking-tight">3 interviews</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Users like you got 3 interviews this week.
        </p>
      </Card>
      <Card title="Momentum">
        <p className="text-2xl font-bold tracking-tight">Consistency beats random applying.</p>
        <Button variant="premium" className="mt-5">
          Quick settings <Settings className="h-4 w-4" />
        </Button>
      </Card>
    </section>
  );
}

function Goal({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-brand-soft">
      <div
        className="progress-fill h-full rounded-full bg-primary"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Card({
  title,
  children,
  action,
  icon,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  const id = useMemo(() => title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), [title]);
  return (
    <section className="dashboard-card p-5 sm:p-6" aria-labelledby={id}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 id={id} className="text-lg font-bold tracking-tight">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
