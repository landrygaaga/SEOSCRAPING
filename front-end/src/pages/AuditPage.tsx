import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, Check } from "lucide-react";

export default function AuditPage() {
  const navigate = useNavigate();
  const [watchedUrl, setWatchedUrl] = useState("");

  return (
    <div className="relative">
      {/* SECTION 1 - Hero Audit */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1100px 520px at 60% 0%, rgba(180,83,42,0.18), transparent 60%), radial-gradient(900px 420px at 30% 10%, rgba(180,83,42,0.10), transparent 62%), linear-gradient(to bottom, rgba(255,255,255,0.6), transparent 45%)",
          }}
        />

        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20 text-center">
          <h1 className="mx-auto max-w-5xl font-semibold tracking-tight leading-[0.95]">
            <span
              className="block text-[44px] md:text-[84px]"
              style={{ color: "var(--accent)" }}
            >
              Testez votre site en ligne
            </span>
            <span className="block text-[44px] md:text-[84px] text-[var(--text)]">
              et découvrez comment
            </span>
            <span className="block text-[44px] md:text-[84px] text-[var(--text)]">
              l'améliorer
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-4xl text-[15px] md:text-lg text-[var(--muted)] text-sm">
            Comment améliorer mon site ? Testez-le en{" "}
            <span className="font-semibold text-[var(--text)]">30 secondes</span>{" "}
            et obtenez des métriques SEO factuelles : score global, balises, structure,
            liens, images, sémantique.
          </p>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div
                className="text-4xl md:text-5xl font-semibold"
                style={{ color: "var(--accent)" }}
              >
                50+
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">Critères analysés</div>
            </div>

            <div>
              <div
                className="text-4xl md:text-5xl font-semibold"
                style={{ color: "var(--accent)" }}
              >
                30s
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">Temps d'analyse</div>
            </div>

            <div>
              <div
                className="text-4xl md:text-5xl font-semibold"
                style={{ color: "var(--accent)" }}
              >
                15
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">Pages analysées</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - Formulaire */}
      <section className="relative py-10 md:py-16">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 420px at 50% 30%, rgba(180,83,42,0.10), transparent 60%)",
          }}
        />

        <div className="mx-auto max-w-6xl px-4">
          <form id="scan-form" className="card p-8 max-w-2xl mx-auto text-left">
            {/*
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  Prénom <span className="text-[var(--accent)]">*</span>
                </label>
                <input className="form-input" placeholder="" />
              </div>

              <div>
                <label className="form-label">
                  Nom <span className="text-[var(--accent)]">*</span>
                </label>
                <input className="form-input" placeholder="" />
              </div>
            </div>
            */}

            <div className="mt-6">
              <label className="form-label">
                Email <span className="text-[var(--accent)]">*</span>
              </label>
              <input className="form-input" placeholder="" type="email" />
            </div>

            <div className="mt-6">
              <label className="form-label">
                URL de votre site <span className="text-[var(--accent)]">*</span>
              </label>
              <input
                className="form-input text-lg"
                placeholder="https://www.votresite.fr"
                type="url"
                value={watchedUrl}
                onChange={(e) => setWatchedUrl(e.target.value)}
              />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border border-black/20 accent-[var(--accent)]"
              />
              <div className="text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--text)]">Analyse multi-pages</span>{" "}
                — Analyser automatiquement jusqu’à 15 pages de votre site
              </div>
            </div>

            <button
              type="button"
              disabled={!watchedUrl.trim()}
              onClick={() =>
                navigate("/audit/preview", { state: { url: watchedUrl.trim() } })
              }
              className="mt-7 w-full inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-5 text-white text-lg font-semibold shadow-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--accent)" }}
            >
              <Search size={18} />
              Lancer l’analyse SEO gratuite
            </button>

            <p className="form-help mt-4 flex items-start gap-2 text-xs">
              <span aria-hidden>🔒</span>
              <span>
                En cliquant, vous acceptez d’être recontacté pour discuter des résultats et
                améliorer votre référencement.
              </span>
            </p>
          </form>
        </div>
      </section>

      {/* SECTION 3 - avantages */}
      <section className="audit-strip-bg">
        <div className="mx-auto max-w-6xl px-4 py-7 md:py-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
            <div className="inline-flex items-center gap-3 text-[var(--muted)] text-sm">
              <Check className="text-green-500" size={15} />
              <span>Sans engagement</span>
            </div>

            <div className="inline-flex items-center gap-3 text-[var(--muted)] text-sm">
              <Check className="text-green-500" size={15} />
              <span>100% gratuit</span>
            </div>

            <div className="inline-flex items-center gap-3 text-[var(--muted)] text-sm">
              <Check className="text-green-500" size={15} />
              <span>Résultat instantané</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
