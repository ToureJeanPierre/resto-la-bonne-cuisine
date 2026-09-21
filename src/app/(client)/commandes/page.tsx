import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getClientCookie } from "@/lib/auth";
import { formatFCFA } from "@/lib/format";
import { LABELS_STATUT_COMMANDE, ICONES_STATUT_COMMANDE, StatutCommande } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MesCommandesPage() {
  const client = getClientCookie();

  if (!client) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <span className="text-5xl">📦</span>
        <p className="text-ink/60">Vous n&apos;avez pas encore passé de commande.</p>
        <Link href="/menu" className="btn-primary">
          Voir le menu
        </Link>
      </div>
    );
  }

  const commandes = await prisma.commande.findMany({
    where: { clientId: client.id },
    include: { details: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4 p-4">
      <h1 className="font-display text-2xl font-bold">Mes commandes</h1>

      {commandes.length === 0 && (
        <p className="text-center text-ink/60">Aucune commande pour le moment.</p>
      )}

      <div className="space-y-3">
        {commandes.map((commande) => (
          <Link
            key={commande.id}
            href={`/commandes/${commande.id}`}
            className="card flex items-center justify-between p-4"
          >
            <div>
              <p className="font-semibold">Commande #{commande.numero}</p>
              <p className="text-sm text-ink/60">
                {commande.details.length} article(s) — {formatFCFA(commande.total)}
              </p>
            </div>
            <span className="badge bg-gold/10 text-gold-dark">
              {ICONES_STATUT_COMMANDE[commande.statut as StatutCommande]}{" "}
              {LABELS_STATUT_COMMANDE[commande.statut as StatutCommande]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
