export type AuditStatus = "success" | "error";

export type AuditListItem = {
  id: number | string;
  url: string;
  date: string; // ISO
  status: AuditStatus;
  response_time: number; // ms
  word_count: number;
  seo_score_global: number; // agrégé
};

export type AuditDetails = {
  id: number | string;
  url: string;
  date: string;
  status: AuditStatus;
  response_time: number;
  http_status: number;

  seo_score_global: number;
  word_count: number;

  title: string | null;
  title_length: number | null;
  meta_description: string | null;
  meta_length: number | null;

  h1_count: number;
  h2_count: number;
  h3_count: number;

  internal_links: number;
  external_links: number;

  images_count: number;
  images_with_alt: number;

  // certains backends renvoient [{word,count}], d'autres une simple liste
  top_keywords: Array<{ word: string; count: number }> | string[];
};
