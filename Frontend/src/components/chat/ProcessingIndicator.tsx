import { motion } from "framer-motion";

const STAGES: Record<string, string[]> = {
  "cnn-running": [
    "Loading vision model weights",
    "Pre-processing image (224×224)",
    "Running convolutional layers",
    "Computing top-3 disease probabilities",
  ],
  "llm-thinking": [
    "Fusing CNN predictions with your symptoms",
    "Cross-referencing dermatology knowledge base",
    "Pulling latest medical guidelines",
    "Generating treatment plan",
  ],
  "gradcam": [
    "Sending image to Grad-CAM service",
    "Computing class activation map",
    "Rendering heatmap overlay",
  ],
};

/**
 * Multi-stage processing indicator that cycles through real-feeling
 * status messages so users know the system is doing real work.
 */
export function ProcessingIndicator({
  phase,
  label,
}: {
  phase: keyof typeof STAGES;
  label?: string;
}) {
  const stages = STAGES[phase] ?? [label ?? "Processing"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass relative overflow-hidden rounded-2xl p-4"
    >
      {/* Shimmer bar */}
      <div className="absolute left-0 top-0 h-full w-full overflow-hidden rounded-2xl">
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan/15 to-transparent"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative flex items-center gap-3">
        <div className="relative h-8 w-8 shrink-0">
          <span className="absolute inset-0 rounded-full border-2 border-cyan/20" />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan border-r-bio"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {phase === "cnn-running" && "Analyzing your photo"}
            {phase === "llm-thinking" && "Refining diagnosis with AI"}
            {phase === "gradcam" && "Highlighting affected region"}
          </p>
          <div className="mt-1.5 h-4 overflow-hidden">
            <motion.div
              animate={{ y: stages.map((_, i) => -i * 16) }}
              transition={{
                duration: stages.length * 1.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {stages.map((s) => (
                <p key={s} className="h-4 text-xs leading-4 text-muted-foreground">
                  {s}…
                </p>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
