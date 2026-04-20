import { motion } from "framer-motion";
import { Target, Heart, Lightbulb } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    body: "Make early, accurate skin assessment available to anyone with a smartphone — regardless of geography or income.",
  },
  {
    icon: Lightbulb,
    title: "Our Approach",
    body: "Combine vision-first deep learning with structured symptom reasoning, modeled on real dermatology decision trees.",
  },
  {
    icon: Heart,
    title: "Our Values",
    body: "Privacy, transparency, and clinical humility. We assist — we don't replace — qualified medical professionals.",
  },
];

export function About() {
  return (
    <section id="about" className="relative py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 h-[300px] w-[300px] rounded-full bg-cyan/5 blur-[100px] sm:h-[500px] sm:w-[500px]" />

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl sm:mb-16">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-bio">
            05 — About us
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Why we built <span className="text-gradient-brand">NeuroSkin AI</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Over a billion people experience skin conditions every year, but only a fraction
            ever see a dermatologist in time. We're a student-led team building the bridge
            between everyday people and clinical-grade visual diagnosis.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8"
              >
                <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-bio/10 text-cyan ring-1 ring-cyan/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
