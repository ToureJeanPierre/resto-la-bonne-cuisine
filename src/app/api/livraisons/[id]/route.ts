import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { livreurId } = await req.json();

  const livraison = await prisma.livraison.update({
    where: { id: params.id },
    data: { livreurId, statut: "ASSIGNEE" },
  });

  return NextResponse.json(livraison);
}
