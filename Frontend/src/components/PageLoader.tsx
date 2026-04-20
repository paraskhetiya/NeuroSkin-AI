import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Mindblowing first-load curtain.
 * Shows on initial mount, animates a DNA-helix / pulse logo,
 * then peels away in two halves to reveal the app.
 */
export function PageLoader() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const DURATION = 1600;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION);
      // ease-out cubic
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={false}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          aria-hidden
        >
          {/* Top half */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-background"
            initial={{ y: 0 }}
            exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          />
          {/* Bottom half */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-background"
            initial={{ y: 0 }}
            exit={{ y: "100%", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          />

          {/* Center seam glow */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan/80 to-transparent" />

          {/* Aurora */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-aurora absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-cyan/20 blur-3xl" />
            <div className="animate-aurora absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-bio/20 blur-3xl" style={{ animationDelay: "2s" }} />
          </div>

          {/* Logo + progress */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.35 } }}
          >
            {/* Pulse cell */}
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan to-bio opacity-80 blur-md" />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-cyan/70"
                animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0, 0.9] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border-2 border-bio/70"
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              />
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-cyan to-bio shadow-[0_0_30px_oklch(0.86_0.15_210/0.8)]" />
            </div>

            <div className="text-center">
              <div className="font-display text-lg font-semibold tracking-tight text-foreground">
                NeuroSkin <span className="text-gradient-brand">AI</span>
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Calibrating vision model
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-[2px] w-48 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan via-bio to-violet"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/70">
              {Math.round(progress * 100)}%
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
