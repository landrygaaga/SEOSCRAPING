import { useMemo, type ReactNode } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Link as LinkIcon,
  Image as ImageIcon,
  Timer,
  Globe,
  FileText,
  Tag,
  ListChecks,
  AlertTriangle,
} from "lucide-react";

type AuditDetails = {
  url: string;
  date: string;
  statusLabel: string;

  scores: {
    global: number;
    mobile: number;
    desktop: number;
  };

  meta: {
    title: string;
    titleLength: number;
    description: string;
    descriptionLength: number;
    viewport: boolean;
    canonical: boolean;
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

  content: {
    words: number;
    paragraphs: number;
  };

  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
  };

  links: {
    total: number;
    internal: number;
    external: number;
  };

  technical: {
    https: boolean;
    responseTimeMs: number;
    httpStatus: number;
  };

  issues: Array<{
    code: string;
    label: string;
    severity: "low" | "medium" | "high";
    detail?: string;
  }>;
};

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
          <div className="text-[11px] uppercase tracking-widest text-[var(--muted)]">
            Analyse
          </div>
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

export default function AuditDetailPage() {
  const { id } = useParams();
  const location = useLocation();

  const data: AuditDetails = useMemo(() => {
    const urlFromState = (location.state as any)?.url as string | undefined;

    return {
      url: urlFromState ?? "https://example.com/page",
      date: "29 décembre 2025 à 16:58",
      statusLabel: "Analyse terminée",
      scores: { global: 79, mobile: 83, desktop: 100 },

      meta: {
        title: "Lucide React: Icons",
        titleLength: 21,
        description: "Des icônes React modernes et faciles à utiliser.",
        descriptionLength: 58,
        viewport: true,
        canonical: true,
        lang: "fr",
      },

      headings: { h1: 1, h2: 10, h3: 3, h4: 0, h5: 0, h6: 0, ok: true },
      content: { words: 607, paragraphs: 35 },
      images: { total: 4, withAlt: 2, missingAlt: 2 },
      links: { total: 47, internal: 35, external: 12 },
      technical: { https: true, responseTimeMs: 54, httpStatus: 200 },

      issues: [
        { code: "TITLE", label: "Title court (21 car.)", severity: "medium" },
        { code: "DESCRIPTION", label: "Meta description courte (58 car.)", severity: "medium" },
        { code: "IMAGES", label: "2 images sans attribut alt", severity: "high" },
      ],
    };
  }, [location.state]);

  return (
    <div className="relative">
      {/* HERO header du rapport */}
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
            {id ? <span className="mx-2 opacity-50">•</span> : null}
            {id ? <span>Audit #{id}</span> : null}
          </div>

          {/* SCORE CARD */}
          <div className="mt-10 card p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center justify-items-center">
              <ScoreRing value={data.scores.global} label="Score SEO" ringColor="#84cc16" />
              <ScoreRing value={data.scores.mobile} label="Mobile" ringColor="#3b82f6" subLabel="Performance smartphone" />
              <ScoreRing value={data.scores.desktop} label="Desktop" ringColor="#a855f7" subLabel="Performance ordinateur" />
            </div>

            <div className="mt-8 text-xs text-[var(--muted)] flex flex-wrap items-center justify-center gap-4">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" /> 90-100 : Excellent
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime-400" /> 70-89 : Bon
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400" /> 50-69 : Moyen
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" /> 0-49 : Critique
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6">
          {/* Balises meta */}
          <SectionCard title="Balises Meta" score="65/100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-5">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="inline-flex items-center gap-2 text-[var(--text)]">
                    <Tag size={16} /> Title
                  </span>
                  <span className="text-xs text-[var(--muted)]">{data.meta.titleLength} car.</span>
                </div>
                <div className="mt-3 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm text-[var(--muted)]">
                  {data.meta.title}
                </div>
              </div>

              <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-5">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="inline-flex items-center gap-2 text-[var(--text)]">
                    <FileText size={16} /> Meta Description
                  </span>
                  <span className="text-xs text-[var(--muted)]">{data.meta.descriptionLength} car.</span>
                </div>
                <div className="mt-3 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm text-[var(--muted)]">
                  {data.meta.description}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricTile label="Viewport" value={data.meta.viewport ? "Présent" : "Absent"} icon={<Globe size={14} />} />
              <MetricTile label="Canonical" value={data.meta.canonical ? "Présent" : "Absent"} icon={<ListChecks size={14} />} />
              <MetricTile label="Langue" value={data.meta.lang ?? "Non détectée"} icon={<FileText size={14} />} />
            </div>
          </SectionCard>

          {/* Structure Hn */}
          <SectionCard title="Structure des Titres" score="100/100">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <MetricTile label="H1" value={String(data.headings.h1)} />
              <MetricTile label="H2" value={String(data.headings.h2)} />
              <MetricTile label="H3" value={String(data.headings.h3)} />
              <MetricTile label="H4" value={String(data.headings.h4)} />
              <MetricTile label="H5" value={String(data.headings.h5)} />
              <MetricTile label="H6" value={String(data.headings.h6)} />
            </div>

            <div className="mt-4 text-sm text-[var(--muted)] inline-flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              {data.headings.ok ? "Structure H1 optimale" : "Structure à vérifier"}
            </div>
          </SectionCard>

          {/* Contenu */}
          <SectionCard title="Contenu Textuel" score="70/100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-6 text-center">
                <div className="text-4xl font-semibold" style={{ color: "var(--accent)" }}>
                  {data.content.words}
                </div>
                <div className="mt-2 text-sm text-[var(--muted)]">Mots</div>
              </div>

              <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-6 text-center">
                <div className="text-4xl font-semibold text-[var(--text)]">
                  {data.content.paragraphs}
                </div>
                <div className="mt-2 text-sm text-[var(--muted)]">Paragraphes</div>
              </div>
            </div>
          </SectionCard>

          {/* Images */}
          <SectionCard title="Optimisation des Images" score="50/100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricTile label="Images" value={`${data.images.total}`} icon={<ImageIcon size={14} />} />
              <MetricTile label="Avec alt" value={`${data.images.withAlt}`} />
              <MetricTile label="Sans alt" value={`${data.images.missingAlt}`} />
            </div>
          </SectionCard>

          {/* Liens */}
          <SectionCard title="Liens et Maillage" score="100/100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricTile label="Total des liens" value={`${data.links.total}`} icon={<LinkIcon size={14} />} />
              <MetricTile label="Liens internes" value={`${data.links.internal}`} />
              <MetricTile label="Liens externes" value={`${data.links.external}`} />
            </div>
          </SectionCard>

          {/* Aspects techniques */}
          <SectionCard title="Aspects Techniques" score="90/100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricTile label="HTTPS" value={data.technical.https ? "Sécurisé" : "Non"} icon={<Globe size={14} />} />
              <MetricTile label="Temps de réponse" value={`${data.technical.responseTimeMs} ms`} icon={<Timer size={14} />} />
              <MetricTile label="Code HTTP" value={`${data.technical.httpStatus}`} icon={<FileText size={14} />} />
            </div>
          </SectionCard>

          {/* Problèmes détectés */}
          <SectionCard title="Problèmes Détectés" score={`${data.issues.length}`}>
            <div className="space-y-3">
              {data.issues.map((it) => (
                <div
                  key={it.code}
                  className="flex items-start justify-between gap-4 rounded-2xl bg-black/5 dark:bg-white/5 px-5 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <AlertTriangle size={18} className="text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text)]">{it.code}</div>
                      <div className="text-xs text-[var(--muted)] mt-1">{it.label}</div>
                      {it.detail ? <div className="text-xs text-[var(--muted)] mt-2">{it.detail}</div> : null}
                    </div>
                  </div>

                  <SeverityPill severity={it.severity} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
