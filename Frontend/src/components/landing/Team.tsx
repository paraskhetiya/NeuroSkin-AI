import { motion } from "framer-motion";

const members = [
  { name: "Paras Khetiya", role: "Team EpiVision", initials: "PK" },
  { name: "Hit Gohil", role: "Team EpiVision", initials: "HG" },
  { name: "Kunj Paghdal", role: "Team EpiVision", initials: "KP" },
  { name: "Mann Zalavadia", role: "Team EpiVision", initials: "MZ" },
];

export function Team() {
  return (
    <section id="team" className="relative py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl sm:mb-16">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-cyan">
            04 — The team
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Built by <span className="text-gradient-brand">Team EpiVision</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            A small, obsessed team blending machine learning, design, and dermatology to make
            early skin diagnosis universally accessible.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="glass rounded-2xl p-6"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-cyan to-bio font-display text-lg font-semibold text-background">
                {m.initials}
              </div>
              <div className="font-display text-lg font-semibold">{m.name}</div>
              <div className="text-sm text-muted-foreground">{m.role}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
