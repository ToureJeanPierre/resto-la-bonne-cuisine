"use client";

import { useEffect, useState } from "react";
import { formatFCFA } from "@/lib/format";
import ConfirmerSuppression from "@/components/ConfirmerSuppression";

type CommandeCorbeille = {
  id: string;
  numero: number;
  total: number;
  createdAt: string;
  client: { nom: string; telephone: string };
};

type ClientCorbeille = {
  id: string;
  nom: string;
  telephone: string;
  nombreCommandes: number;
};

export default function AdminCorbeillePage() {
  const [onglet, setOnglet] = useState<"commandes" | "clients">("commandes");
  const [commandes, setCommandes] = useState<CommandeCorbeille[]>([]);
  const [clients, setClients] = useState<ClientCorbeille[]>([]);
  const [chargement, setChargement] = useState(true);
  const [aSupprimer, setASupprimer] = useState<{ type: "commandes" | "clients"; id: string; nom: string } | null>(
    null
  );

  function charger() {
    setChargement(true);
    Promise.all([
      fetch("/api/commandes?scope=admin&corbeille=true&limit=100")
        .then((r) => r.json())
        .then((data) => setCommandes(data.commandes ?? [])),
      fetch("/api/clients?corbeille=true&limit=100")
        .then((r) => r.json())
        .then((data) => setClients(data.clients ?? [])),
    ]).finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  async function restaurer(type: "commandes" | "clients", id: string) {
    await fetch(`/api/${type}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supprimeLe: false }),
    });
    charger();
  }

  async function supprimerDefinitivement(motDePasse: string): Promise<string | null> {
    if (!aSupprimer) return null;
    const res = await fetch(`/api/${aSupprimer.type}/${aSupprimer.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motDePasse }),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Suppression impossible.";
    setASupprimer(null);
    charger();
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">🗑️ Corbeille</h1>
        <p className="text-sm text-ink/60">
          Les commandes et clients supprimés restent ici, consultables, jusqu&apos;à ce que tu
          les supprimes définitivement (avec confirmation par mot de passe) ou que tu les
          restaures.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setOnglet("commandes")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${
            onglet === "commandes" ? "bg-gold text-ink" : "bg-black/5 text-ink/60"
          }`}
        >
          Commandes ({commandes.length})
        </button>
        <button
          onClick={() => setOnglet("clients")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold ${
            onglet === "clients" ? "bg-gold text-ink" : "bg-black/5 text-ink/60"
          }`}
        >
          Clients ({clients.length})
        </button>
      </div>

      {chargement && <p className="text-ink/60">Chargement...</p>}

      {!chargement && onglet === "commandes" && (
        <div className="space-y-3">
          {commandes.length === 0 && (
            <p className="text-center text-ink/60">Aucune commande à la corbeille.</p>
          )}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => restaurer("commandes", c.id)}
                  className="text-xs font-semibold text-green-700"
                >
                  ♻️ Restaurer
                </button>
                <button
                  onClick={() => setASupprimer({ type: "commandes", id: c.id, nom: `La commande #${c.numero}` })}
                  className="text-xs font-semibold text-red-600"
                >
                  🗑️ Supprimer définitivement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!chargement && onglet === "clients" && (
        <div className="space-y-3">
          {clients.length === 0 && (
            <p className="text-center text-ink/60">Aucun client à la corbeille.</p>
          )}
          {clients.map((c) => (
            <div key={c.id} className="card space-y-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.nom}</p>
                  <p className="text-xs text-ink/50">{c.telephone}</p>
                </div>
                <p className="text-sm text-ink/60">{c.nombreCommandes} commande(s)</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => restaurer("clients", c.id)}
                  className="text-xs font-semibold text-green-700"
                >
                  ♻️ Restaurer
                </button>
                <button
                  onClick={() => setASupprimer({ type: "clients", id: c.id, nom: c.nom })}
                  className="text-xs font-semibold text-red-600"
                >
                  🗑️ Supprimer définitivement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {aSupprimer && (
        <ConfirmerSuppression
          nomElement={aSupprimer.nom}
          onConfirmer={supprimerDefinitivement}
          onAnnuler={() => setASupprimer(null)}
        />
      )}
    </div>
  );
}
