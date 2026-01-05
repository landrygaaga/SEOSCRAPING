import { Link } from "react-router-dom";
import HomeStatsMarquee from "@/pages/home/HomeStatsMarquee";

import { CirclePlay } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* fond “peach” léger */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1100px 520px at 65% 0%, rgba(180,83,42,0.18), transparent 60%), radial-gradient(900px 420px at 35% 10%, rgba(180,83,42,0.10), transparent 62%), linear-gradient(to bottom, rgba(255,255,255,0.55), transparent 45%)",
          }}
        />

        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 text-center">
          <h1 className="h1-poppins mx-auto max-w-5xl font-semibold tracking-tight leading-[0.95]">
            <span className="block text-[52px] md:text-[96px]">Connectez avec</span>
            <span className="block text-[52px] md:text-[96px]">les</span>
            <span
              className="block text-[52px] md:text-[96px]"
              style={{ color: "var(--accent)" }}
            >
              bonnes pages.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-[15px] md:text-lg text-[var(--muted)]">
            Il y a des sites qui ont exactement ce que vous cherchez.
            Notre outil vous aide à analyser une URL et à restituer des métriques SEO factuelles,
            sans recommandations automatiques.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/audit"
              className="inline-flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-sm font-semibold text-white shadow-sm bg-[var(--accent)] hover:bg-[#9e441e] dark:hover:bg-[#9e441e] transition"
            >
              Lancer l'analyse <span aria-hidden>→</span>
            </Link>

            <Link
              to="/historique"
              className="inline-flex items-center justify-center gap-3 rounded-xl px-5 py-4 text-sm font-semibold text-[var(--text)] bg-white/10 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/30 transition"
            >
              <CirclePlay />
              Voir l’historique
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-12 h-px w-4/5 max-w-[600px] mx-auto bg-[var(--border)]/60" />
      <HomeStatsMarquee />
    </div>
  );
}
