"use client";

import { useEffect, useState } from "react";
import { formatFCFA } from "@/lib/format";
import { STATUTS_COMMANDE, LABELS_STATUT_COMMANDE, StatutCommande } from "@/lib/constants";

type Commande = {
  id: string;
  numero: number;
  total: number;
  statut: StatutCommande;
  modeLivraison: string;
  createdAt: string;
  client: { nom: string; telephone: string };
  details: { nomPlat: string; quantite: number }[];
};

const FILTRES: { label: string; valeur: StatutCommande | "TOUTES" }[] = [
  { label: "Toutes", valeur: "TOUTES" },
  { label: "En attente", valeur: "RECUE" },
  { label: "Préparation", valeur: "EN_PREPARATION" },
  { label: "Livraison", valeur: "EN_LIVRAISON" },
  { label: "Livrées", valeur: "LIVREE" },
  { label: "Annulées", valeur: "ANNULEE" },
];

export default function AdminCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filtre, setFiltre] = useState<StatutCommande | "TOUTES">("TOUTES");
  const [chargement, setChargement] = useState(true);

  function charger() {
    setChargement(true);
    const url =
      filtre === "TOUTES"
        ? "/api/commandes?scope=admin"
        : `/api/commandes?scope=admin&statut=${filtre}`;
    fetch(url)
      .then((r) => r.json())
      .then(setCommandes)
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  async function changerStatut(id: string, statut: string) {
    await fetch(`/api/commandes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    charger();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Commandes</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            onClick={() => setFiltre(f.valeur)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
              filtre === f.valeur ? "bg-gold text-ink" : "bg-black/5 text-ink/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {chargement && <p className="text-ink/60">Chargement...</p>}

      <div className="space-y-3">
        {commandes.map((c) => (
          <div key={c.id} className="card space-y-2 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  #{c.numero} — {c.client.nom}
                </p>
                <p className="text-xs text-ink/50">{c.client.telephone}</p>
              </div>
              <p className="font-bold text-gold-dark">{formatFCFA(c.total)}</p>
            </div>
            <p className="text-sm text-ink/60">
              {c.details.map((d) => `${d.nomPlat} ×${d.quantite}`).join(", ")}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink/50">
                {c.modeLivraison === "LIVRAISON" ? "Livraison" : "Retrait"}
              </span>
              <select
                value={c.statut}
                onChange={(e) => changerStatut(c.id, e.target.value)}
                className="rounded-lg border border-black/10 px-2 py-1 text-sm"
              >
                {STATUTS_COMMANDE.map((s) => (
                  <option key={s} value={s}>
                    {LABELS_STATUT_COMMANDE[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {!chargement && commandes.length === 0 && (
          <p className="text-center text-ink/60">Aucune commande.</p>
        )}
      </div>
    </div>
  );
}
