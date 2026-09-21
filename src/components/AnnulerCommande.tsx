"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnnulerCommande({ commandeId }: { commandeId: string }) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function annuler() {
    if (!confirm("Confirmer l'annulation de cette commande ?")) return;
    setEnvoi(true);
    setErreur(null);
    const res = await fetch(`/api/commandes/${commandeId}/annuler`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setErreur(data.error);
      setEnvoi(false);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button onClick={annuler} disabled={envoi} className="btn-secondary w-full">
        {envoi ? "Annulation..." : "Annuler la commande"}
      </button>
      {erreur && <p className="mt-2 text-sm text-red-700">{erreur}</p>}
    </div>
  );
}
