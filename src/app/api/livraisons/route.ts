import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const livraisons = await prisma.livraison.findMany({
    include: { commande: { include: { client: true, details: true } }, livreur: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(livraisons);
}
