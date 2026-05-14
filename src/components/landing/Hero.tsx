import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroDashboard } from "./DashboardPreview";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-border"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div className="lg:col-span-6 lg:pt-6 [animation:var(--animate-fade-in-up)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI Job Success System
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[68px]">
            Get More Interviews.
            <br />
            <span className="bg-gradient-to-r from-primary to-[oklch(0.62_0.20_250)] bg-clip-text text-transparent">
              Not Just Better Resumes.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            CareerOS helps you optimize your resume, match with high-fit jobs, and apply
            strategically using AI — so every application actually lands.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup">
              <Button size="xl" variant="hero">
                Start Free Career Audit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="xl" variant="outline">
                View Dashboard Demo
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success [animation:var(--animate-pulse-soft)]" />
              No credit card required
            </div>
            <div className="hidden sm:block">·</div>
            <div className="hidden sm:block">14-day free trial</div>
          </div>
        </div>

        <div className="lg:col-span-6 [animation:var(--animate-fade-in-up)] [animation-delay:120ms]">
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}
