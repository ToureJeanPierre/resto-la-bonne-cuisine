"use client";

import { useEffect, useState } from "react";
import { formatFCFA } from "@/lib/format";

type Livraison = {
  id: string;
  statut: string;
  adresse: string | null;
  livreurId: string | null;
  livreur: { nom: string } | null;
  commande: {
    numero: number;
    total: number;
    statut: string;
    client: { nom: string; telephone: string };
  };
};

type Livreur = { id: string; nom: string; actif: boolean };

const LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  ASSIGNEE: "Assignée",
  EN_ROUTE: "🛵 En livraison",
  LIVREE: "✅ Livrée",
};

export default function AdminLivraisonsPage() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [chargement, setChargement] = useState(true);

  function charger() {
    Promise.all([
      fetch("/api/livraisons").then((r) => r.json()),
      fetch("/api/livreurs").then((r) => r.json()),
    ])
      .then(([l, v]) => {
        setLivraisons(l);
        setLivreurs(v);
      })
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  async function assigner(livraisonId: string, livreurId: string) {
    await fetch(`/api/livraisons/${livraisonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ livreurId: livreurId || null }),
    });
    charger();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Livraisons</h1>

      {chargement && <p className="text-ink/60">Chargement...</p>}

      <div className="space-y-3">
        {livraisons.map((l) => (
          <div key={l.id} className="card space-y-2 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                Commande #{l.commande.numero} — {l.commande.client.nom}
              </p>
              <p className="font-bold text-gold-dark">{formatFCFA(l.commande.total)}</p>
            </div>
            <p className="text-sm text-ink/60">Adresse : {l.adresse ?? "—"}</p>
            <div className="flex items-center justify-between">
              <span className="badge bg-black/5">{LABELS[l.statut] ?? l.statut}</span>
              <select
                value={l.livreurId ?? ""}
                onChange={(e) => assigner(l.id, e.target.value)}
                className="rounded-lg border border-black/10 px-2 py-1 text-sm"
              >
                <option value="">Assigner un livreur</option>
                {livreurs.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {!chargement && livraisons.length === 0 && (
          <p className="text-center text-ink/60">Aucune livraison.</p>
        )}
      </div>
    </div>
  );
}
