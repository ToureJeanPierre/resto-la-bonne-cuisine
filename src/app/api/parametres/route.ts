import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

const VALEURS_PAR_DEFAUT = {
  id: "site",
  adresse: "Adresse à préciser, Abidjan",
  telephone: "+225 00 00 00 00",
  horaires: "Tous les jours, 9h — 22h",
};

export async function GET() {
  const parametres = await prisma.parametres.findUnique({ where: { id: "site" } });
  return NextResponse.json(parametres ?? VALEURS_PAR_DEFAUT);
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { adresse, telephone, horaires } = await req.json();

  const parametres = await prisma.parametres.upsert({
    where: { id: "site" },
    create: {
      id: "site",
      adresse: adresse ?? VALEURS_PAR_DEFAUT.adresse,
      telephone: telephone ?? VALEURS_PAR_DEFAUT.telephone,
      horaires: horaires ?? VALEURS_PAR_DEFAUT.horaires,
    },
    update: {
      ...(adresse !== undefined && { adresse }),
      ...(telephone !== undefined && { telephone }),
      ...(horaires !== undefined && { horaires }),
    },
  });

  return NextResponse.json(parametres);
}
