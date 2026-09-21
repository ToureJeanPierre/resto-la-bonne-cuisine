import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET() {
  const guard = await requireRole("LIVREUR");
  if ("error" in guard) return guard.error;

  const livraisons = await prisma.livraison.findMany({
    where: {
      livreurId: guard.session.sub,
      statut: { in: ["ASSIGNEE", "EN_ROUTE"] },
    },
    include: { commande: { include: { client: true, details: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(livraisons);
}
