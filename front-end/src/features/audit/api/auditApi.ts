import { http } from "@/lib/http";
import type { AuditDetails, AuditListItem } from "../types";

type Paginated<T> = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
};

function normalizePaginated<T>(data: any): Paginated<T> {
  // DRF pagination: {count, next, previous, results}
  if (data && Array.isArray(data.results)) {
    return {
      count: Number(data.count ?? data.results.length),
      next: data.next ?? null,
      previous: data.previous ?? null,
      results: data.results,
    };
  }

  // Fallback: backend renvoie directement un tableau
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }

  // Fallback ultime
  return { count: 0, next: null, previous: null, results: [] };
}

/** Lance un audit SEO */
export async function launchAudit(url: string): Promise<AuditDetails> {
  const { data } = await http.post("/api/analyser/", { url }); // ici OK 
  return data;
}

/** Liste paginée des audits */
export async function listAudits(page = 1): Promise<Paginated<AuditListItem>> {
  const { data } = await http.get("/api/analyser_liste/", { params: { page } }); // ici OK 
  return normalizePaginated<AuditListItem>(data); // OK: le backend renvoie un tableau => mon normalize le gère
}

function splitLinks(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);

  if (typeof v === "string") {
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

export function mapListItemToDetails(item: any) {
  const internalList = splitLinks(item.internal_links);
  const externalList = splitLinks(item.external_links);

  const totalImages = Number(item.images_count ?? 0);
  const withAltCount = Number(item.images_with_alt ?? 0);

  return {
    is_secure: Boolean(item.is_secure),
    http_status: Number(item.http_status ?? 0),
    temps_reponse_ms: Number(item.response_time ?? 0),
    taille_page_octets: 0, // pas dispo dans la liste

    url_finale: item.url ?? "",
    word_count: Number(item.word_count ?? 0),
    top_keywords: Array.isArray(item.top_keywords) ? item.top_keywords : [],

    //  liens
    liens_internes: internalList,
    liens_externes: externalList,
    nombre_liens_internes: internalList.length,
    nombre_liens_externes: externalList.length,
    nombre_liens: internalList.length + externalList.length,

    //  images
    nombre_images: totalImages,
    images_lazy_loading: Array.isArray(item.images_lazy_loading) ? item.images_lazy_loading : [],
    images_avec_alt: Array.from({ length: Math.max(0, withAltCount) }).map(() => ({ alt: "" })),

    //  meta
    titre: item.title ?? "",
    longueur_titre: Number(item.title_length ?? 0),
    meta_description: item.meta_description ?? "",
    longueur_meta_description: Number(item.meta_description_length ?? 0),

    meta_seo_score: Number(item.meta_seo_score ?? 0),
    images_seo_score: Number(item.images_seo_score ?? 0),
    links_seo_score: Number(item.links_seo_score ?? 0),

    paragraphes: {
      h1_count: Number(item.h1_count ?? 0),
      h2_count: Number(item.h2_count ?? 0),
      h3_count: Number(item.h3_count ?? 0),
      h4_count: Number(item.h4_count ?? 0),
      h5_count: Number(item.h5_count ?? 0),
      h6_count: Number(item.h6_count ?? 0),
    },

    mobile_score: Number(item.mobile_score ?? 0),
    desktop_score: Number(item.desktop_score ?? 0),
    score_seo: Number(item.seo_score ?? 0),

    date_audit: item.date_audit ?? item.date ?? "",

    // ces champs n'existent pas dans /analyser_liste/, donc valeurs neutres
    og_count: 0,
    social_score: 0,
    og_missing: [],
  };
}
