import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listAudits } from "@/features/audit/api/auditApi";

export default function HistoryPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["audits", 1],
    queryFn: () => listAudits(1),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Historique</h2>
        <p className="text-sm text-gray-600 mt-1">Liste des audits réalisés (lecture seule).</p>
      </div>

      {isLoading ? <div className="text-sm text-gray-500">Chargement…</div> : null}
      {isError ? <div className="text-sm text-red-600">Erreur de chargement.</div> : null}

      {data ? (
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">URL</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Temps</th>
                <th className="text-left p-3">Mots</th>
                <th className="text-left p-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((a: any) => (
                <tr key={String(a.id)} className="border-t hover:bg-gray-50">
                  <td className="p-3 max-w-[420px]">
                    <Link className="font-medium underline underline-offset-2 break-all" to={`/historique/${a.id}`}>
                      {a.url}
                    </Link>
                  </td>
                  <td className="p-3">{new Date(a.date).toLocaleString()}</td>
                  <td className="p-3">{a.response_time} ms</td>
                  <td className="p-3">{a.word_count}</td>
                  <td className="p-3">{a.seo_score_global}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
