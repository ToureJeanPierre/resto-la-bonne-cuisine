"use client";

import { useEffect, useState } from "react";

export default function AdminParametresPage() {
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [horaires, setHoraires] = useState("");
  const [fideliteActive, setFideliteActive] = useState(true);
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
        setFideliteActive(data.fideliteActive ?? true);
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

  async function basculerFidelite(active: boolean) {
    setFideliteActive(active);
    await fetch("/api/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fideliteActive: active }),
    });
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

      <div className="card flex items-center justify-between p-4">
        <div>
          <p className="font-semibold">🎁 Programme de fidélité</p>
          <p className="text-sm text-ink/60">
            {fideliteActive ? "Actif pour tous les clients" : "Désactivé pour tous les clients"}
          </p>
        </div>
        <button
          onClick={() => basculerFidelite(!fideliteActive)}
          className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${
            fideliteActive ? "bg-gold" : "bg-black/20"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
              fideliteActive ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-ink/50">
        Tu peux aussi désactiver la fidélité pour un client précis depuis sa fiche dans{" "}
        <span className="font-semibold">Admin → Clients</span>.
      </p>
    </div>
  );
}
