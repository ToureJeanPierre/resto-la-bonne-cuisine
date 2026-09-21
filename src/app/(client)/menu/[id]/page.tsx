import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { notFound } from "next/navigation";
import AjouterAuPanier from "@/components/AjouterAuPanier";
import FavoriButton from "@/components/FavoriButton";

export const dynamic = "force-dynamic";

export default async function FichePlatPage({ params }: { params: { id: string } }) {
  const plat = await prisma.plat.findUnique({ where: { id: params.id } });
  if (!plat) notFound();

  return (
    <div>
      <div className="relative flex h-64 w-full items-center justify-center bg-gold/10 text-7xl">
        {plat.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plat.photo} alt={plat.nom} className="h-full w-full object-cover" />
        ) : (
          "🍽️"
        )}
        <div className="absolute right-3 top-3">
          <FavoriButton platId={plat.id} />
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase">{plat.nom}</h1>
          <p className="mt-1 text-ink/70">{plat.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gold-dark">{formatFCFA(plat.prix)}</span>
          <span
            className={`badge ${
              plat.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {plat.disponible ? "🟢 Disponible" : "🔴 Indisponible"}
          </span>
        </div>

        <AjouterAuPanier plat={plat} />
      </div>
    </div>
  );
}
