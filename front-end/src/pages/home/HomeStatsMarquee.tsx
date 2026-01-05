export default function HomeStatsMarquee() {
  return (
    <section className="relative overflow-hidden">
      {/* fond doux */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 520px at 50% 0%, rgba(180,83,42,0.14), transparent 60%), radial-gradient(900px 420px at 20% 40%, rgba(180,83,42,0.08), transparent 70%)",
        }}
      />

      {/* Stats */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-14 md:py-20 text-center">
          <div>
            <div className="text-5xl md:text-6xl font-semibold tracking-tight">
              28<span className="align-top text-3xl md:text-4xl">+</span>
            </div>
            <div className="mt-3 text-xs md:text-sm tracking-[0.22em] uppercase text-[var(--muted)]">
              Audits réalisés
            </div>
          </div>

          <div>
            <div className="text-5xl md:text-6xl font-semibold tracking-tight">5</div>
            <div className="mt-3 text-xs md:text-sm tracking-[0.22em] uppercase text-[var(--muted)]">
              Métriques clés
            </div>
          </div>

          <div>
            <div className="text-5xl md:text-6xl font-semibold tracking-tight">
              <span style={{ color: "var(--accent)" }}>+</span>
              <span >40</span>
              <span style={{ color: "var(--accent)" }}>%</span>

            </div>
            <div className="mt-3 text-xs md:text-sm tracking-[0.22em] uppercase text-[var(--muted)]">
              Données exploitables
            </div>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px w-full bg-[var(--border)]/70" />

      {/* Marquee strip */}
      <div className="relative">
        <div className="mx-auto max-w-6xl px-4">
          <div className="py-6 md:py-8 overflow-hidden">
            <div className="marquee text-sm md:text-base tracking-[0.18em] uppercase text-[var(--muted)] whitespace-nowrap">
              <span className="inline-flex items-center gap-8">
                <span>Audit & référencement</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Balises Title/Meta</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Structure Hn</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Liens internes</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Images & alt</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Sémantique</span>

                {/* duplication pour boucle */}
                <span className="ml-10">Audit & référencement</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Balises Title/Meta</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Structure Hn</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Liens internes</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Images & alt</span>
                <span className="text-[var(--accent)]">✦</span>
                <span>Sémantique</span>
              </span>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-[var(--border)]/70" />
      </div>
    </section>
  );
}
