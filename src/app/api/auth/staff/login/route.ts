import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createStaffSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { telephone, motDePasse } = await req.json();

  if (!telephone || !motDePasse) {
    return NextResponse.json({ error: "Téléphone et mot de passe requis" }, { status: 400 });
  }

  const utilisateur = await prisma.utilisateur.findUnique({ where: { telephone } });
  if (!utilisateur || !utilisateur.actif) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  if (!valide) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  await createStaffSession({
    sub: utilisateur.id,
    role: utilisateur.role as "ADMIN" | "LIVREUR",
    nom: utilisateur.nom,
  });

  return NextResponse.json({ id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role });
}
