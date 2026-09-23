import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const clients = await prisma.client.findMany({
    include: {
      commandes: { select: { total: true, statut: true, createdAt: true } },
      fidelite: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const resultat = clients.map((c) => ({
    id: c.id,
    nom: c.nom,
    telephone: c.telephone,
    nombreCommandes: c.commandes.length,
    montantTotal: c.commandes
      .filter((cmd) => cmd.statut === "LIVREE")
      .reduce((sum, cmd) => sum + cmd.total, 0),
    credits: c.fidelite?.credits ?? 0,
    recompensesDisponibles: c.fidelite?.recompensesDisponibles ?? 0,
    fideliteActive: c.fideliteActive,
    derniereCommande: c.commandes[0]?.createdAt ?? null,
  }));

  return NextResponse.json(resultat);
}
