import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { listAudits, mapListItemToDetails } from "@/features/audit/api/auditApi";

export default function HistoryPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audits", 1],
    queryFn: () => listAudits(1),
  });

  function openPreview(item: any) {
    const result = mapListItemToDetails(item);

    // fallback pour le refresh
    localStorage.setItem("audit_preview", JSON.stringify({ url: item.url, result }));

    navigate("/audit/preview", {
      state: { url: item.url, result },
    });
  }

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
                <tr
                  key={a.detail_id ?? a.id ?? a.url}
                  onClick={() => openPreview(a)}
                  style={{ cursor: "pointer" }}
                  className="hover:bg-black/5"
                >
                  <td className="p-3 max-w-[420px]">
                    <span className="font-medium underline underline-offset-2 break-all">
                      {a.url}
                    </span>
                  </td>
                  <td className="p-3">{new Date(a.date_audit ?? a.date).toLocaleString()}</td>
                  <td className="p-3">{a.response_time} ms</td>
                  <td className="p-3">{a.word_count}</td>
                  <td className="p-3">{a.seo_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
