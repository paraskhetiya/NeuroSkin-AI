import { motion } from "framer-motion";

/**
 * Lightweight, beautiful animated gradient orb used as the
 * mobile/tablet replacement for the heavy 3D SkinCellBlob.
 * Pure CSS + framer-motion — buttery smooth on any device.
 */
export function GradientOrb() {
  return (
    <div className="relative h-full w-full" aria-hidden>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan/40 via-violet/30 to-bio/40 blur-2xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.95, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Core orb */}
      <motion.div
        className="absolute inset-6 overflow-hidden rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, oklch(0.96 0.12 200), oklch(0.7 0.18 210) 35%, oklch(0.45 0.18 270) 70%, oklch(0.2 0.05 252) 100%)",
          boxShadow:
            "inset 0 0 60px oklch(0.86 0.15 210 / 0.5), inset 0 0 120px oklch(0.85 0.2 158 / 0.25), 0 30px 80px -20px oklch(0.05 0.03 252 / 0.6)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {/* Internal aurora swirls */}
        <motion.div
          className="absolute -inset-1/4 rounded-full opacity-70 mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, oklch(0.86 0.15 210 / 0.6), transparent 40%, oklch(0.85 0.2 158 / 0.5), transparent 80%)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 70% 70%, oklch(0.7 0.18 290 / 0.5), transparent 50%)",
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Specular highlight */}
      <div
        className="absolute left-[18%] top-[15%] h-12 w-16 rounded-full bg-white/40 blur-xl"
        style={{ transform: "rotate(-25deg)" }}
      />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan/80"
          style={{
            left: `${20 + (i * 60) / 8}%`,
            top: `${30 + ((i * 37) % 50)}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
