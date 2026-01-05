import { useMemo, useState } from "react";
import { urlSchema } from "@/lib/validators";

type Props = {
  defaultUrl?: string;
  onSubmit: (url: string) => void;
  isLoading?: boolean;
};

export default function UrlAuditForm({ defaultUrl = "", onSubmit, isLoading }: Props) {
  const [url, setUrl] = useState(defaultUrl);
  const [touched, setTouched] = useState(false);

  const error = useMemo(() => {
    if (!touched) return "";
    const res = urlSchema.safeParse(url.trim());
    return res.success ? "" : res.error.issues[0]?.message ?? "URL invalide";
  }, [url, touched]);

  return (
    <form
      className="flex flex-col sm:flex-row gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        const parsed = urlSchema.safeParse(url.trim());
        if (!parsed.success) return;
        onSubmit(parsed.data);
      }}
    >
      <input
        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
        placeholder="https://exemple.com/page"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => setTouched(true)}
      />

      <button
        className="rounded-2xl bg-black text-white px-5 py-3 text-sm font-medium disabled:opacity-60"
        disabled={!!error || isLoading}
        type="submit"
      >
        {isLoading ? "Audit en cours…" : "Lancer l’audit"}
      </button>

      {error ? <div className="text-xs text-red-600 mt-1 sm:mt-3">{error}</div> : null}
    </form>
  );
}
