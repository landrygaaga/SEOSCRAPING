import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useRef } from "react";
import {
  CheckCircle2,
  Link as LinkIcon,
  Image as ImageIcon,
  Timer,
  Globe,
  FileText,
  Tag,
  AlertTriangle,
  ListChecks,
} from "lucide-react";

// TYPE COMPLET CORRESPONDANT AU BACKEND 
type BackendAuditResult = {
  is_secure: boolean;
  http_status: number;
  temps_reponse_ms: number;
  taille_page_octets: number;
  url_finale: string;
  word_count: number;
  top_keywords: string[];
  nombre_liens: number;
  nombre_liens_internes: number;
  nombre_liens_externes: number;
  nombre_images: number;
  images_avec_alt: Array<{ alt: string }>;
  images_lazy_loading: any[];  
  liens_internes: string[];    
  liens_externes: string[];    
  titre: string | null;
  longueur_titre: number;
  meta_description: string | null;
  longueur_meta_description: number;
  nombre_paragraphes: number;  // NOUVEAU
  paragraphes: { 
    h1_count: number; 
    h2_count: number; 
    h3_count: number;
    h4_count: number;  
    h5_count: number;  
    h6_count: number;  
  };
  score_seo: number;  
  meta_seo_score: number;
  images_seo_score: number;
  links_seo_score: number;
  mobile_score: number;
  desktop_score: number;
  date_audit: string;

  // AJOUT pour les réseaux sociaux
  og_count: number;
  social_score: number;
  og_missing?: string[];
};

type AuditDetails = {
  metaScore: number;       
  imagesScore: number;     
  linksScore: number;      
  technicalScore: number;

  url: string;
  date: string;
  statusLabel: string;
  scores: { global: number; mobile: number; desktop: number };
  meta: {
    title: string;
    titleLength: number;
    description: string;
    descriptionLength: number;
    viewport: boolean | null;
    canonical: boolean | null;
    lang: string | null;
  };
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
    ok: boolean;
  };
  content: { words: number };
  images: { 
    total: number; 
    withAlt: number; 
    missingAlt: number;
    lazyLoading: number;  
  };
  links: { 
    total: number; 
    internal: number; 
    external: number;
    internalList: string[];  
    externalList: string[];  
  };
  technical: {
    https: boolean;
    responseTimeMs: number;
    httpStatus: number;
    pageSizeKB: number;
  };
  topKeywords: string[];
  issues: Array<{
    code: string;
    label: string;
    severity: "low" | "medium" | "high";
    detail?: string;
  }>;
  // AJOUT OKOKO
  social: { 
    score: number; 
    ogCount: number; 
    ok: boolean; 
    missing: string[] 
  };
};

function formatDateFR(d: Date | string = new Date()) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return new Date().toLocaleString("fr-FR");

  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// FIX: Amélioration de la détection des problèmes
function makeIssues(r: BackendAuditResult): AuditDetails["issues"] {
  const issues: AuditDetails["issues"] = [];

  // Title : trop court OU trop long
  const titleLen = Number(r.longueur_titre ?? 0);
  if (titleLen < 30) {
    issues.push({
      code: "TITLE_SHORT",
      label: `Title court (${titleLen} car.)`,
      severity: "medium",
      detail: "Recommandé : 50-60 caractères",
    });
  } else if (titleLen > 60) {
    issues.push({
      code: "TITLE_LONG",
      label: `Title trop long (${titleLen} car.)`,
      severity: "low",
      detail: "Risque de troncature dans les résultats Google",
    });
  }

  // Meta description : trop courte OU trop longue
  const descLen = Number(r.longueur_meta_description ?? 0);
  if (descLen < 70) {
    issues.push({
      code: "DESC_SHORT",
      label: `Meta description courte (${descLen} car.)`,
      severity: "medium",
      detail: "Recommandé : 120-160 caractères",
    });
  } else if (descLen > 160) {
    issues.push({
      code: "DESC_LONG",
      label: `Meta description trop longue (${descLen} car.)`,
      severity: "low",
      detail: "Risque de troncature dans les résultats Google",
    });
  }

  // H1 : absent OU multiple
  const h1Count = Number(r.paragraphes?.h1_count ?? 0);
  if (h1Count === 0) {
    issues.push({
      code: "H1_MISSING",
      label: "Aucune balise H1 détectée",
      severity: "high",
      detail: "Chaque page doit avoir exactement 1 H1",
    });
  } else if (h1Count > 1) {
    issues.push({
      code: "H1_MULTIPLE",
      label: `${h1Count} balises H1 détectées`,
      severity: "medium",
      detail: "Une seule balise H1 est recommandée par page",
    });
  }

  // FIX: Validation Array pour images_avec_alt
  const withAlt = Array.isArray(r.images_avec_alt) ? r.images_avec_alt.length : 0;
  const missingAlt = Math.max(0, Number(r.nombre_images ?? 0) - withAlt);
  if (missingAlt > 0) {
    issues.push({
      code: "IMAGES_ALT",
      label: `${missingAlt} image(s) sans attribut alt`,
      severity: "high",
      detail: "Les attributs alt améliorent le SEO et l'accessibilité",
    });
  }

  // HTTPS
  if (!r.is_secure) {
    issues.push({
      code: "HTTPS",
      label: "Le site n'est pas en HTTPS",
      severity: "high",
      detail: "HTTPS est obligatoire pour un bon référencement",
    });
  }

  // Performance
  const ms = Number(r.temps_reponse_ms ?? 0);
  if (ms > 3000) {
    issues.push({
      code: "PERF",
      label: `Temps de réponse élevé (${ms} ms)`,
      severity: "medium",
      detail: "Un temps de réponse < 1500ms est recommandé",
    });
  }

  // Lazy loading
  const lazyCount = Array.isArray(r.images_lazy_loading) ? r.images_lazy_loading.length : 0;
  const totalImages = Number(r.nombre_images ?? 0);
  if (totalImages > 0 && lazyCount === 0) {
    issues.push({
      code: "LAZY_LOADING",
      label: "Aucune image avec lazy loading",
      severity: "low",
      detail: "Le lazy loading améliore les performances de chargement",
    });
  }

  return issues;
}

function getGrade(score: number) {
  if (score >= 90) return "Grade A";
  if (score >= 70) return "Grade B";
  if (score >= 50) return "Grade C";
  return "Grade D";
}

function ScoreRing({
  value,
  label,
  ringColor,
  subLabel,
}: {
  value: number;
  label: string;
  ringColor: string;
  subLabel?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative h-[120px] w-[120px] rounded-full p-[10px]"
        style={{
          background: `conic-gradient(${ringColor} ${pct}%, rgba(255,255,255,0.10) 0)`,
        }}
      >
        <div className="h-full w-full rounded-full dark:bg-[rgba(0,0,0,0.35)] flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-semibold text-[var(--text)]">{value}</div>
            <div className="text-xs text-[var(--muted)]">Score</div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm text-[var(--muted)]">{label}</div>
      {subLabel ? <div className="mt-1 text-xs text-[var(--muted)]">{subLabel}</div> : null}
    </div>
  );
}

function SectionCard({
  title,
  score,
  children,
}: {
  title: string;
  score?: string;
  children: ReactNode;
}) {
  return (
    <div className="card p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Analyse</div>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text)]">{title}</h3>
        </div>
        {score ? (
          <div
            className="rounded-2xl px-4 py-2 text-sm font-semibold"
            style={{ background: "rgba(180,83,42,0.12)", color: "var(--accent)" }}
          >
            {score}
          </div>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-black/5 dark:bg-white/5 px-4 py-4">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-base font-semibold text-[var(--text)]">{value}</div>
    </div>
  );
}

function MetaStatusTile({
  title,
  subtitle,
  value,
  dot,
}: {
  title: string;
  subtitle: string;
  value?: string;
  dot: "green" | "yellow" | "red";
}) {
  const dotClass =
    dot === "green" ? "bg-green-500" : dot === "yellow" ? "bg-yellow-400" : "bg-red-500";

  return (
    <div
      className="relative rounded-2xl px-6 py-8 text-center border"
      style={{
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.10)",
      }}
    >
      <span
        className={`absolute top-5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full ${dotClass}`}
      />

      <div className="text-lg font-semibold text-[var(--text)] mt-4">{title}</div>
      <div className="mt-2 text-xs text-[var(--muted)]">{subtitle}</div>

      {value ? <div className="mt-3 text-sm font-semibold text-[var(--muted)]">{value}</div> : null}
    </div>
  );
}

function SeverityPill({ severity }: { severity: "low" | "medium" | "high" }) {
  const map = {
    low: { bg: "rgba(34,197,94,0.12)", text: "rgb(34,197,94)", label: "Faible" },
    medium: { bg: "rgba(234,179,8,0.14)", text: "rgb(234,179,8)", label: "Moyen" },
    high: { bg: "rgba(239,68,68,0.14)", text: "rgb(239,68,68)", label: "Critique" },
  }[severity];

  return (
    <span
      className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold"
      style={{ background: map.bg, color: map.text }}
    >
      {map.label}
    </span>
  );
}

// FIX: Score technique corrigé
function computeTechnicalScore(r: BackendAuditResult) {
  let score = 100;

  if (!r.is_secure) score -= 40;

  const ms = Number(r.temps_reponse_ms ?? 0);
  if (ms > 5000) score -= 30;
  else if (ms > 3000) score -= 20;
  else if (ms > 1500) score -= 10;

  const status = Number(r.http_status ?? 0);
  if (status >= 500) score -= 30;
  else if (status >= 400) score -= 20;
  else if (status >= 300) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export default function AuditDetailPage() {
  const { id } = useParams();
  const location = useLocation();

  const state = location.state as { url?: string; result?: BackendAuditResult } | null;

  const needsFetch = Boolean(state?.url && !state?.result);
  const [isLoading, setIsLoading] = useState(needsFetch);
  const [error, setError] = useState<string | null>(null);
  const [rawResult, setRawResult] = useState<BackendAuditResult | null>(state?.result ?? null);

  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const doneRef = useRef(false);

  // Modifiez votre useEffect existant pour marquer quand les données arrivent
  useEffect(() => {
    const controller = new AbortController();

    if (state?.url && !state?.result) {
      setIsLoading(true);
      setError(null);
      fetch("http://localhost:8000/api/analyser/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: state.url }),
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Erreur ${res.status} : ${res.statusText}`);
          return res.json();
        })
        .then((data) => {
          setRawResult(data);
          doneRef.current = true; // ← AJOUT IMPORTANT
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setError(err.message ?? "Une erreur est survenue");
            setIsLoading(false);
          }
        });
    }

    return () => controller.abort();
  }, []);

  // Ajoute useEffect pour gérer la progression animée
  useEffect(() => {
    if (!needsFetch) return;

    const interval = setInterval(() => {
      if (doneRef.current) {
        // Rush to 100 when data is ready
        progressRef.current = Math.min(100, progressRef.current + 4);
        setProgress(progressRef.current);
        if (progressRef.current >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 400);
        }
      } else {
        // Slow crawl
        const current = progressRef.current;
        const speed =
          current < 30 ? 2.5 : current < 65 ? 1.2 : current < 88 ? 0.35 : 0;
        progressRef.current = Math.min(88, current + speed);
        setProgress(progressRef.current);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [needsFetch]);

  const data: AuditDetails | null = useMemo(() => {
    if (!rawResult) return null;
    const r = rawResult;
    
    //  FIX: score_seo est un number, pas un objet
    const global = Number(r?.score_seo ?? 0);

    //  FIX: Validation Array pour images_avec_alt
    const withAlt = Array.isArray(r?.images_avec_alt) ? r?.images_avec_alt.length : 0;

    //  FIX: Lazy loading
    const lazyLoading = Array.isArray(r?.images_lazy_loading) ? r?.images_lazy_loading.length : 0;

    // FIX: Liens internes/externes listes complètes
    const internalList = Array.isArray(r?.liens_internes) ? r?.liens_internes : [];
    const externalList = Array.isArray(r?.liens_externes) ? r?.liens_externes : [];

    const technicalScore = computeTechnicalScore(r);

    // FIX: Utiliser la date de l'audit
    const auditDate = r?.date_audit ?? new Date().toISOString();

    // AJOUT : Calcul des données social
    const socialScore = Number(r?.social_score ?? 0);
    const ogCount = Number(r?.og_count ?? 0);
    const ogMissing = Array.isArray(r?.og_missing) ? r?.og_missing : [];

    return {
      url: r.url_finale ?? state.url ?? "https://example.com",
      date: formatDateFR(auditDate),
      statusLabel: "Analyse terminée",

      // FIX: Utiliser les scores mobile et desktop du backend
      scores: { 
        global, 
        mobile: Number(r.mobile_score ?? global), 
        desktop: Number(r.desktop_score ?? global) 
      },

      meta: {
        title: r.titre ?? "",
        titleLength: Number(r.longueur_titre ?? 0),
        description: r.meta_description ?? "",
        descriptionLength: Number(r.longueur_meta_description ?? 0),
        viewport: null,
        canonical: null,
        lang: null,
      },

      headings: {
        h1: Number(r.paragraphes?.h1_count) || 0,
        h2: Number(r.paragraphes?.h2_count) || 0,
        h3: Number(r.paragraphes?.h3_count) || 0,
        h4: Number(r.paragraphes?.h4_count) || 0,  
        h5: Number(r.paragraphes?.h5_count) || 0,  
        h6: Number(r.paragraphes?.h6_count) || 0,  
        ok: Number(r.paragraphes?.h1_count) === 1,
      },

      content: {
        words: Number(r.word_count ?? 0),
        paragraphs: Number(r.nombre_paragraphes ?? 0),  // NOUVEAU
      },

      // AJOUT: Scores spécifiques du backend
      metaScore: Number(r.meta_seo_score ?? 0),
      imagesScore: Number(r.images_seo_score ?? 0),
      linksScore: Number(r.links_seo_score ?? 0),
      technicalScore,

      images: {
        total: Number(r.nombre_images ?? 0),
        withAlt,
        missingAlt: Math.max(0, Number(r.nombre_images ?? 0) - withAlt),
        lazyLoading,  
      },

      links: {
        total: Number(r.nombre_liens ?? 0),
        internal: Number(r.nombre_liens_internes ?? 0),
        external: Number(r.nombre_liens_externes ?? 0),
        internalList,  
        externalList, 
      },

      technical: {
        https: Boolean(r?.is_secure),
        responseTimeMs: Number(r.temps_reponse_ms ?? 0),
        httpStatus: Number(r.http_status ?? 0),
        pageSizeKB: Number(r.taille_page_octets ?? 0) / 1024,
      },

      topKeywords: Array.isArray(r.top_keywords) ? r.top_keywords : [],

      issues: makeIssues(r),

      social: {
        score: socialScore,
        ogCount,
        ok: socialScore >= 90,
        missing: ogMissing,
      },
    };
  }, [rawResult]);

  if (isLoading) {
    return (
      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(700px 500px at 50% 40%, rgba(180,83,42,0.13), transparent 70%)",
          }}
        />

        {/* Animated ring */}
        <div className="relative flex items-center justify-center">
          {/* Outer slow spin */}
          <svg
            className="absolute"
            width="140"
            height="140"
            viewBox="0 0 140 140"
            style={{ animation: "spin 3s linear infinite" }}
          >
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="rgba(180,83,42,0.18)"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
          </svg>

          {/* Progress ring */}
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="rgba(180,83,42,0.12)"
              strokeWidth="6"
            />
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.2s ease" }}
            />
          </svg>

          {/* Center dot with pulse */}
          <div className="absolute flex items-center justify-center">
            <span
              className="h-5 w-5 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 0 0 rgba(180,83,42,0.5)",
                animation: "pulse-ring 1.6s ease-out infinite",
              }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold text-[var(--text)]">Analyse en cours...</h1>
          <p className="mt-3 text-[var(--muted)]">
            {progress < 30
              ? "Connexion au serveur..."
              : progress < 70
              ? "Analyse du contenu en cours..."
              : "Génération du rapport..."}
          </p>
        </div>

        {/* Progress bar + steps */}
        <div className="mt-10 w-full max-w-sm px-4">
          {/* Bar */}
          <div
            className="relative h-2.5 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                background: "linear-gradient(90deg, rgba(180,83,42,0.7), var(--accent))",
                transition: "width 0.15s ease",
              }}
            />
          </div>

          {/* Step labels */}
          <div className="mt-3 flex justify-between">
            {["Démarrage", "Analyse", "Finalisation"].map((label, i) => (
              <span
                key={label}
                className="text-xs transition-colors duration-300"
                style={{
                  color:
                    (i === 0 && progress >= 0) ||
                    (i === 1 && progress >= 30) ||
                    (i === 2 && progress >= 70)
                      ? "var(--accent)"
                      : "var(--muted)",
                  fontWeight:
                    (i === 0 && progress < 30) ||
                    (i === 1 && progress >= 30 && progress < 70) ||
                    (i === 2 && progress >= 70)
                      ? 600
                      : 400,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Keyframes */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes pulse-ring {
            0%   { box-shadow: 0 0 0 0   rgba(180,83,42,0.55); }
            70%  { box-shadow: 0 0 0 14px rgba(180,83,42,0); }
            100% { box-shadow: 0 0 0 0   rgba(180,83,42,0); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-12 text-red-500">{error}</div>
    );
  }

  if (!data) {
    return (
      <div className="container-page py-12 text-[var(--text)]">
        Aucun résultat à afficher. Lance un audit depuis la page Audit.
      </div>
    );
  }

  /* HeadingState (H1) */
  const h1Count = Number(data.headings.h1);

  const headingState = (() => {
    if (h1Count === 1) {
      return {
        score: "100/100",
        badgeText: "✓ Structure H1 optimale",
        badgeDotClass: "bg-green-500",
        badgeBg: "rgba(0,0,0,0.20)",
        badgeBorder: "rgba(255,255,255,0.08)",
        h1Bg: "rgba(34,197,94,0.10)",
        h1Border: "rgba(34,197,94,0.35)",
      };
    }

    if (h1Count === 0) {
      return {
        score: "0/100",
        badgeText: "✗ Aucune balise H1 détectée",
        badgeDotClass: "bg-red-500",
        badgeBg: "rgba(0,0,0,0.20)",
        badgeBorder: "rgba(255,255,255,0.08)",
        h1Bg: "rgba(239,68,68,0.14)",
        h1Border: "rgba(239,68,68,0.35)",
      };
    }

    return {
      score: "60/100",
      badgeText: `⚠ ${h1Count} balises H1 (1 seule recommandée)`,
      badgeDotClass: "bg-yellow-400",
      badgeBg: "rgba(0,0,0,0.20)",
      badgeBorder: "rgba(255,255,255,0.08)",
      h1Bg: "rgba(250,204,21,0.12)",
      h1Border: "rgba(250,204,21,0.35)",
    };
  })();

  const metaViewportDot: "green" | "yellow" | "red" = "green";
  const metaCanonicalDot: "green" | "yellow" | "red" = "yellow";
  const metaLangValue = "en";
  const metaLangDot: "green" | "yellow" | "red" = "yellow";

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 420px at 55% -10%, rgba(180,83,42,0.20), transparent 60%), radial-gradient(1200px 620px at 50% 120%, rgba(0,0,0,0.22), rgba(0,0,0,0)), linear-gradient(180deg, rgba(15,12,10,0.20) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
            style={{ background: "rgba(34,197,94,0.12)", color: "rgb(34,197,94)" }}
          >
            <CheckCircle2 size={16} />
            {data.statusLabel}
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-semibold text-[var(--text)]">
            Votre Rapport SEO
          </h1>

          <div className="mt-3 text-sm text-[var(--muted)]">
            <span className="break-all">{data.url}</span>
            <span className="mx-2 opacity-50">•</span>
            <span>{data.date}</span>
            {id ? (
              <>
                <span className="mx-2 opacity-50">•</span>
                <span>Audit #{id}</span>
              </>
            ) : null}
          </div>

          <div className="mt-10 card p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center justify-items-center">
              <div className="flex flex-col items-center">
                <ScoreRing value={data.scores.global} label="Score SEO" ringColor="#84cc16" />

                <span
                  className="mt-4 inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold"
                  style={{ background: "rgba(34,197,94,0.12)", color: "rgb(34,197,94)" }}
                >
                  {getGrade(data.scores.global)}
                </span>
              </div>
              <ScoreRing
                value={data.scores.mobile}
                label="Mobile"
                ringColor="#3b82f6"
                subLabel="Performance smartphone"
              />
              <ScoreRing
                value={data.scores.desktop}
                label="Desktop"
                ringColor="#a855f7"
                subLabel="Performance ordinateur"
              />
            </div>

            <div className="mt-10 border-t border-white/10 pt-6 text-center">
              <div className="text-sm text-[var(--muted)] mb-4">Interprétation des scores</div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="font-semibold text-[var(--text)]">90–100 :</span> Excellent
                </span>

                <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                  <span className="h-3 w-3 rounded-full bg-lime-400" />
                  <span className="font-semibold text-[var(--text)]">70–89 :</span> Bon
                </span>

                <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="font-semibold text-[var(--text)]">50–69 :</span> Moyen
                </span>

                <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="font-semibold text-[var(--text)]">0–49 :</span> Critique
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6">
          {/* FIX: Score Meta du backend */}
          <SectionCard title="Balises Meta" score={`${data.metaScore}/100`}>
            <p className="text-sm text-[var(--muted)] -mt-2">
              Les balises meta définissent comment votre site apparaît dans les résultats Google.
              Un title et une description optimisés augmentent le taux de clic.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-3 text-[var(--text)] font-semibold">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        data.meta.titleLength >= 50 && data.meta.titleLength <= 60
                          ? "bg-green-500"
                          : "bg-yellow-400"
                      }`}
                    />
                    <span>Title</span>
                  </div>

                  <div
                    className={`text-sm font-semibold ${
                      data.meta.titleLength >= 50 && data.meta.titleLength <= 60
                        ? "text-green-500"
                        : "text-yellow-400"
                    }`}
                  >
                    {data.meta.titleLength} car.
                  </div>
                </div>

                <div className="mt-3 text-sm text-[var(--muted)]">Recommandé : 50–60 caractères</div>

                <div className="mt-4 rounded-2xl bg-black/10 dark:bg-white/10 px-5 py-4 text-[var(--muted)]">
                  {data.meta.title || "—"}
                </div>
              </div>

              <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-3 text-[var(--text)] font-semibold">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        data.meta.descriptionLength >= 120 && data.meta.descriptionLength <= 160
                          ? "bg-green-500"
                          : "bg-yellow-400"
                      }`}
                    />
                    <span>Meta Description</span>
                  </div>

                  <div
                    className={`text-sm font-semibold ${
                      data.meta.descriptionLength >= 120 && data.meta.descriptionLength <= 160
                        ? "text-green-500"
                        : "text-yellow-400"
                    }`}
                  >
                    {data.meta.descriptionLength} car.
                  </div>
                </div>

                <div className="mt-3 text-sm text-[var(--muted)]">
                  Recommandé : 120–160 caractères
                </div>

                <div className="mt-4 rounded-2xl bg-black/10 dark:bg-white/10 px-5 py-4 text-[var(--muted)]">
                  {data.meta.description || "—"}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetaStatusTile
                title="Viewport"
                subtitle="Adaptation mobile"
                value="Présent"
                dot={metaViewportDot}
              />

              <MetaStatusTile
                title="Canonical"
                subtitle="Évite le duplicate"
                value="Présent"
                dot={metaCanonicalDot}
              />

              <MetaStatusTile
                title="Langue"
                subtitle="Détection"
                value={metaLangValue}
                dot={metaLangDot}
              />
            </div>
          </SectionCard>

          <SectionCard title="Structure des Titres" score={headingState.score}>
            <p className="text-sm text-[var(--muted)] -mt-2">
              Les balises H1 à H6 organisent votre contenu pour Google.
              Chaque page doit avoir exactement 1 H1 qui résume le sujet principal.
            </p>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
              <div
                className="rounded-2xl px-6 py-6 text-center border"
                style={{ background: headingState.h1Bg, borderColor: headingState.h1Border }}
              >
                <div className="text-4xl font-semibold text-[var(--text)]">{data.headings.h1}</div>
                <div className="mt-2 text-sm text-[var(--muted)]">H1</div>
              </div>

              {/* FIX: Affichage des H2-H6 */}
              {[
                ["H2", data.headings.h2],
                ["H3", data.headings.h3],
                ["H4", data.headings.h4],  
                ["H5", data.headings.h5],  
                ["H6", data.headings.h6], 
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-2xl px-6 py-6 text-center border"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                >
                  <div className="text-4xl font-semibold text-[var(--text)]">{value}</div>
                  <div className="mt-2 text-sm text-[var(--muted)]">{label}</div>
                </div>
              ))}
            </div>

            <div
              className="mt-6 rounded-2xl px-6 py-5 flex items-center gap-3 border"
              style={{ background: headingState.badgeBg, borderColor: headingState.badgeBorder }}
            >
              <span className={`h-3 w-3 rounded-full ${headingState.badgeDotClass}`} />
              <span className="text-sm font-semibold text-[var(--text)]">
                {headingState.badgeText}
              </span>
            </div>
          </SectionCard>

          <SectionCard title="Contenu Textuel" score="—">
            <p className="text-sm text-[var(--muted)] -mt-2">
              Google favorise les pages avec un contenu riche et détaillé. 
              Minimum recommandé : 300 mots (idéalement 1000+) pour bien se positionner.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {/* Mots */}
              <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-8 text-center">
                <div
                  className="text-6xl font-extrabold"
                  style={{
                    color:
                      data.content.words >= 1000
                        ? "rgb(34,197,94)"
                        : data.content.words >= 300
                        ? "rgb(234,179,8)"
                        : "rgb(239,68,68)",
                  }}
                >
                  {data.content.words}
                </div>
                <div className="mt-2 text-sm text-[var(--muted)]">Mots</div>
                <div className="mt-4 text-xs text-[var(--muted)]">
                  {data.content.words >= 1000
                    ? "✓ Contenu riche"
                    : data.content.words >= 300
                    ? "⚠️ Contenu moyen"
                    : "✗ Contenu léger"}
                </div>
              </div>

              {/* Paragraphes */}
              <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-8 text-center">
                <div className="text-6xl font-extrabold text-white">
                  {data.content.paragraphs}
                </div>
                <div className="mt-2 text-sm text-[var(--muted)]">Paragraphes</div>
                <div className="mt-4 text-xs text-[var(--muted)]">
                  Structure du texte
                </div>
              </div>
            </div>
          </SectionCard>

          {/* AJOUT: Mots-clés principaux */}
          {data.topKeywords.length > 0 && (
            <SectionCard title="Mots-clés principaux" score="—">
              <p className="text-sm text-[var(--muted)] -mt-2">
                Les mots-clés les plus fréquents détectés dans votre contenu.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {data.topKeywords.slice(0, 15).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                    style={{
                      background: "rgba(180,83,42,0.12)",
                      color: "var(--accent)",
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* FIX: Score Images du backend + Lazy Loading */}
          <SectionCard title="Optimisation des Images" score={`${data.imagesScore}/100`}>
            <p className="text-sm text-[var(--muted)] -mt-2">
              Les attributs alt permettent à Google de comprendre vos images et améliorent l'accessibilité. 
              Le lazy loading accélère le chargement.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="rounded-2xl px-6 py-8 text-center border"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <div className="text-5xl font-semibold text-[var(--text)]">{data.images.total}</div>
                <div className="mt-3 text-sm text-[var(--muted)]">Images trouvées</div>
              </div>

              <div
                className="rounded-2xl px-6 py-8 text-center border"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <div
                  className={`text-sm mb-2 ${
                    data.images.missingAlt === 0 ? "text-green-500" : "text-yellow-400"
                  }`}
                >
                  ●
                </div>
                <div
                  className={`text-5xl font-semibold ${
                    data.images.missingAlt === 0 ? "text-green-500" : "text-yellow-400"
                  }`}
                >
                  {data.images.missingAlt}
                </div>
                <div className="mt-3 text-sm text-[var(--muted)]">Sans attribut alt</div>
              </div>

              {/*FIX: Lazy loading données du backend */}
              <div
                className="rounded-2xl px-6 py-8 text-center border"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <div
                  className={`text-sm mb-2 ${
                    data.images.lazyLoading > 0 ? "text-green-500" : "text-yellow-400"
                  }`}
                >
                  ●
                </div>
                <div
                  className={`text-5xl font-semibold ${
                    data.images.lazyLoading > 0 ? "text-green-500" : "text-[var(--text)]"
                  }`}
                >
                  {data.images.lazyLoading}
                </div>
                <div className="mt-3 text-sm text-[var(--muted)]">Lazy loading</div>
              </div>
            </div>
          </SectionCard>

          {/* FIX: Score Liens du backend */}
          <SectionCard title="Liens et Maillage" score={`${data.linksScore}/100`}>
            <p className="text-sm text-[var(--muted)] -mt-2">
              Les liens internes aident Google à découvrir vos pages et améliorent l'expérience utilisateur. 
              Un bon maillage booste votre SEO.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="rounded-2xl px-6 py-8 text-center border"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <div className="text-5xl font-semibold text-[var(--text)]">{data.links.total}</div>
                <div className="mt-3 text-sm text-[var(--muted)]">Total des liens</div>
              </div>

              <div
                className="rounded-2xl px-6 py-8 text-center border"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <div className="text-5xl font-semibold text-cyan-400">{data.links.internal}</div>
                <div className="mt-3 text-sm text-[var(--muted)]">Liens internes</div>
              </div>

              <div
                className="rounded-2xl px-6 py-8 text-center border"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <div className="text-5xl font-semibold text-blue-400">{data.links.external}</div>
                <div className="mt-3 text-sm text-[var(--muted)]">Liens externes</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Réseaux Sociaux" score={`${data.social.score}/100`}>
            <p className="text-sm text-[var(--muted)] -mt-2">
              Les balises Open Graph contrôlent l'aperçu de votre site lors d'un partage sur Facebook,
              LinkedIn ou Twitter.
            </p>

            <div
              className="mt-6 rounded-2xl px-6 py-6 border flex items-center justify-between"
              style={{
                background: "rgba(0,0,0,0.35)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-4">
                <span 
                  className={`h-3 w-3 rounded-full ${
                    data.social.ok ? "bg-green-500" : "bg-yellow-400"
                  }`} 
                />
                <div>
                  <div className="text-base font-semibold text-[var(--text)]">
                    Balises Open Graph
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    og:title, og:description, og:image, og:url recommandées
                  </div>
                </div>
              </div>

              <div
                className="text-5xl font-extrabold"
                style={{ 
                  color: data.social.ok ? "rgb(34,197,94)" : "rgb(234,179,8)" 
                }}
              >
                {data.social.ogCount}
              </div>
            </div>

            <div
              className="mt-5 text-sm font-semibold"
              style={{ 
                color: data.social.ok ? "rgb(34,197,94)" : "rgb(234,179,8)" 
              }}
            >
              {data.social.ok 
                ? "✓ Balises Open Graph bien configurées" 
                : "⚠ Balises Open Graph incomplètes"}
            </div>

            {!data.social.ok && data.social.missing.length > 0 && (
              <div className="mt-3 text-xs text-[var(--muted)]">
                Manquantes : {data.social.missing.join(", ")}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Aspects Techniques" score={`${data.technicalScore}/100`}>
            <p className="text-sm text-[var(--muted)] -mt-2">
              Le HTTPS est obligatoire pour le référencement. 
              Un temps de réponse rapide améliore l'expérience utilisateur et le classement.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative rounded-2xl bg-black/5 dark:bg-white/5 p-8 text-center">
                <span
                  className={`absolute top-4 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full ${
                    data.technical.https ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="text-xl font-semibold text-[var(--text)]">HTTPS</div>
                <div
                  className="mt-4 text-lg font-semibold"
                  style={{ color: data.technical.https ? "rgb(34,197,94)" : "rgb(239,68,68)" }}
                >
                  {data.technical.https ? "🔒 Sécurisé" : "✗ Non sécurisé"}
                </div>
              </div>

              <div className="relative rounded-2xl bg-black/5 dark:bg-white/5 p-8 text-center">
                <span
                  className={`absolute top-4 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full ${
                    data.technical.responseTimeMs < 1500
                      ? "bg-green-500"
                      : data.technical.responseTimeMs < 3000
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                />
                <div className="text-xl font-semibold text-[var(--text)]">Temps de réponse</div>
                <div
                  className="mt-4 text-lg font-semibold"
                  style={{
                    color:
                      data.technical.responseTimeMs < 1500
                        ? "rgb(34,197,94)"
                        : data.technical.responseTimeMs < 3000
                        ? "rgb(234,179,8)"
                        : "rgb(239,68,68)",
                  }}
                >
                  {Math.round(data.technical.responseTimeMs)}ms
                </div>
              </div>

              <div className="relative rounded-2xl bg-black/5 dark:bg-white/5 p-8 text-center">
                <span
                  className={`absolute top-4 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full ${
                    data.technical.httpStatus < 300
                      ? "bg-green-500"
                      : data.technical.httpStatus < 400
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                />
                <div className="text-xl font-semibold text-[var(--text)]">Code HTTP</div>
                <div className="mt-4 text-lg font-semibold text-[var(--text)]">
                  {data.technical.httpStatus}
                </div>
              </div>

              <div className="relative rounded-2xl bg-black/5 dark:bg-white/5 p-8 text-center">
                <span
                  className={`absolute top-4 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full ${
                    data.technical.pageSizeKB < 1000
                      ? "bg-green-500"
                      : data.technical.pageSizeKB < 3000
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                />
                <div className="text-xl font-semibold text-[var(--text)]">Taille</div>
                <div
                  className="mt-4 text-lg font-semibold"
                  style={{
                    color:
                      data.technical.pageSizeKB < 1000
                        ? "rgb(34,197,94)"
                        : data.technical.pageSizeKB < 3000
                        ? "rgb(234,179,8)"
                        : "rgb(239,68,68)",
                  }}
                >
                  {Math.round(data.technical.pageSizeKB)} KB
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Problèmes Détectés" score={`${data.issues.length}`}>
            <p className="text-sm text-[var(--muted)] -mt-2">
              Les avertissements sont des points d'amélioration. 
              Les problèmes critiques (en rouge) impactent directement votre visibilité.
            </p>

            {data.issues.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-green-500/10 px-6 py-8 text-center">
                <div className="text-5xl mb-3">✓</div>
                <div className="text-lg font-semibold text-green-500">Aucun problème détecté</div>
                <div className="mt-2 text-sm text-[var(--muted)]">
                  Votre site respecte toutes les bonnes pratiques SEO analysées
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {data.issues.map((it) => {
                  const isHigh = it.severity === "high";
                  const leftBorder = isHigh ? "rgba(239,68,68,1)" : "rgba(234,179,8,1)";
                  const bg = isHigh ? "rgba(239,68,68,0.14)" : "rgba(234,179,8,0.14)";

                  return (
                    <div
                      key={it.code}
                      className="relative flex items-center gap-5 rounded-2xl px-6 py-6 border"
                      style={{
                        background: bg,
                        borderColor: "rgba(255,255,255,0.08)",
                        boxShadow: isHigh
                          ? "0 0 40px rgba(239,68,68,0.20)"
                          : "0 0 40px rgba(234,179,8,0.18)",
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 h-full w-[6px] rounded-l-2xl"
                        style={{ background: leftBorder }}
                      />

                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full font-extrabold text-xl"
                        style={{
                          background: isHigh ? "rgba(239,68,68,0.20)" : "rgba(234,179,8,0.20)",
                          color: isHigh ? "rgb(239,68,68)" : "rgb(234,179,8)",
                        }}
                      >
                        !
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[11px] uppercase tracking-widest font-semibold"
                          style={{ color: isHigh ? "rgb(239,68,68)" : "rgb(234,179,8)" }}
                        >
                          {it.code}
                        </div>

                        <div className="mt-1 text-base md:text-lg font-semibold text-[var(--text)]">
                          {it.label}
                        </div>

                        {it.detail && (
                          <div className="mt-2 text-sm text-[var(--muted)]">{it.detail}</div>
                        )}
                      </div>

                      <SeverityPill severity={it.severity} />
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <span className="hidden">
            <LinkIcon size={16} />
            <ImageIcon size={16} />
            <Timer size={16} />
            <Tag size={16} />
            <AlertTriangle size={16} />
            <Globe size={16} />
            <ListChecks size={16} />
            <FileText size={16} />
          </span>
        </div>
      </section>
    </div>
  );
}
