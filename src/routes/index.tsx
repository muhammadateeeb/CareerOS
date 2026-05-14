import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { Problem } from "@/components/landing/Problem";
import { Features } from "@/components/landing/Features";
import { DashboardSection } from "@/components/landing/DashboardSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "CareerOS — AI Job Success System" },
      {
        name: "description",
        content:
          "CareerOS is the AI-powered job hunting system that helps you optimize your resume, match with high-fit jobs, and apply strategically to get more interviews.",
      },
      { property: "og:title", content: "CareerOS — Get More Interviews, Not Just Better Resumes" },
      {
        property: "og:description",
        content:
          "AI-powered resume optimization, smart job matching, and application strategy. Land high-fit roles faster.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Problem />
        <Features />
        <DashboardSection />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
