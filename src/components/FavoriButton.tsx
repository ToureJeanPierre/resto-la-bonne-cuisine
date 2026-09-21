"use client";

import { useEffect, useState } from "react";
import { lireFavoris, basculerFavori } from "@/lib/favoris";

export default function FavoriButton({ platId }: { platId: string }) {
  const [favori, setFavori] = useState(false);

  useEffect(() => {
    setFavori(lireFavoris().includes(platId));
  }, [platId]);

  return (
    <button
      onClick={() => setFavori(basculerFavori(platId).includes(platId))}
      className="rounded-full bg-white p-2 text-xl shadow ring-1 ring-black/5"
      aria-label="Ajouter aux favoris"
    >
      {favori ? "❤️" : "🤍"}
    </button>
  );
}
