import { Sparkles } from "lucide-react";

const items = [
  "Acne",
  "Eczema",
  "Psoriasis",
  "Rosacea",
  "Melanoma screening",
  "Vitiligo",
  "Dermatitis",
  "Fungal infections",
  "Warts",
  "Hives",
  "Shingles",
  "Skin cancer signs",
  "Seborrheic keratosis",
  "Tinea",
];

export function Marquee() {
  return (
    <section className="relative border-y border-border/40 bg-background/40 py-6 sm:py-8">
      <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32" />
      <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32" />

      <div className="flex overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12">
          {[...items, ...items].map((it, i) => (
            <div key={i} className="flex shrink-0 items-center gap-3">
              <Sparkles className="h-3.5 w-3.5 text-cyan" />
              <span className="font-display text-base font-medium tracking-tight text-foreground/80 sm:text-xl">
                {it}
              </span>
              <span className="h-1 w-1 rounded-full bg-bio/50" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
