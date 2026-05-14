import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundImage: "var(--gradient-bg)" }}
    >
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
          C
        </div>
        <span className="text-xl font-semibold tracking-tight text-foreground">
          CareerOS
        </span>
      </Link>

      <div
        className="w-full max-w-md rounded-2xl bg-card border border-border p-8"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
    </div>
  );
}
