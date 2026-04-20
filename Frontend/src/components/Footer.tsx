import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 py-12">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-cyan to-bio">
            <Activity className="h-3.5 w-3.5 text-background" strokeWidth={3} />
          </div>
          <span className="font-display text-sm">
            NeuroSkin<span className="text-gradient-brand">.AI</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Team EpiVision · Not a substitute for professional medical advice.
        </p>
      </div>
    </footer>
  );
}
