import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getClientCookie } from "@/lib/auth";
import { formatFCFA } from "@/lib/format";
import { SEUIL_FIDELITE } from "@/lib/fidelite";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const client = getClientCookie();

  if (!client) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <span className="text-5xl">👤</span>
        <p className="text-ink/60">
          Passez votre première commande pour créer votre profil.
        </p>
        <Link href="/menu" className="btn-primary">
          Voir le menu
        </Link>
      </div>
    );
  }

  const [donneesClient, fidelite, commandes] = await Promise.all([
    prisma.client.findUnique({ where: { id: client.id } }),
    prisma.fidelite.findUnique({ where: { clientId: client.id } }),
    prisma.commande.count({ where: { clientId: client.id } }),
  ]);

  const credits = fidelite?.credits ?? 0;
  const recompenses = fidelite?.recompensesDisponibles ?? 0;

  return (
    <div className="space-y-5 p-4">
      <h1 className="font-display text-2xl font-bold">Mon profil</h1>

      <div className="card space-y-1 p-4">
        <p className="font-semibold">{donneesClient?.nom}</p>
        <p className="text-sm text-ink/60">{donneesClient?.telephone}</p>
        {donneesClient?.adresse && <p className="text-sm text-ink/60">{donneesClient.adresse}</p>}
      </div>

      <div className="card space-y-2 p-4">
        <p className="font-semibold">🎁 Fidélité</p>
        {recompenses > 0 ? (
          <p className="text-green-700">Récompense disponible : {recompenses} repas offert(s)</p>
        ) : (
          <>
            <p className="text-sm text-ink/60">
              {credits}/{SEUIL_FIDELITE} repas livrés
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full bg-gold"
                style={{ width: `${(credits / SEUIL_FIDELITE) * 100}%` }}
              />
            </div>
          </>
        )}
        <p className="text-xs text-ink/40">5 repas achetés et livrés = 1 repas offert</p>
      </div>

      <Link href="/commandes" className="card flex items-center justify-between p-4">
        <span>Historique des commandes</span>
        <span className="font-semibold text-gold-dark">{commandes} →</span>
      </Link>

      <Link href="/avis" className="card flex items-center justify-between p-4">
        <span>⭐ Avis du restaurant</span>
        <span className="text-gold-dark">→</span>
      </Link>

      <ShareButton />
    </div>
  );
}
