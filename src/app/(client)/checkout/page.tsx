"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatFCFA } from "@/lib/format";
import { MOYENS_PAIEMENT, LABELS_MOYEN_PAIEMENT } from "@/lib/constants";

export default function CheckoutPage() {
  const { items, sousTotal, vider } = useCart();
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [modeLivraison, setModeLivraison] = useState<"LIVRAISON" | "RETRAIT">("LIVRAISON");
  const [adresseLivraison, setAdresseLivraison] = useState("");
  const [precisionAdresse, setPrecisionAdresse] = useState("");
  const [moyenPaiement, setMoyenPaiement] = useState<(typeof MOYENS_PAIEMENT)[number]>("TEST");
  const [recompensesDisponibles, setRecompensesDisponibles] = useState(0);
  const [utiliserRecompense, setUtiliserRecompense] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    fetch("/api/fidelite")
      .then((r) => r.json())
      .then((data) => setRecompensesDisponibles(data.recompensesDisponibles ?? 0))
      .catch(() => {});

    fetch("/api/client/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        if (data.nom) setNom(data.nom);
        if (data.telephone) setTelephone(data.telephone);
        if (data.adresse) setAdresseLivraison(data.adresse);
      })
      .catch(() => {});
  }, []);

  const remise = utiliserRecompense && recompensesDisponibles > 0 ? Math.min(...items.map((i) => i.prix)) : 0;
  const total = Math.max(0, sousTotal - remise);

  if (items.length === 0) {
    return <p className="p-8 text-center text-ink/60">Votre panier est vide.</p>;
  }

  async function valider() {
    setErreur(null);
    if (!nom.trim() || !telephone.trim()) {
      setErreur("Merci de renseigner votre nom et votre téléphone.");
      return;
    }
    if (modeLivraison === "LIVRAISON" && !adresseLivraison.trim()) {
      setErreur("Merci de renseigner votre lieu de livraison.");
      return;
    }

    setEnvoi(true);
    try {
      const res = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          telephone,
          items: items.map((i) => ({ platId: i.platId, quantite: i.quantite })),
          modeLivraison,
          adresseLivraison: modeLivraison === "LIVRAISON" ? adresseLivraison : undefined,
          precisionAdresse: precisionAdresse || undefined,
          moyenPaiement,
          utiliserRecompense,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error ?? "Une erreur est survenue.");
        setEnvoi(false);
        return;
      }
      vider();
      router.push(`/commandes/${data.id}`);
    } catch {
      setErreur("Impossible d'envoyer la commande. Vérifiez votre connexion.");
      setEnvoi(false);
    }
  }

  return (
    <div className="space-y-5 p-4">
      <h1 className="font-display text-2xl font-bold">Valider ma commande</h1>

      <div className="card space-y-3 p-4">
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Nom</span>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
            placeholder="Votre nom"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Téléphone</span>
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
            placeholder="07 00 00 00 00"
            type="tel"
          />
        </label>
      </div>

      <div className="card space-y-3 p-4">
        <p className="text-sm font-medium text-ink/70">Mode de livraison</p>
        <div className="flex gap-2">
          {(["LIVRAISON", "RETRAIT"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setModeLivraison(mode)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold ${
                modeLivraison === mode ? "bg-gold text-ink" : "bg-black/5 text-ink/60"
              }`}
            >
              {mode === "LIVRAISON" ? "Livraison" : "Retrait"}
            </button>
          ))}
        </div>

        {modeLivraison === "LIVRAISON" && (
          <>
            <label className="block">
              <span className="text-sm font-medium text-ink/70">Lieu de livraison</span>
              <input
                value={adresseLivraison}
                onChange={(e) => setAdresseLivraison(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                placeholder="Quartier, rue..."
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink/70">Précision (optionnel)</span>
              <input
                value={precisionAdresse}
                onChange={(e) => setPrecisionAdresse(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                placeholder="Étage, repère..."
              />
            </label>
          </>
        )}
      </div>

      <div className="card space-y-2 p-4">
        <p className="text-sm font-medium text-ink/70">Mode de paiement</p>
        {MOYENS_PAIEMENT.map((moyen) => (
          <label
            key={moyen}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
              moyenPaiement === moyen ? "border-gold bg-gold/10" : "border-black/10"
            }`}
          >
            <input
              type="radio"
              name="moyenPaiement"
              checked={moyenPaiement === moyen}
              onChange={() => setMoyenPaiement(moyen)}
            />
            {LABELS_MOYEN_PAIEMENT[moyen]}
          </label>
        ))}
      </div>

      {recompensesDisponibles > 0 && (
        <label className="card flex items-center gap-2 p-4">
          <input
            type="checkbox"
            checked={utiliserRecompense}
            onChange={(e) => setUtiliserRecompense(e.target.checked)}
          />
          🎁 Utiliser ma récompense fidélité (1 repas offert)
        </label>
      )}

      <div className="card space-y-2 p-4">
        <div className="flex justify-between text-ink/70">
          <span>Sous-total</span>
          <span>{formatFCFA(sousTotal)}</span>
        </div>
        {remise > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Récompense fidélité</span>
            <span>-{formatFCFA(remise)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-black/10 pt-2 text-lg font-bold">
          <span>TOTAL</span>
          <span>{formatFCFA(total)}</span>
        </div>
      </div>

      {erreur && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erreur}</p>}

      <button onClick={valider} disabled={envoi} className="btn-primary w-full">
        {envoi ? "Envoi..." : "Confirmer la commande"}
      </button>
    </div>
  );
}
