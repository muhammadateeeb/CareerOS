import { Briefcase } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Dashboard", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Blog", "Help Center", "Privacy", "Terms"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <a href="#top" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Briefcase className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">CareerOS</span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The AI Job Success System. Optimize your resume, match to high-fit jobs, and get more
              interviews.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold text-foreground">{c.title}</div>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CareerOS. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Made for job seekers, worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
