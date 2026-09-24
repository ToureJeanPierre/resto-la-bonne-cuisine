import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createStaffSession } from "@/lib/auth";

const MAX_TENTATIVES = 5;
const DUREE_VERROU_MINUTES = 15;

export async function POST(req: NextRequest) {
  const { telephone, motDePasse } = await req.json();

  if (!telephone || !motDePasse) {
    return NextResponse.json({ error: "Téléphone et mot de passe requis" }, { status: 400 });
  }

  const utilisateur = await prisma.utilisateur.findUnique({ where: { telephone } });
  if (!utilisateur || !utilisateur.actif) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  if (utilisateur.verrouJusqua && utilisateur.verrouJusqua > new Date()) {
    const minutes = Math.ceil((utilisateur.verrouJusqua.getTime() - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Trop de tentatives échouées. Réessayez dans ${minutes} min.` },
      { status: 429 }
    );
  }

  const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  if (!valide) {
    const tentatives = utilisateur.tentativesEchouees + 1;
    const verrouille = tentatives >= MAX_TENTATIVES;
    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: {
        tentativesEchouees: verrouille ? 0 : tentatives,
        verrouJusqua: verrouille
          ? new Date(Date.now() + DUREE_VERROU_MINUTES * 60000)
          : null,
      },
    });
    return NextResponse.json(
      {
        error: verrouille
          ? `Trop de tentatives échouées. Compte verrouillé ${DUREE_VERROU_MINUTES} min.`
          : "Identifiants invalides",
      },
      { status: verrouille ? 429 : 401 }
    );
  }

  if (utilisateur.tentativesEchouees > 0 || utilisateur.verrouJusqua) {
    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { tentativesEchouees: 0, verrouJusqua: null },
    });
  }

  await createStaffSession({
    sub: utilisateur.id,
    role: utilisateur.role as "ADMIN" | "LIVREUR",
    nom: utilisateur.nom,
  });

  return NextResponse.json({ id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role });
}
