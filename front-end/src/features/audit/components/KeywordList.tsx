import type { AuditDetails } from "../types";

type Props = {
  keywords: AuditDetails["top_keywords"];
  limit?: number;
};

export default function KeywordList({ keywords, limit = 15 }: Props) {
  if (!keywords || keywords.length === 0) {
    return <div className="text-sm text-gray-500">Aucun mot clé disponible.</div>;
  }

  const items: Array<{ word: string; count?: number }> = Array.isArray(keywords)
    ? (typeof keywords[0] === "string"
        ? (keywords as string[]).map((w) => ({ word: w }))
        : (keywords as Array<{ word: string; count: number }>).map((k) => ({ word: k.word, count: k.count }))
      )
    : [];

  return (
    <ul className="divide-y rounded-xl border bg-gray-50">
      {items.slice(0, limit).map((k) => (
        <li key={k.word} className="flex items-center justify-between gap-3 px-4 py-2">
          <span className="font-medium text-gray-900">{k.word}</span>
          {typeof k.count === "number" ? (
            <span className="text-xs text-gray-600">{k.count}</span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </li>
      ))}
    </ul>
  );
}
