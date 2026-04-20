import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  originalUrl: string;
  heatmapUrl: string | null;
  loading?: boolean;
  className?: string;
}

/**
 * Shows the uploaded skin photo with the Grad-CAM heatmap overlaid
 * via mix-blend-mode (50% opacity).
 * - Loading skeleton while the backend is generating the heatmap.
 * - Falls back to the original photo only if heatmapUrl is null.
 * - Animated red diagnostic ring pulses on top to draw the eye.
 */
export function GradCamImage({ originalUrl, heatmapUrl, loading, className = "" }: Props) {
  const [heatmapLoaded, setHeatmapLoaded] = useState(false);
  const [heatmapError, setHeatmapError] = useState(false);

  useEffect(() => {
    setHeatmapLoaded(false);
    setHeatmapError(false);
  }, [heatmapUrl]);

  return (
    <div
      className={`relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-secondary ${className}`}
    >
      {/* Original photo always visible */}
      <img
        src={originalUrl}
        alt="Uploaded skin region"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Heatmap overlay */}
      {heatmapUrl && !heatmapError && (
        <img
          src={heatmapUrl}
          alt=""
          aria-hidden
          onLoad={() => setHeatmapLoaded(true)}
          onError={() => setHeatmapError(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{
            opacity: heatmapLoaded ? 0.55 : 0,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Loading shimmer for heatmap */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-10 w-10">
              <span className="absolute inset-0 rounded-full border-2 border-cyan/30" />
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">
              Generating Grad-CAM
            </p>
          </div>
        </div>
      )}

      {/* Animated diagnostic ring — only when heatmap loaded */}
      {heatmapLoaded && !loading && (
        <>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "backOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="animate-diag-ring h-full w-full rounded-full border-2 border-destructive" />
            <div className="absolute inset-0 rounded-full border border-destructive/40" />
          </motion.div>

          {/* Corner crosshairs to look "clinical" */}
          {[
            "left-2 top-2 border-l border-t",
            "right-2 top-2 border-r border-t",
            "left-2 bottom-2 border-l border-b",
            "right-2 bottom-2 border-r border-b",
          ].map((c, i) => (
            <div key={i} className={`pointer-events-none absolute h-4 w-4 border-cyan/70 ${c}`} />
          ))}

          {/* Annotation label */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="absolute bottom-3 left-3 rounded-full bg-destructive/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-destructive-foreground backdrop-blur"
          >
            ● Region of interest
          </motion.div>
        </>
      )}
    </div>
  );
}
