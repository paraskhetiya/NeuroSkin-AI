import { motion } from "framer-motion";

export function AnalyzingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
    >
      <div className="relative h-3 w-3">
        <span className="absolute inset-0 rounded-full bg-cyan" />
        <span className="absolute inset-0 animate-ping rounded-full bg-cyan opacity-75" />
      </div>
      <span className="text-sm text-muted-foreground">Analyzing image with vision model…</span>
    </motion.div>
  );
}
