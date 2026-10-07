import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { getSeuilFidelite } from "@/lib/fidelite";

const LIMITE_PAR_DEFAUT = 20;

export async function GET(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || LIMITE_PAR_DEFAUT);
  const corbeille = req.nextUrl.searchParams.get("corbeille") === "true";
  const where = corbeille ? { supprimeLe: { not: null } } : { supprimeLe: null };

  const [total, clients, seuilFidelite] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      include: {
        commandes: { select: { total: true, statut: true, createdAt: true } },
        fidelite: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    getSeuilFidelite(),
  ]);

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
    supprimeLe: c.supprimeLe,
  }));

  return NextResponse.json({ clients: resultat, total, page, limit, seuilFidelite });
}
