import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { ancienMotDePasse, nouveauMotDePasse } = await req.json();
  if (!ancienMotDePasse || !nouveauMotDePasse) {
    return NextResponse.json(
      { error: "Ancien et nouveau mot de passe requis" },
      { status: 400 }
    );
  }
  if (nouveauMotDePasse.length < 6) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit contenir au moins 6 caractères" },
      { status: 400 }
    );
  }

  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: session.sub } });
  if (!utilisateur) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const valide = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);
  if (!valide) {
    return NextResponse.json({ error: "Ancien mot de passe incorrect" }, { status: 401 });
  }

  const motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
  await prisma.utilisateur.update({ where: { id: utilisateur.id }, data: { motDePasse } });

  return NextResponse.json({ ok: true });
}
