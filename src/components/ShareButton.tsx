"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copie, setCopie] = useState(false);

  async function partager() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const texte = "Découvrez notre menu du jour et commandez directement votre repas 🍽️";

    if (navigator.share) {
      try {
        await navigator.share({ title: "Restaurant Kalym", text: texte, url });
        return;
      } catch {
        // annulé par l'utilisateur, on continue vers le fallback
      }
    }

    try {
      await navigator.clipboard.writeText(`${texte} ${url}`);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button onClick={partager} className="btn-secondary w-full">
      📲 {copie ? "Lien copié !" : "Partager le lien"}
    </button>
  );
}
