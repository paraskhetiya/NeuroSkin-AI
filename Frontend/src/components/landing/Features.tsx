import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Brain, Eye, Lock, Stethoscope, Wand2, Zap } from "lucide-react";

const features = [
  { icon: Brain, title: "Multimodal Reasoning", body: "Image embeddings fuse with structured symptom answers for sharper accuracy.", accent: "cyan" },
  { icon: Eye, title: "Vision-First", body: "CNN backbone trained on dermatology-specific datasets, not generic ImageNet.", accent: "bio" },
  { icon: Stethoscope, title: "Clinically Aware", body: "Disambiguation questions inspired by real dermatology decision trees.", accent: "violet" },
  { icon: Lock, title: "Privacy Built-In", body: "Photos processed in-session, never used for training without consent.", accent: "cyan" },
  { icon: Zap, title: "Sub-2s Inference", body: "Edge-optimized model returns suspect set almost instantly.", accent: "bio" },
  { icon: Wand2, title: "Care Guidance", body: "Each prediction comes with severity, urgency, and next-step suggestions.", accent: "violet" },
];

const accentMap: Record<string, { text: string; ring: string; grad: string; shadow: string }> = {
  cyan: { text: "text-cyan", ring: "ring-cyan/30", grad: "from-cyan/30 to-cyan/5", shadow: "group-hover:shadow-[0_0_60px_-10px_oklch(0.86_0.15_210/0.5)]" },
  bio: { text: "text-bio", ring: "ring-bio/30", grad: "from-bio/30 to-bio/5", shadow: "group-hover:shadow-[0_0_60px_-10px_oklch(0.85_0.2_158/0.5)]" },
  violet: { text: "text-violet", ring: "ring-violet/30", grad: "from-violet/30 to-violet/5", shadow: "group-hover:shadow-[0_0_60px_-10px_oklch(0.7_0.18_290/0.5)]" },
};

function FeatureCard({ f, i }: { f: (typeof features)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });
  const spotX = useTransform(mx, (v) => `${(v + 0.5) * 100}%`);
  const spotY = useTransform(my, (v) => `${(v + 0.5) * 100}%`);

  const a = accentMap[f.accent];
  const Icon = f.icon;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1000 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 transition-all duration-500 hover:border-cyan/40 ${a.shadow}`}
    >
      {/* Cursor-follow spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useTransform(
            [spotX, spotY] as any,
            ([sx, sy]: any) => `radial-gradient(300px circle at ${sx} ${sy}, oklch(0.86 0.15 210 / 0.18), transparent 60%)`
          ),
        }}
      />

      {/* Animated corner glow */}
      <div className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${a.grad} opacity-40 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-80`} />

      {/* Animated border gradient top-line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative">
        <div className={`mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${a.grad} ${a.text} ring-1 ${a.ring} transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-semibold tracking-tight">{f.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>

        {/* Arrow on hover */}
        <div className={`mt-5 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] ${a.text} opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0`}>
          learn more
          <span className="h-px w-8 bg-current" />
        </div>
      </div>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="pointer-events-none absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-violet/5 blur-[120px]" />

      <div className="container relative mx-auto max-w-6xl px-6">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-violet">
              03 — Capabilities
            </p>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Engineered for trust,
              <br />
              <span className="text-gradient-brand">tuned for speed.</span>
            </h2>
          </motion.div>
          <p className="max-w-sm text-muted-foreground">
            Every layer of the system is designed to be explainable, fast, and respectful of the
            patient's privacy.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
