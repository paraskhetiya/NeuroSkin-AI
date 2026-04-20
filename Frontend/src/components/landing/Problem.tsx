import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle, Clock, Users } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Users, num: 33, suffix: "%", label: "1 in 3", text: "people experience a skin disorder at any given moment worldwide", fill: 33, color: "from-cyan to-cyan/40" },
  { icon: AlertTriangle, num: 60, suffix: "%", label: "misdiagnosed", text: "of skin conditions are misdiagnosed at the primary-care level", fill: 60, color: "from-violet to-violet/40" },
  { icon: Clock, num: 30, suffix: " days", label: "waiting", text: "average delay before a patient is seen by a qualified dermatologist", fill: 85, color: "from-bio to-bio/40" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1800, bounce: 0 });
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

function TiltCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 15 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 15 });
  const glowX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(y, [-0.5, 0.5], ["0%", "100%"]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1000 }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="problem-stat group relative"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${glowX.get()} ${glowY.get()}, oklch(0.86 0.15 210 / 0.35), transparent 40%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

export function Problem() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".problem-fill", {
        width: (i, el) => (el as HTMLElement).dataset.fill + "%",
        duration: 1.6,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: ref.current, start: "top 65%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-32">
      {/* Ambient glow behind section */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-cyan/5 blur-[120px]" />

      <div className="container relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20 max-w-2xl"
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-cyan">
            01 — The problem
          </p>
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Skin disease is everywhere.
            <br />
            <span className="text-muted-foreground">Diagnosis isn't.</span>
          </h2>
          <p className="mt-6 text-muted-foreground">
            Dermatology access is broken. Visual conditions look alike, specialists are
            scarce, and most people wait weeks for an answer that could take seconds.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <TiltCard key={s.label} index={i}>
                <div className="glass relative h-full overflow-hidden rounded-2xl p-8">
                  {/* Corner accent */}
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-cyan/20 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-150" />

                  {/* Icon */}
                  <div className="relative mb-6 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-bio/10 text-cyan ring-1 ring-cyan/20 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Big number */}
                  <div className="font-display text-6xl font-semibold tracking-tight text-gradient-brand">
                    <AnimatedNumber value={s.num} suffix={s.suffix} />
                  </div>

                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                    {s.label}
                  </p>

                  {/* Progress bar */}
                  <div className="relative mt-6 h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`problem-fill absolute inset-y-0 left-0 w-0 bg-gradient-to-r ${s.color}`}
                      data-fill={s.fill}
                    />
                  </div>

                  <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                    {s.text}
                  </p>

                  {/* Bottom shimmer line */}
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-transparent via-cyan to-transparent transition-all duration-700 group-hover:w-full" />
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
