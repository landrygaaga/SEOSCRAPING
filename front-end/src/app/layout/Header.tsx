import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { applyTheme, getStoredTheme, toggleTheme } from "@/lib/theme";

import { Moon  } from 'lucide-react';
import { SunDim } from 'lucide-react';

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm px-3 py-2 rounded-full transition ${
    isActive
      ? "bg-[ #2E2824] text-#9E4522"
      : "text-gray-400 hover:bg-[#9E4522]/10 hover:text-[#9E4522]"
  }`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Init theme au premier rendu
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) applyTheme(stored);
    else {
      // fallback: préfère dark si OS dark, sinon light
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  const [isDark, setIsDark] = useState(false);

useEffect(() => {
  const update = () =>
    setIsDark(document.documentElement.classList.contains("dark"));

  update();

  // Met à jour si on change le thème ailleurs
  const obs = new MutationObserver(update);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  return () => obs.disconnect();
}, []);

  // Fermer le menu mobile au changement de route
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="container-page py-4">
        {/* DESKTOP */}
        <div className="hidden md:flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <span
              className="h-11 w-11 rounded-xl grid place-items-center text-white font-bold text-base"
              style={{ background: "var(--accent)" }}
            >
              AS.
            </span>
            <span className="text-xl font-semibold tracking-tight">
              Audit SEO
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink to="/" className={linkClass}>Accueil</NavLink>
            <NavLink to="/audit" className={linkClass}>Audit SEO</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {/* Toggle */}
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="h-11 w-11 rounded-2xl grid place-items-center border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] shadow-sm hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Jour / Nuit"
              title="Jour / Nuit"
            >
              {isDark ? <SunDim /> : <Moon />}
            </button>

            {/* CTA Historique */}
            <Link
              to="/historique"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Voir l’historique <span aria-hidden>→</span>
            </Link>
          </div>
        </div>


        {/* MOBILE */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            {/* Logo carré à gauche */}
            <Link
              to="/"
              className="h-12 w-12 rounded-2xl grid place-items-center font-bold text-white"
              style={{ background: "#B4532A" }} // couleur "AS." vibe
              aria-label="Accueil"
            >
              AS.
            </Link>

            {/* Toggle au centre (carré arrondi) */}
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="h-12 w-12 rounded-2xl grid place-items-center border border-[var(--border)] bg-[var(--surface)] text-[#ff7a18] backdrop-blur hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Jour / Nuit"
              title="Jour / Nuit"
            >
              {isDark ? <SunDim /> : <Moon />}
            </button>

            {/* Menu à droite */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="h-12 w-12 rounded-2xl grid place-items-center border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] backdrop-blur hover:bg-black/5 dark:hover:bg-white/10"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
            >
              <MenuIcon />
            </button>
          </div>

          {/* Dropdown mobile */}
          {open ? (
            <div className="mt-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-3">
              <div className="flex flex-col gap-2">
                <NavLink to="/" className={linkClass}>Accueil</NavLink>
                <NavLink to="/audit" className={linkClass}>Audit SEO</NavLink>

                <Link
                  to="/historique"
                  className="mt-2 inline-flex justify-center rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:opacity-90"
                >
                  Voir l’historique
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Fond sombre derrière le header mobile (pour matcher l'image) */}
      <div className="md:hidden h-0">
        {/* On “pousse” juste le fond via le body var, */}
      </div>
    </header>
  );
}
