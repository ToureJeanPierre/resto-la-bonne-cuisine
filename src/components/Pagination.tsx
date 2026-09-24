"use client";

export default function Pagination({
  page,
  total,
  limit,
  onChange,
}: {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}) {
  const nombrePages = Math.max(1, Math.ceil(total / limit));
  if (nombrePages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-full bg-black/5 px-3 py-1.5 text-sm font-medium text-ink/60 disabled:opacity-40"
      >
        ← Précédent
      </button>
      <span className="text-sm text-ink/60">
        Page {page} / {nombrePages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= nombrePages}
        className="rounded-full bg-black/5 px-3 py-1.5 text-sm font-medium text-ink/60 disabled:opacity-40"
      >
        Suivant →
      </button>
    </div>
  );
}
