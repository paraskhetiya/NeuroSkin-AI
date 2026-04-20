import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Suspense, lazy, useState, type FormEvent } from "react";
import { Activity, ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";

const SkinCellBlob = lazy(() =>
  import("@/components/three/SkinCellBlob").then((m) => ({ default: m.SkinCellBlob })),
);

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — NeuroSkin AI" },
      { name: "description", content: "Sign in to NeuroSkin AI to analyze your skin." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [show, setShow] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // UI shell — no auth wired up yet
    navigate({ to: "/chat" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <SkinCellBlob />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-transparent to-background/80" />
        <div className="absolute bottom-12 left-12 right-12">
          <Link to="/" className="mb-12 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan to-bio">
              <Activity className="h-4 w-4 text-background" strokeWidth={3} />
            </div>
            <span className="font-display text-lg font-semibold">
              NeuroSkin<span className="text-gradient-brand">.AI</span>
            </span>
          </Link>
          <p className="font-display text-3xl font-semibold leading-tight">
            See deeper.
            <br />
            <span className="text-gradient-brand">Diagnose smarter.</span>
          </p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Sign in to access your AI-powered dermatology assistant.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex items-center justify-center px-6 py-12">
        <Link
          to="/"
          className="glass absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan to-bio">
              <Activity className="h-4 w-4 text-background" strokeWidth={3} />
            </div>
            <span className="font-display font-semibold">
              NeuroSkin<span className="text-gradient-brand">.AI</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to continue your analysis."
              : "Start your first AI skin analysis in seconds."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <Field label="Full name" type="text" placeholder="Your name" />
            )}
            <Field
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <div className="glass flex items-center gap-2 rounded-xl px-3 py-3 focus-within:ring-1 focus-within:ring-ring">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-bio py-3 font-medium text-background shadow-[0_0_30px_oklch(0.86_0.15_210/0.4)] transition-transform hover:scale-[1.01]"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            OR
            <div className="h-px flex-1 bg-border" />
          </div>

          <button className="glass w-full rounded-xl py-3 text-sm transition-colors hover:bg-white/5">
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to NeuroSkin?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              className="text-cyan transition-colors hover:text-bio"
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
  icon,
}: {
  label: string;
  type: string;
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="glass flex items-center gap-2 rounded-xl px-3 py-3 focus-within:ring-1 focus-within:ring-ring">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
    </div>
  );
}
