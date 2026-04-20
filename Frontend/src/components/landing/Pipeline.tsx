// Pipeline section: pinned horizontal scroll with GSAP ScrollTrigger
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Camera, Cpu, ListChecks, MessageSquareText, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: Camera,
    title: "Upload",
    body: "Take or upload a photo of the affected skin area. EXIF stripped, processed locally first.",
    accent: "from-cyan/30 to-cyan/0",
  },
  {
    icon: Cpu,
    title: "Vision Inference",
    body: "Our trained CNN scans textures, patterns, and color signals across 20+ conditions.",
    accent: "from-bio/30 to-bio/0",
  },
  {
    icon: ListChecks,
    title: "Suspect Set",
    body: "When 3–5 conditions remain plausible, the model surfaces them with confidence bands.",
    accent: "from-violet/30 to-violet/0",
  },
  {
    icon: MessageSquareText,
    title: "Smart Symptom Q&A",
    body: "The agent asks targeted, condition-disambiguating questions — no medical jargon.",
    accent: "from-cyan/30 to-cyan/0",
  },
  {
    icon: Sparkles,
    title: "Final Prediction",
    body: "Image + symptom fusion produces a final ranked diagnosis with care recommendations.",
    accent: "from-bio/30 to-bio/0",
  },
];

export function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const pin = pinRef.current;
      if (!track || !pin) return;

      const cards = gsap.utils.toArray<HTMLElement>(".pipe-card");
      // Disable pinning on tablets and phones — only desktop gets the horizontal scroll
      const isSmallScreen = window.matchMedia("(max-width: 1023px)").matches;

      if (isSmallScreen) {
        cards.forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
        return;
      }

      const getScrollDistance = () => track.scrollWidth - pin.clientWidth;

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            scrub: true,
          },
        });
      }

      cards.forEach((card) => {
        gsap.fromTo(
          card.querySelectorAll(".pipe-card-inner > *"),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 80%",
              end: "left 40%",
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          card.querySelector(".pipe-card-glow"),
          { opacity: 0, scale: 0.6 },
          {
            opacity: 1,
            scale: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 90%",
              end: "left 50%",
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          card.querySelector(".pipe-card-num"),
          { opacity: 0, scale: 0.5, rotate: -10 },
          {
            opacity: 0.15,
            scale: 1,
            rotate: 0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 85%",
              end: "left 45%",
              scrub: true,
            },
          },
        );
      });

      ScrollTrigger.refresh();
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="how" ref={ref} className="relative">
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mb-10 max-w-2xl sm:mb-12">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-bio">
            02 — How it works
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            One pipeline.
            <br />
            <span className="text-gradient-brand">Five intelligent steps.</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:mt-6 sm:text-base">
            Walk through every stage — from raw pixel to ranked diagnosis.
          </p>
        </div>
      </div>

      {/* Mobile / tablet: simple vertical stack */}
      <div className="container mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:hidden">
        <div className="space-y-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="pipe-card glass relative overflow-hidden rounded-2xl border border-border/50 p-6"
              >
                <div className="pipe-card-num pointer-events-none absolute -right-2 -top-6 select-none font-display text-[7rem] font-bold leading-none text-foreground/10">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="pipe-card-inner relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-cyan/30 bg-cyan/5 text-cyan">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      Step {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-semibold sm:text-2xl">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: pinned horizontal scroll */}
      <div ref={pinRef} className="relative hidden h-screen overflow-hidden lg:block">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:60px_60px]" />
        <div className="absolute left-0 right-0 top-0 z-20 h-px bg-border/40">
          <div
            ref={progressRef}
            className="h-full origin-left scale-x-0 bg-gradient-to-r from-cyan via-bio to-violet"
          />
        </div>
        <div className="absolute left-12 top-6 z-20 flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-bio">Pipeline</span>
          <span className="h-px w-12 bg-bio/50" />
          <span className="font-mono text-xs text-muted-foreground">{steps.length} stages</span>
        </div>

        <div
          ref={trackRef}
          className="flex h-full items-center gap-8 px-[10vw] will-change-transform"
          style={{ width: "max-content" }}
        >
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="pipe-card relative h-[60vh] w-[55vw] max-w-[640px] shrink-0"
            >
              <div className="pipe-card-num pointer-events-none absolute -right-4 -top-10 select-none font-display text-[14rem] font-bold leading-none text-foreground/10 sm:text-[18rem]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                className={`pipe-card-glow pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-radial ${s.accent} blur-3xl`}
              />
              <div className="glass relative h-full overflow-hidden rounded-[2rem] border border-border/50 p-10 backdrop-blur-xl">
                <div className="pipe-card-inner flex h-full flex-col">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan/30 bg-cyan/5 text-cyan">
                      <s.icon className="h-7 w-7" />
                    </div>
                    <div className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      Step {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                    </div>
                  </div>
                  <h3 className="font-display text-3xl font-semibold sm:text-4xl">{s.title}</h3>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {s.body}
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-8">
                    <div className="h-px flex-1 bg-gradient-to-r from-bio/60 to-transparent" />
                    <span className="font-mono text-xs uppercase tracking-[0.3em] text-bio">
                      {i === steps.length - 1 ? "Output" : "Next →"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="h-1 w-[10vw] shrink-0" />
        </div>
      </div>
    </section>
  );
}
