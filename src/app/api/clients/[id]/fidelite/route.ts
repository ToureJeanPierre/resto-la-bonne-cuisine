import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

// Correction manuelle exceptionnelle du crédit fidélité par l'administratrice
// (cahier des charges §44). La modification est tracée dans les logs serveur.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { credits, recompensesDisponibles } = await req.json();

  const fidelite = await prisma.fidelite.upsert({
    where: { clientId: params.id },
    create: {
      clientId: params.id,
      credits: Number(credits) || 0,
      recompensesDisponibles: Number(recompensesDisponibles) || 0,
    },
    update: {
      ...(credits !== undefined && { credits: Number(credits) }),
      ...(recompensesDisponibles !== undefined && {
        recompensesDisponibles: Number(recompensesDisponibles),
      }),
    },
  });

  console.log(
    `[fidelite] Correction manuelle par ${guard.session.nom} (${guard.session.sub}) pour client ${params.id}: credits=${fidelite.credits}, recompenses=${fidelite.recompensesDisponibles}`
  );

  return NextResponse.json(fidelite);
}
