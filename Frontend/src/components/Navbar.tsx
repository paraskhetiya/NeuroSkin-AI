import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#team", label: "Team" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-1/2 top-3 z-50 w-[calc(100vw-1rem)] max-w-6xl -translate-x-1/2 sm:top-4 sm:w-[calc(100vw-2rem)]"
    >
      <div className="glass-strong flex items-center justify-between gap-2 rounded-2xl px-2.5 py-2 sm:px-6 sm:py-3">
        <Link to="/" className="flex items-center gap-2 group min-w-0 shrink">
          <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan to-bio">
            <Activity className="h-4 w-4 text-background" strokeWidth={3} />
            <span className="absolute inset-0 rounded-lg pulse-ring" />
          </div>
          <span className="truncate font-display text-[13px] font-semibold tracking-tight sm:text-base">
            NeuroSkin<span className="text-gradient-brand">.AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            to="/login"
            className="hidden rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block sm:px-3"
          >
            Sign in
          </Link>
          <Link
            to="/chat"
            className="rounded-lg bg-gradient-to-r from-cyan to-bio px-2.5 py-1.5 text-xs font-medium text-background shadow-[0_0_25px_oklch(0.86_0.15_210/0.45)] transition-transform hover:scale-[1.03] sm:px-3.5 sm:text-sm"
          >
            Launch
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-foreground/80 hover:bg-white/5 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass-strong mt-2 flex flex-col gap-1 rounded-2xl p-2 lg:hidden"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground sm:hidden"
            >
              Sign in
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
