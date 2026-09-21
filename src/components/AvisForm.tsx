"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AvisForm({ commandeId }: { commandeId: string }) {
  const router = useRouter();
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function envoyer() {
    setEnvoi(true);
    setErreur(null);
    const res = await fetch("/api/avis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commandeId, note, commentaire: commentaire || undefined }),
    });
    if (!res.ok) {
      const data = await res.json();
      setErreur(data.error ?? "Impossible d'envoyer l'avis.");
      setEnvoi(false);
      return;
    }
    setEnvoye(true);
    router.refresh();
  }

  if (envoye) {
    return <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Merci pour votre avis !</p>;
  }

  return (
    <div className="card space-y-3 p-4">
      <p className="font-semibold">Donnez votre avis</p>
      <div className="flex gap-1 text-3xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setNote(n)}>
            {n <= note ? "⭐" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        placeholder="Votre commentaire (optionnel)"
        className="w-full rounded-lg border border-black/10 p-2"
        rows={3}
      />
      {erreur && <p className="text-sm text-red-700">{erreur}</p>}
      <button onClick={envoyer} disabled={envoi} className="btn-primary w-full">
        {envoi ? "Envoi..." : "Envoyer mon avis"}
      </button>
    </div>
  );
}
