"use client";

import { useEffect, useState } from "react";
import { formatFCFA } from "@/lib/format";

type Client = {
  id: string;
  nom: string;
  telephone: string;
  nombreCommandes: number;
  montantTotal: number;
  credits: number;
  recompensesDisponibles: number;
  fideliteActive: boolean;
  derniereCommande: string | null;
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enEdition, setEnEdition] = useState<string | null>(null);

  function charger() {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  async function corrigerFidelite(clientId: string, credits: number, recompenses: number) {
    await fetch(`/api/clients/${clientId}/fidelite`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credits, recompensesDisponibles: recompenses }),
    });
    setEnEdition(null);
    charger();
  }

  async function basculerFideliteClient(clientId: string, active: boolean) {
    await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fideliteActive: active }),
    });
    charger();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Clients</h1>

      {chargement && <p className="text-ink/60">Chargement...</p>}

      <div className="space-y-3">
        {clients.map((c) => (
          <div key={c.id} className="card space-y-2 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{c.nom}</p>
                <p className="text-xs text-ink/50">{c.telephone}</p>
              </div>
              <p className="text-sm text-ink/60">{c.nombreCommandes} commande(s)</p>
            </div>
            <p className="text-sm text-ink/60">Total livré : {formatFCFA(c.montantTotal)}</p>

            {c.recompensesDisponibles > 0 ? (
              <p className="text-sm font-semibold text-green-700">
                🎁 Récompense disponible ({c.recompensesDisponibles})
              </p>
            ) : (
              <p className="text-sm text-ink/60">Repas validés : {c.credits}/5</p>
            )}

            {enEdition === c.id ? (
              <EditionFidelite
                credits={c.credits}
                recompenses={c.recompensesDisponibles}
                onAnnuler={() => setEnEdition(null)}
                onValider={(credits, recompenses) => corrigerFidelite(c.id, credits, recompenses)}
              />
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEnEdition(c.id)}
                  className="text-xs font-semibold text-ink/50"
                >
                  Corriger la fidélité
                </button>
                <button
                  onClick={() => basculerFideliteClient(c.id, !c.fideliteActive)}
                  className={`text-xs font-semibold ${
                    c.fideliteActive ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {c.fideliteActive ? "Désactiver la fidélité" : "Réactiver la fidélité"}
                </button>
              </div>
            )}
          </div>
        ))}
        {!chargement && clients.length === 0 && (
          <p className="text-center text-ink/60">Aucun client pour le moment.</p>
        )}
      </div>
    </div>
  );
}

function EditionFidelite({
  credits,
  recompenses,
  onAnnuler,
  onValider,
}: {
  credits: number;
  recompenses: number;
  onAnnuler: () => void;
  onValider: (credits: number, recompenses: number) => void;
}) {
  const [c, setC] = useState(credits);
  const [r, setR] = useState(recompenses);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-black/5 p-2">
      <label className="text-xs">
        Crédits
        <input
          type="number"
          value={c}
          onChange={(e) => setC(Number(e.target.value))}
          className="ml-1 w-14 rounded border border-black/10 px-1"
        />
      </label>
      <label className="text-xs">
        Récompenses
        <input
          type="number"
          value={r}
          onChange={(e) => setR(Number(e.target.value))}
          className="ml-1 w-14 rounded border border-black/10 px-1"
        />
      </label>
      <button onClick={() => onValider(c, r)} className="text-xs font-semibold text-green-700">
        Valider
      </button>
      <button onClick={onAnnuler} className="text-xs text-ink/50">
        Annuler
      </button>
    </div>
  );
}
