const logos = ["Stripe", "Notion", "Linear", "Figma", "Vercel", "GitHub"];

export function TrustBar() {
  return (
    <section className="border-b border-border bg-background py-12">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Trusted by job seekers in tech, remote, and global markets
        </p>
        <div className="mt-8 grid grid-cols-2 items-center gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo) => (
            <div
              key={logo}
              className="text-center text-xl font-bold tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
