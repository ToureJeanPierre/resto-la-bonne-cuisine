import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { formatFCFA } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LivreurLivraisonsPage() {
  const session = await getStaffSession();

  const livraisons = await prisma.livraison.findMany({
    where: { livreurId: session!.sub, statut: { in: ["ASSIGNEE", "EN_ROUTE"] } },
    include: { commande: { include: { client: true, details: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-3">
      {livraisons.length === 0 && (
        <p className="text-center text-ink/60">Aucune livraison assignée pour le moment.</p>
      )}
      {livraisons.map((l) => (
        <div key={l.id} className="card space-y-2 p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Commande #{l.commande.numero}</p>
            <p className="font-bold text-gold-dark">{formatFCFA(l.commande.total)}</p>
          </div>
          <p className="text-sm text-ink/70">📍 {l.adresse ?? "—"}</p>
          <p className="text-sm text-ink/70">
            👤 {l.commande.client.nom} — {l.commande.client.telephone}
          </p>
          <p className="text-sm text-ink/60">
            {l.commande.details.map((d) => `${d.nomPlat} ×${d.quantite}`).join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
}
