import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const [commandesDuJour, detailsDuJour] = await Promise.all([
    prisma.commande.findMany({
      where: { createdAt: { gte: debutJour }, statut: { not: "ANNULEE" } },
    }),
    prisma.detailCommande.findMany({
      where: { commande: { createdAt: { gte: debutJour }, statut: { not: "ANNULEE" } } },
    }),
  ]);

  const enPreparation = commandesDuJour.filter((c) => c.statut === "EN_PREPARATION").length;
  const enLivraison = commandesDuJour.filter((c) => c.statut === "EN_LIVRAISON").length;
  const livrees = commandesDuJour.filter((c) => c.statut === "LIVREE").length;
  const montantTotal = commandesDuJour
    .filter((c) => c.statut === "LIVREE")
    .reduce((sum, c) => sum + c.total, 0);

  const regroupement = new Map<string, number>();
  for (const d of detailsDuJour) {
    regroupement.set(d.nomPlat, (regroupement.get(d.nomPlat) ?? 0) + d.quantite);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Aujourd&apos;hui</h1>
        <p className="text-ink/60">Tableau de bord</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Commandes" valeur={commandesDuJour.length} />
        <StatCard label="En préparation" valeur={enPreparation} />
        <StatCard label="En livraison" valeur={enLivraison} />
        <StatCard label="Livrées" valeur={livrees} />
      </div>

      <div className="card p-4 text-center">
        <p className="text-sm text-ink/60">Montant total (livré)</p>
        <p className="text-2xl font-bold text-gold-dark">{formatFCFA(montantTotal)}</p>
      </div>

      {regroupement.size > 0 && (
        <div className="card p-4">
          <p className="mb-2 font-semibold">Total des plats à préparer</p>
          <div className="space-y-1 text-sm">
            {Array.from(regroupement.entries()).map(([plat, quantite]) => (
              <div key={plat} className="flex justify-between">
                <span>{plat}</span>
                <span className="font-semibold">{quantite}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/menu" className="btn-primary text-center">
          + Ajouter un plat
        </Link>
        <Link href="/admin/commandes" className="btn-secondary text-center">
          📋 Voir les commandes
        </Link>
        <Link href="/admin/menu" className="btn-secondary text-center">
          🍽️ Gérer le menu
        </Link>
        <Link href="/admin/livraisons" className="btn-secondary text-center">
          🚚 Livraisons
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, valeur }: { label: string; valeur: number }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-2xl font-bold">{valeur}</p>
      <p className="text-sm text-ink/60">{label}</p>
    </div>
  );
}
