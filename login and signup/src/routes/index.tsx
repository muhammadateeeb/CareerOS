import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerOS — Land more interviews with AI" },
      { name: "description", content: "CareerOS is the AI job platform that helps you tailor resumes, track applications, and ace interviews." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ backgroundImage: "var(--gradient-bg)" }}
    >
      <header className="mx-auto w-full max-w-6xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
            C
          </div>
          <span className="font-semibold tracking-tight text-foreground">CareerOS</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-primary text-primary-foreground px-3.5 py-2 text-sm font-semibold transition hover:opacity-95"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> The AI job platform
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight text-foreground">
            Land more interviews.
            <br />
            <span className="text-primary">Faster.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            CareerOS tailors your resume, tracks every application, and coaches you through
            interviews — so you spend less time searching and more time succeeding.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold transition hover:opacity-95"
            >
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              I already have one
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
