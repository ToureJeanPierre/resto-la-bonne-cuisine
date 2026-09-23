"use client";

import { useEffect, useState } from "react";
import { formatFCFA } from "@/lib/format";

type Stats = {
  chiffreAffairesGlobal: number;
  chiffreAffairesJour: number;
  commandesLivreesTotal: number;
  commandesTotal: number;
  platsVendusTotal: number;
  platsVendus: { nom: string; quantite: number; chiffreAffaires: number }[];
};

export default function AdminStatistiquesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch("/api/statistiques")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <p className="text-ink/60">Chargement...</p>;
  if (!stats) return <p className="text-ink/60">Impossible de charger les statistiques.</p>;

  const platLePlusVendu = stats.platsVendus[0];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold">Statistiques</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-gold-dark">{formatFCFA(stats.chiffreAffairesJour)}</p>
          <p className="text-sm text-ink/60">Chiffre d&apos;affaires du jour</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-gold-dark">{formatFCFA(stats.chiffreAffairesGlobal)}</p>
          <p className="text-sm text-ink/60">Chiffre d&apos;affaires global</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold">{stats.commandesLivreesTotal}</p>
          <p className="text-sm text-ink/60">Commandes livrées</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold">{stats.platsVendusTotal}</p>
          <p className="text-sm text-ink/60">Plats vendus</p>
        </div>
      </div>

      {platLePlusVendu && (
        <div className="card p-4">
          <p className="text-sm text-ink/60">🏆 Le plus commandé</p>
          <p className="text-lg font-bold">{platLePlusVendu.nom}</p>
          <p className="text-sm text-ink/60">{platLePlusVendu.quantite} vendus</p>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <p className="border-b border-black/10 p-4 font-semibold">Ventes par plat</p>
        {stats.platsVendus.length === 0 ? (
          <p className="p-4 text-center text-ink/60">
            Aucune vente enregistrée pour l&apos;instant (seules les commandes livrées comptent).
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-ink/50">
                <th className="p-3 font-medium">Plat</th>
                <th className="p-3 font-medium">Quantité</th>
                <th className="p-3 font-medium">Chiffre d&apos;affaires</th>
              </tr>
            </thead>
            <tbody>
              {stats.platsVendus.map((p) => (
                <tr key={p.nom} className="border-b border-black/5 last:border-0">
                  <td className="p-3">{p.nom}</td>
                  <td className="p-3">{p.quantite}</td>
                  <td className="p-3">{formatFCFA(p.chiffreAffaires)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
