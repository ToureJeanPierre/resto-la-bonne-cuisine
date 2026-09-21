"use client";

import { useEffect, useState } from "react";

type Avis = {
  id: string;
  note: number;
  commentaire: string | null;
  masque: boolean;
  createdAt: string;
  client: { nom: string };
};

export default function AdminAvisPage() {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [chargement, setChargement] = useState(true);

  function charger() {
    fetch("/api/avis?scope=admin")
      .then((r) => r.json())
      .then(setAvis)
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  async function basculerMasque(id: string, masque: boolean) {
    await fetch(`/api/avis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masque }),
    });
    charger();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Avis clients</h1>

      {chargement && <p className="text-ink/60">Chargement...</p>}

      <div className="space-y-3">
        {avis.map((a) => (
          <div key={a.id} className={`card space-y-1 p-4 ${a.masque ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{a.client.nom}</p>
              <span>{"⭐".repeat(a.note)}</span>
            </div>
            {a.commentaire && <p className="text-sm text-ink/70">{a.commentaire}</p>}
            <button
              onClick={() => basculerMasque(a.id, !a.masque)}
              className="text-xs font-semibold text-ink/50"
            >
              {a.masque ? "Réafficher" : "Masquer"}
            </button>
          </div>
        ))}
        {!chargement && avis.length === 0 && (
          <p className="text-center text-ink/60">Aucun avis pour le moment.</p>
        )}
      </div>
    </div>
  );
}
