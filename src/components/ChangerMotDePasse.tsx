"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ChangerMotDePasse() {
  const pathname = usePathname();
  const router = useRouter();
  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  async function valider() {
    setErreur(null);
    setSucces(false);
    if (!ancienMotDePasse || !nouveauMotDePasse) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }
    if (nouveauMotDePasse !== confirmation) {
      setErreur("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setEnvoi(true);
    try {
      const res = await fetch("/api/auth/staff/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ancienMotDePasse, nouveauMotDePasse }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error ?? "Impossible de changer le mot de passe.");
        return;
      }
      setSucces(true);
      // Le changement invalide la session en cours : on renvoie vers la
      // page de connexion pour se reconnecter avec le nouveau mot de passe.
      const connexion = pathname.startsWith("/livreur") ? "/livreur/login" : "/admin/login";
      setTimeout(() => {
        router.push(connexion);
        router.refresh();
      }, 1500);
    } catch {
      setErreur("Impossible d'envoyer la demande. Vérifiez votre connexion.");
      setEnvoi(false);
    }
  }

  return (
    <div className="card space-y-3 p-4">
      <p className="font-semibold">🔒 Changer mon mot de passe</p>
      <label className="block">
        <span className="text-sm font-medium text-ink/70">Mot de passe actuel</span>
        <input
          type="password"
          value={ancienMotDePasse}
          onChange={(e) => setAncienMotDePasse(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink/70">Nouveau mot de passe</span>
        <input
          type="password"
          value={nouveauMotDePasse}
          onChange={(e) => setNouveauMotDePasse(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink/70">Confirmer le nouveau mot de passe</span>
        <input
          type="password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
        />
      </label>
      {erreur && <p className="text-sm text-red-700">{erreur}</p>}
      <button onClick={valider} disabled={envoi} className="btn-secondary w-full">
        {succes
          ? "✅ Mot de passe modifié ! Reconnexion..."
          : envoi
            ? "Enregistrement..."
            : "Changer le mot de passe"}
      </button>
    </div>
  );
}
