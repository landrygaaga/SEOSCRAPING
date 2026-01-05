import { Link } from "react-router-dom";

import { Linkedin } from 'lucide-react';

function WhatsappIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M20 11.9A8 8 0 0 1 8.4 19.2L4 20l.9-4.3A8 8 0 1 1 20 11.9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 9.3c.2-.4.4-.4.6-.4h.5c.1 0 .3.1.4.3l.7 1.7c.1.2 0 .4-.1.5l-.4.5c-.1.1-.2.3 0 .6.2.3.8 1.3 1.8 2 .8.6 1.5.8 1.8.9.2.1.4 0 .6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.4 0 .5-.2 1.2-.7 1.6-.4.4-1 .6-1.7.6-1.1 0-2.4-.4-3.7-1.3-1.7-1.1-3-2.8-3.6-4.2-.4-1-.4-1.8.1-2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}


export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* fond “peach” */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1100px 520px at 70% 0%, rgba(180,83,42,0.12), transparent 60%), radial-gradient(900px 420px at 20% 40%, rgba(180,83,42,0.08), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Col 1 : Brand */}
          <div>
            <div className="flex items-center gap-4">
              <div
                className="h-10 w-10 rounded-xl grid place-items-center text-white font-bold text-base"
                style={{ background: "var(--accent)" }}
              >
                AS.
              </div>
              <div className="text-xl font-semibold tracking-tight">
                Audit SEO
              </div>
            </div>

            <p className="mt-6 max-w-sm text-[var(--muted)] leading-relaxed">
              Analyse SEO technique et sémantique, résultats clairs et historique consultable.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <a
                href="#"
                className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 grid place-items-center text-[var(--text)] hover:bg-[#B4532A]/90 dark:hover:bg-white/15 transition"
                aria-label="LinkedIn"
              >
                <Linkedin />
              </a>

              <a
                href="#"
                className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 grid place-items-center text-[var(--text)] hover:bg-[#B4532A]/90 dark:hover:bg-white/15 transition"
                aria-label="WhatsApp"
              >
                <WhatsappIcon size={24} />
              </a>
            </div>
          </div>

          {/* Col 2 : Navigation */}
          <div className="md:pl-10">
            <div className="text-lg font-semibold">Navigation</div>

            <ul className="mt-6 space-y-5 text-[var(--muted)]">
              <li>
                <Link to="/" className=" relative transition hover:text-[var(--text)] after:content-[''] after:absolute after:left-0 after:-bottom-[1px] after:h-[1px] after:w-0 after:bg-[#B4532A] after:transition-all after:duration-300 hover:after:w-full ">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/audit" className=" relative transition hover:text-[var(--text)] after:content-[''] after:absolute after:left-0 after:-bottom-[1px] after:h-[1px] after:w-0 after:bg-[#B4532A] after:transition-all after:duration-300 hover:after:w-full ">
                  Audit SEO
                </Link>
              </li>
              <li>
                <Link to="/historique" className=" relative transition hover:text-[var(--text)] after:content-[''] after:absolute after:left-0 after:-bottom-[1px] after:h-[1px] after:w-0 after:bg-[#B4532A] after:transition-all after:duration-300 hover:after:w-full " >
                  Historique
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 : Contact */}
          <div>
            <div className="text-lg font-semibold">Contact</div>

            <div className="mt-6 space-y-5 text-[var(--muted)]">
              <ul className="mt-6 space-y-5 text-[var(--muted)]">
                <li>
                  <Link to="/" className=" relative transition hover:text-[var(--text)] after:content-[''] after:absolute after:left-0 after:-bottom-[1px] after:h-[1px] after:w-0 after:bg-[#B4532A] after:transition-all after:duration-300 hover:after:w-full ">
                   contact@audit-seo.com
                  </Link>
                </li>
                <li>
                  <Link to="/" className=" relative transition hover:text-[var(--text)] after:content-[''] after:absolute after:left-0 after:-bottom-[1px] after:h-[1px] after:w-0 after:bg-[#B4532A] after:transition-all after:duration-300 hover:after:w-full ">
                    +229 00 00 00 00
                  </Link>
                </li>
              </ul>
              <div className="pt-2">Cotonou, Bénin</div>
            </div>
          </div>
        </div>

        {/* Bas de footer */}
        <div className="mt-12 h-px w-full bg-[var(--border)]/60" />
        <div className="mt-6 text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} Audit SEO — Données factuelles uniquement.
        </div>
      </div>
    </footer>
  );
}
