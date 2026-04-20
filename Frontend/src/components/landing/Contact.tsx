import { motion } from "framer-motion";
import { Mail, Globe, MessageCircle, AtSign, MapPin } from "lucide-react";

const socials = [
  { icon: Globe, label: "GitHub", href: "#" },
  { icon: AtSign, label: "LinkedIn", href: "#" },
  { icon: MessageCircle, label: "Twitter / X", href: "#" },
];

export function Contact() {
  return (
    <section id="contact" className="relative py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute right-0 top-1/4 h-[300px] w-[300px] rounded-full bg-bio/5 blur-[100px] sm:h-[500px] sm:w-[500px]" />

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl sm:mb-16">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-violet">
            06 — Contact us
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Let's <span className="text-gradient-brand">talk</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Press, partnerships, clinical collaborations, or feedback — we'd love to hear from you.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.a
            href="mailto:team@neuroskin.ai"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:border-cyan/40 sm:p-8"
          >
            <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-bio/10 text-cyan ring-1 ring-cyan/20 transition-transform group-hover:scale-110">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-semibold">Email us</h3>
            <p className="mt-2 break-all text-sm text-muted-foreground">team@neuroskin.ai</p>
            <p className="mt-3 text-xs text-muted-foreground/70">
              We typically respond within 48 hours.
            </p>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8"
          >
            <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet/20 to-cyan/10 text-violet ring-1 ring-violet/20">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-semibold">Find us online</h3>
            <ul className="mt-4 space-y-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Icon className="h-4 w-4 text-cyan transition-transform group-hover:scale-110" />
                      <span className="font-medium text-foreground/90">{s.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
