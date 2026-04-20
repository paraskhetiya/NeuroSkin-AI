import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Check, ListChecks, Sparkles } from "lucide-react";
import type { CnnPrediction, ApiSymptomMap } from "./types";

/**
 * Builds a deduplicated symptom list derived from the top-3 predicted
 * diseases. The user ticks every symptom they have, all at once, and
 * submits a single response — no multi-step Q&A.
 */
export function SymptomChecklist({
  top3,
  symptomMap,
  onSubmit,
}: {
  top3: CnnPrediction[];
  symptomMap: ApiSymptomMap;
  onSubmit: (selected: string[]) => void;
}) {
  const symptoms = useMemo(() => {
    const set = new Set<string>();
    for (const p of top3) {
      const list = symptomMap[p.id] ?? [];
      for (const s of list) set.add(s);
    }
    return Array.from(set);
  }, [top3, symptomMap]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (s: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-cyan">
          <ListChecks className="h-3.5 w-3.5" />
          Symptom checklist
        </span>
        <span className="text-muted-foreground">
          {selected.size} / {symptoms.length} selected
        </span>
      </div>
      <p className="font-display text-lg font-semibold">
        Tick every symptom you currently have
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        These are derived from your top-3 candidates. Select all that apply — the AI will
        weigh them against each disease to pick the final diagnosis.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {symptoms.map((s, i) => {
          const isOn = selected.has(s);
          return (
            <motion.button
              key={s}
              type="button"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => toggle(s)}
              className={`group flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                isOn
                  ? "border-cyan/60 bg-cyan/10 text-foreground"
                  : "border-border bg-secondary/40 text-foreground/85 hover:-translate-y-0.5 hover:border-cyan/40 hover:bg-cyan/5"
              }`}
            >
              <span
                className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-md border transition-colors ${
                  isOn ? "border-cyan bg-cyan text-background" : "border-border bg-background/40"
                }`}
              >
                {isOn && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span>{s}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSubmit([])}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          None of these apply
        </button>
        <button
          type="button"
          onClick={() => onSubmit(Array.from(selected))}
          disabled={selected.size === 0}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan to-bio px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Analyze my symptoms
        </button>
      </div>
    </motion.div>
  );
}
