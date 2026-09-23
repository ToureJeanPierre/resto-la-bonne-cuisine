import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SpecialiteCard from "@/components/SpecialiteCard";
import ShareButton from "@/components/ShareButton";
import Footer, { PARAMETRES_PAR_DEFAUT } from "@/components/Footer";

export const revalidate = 30;

export default async function AccueilPage() {
  // Les trois requêtes sont indépendantes : on les lance en parallèle
  // plutôt qu'en série pour ne payer la latence réseau qu'une seule fois.
  const [specialites, avisData, parametres] = await Promise.all([
    prisma.plat.findMany({
      where: { disponible: true },
      orderBy: { createdAt: "asc" },
      take: 4,
    }),
    prisma.avis.aggregate({
      where: { masque: false },
      _avg: { note: true },
      _count: true,
    }),
    prisma.parametres.findUnique({ where: { id: "site" } }),
  ]);

  return (
    <div>
      <div className="relative">
        <Image
          src="/images/banner.webp"
          alt="Restaurant Kalym"
          width={2000}
          height={620}
          className="h-40 w-full object-cover"
          priority
        />
      </div>

      <div className="space-y-6 p-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Bonjour 👋</h1>
          <p className="mt-1 text-ink/70">
            Restaurant Kalym vous propose une cuisine généreuse et authentique,
            préparée avec des produits frais chaque jour. Commandez votre plat
            préféré, on s&apos;occupe de vous livrer.
          </p>
        </div>

        <Link href="/menu" className="btn-primary w-full">
          Voir le menu du jour
        </Link>

        {avisData._count > 0 && (
          <Link
            href="/avis"
            className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5"
          >
            <span className="font-medium">
              ⭐ {avisData._avg.note?.toFixed(1)} / 5 — {avisData._count} avis
            </span>
            <span className="text-gold-dark">Voir tout →</span>
          </Link>
        )}

        <div>
          <h2 className="mb-2 text-lg font-bold">Nos spécialités</h2>

          {specialites.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-center text-ink/60 shadow-sm">
              Le menu du jour n&apos;a pas encore été publié. Revenez bientôt !
            </p>
          ) : (
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {specialites.map((plat) => (
                <SpecialiteCard key={plat.id} plat={plat} />
              ))}
            </div>
          )}
        </div>

        <ShareButton />
      </div>

      <Footer parametres={parametres ?? PARAMETRES_PAR_DEFAUT} />
    </div>
  );
}
