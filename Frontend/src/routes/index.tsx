import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Pipeline } from "@/components/landing/Pipeline";
import { Features } from "@/components/landing/Features";
import { Team } from "@/components/landing/Team";
import { About } from "@/components/landing/About";
import { Contact } from "@/components/landing/Contact";
import { CTA } from "@/components/landing/CTA";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <SmoothScroll />
      <Navbar />
      <main className="noise relative w-full overflow-x-hidden">
        <Hero />
        <Problem />
        <Pipeline />
        <Features />
        <Team />
        <About />
        <Contact />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
