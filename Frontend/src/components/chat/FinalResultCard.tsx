import { motion } from "framer-motion";
import { Pill, Heart, AlertTriangle, ShieldCheck } from "lucide-react";
import { GradCamImage } from "./GradCamImage";
import type { FinalDiagnosis } from "./types";

const SEVERITY_META = {
  mild: { label: "Mild — self-care recommended", icon: ShieldCheck, color: "text-bio", ring: "border-bio/40", bg: "bg-bio/10" },
  moderate: { label: "Moderate — monitor closely", icon: AlertTriangle, color: "text-yellow-400", ring: "border-yellow-400/40", bg: "bg-yellow-400/10" },
  "see-doctor": { label: "See a dermatologist soon", icon: AlertTriangle, color: "text-destructive", ring: "border-destructive/40", bg: "bg-destructive/10" },
} as const;

export function FinalResultCard({ d }: { d: FinalDiagnosis }) {
  const meta = SEVERITY_META[d.severity];
  const SeverityIcon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong overflow-hidden rounded-3xl"
    >
      {/* Stacked layout: Image on top, content below */}
      <div className="flex flex-col">
        {/* Image Section - Full width */}
        <div className="relative border-b border-border">
          <GradCamImage originalUrl={d.originalUrl} heatmapUrl={d.heatmapUrl} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/85 to-transparent p-3">
            <p className="text-center font-mono text-[10px] uppercase tracking-wider text-foreground/80">
              {d.heatmapUrl ? "Grad-CAM · region the model focused on" : "Original photo"}
            </p>
          </div>
        </div>

        {/* Diagnosis Content Section - Full width */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-bio/15 px-3 py-1 text-xs text-bio">
              <span className="h-1.5 w-1.5 rounded-full bg-bio" />
              Final · {Math.round(d.confidence * 100)}% confidence
            </div>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border ${meta.ring} ${meta.bg} ${meta.color} px-3 py-1 text-xs`}
            >
              <SeverityIcon className="h-3 w-3" />
              {meta.label}
            </div>
          </div>

          <h3 className="mt-3 font-display text-2xl font-semibold text-gradient-brand sm:text-3xl">
            {d.name}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-foreground/85">{d.description}</p>

          {/* Medicines */}
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan">
              <Pill className="h-3.5 w-3.5" />
              Recommended treatment
            </div>
            <ul className="space-y-2">
              {d.medicines.map((m) => (
                <li
                  key={m.name}
                  className="rounded-xl border border-border bg-secondary/40 p-3 text-sm"
                >
                  <div className="font-medium text-foreground">{m.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{m.usage}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Care tips */}
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-bio">
              <Heart className="h-3.5 w-3.5" />
              How to take care
            </div>
            <ul className="space-y-1.5">
              {d.care.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/85">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-bio" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 rounded-lg border border-border bg-background/40 p-3 text-[11px] text-muted-foreground/80">
            ⚠️ NeuroSkin AI provides educational guidance only. This is not a medical diagnosis. Always consult a licensed dermatologist for clinical decisions, especially for moles changing in shape/colour or any rapidly worsening condition.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
