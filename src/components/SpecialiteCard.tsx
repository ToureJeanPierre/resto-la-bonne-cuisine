import Link from "next/link";
import { formatFCFA } from "@/lib/format";
import type { Plat } from "@/components/PlatCard";

export default function SpecialiteCard({ plat }: { plat: Plat }) {
  return (
    <Link
      href={`/menu/${plat.id}`}
      className="flex w-36 flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5"
    >
      <div className="flex h-24 items-center justify-center bg-gold/10 text-3xl">
        {plat.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plat.photo} alt={plat.nom} className="h-full w-full object-cover" />
        ) : (
          "🍽️"
        )}
      </div>
      <div className="p-2">
        <p className="line-clamp-2 text-sm font-semibold leading-tight">{plat.nom}</p>
        <p className="mt-1 text-xs font-bold text-gold-dark">{formatFCFA(plat.prix)}</p>
      </div>
    </Link>
  );
}
