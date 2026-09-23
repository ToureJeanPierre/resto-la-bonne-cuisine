"use client";

import { useEffect, useState } from "react";

export default function AdminParametresPage() {
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [horaires, setHoraires] = useState("");
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [enregistre, setEnregistre] = useState(false);

  useEffect(() => {
    fetch("/api/parametres")
      .then((r) => r.json())
      .then((data) => {
        setAdresse(data.adresse);
        setTelephone(data.telephone);
        setHoraires(data.horaires);
      })
      .finally(() => setChargement(false));
  }, []);

  async function enregistrer() {
    setEnvoi(true);
    setEnregistre(false);
    await fetch("/api/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adresse, telephone, horaires }),
    });
    setEnvoi(false);
    setEnregistre(true);
    setTimeout(() => setEnregistre(false), 2000);
  }

  if (chargement) return <p className="text-ink/60">Chargement...</p>;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Paramètres</h1>
      <p className="text-sm text-ink/60">
        Ces informations s&apos;affichent en pied de page de l&apos;application, sur
        l&apos;écran d&apos;accueil des clients.
      </p>

      <div className="card space-y-3 p-4">
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Adresse</span>
          <input
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Téléphone</span>
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Horaires</span>
          <input
            value={horaires}
            onChange={(e) => setHoraires(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
      </div>

      <button onClick={enregistrer} disabled={envoi} className="btn-primary w-full">
        {envoi ? "Enregistrement..." : enregistre ? "✅ Enregistré !" : "ENREGISTRER"}
      </button>
    </div>
  );
}
