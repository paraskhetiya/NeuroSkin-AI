import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { ResponsiveBlob } from "../ResponsiveBlob";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-screen w-full items-center overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="container relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-24 sm:gap-12 sm:px-6 md:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] text-muted-foreground sm:text-xs"
          >
            <Sparkles className="h-3 w-3 text-cyan" />
            Multimodal AI · Image + Symptom Fusion
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Decode your skin.
            <br />
            <span className="text-gradient-animated">Instantly.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-5 max-w-xl text-base text-muted-foreground sm:mt-6 sm:text-lg"
          >
            NeuroSkin AI fuses computer vision with clinical reasoning. Upload a photo,
            answer a few smart questions, and get a refined prediction across 20+ skin
            conditions in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9"
          >
            <Link
              to="/chat"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-bio px-5 py-3 font-medium text-background shadow-[0_0_40px_oklch(0.86_0.15_210/0.45)] transition-transform hover:scale-[1.03]"
            >
              Try the diagnosis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how"
              className="glass rounded-xl px-5 py-3 text-sm text-foreground transition-colors hover:bg-white/5"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm sm:mt-12 sm:gap-6"
          >
            <Stat value="98%" label="Top-3 accuracy" />
            <Stat value="8+" label="Conditions" />
            <Stat value="<15s" label="Inference" />
          </motion.div>
        </div>

        <div className="relative mx-auto h-[300px] w-full max-w-[480px] sm:h-[420px] md:h-[600px]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan/20 via-violet/10 to-bio/20 blur-3xl" />
          <ResponsiveBlob />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-muted-foreground/60 sm:block">
        scroll
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-gradient-brand">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
