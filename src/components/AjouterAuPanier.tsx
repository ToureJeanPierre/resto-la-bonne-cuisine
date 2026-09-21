"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export default function AjouterAuPanier({
  plat,
}: {
  plat: { id: string; nom: string; prix: number; photo: string | null; disponible: boolean };
}) {
  const { ajouter } = useCart();
  const router = useRouter();
  const [ajoute, setAjoute] = useState(false);

  function handleClick() {
    ajouter({ platId: plat.id, nom: plat.nom, prix: plat.prix, photo: plat.photo });
    setAjoute(true);
    setTimeout(() => setAjoute(false), 1200);
  }

  if (!plat.disponible) {
    return (
      <button disabled className="btn-primary w-full">
        Indisponible
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleClick} className="btn-primary flex-1">
        {ajoute ? "✅ Ajouté !" : "Ajouter au panier"}
      </button>
      <button onClick={() => router.push("/panier")} className="btn-secondary">
        🛒
      </button>
    </div>
  );
}
