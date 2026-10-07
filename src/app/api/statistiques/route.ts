import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  // 6 derniers mois (mois courant inclus), pour le tableau de bilan mensuel.
  const debutHistorique = new Date(debutMois);
  debutHistorique.setMonth(debutHistorique.getMonth() - 5);

  const [
    chiffreAffairesGlobalAgg,
    chiffreAffairesJourAgg,
    chiffreAffairesMoisAgg,
    commandesMoisCount,
    commandesLivreesTotal,
    commandesTotal,
    details,
    commandesHistorique,
  ] = await Promise.all([
    prisma.commande.aggregate({ where: { statut: "LIVREE" }, _sum: { total: true } }),
    prisma.commande.aggregate({
      where: { statut: "LIVREE", createdAt: { gte: debutJour } },
      _sum: { total: true },
    }),
    prisma.commande.aggregate({
      where: { statut: "LIVREE", createdAt: { gte: debutMois } },
      _sum: { total: true },
    }),
    prisma.commande.count({ where: { statut: "LIVREE", createdAt: { gte: debutMois } } }),
    prisma.commande.count({ where: { statut: "LIVREE" } }),
    prisma.commande.count({ where: { statut: { not: "ANNULEE" } } }),
    prisma.detailCommande.findMany({
      where: { commande: { statut: "LIVREE" } },
      select: { nomPlat: true, quantite: true, prixUnitaire: true },
    }),
    prisma.commande.findMany({
      where: { statut: "LIVREE", createdAt: { gte: debutHistorique } },
      select: { total: true, createdAt: true },
    }),
  ]);

  const parMois = new Map<string, { chiffreAffaires: number; commandes: number }>();
  for (const c of commandesHistorique) {
    const cle = c.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
    const existant = parMois.get(cle) ?? { chiffreAffaires: 0, commandes: 0 };
    existant.chiffreAffaires += c.total;
    existant.commandes += 1;
    parMois.set(cle, existant);
  }
  const bilanMensuel = Array.from(parMois.entries())
    .map(([mois, valeurs]) => ({ mois, ...valeurs }))
    .sort((a, b) => b.mois.localeCompare(a.mois));

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
    chiffreAffairesMois: chiffreAffairesMoisAgg._sum.total ?? 0,
    commandesMois: commandesMoisCount,
    commandesLivreesTotal,
    commandesTotal,
    platsVendusTotal: platsVendus.reduce((s, p) => s + p.quantite, 0),
    platsVendus,
    bilanMensuel,
  });
}
