import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const commandesDuJour = await prisma.commande.findMany({
    where: { createdAt: { gte: debutJour }, statut: { not: "ANNULEE" } },
    include: { client: true },
  });

  const enPreparation = commandesDuJour.filter((c) => c.statut === "EN_PREPARATION").length;
  const enLivraison = commandesDuJour.filter((c) => c.statut === "EN_LIVRAISON").length;
  const livrees = commandesDuJour.filter((c) => c.statut === "LIVREE").length;
  const montantTotal = commandesDuJour
    .filter((c) => c.statut === "LIVREE")
    .reduce((sum, c) => sum + c.total, 0);

  const clientsUniques = new Set(commandesDuJour.map((c) => c.clientId)).size;

  const recompensesDistribuees = await prisma.fidelite.aggregate({
    _sum: { recompensesDisponibles: true },
  });

  const detailsDuJour = await prisma.detailCommande.findMany({
    where: { commande: { createdAt: { gte: debutJour }, statut: { not: "ANNULEE" } } },
  });

  const regroupement = new Map<string, number>();
  for (const d of detailsDuJour) {
    regroupement.set(d.nomPlat, (regroupement.get(d.nomPlat) ?? 0) + d.quantite);
  }

  return NextResponse.json({
    commandes: commandesDuJour.length,
    enPreparation,
    enLivraison,
    livrees,
    montantTotal,
    clientsUniques,
    recompensesDistribuees: recompensesDistribuees._sum.recompensesDisponibles ?? 0,
    regroupement: Array.from(regroupement.entries()).map(([plat, quantite]) => ({
      plat,
      quantite,
    })),
  });
}
