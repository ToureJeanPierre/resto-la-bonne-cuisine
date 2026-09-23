import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const [chiffreAffairesGlobalAgg, chiffreAffairesJourAgg, commandesLivreesTotal, commandesTotal, details] =
    await Promise.all([
      prisma.commande.aggregate({ where: { statut: "LIVREE" }, _sum: { total: true } }),
      prisma.commande.aggregate({
        where: { statut: "LIVREE", createdAt: { gte: debutJour } },
        _sum: { total: true },
      }),
      prisma.commande.count({ where: { statut: "LIVREE" } }),
      prisma.commande.count({ where: { statut: { not: "ANNULEE" } } }),
      prisma.detailCommande.findMany({
        where: { commande: { statut: "LIVREE" } },
        select: { nomPlat: true, quantite: true, prixUnitaire: true },
      }),
    ]);

  const parPlat = new Map<string, { quantite: number; chiffreAffaires: number }>();
  for (const d of details) {
    const existant = parPlat.get(d.nomPlat) ?? { quantite: 0, chiffreAffaires: 0 };
    existant.quantite += d.quantite;
    existant.chiffreAffaires += d.quantite * d.prixUnitaire;
    parPlat.set(d.nomPlat, existant);
  }

  const platsVendus = Array.from(parPlat.entries())
    .map(([nom, valeurs]) => ({ nom, ...valeurs }))
    .sort((a, b) => b.quantite - a.quantite);

  return NextResponse.json({
    chiffreAffairesGlobal: chiffreAffairesGlobalAgg._sum.total ?? 0,
    chiffreAffairesJour: chiffreAffairesJourAgg._sum.total ?? 0,
    commandesLivreesTotal,
    commandesTotal,
    platsVendusTotal: platsVendus.reduce((s, p) => s + p.quantite, 0),
    platsVendus,
  });
}
