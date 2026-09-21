"use client";

import Link from "next/link";
import { formatFCFA } from "@/lib/format";

export type Plat = {
  id: string;
  nom: string;
  description: string;
  photo: string | null;
  prix: number;
  categorie: string | null;
  disponible: boolean;
};

export default function PlatCard({ plat }: { plat: Plat }) {
  return (
    <Link
      href={`/menu/${plat.id}`}
      className="card flex gap-3 p-3 transition hover:shadow-lg active:scale-[0.99]"
    >
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold/10 text-3xl">
        {plat.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plat.photo} alt={plat.nom} className="h-full w-full object-cover" />
        ) : (
          "🍽️"
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold leading-tight">{plat.nom}</h3>
          <p className="line-clamp-2 text-sm text-ink/60">{plat.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-gold-dark">{formatFCFA(plat.prix)}</span>
          {!plat.disponible && (
            <span className="badge bg-red-100 text-red-700">Indisponible</span>
          )}
        </div>
      </div>
    </Link>
  );
}
