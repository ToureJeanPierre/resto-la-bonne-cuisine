import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { nom, telephone, actif, motDePasse } = await req.json();

  const data: Record<string, unknown> = {};
  if (nom !== undefined) data.nom = nom;
  if (telephone !== undefined) data.telephone = telephone;
  if (actif !== undefined) data.actif = Boolean(actif);
  if (motDePasse) data.motDePasse = await bcrypt.hash(motDePasse, 10);

  const livreur = await prisma.utilisateur.update({
    where: { id: params.id },
    data,
    select: { id: true, nom: true, telephone: true, actif: true },
  });

  return NextResponse.json(livreur);
}
