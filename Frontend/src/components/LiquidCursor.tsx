import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Liquid blob cursor for desktop — tinted with the brand cyan→bio gradient
 * so it harmonizes with the UI instead of fighting it.
 * - Small bio-green dot tracks pointer 1:1
 * - Larger gradient blob trails with spring physics, scales on hover/click
 * - Soft additive glow (no mix-blend-difference) for a premium feel
 * - Disabled on touch devices
 */
export function LiquidCursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<"default" | "hover" | "down">("default");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });

  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        "a, button, [role='button'], input, textarea, [data-cursor='hover']",
      );
      setVariant((v) => (v === "down" ? v : interactive ? "hover" : "default"));
    };
    const onDown = () => setVariant("down");
    const onUp = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest("a, button, [role='button'], [data-cursor='hover']");
      setVariant(interactive ? "hover" : "default");
    };
    const onLeave = () => {
      x.set(-100);
      y.set(-100);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointerleave", onLeave);

    document.documentElement.classList.add("liquid-cursor-active");

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("liquid-cursor-active");
    };
  }, [x, y]);

  if (!enabled) return null;

  const size = variant === "hover" ? 56 : variant === "down" ? 24 : 32;

  return (
    <>
      {/* Trailing gradient blob */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full opacity-70"
          animate={{ width: size, height: size }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{
            background:
              "radial-gradient(circle at 30% 30%, oklch(0.86 0.15 210 / 0.9), oklch(0.78 0.18 165 / 0.6) 55%, transparent 75%)",
            boxShadow:
              "0 0 24px oklch(0.86 0.15 210 / 0.45), 0 0 48px oklch(0.78 0.18 165 / 0.25)",
            filter: "blur(0.5px)",
          }}
        />
      </motion.div>

      {/* Snappy precision dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full"
        style={{
          background: "oklch(0.78 0.18 165)",
          boxShadow: "0 0 8px oklch(0.78 0.18 165 / 0.8)",
          willChange: "transform",
        }}
      />
    </>
  );
}
