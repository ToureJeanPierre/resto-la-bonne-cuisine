"use client";

import { useState } from "react";

export default function ConfirmerSuppression({
  nomElement,
  onConfirmer,
  onAnnuler,
}: {
  nomElement: string;
  onConfirmer: (motDePasse: string) => Promise<string | null>;
  onAnnuler: () => void;
}) {
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function valider() {
    if (!motDePasse) {
      setErreur("Mot de passe requis.");
      return;
    }
    setEnvoi(true);
    setErreur(null);
    const messageErreur = await onConfirmer(motDePasse);
    setEnvoi(false);
    if (messageErreur) setErreur(messageErreur);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md space-y-3 rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <h2 className="font-display text-xl font-bold text-red-700">
          Supprimer définitivement ?
        </h2>
        <p className="text-sm text-ink/70">
          {nomElement} sera supprimé(e) pour de bon — impossible à annuler. Confirme avec ton
          mot de passe.
        </p>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          placeholder="Mot de passe"
          autoFocus
          className="w-full rounded-lg border border-black/10 px-3 py-2"
          onKeyDown={(e) => e.key === "Enter" && valider()}
        />
        {erreur && <p className="text-sm text-red-700">{erreur}</p>}
        <div className="flex gap-2">
          <button onClick={onAnnuler} className="btn-secondary flex-1">
            Annuler
          </button>
          <button
            onClick={valider}
            disabled={envoi}
            className="flex-1 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {envoi ? "Suppression..." : "Supprimer définitivement"}
          </button>
        </div>
      </div>
    </div>
  );
}
