"use client";

import { useEffect, useState } from "react";

type Livreur = { id: string; nom: string; telephone: string; actif: boolean };

export default function AdminLivreursPage() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  function charger() {
    fetch("/api/livreurs")
      .then((r) => r.json())
      .then(setLivreurs)
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  async function ajouter() {
    if (!nom.trim() || !telephone.trim() || !motDePasse.trim()) {
      setErreur("Tous les champs sont obligatoires.");
      return;
    }
    setEnvoi(true);
    setErreur(null);
    const res = await fetch("/api/livreurs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, telephone, motDePasse }),
    });
    const data = await res.json();
    setEnvoi(false);
    if (!res.ok) {
      setErreur(data.error ?? "Impossible d'ajouter ce livreur.");
      return;
    }
    setNom("");
    setTelephone("");
    setMotDePasse("");
    setFormulaireOuvert(false);
    charger();
  }

  async function basculerActif(livreur: Livreur) {
    await fetch(`/api/livreurs/${livreur.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !livreur.actif }),
    });
    charger();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Livreurs</h1>
        <button onClick={() => setFormulaireOuvert(true)} className="btn-primary">
          + Ajouter
        </button>
      </div>

      {chargement && <p className="text-ink/60">Chargement...</p>}

      <div className="space-y-3">
        {livreurs.map((livreur) => (
          <div key={livreur.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{livreur.nom}</p>
              <p className="text-sm text-ink/60">{livreur.telephone}</p>
            </div>
            <button
              onClick={() => basculerActif(livreur)}
              className={`text-xs font-semibold ${
                livreur.actif ? "text-red-600" : "text-green-600"
              }`}
            >
              {livreur.actif ? "🔴 Désactiver" : "🟢 Réactiver"}
            </button>
          </div>
        ))}
        {!chargement && livreurs.length === 0 && (
          <p className="text-center text-ink/60">Aucun livreur pour le moment.</p>
        )}
      </div>

      {formulaireOuvert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <h2 className="mb-3 font-display text-xl font-bold">Ajouter un livreur</h2>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-ink/70">Nom</span>
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
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
                <span className="text-sm font-medium text-ink/70">Mot de passe</span>
                <input
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                />
              </label>
            </div>
            {erreur && <p className="mt-2 text-sm text-red-700">{erreur}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setFormulaireOuvert(false)} className="btn-secondary flex-1">
                Annuler
              </button>
              <button onClick={ajouter} disabled={envoi} className="btn-primary flex-1">
                {envoi ? "Envoi..." : "ENREGISTRER"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
