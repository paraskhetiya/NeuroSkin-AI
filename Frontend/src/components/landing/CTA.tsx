import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/MagneticButton";

export function CTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-cyan/15 via-background to-bio/15 p-8 text-center sm:p-12 md:p-20"
        >
          <div className="absolute inset-0 grid-bg opacity-30" />
          {/* Aurora blobs */}
          <div className="animate-aurora pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-cyan/30 blur-3xl" />
          <div
            className="animate-aurora pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-violet/25 blur-3xl"
            style={{ animationDelay: "-7s" }}
          />

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-display text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl"
            >
              Your skin deserves
              <br />
              <span className="text-gradient-animated">a second opinion.</span>
            </motion.h2>
            <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground sm:mt-6 sm:text-base">
              No appointments. No waiting rooms. Just upload, answer, and understand —
              powered by NeuroSkin AI.
            </p>
            <MagneticButton className="mt-8 inline-block sm:mt-10" strength={0.4}>
              <Link
                to="/chat"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-bio px-5 py-3.5 text-sm font-medium text-background shadow-[0_0_50px_oklch(0.86_0.15_210/0.5)] transition-transform hover:scale-[1.03] sm:px-6 sm:py-4 sm:text-base"
              >
                Start your free analysis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
