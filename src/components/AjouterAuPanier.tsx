"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function AjouterAuPanier({
  plat,
}: {
  plat: { id: string; nom: string; prix: number; photo: string | null; disponible: boolean };
}) {
  const { ajouter } = useCart();
  const router = useRouter();

  function handleClick() {
    ajouter({ platId: plat.id, nom: plat.nom, prix: plat.prix, photo: plat.photo });
    router.push("/panier");
  }

  if (!plat.disponible) {
    return (
      <button disabled className="btn-primary w-full">
        Indisponible
      </button>
    );
  }

  return (
    <button onClick={handleClick} className="btn-primary w-full">
      Commander
    </button>
  );
}
