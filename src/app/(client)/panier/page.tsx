"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatFCFA } from "@/lib/format";

export default function PanierPage() {
  const { items, changerQuantite, retirer, sousTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <span className="text-5xl">🛒</span>
        <p className="text-ink/60">Votre panier est vide.</p>
        <Link href="/menu" className="btn-primary">
          Voir le menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="font-display text-2xl font-bold">Panier</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.platId} className="card flex items-center gap-3 p-3">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10 text-2xl">
              {item.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photo} alt={item.nom} className="h-full w-full rounded-xl object-cover" />
              ) : (
                "🍽️"
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{item.nom}</p>
              <p className="text-sm text-ink/60">{formatFCFA(item.prix)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changerQuantite(item.platId, item.quantite - 1)}
                className="h-7 w-7 rounded-full bg-black/5 font-bold"
              >
                −
              </button>
              <span className="w-5 text-center font-semibold">{item.quantite}</span>
              <button
                onClick={() => changerQuantite(item.platId, item.quantite + 1)}
                className="h-7 w-7 rounded-full bg-black/5 font-bold"
              >
                +
              </button>
            </div>
            <button onClick={() => retirer(item.platId)} className="pl-1 text-ink/40">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="card space-y-2 p-4">
        <div className="flex justify-between text-ink/70">
          <span>Sous-total</span>
          <span>{formatFCFA(sousTotal)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Livraison (si applicable)</span>
          <span className="text-sm italic">à confirmer</span>
        </div>
        <div className="flex justify-between border-t border-black/10 pt-2 text-lg font-bold">
          <span>TOTAL</span>
          <span>{formatFCFA(sousTotal)}</span>
        </div>
      </div>

      <Link href="/checkout" className="btn-primary w-full">
        Valider ma commande
      </Link>
    </div>
  );
}
