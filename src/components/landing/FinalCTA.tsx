import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
      {/* decorative */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-success/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Stop Applying Blindly.
          <br />
          Start Getting Interviews.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-primary-foreground/80">
          Join thousands of job seekers using CareerOS to land high-fit roles faster.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup">
            <Button size="xl" variant="hero">
              Start CareerOS Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <span className="text-sm text-primary-foreground/70">
            Free 14-day trial · No credit card
          </span>
        </div>
      </div>
    </section>
  );
}
