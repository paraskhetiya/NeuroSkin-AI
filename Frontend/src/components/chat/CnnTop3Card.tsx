import { motion } from "framer-motion";
import { ScanLine, Microscope, Layers } from "lucide-react";
import type { CnnPrediction, CnnModelKind } from "./types";

const MODEL_META: Record<CnnModelKind, { label: string; tag: string; icon: typeof ScanLine; accent: string }> = {
  lesion: {
    label: "Lesion model identified",
    tag: "CNN-A · Lesion · top-3",
    icon: ScanLine,
    accent: "text-cyan",
  },
  skin: {
    label: "Skin disease model identified",
    tag: "CNN-B · Skin disease · top-3",
    icon: Microscope,
    accent: "text-bio",
  },
  merged: {
    label: "Both models combined",
    tag: "Merged · Top-3 overall",
    icon: Layers,
    accent: "text-violet",
  },
};

/**
 * Visualizes one CNN's top-3 predictions. We render this twice — once for
 * the lesion model, once for the skin-disease model — before the symptom Q&A.
 */
export function CnnTop3Card({
  predictions,
  model = "skin",
}: {
  predictions: CnnPrediction[];
  model?: CnnModelKind;
}) {
  const meta = MODEL_META[model];
  const Icon = meta.icon;

  return (
    <div className="glass w-full rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm">
          <Icon className={`h-4 w-4 ${meta.accent}`} />
          <span>
            {meta.label}{" "}
            <span className={`font-semibold ${meta.accent}`}>3 candidates</span>.
          </span>
        </p>
        <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
          {meta.tag}
        </span>
      </div>
      <div className="space-y-2.5">
        {predictions.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-3"
          >
            <div className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="w-28 shrink-0 truncate text-sm sm:w-44">{p.name}</div>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p.confidence * 100}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.12 + 0.2 }}
                className={`h-full ${
                  i === 0
                    ? model === "lesion"
                      ? "bg-gradient-to-r from-cyan to-violet"
                      : model === "skin"
                        ? "bg-gradient-to-r from-bio to-cyan"
                        : "bg-gradient-to-r from-violet to-bio"
                    : "bg-muted-foreground/40"
                }`}
              />
            </div>
            <div className="w-10 text-right font-mono text-xs text-muted-foreground">
              {Math.round(p.confidence * 100)}%
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
