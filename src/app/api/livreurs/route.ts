import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const livreurs = await prisma.utilisateur.findMany({
    where: { role: "LIVREUR" },
    select: { id: true, nom: true, telephone: true, actif: true },
    orderBy: { nom: "asc" },
  });

  return NextResponse.json(livreurs);
}

export async function POST(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { nom, telephone, motDePasse } = await req.json();
  if (!nom || !telephone || !motDePasse) {
    return NextResponse.json(
      { error: "Nom, téléphone et mot de passe requis" },
      { status: 400 }
    );
  }

  const existant = await prisma.utilisateur.findUnique({ where: { telephone } });
  if (existant) {
    return NextResponse.json({ error: "Ce numéro est déjà utilisé" }, { status: 409 });
  }

  const motDePasseHache = await bcrypt.hash(motDePasse, 10);
  const livreur = await prisma.utilisateur.create({
    data: { nom, telephone, motDePasse: motDePasseHache, role: "LIVREUR" },
    select: { id: true, nom: true, telephone: true, actif: true },
  });

  return NextResponse.json(livreur, { status: 201 });
}
