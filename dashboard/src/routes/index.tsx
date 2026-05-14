import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function CareerOSHome() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 text-center">
      <div className="max-w-xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-glow">
          C
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">CareerOS</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          AI Career Operating System for getting interviews faster.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:bg-primary/90"
        >
          Open Dashboard
        </Link>
      </div>
    </div>
  );
}

function Index() {
  return <CareerOSHome />;
}
