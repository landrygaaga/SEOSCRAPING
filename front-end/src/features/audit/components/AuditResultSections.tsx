import ResultCard from "./ResultCard";
import KeywordList from "./KeywordList";
import type { AuditDetails } from "../types";
import type { ReactNode } from "react";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2 border-b last:border-b-0">
      <div className="text-gray-500">{label}</div>
      <div className="text-right font-medium text-gray-900 break-all">{value}</div>
    </div>
  );
}

function YesNo({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs " +
        (ok ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200")
      }
    >
      {ok ? "Présent" : "Absent"}
    </span>
  );
}

export default function AuditResultSections({ data }: { data: AuditDetails }) {
  const date = data.date ? new Date(data.date) : null;
  const titlePresent = Boolean(data.title && data.title.trim().length);
  const metaPresent = Boolean(data.meta_description && data.meta_description.trim().length);
  const hasH1 = (data.h1_count ?? 0) > 0;
  const hasInternalLinks = (data.internal_links ?? 0) > 0;
  const hasExternalLinks = (data.external_links ?? 0) > 0;
  const hasImages = (data.images_count ?? 0) > 0;
  const altCoverage = hasImages ? Math.round((data.images_with_alt / Math.max(data.images_count, 1)) * 100) : 0;

  return (
    <div className="grid gap-5">
      <ResultCard title="Informations générales">
        <Row label="URL analysée" value={data.url} />
        <Row label="Date de l’audit" value={date ? date.toLocaleString() : "—"} />
        <Row label="Statut" value={data.status} />
        <Row label="Temps de réponse" value={`${data.response_time} ms`} />
        <Row label="Code HTTP" value={data.http_status} />
        <Row label="Nombre de mots" value={data.word_count} />
        <Row label="Score SEO global (agrégé)" value={data.seo_score_global} />
      </ResultCard>

      <ResultCard
        title="Analyse des balises"
        description="Données factuelles : présence, contenu, longueur"
      >
        <Row label="Title" value={titlePresent ? data.title : <YesNo ok={false} />} />
        <Row label="Longueur Title" value={data.title_length ?? "—"} />
        <Row label="Meta description" value={metaPresent ? data.meta_description : <YesNo ok={false} />} />
        <Row label="Longueur Meta" value={data.meta_length ?? "—"} />
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Présence :</span>
          <span><YesNo ok={titlePresent} /></span>
          <span><YesNo ok={metaPresent} /></span>
        </div>
      </ResultCard>

      <ResultCard title="Structure du contenu" description="Comptage des titres et volume de texte">
        <Row label="H1" value={data.h1_count} />
        <Row label="H2" value={data.h2_count} />
        <Row label="H3" value={data.h3_count} />
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Essentiels :</span>
          <span><YesNo ok={hasH1} /></span>
        </div>
      </ResultCard>

      <ResultCard title="Aspects techniques simples" description="Liens, images, attributs alt">
        <Row label="Liens internes" value={data.internal_links} />
        <Row label="Liens externes" value={data.external_links} />
        <Row label="Images" value={data.images_count} />
        <Row label="Images avec alt" value={data.images_with_alt} />
        {hasImages ? (
          <Row label="Couverture alt" value={`${altCoverage}%`} />
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Présence :</span>
          <span><YesNo ok={hasInternalLinks} /></span>
          <span><YesNo ok={hasExternalLinks} /></span>
          <span><YesNo ok={hasImages} /></span>
        </div>
      </ResultCard>

      <ResultCard title="Analyse sémantique" description="Mots fréquents après nettoyage">
        <KeywordList keywords={data.top_keywords} />
      </ResultCard>
    </div>
  );
}
