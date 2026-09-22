import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PlatCard from "@/components/PlatCard";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

export default async function AccueilPage() {
  const plats = await prisma.plat.findMany({
    where: { disponible: true },
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  const avisData = await prisma.avis.aggregate({
    where: { masque: false },
    _avg: { note: true },
    _count: true,
  });

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
          <p className="text-ink/60">Le bon goût, notre passion — livré directement chez vous.</p>
        </div>

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
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold">Le menu du jour</h2>
            <Link href="/menu" className="text-sm font-semibold text-gold-dark">
              Voir tout
            </Link>
          </div>

          {plats.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-center text-ink/60 shadow-sm">
              Le menu du jour n&apos;a pas encore été publié. Revenez bientôt !
            </p>
          ) : (
            <div className="space-y-3">
              {plats.map((plat) => (
                <PlatCard key={plat.id} plat={plat} />
              ))}
            </div>
          )}
        </div>

        <Link href="/menu" className="btn-primary w-full">
          Commander
        </Link>

        <ShareButton />
      </div>
    </div>
  );
}
