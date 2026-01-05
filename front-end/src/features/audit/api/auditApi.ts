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

/** Lance un audit SEO (analyse complète) */
export async function launchAudit(url: string): Promise<AuditDetails> {
  const { data } = await http.post("/api/audits/", { url });
  return data;
}

/** Liste paginée des audits */
export async function listAudits(page = 1): Promise<Paginated<AuditListItem>> {
  const { data } = await http.get("/api/audits/", { params: { page } });
  return normalizePaginated<AuditListItem>(data);
}

/** Détail d’un audit */
export async function getAudit(id: string | number): Promise<AuditDetails> {
  const { data } = await http.get(`/api/audits/${id}/`);
  return data;
}

