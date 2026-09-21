import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const livreurs = await prisma.utilisateur.findMany({
    where: { role: "LIVREUR" },
    select: { id: true, nom: true, telephone: true, actif: true },
  });

  return NextResponse.json(livreurs);
}
