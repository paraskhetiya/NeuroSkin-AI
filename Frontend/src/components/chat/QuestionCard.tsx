import { motion } from "framer-motion";
import type { SymptomQuestion } from "./types";

export function QuestionCard({
  question,
  onAnswer,
  step,
  total,
}: {
  question: SymptomQuestion;
  onAnswer: (answer: string) => void;
  step: number;
  total: number;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-wider text-cyan">
          Symptom Q&A
        </span>
        <span>
          {step} / {total}
        </span>
      </div>
      <p className="font-display text-lg font-semibold">{question.text}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {question.options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-cyan/50 hover:bg-cyan/5"
          >
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
