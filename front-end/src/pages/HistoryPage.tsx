import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { listAudits, mapListItemToDetails } from "@/features/audit/api/auditApi";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Infinite scroll avec React Query 
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["audits"],
    queryFn: ({ pageParam = 1 }) => listAudits(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      // Si la dernière page a des résultats, retourner la page suivante
      if (lastPage.results && lastPage.results.length > 0) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Détecter le scroll pour afficher le bouton "retour en haut"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer pour charger plus au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById("scroll-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openPreview(item: any) {
    const result = mapListItemToDetails(item);
    localStorage.setItem("audit_preview", JSON.stringify({ url: item.url, result }));
    navigate("/audit/preview", {
      state: { url: item.url, result },
    });
  }

  // Fusionner toutes les pages et trier par date décroissante
  const allAudits = data?.pages.flatMap((page) => page.results) ?? [];
  const sortedAudits = [...allAudits].sort((a, b) => {
    const dateA = new Date(a.date_audit ?? a.date).getTime();
    const dateB = new Date(b.date_audit ?? b.date).getTime();
    return dateB - dateA; // Du plus récent au plus ancien l'ordre de liste historique
  });

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--text)]">Historique</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Liste des audits réalisés (lecture seule).
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-[var(--muted)]">Chargement…</div>
      ) : null}

      {isError ? (
        <div className="text-sm text-red-600">Erreur de chargement.</div>
      ) : null}

      {sortedAudits.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead
              className="text-[var(--muted)]"
              style={{ background: "var(--bg-secondary)" }}
            >
              <tr>
                <th className="text-left p-3 font-medium">URL</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Temps</th>
                <th className="text-left p-3 font-medium">Mots</th>
                <th className="text-left p-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedAudits.map((a: any, idx: number) => (
                <tr
                  key={a.detail_id ?? a.id ?? `${a.url}-${idx}`}
                  onClick={() => openPreview(a)}
                  className="cursor-pointer transition-colors duration-150 border-t border-[var(--border)]"
                  style={{
                    background: "var(--bg)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg)";
                  }}
                >
                  <td className="p-3 max-w-[420px]">
                    <span className="font-medium underline underline-offset-2 break-all text-[var(--text)]">
                      {a.url}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--muted)]">
                    {new Date(a.date_audit ?? a.date).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-3 text-[var(--muted)]">{a.response_time} ms</td>
                  <td className="p-3 text-[var(--muted)]">{a.word_count}</td>
                  <td className="p-3 text-[var(--text)] font-semibold">{a.seo_score}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sentinel pour l'infinite scroll */}
          <div id="scroll-sentinel" className="h-8 flex items-center justify-center">
            {isFetchingNextPage ? (
              <div className="text-xs text-[var(--muted)]">Chargement…</div>
            ) : hasNextPage ? (
              <div className="text-xs text-[var(--muted)]">Scroll pour charger plus</div>
            ) : (
              <div className="text-xs text-[var(--muted)]">Fin de la liste</div>
            )}
          </div>
        </div>
      ) : null}

      {/* Bouton scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: "var(--accent)",
            color: "white",
          }}
          aria-label="Retour en haut"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Style CSS pour les variables */}
      <style>{`
        :root {
          --bg: white;
          --bg-secondary: #f9fafb;
          --bg-hover: rgba(0, 0, 0, 0.04);
          --text: #111827;
          --muted: #6b7280;
          --border: #e5e7eb;
        }

        [data-theme="dark"], .dark {
          --bg: #0f0f0f;
          --bg-secondary: rgba(255, 255, 255, 0.03);
          --bg-hover: rgba(255, 255, 255, 0.06);
          --text: #f9fafb;
          --muted: #9ca3af;
          --border: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}